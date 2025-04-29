import { twMerge, twJoin, type ClassNameValue } from 'tailwind-merge';

// 动态样式组合以及合并函数
function cn(...inputs: ClassNameValue[]) {
    return twMerge(twJoin(inputs));
}

// 判断是服务端还是客户端组件
function isServer() {
    if (typeof window == 'undefined') {
        console.log('server component');
    } else {
        console.log('client component');
    }
}

interface transformUrlParams {
    baseUrl: string;
    params: Record<string, string | number>;
}

//GET请求参数拼接
function transformGetParams({ baseUrl, params }: transformUrlParams) {
    const url = new URL(baseUrl, window.location.href);

    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.append(key, params[key] as string);
        }
    });

    return url;
}

// 通配符占位
const _ = Symbol('wildcard');

type Pattern<T> = ((value: T) => boolean) | T | typeof _;

class Matcher<T> {
    private value: T;

    constructor(value: T) {
        this.value = value;
    }

    on(pattern: Pattern<T>, handler: (value: T) => void): Matcher<T> | void {
        const matched = this.matchesPattern(this.value, pattern);

        if (matched) {
            handler(this.value);

            // 匹配成功后终止链式调用
            return;
        }

        // 继续链式调用
        return this;
    }

    private matchesPattern(value: any, pattern: Pattern<any>): boolean {
        if (pattern === _) {
            return true;
        }

        // 如果是函数，执行谓词
        if (typeof pattern === 'function') {
            return (pattern as (value: any) => boolean)(value);
        }

        // 判断是否为基本类型（string / number / boolean）
        const isPrimitive =
            ['string', 'number', 'boolean'].includes(typeof value) || value instanceof String || value instanceof Number || value instanceof Boolean;

        if (isPrimitive) {
            // 原始值直接比较
            return Object.is(value, pattern);
        }

        // 判断是否为数组
        if (Array.isArray(pattern)) {
            if (!Array.isArray(value)) {
                return false;
            }

            if (pattern.length > value.length) {
                return false;
            }

            // 尝试匹配数组中的每个元素
            for (let i = 0; i < pattern.length; i++) {
                if (!this.matchesPattern(value[i], pattern[i])) {
                    return false;
                }
            }

            return true;
        }

        // 对象匹配（部分匹配）
        if (typeof pattern === 'object' && pattern !== null && typeof value === 'object' && value !== null) {
            return Object.entries(pattern).every(([key, val]) => key in value && this.matchesPattern(value[key], val));
        }

        return false;
    }
}

function match<T>(value: T): Matcher<T> {
    return new Matcher(value);
}

function validatorNoEmpty<T>(data: T): boolean {
    if (data === null || data === undefined || data === '') {
        return false;
    }

    if (typeof data === 'number' && data === 0) {
        return true;
    }

    if (typeof data === 'object') {
        return Object.keys(data).length > 0;
    }

    if (data instanceof Array) {
        return data.length > 0;
    }

    return true;
}

export { _, validatorNoEmpty, match, isServer, cn, transformGetParams };

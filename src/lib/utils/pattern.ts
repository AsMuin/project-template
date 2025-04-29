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

type MatchPattern<T> = Partial<T> | ((value: T) => boolean) | typeof _;

class Matcher<T> {
    private value: T;

    constructor(value: T) {
        this.value = value;
    }

    on(pattern: MatchPattern<T>, handler: (value: T) => void): Matcher<T> | void {
        // 处理通配符
        if (pattern === _) {
            handler(this.value);

            return; // 结束链式调用
        }

        // 处理函数形式的匹配逻辑
        if (typeof pattern === 'function') {
            const shouldMatch = pattern(this.value);

            if (shouldMatch) {
                handler(this.value);

                return; // 结束链式调用
            }

            return this; // 继续链式调用
        }

        // 处理对象匹配
        const matches = Object.entries(pattern).every(([key, val]) => {
            return Object.prototype.hasOwnProperty.call(this.value, key) && (this.value as any)[key] === val;
        });

        if (matches) {
            handler(this.value);

            return; // 匹配成功则结束链式调用
        }

        return this; // 没有匹配则继续链式调用下一个
    }
}

function match<T>(value: T): Matcher<T> {
    return new Matcher<T>(value);
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

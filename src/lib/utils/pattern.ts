/**
 * 否定模式
 */
class Not<T> {
    constructor(public value: T) {}
}

function not<T>(value: T): Not<T> {
    return new Not(value);
}

/**
 * 或模式
 */
class Or<T> {
    constructor(public patterns: Pattern<T>[]) {}
}

function or<T>(...patterns: Pattern<T>[]): Or<T> {
    return new Or(patterns);
}

// 通配符占位
const _ = Symbol('wildcard');

type Pattern<T> =
    | ((value: T) => boolean)
    | T
    | typeof _
    | Not<Pattern<T>>
    | Or<Pattern<T>>;

class Matcher<T> {
    constructor(private value: T) {}

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
        const valueType = typeof value;
        const patternType = typeof pattern;

        // 通配符匹配
        if (pattern === _) {
            return true;
        }
        
        // 处理 Not 包装类型
        if (pattern instanceof Not) {
            const negatedValue = pattern.value;
            return !this.matchesPattern(value, negatedValue);
        }

        // 处理 Or 包装类型
        if (pattern instanceof Or) {
            return pattern.patterns.some(p => this.matchesPattern(value, p));
        }

        // 如果是函数，执行谓词
        if (patternType === 'function') {
            return (pattern as (value: any) => boolean)(value);
        }

        // 判断是否为基本类型（string / number / boolean）
        const isPrimitive =
            ['string', 'number', 'boolean'].includes(valueType) || value instanceof String || value instanceof Number || value instanceof Boolean;

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
            return pattern.every((p, i) => this.matchesPattern(value[i], p));
        }

        // 对象匹配（部分匹配）
        if (patternType === 'object' && pattern !== null && valueType === 'object' && value !== null) {
            return Object.entries(pattern).every(([key, val]) => key in value && this.matchesPattern(value[key], val));
        }

        return false;
    }
}

function match<T>(value: T): Matcher<T> {
    return new Matcher(value);
}

function validatorNoEmpty<T>(data: T): boolean {
    const dataType = typeof data;
    if (data === null || data === undefined || data === '') {
        return false;
    }

    if (dataType === 'number' && data === 0) {
        return true;
    }

    if (dataType === 'object') {
        return Object.keys(data).length > 0;
    }

    if (data instanceof Array) {
        return data.length > 0;
    }

    return true;
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

export { _, validatorNoEmpty, match, or, not, transformGetParams };

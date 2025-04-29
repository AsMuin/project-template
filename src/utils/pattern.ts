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

export { validatorNoEmpty, match, _ };

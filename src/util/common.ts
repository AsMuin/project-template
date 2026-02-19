import { twJoin, twMerge, type ClassNameValue } from 'tailwind-merge';

function cn(...inputs: ClassNameValue[]) {
    return twMerge(twJoin(inputs));
}

// 定义一个唯一的 Symbol，外部无法伪造
const ResultSymbol = Symbol('__AttemptResult__');

// 2. 定义基础类型
// 我们给元组加上一个可选的 Symbol 属性标记，仅用于类型识别，不影响解构
export type AttemptSuccess<T> = readonly [null, T];

export type AttemptFailure<E> = readonly [E, null];

export type AttemptResult<E, T> = AttemptSuccess<T> | AttemptFailure<E>;

// 3. 关键：智能拆箱类型 (Magic Type)
// 如果 T 已经是 AttemptResult，则提取出内部的 E 和 D，并与新的 Error 合并
// 否则，将其视为普通值，包裹为 [Error, T]
type UnpackedResult<T> = T extends AttemptResult<infer E, infer D> ? AttemptResult<E | Error, D> : AttemptResult<Error, T>;

type AsyncUnpackedResult<T> = Promise<UnpackedResult<T>>;
function attempt<T>(operation: Promise<T>): AsyncUnpackedResult<T>;

function attempt<T>(operation: () => Promise<T>): AsyncUnpackedResult<T>;

function attempt<T>(operation: () => T): UnpackedResult<T>;

// 统一实现
function attempt(operation: any): any {
    const handleSuccess = (val: any) => {
        // ✨ 严谨拆箱：只有带 Symbol 的数组才会被原样返回
        if (isAttemptResult(val)) {
            return val;
        }

        return ok(val);
    };

    const handleError = (e: any) => {
        if (isAttemptResult(e)) {
            return e;
        }

        return err(e instanceof Error ? e : new Error(String(e)));
    };

    if (operation instanceof Promise) {
        return operation.then(handleSuccess).catch(handleError);
    }

    try {
        const result = operation();

        if (result instanceof Promise || (result && typeof result.then === 'function')) {
            return (result as Promise<any>).then(handleSuccess).catch(handleError);
        }

        return handleSuccess(result);
    } catch (e) {
        return handleError(e);
    }
}

function ok<T>(value: T) {
    const tuple: AttemptSuccess<T> = [null, value];

    // 使用 Object.defineProperty 定义不可枚举属性，防止遍历数组时把这个标记遍历出来
    Object.defineProperty(tuple, ResultSymbol, {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
    });

    return tuple;
}

function err<E>(error: E) {
    const tuple: AttemptFailure<E> = [error, null];

    Object.defineProperty(tuple, ResultSymbol, {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
    });

    return tuple;
}

function isAttemptResult<E, T>(value: any): value is AttemptResult<E, T> {
    return value && typeof value === 'object' && value[ResultSymbol] === true;
}

export { cn, attempt, err, ok };

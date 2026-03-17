class Result<E, T> implements Iterable<E | T | null> {
    constructor(
        public readonly error: E | null,
        public readonly data: T | null
    ) {}

    get 0(): E | null {
        return this.error;
    }
    get 1(): T | null {
        return this.data;
    }

    get length(): 2 {
        return 2;
    }

    *[Symbol.iterator](): Iterator<E | T | null> {
        yield this.error;
        yield this.data;
    }

    static isResult(value: any): value is Result<any, any> {
        return value instanceof Result;
    }
}

type ResultTuple<E, T> = [E, T];
type ResolvedResult<T> = T extends ResultTuple<infer E, infer D> ? ResultTuple<E | Error, D> : ResultTuple<Error, T>;

type AsyncResolvedResult<T> = Promise<ResolvedResult<T>>;

function attempt<T>(operation: Promise<T>): AsyncResolvedResult<T>;

function attempt<T>(operation: () => Promise<T>): AsyncResolvedResult<T>;

function attempt<T>(operation: () => T): ResolvedResult<T>;

function attempt(operation: any) {
    const handleSuccess = (val: any) => {
        if (Result.isResult(val)) {
            return val;
        }

        return ok(val);
    };

    const handleError = (e: any) => {
        if (Result.isResult(e)) {
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
            return result.then(handleSuccess).catch(handleError);
        }

        return handleSuccess(result);
    } catch (e) {
        return handleError(e);
    }
}

function ok<T>(value: T): ResultTuple<null, T> {
    return new Result(null, value) as unknown as ResultTuple<null, T>;
}

function err<E>(error: E): ResultTuple<E, null> {
    return new Result(error, null) as unknown as ResultTuple<E, null>;
}

export { attempt, err, ok };

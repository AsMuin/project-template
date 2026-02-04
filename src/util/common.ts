import { twJoin, twMerge, type ClassNameValue } from 'tailwind-merge';

type AttemptSuccess<T> = readonly [null, T];
type AttemptFailure<E> = readonly [E, null];
type AttemptResult<E, T> = AttemptSuccess<T> | AttemptFailure<E>;
type AttemptResultAsync<E, T> = Promise<AttemptResult<E, T>>;

function attempt<T, E = Error>(operation: Promise<T>): AttemptResultAsync<E, T>;
function attempt<T, E = Error>(operation: () => Promise<T>): AttemptResultAsync<E, T>;
function attempt<T, E = Error>(operation: () => T): AttemptResult<E, T>;
function attempt<T, E = Error>(operation: Promise<T> | (() => T | Promise<T>)): AttemptResult<E, T> | AttemptResultAsync<E, T> {
    if (operation instanceof Promise) {
        return operation.then((value: T) => [null, value] as const).catch((error: E) => [error, null] as const);
    }

    try {
        const result = operation();

        if (result instanceof Promise || (result && typeof result === 'object' && 'then' in result && typeof (result as any).then === 'function')) {
            return (result as Promise<T>).then((value: T) => [null, value] as const).catch((error: E) => [error, null] as const);
        }

        return [null, result] as const;
    } catch (error) {
        return [error as E, null] as const;
    }
}

function cn(...inputs: ClassNameValue[]) {
    return twMerge(twJoin(inputs));
}

export { attempt, cn };

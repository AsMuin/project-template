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

function omitUndefined<T extends object>(obj: T) {
    return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

export { validatorNoEmpty, omitUndefined };

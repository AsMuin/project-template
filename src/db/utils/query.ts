import { SQL } from 'drizzle-orm';

function queryFilter<T extends Record<string, any>>(filterConfig: Record<keyof T, (value: any) => SQL>, filterParams: T): SQL[] {
    const filters: SQL[] = [];

    Object.entries(filterParams).forEach(([key, value]) => {
        if (value || value === false || value === 0) {
            const filter = filterConfig[key as keyof typeof filterConfig];

            if (filter) {
                filters.push(filter(value));
            }
        }
    });

    return filters;
}

export { queryFilter };

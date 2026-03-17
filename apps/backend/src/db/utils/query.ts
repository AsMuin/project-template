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

export function getPagination(page: number | string = 1, limit: number | string = 20) {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    return { pageNum, limitNum, offset };
}

export function getTimeRangeFilter(options: { timeRange?: string; timeFrom?: string; timeTo?: string }) {
    const { timeRange, timeFrom, timeTo } = options;
    let finalTimeFrom: Date | undefined;
    let finalTimeTo: Date | undefined;

    if (timeRange) {
        const now = new Date();

        switch (timeRange) {
            case '1h':
                finalTimeFrom = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case 'today':
                finalTimeFrom = new Date(now);
                finalTimeFrom.setHours(0, 0, 0, 0);
                break;
            case '7d':
                finalTimeFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                finalTimeFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }
    } else {
        if (timeFrom) {
            finalTimeFrom = new Date(timeFrom);
        }

        if (timeTo) {
            finalTimeTo = new Date(timeTo);
        }
    }

    return { finalTimeFrom, finalTimeTo };
}

export { queryFilter };

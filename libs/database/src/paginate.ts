import { and, asc, count, desc, gt, lt, type SQL } from 'drizzle-orm';

import { FILTER_MAP } from './constants';

import type {
    FilterCondition,
    SortConfig,
    PaginatedResult,
    DatabaseService,
    OffsetOptions,
    CursorOptions,
    CursorResult,
} from './interfaces';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

const applyFilter = ({ column, operator, value }: FilterCondition): SQL =>
    (FILTER_MAP[operator] ?? FILTER_MAP.eq)(column, value);

const applyOrder = ({ column, order }: SortConfig): SQL =>
    order === 'desc' ? desc(column) : asc(column);

const withFallback = <T>(value: T | undefined, fallback: T): T => value ?? fallback;

const encode = (value: unknown): string => {
    try {
        if (value === undefined || value === null) {
            throw new Error('Cannot encode undefined or null value');
        }
        return Buffer.from(JSON.stringify(value)).toString('base64');
    } catch (err) {
        console.error(err);
        return '';
    }
};

const decode = (cursor: string): unknown => {
    if (!cursor) {
        throw new Error('Cursor cannot be empty');
    }
    try {
        return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch (error) {
        const isBaseError = error instanceof Error;
        throw new Error(`Invalid cursor format: ${isBaseError ? error.message : String(error)}`, {
            cause: error,
        });
    }
};

const getColumnName = (column: PgColumn | string): string =>
    typeof column === 'string' ? column : column.name || 'id';

const buildConditions = (options: {
    filters?: FilterCondition[];
    search?: { columns: PgColumn[]; value: string };
}): SQL[] => {
    const conditions: SQL[] = [];
    if (options.filters?.length) {
        conditions.push(...options.filters.map(applyFilter));
    }
    // if (options.search?.value && options.search.columns?.length) {
    //     const searchConditions = options.search.columns.map((col) =>
    //         ilike(col, `%${options.search.value}%`),
    //     );
    //     conditions.push(
    //         searchConditions.length === 1 ? searchConditions[0] : or(...searchConditions),
    //     );
    // }
    return conditions;
};

export async function paginateOffset<TRow>(
    db: DatabaseService,
    query: PgSelect,
    options: OffsetOptions = {},
): Promise<PaginatedResult<TRow>> {
    const page = withFallback(options.page, 1);
    const limit = Math.min(withFallback(options.limit, 20), 100);
    const offset = withFallback(options.offset, (page - 1) * limit);

    const conditions = buildConditions(options);
    const orderBy = options.sort ? [applyOrder(options.sort)] : [];
    const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;

    const [data, [totalRow]] = await Promise.all([
        (orderBy.length > 0 ? filtered.orderBy(...orderBy) : filtered).limit(limit).offset(offset),
        db.select({ count: count() }).from(filtered.as('_count')),
    ]);

    const total = Number(totalRow?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    return {
        items: data as TRow[],
        meta: {
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            total,
            totalPages,
            page,
            limit,
        },
    };
}

export async function paginateCursor<TRow>(
    query: PgSelect,
    options: CursorOptions,
): Promise<CursorResult<TRow>> {
    const limit = Math.min(options.limit || 25, 50) + 1;
    const sort = options.sort ?? { column: options.column, order: 'asc' };
    const cursorValue = options.cursor ? decode(options.cursor) : null;

    const conditions = buildConditions(options);

    if (cursorValue !== null) {
        conditions.push(
            sort.order === 'desc' ? lt(sort.column, cursorValue) : gt(sort.column, cursorValue),
        );
    }

    const orderSql = applyOrder(sort);
    const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;

    const items = await filtered.orderBy(orderSql).limit(limit);

    const hasNext = items.length === limit;

    if (hasNext) {
        items.pop();
    }

    let next: string | null = null;
    if (hasNext && items.length > 0) {
        const lastItem = items[items.length - 1] as Record<string, unknown>;
        const columnName = getColumnName(sort.column);

        const value = lastItem[columnName];

        if (value !== undefined && value !== null) {
            try {
                next = encode(value);
            } catch (error) {
                console.error('❌ Failed to encode:', error);
                next = null;
            }
        }
    }

    return {
        items: items as TRow[],
        meta: { next, hasNext, limit: limit - 1 || 1 },
    };
}

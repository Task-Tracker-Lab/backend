import Redis from 'ioredis';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as sc from '../../../src/shared/entities';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { assertEnv, DB_URL, REDIS_URL } from './k6-env';
import { KEYS } from './k6-data-keys';

async function clearDB(db: PostgresJsDatabase<typeof sc>) {
    console.log('Cleaning up ONLY k6 test data from DB...');
    return await db.transaction(async (tx) => {
        await tx.delete(sc.users).where(sql`${sc.users.email} LIKE 'k6_user_%'`);
        await tx.delete(sc.teams).where(sql`${sc.teams.name} LIKE 'k6_team_%'`);
    });
}

async function clearRedis(redis: Redis) {
    console.log('Cleaning up ONLY k6 test data from Redis...');
    const SCAN_PATTERNS = Object.values(KEYS).map((fn) => fn('*'));

    for (const pattern of SCAN_PATTERNS) {
        let cursor = '0';
        do {
            const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            if (keys.length > 0) await redis.del(...keys);
        } while (cursor !== '0');
    }
}

async function main() {
    assertEnv();
    const redis = new Redis(REDIS_URL);
    const queryClient = postgres(DB_URL, { max: 1 });
    const db = drizzle(queryClient, { schema: sc });

    try {
        await clearDB(db);
        await clearRedis(redis);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    } finally {
        await queryClient.end();
        await redis.quit();
    }
}

main();

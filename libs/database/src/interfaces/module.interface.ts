import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Options, Sql } from 'postgres';

export interface DatabaseModuleOptions {
    /**
     * Схема базы данных PostgreSQL (устанавливает `search_path`).
     * * Все запросы без явного указания схемы будут выполняться в этом пространстве имен.
     * @default 'public'
     * @example 'auth_service'
     */
    schemaName?: string;

    /**
     * Объект схемы Drizzle, содержащий определения таблиц и связей.
     * * Рекомендуется импортировать целиком: `import * as schema from './schema'`.
     * @example schema
     */
    schema: Record<string, unknown>;

    /**
     * Настройки драйвера `postgres.js`.
     * * Позволяет настроить пул соединений, таймауты и SSL.
     * * **Внимание:** Параметры отличаются от драйвера `pg`.
     * @see https://github.com/porsager/postgres#options
     * @example { max: 20, idle_timeout: 30, connect_timeout: 5 }
     */
    pool?: Options<any>;

    /**
     * Включение или выключение логирования SQL-запросов в консоль через NestJS Logger.
     * @default false
     */
    logging?: boolean;

    /**
     * Флаг для автоматического запуска миграций при старте приложения.
     * * Полезно для локальной разработки и стейджинга.
     * @default true
     */
    runMigrations?: boolean;

    /**
     * Абсолютный путь к директории с файлами миграций (SQL или JS/TS).
     * * Если не указано, используется путь `./migrations` от корня проекта.
     * @default path.resolve(process.cwd(), 'migrations')
     */
    migrationsPath?: string;
}

/**
 * Основной тип сервиса базы данных для инъекции в репозитории.
 * * Включает в себя типизированный API Drizzle и прямой доступ к драйверу через `$client`.
 * * @template T - Тип вашей схемы данных (например, `typeof schema`).
 * * @example
 * constructor(
 * @Inject(DATABASE_SERVICE) private readonly db: DatabaseService<typeof schema>
 * ) {}
 */
export type DatabaseService<T extends Record<string, unknown>> = PostgresJsDatabase<T> & {
    $client: Sql;
};

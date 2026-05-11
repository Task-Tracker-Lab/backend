import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_SERVICE } from './constants';
import { MigrationService } from './migration.service';
import { Pool } from 'pg';
import {
    ConfigurableModuleClass,
    MODULE_OPTIONS_TOKEN,
    OPTIONS_TYPE,
} from './database.module-definition';

@Module({
    providers: [
        MigrationService,
        {
            provide: Pool,
            inject: [ConfigService, MODULE_OPTIONS_TOKEN],
            useFactory: (configService: ConfigService, opts: typeof OPTIONS_TYPE) => {
                const baseUrl = configService.getOrThrow<string>('DATABASE_URL');
                const url = new URL(baseUrl);

                if (opts.schemaName) {
                    url.searchParams.set('options', `-c search_path=${opts.schemaName}`);
                }

                return new Pool(url.toString());
            },
        },
        {
            provide: DATABASE_SERVICE,
            inject: [Pool, MODULE_OPTIONS_TOKEN],
            useFactory: (pool: Pool, opts: typeof OPTIONS_TYPE) => {
                const logger = new Logger('Drizzle');

                return drizzle(pool, {
                    schema: opts.schema,
                    logger: opts.logging
                        ? {
                              logQuery(query, params) {
                                  logger.debug(`SQL: ${query}`);
                                  if (params?.length)
                                      logger.debug(`Params: ${JSON.stringify(params)}`);
                              },
                          }
                        : false,
                });
            },
        },
    ],
    exports: [DATABASE_SERVICE],
})
export class DatabaseModule extends ConfigurableModuleClass implements OnApplicationShutdown {
    private readonly logger = new Logger(DatabaseModule.name);

    constructor() {
        // @Inject(DATABASE_SERVICE)
        // private readonly db: DatabaseService<any>,
        super();
    }

    async onApplicationShutdown() {
        this.logger.log('Closing database connections...');
    }
}

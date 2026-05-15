import { Inject, Injectable } from '@nestjs/common';
import { SQL_CLIENT } from '@libs/database/constants';
import { Sql } from 'postgres';

@Injectable()
export class DatabaseHealthcheckService {
    constructor(
        @Inject(SQL_CLIENT)
        private readonly sql: Sql,
    ) {}

    async isAlive() {
        try {
            await this.sql`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }
}

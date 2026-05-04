import { Inject, Injectable } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './imagor.module-definition';
import type { ImagorModuleOptions, Filters } from './interfaces';
import { createHmac } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { ImagorPathBuilder } from './utils';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ImagorService {
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private options: ImagorModuleOptions,
        private readonly http: HttpService,
    ) {}

    /**
     * Выполняет GET запрос к Imagor с применением фильтров и пресетов
     * @param path Путь к исходному файлу в хранилище
     * @param presetOrFilters Название пресета или объект с фильтрами (width, height, smart и т.д.)
     */
    async get(path: string, presetOrFilters?: string | Filters): Promise<any> {
        const host = this.options.url.replace(/\/+$/, '');
        const transformPath = this.buildTransformPath(path, presetOrFilters);
        const signature = this.getFullSignedPath(transformPath);
        const url = `${host}/${signature}`;

        try {
            const response = await firstValueFrom(
                this.http.get(url).pipe(
                    catchError((error: AxiosError) => {
                        console.error('Imagor Get Error:', error.response?.data || error.message);
                        return throwError(() => error);
                    }),
                ),
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    private buildTransformPath(path: string, presetOrFilters?: string | Filters): string {
        const builder = new ImagorPathBuilder(path, this.options.storageRoot);

        const globalFilters = this.options.filters || {};
        let localFilters: Filters = {};

        if (typeof presetOrFilters === 'string') {
            localFilters = this.options.presets?.[presetOrFilters] || {};
        } else if (presetOrFilters) {
            localFilters = presetOrFilters;
        }

        const merged = { ...globalFilters, ...localFilters };

        if (merged.width || merged.height) builder.resize(merged.width ?? 0, merged.height ?? 0);
        if (merged.smart) builder.smart(true);
        if (merged.fit) builder.fit(merged.fit);

        builder.applyFilters(merged);

        return builder.build();
    }

    private getFullSignedPath(path: string): string {
        if (!this.options.secret) {
            return `unsafe/${path}`;
        }

        const hash = createHmac('sha1', this.options.secret)
            .update(path)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        return `${hash}/${path}`;
    }
}

import type { Filters } from './filters.interface';

/**
 * Опции конфигурации модуля Imagor
 */
export interface ImagorModuleOptions {
    /** Базовый URL вашего инстанса Imagor (например, https://imagor.example.com) */
    readonly url: string;

    /** Секретный ключ для генерации HMAC подписи (безопасные URL) */
    readonly secret?: string;

    /** Глобальные фильтры, которые будут применяться ко всем изображениям по умолчанию */
    readonly filters?: Filters;

    /** Базовый путь в S3/хранилище (например, 'products/') */
    readonly storageRoot?: string;

    /**
     * Именованные пресеты для часто используемых трансформаций.
     * @example { 'thumb': { width: 150, height: 150, smart: true } }
     */
    readonly presets?: Record<string, Filters>;

    /** Включает логирование процесса генерации URL для отладки */
    readonly debug?: boolean;
}

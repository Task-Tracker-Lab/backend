import type { Format } from './formats.interface';

/**
 * Режимы вписывания изображения в заданные размеры.
 * - 'fit-in': Вписывает изображение целиком, сохраняя пропорции (могут появиться пустые поля).
 * - 'stretch': Растягивает изображение строго под размеры, игнорируя пропорции.
 * - 'dashed': Специфический режим Imagor для обработки прозрачности или границ.
 */
type Fit = 'fit-in' | 'stretch' | 'dashed';

/**
 * Набор фильтров и трансформаций Imagor.
 * Порядок применения фильтров в URL обычно соответствует порядку их перечисления.
 * @see https://github.com/cshum/imagor#filters
 */
export interface Filters {
    /**
     * Ширина выходного изображения в пикселях.
     * Используйте 'orig', чтобы сохранить исходную ширину.
     */
    readonly width?: number | 'orig';

    /**
     * Высота выходного изображения в пикселях.
     * Используйте 'orig', чтобы сохранить исходную высоту.
     */
    readonly height?: number | 'orig';

    /**
     * Включает умную обрезку (Smart Cropping).
     * Imagor попытается найти наиболее важные области (лица, контрастные объекты) и сфокусироваться на них.
     */
    readonly smart?: boolean;

    /**
     * Режим вписывания.
     * Если не указан, по умолчанию используется обрезка (Crop) для заполнения всей области.
     */
    readonly fit?: Fit;

    /**
     * Устанавливает качество выходного изображения.
     * @param {number} quality Число от 0 до 100.
     */
    readonly quality?: number;

    /**
     * Принудительно устанавливает формат выходного изображения.
     * WebP и AVIF рекомендуются для лучшего сжатия.
     */
    readonly format?: Format;

    /**
     * Если true, автоматически конвертирует изображения с прозрачностью в JPEG,
     * заменяя прозрачные области фоном (белым по умолчанию).
     */
    readonly autojpg?: boolean;

    /** Удаляет EXIF метаданные из выходного изображения. Полезно для приватности и уменьшения размера. */
    readonly strip_exif?: boolean;

    /** Удаляет ICC профили цвета. */
    readonly strip_icc?: boolean;

    /**
     * Регулирует яркость изображения.
     * @param {number} brightness Число от -100 до 100. Положительные — ярче, отрицательные — темнее.
     */
    readonly brightness?: number;

    /**
     * Регулирует контрастность изображения.
     * @param {number} contrast Число от -100 до 100.
     */
    readonly contrast?: number;

    /** Преобразует изображение в черно-белое (grayscale). */
    readonly grayscale?: boolean;

    /**
     * Настройка цветовых каналов RGB.
     * @property {number} r Красный (-100 до 100)
     * @property {number} g Зеленый (-100 до 100)
     * @property {number} b Синий (-100 до 100)
     */
    readonly rgb?: { readonly r: number; readonly g: number; readonly b: number };

    /**
     * Изменяет общую насыщенность цветов.
     * @param {number} proportion Число от 0 до 100.
     */
    readonly proportion?: number;

    /**
     * Применяет размытие Гаусса.
     * Можно передать число (радиус) или объект для более точной настройки сигмы.
     */
    readonly blur?: number | { readonly radius: number; readonly sigma?: number };

    /**
     * Повышает резкость изображения.
     * @property {number} amount Степень резкости.
     * @property {number} radius Радиус фильтра.
     * @property {number} threshold Порог срабатывания.
     */
    readonly sharpen?: {
        readonly amount: number;
        readonly radius: number;
        readonly threshold: number;
    };

    /**
     * Добавляет шум на изображение.
     * @param {number} noise Уровень шума от 0 до 100.
     */
    readonly noise?: number;

    /** Поворачивает изображение на заданный угол по часовой стрелке. */
    readonly rotate?: 90 | 180 | 270;

    /**
     * Определяет цвет заполнения пустых областей при использовании режима 'fit-in'.
     * @example 'ff0000' (hex), 'white' (name) или 'auto' (главный цвет изображения).
     */
    readonly fill?: string;

    /** Устанавливает цвет фона для прозрачных изображений (например, PNG). */
    readonly background_color?: string;

    /**
     * Наложение водяного знака поверх основного изображения.
     */
    readonly watermark?: {
        /** Путь к файлу водяного знака в хранилище. */
        readonly image: string;
        /** Позиция по горизонтали или смещение в пикселях. */
        readonly x?: number | 'center' | 'left' | 'right';
        /** Позиция по вертикали или смещение в пикселях. */
        readonly y?: number | 'center' | 'top' | 'bottom';
        /** Прозрачность водяного знака (0 - прозрачный, 100 - непрозрачный). */
        readonly alpha?: number;
        /** Относительная ширина знака в процентах (0.0 - 1.0) от основного изображения. */
        readonly w_ratio?: number;
        /** Относительная высота знака в процентах (0.0 - 1.0). */
        readonly h_ratio?: number;
    };

    /**
     * Указывает точку фокуса для кропа.
     * Полезно, если вы знаете координаты лица или важного объекта.
     */
    readonly focal?: { readonly x: number; readonly y: number };

    /**
     * Скругление углов изображения.
     * @property {number} radius Радиус скругления в пикселях.
     * @property {string} color Цвет заливки углов (например, 'transparent' или 'ffffff').
     */
    readonly round_corner?: {
        readonly radius: number;
        readonly color?: string;
    };

    /**
     * Ограничивает размер файла (в байтах). Imagor будет снижать качество, пока не впишется в лимит.
     */
    readonly max_bytes?: number;

    /**
     * Запрещает увеличивать изображение, если его исходные размеры меньше запрошенных (width/height).
     */
    readonly no_upscale?: boolean;
}

import type { Filters } from '../interfaces';

export class ImagorPathBuilder {
    private _width: number | 'orig' = 0;
    private _height: number | 'orig' = 0;
    private _isSmart = false;
    private _fitMode?: 'fit-in' | 'stretch' | 'dashed';
    private _filters: Filters = {};

    constructor(
        private readonly path: string,
        private readonly storageRoot?: string,
    ) {}

    resize(width: number | 'orig', height: number | 'orig' = 0): this {
        this._width = width;
        this._height = height;
        return this;
    }

    smart(enabled = true): this {
        this._isSmart = enabled;
        return this;
    }

    fit(mode: 'fit-in' | 'stretch' | 'dashed'): this {
        this._fitMode = mode;
        return this;
    }

    applyFilters(filters: Filters): this {
        this._filters = { ...this._filters, ...filters };
        return this;
    }

    build(): string {
        const parts: string[] = [];

        if (this._fitMode) {
            parts.push(this._fitMode);
        }

        if (this._width || this._height) {
            parts.push(`${this._width}x${this._height}`);
        }

        if (this._isSmart) {
            parts.push('smart');
        }

        const filterString = this.serializeAllFilters(this._filters);
        if (filterString) {
            parts.push(filterString);
        }

        const fullPath = this.storageRoot
            ? `${this.storageRoot}/${this.path}`.replace(/\/+/g, '/')
            : this.path;

        parts.push(fullPath.replace(/^\/+/, ''));

        return parts.join('/');
    }

    private serializeAllFilters(f: Filters): string {
        const segments: string[] = [];

        this.addBasicFilters(f, segments);
        this.addAdjustmentFilters(f, segments);
        this.addEffectFilters(f, segments);
        this.addTransformationFilters(f, segments);
        this.addWatermarkFilter(f, segments);

        return segments.length ? `filters:${segments.join(':')}` : '';
    }

    private addBasicFilters(f: Filters, segments: string[]): void {
        if (f.quality) {
            segments.push(`quality(${f.quality})`);
        }
        if (f.format) {
            segments.push(`format(${f.format})`);
        }
        if (f.autojpg) {
            segments.push('autojpg()');
        }
        if (f.strip_exif) {
            segments.push('strip_exif()');
        }
        if (f.strip_icc) {
            segments.push('strip_icc()');
        }
        if (f.no_upscale) {
            segments.push('no_upscale()');
        }
        if (f.max_bytes) {
            segments.push(`max_bytes(${f.max_bytes})`);
        }
    }

    private addAdjustmentFilters(f: Filters, segments: string[]): void {
        if (f.brightness !== undefined) {
            segments.push(`brightness(${f.brightness})`);
        }
        if (f.contrast !== undefined) {
            segments.push(`contrast(${f.contrast})`);
        }
        if (f.grayscale) {
            segments.push('grayscale()');
        }
        if (f.proportion !== undefined) {
            segments.push(`proportion(${f.proportion})`);
        }
        if (f.rgb) {
            segments.push(`rgb(${f.rgb.r},${f.rgb.g},${f.rgb.b})`);
        }
    }

    private addEffectFilters(f: Filters, segments: string[]): void {
        if (f.blur) {
            segments.push(
                typeof f.blur === 'number'
                    ? `blur(${f.blur})`
                    : `blur(${f.blur.radius},${f.blur.sigma ?? 0})`,
            );
        }
        if (f.sharpen) {
            const { amount, radius, threshold } = f.sharpen;
            segments.push(`sharpen(${amount},${radius},${threshold})`);
        }
        if (f.noise !== undefined) {
            segments.push(`noise(${f.noise})`);
        }
    }

    private addTransformationFilters(f: Filters, segments: string[]): void {
        if (f.rotate !== undefined) {
            segments.push(`rotate(${f.rotate})`);
        }
        if (f.fill) {
            segments.push(`fill(${f.fill})`);
        }
        if (f.background_color) {
            segments.push(`background_color(${f.background_color})`);
        }
        if (f.focal) {
            segments.push(`focal(${f.focal.x}x${f.focal.y})`);
        }
        if (f.round_corner) {
            const { radius, color } = f.round_corner;
            segments.push(`round_corner(${radius}${color ? `,${color}` : ''})`);
        }
    }

    private addWatermarkFilter(f: Filters, segments: string[]): void {
        if (!f.watermark) {
            return;
        }

        const { image, x = 0, y = 0, alpha = 0, w_ratio = 0, h_ratio = 0 } = f.watermark;
        segments.push(`watermark(${image},${x},${y},${alpha},${w_ratio},${h_ratio})`);
    }
}

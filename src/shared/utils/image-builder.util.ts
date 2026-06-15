import { dirname } from 'node:path';

export class ImageHelper {
    public static buildResponsiveUrls(cdn: string, path?: string | null) {
        if (!path) {
            return null;
        }

        const folder = dirname(path);
        const base = `${cdn}/${folder}`;

        return {
            small: `${base}/sm.webp`,
            medium: `${base}/md.webp`,
            large: `${base}/lg.webp`,
            original: `${cdn}/${path}`,
        };
    }
}

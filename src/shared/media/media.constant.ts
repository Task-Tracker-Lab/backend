export const MEDIA_QUEUES = {
    RESIZE: 'RESIZE',
    SAVE_ENTITY: 'SAVE_ENTITY',
};

export const MEDIA_JOBS = {
    RESIZE_IMAGES: 'RESIZE_IMAGES',
    UPDATE_USER_AVATAR: 'UPDATE_USER_AVATAR',
    UPDATE_TEAM_MEDIA: 'UPDATE_TEAM_MEDIA',
};
export const MEDIA_FLOW = 'MEDIA_FLOW';

export const MEDIA_SPECS = {
    avatar: [
        { name: 'sm', width: 64, height: 64, quality: 80 },
        { name: 'md', width: 256, height: 256, quality: 85 },
        { name: 'lg', width: 512, height: 512, quality: 90 },
    ],
    banner: [
        { name: 'sm', width: 640, height: 360, fit: 'fit-in' },
        { name: 'md', width: 1280, height: 720, fit: 'fit-in' },
        { name: 'lg', width: 1920, height: 1080, fit: 'fit-in' },
    ],
} as const;

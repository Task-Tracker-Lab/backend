export function ensureEmail(
    email: string | null | undefined,
    provider: string,
    id: string,
    login?: string,
): string {
    if (email?.trim() && email.includes('@')) {
        return email;
    }

    const providers: Record<string, string> = {
        github: 'github',
        vkontakte: 'vk',
        yandex: 'yandex',
        google: 'google',
    };

    const domain = providers[provider] ?? provider;
    const username = login || id;

    return `${username}@${domain}.placeholder.internal`;
}

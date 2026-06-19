const CLOUDFLARE_BASE = process.env.EXPO_PUBLIC_CLOUDFLARE_URL ?? '';

export function getImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${CLOUDFLARE_BASE}/${path}`;
}

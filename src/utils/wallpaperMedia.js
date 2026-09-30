const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');
/**
 * URLs relativas da API (/api/...) precisam do token para imagens privadas.
 */
export function attachAuthenticatedMediaUrls(wallpapers, token) {
  if (!wallpapers?.length || !token) return wallpapers || [];
  const baseUrl = API_URL;

  return wallpapers.map((w) => {
    const storageUrl = w.storageUrl?.startsWith('/')
      ? `${baseUrl}${w.storageUrl}${w.storageUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
      : w.storageUrl;

    const previewUrl = w.previewUrl?.startsWith('/')
      ? `${baseUrl}${w.previewUrl}${w.previewUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
      : w.previewUrl;

    const thumbUrl = w.thumbUrl?.startsWith('/')
      ? `${baseUrl}${w.thumbUrl}${w.thumbUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
      : w.thumbUrl || storageUrl;

    return { ...w, storageUrl, previewUrl, thumbUrl };
  });
}

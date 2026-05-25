export const cleanText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  const raw = String(value);

  if (typeof window === 'undefined' || !window.DOMParser) {
    return raw.replace(/<[^>]*>/g, '').trim() || fallback;
  }

  const parsed = new window.DOMParser().parseFromString(raw, 'text/html');
  return parsed.documentElement.textContent?.trim() || fallback;
};

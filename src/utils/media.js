const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export const safeUrl = (value, fallback = '') => {
  if (!value) return fallback;

  try {
    const url = new URL(String(value));
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
};

export const pickImageUrl = (images = [], fallback = '') => {
  if (!Array.isArray(images)) return fallback;

  for (const image of [...images].reverse()) {
    const link = safeUrl(image?.link);
    if (link) return link;
  }

  return fallback;
};

export const pickAudioUrl = (downloadUrls = [], quality) => {
  if (!Array.isArray(downloadUrls) || downloadUrls.length === 0) return '';

  const selected = downloadUrls.find(item => item?.quality === quality) || downloadUrls[downloadUrls.length - 1];
  return safeUrl(selected?.link);
};

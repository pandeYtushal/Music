const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Returns true if the given string looks like a YouTube video ID.
 * YouTube IDs are exactly 11 characters: [A-Za-z0-9_-]
 * Used to decide whether to use the YT IFrame player vs. the <audio> element.
 */
export const isYouTubeId = (id) => /^[a-zA-Z0-9_-]{11}$/.test(id ?? '');

export const safeUrl = (value, fallback = '') => {
  if (!value) return fallback;

  try {
    const str = String(value).trim();
    if (!str) return fallback;
    const url = new URL(str);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
};

export const pickImageUrl = (images, fallback = '/icon-192.png') => {
  if (!images) return fallback;

  if (typeof images === 'string') {
    return safeUrl(images) || fallback;
  }

  if (Array.isArray(images)) {
    for (const image of [...images].reverse()) {
      if (typeof image === 'string') {
        const link = safeUrl(image);
        if (link) return link;
      }
      if (image && typeof image === 'object') {
        const link = safeUrl(image.link || image.url || image.href);
        if (link) return link;
      }
    }
  }

  if (typeof images === 'object') {
    const link = safeUrl(images.link || images.url || images.href);
    if (link) return link;
  }

  return fallback;
};

export const pickAudioUrl = (downloadUrls = [], quality) => {
  if (!downloadUrls) return '';

  if (typeof downloadUrls === 'string') {
    return safeUrl(downloadUrls);
  }

  if (Array.isArray(downloadUrls) && downloadUrls.length > 0) {
    const selected = downloadUrls.find(item => item?.quality === quality) || downloadUrls[downloadUrls.length - 1];
    if (typeof selected === 'string') return safeUrl(selected);
    if (selected && typeof selected === 'object') return safeUrl(selected.link || selected.url || selected.href);
  }

  if (typeof downloadUrls === 'object') {
    return safeUrl(downloadUrls.link || downloadUrls.url || downloadUrls.href);
  }

  return '';
};

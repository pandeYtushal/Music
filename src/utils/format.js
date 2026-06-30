export const formatDuration = (seconds, fallback = '') => {
  const total = Number(seconds);
  if (Number.isNaN(total) || total < 0) return fallback;
  if (total === 0) return '0:00';
  const minutes = Math.floor(total / 60);
  const remaining = Math.floor(total % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
};


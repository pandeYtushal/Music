/**
 * Format a duration in seconds to a "m:ss" string.
 * Returns an empty string for invalid / missing input.
 */
export const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(Number(seconds))) return '';
  const total = Number(seconds);
  const minutes = Math.floor(total / 60);
  const remaining = Math.floor(total % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
};

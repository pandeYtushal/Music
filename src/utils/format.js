export const formatDuration = (seconds, fallback = '') => {
  const total = Number(seconds);
  if (Number.isNaN(total) || total < 0) return fallback;
  if (total === 0) return '0:00';
  const minutes = Math.floor(total / 60);
  const remaining = Math.floor(total % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
};

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = Date.now();
  const diffMs = now - Number(timestamp);
  if (diffMs < 0) return 'Just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  const date = new Date(Number(timestamp));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatTotalDuration = (songs) => {
  if (!songs || songs.length === 0) return '';
  const totalSeconds = songs.reduce((acc, song) => acc + (Number(song.duration) || 0), 0);
  if (totalSeconds === 0) return '';
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `~${hours} hr ${mins} min`;
  }
  return `~${mins} min`;
};



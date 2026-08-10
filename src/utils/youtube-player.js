/**
 * youtube-player.js
 * ─────────────────────────────────────────────────────────────
 * Singleton wrapper around the YouTube IFrame Player API.
 *
 * Usage:
 *   import { ytPlayer } from './youtube-player';
 *   ytPlayer.init({ onReady, onStateChange, onProgress, onError });
 *   ytPlayer.play('dQw4w9WgXcQ');
 *   ytPlayer.pause();
 *   ytPlayer.seekTo(42);         // seconds
 *   ytPlayer.setVolume(80);      // 0-100
 *   ytPlayer.getDuration();      // seconds
 *   ytPlayer.getCurrentTime();   // seconds
 *   ytPlayer.destroy();
 *
 * The IFrame is mounted in a hidden off-screen container so only
 * audio plays — exactly like saloon.wtf.
 * ─────────────────────────────────────────────────────────────
 */

// YouTube IFrame player states
export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

const CONTAINER_ID = '__yt_hidden_player__';
const SCRIPT_ID = '__yt_iframe_api__';

// Singleton state
let _player = null;
let _ready = false;
let _pendingVideoId = null;
let _pendingAutoplay = false;
let _switching = false; // true while a new video is being loaded — suppresses stale events
let _callbacks = {
  onReady: null,
  onStateChange: null,
  onProgress: null,
  onError: null,
};
let _progressInterval = null;
let _apiLoadStarted = false;

// ── Ensure the hidden container div exists in the DOM ─────────
const ensureContainer = () => {
  if (document.getElementById(CONTAINER_ID)) return;
  const div = document.createElement('div');
  div.id = CONTAINER_ID;
  // Completely hidden — audio-only like saloon.wtf
  div.style.cssText =
    'position:fixed;width:1px;height:1px;top:-9999px;left:-9999px;' +
    'overflow:hidden;pointer-events:none;opacity:0;';
  document.body.appendChild(div);
};

// ── Inject the YT IFrame API script once ─────────────────────
const loadApiScript = () => {
  if (_apiLoadStarted || document.getElementById(SCRIPT_ID)) return;
  _apiLoadStarted = true;
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  document.head.appendChild(script);
};

// ── Called by YouTube API when it's ready ────────────────────
window.onYouTubeIframeAPIReady = () => {
  ensureContainer();
  _player = new window.YT.Player(CONTAINER_ID, {
    width: '1',
    height: '1',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      playsinline: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: (e) => {
        _ready = true;
        if (_callbacks.onReady) _callbacks.onReady(e);
        // Play any queued video
        if (_pendingVideoId) {
          _playNow(_pendingVideoId, _pendingAutoplay);
          _pendingVideoId = null;
        }
      },
      onStateChange: (e) => {
        const state = e.data;
        // Clear the switching guard once the new video starts playing or buffering
        if (state === YT_STATE.PLAYING || state === YT_STATE.BUFFERING) {
          _switching = false;
        }
        // Suppress PAUSED / ENDED events that fire from the OLD video during a switch
        if (_switching && (state === YT_STATE.PAUSED || state === YT_STATE.ENDED)) return;

        if (_callbacks.onStateChange) _callbacks.onStateChange(state);
        if (state === YT_STATE.PLAYING) {
          _startProgress();
        } else {
          _stopProgress();
        }
      },
      onError: (e) => {
        _switching = false;
        if (_callbacks.onError) _callbacks.onError(e.data);
      },
    },
  });
};

// ── Internal play helper ──────────────────────────────────────
const _playNow = (videoId, autoplay = true) => {
  if (!_player) return;
  _switching = true; // suppress stale events from the old video
  if (autoplay) {
    _player.loadVideoById({ videoId, suggestedQuality: 'small' });
  } else {
    _player.cueVideoById({ videoId, suggestedQuality: 'small' });
    _switching = false; // cue doesn't fire events, clear immediately
  }
};

// ── Progress polling ──────────────────────────────────────────
const _startProgress = () => {
  _stopProgress();
  _progressInterval = setInterval(() => {
    if (!_player || !_callbacks.onProgress) return;
    try {
      const current = _player.getCurrentTime?.() ?? 0;
      const total = _player.getDuration?.() ?? 0;
      _callbacks.onProgress({ current, total });
    } catch {
      // player may not be ready yet
    }
  }, 500);
};

const _stopProgress = () => {
  if (_progressInterval) {
    clearInterval(_progressInterval);
    _progressInterval = null;
  }
};

// ── Public API ────────────────────────────────────────────────
export const ytPlayer = {
  /**
   * Initialize the YouTube player.
   * Safe to call multiple times — re-uses the existing instance.
   * @param {{ onReady?, onStateChange?, onProgress?, onError? }} callbacks
   */
  init(callbacks = {}) {
    _callbacks = { ..._callbacks, ...callbacks };
    if (!_apiLoadStarted) {
      ensureContainer();
      loadApiScript();
    }
  },

  /**
   * Load and play a YouTube video by ID.
   * If the player isn't ready yet, queues the request.
   * @param {string} videoId
   * @param {boolean} [autoplay=true]
   */
  play(videoId, autoplay = true) {
    if (!videoId) return;
    if (_ready && _player) {
      _playNow(videoId, autoplay);
    } else {
      _pendingVideoId = videoId;
      _pendingAutoplay = autoplay;
      // Make sure the API is loading
      ensureContainer();
      loadApiScript();
    }
  },

  /** Pause playback */
  pause() {
    try { _player?.pauseVideo(); } catch { /* */ }
    _stopProgress();
  },

  /** Resume playback */
  resume() {
    try { _player?.playVideo(); } catch { /* */ }
  },

  /**
   * Seek to a specific time.
   * @param {number} seconds
   */
  seekTo(seconds) {
    try { _player?.seekTo(seconds, true); } catch { /* */ }
  },

  /**
   * Set volume level.
   * @param {number} level 0–100
   */
  setVolume(level) {
    try { _player?.setVolume(Math.max(0, Math.min(100, level))); } catch { /* */ }
  },

  /** Mute */
  mute() {
    try { _player?.mute(); } catch { /* */ }
  },

  /** Unmute */
  unMute() {
    try { _player?.unMute(); } catch { /* */ }
  },

  /** Get current playback time in seconds */
  getCurrentTime() {
    try { return _player?.getCurrentTime?.() ?? 0; } catch { return 0; }
  },

  /** Get total duration in seconds */
  getDuration() {
    try { return _player?.getDuration?.() ?? 0; } catch { return 0; }
  },

  /** Returns true if the YT IFrame API has loaded and player is ready */
  isReady() {
    return _ready;
  },

  /**
   * Stop playback and destroy the player instance.
   * Removes the hidden container from the DOM.
   */
  destroy() {
    _stopProgress();
    try { _player?.destroy(); } catch { /* */ }
    _player = null;
    _ready = false;
    _apiLoadStarted = false;
    _pendingVideoId = null;
    const container = document.getElementById(CONTAINER_ID);
    if (container) container.remove();
    const script = document.getElementById(SCRIPT_ID);
    if (script) script.remove();
  },
};

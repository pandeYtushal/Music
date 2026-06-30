import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchSongs } from '../api/saavn';
import { FiSearch, FiHome, FiMusic, FiHeart, FiClock, FiSettings, FiTrendingUp, FiPlay, FiShuffle, FiRepeat, FiTrash2 } from 'react-icons/fi';
import { cleanText } from '../utils/text';

// CommandPaletteInner is only mounted while the palette is open.
// Unmounting it resets all state naturally — no need for setState-in-effect.
const CommandPaletteInner = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const isPlaying = usePlayerStore(state => state.isPlaying);
  const togglePlay = usePlayerStore(state => state.setIsPlaying);
  const toggleShuffle = usePlayerStore(state => state.toggleShuffle);
  const cycleRepeatMode = usePlayerStore(state => state.cycleRepeatMode);
  const clearQueue = usePlayerStore(state => state.clearQueue);
  const setCurrentVideo = usePlayerStore(state => state.setCurrentVideo);

  // Ref callback — focuses the input on mount without any useEffect
  const inputRefCallback = useCallback((node) => {
    if (node) setTimeout(() => node.focus(), 80);
  }, []);

  // Search is driven entirely from onChange — no useEffect for query changes
  const handleQueryChange = useCallback((e) => {
    const nextQuery = e.target.value;
    setQuery(nextQuery);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!nextQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchSongs(nextQuery.trim(), { limit: 5 });
        setResults(data);
      } catch (err) {
        console.error('Command Palette Search Error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleAction = (actionFn) => {
    actionFn();
    onClose();
  };

  const handlePlaySong = (song) => {
    setCurrentVideo(song, [song]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center p-4 md:p-10 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2.5xl border border-white/10 shadow-3xl overflow-hidden mt-[10vh] animate-scale-in"
        style={{
          background: 'rgba(20, 20, 24, 0.85)',
          backdropFilter: 'blur(45px)',
          WebkitBackdropFilter: 'blur(45px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
          <FiSearch size={18} className="text-white/45 shrink-0" />
          <input
            ref={inputRefCallback}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Type a command or search songs..."
            className="w-full bg-transparent text-sm text-white font-medium outline-none placeholder:text-white/20"
          />
          <kbd className="text-[10px] bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded text-white/40 font-mono shadow-sm">ESC</kbd>
        </div>

        {/* Contents */}
        <div className="max-h-[380px] overflow-y-auto p-2.5 space-y-4 scrollbar-hide">
          {/* Dynamic Search Results */}
          {query.trim() && (
            <div>
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-white/25 mb-1.5">Songs</p>
              {loading ? (
                <div className="px-3 py-2 text-xs font-semibold text-white/35">Searching...</div>
              ) : results.length > 0 ? (
                <div className="space-y-0.5">
                  {results.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => handlePlaySong(song)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/[0.05] rounded-xl text-left transition-colors"
                    >
                      <img src={song.image?.[0]?.link} className="w-8 h-8 rounded-lg object-cover" alt="" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{cleanText(song.name)}</p>
                        <p className="text-[10px] text-white/40 font-semibold truncate mt-0.5">{cleanText(song.primaryArtists)}</p>
                      </div>
                      <FiPlay size={12} className="text-white/30" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-xs font-semibold text-white/35">No songs found.</div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {!query.trim() && (
            <>
              <div>
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-white/25 mb-1.5">Navigation</p>
                <div className="grid grid-cols-2 gap-1">
                  <button onClick={() => handleNavigation('/')} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.045] rounded-xl text-left text-xs font-bold text-white/70 transition-all hover:text-white">
                    <FiHome size={13} className="text-white/40" /> Home
                  </button>
                  <button onClick={() => handleNavigation('/search')} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.045] rounded-xl text-left text-xs font-bold text-white/70 transition-all hover:text-white">
                    <FiSearch size={13} className="text-white/40" /> Search
                  </button>
                  <button onClick={() => handleNavigation('/playlists')} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.045] rounded-xl text-left text-xs font-bold text-white/70 transition-all hover:text-white">
                    <FiMusic size={13} className="text-white/40" /> Playlists
                  </button>
                  <button onClick={() => handleNavigation('/favorites')} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.045] rounded-xl text-left text-xs font-bold text-white/70 transition-all hover:text-white">
                    <FiHeart size={13} className="text-white/40" /> Favorites
                  </button>
                  <button onClick={() => handleNavigation('/recently-played')} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.045] rounded-xl text-left text-xs font-bold text-white/70 transition-all hover:text-white">
                    <FiClock size={13} className="text-white/40" /> Recent
                  </button>
                  <button onClick={() => handleNavigation('/stats')} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.045] rounded-xl text-left text-xs font-bold text-white/70 transition-all hover:text-white">
                    <FiTrendingUp size={13} className="text-white/40" /> Statistics
                  </button>
                  <button onClick={() => handleNavigation('/settings')} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.045] rounded-xl text-left text-xs font-bold text-white/70 transition-all hover:text-white col-span-2">
                    <FiSettings size={13} className="text-white/40" /> Settings
                  </button>
                </div>
              </div>

              <div className="border-t border-white/[0.05] pt-3.5">
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-white/25 mb-1.5">Player Commands</p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => handleAction(() => togglePlay(!isPlaying))}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.04] rounded-xl text-left text-xs font-bold text-white/75 hover:text-white transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <FiPlay size={13} className="text-white/40" />
                      <span>{isPlaying ? 'Pause music' : 'Resume playback'}</span>
                    </div>
                    <kbd className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/30 font-mono shadow-sm">Space</kbd>
                  </button>
                  <button
                    onClick={() => handleAction(toggleShuffle)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] rounded-xl text-left text-xs font-bold text-white/75 hover:text-white transition-all"
                  >
                    <FiShuffle size={13} className="text-white/40" />
                    <span>Toggle Shuffle Mode</span>
                  </button>
                  <button
                    onClick={() => handleAction(cycleRepeatMode)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] rounded-xl text-left text-xs font-bold text-white/75 hover:text-white transition-all"
                  >
                    <FiRepeat size={13} className="text-white/40" />
                    <span>Cycle Repeat Mode</span>
                  </button>
                  <button
                    onClick={() => handleAction(clearQueue)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-500/5 hover:text-red-400 rounded-xl text-left text-xs font-bold text-white/70 transition-all"
                  >
                    <FiTrash2 size={13} className="text-red-400/40" />
                    <span>Clear Active Queue</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Outer wrapper: conditionally mounts the inner component so state resets on close
const CommandPalette = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <CommandPaletteInner onClose={onClose} />;
};

export default CommandPalette;

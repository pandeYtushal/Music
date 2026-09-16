import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchSongs } from '../api/saavn';
import { FiSearch, FiHome, FiCompass, FiMusic, FiHeart, FiClock, FiSettings, FiTrendingUp, FiPlay, FiShuffle, FiRepeat, FiTrash2 } from 'react-icons/fi';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';

// CommandPaletteInner is only mounted while the palette is open.
const CommandPaletteInner = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.setIsPlaying);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode);
  const clearQueue = usePlayerStore((state) => state.clearQueue);
  const setCurrentVideo = usePlayerStore((state) => state.setCurrentVideo);

  const inputRefCallback = useCallback((node) => {
    if (node) setTimeout(() => node.focus(), 60);
  }, []);

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
    }, 300);
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
      className="fixed inset-0 z-[2000] flex items-start justify-center p-4 md:p-10 bg-black/75 backdrop-blur-md transition-all duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden mt-[10vh] animate-scale-in bg-neutral-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08] bg-black/40">
          <FiSearch size={18} className="text-indigo-400 shrink-0" />
          <input
            ref={inputRefCallback}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search tracks or jump to pages..."
            className="w-full bg-transparent text-sm text-white font-medium outline-none placeholder:text-neutral-500"
          />
          <kbd className="text-[10px] bg-white/[0.06] border border-white/15 px-2 py-0.5 rounded text-neutral-400 font-mono shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Contents */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-4">
          {/* Dynamic Search Results */}
          {query.trim() && (
            <div>
              <p className="px-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5 font-semibold">
                Matching Tracks
              </p>
              {loading ? (
                <div className="px-3 py-3 text-xs font-mono text-indigo-400">Searching catalog...</div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => handlePlaySong(song)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/[0.06] rounded-xl text-left transition-colors group cursor-pointer"
                    >
                      <img
                        src={pickImageUrl(song.image)}
                        className="w-9 h-9 rounded-lg object-cover bg-neutral-900 border border-white/10"
                        alt=""
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">{cleanText(song.name)}</p>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-normal">{cleanText(song.primaryArtists)}</p>
                      </div>
                      <FiPlay size={14} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-3 text-xs font-mono text-neutral-500">No tracks found.</div>
              )}
            </div>
          )}

          {/* Quick Navigation & Controls */}
          {!query.trim() && (
            <>
              <div>
                <p className="px-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5 font-semibold">
                  Quick Navigation
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={() => handleNavigation('/home')} className="flex items-center gap-2.5 p-2.5 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 transition-all hover:text-white cursor-pointer">
                    <FiHome size={14} className="text-neutral-500" /> Home
                  </button>
                  <button onClick={() => handleNavigation('/discover')} className="flex items-center gap-2.5 p-2.5 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 transition-all hover:text-white cursor-pointer">
                    <FiCompass size={14} className="text-neutral-500" /> Discover
                  </button>
                  <button onClick={() => handleNavigation('/search')} className="flex items-center gap-2.5 p-2.5 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 transition-all hover:text-white cursor-pointer">
                    <FiSearch size={14} className="text-neutral-500" /> Search
                  </button>
                  <button onClick={() => handleNavigation('/playlists')} className="flex items-center gap-2.5 p-2.5 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 transition-all hover:text-white cursor-pointer">
                    <FiMusic size={14} className="text-neutral-500" /> Library
                  </button>
                  <button onClick={() => handleNavigation('/favorites')} className="flex items-center gap-2.5 p-2.5 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 transition-all hover:text-white cursor-pointer">
                    <FiHeart size={14} className="text-neutral-500" /> Liked Songs
                  </button>
                  <button onClick={() => handleNavigation('/recently-played')} className="flex items-center gap-2.5 p-2.5 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 transition-all hover:text-white cursor-pointer">
                    <FiClock size={14} className="text-neutral-500" /> Recently Played
                  </button>
                  <button onClick={() => handleNavigation('/stats')} className="flex items-center gap-2.5 p-2.5 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 transition-all hover:text-white cursor-pointer">
                    <FiTrendingUp size={14} className="text-neutral-500" /> Listening Dossier
                  </button>
                  <button onClick={() => handleNavigation('/settings')} className="flex items-center gap-2.5 p-2.5 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 transition-all hover:text-white cursor-pointer">
                    <FiSettings size={14} className="text-neutral-500" /> Settings
                  </button>
                </div>
              </div>

              <div className="border-t border-white/[0.08] pt-3">
                <p className="px-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5 font-semibold">
                  Player Commands
                </p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => handleAction(() => togglePlay(!isPlaying))}
                    className="w-full flex items-center justify-between p-2 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 hover:text-white transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FiPlay size={13} className="text-indigo-400" />
                      <span>{isPlaying ? 'Pause playback' : 'Resume playback'}</span>
                    </div>
                    <kbd className="text-[9px] bg-white/[0.06] border border-white/15 px-2 py-0.5 rounded text-neutral-400 font-mono">
                      Space
                    </kbd>
                  </button>
                  <button
                    onClick={() => handleAction(toggleShuffle)}
                    className="w-full flex items-center gap-2.5 p-2 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 hover:text-white transition-all cursor-pointer"
                  >
                    <FiShuffle size={13} className="text-neutral-500" />
                    <span>Toggle Shuffle</span>
                  </button>
                  <button
                    onClick={() => handleAction(cycleRepeatMode)}
                    className="w-full flex items-center gap-2.5 p-2 hover:bg-white/[0.06] rounded-xl text-left text-xs font-medium text-neutral-300 hover:text-white transition-all cursor-pointer"
                  >
                    <FiRepeat size={13} className="text-neutral-500" />
                    <span>Cycle Repeat Mode</span>
                  </button>
                  <button
                    onClick={() => handleAction(clearQueue)}
                    className="w-full flex items-center gap-2.5 p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-left text-xs font-medium text-neutral-400 transition-all cursor-pointer"
                  >
                    <FiTrash2 size={13} className="text-rose-500/60" />
                    <span>Clear Up Next Queue</span>
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

const CommandPalette = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <CommandPaletteInner onClose={onClose} />;
};

export default CommandPalette;

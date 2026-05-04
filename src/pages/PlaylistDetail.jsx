import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay, FiShare2, FiEdit2, FiTrash2, FiX, FiCheck, FiCopy, FiMusic } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, renamePlaylist, deletePlaylist, removeFromPlaylist, setCurrentVideo } = usePlayerStore();
  
  const playlist = playlists.find(p => p.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(playlist?.name || '');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!playlist) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Playlist not found</h2>
        <button onClick={() => navigate('/playlists')} className="text-primary mt-4">Go back</button>
      </div>
    );
  }

  const handleRename = () => {
    if (newName.trim()) {
      renamePlaylist(id, newName.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(id);
      navigate('/playlists');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = window.location.href;

  return (
    <div className="pb-40 md:pb-32">
      {/* Header */}
      <div className="relative h-64 md:h-80 flex items-end p-6 md:p-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {playlist.songs.length > 0 ? (
            <img 
              src={playlist.songs[0].image?.[2]?.link} 
              className="w-full h-full object-cover blur-3xl opacity-30"
              alt=""
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-surface blur-3xl opacity-30"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 w-full">
          <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 rounded-2xl bg-surface overflow-hidden shadow-2xl border border-white/5">
            {playlist.songs.length > 0 ? (
              <img src={playlist.songs[0].image?.[2]?.link} className="w-full h-full object-cover" alt={playlist.name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiMusic size={64} className="text-textSecondary/20" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left pb-2">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Playlist</p>
            {isEditing ? (
              <div className="flex items-center gap-4">
                <input 
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-background/50 border-b-2 border-primary text-4xl md:text-6xl font-bold outline-none w-full max-w-xl py-2"
                />
                <button onClick={handleRename} className="bg-primary text-black p-2 rounded-full hover:scale-110"><FiCheck size={24} /></button>
                <button onClick={() => setIsEditing(false)} className="bg-white/10 p-2 rounded-full hover:scale-110"><FiX size={24} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-4 group justify-center md:justify-start">
                <h1 className="text-4xl md:text-6xl font-bold text-textPrimary leading-tight">{playlist.name}</h1>
                <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-primary"><FiEdit2 size={24} /></button>
              </div>
            )}
            <div className="mt-4 flex items-center gap-2 text-textSecondary justify-center md:justify-start">
              <span className="font-semibold text-textPrimary">{playlist.songs.length} songs</span>
              <span>•</span>
              <span>Created for you</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 md:px-8 py-8 flex flex-wrap items-center gap-6">
        <button 
          onClick={() => playlist.songs.length > 0 && setCurrentVideo(playlist.songs[0], playlist.songs)}
          className="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <FiPlay size={28} className="fill-current ml-1" />
        </button>
        <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 text-textSecondary hover:text-textPrimary font-semibold transition-colors">
          <FiShare2 size={24} />
          Share
        </button>
        <button onClick={handleDelete} className="flex items-center gap-2 text-textSecondary hover:text-red-400 font-semibold transition-colors ml-auto">
          <FiTrash2 size={22} />
          Delete
        </button>
      </div>

      {/* Songs Table */}
      <div className="px-6 md:px-8">
        <div className="bg-surface/30 rounded-3xl overflow-hidden border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-textSecondary text-sm border-b border-white/5 uppercase tracking-wider">
                <th className="py-4 px-6 font-medium w-12 text-center">#</th>
                <th className="py-4 px-6 font-medium">Title</th>
                <th className="py-4 px-6 font-medium hidden sm:table-cell">Album</th>
                <th className="py-4 px-6 font-medium text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {playlist.songs.map((song, index) => (
                <tr 
                  key={song.id}
                  className="group hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setCurrentVideo(song, playlist.songs)}
                >
                  <td className="py-4 px-6 text-center text-textSecondary group-hover:text-primary transition-colors">{index + 1}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <img src={song.image?.[0]?.link} className="w-10 h-10 rounded shadow-md" alt={song.name} />
                      <div className="overflow-hidden">
                        <p className="font-semibold text-textPrimary truncate" dangerouslySetInnerHTML={{ __html: song.name }}></p>
                        <p className="text-xs text-textSecondary truncate" dangerouslySetInnerHTML={{ __html: song.primaryArtists }}></p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-textSecondary text-sm hidden sm:table-cell" dangerouslySetInnerHTML={{ __html: song.album?.name || 'Single' }}></td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromPlaylist(id, song.id); }}
                      className="text-textSecondary hover:text-red-400 p-2"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {playlist.songs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-textSecondary">
                    Your playlist is empty. Start adding songs!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Share Playlist</h2>
              <button onClick={() => setShowShareModal(false)} className="text-textSecondary hover:text-textPrimary"><FiX size={24} /></button>
            </div>
            
            <div className="flex flex-col items-center mb-8">
              <div className="p-4 bg-white rounded-2xl mb-4">
                <QRCodeSVG value={shareUrl} size={180} fgColor="#000" bgColor="#fff" />
              </div>
              <p className="text-sm text-textSecondary">Scan code to open playlist</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-background border border-white/10 rounded-2xl">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl}
                  className="flex-1 bg-transparent text-sm text-textSecondary outline-none truncate"
                />
                <button 
                  onClick={copyToClipboard}
                  className="text-primary font-bold text-sm shrink-0 flex items-center gap-1"
                >
                  {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Player from './components/Player';
import CommandPalette from './components/CommandPalette';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import Toast from './components/Toast';
import Footer from './components/Footer';

import Home from './pages/Home';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Favorites from './pages/Favorites';
import RecentlyPlayed from './pages/RecentlyPlayed';
import Settings from './pages/Settings';
import StatsDashboard from './pages/StatsDashboard';
import SharedSong from './pages/SharedSong';

export default function App() {
  return (
    <Router>
      <div className="app-shell text-[#f4f1e8] flex flex-col overflow-x-hidden">
        {/* Top Floating Glass Bar / Navigation */}
        <Sidebar />

        {/* Main Content View Container */}
        <main className="flex-1 pb-32 pt-20 md:pt-28 px-5 md:px-8 max-w-[1440px] mx-auto w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/recently-played" element={<RecentlyPlayed />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/stats" element={<StatsDashboard />} />
            <Route path="/share/:id" element={<SharedSong />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>

          {/* Footer Component */}
          <Footer />
        </main>

        {/* Global Components */}
        <CommandPalette />
        <AddToPlaylistModal />
        <Toast />

        {/* Mobile Bottom Navigation */}
        <BottomNav />

        {/* Floating Audio Player (Desktop & Mobile) */}
        <Player />
      </div>
    </Router>
  );
}

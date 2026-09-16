import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DesktopNav from './components/navigation/DesktopNav';
import MobileNav from './components/navigation/MobileNav';
import Player from './components/Player';
import CommandPalette from './components/CommandPalette';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import Toast from './components/Toast';
import Footer from './components/Footer';

import Home from './pages/Home';
import Discover from './pages/Discover';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Favorites from './pages/Favorites';
import RecentlyPlayed from './pages/RecentlyPlayed';
import Settings from './pages/Settings';
import StatsDashboard from './pages/StatsDashboard';
import SharedSong from './pages/SharedSong';
import ArtistPage from './pages/ArtistPage';
import Welcome from './pages/Welcome';

export default function App() {
  return (
    <Router>
      <div className="relative flex flex-col min-h-screen text-primary bg-background font-sans selection:bg-surface-raised selection:text-primary z-0">
        <DesktopNav />

        <main className="flex-1 w-full flex flex-col pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-24 z-10">
          <Routes>
            <Route path="/"                  element={<Navigate to="/home" replace />} />
            <Route path="/welcome"           element={<Welcome />} />
            <Route path="/home"              element={<Home />} />
            <Route path="/discover"          element={<Discover />} />
            <Route path="/search"            element={<Search />} />
            <Route path="/artist/:name"      element={<ArtistPage />} />
            <Route path="/playlists"         element={<Playlists />} />
            <Route path="/playlists/:id"     element={<PlaylistDetail />} />
            <Route path="/favorites"         element={<Favorites />} />
            <Route path="/recently-played"   element={<RecentlyPlayed />} />
            <Route path="/settings"          element={<Settings />} />
            <Route path="/stats"             element={<StatsDashboard />} />
            <Route path="/share/:id"         element={<SharedSong />} />
            <Route path="/play"              element={<SharedSong />} />
            <Route path="*"                  element={<Navigate to="/home" replace />} />
          </Routes>
          <Footer />
        </main>

        <CommandPalette />
        <AddToPlaylistModal />
        <Toast />
        <MobileNav />
        <Player />
      </div>
    </Router>
  );
}

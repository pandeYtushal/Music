import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Layout & UI Components
import DesktopNav from './components/navigation/DesktopNav';
import MobileNav from './components/navigation/MobileNav';
import Player from './components/Player';
import CommandPalette from './components/CommandPalette';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import Toast from './components/Toast';
import Footer from './components/Footer';

// Enhancements
import ErrorBoundary from './components/ErrorBoundary';
import GlobalLoader from './components/GlobalLoader';
import ScrollToTop from './components/ScrollToTop';
import NetworkStatus from './components/NetworkStatus';
import SEO from './components/SEO';
import usePageTracking from './hooks/usePageTracking';

// Lazy-loaded Pages
const Home = React.lazy(() => import('./pages/Home'));
const Discover = React.lazy(() => import('./pages/Discover'));
const Search = React.lazy(() => import('./pages/Search'));
const Playlists = React.lazy(() => import('./pages/Playlists'));
const PlaylistDetail = React.lazy(() => import('./pages/PlaylistDetail'));
const Favorites = React.lazy(() => import('./pages/Favorites'));
const RecentlyPlayed = React.lazy(() => import('./pages/RecentlyPlayed'));
const Settings = React.lazy(() => import('./pages/Settings'));
const StatsDashboard = React.lazy(() => import('./pages/StatsDashboard'));
const SharedSong = React.lazy(() => import('./pages/SharedSong'));
const Welcome = React.lazy(() => import('./pages/Welcome'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function AppContent() {
  const location = useLocation();
  const isWelcomePage = location.pathname === '/welcome';

  // Custom hooks
  usePageTracking();

  return (
    <div className="relative flex flex-col min-h-screen text-primary bg-background font-sans selection:bg-surface-raised selection:text-primary z-0">
      <ScrollToTop />
      <NetworkStatus />
      <SEO /> {/* Base SEO, pages can override this */}

      {!isWelcomePage && <DesktopNav />}

      <main className={`flex-1 w-full flex flex-col z-10 ${!isWelcomePage ? 'pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-24' : ''}`}>
        <Suspense fallback={<GlobalLoader />}>
          <Routes>
            <Route path="/"                  element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome"           element={<Welcome />} />
            <Route path="/home"              element={<Home />} />
            <Route path="/discover"          element={<Discover />} />
            <Route path="/search"            element={<Search />} />
            <Route path="/playlists"         element={<Playlists />} />
            <Route path="/playlists/:id"     element={<PlaylistDetail />} />
            <Route path="/favorites"         element={<Favorites />} />
            <Route path="/recently-played"   element={<RecentlyPlayed />} />
            <Route path="/settings"          element={<Settings />} />
            <Route path="/stats"             element={<StatsDashboard />} />
            <Route path="/share/:id"         element={<SharedSong />} />
            <Route path="/play"              element={<SharedSong />} />
            <Route path="*"                  element={<NotFound />} />
          </Routes>
        </Suspense>
        {!isWelcomePage && <Footer />}
      </main>

      {!isWelcomePage && (
        <>
          <CommandPalette />
          <AddToPlaylistModal />
          <Toast />
          <MobileNav />
          <Player />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <AppContent />
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

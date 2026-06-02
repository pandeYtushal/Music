import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { FiLoader } from 'react-icons/fi';

// Firebase
import { auth } from './firebase';

// Stores
import { useAuthStore } from './store/useAuthStore';
import { usePlayerStore } from './store/usePlayerStore';

// Always-visible shell components (not lazy-loaded)
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Player from './components/Player';
import BottomNav from './components/BottomNav';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import LibrarySync from './components/LibrarySync';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded pages — only downloaded when navigated to
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Search = lazy(() => import('./pages/Search'));
const Favorites = lazy(() => import('./pages/Favorites'));
const RecentlyPlayed = lazy(() => import('./pages/RecentlyPlayed'));
const Settings = lazy(() => import('./pages/Settings'));
const Playlists = lazy(() => import('./pages/Playlists'));
const PlaylistDetail = lazy(() => import('./pages/PlaylistDetail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const SharedSong = lazy(() => import('./pages/SharedSong'));

// React Query client (stable singleton, never recreated)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Suspense fallback shown while a lazy route is loading
const PageLoader = () => (
  <div className="h-full flex items-center justify-center">
    <FiLoader className="animate-spin text-white" size={40} />
  </div>
);

function App() {
  const { user, setUser, setIsLoading, isLoading } = useAuthStore();

  // ── Dark mode is now permanently enabled for the music app ──

  // ── Firebase auth listener ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        });
      } else {
        setUser(null);
        usePlayerStore.getState().setCurrentVideo(null, []);
        usePlayerStore.getState().setIsPlaying(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setIsLoading]);

  if (isLoading) {
    return (
      <div className="h-[100dvh] md:h-screen bg-black flex items-center justify-center">
        <FiLoader className="animate-spin text-white" size={50} />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div
          className="flex h-[100dvh] md:h-screen w-screen text-white overflow-hidden selection:bg-white/20 dark"
        >
          {user && <Sidebar />}

          <div className={`flex-1 flex flex-col h-full overflow-hidden relative bg-background ${user ? 'md:ml-64' : ''}`}>

            <div className={`flex-1 overflow-y-auto relative z-10 scrollbar-hide flex flex-col ${user ? 'pb-[150px] md:pb-4' : ''}`}>
              {user && <Navbar />}
              <div className="flex-1 shrink-0 w-full relative">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/welcome" element={<Welcome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/search"
                      element={
                        <ProtectedRoute>
                          <Search />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/favorites"
                      element={
                        <ProtectedRoute>
                          <Favorites />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/recently-played"
                      element={
                        <ProtectedRoute>
                          <RecentlyPlayed />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/playlists"
                      element={
                        <ProtectedRoute>
                          <Playlists />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/playlist/:id"
                      element={
                        <ProtectedRoute>
                          <PlaylistDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/play"
                      element={<SharedSong />}
                    />
                    <Route
                      path="*"
                      element={
                        <ProtectedRoute>
                          <div className="p-8 text-center text-textSecondary mt-20">
                            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
                            <p>This page is under construction.</p>
                          </div>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Suspense>
              </div>
              <Footer />
            </div>
          </div>
        </div>

        {user && <BottomNav />}
        {user && <Player />}
        {user && <AddToPlaylistModal />}
        {user && <LibrarySync />}
      </Router>
    </QueryClientProvider>
  );
}

export default App;

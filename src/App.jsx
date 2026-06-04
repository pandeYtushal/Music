import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FiLoader } from 'react-icons/fi';

// Stores
import { useAuthStore } from './store/useAuthStore';
import { usePlayerStore } from './store/usePlayerStore';

// Always-visible shell components (not lazy-loaded)
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';

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
const Player = lazy(() => import('./components/Player'));
const LibrarySync = lazy(() => import('./components/LibrarySync'));

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
  const currentVideo = usePlayerStore(state => state.currentVideo);

  // ── Dark mode is now permanently enabled for the music app ──

  // ── Firebase auth listener ──
  useEffect(() => {
    let unsubscribe = null;
    let cancelled = false;

    const attachAuthListener = async () => {
      const [{ auth }, { onAuthStateChanged }] = await Promise.all([
        import('./firebase'),
        import('firebase/auth'),
      ]);

      if (cancelled) return;

      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
    };

    attachAuthListener().catch((error) => {
      console.error('[Melody] Failed to initialize auth:', error);
      if (!cancelled) {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
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

          <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background">

            <div className={`flex-1 overflow-y-auto relative z-10 scrollbar-hide flex flex-col ${user ? 'pb-[150px] md:pb-36 md:pt-24' : ''}`}>
              {user && <div className="md:hidden"><Navbar /></div>}
              <div className="flex-1 shrink-0 w-full relative">
                <ErrorBoundary compact>
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
                </ErrorBoundary>
              </div>
              <Footer />
            </div>
          </div>
        </div>

        {user && <BottomNav />}
        {user && currentVideo && (
          <Suspense fallback={null}>
            <Player />
          </Suspense>
        )}
        {user && <AddToPlaylistModal />}
        {user && (
          <Suspense fallback={null}>
            <LibrarySync />
          </Suspense>
        )}
        <Toast />
      </Router>
    </QueryClientProvider>
  );
}

export default App;

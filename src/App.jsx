import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Player from './components/Player';
import Home from './pages/Home';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import BottomNav from './components/BottomNav';
import { useAuthStore } from './store/useAuthStore';
import { usePlayerStore } from './store/usePlayerStore';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <FiLoader className="animate-spin text-white" size={40} />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
};

function App() {
  const { user, setUser, setIsLoading, isLoading } = useAuthStore();

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
      <div className="h-screen bg-black flex items-center justify-center">
        <FiLoader className="animate-spin text-white" size={50} />
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-black text-white overflow-hidden selection:bg-white/20">
        {user && <Sidebar />}
        
        <div className={`flex-1 flex flex-col h-full overflow-hidden relative bg-[#080808] ${user ? 'md:ml-64' : ''}`}>
          
          <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
            {user && <Navbar />}
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
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
          </div>
        </div>
      </div>
      
      {user && <BottomNav />}
      {user && <Player />}
      {user && <AddToPlaylistModal />}
    </Router>
  );
}

export default App;

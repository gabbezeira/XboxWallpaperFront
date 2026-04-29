import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import useGamepad from './hooks/useGamepad';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import Layout from './components/Layout';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import MyWallpapers from './pages/MyWallpapers';
import Favorites from './pages/Favorites';
import WallpaperDetails from './pages/WallpaperDetails';
import FullscreenViewer from './pages/FullscreenViewer';
import Collection from './pages/Collection';
import Terms from './pages/Terms';
import Admin from './pages/Admin';
import AdminLogin from './pages/Admin/Login';
import AdminRoute from './components/AdminRoute';

import GlobalLoader from './components/GlobalLoader';

function AppRoutes() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  useGamepad();
  return (
    <>
      <GlobalLoader />
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/adminpanel/*"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route path="/wallpaper/:id" element={<WallpaperDetails />} />
        <Route path="/wallpaper/:id/fullscreen" element={<FullscreenViewer />} />

        <Route
          path="*"
          element={
            <Layout onLoginClick={() => setShowAuthModal(true)}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/collection/:tag" element={<Collection />} />
                <Route path="/terms" element={<Terms />} />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-wallpapers"
                  element={
                    <ProtectedRoute>
                      <MyWallpapers />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          }
        />
      </Routes>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <AppRoutes />
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
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

function GlobalLoader() {
  const { loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(
    () => sessionStorage.getItem('oauth_redirect') === 'true'
  );

  useEffect(() => {
    let timeoutId;
    if (isRedirecting) {
      // Timeout de 10 segundos caso o Firebase não responda
      // ou se o usuário voltar da página pelo cache do navegador
      timeoutId = setTimeout(() => {
        setIsRedirecting(false);
        sessionStorage.removeItem('oauth_redirect');
      }, 10000);
    }
    return () => clearTimeout(timeoutId);
  }, [isRedirecting]);

  useEffect(() => {
    if (!loading && isRedirecting) {
      setIsRedirecting(false);
      sessionStorage.removeItem('oauth_redirect');
    }
  }, [loading, isRedirecting]);

  if (loading && isRedirecting) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: 'inherit',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(16, 124, 16, 0.2)',
            borderTopColor: '#107c10',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ marginTop: '24px', fontSize: '1.1rem', fontWeight: 500, color: '#a3a3a3' }}>
          Conectando conta Microsoft...
        </p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return null;
}

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

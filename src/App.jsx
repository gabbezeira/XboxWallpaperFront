import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import useGamepad from './hooks/useGamepad';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import Layout from './components/Layout';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AdminRoute from './components/AdminRoute';
import { Analytics } from '@vercel/analytics/react';
import GlobalLoader from './components/GlobalLoader';

const Gallery = lazy(() => import('./pages/Gallery'));
const MyWallpapers = lazy(() => import('./pages/MyWallpapers'));
const Upload = lazy(() => import('./pages/Upload'));
const MyCollection = lazy(() => import('./pages/MyCollection'));
const Favorites = lazy(() => import('./pages/Favorites'));
const WallpaperDetails = lazy(() => import('./pages/WallpaperDetails'));
const FullscreenViewer = lazy(() => import('./pages/FullscreenViewer'));
const Collection = lazy(() => import('./pages/Collection'));
const Terms = lazy(() => import('./pages/Terms'));
const Levels = lazy(() => import('./pages/Levels'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/Admin/Login'));
const LinkDevice = lazy(() => import('./pages/LinkDevice'));

function AppRoutes() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  useGamepad();
  return (
    <>
      <GlobalLoader />
      <Suspense fallback={<GlobalLoader />}>
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

          <Route path="/link" element={<LinkDevice />} />

          <Route
            path="*"
            element={
              <Layout onLoginClick={() => setShowAuthModal(true)}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/wallpaper/:id" element={<WallpaperDetails />} />
                  <Route path="/wallpaper/:id/fullscreen" element={<FullscreenViewer />} />
                  <Route path="/collection/:tag" element={<Collection />} />
                  <Route path="/c/:tag" element={<Collection />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/levels" element={<Levels />} />
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
                  <Route
                    path="/upload"
                    element={
                      <ProtectedRoute>
                        <Upload />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-collection"
                    element={
                      <ProtectedRoute>
                        <MyCollection />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Suspense>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <Analytics />
          <AppRoutes />
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

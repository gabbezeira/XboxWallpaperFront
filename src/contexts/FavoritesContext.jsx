import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { attachAuthenticatedMediaUrls } from '../utils/wallpaperMedia.js';

export const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const stored = localStorage.getItem('spartan_favorite_ids');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const fetchFavorites = useCallback(async () => {
    if (!user || authLoading) {
      if (!user && !authLoading) {
        setFavorites([]);
        setFavoriteIds(new Set());
        try {
          localStorage.removeItem('spartan_favorite_ids');
        } catch {}
      }
      return;
    }

    try {
      setLoading(true);
      const data = await api.favorites.list();
      const token = await user.getIdToken();
      const mapped = attachAuthenticatedMediaUrls(data, token);
      setFavorites(mapped);
      const idsArray = data.map((w) => w.id);
      setFavoriteIds(new Set(idsArray));
      try {
        localStorage.setItem('spartan_favorite_ids', JSON.stringify(idsArray));
      } catch {}
    } catch (error) {
      console.warn('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((id) => favoriteIds.has(id), [favoriteIds]);

  const toggleFavorite = useCallback(
    async (wallpaper) => {
      if (!user) return;

      try {
        if (isFavorite(wallpaper.id)) {
          await api.favorites.remove(wallpaper.id);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(wallpaper.id);
            try {
              localStorage.setItem('spartan_favorite_ids', JSON.stringify([...next]));
            } catch {}
            return next;
          });
          setFavorites((prev) => prev.filter((f) => f.id !== wallpaper.id));
        } else {
          await api.favorites.add(wallpaper.id);
          const token = await user.getIdToken();
          const [withUrls] = attachAuthenticatedMediaUrls([wallpaper], token);
          setFavoriteIds((prev) => {
            const next = new Set([...prev, wallpaper.id]);
            try {
              localStorage.setItem('spartan_favorite_ids', JSON.stringify([...next]));
            } catch {}
            return next;
          });
          setFavorites((prev) => [...prev, withUrls]);
        }
      } catch (error) {
        console.warn('Erro ao alternar favorito:', error);
      }
    },
    [user, isFavorite],
  );

  const contextValue = useMemo(
    () => ({
      favorites,
      loading,
      isFavorite,
      toggleFavorite,
      refetch: fetchFavorites,
    }),
    [favorites, loading, isFavorite, toggleFavorite, fetchFavorites],
  );

  return <FavoritesContext.Provider value={contextValue}>{children}</FavoritesContext.Provider>;
}

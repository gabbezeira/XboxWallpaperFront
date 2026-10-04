import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { attachAuthenticatedMediaUrls } from '../utils/wallpaperMedia.js';

export const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(new Set());
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
      if (!user || !wallpaper?.id) return;
      if (inFlightRef.current.has(wallpaper.id)) return;

      inFlightRef.current.add(wallpaper.id);
      const wasFavorite = favoriteIds.has(wallpaper.id);

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) {
          next.delete(wallpaper.id);
        } else {
          next.add(wallpaper.id);
        }
        try {
          localStorage.setItem('spartan_favorite_ids', JSON.stringify([...next]));
        } catch {}
        return next;
      });

      if (wasFavorite) {
        setFavorites((prev) => prev.filter((f) => f.id !== wallpaper.id));
      } else {
        setFavorites((prev) => [...prev, wallpaper]);
      }

      try {
        if (wasFavorite) {
          await api.favorites.remove(wallpaper.id);
        } else {
          await api.favorites.add(wallpaper.id);
          try {
            const token = await user.getIdToken();
            const [withUrls] = attachAuthenticatedMediaUrls([wallpaper], token);
            setFavorites((prev) => prev.map((f) => (f.id === wallpaper.id ? withUrls : f)));
          } catch {}
        }
      } catch (error) {
        console.warn('Erro ao alternar favorito:', error);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorite) {
            next.add(wallpaper.id);
          } else {
            next.delete(wallpaper.id);
          }
          try {
            localStorage.setItem('spartan_favorite_ids', JSON.stringify([...next]));
          } catch {}
          return next;
        });
        if (wasFavorite) {
          setFavorites((prev) => [...prev, wallpaper]);
        } else {
          setFavorites((prev) => prev.filter((f) => f.id !== wallpaper.id));
        }
      } finally {
        inFlightRef.current.delete(wallpaper.id);
      }
    },
    [user, favoriteIds],
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

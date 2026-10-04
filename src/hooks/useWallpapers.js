import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './useAuth';
import { attachAuthenticatedMediaUrls } from '../utils/wallpaperMedia.js';

export function useWallpapers() {
  const { user } = useAuth();
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const userUid = user?.uid;

  const fetchWallpapers = useCallback(async () => {
    if (!userUid) {
      setWallpapers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.wallpapers.mine();
      const token = await user?.getIdToken();
      setWallpapers(attachAuthenticatedMediaUrls(data, token));
    } catch (error) {
      console.warn('Erro ao carregar wallpapers:', error);
    } finally {
      setLoading(false);
    }
  }, [userUid, user]);

  useEffect(() => {
    fetchWallpapers();
  }, [fetchWallpapers]);

  return { wallpapers, setWallpapers, loading, refetch: fetchWallpapers };
}

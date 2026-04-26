import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { useAuth } from './useAuth'
import { attachAuthenticatedMediaUrls } from '../utils/wallpaperMedia.js'

export function useWallpapers() {
  const { user } = useAuth()
  const [wallpapers, setWallpapers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWallpapers = useCallback(async () => {
    if (!user) {
      setWallpapers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await api.wallpapers.mine()
      const token = await user.getIdToken()
      setWallpapers(attachAuthenticatedMediaUrls(data, token))
    } catch (error) {
      console.warn('Erro ao carregar wallpapers:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchWallpapers()
  }, [fetchWallpapers])

  return { wallpapers, loading, refetch: fetchWallpapers }
}

import { useState } from 'react'
import { api } from '../services/api'
import { useAuth } from './useAuth'

export function useUpload() {
  const { user, refreshProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState(null)

  const upload = async (file, metadata = {}) => {
    if (!user) throw new Error('Você precisa estar logado')

    try {
      setUploading(true)
      setError(null)
      setProgress('Enviando imagem...')

      const result = await api.wallpapers.upload(file, metadata)

      await refreshProfile()
      setProgress('')
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, progress, error }
}

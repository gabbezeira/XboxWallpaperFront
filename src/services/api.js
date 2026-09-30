import { auth } from './firebase';
const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

async function getToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

async function request(path, options = {}) {
  const token = await getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  heroSlides: {
    list: () => request('/api/hero-slides'),
    listManage: () => request('/api/hero-slides/manage'),
    remove: (id) => request(`/api/hero-slides/${id}`, { method: 'DELETE' }),
  },

  wallpapers: {
    list: ({ q = '', tag = '', page = 1, limit = 20, sort = '' } = {}) => {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (tag) params.append('tag', tag);
      if (sort) params.append('sort', sort);
      params.append('page', page);
      params.append('limit', limit);
      return request(`/api/wallpapers?${params.toString()}`);
    },
    getById: (id) => request(`/api/wallpapers/${id}`),
    mine: () => request('/api/wallpapers/mine'),
    upload: (file, { title, game, tags } = {}) => {
      const formData = new FormData();
      formData.append('image', file);
      if (title) formData.append('title', title);
      if (game) formData.append('game', game);
      if (tags && tags.length) formData.append('tags', JSON.stringify(tags));
      return request('/api/wallpapers/upload', { method: 'POST', body: formData });
    },
    remove: (id) => request(`/api/wallpapers/${id}`, { method: 'DELETE' }),
    downloadUrl: async (id) => {
      const token = await getToken();
      return `${API_URL}/api/wallpapers/${id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    },
  },

  favorites: {
    list: () => request('/api/favorites'),
    add: (wallpaperId) => request(`/api/favorites/${wallpaperId}`, { method: 'POST' }),
    remove: (wallpaperId) => request(`/api/favorites/${wallpaperId}`, { method: 'DELETE' }),
  },

  profile: {
    get: () => request('/api/wallpapers/profile'),
    updatePreferences: (preferences) =>
      request('/api/wallpapers/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ preferences }),
      }),
  },

  deviceAuth: {
    request: () => request('/api/auth/device-code', { method: 'POST' }),
    poll: (deviceCode) =>
      request('/api/auth/device-code/poll', {
        method: 'POST',
        body: JSON.stringify({ deviceCode }),
      }),
    authorize: (userCode) =>
      request('/api/auth/device-code/authorize', {
        method: 'POST',
        body: JSON.stringify({ userCode }),
      }),
  },
};


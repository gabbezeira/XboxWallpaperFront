import { auth } from './firebase';
import { getCached, setCache, invalidateCache } from './apiCache';
const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

async function getToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

const inFlightRequests = new Map();

async function request(path, options = {}, retries = 3) {
  const isGet = !options.method || options.method === 'GET';
  if (isGet) {
    const flightKey = `${path}`;
    if (inFlightRequests.has(flightKey)) {
      return inFlightRequests.get(flightKey);
    }
    const flightPromise = executeRequest(path, options, retries)
      .finally(() => {
        inFlightRequests.delete(flightKey);
      });
    inFlightRequests.set(flightKey, flightPromise);
    return flightPromise;
  }
  return executeRequest(path, options, retries);
}

async function executeRequest(path, options = {}, retries = 3) {
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

  if (res.status === 429 && retries > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1500 * (4 - retries)));
    return executeRequest(path, options, retries - 1);
  }

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
    upload: (formData) => request('/api/hero-slides/upload', { method: 'POST', body: formData }),
    update: (id, data) => request(`/api/hero-slides/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    reorder: (orders) => request('/api/hero-slides/reorder', { method: 'PATCH', body: JSON.stringify({ orders }) }),
    remove: (id) => request(`/api/hero-slides/${id}`, { method: 'DELETE' }),
  },

  wallpapers: {
    list: async ({ q = '', tag = '', page = 1, limit = 20, sort = '', cursor = '' } = {}) => {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (tag) params.append('tag', tag);
      if (sort) params.append('sort', sort);
      if (cursor) params.append('cursor', cursor);
      params.append('page', page);
      params.append('limit', limit);
      const path = `/api/wallpapers?${params.toString()}`;
      const cached = getCached('/api/wallpapers', { q, tag, sort, page, limit, cursor });
      if (cached) return cached;
      const data = await request(path);
      setCache('/api/wallpapers', { q, tag, sort, page, limit, cursor }, data);
      return data;
    },
    tags: async () => {
      const cached = getCached('/api/wallpapers/tags');
      if (cached) return cached;
      const data = await request('/api/wallpapers/tags');
      setCache('/api/wallpapers/tags', null, data, 5 * 60 * 1000);
      return data;
    },
    getById: async (id) => {
      const cached = getCached(`/api/wallpapers/${id}`);
      if (cached) return cached;
      const data = await request(`/api/wallpapers/${id}`);
      setCache(`/api/wallpapers/${id}`, null, data, 5 * 60 * 1000);
      return data;
    },
    mine: () => request('/api/wallpapers/mine'),
    upload: async (file, { title, game, tags, isPublic, collectionId } = {}) => {
      const formData = new FormData();
      formData.append('image', file);
      if (title) formData.append('title', title);
      if (game) formData.append('game', game);
      if (tags && tags.length) formData.append('tags', JSON.stringify(tags));
      if (isPublic !== undefined) formData.append('isPublic', String(isPublic));
      if (collectionId) formData.append('collectionId', collectionId);
      const result = await request('/api/wallpapers/upload', { method: 'POST', body: formData });
      invalidateCache('/api/wallpapers');
      return result;
    },
    updateVisibility: async (id, isPublic) => {
      const result = await request(`/api/wallpapers/${id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublic }),
      });
      invalidateCache('/api/wallpapers');
      return result;
    },
    remove: async (id) => {
      const result = await request(`/api/wallpapers/${id}`, { method: 'DELETE' });
      invalidateCache('/api/wallpapers');
      return result;
    },
    batchRemove: async (ids) => {
      const result = await request('/api/wallpapers/batch-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      invalidateCache('/api/wallpapers');
      return result;
    },
    downloadUrl: async (id) => {
      const token = await getToken();
      return `${API_URL}/api/wallpapers/${id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    },
  },

  collections: {
    list: () => request('/api/collections'),
    getBySlug: (slug) => request(`/api/collections/${slug}`),
    mine: () => request('/api/collections/mine'),
    removeWallpaperFromMine: (wallpaperId) =>
      request(`/api/collections/mine/wallpapers/${wallpaperId}`, { method: 'DELETE' }),
    create: (data) =>
      request('/api/collections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/api/collections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    remove: (id) => request(`/api/collections/${id}`, { method: 'DELETE' }),
  },

  admin: {
    pendingWallpapers: () => request('/api/admin/moderation/pending'),
    approveWallpaper: (id, { collectionId } = {}) =>
      request(`/api/admin/moderation/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ collectionId }),
      }),
    rejectWallpaper: (id, { reason } = {}) =>
      request(`/api/admin/moderation/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),
    listUsers: ({ q = '', limit = 50 } = {}) =>
      request(`/api/admin/users?q=${encodeURIComponent(q)}&limit=${limit}`),
    updateRole: (id, role) =>
      request(`/api/admin/users/${encodeURIComponent(id)}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    updateUserRole: (id, role) =>
      request(`/api/admin/users/${encodeURIComponent(id)}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    updateVerification: (id, isVerified) =>
      request(`/api/admin/users/${encodeURIComponent(id)}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ isVerified }),
      }),
    updateUserVerification: (id, isVerified) =>
      request(`/api/admin/users/${encodeURIComponent(id)}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ isVerified }),
      }),
    assignCollection: (id, collectionId) =>
      request(`/api/admin/users/${encodeURIComponent(id)}/collection`, {
        method: 'PATCH',
        body: JSON.stringify({ collectionId }),
      }),
    assignUserCollection: (id, collectionId) =>
      request(`/api/admin/users/${encodeURIComponent(id)}/collection`, {
        method: 'PATCH',
        body: JSON.stringify({ collectionId }),
      }),
    deleteUser: (id) => request(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    deleteUserAccount: (id) => request(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    getFirestoreMetrics: (params = {}) => {
      const q = new URLSearchParams();
      if (params.forceStorage) q.set('forceStorage', 'true');
      if (params.forceStats) q.set('forceStats', 'true');
      const qs = q.toString() ? `?${q.toString()}` : '';
      return request(`/api/admin/metrics/firestore${qs}`);
    },
    refreshStorageMetrics: () => request('/api/admin/metrics/storage/refresh', { method: 'POST' }),
    resetFirestoreMetrics: () => request('/api/admin/metrics/firestore/reset', { method: 'POST' }),
    rebuildTagsMetadata: () => request('/api/admin/metadata/rebuild-tags', { method: 'POST' }),
    verifyAuth: () => request('/api/admin/auth/verify', { method: 'POST' }),
  },

  favorites: {
    list: () => request('/api/favorites'),
    add: async (wallpaperId) => {
      const result = await request(`/api/favorites/${wallpaperId}`, { method: 'POST' });
      invalidateCache('/api/wallpapers');
      return result;
    },
    remove: async (wallpaperId) => {
      const result = await request(`/api/favorites/${wallpaperId}`, { method: 'DELETE' });
      invalidateCache('/api/wallpapers');
      return result;
    },
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


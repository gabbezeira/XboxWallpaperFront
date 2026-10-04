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
    if (res.status === 403 && error.code === 'EMAIL_NOT_VERIFIED' && auth.currentUser && retries > 0) {
      try {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          await auth.currentUser.getIdToken(true);
          return executeRequest(path, options, 0);
        }
      } catch {}
    }
    const err = new Error(error.error || `HTTP ${res.status}`);
    err.code = error.code;
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export const api = {
  heroSlides: {
    list: async () => {
      const cached = getCached('/api/hero-slides');
      if (cached) return cached;
      const data = await request('/api/hero-slides');
      setCache('/api/hero-slides', null, data, 5 * 60 * 1000);
      return data;
    },
    listManage: () => request('/api/hero-slides/manage'),
    upload: async (formData) => {
      const res = await request('/api/hero-slides/upload', { method: 'POST', body: formData });
      invalidateCache('/api/hero-slides');
      try { sessionStorage.removeItem('xboxwall_hero_slides_v2'); } catch {}
      return res;
    },
    update: async (id, data) => {
      const res = await request(`/api/hero-slides/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      invalidateCache('/api/hero-slides');
      try { sessionStorage.removeItem('xboxwall_hero_slides_v2'); } catch {}
      return res;
    },
    reorder: async (orders) => {
      const res = await request('/api/hero-slides/reorder', { method: 'PATCH', body: JSON.stringify({ orders }) });
      invalidateCache('/api/hero-slides');
      try { sessionStorage.removeItem('xboxwall_hero_slides_v2'); } catch {}
      return res;
    },
    remove: async (id) => {
      const res = await request(`/api/hero-slides/${id}`, { method: 'DELETE' });
      invalidateCache('/api/hero-slides');
      try { sessionStorage.removeItem('xboxwall_hero_slides_v2'); } catch {}
      return res;
    },
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
    mine: async () => {
      const cached = getCached('/api/wallpapers/mine');
      if (cached) return cached;
      const data = await request('/api/wallpapers/mine');
      setCache('/api/wallpapers/mine', null, data, 10 * 60 * 1000);
      return data;
    },
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
      invalidateCache('/api/collections');
      return result;
    },
    updateVisibility: async (id, isPublic) => {
      const result = await request(`/api/wallpapers/${id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublic }),
      });
      invalidateCache('/api/wallpapers');
      invalidateCache('/api/collections');
      return result;
    },
    remove: async (id) => {
      const result = await request(`/api/wallpapers/${id}`, { method: 'DELETE' });
      invalidateCache('/api/wallpapers');
      invalidateCache('/api/collections');
      return result;
    },
    batchRemove: async (ids) => {
      const result = await request('/api/wallpapers/batch-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      invalidateCache('/api/wallpapers');
      invalidateCache('/api/collections');
      return result;
    },
    downloadUrl: async (id) => {
      const token = await getToken();
      return `${API_URL}/api/wallpapers/${id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    },
  },

  collections: {
    list: async () => {
      const cached = getCached('/api/collections');
      if (cached) return cached;
      const data = await request('/api/collections');
      setCache('/api/collections', null, data, 5 * 60 * 1000);
      return data;
    },
    getBySlug: async (slug) => {
      const clean = String(slug || '').toLowerCase().trim();
      const cached = getCached(`/api/collections/${clean}`);
      if (cached) return cached;
      const data = await request(`/api/collections/${clean}`);
      setCache(`/api/collections/${clean}`, null, data, 5 * 60 * 1000);
      return data;
    },
    mine: async () => {
      const cached = getCached('/api/collections/mine');
      if (cached) return cached;
      const data = await request('/api/collections/mine');
      setCache('/api/collections/mine', null, data, 10 * 60 * 1000);
      return data;
    },
    removeWallpaperFromMine: async (wallpaperId) => {
      const result = await request(`/api/collections/mine/wallpapers/${wallpaperId}`, { method: 'DELETE' });
      invalidateCache('/api/collections');
      return result;
    },
    create: async (data) => {
      const result = await request('/api/collections', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      invalidateCache('/api/collections');
      return result;
    },
    update: async (id, data) => {
      const result = await request(`/api/collections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      invalidateCache('/api/collections');
      return result;
    },
    remove: async (id) => {
      const result = await request(`/api/collections/${id}`, { method: 'DELETE' });
      invalidateCache('/api/collections');
      return result;
    },
  },

  admin: {
    pendingWallpapers: async () => {
      const cached = getCached('/api/admin/moderation/pending');
      if (cached) return cached;
      const data = await request('/api/admin/moderation/pending');
      setCache('/api/admin/moderation/pending', null, data, 60 * 1000);
      return data;
    },
    approveWallpaper: async (id, { collectionId } = {}) => {
      const res = await request(`/api/admin/moderation/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ collectionId }),
      });
      invalidateCache('/api/admin/moderation');
      invalidateCache('/api/wallpapers');
      return res;
    },
    rejectWallpaper: async (id, { reason } = {}) => {
      const res = await request(`/api/admin/moderation/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      invalidateCache('/api/admin/moderation');
      invalidateCache('/api/wallpapers');
      return res;
    },
    listUsers: async ({ q = '', page = 1, limit = 15, force = false } = {}) => {
      if (force) {
        invalidateCache('/api/admin/users');
      }
      const params = { q: q ? q.trim() : '', page, limit };
      if (!force) {
        const cached = getCached('/api/admin/users', params);
        if (cached) return cached;
      }
      const qs = new URLSearchParams();
      if (q && q.trim()) qs.set('q', q.trim());
      qs.set('page', page);
      qs.set('limit', limit);
      if (force) qs.set('force', 'true');
      const data = await request(`/api/admin/users?${qs.toString()}`);
      setCache('/api/admin/users', params, data, 60 * 1000);
      return data;
    },
    updateRole: async (id, role) => {
      const res = await request(`/api/admin/users/${encodeURIComponent(id)}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      invalidateCache('/api/admin/users');
      return res;
    },
    updateUserRole: async (id, role) => {
      const res = await request(`/api/admin/users/${encodeURIComponent(id)}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      invalidateCache('/api/admin/users');
      return res;
    },
    updateVerification: async (id, isVerified) => {
      const res = await request(`/api/admin/users/${encodeURIComponent(id)}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ isVerified }),
      });
      invalidateCache('/api/admin/users');
      invalidateCache('/api/wallpapers');
      return res;
    },
    updateUserVerification: async (id, isVerified) => {
      const res = await request(`/api/admin/users/${encodeURIComponent(id)}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ isVerified }),
      });
      invalidateCache('/api/admin/users');
      invalidateCache('/api/wallpapers');
      return res;
    },
    assignCollection: async (id, collectionId) => {
      const res = await request(`/api/admin/users/${encodeURIComponent(id)}/collection`, {
        method: 'PATCH',
        body: JSON.stringify({ collectionId }),
      });
      invalidateCache('/api/admin/users');
      invalidateCache('/api/collections');
      return res;
    },
    assignUserCollection: async (id, collectionId) => {
      const res = await request(`/api/admin/users/${encodeURIComponent(id)}/collection`, {
        method: 'PATCH',
        body: JSON.stringify({ collectionId }),
      });
      invalidateCache('/api/admin/users');
      invalidateCache('/api/collections');
      return res;
    },
    deleteUser: async (id) => {
      const res = await request(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
      invalidateCache('/api/admin/users');
      invalidateCache('/api/wallpapers');
      return res;
    },
    deleteUserAccount: async (id) => {
      const res = await request(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
      invalidateCache('/api/admin/users');
      invalidateCache('/api/wallpapers');
      return res;
    },
    getFirestoreMetrics: async (params = {}) => {
      const qs = new URLSearchParams();
      if (params.forceStorage) qs.set('forceStorage', 'true');
      if (params.forceStats) qs.set('forceStats', 'true');
      const queryString = qs.toString() ? `?${qs.toString()}` : '';
      if (!params.forceStorage && !params.forceStats) {
        const cached = getCached('/api/admin/metrics/firestore');
        if (cached) return cached;
        const data = await request(`/api/admin/metrics/firestore${queryString}`);
        setCache('/api/admin/metrics/firestore', null, data, 30 * 1000);
        return data;
      }
      const data = await request(`/api/admin/metrics/firestore${queryString}`);
      setCache('/api/admin/metrics/firestore', null, data, 30 * 1000);
      return data;
    },
    refreshStorageMetrics: async () => {
      const res = await request('/api/admin/metrics/storage/refresh', { method: 'POST' });
      invalidateCache('/api/admin/metrics');
      return res;
    },
    resetFirestoreMetrics: async () => {
      const res = await request('/api/admin/metrics/firestore/reset', { method: 'POST' });
      invalidateCache('/api/admin/metrics');
      return res;
    },
    rebuildTagsMetadata: async () => {
      const res = await request('/api/admin/metadata/rebuild-tags', { method: 'POST' });
      invalidateCache('/api/wallpapers');
      return res;
    },
    verifyAuth: async () => {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true).catch(() => {});
      }
      return request('/api/admin/auth/verify', { method: 'POST' });
    },
  },

  favorites: {
    list: async () => {
      const cached = getCached('/api/favorites');
      if (cached) return cached;
      const data = await request('/api/favorites');
      setCache('/api/favorites', null, data, 2 * 60 * 1000);
      return data;
    },
    add: async (wallpaperId) => {
      const result = await request(`/api/favorites/${wallpaperId}`, { method: 'POST' });
      invalidateCache('/api/favorites');
      return result;
    },
    remove: async (wallpaperId) => {
      const result = await request(`/api/favorites/${wallpaperId}`, { method: 'DELETE' });
      invalidateCache('/api/favorites');
      return result;
    },
  },

  profile: {
    get: async () => {
      const cached = getCached('/api/wallpapers/profile');
      if (cached) return cached;
      const data = await request('/api/wallpapers/profile');
      setCache('/api/wallpapers/profile', null, data, 2 * 60 * 1000);
      return data;
    },
    updatePreferences: async (preferences) => {
      const res = await request('/api/wallpapers/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ preferences }),
      });
      invalidateCache('/api/wallpapers/profile');
      return res;
    },
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


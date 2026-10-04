const DB_NAME = 'spartan_upload_queue';
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveQueueItemDb(item) {
  try {
    const db = await openDb();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('items', 'readwrite');
      const store = tx.objectStore('items');
      const dataToStore = {
        id: item.id,
        file: item.file,
        sizeFormatted: item.sizeFormatted,
        extension: item.extension,
        title: item.title,
        status: item.status,
        error: item.error || null,
        order: item.order ?? Date.now(),
      };
      const req = store.put(dataToStore);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

export async function saveAllQueueItemsDb(items) {
  try {
    const db = await openDb();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('items', 'readwrite');
      const store = tx.objectStore('items');
      store.clear();
      items.forEach((item, index) => {
        store.put({
          id: item.id,
          file: item.file,
          sizeFormatted: item.sizeFormatted,
          extension: item.extension,
          title: item.title,
          status: item.status,
          error: item.error || null,
          order: index,
        });
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return undefined;
  }
}

export async function deleteQueueItemDb(id) {
  try {
    const db = await openDb();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('items', 'readwrite');
      const store = tx.objectStore('items');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

export async function clearQueueDb() {
  try {
    const db = await openDb();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['items', 'metadata'], 'readwrite');
      tx.objectStore('items').clear();
      tx.objectStore('metadata').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return undefined;
  }
}

export async function saveQueueMetaDb(key, value) {
  try {
    const db = await openDb();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('metadata', 'readwrite');
      const store = tx.objectStore('metadata');
      const req = store.put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

export async function loadQueueFromDb() {
  try {
    const db = await openDb();
    if (!db) return { items: [], meta: {} };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['items', 'metadata'], 'readonly');
      const itemsStore = tx.objectStore('items');
      const metaStore = tx.objectStore('metadata');

      const itemsReq = itemsStore.getAll();
      const metaReq = metaStore.getAll();

      tx.oncomplete = () => {
        const rawItems = itemsReq.result || [];
        rawItems.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const metaMap = {};
        (metaReq.result || []).forEach((row) => {
          metaMap[row.key] = row.value;
        });

        resolve({ items: rawItems, meta: metaMap });
      };

      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return { items: [], meta: {} };
  }
}

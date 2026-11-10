// IndexedDB Media Storage for Gym Owner Workout Videos & Blobs
// Persists large MP4 / WebM / QuickTime files across refreshes without hitting localStorage quota

const DB_NAME = 'titanfit_media_db';
const STORE_NAME = 'workout_videos';
const DB_VERSION = 1;

// Fast in-memory cache for instant zero-latency playback in current session
const inMemoryBlobs = new Map<string, Blob>();
const inMemoryUrls = new Map<string, string>();

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in current environment'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaBlob(key: string, blob: Blob): Promise<void> {
  // 1. Cache immediately in memory with a fresh object URL
  inMemoryBlobs.set(key, blob);
  if (typeof window !== 'undefined' && window.URL) {
    try {
      const liveUrl = URL.createObjectURL(blob);
      inMemoryUrls.set(key, liveUrl);
    } catch {
      /* ignore */
    }
  }

  // 2. Persist to IndexedDB for longevity across refreshes
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[MediaStorage] Failed to save media blob to IndexedDB:', err);
  }
}

export async function getMediaBlob(key: string): Promise<Blob | null> {
  if (inMemoryBlobs.has(key)) {
    return inMemoryBlobs.get(key) || null;
  }
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const result = req.result || null;
        if (result instanceof Blob) {
          inMemoryBlobs.set(key, result);
        }
        resolve(result);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function getMediaUrl(key: string): Promise<string | null> {
  if (inMemoryUrls.has(key)) {
    return inMemoryUrls.get(key)!;
  }
  const blob = await getMediaBlob(key);
  if (!blob) return null;
  if (typeof window !== 'undefined' && window.URL) {
    try {
      const url = URL.createObjectURL(blob);
      inMemoryUrls.set(key, url);
      return url;
    } catch {
      return null;
    }
  }
  return null;
}

export async function deleteMediaBlob(key: string): Promise<void> {
  inMemoryBlobs.delete(key);
  inMemoryUrls.delete(key);
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    /* ignore */
  }
}

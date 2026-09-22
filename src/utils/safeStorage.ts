/**
 * Utilitário de Armazenamento Seguro e Isolamento de Quota (SEIE - Sergipe 2026)
 * - LocalStorage: estritamente reservado para chaves leves (preferências, tema, filtros de UI).
 * - IndexedDB: destino exclusivo para coletas pesadas, microdados, bases TSE e registros eleitorais.
 */

// Chaves leves expressamente permitidas no LocalStorage
const ALLOWED_LOCAL_STORAGE_PREFIXES = [
  "seie-theme",
  "seie-active-tab",
  "seie-filter-",
  "seie-pref-",
  "seie_ui_"
];

const MAX_LOCAL_STORAGE_VALUE_BYTES = 50 * 1024; // Limite rigoroso de 50 KB por chave

/**
 * Verifica se a chave é apropriada para armazenamento no LocalStorage
 */
export function isAllowedLocalStorageKey(key: string): boolean {
  return ALLOWED_LOCAL_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix) || key === prefix);
}

/**
 * Leitura resiliente do LocalStorage
 */
export function safeLocalStorageGet(key: string, defaultValue: string | null = null): string | null {
  if (typeof window === "undefined") return defaultValue;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : defaultValue;
  } catch (err) {
    console.warn(`[SafeStorage] Erro ao ler LocalStorage '${key}':`, err);
    return defaultValue;
  }
}

/**
 * Gravação com tratamento explícito de QuotaExceededError
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;

  // Proteção contra invasão de microdados pesados no LocalStorage
  const byteLength = new Blob([value]).size;
  if (byteLength > MAX_LOCAL_STORAGE_VALUE_BYTES) {
    console.error(
      `[SafeStorage] REJEITADO: A chave '${key}' possui ${Math.round(byteLength / 1024)} KB. ` +
      `Dados pesados devem ser persistidos exclusivamente no IndexedDB.`
    );
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaError =
      err.name === "QuotaExceededError" ||
      err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      err.code === 22 ||
      err.code === 1014;

    if (isQuotaError) {
      console.error(`[SafeStorage] QuotaExceededError detectado no LocalStorage ao gravar '${key}'. Limpando caches obsoletos.`);
      try {
        // Remove chaves temporárias obsoletas se existirem
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && !isAllowedLocalStorageKey(k)) {
            localStorage.removeItem(k);
          }
        }
      } catch {}
    } else {
      console.warn(`[SafeStorage] Falha ao persistir chave '${key}':`, err);
    }
    return false;
  }
}

export function safeLocalStorageRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Erro ao remover do LocalStorage '${key}':`, err);
  }
}

// -----------------------------------------------------------------------------
// IndexedDB Generic Store for Heavy Datasets & Microdata
// -----------------------------------------------------------------------------
const DB_NAME = "SEIE_HeavyData_Store";
const DB_VERSION = 1;
const STORE_NAME = "heavy_records";

function openHeavyDataDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      return reject(new Error("IndexedDB não disponível no ambiente atual."));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Salva registros pesados com segurança no IndexedDB
 */
export async function safeStoreHeavyData<T>(key: string, data: T): Promise<boolean> {
  try {
    const db = await openHeavyDataDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ key, data, updatedAt: new Date().toISOString() });
      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.error(`[SafeStorage IDB] Falha ao gravar chave '${key}':`, req.error);
        reject(req.error);
      };
    });
  } catch (err) {
    console.error(`[SafeStorage IDB] Erro ao salvar '${key}':`, err);
    return false;
  }
}

/**
 * Recupera registros pesados do IndexedDB
 */
export async function safeGetHeavyData<T>(key: string): Promise<T | null> {
  try {
    const db = await openHeavyDataDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const res = req.result;
        resolve(res ? res.data : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(`[SafeStorage IDB] Erro ao buscar '${key}':`, err);
    return null;
  }
}

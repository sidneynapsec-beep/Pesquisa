import { Poll } from "../types";
import { ParsedPollDataset } from "../utils/fileParser";
import { isValidPoll } from "../utils/pollValidation";

const DB_NAME = "seie_electoral_db";
const DB_VERSION = 1;
const STORE_RESEARCHES = "researches";
const STORE_DATASETS = "datasets";
const STORE_SETTINGS = "settings";

let dbInstance: IDBDatabase | null = null;
let initPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(new Error("IndexedDB não está disponível no ambiente atual."));
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_RESEARCHES)) {
          db.createObjectStore(STORE_RESEARCHES, { keyPath: "id" });
        }
        
        if (!db.objectStoreNames.contains(STORE_DATASETS)) {
          db.createObjectStore(STORE_DATASETS, { keyPath: "fileName" });
        }

        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
        }
      };

      request.onsuccess = (event: Event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        console.log("[RESEARCH STORAGE] Storage inicializado com sucesso (IndexedDB)");
        resolve(dbInstance);
      };

      request.onerror = (event: Event) => {
        const err = (event.target as IDBOpenDBRequest).error;
        console.error("[RESEARCH STORAGE] Erro ao abrir IndexedDB:", err);
        reject(err);
      };
    } catch (e) {
      console.error("[RESEARCH STORAGE] Exceção ao inicializar IndexedDB:", e);
      reject(e);
    }
  });

  return initPromise;
}

export const ResearchStorage = {
  /**
   * Salva ou atualiza uma pesquisa eleitoral permanentemente no IndexedDB
   */
  async saveResearch(research: Poll | any): Promise<void> {
    if (!research || !isValidPoll(research)) {
      console.warn("[RESEARCH STORAGE] Gravação de pesquisa em branco ou inválida bloqueada.");
      return;
    }

    const researchId =
      research.id ||
      research.codigo ||
      research.id_pesquisa ||
      (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `poll-${Date.now()}`);

    const persistedResearch: Poll = {
      ...research,
      id: researchId,
      persisted: true,
      createdAt: research.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const db = await getIDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_RESEARCHES, "readwrite");
        const store = tx.objectStore(STORE_RESEARCHES);
        const req = store.put(persistedResearch);

        req.onsuccess = () => {
          console.log("[RESEARCH STORAGE] Pesquisa salva:", researchId);
          resolve();
        };

        req.onerror = () => {
          console.error("[RESEARCH STORAGE] Falha ao salvar pesquisa:", req.error);
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn("[RESEARCH STORAGE] Falha no IndexedDB, tentando fallback local:", err);
      // Fallback para storage volátil caso IndexedDB falhe
      try {
        const existingStr = localStorage.getItem("seie_global_polls");
        const list: any[] = existingStr ? JSON.parse(existingStr) : [];
        const validList = list.filter(isValidPoll);
        const idx = validList.findIndex((p) => p.id === researchId);
        if (idx >= 0) {
          validList[idx] = persistedResearch;
        } else {
          validList.push(persistedResearch);
        }
        localStorage.setItem("seie_global_polls", JSON.stringify(validList));
      } catch (lsErr) {
        console.warn("[RESEARCH STORAGE] Fallback localStorage erro:", lsErr);
      }
    }
  },

  /**
   * Purgar permanentemente todas as pesquisas em branco, corrompidas ou de testes do IndexedDB e localStorage
   */
  async purgeInvalidResearches(): Promise<number> {
    let purgedCount = 0;
    try {
      const db = await getIDB();
      const all = await new Promise<any[]>((resolve) => {
        const tx = db.transaction(STORE_RESEARCHES, "readonly");
        const store = tx.objectStore(STORE_RESEARCHES);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      const invalid = all.filter((p) => !isValidPoll(p));
      if (invalid.length > 0) {
        await new Promise<void>((resolve) => {
          const tx = db.transaction(STORE_RESEARCHES, "readwrite");
          const store = tx.objectStore(STORE_RESEARCHES);
          for (const item of invalid) {
            if (item.id) store.delete(item.id);
          }
          tx.oncomplete = () => {
            purgedCount += invalid.length;
            console.log(`[RESEARCH STORAGE] Purgadas ${invalid.length} pesquisas em branco do IndexedDB.`);
            resolve();
          };
          tx.onerror = () => resolve();
        });
      }
    } catch (err) {
      console.warn("[RESEARCH STORAGE] Falha ao purgar do IndexedDB:", err);
    }

    // Limpar também do localStorage
    try {
      const existingStr = localStorage.getItem("seie_global_polls");
      if (existingStr) {
        const list: any[] = JSON.parse(existingStr);
        if (Array.isArray(list)) {
          const cleaned = list.filter(isValidPoll);
          if (cleaned.length !== list.length) {
            purgedCount += (list.length - cleaned.length);
            localStorage.setItem("seie_global_polls", JSON.stringify(cleaned));
            console.log(`[RESEARCH STORAGE] Purgadas ${list.length - cleaned.length} pesquisas em branco do localStorage.`);
          }
        }
      }
    } catch {}

    return purgedCount;
  },

  /**
   * Busca uma pesquisa por ID
   */
  async getResearch(id: string): Promise<Poll | null> {
    if (!id) return null;

    try {
      const db = await getIDB();
      return await new Promise<Poll | null>((resolve, reject) => {
        const tx = db.transaction(STORE_RESEARCHES, "readonly");
        const store = tx.objectStore(STORE_RESEARCHES);
        const req = store.get(id);

        req.onsuccess = () => {
          const res = req.result || null;
          resolve(res && isValidPoll(res) ? res : null);
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn("[RESEARCH STORAGE] Erro ao buscar pesquisa:", err);
      try {
        const existingStr = localStorage.getItem("seie_global_polls");
        if (existingStr) {
          const list: Poll[] = JSON.parse(existingStr);
          const found = list.find((p) => p.id === id);
          return found && isValidPoll(found) ? found : null;
        }
      } catch {}
      return null;
    }
  },

  /**
   * Recupera todas as pesquisas salvas no IndexedDB
   */
  async getAllResearches(): Promise<Poll[]> {
    try {
      const db = await getIDB();
      const savedResearches = await new Promise<Poll[]>((resolve, reject) => {
        const tx = db.transaction(STORE_RESEARCHES, "readonly");
        const store = tx.objectStore(STORE_RESEARCHES);
        const req = store.getAll();

        req.onsuccess = () => {
          const res = req.result || [];
          const valid = res.filter(isValidPoll);
          console.log("[RESEARCH STORAGE] Pesquisas recuperadas válidas:", valid.length);
          resolve(valid);
        };

        req.onerror = () => {
          console.error("[RESEARCH STORAGE] Erro ao recuperar pesquisas:", req.error);
          reject(req.error);
        };
      });

      return savedResearches;
    } catch (err) {
      console.warn("[RESEARCH STORAGE] Fallback para localStorage em getAllResearches:", err);
      try {
        const existingStr = localStorage.getItem("seie_global_polls");
        if (existingStr) {
          const list: Poll[] = JSON.parse(existingStr);
          if (Array.isArray(list)) {
            const valid = list.filter(isValidPoll);
            console.log("[RESEARCH STORAGE] Pesquisas recuperadas (via localStorage fallback):", valid.length);
            return valid;
          }
        }
      } catch {}
      return [];
    }
  },

  /**
   * Atualiza uma pesquisa existente
   */
  async updateResearch(research: Poll | any): Promise<void> {
    return this.saveResearch(research);
  },

  /**
   * Exclui uma pesquisa permanentemente por ID
   */
  async deleteResearch(researchId: string): Promise<void> {
    if (!researchId) return;

    try {
      const db = await getIDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_RESEARCHES, "readwrite");
        const store = tx.objectStore(STORE_RESEARCHES);
        const req = store.delete(researchId);

        req.onsuccess = () => {
          console.log("[RESEARCH STORAGE] Pesquisa excluída:", researchId);
          resolve();
        };

        req.onerror = () => {
          console.error("[RESEARCH STORAGE] Erro ao excluir pesquisa:", req.error);
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn("[RESEARCH STORAGE] Erro ao excluir pesquisa via IndexedDB:", err);
    }

    // Limpa também do localStorage de contingência se existir
    try {
      const existingStr = localStorage.getItem("seie_global_polls");
      if (existingStr) {
        const list: Poll[] = JSON.parse(existingStr);
        const filtered = list.filter((p) => p.id !== researchId);
        localStorage.setItem("seie_global_polls", JSON.stringify(filtered));
      }
    } catch {}
  },

  /**
   * Salva um dataset parsed completo (com microdados e cruzamentos territoriais)
   */
  async saveDataset(dataset: ParsedPollDataset): Promise<void> {
    if (!dataset || !dataset.fileName) return;

    try {
      const db = await getIDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_DATASETS, "readwrite");
        const store = tx.objectStore(STORE_DATASETS);
        const req = store.put(dataset);

        req.onsuccess = () => {
          console.log("[RESEARCH STORAGE] Dataset salvo:", dataset.fileName);
          resolve();
        };

        req.onerror = () => {
          console.error("[RESEARCH STORAGE] Erro ao salvar dataset:", req.error);
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn("[RESEARCH STORAGE] Falha ao persistir dataset no IndexedDB:", err);
    }
  },

  /**
   * Recupera todos os datasets com microdados
   */
  async getAllDatasets(): Promise<ParsedPollDataset[]> {
    try {
      const db = await getIDB();
      return await new Promise<ParsedPollDataset[]>((resolve, reject) => {
        const tx = db.transaction(STORE_DATASETS, "readonly");
        const store = tx.objectStore(STORE_DATASETS);
        const req = store.getAll();

        req.onsuccess = () => {
          const res = req.result || [];
          console.log("[RESEARCH STORAGE] Datasets recuperados:", res.length);
          resolve(res);
        };

        req.onerror = () => {
          console.error("[RESEARCH STORAGE] Erro ao recuperar datasets:", req.error);
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn("[RESEARCH STORAGE] Falha ao obter datasets:", err);
      return [];
    }
  },

  /**
   * Exclui um dataset
   */
  async deleteDataset(fileNameOrId: string): Promise<void> {
    if (!fileNameOrId) return;

    try {
      const db = await getIDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_DATASETS, "readwrite");
        const store = tx.objectStore(STORE_DATASETS);
        const req = store.delete(fileNameOrId);

        req.onsuccess = () => {
          console.log("[RESEARCH STORAGE] Dataset excluído:", fileNameOrId);
          resolve();
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn("[RESEARCH STORAGE] Erro ao excluir dataset:", err);
    }
  },

  /**
   * Exporta backup completo de todas as pesquisas e microdados em formato JSON
   */
  async exportBackup(): Promise<string> {
    const researches = await this.getAllResearches();
    const datasets = await this.getAllDatasets();

    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      system: "Sistema Especialista em Inteligência Eleitoral (SEIE)",
      researches,
      datasets
    };

    return JSON.stringify(backupData, null, 2);
  },

  /**
   * Importa backup completo restaurando as pesquisas e microdados
   */
  async importBackup(jsonContent: string): Promise<{ researchesCount: number; datasetsCount: number }> {
    if (!jsonContent) throw new Error("Conteúdo do arquivo de backup vazio.");

    const parsed = JSON.parse(jsonContent);
    const researches: Poll[] = Array.isArray(parsed.researches) ? parsed.researches : [];
    const datasets: ParsedPollDataset[] = Array.isArray(parsed.datasets) ? parsed.datasets : [];

    for (const r of researches) {
      await this.saveResearch(r);
    }

    for (const d of datasets) {
      await this.saveDataset(d);
    }

    return {
      researchesCount: researches.length,
      datasetsCount: datasets.length
    };
  }
};

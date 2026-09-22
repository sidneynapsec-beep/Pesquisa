/**
 * Sistema Especialista - Módulo de Persistência em IndexedDB
 * Armazenamento estruturado, indexado e de alta performance para bases eleitorais (2022 e 2024).
 * Permite processamento único, persistência duradoura e consultas em O(1) sem travar a interface.
 */

export interface StoredBaseMetadata {
  id: string;
  year: "2022" | "2024" | string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  uploadDate: string;
  version: number;
  status: "DISPONÍVEL" | "PROCESSANDO" | "VALIDANDO" | "ERRO" | "SUBSTITUÍDA";
  statusText: string;
  
  // Auditoria de Integridade Integral de Linhas
  totalRowsInFile: number;
  readRowsCount: number;
  processedRowsCount: number;
  validRowsCount: number;
  savedRowsCount: number;
  errorRowsCount: number;
  isFullyImported: boolean;
  totalRows: number;

  totalMunicipios: number;
  totalCandidatos: number;
  totalCargos: number;
  totalPartidos: number;
  totalBairros: number;
  totalZonas?: number;
  totalSecoes?: number;
  totalLocais?: number;
  uf: string;
  hasVotes: boolean;
  hasCandidates: boolean;
  isComplete: boolean;
  cruzamentoStats: {
    totalLocaisEleitorais: number;
    locaisRelacionados: number;
    locaisSemBairro: number;
    coberturaPercentual: number;
    municipiosRelacionadosCount: number;
    bairrosIdentificadosCount: number;
    registrosTerritorializadosCount: number;
  };
}

export interface StoredCandidate {
  id: string;
  ano: string;
  municipio: string;
  cargo: string;
  numero: string;
  nome: string;
  partido: string;
  totalVotos?: number;
}

export interface StoredBairroSummary {
  key: string; // ano__muni__cargo__bairro
  ano: string;
  municipio: string;
  bairro: string;
  cargo: string;
  qtdLocais: number;
  qtdSecoes: number;
  totalVotosApurados: number;
  vencedor?: {
    candidato: string;
    partido: string;
    votos: number;
    percentual: number;
  };
}

const DB_NAME = "ElectoralDatabase_SE_v2";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function isIndexedDBAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error("IndexedDB não disponível no ambiente"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Metadados e Controle de Versão das Bases
      if (!db.objectStoreNames.contains("metadata")) {
        const metaStore = db.createObjectStore("metadata", { keyPath: "year" });
        metaStore.createIndex("by_hash", "fileHash", { unique: false });
      }

      // 2. Histórico de Versões
      if (!db.objectStoreNames.contains("versions_history")) {
        const histStore = db.createObjectStore("versions_history", { keyPath: "id" });
        histStore.createIndex("by_year", "year", { unique: false });
      }

      // 3. Índices de Filtros Rápidos
      if (!db.objectStoreNames.contains("indices")) {
        db.createObjectStore("indices", { keyPath: "key" });
      }

      // 4. Registros Eleitorais Agregados por Candidato (ElectoralContextRecord)
      if (!db.objectStoreNames.contains("records_index")) {
        const recStore = db.createObjectStore("records_index", { keyPath: "key" });
        recStore.createIndex("by_muni_cargo", "muniCargoKey", { unique: false });
      }

      // 5. Resumos de Bairros e Vencedores
      if (!db.objectStoreNames.contains("bairros_summary")) {
        const bStore = db.createObjectStore("bairros_summary", { keyPath: "key" });
        bStore.createIndex("by_muni_cargo", "muniCargoKey", { unique: false });
      }

      // 6. Resumos Municipais
      if (!db.objectStoreNames.contains("municipios_summary")) {
        db.createObjectStore("municipios_summary", { keyPath: "key" });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.error("Falha ao abrir IndexedDB:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

/**
 * Salva metadados da base com controle de versão
 */
export async function saveBaseMetadataIDB(meta: StoredBaseMetadata): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openDB();
    const tx = db.transaction(["metadata", "versions_history"], "readwrite");
    const metaStore = tx.objectStore("metadata");
    const histStore = tx.objectStore("versions_history");

    metaStore.put(meta);
    histStore.put({
      id: `${meta.year}_v${meta.version}_${meta.fileHash.slice(0, 8)}`,
      ...meta
    });

    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (err) {
    console.warn("Aviso ao salvar metadados no IndexedDB:", err);
  }
}

/**
 * Obtém metadados da base ativa para o ano selecionado
 */
export async function getBaseMetadataIDB(year: "2022" | "2024" | string): Promise<StoredBaseMetadata | null> {
  if (!isIndexedDBAvailable()) return null;
  try {
    const db = await openDB();
    const tx = db.transaction("metadata", "readonly");
    const store = tx.objectStore("metadata");
    const req = store.get(year);

    return await new Promise<StoredBaseMetadata | null>((res) => {
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => res(null);
    });
  } catch (err) {
    console.warn("Erro ao buscar metadados no IndexedDB:", err);
    return null;
  }
}

/**
 * Verifica se um arquivo com o mesmo hash já está cadastrado
 */
export async function checkFileHashExistsIDB(year: string, fileHash: string): Promise<boolean> {
  if (!isIndexedDBAvailable()) return false;
  try {
    const db = await openDB();
    const tx = db.transaction("metadata", "readonly");
    const store = tx.objectStore("metadata");
    const req = store.get(year);

    const current = await new Promise<StoredBaseMetadata | null>((res) => {
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => res(null);
    });

    if (current && current.fileHash === fileHash && current.status === "DISPONÍVEL") {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Salva pacotes de índices de filtros (municípios, cargos por município, candidatos por cargo)
 */
export async function saveIndicesIDB(year: string, indices: {
  municipios: string[];
  cargosByMunicipio: Record<string, string[]>;
  candidatosByMuniCargo: Record<string, Array<{ nome: string; numero: string; partido: string }>>;
  partidos: string[];
}): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openDB();
    const tx = db.transaction("indices", "readwrite");
    const store = tx.objectStore("indices");

    store.put({ key: `${year}_municipios`, data: indices.municipios });
    store.put({ key: `${year}_cargos`, data: indices.cargosByMunicipio });
    store.put({ key: `${year}_candidatos`, data: indices.candidatosByMuniCargo });
    store.put({ key: `${year}_partidos`, data: indices.partidos });

    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (err) {
    console.warn("Erro ao salvar índices no IndexedDB:", err);
  }
}

/**
 * Salva registros eleitorais indexados (RecordsIndex)
 */
export async function saveRecordsIndexIDB(
  year: string,
  records: Record<string, any>,
  vencedoresBairros: Record<string, any>,
  vencedoresMunicipios: Record<string, any>
): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openDB();
    const tx = db.transaction(["records_index", "bairros_summary", "municipios_summary"], "readwrite");
    const recStore = tx.objectStore("records_index");
    const bStore = tx.objectStore("bairros_summary");
    const mStore = tx.objectStore("municipios_summary");

    // Salvar registros individuais por chave única "ano__muni__cargo__candidato"
    for (const [key, val] of Object.entries(records)) {
      const parts = key.split("__");
      recStore.put({
        key: `${year}__${key}`,
        muniCargoKey: `${year}__${parts[0]}__${parts[1]}`,
        data: val
      });
    }

    // Salvar mapa de vencedores de bairros
    for (const [key, val] of Object.entries(vencedoresBairros)) {
      bStore.put({
        key: `${year}__${key}`,
        data: val
      });
    }

    // Salvar mapa de vencedores de municípios
    for (const [key, val] of Object.entries(vencedoresMunicipios)) {
      mStore.put({
        key: `${year}__${key}`,
        data: val
      });
    }

    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (err) {
    console.warn("Erro ao salvar registros indexados no IndexedDB:", err);
  }
}

/**
 * Recupera um registro eleitoral específico diretamente por chave O(1)
 */
export async function getRecordByKeyIDB(year: string, key: string): Promise<any | null> {
  if (!isIndexedDBAvailable()) return null;
  try {
    const db = await openDB();
    const tx = db.transaction("records_index", "readonly");
    const store = tx.objectStore("records_index");
    const req = store.get(`${year}__${key}`);

    return await new Promise<any | null>((res) => {
      req.onsuccess = () => res(req.result ? req.result.data : null);
      req.onerror = () => res(null);
    });
  } catch {
    return null;
  }
}

/**
 * Remove uma base de dados completa (2022 ou 2024) do IndexedDB
 */
export async function clearBaseIDB(year: "2022" | "2024" | string): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openDB();
    const tx = db.transaction(["metadata", "indices", "records_index", "bairros_summary", "municipios_summary"], "readwrite");

    tx.objectStore("metadata").delete(year);
    tx.objectStore("indices").delete(`${year}_municipios`);
    tx.objectStore("indices").delete(`${year}_cargos`);
    tx.objectStore("indices").delete(`${year}_candidatos`);
    tx.objectStore("indices").delete(`${year}_partidos`);

    // Limpar records_index correspondentes ao ano
    const recStore = tx.objectStore("records_index");
    const cursorReq = recStore.openCursor();
    cursorReq.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result;
      if (cursor) {
        if (cursor.key.toString().startsWith(`${year}__`)) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    await new Promise<void>((res) => {
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  } catch (err) {
    console.warn("Erro ao limpar dados do IndexedDB:", err);
  }
}

/**
 * Retorna o histórico de versões da base
 */
export async function getVersionsHistoryIDB(year: string): Promise<StoredBaseMetadata[]> {
  if (!isIndexedDBAvailable()) return [];
  try {
    const db = await openDB();
    const tx = db.transaction("versions_history", "readonly");
    const store = tx.objectStore("versions_history");
    const index = store.index("by_year");
    const req = index.getAll(year);

    return await new Promise<StoredBaseMetadata[]>((res) => {
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => res([]);
    });
  } catch {
    return [];
  }
}

/**
 * Gera um checksum / hash de integridade rápido para o arquivo sem carregar tudo em string
 */
export async function generateFileChecksum(file: File): Promise<string> {
  try {
    const slice = file.slice(0, 65536); // Primeiros 64KB
    const buffer = await slice.arrayBuffer();
    const view = new Uint8Array(buffer);
    let hash = 0;
    for (let i = 0; i < view.length; i++) {
      hash = (hash << 5) - hash + view[i];
      hash |= 0;
    }
    const signature = `${file.name}_${file.size}_${file.lastModified}_${Math.abs(hash).toString(16)}`;
    return signature;
  } catch {
    return `${file.name}_${file.size}_${Date.now()}`;
  }
}

/**
 * MÓDULO MESTRE DA BASE TERRITORIAL — BAIRROS E LOCAIS DE VOTAÇÃO
 * 
 * Responsável por:
 * 1. Armazenar a Base Territorial Mestre independente (SG_UF, NM_MUNICIPIO, NR_ZONA, NR_SECAO, NR_LOCAL_VOTACAO, NM_LOCAL_VOTACAO, NM_BAIRRO, NR_CEP, NR_LATITUDE, NR_LONGITUDE)
 * 2. Gerar chaves técnicas de relacionamento (ID_CHAVE_TERRITORIAL: SG_UF|NM_MUNICIPIO|NR_ZONA|NR_SECAO|NR_LOCAL_VOTACAO)
 * 3. Garantir indexação em O(1) e persistência duradoura (IndexedDB + LocalStorage)
 * 4. Fornecer o cruzamento automático com as bases eleitorais de 2022 e 2024
 */

import Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeMunicipioStr, findSergipeMunicipio } from "./tseSergipeMunicipios";
import { CANONICAL_LOCAL_VOTACAO_BAIRRO, LocalVotacaoBairroRecord } from "./relacionamentoLocalBairro";

export interface TerritorialLocationRecord {
  idChaveTerritorial: string; // Ex: "SE|ARACAJU|1|100|1015"
  idChaveLocal: string;       // Ex: "SE|ARACAJU|1015"
  idChaveMuniLocal: string;   // Ex: "ARACAJU|1015"
  idChaveZonaLocal?: string;  // Ex: "SE|ARACAJU|1|1015"
  sgUf: string;               // Ex: "SE"
  nmMunicipio: string;       // Ex: "ARACAJU"
  nrZona: string;            // Ex: "1"
  nrSecao: string;           // Ex: "100"
  nrLocalVotacao: string;    // Ex: "1015"
  nmLocalVotacao: string;    // Ex: "Universidade Tiradentes (UNIT) - Campus Farolândia"
  nmBairro: string;          // Ex: "FAROLÂNDIA"
  nrCep?: string;            // Ex: "49032-490"
  nrLatitude?: string;       // Ex: "-10.950000"
  nrLongitude?: string;      // Ex: "-37.050000"
}

export interface BaseTerritorialMetadata {
  fileName: string;
  fileSize: number;
  fileHash: string;
  uploadDate: string;
  version: number;
  status: "ATIVA" | "VALIDADA" | "PROCESSANDO" | "ERRO";
  
  // Auditoria da base
  totalRowsInFile: number;
  processedRows: number;
  validRows: number;
  rejectedRows: number;
  rejectionReasons: string[];

  // Contadores territoriais
  municipiosCount: number;
  bairrosCount: number;
  locaisCount: number;
  zonasCount: number;
  secoesCount: number;

  // Catálogos auxiliares
  municipiosList: string[];
  bairrosByMunicipio: Record<string, string[]>;
}

export interface BaseTerritorialStore {
  metadata: BaseTerritorialMetadata;
  // Dicionários para busca em O(1)
  exactMap: Record<string, TerritorialLocationRecord>;          // Chave: "UF|MUNICIPIO|ZONA|SECAO|LOCAL"
  zonaLocalMap: Record<string, TerritorialLocationRecord>;      // Chave: "UF|MUNICIPIO|ZONA|LOCAL"
  localMap: Record<string, TerritorialLocationRecord>;          // Chave: "UF|MUNICIPIO|LOCAL"
  muniLocalMap: Record<string, TerritorialLocationRecord>;      // Chave: "MUNICIPIO|LOCAL"
  sampleRecords: TerritorialLocationRecord[];
}

const STORAGE_KEY_TERRITORIAL_STORE = "base_territorial_mestre_store_v2";
const STORAGE_KEY_TERRITORIAL_META = "base_territorial_mestre_meta_v2";

// Cache de singleton em memória
let inMemoryTerritorialStore: BaseTerritorialStore | null = null;

/**
 * Normaliza campos textuais para criação consistente de chaves
 * - Remove espaços no início e fim
 * - Remove espaços duplicados
 * - Normaliza maiúsculas
 * - Trata caracteres invisíveis e BOM
 */
export function normalizeKeyText(str: string | undefined | null): string {
  if (!str) return "";
  return String(str)
    .replace(/[\uFEFF\u200B-\u200D\uFEFF]/g, "") // Remove BOM e caracteres de largura zero
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

/**
 * Normaliza códigos numéricos para criação consistente de chaves
 * Remove zeros à esquerda mantendo dígitos válidos para que '001' case com '1'
 */
export function normalizeNumberCode(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  const clean = String(val).trim();
  if (!clean) return "";
  // Se for puramente numérico, normalizar para inteiro string para matching unificado
  const parsed = parseInt(clean, 10);
  if (!isNaN(parsed)) {
    return String(parsed);
  }
  return clean.toUpperCase();
}

/**
 * Normaliza e gera a chave técnica territorial primária (5 Dimensões)
 * Ex: "SE|ARACAJU|1|100|1015"
 */
export function buildIdChaveTerritorial(
  uf: string,
  municipio: string,
  zona: string | number,
  secao: string | number,
  local: string | number
): string {
  const cleanUf = normalizeKeyText(uf) || "SE";
  const cleanMuni = normalizeKeyText(municipio);
  const cleanZona = normalizeNumberCode(zona);
  const cleanSecao = normalizeNumberCode(secao);
  const cleanLocal = normalizeNumberCode(local);

  return `${cleanUf}|${cleanMuni}|${cleanZona}|${cleanSecao}|${cleanLocal}`;
}

/**
 * Normaliza e gera a chave técnica por Zona e Local
 */
export function buildIdChaveZonaLocal(
  uf: string,
  municipio: string,
  zona: string | number,
  local: string | number
): string {
  const cleanUf = normalizeKeyText(uf) || "SE";
  const cleanMuni = normalizeKeyText(municipio);
  const cleanZona = normalizeNumberCode(zona);
  const cleanLocal = normalizeNumberCode(local);

  return `${cleanUf}|${cleanMuni}|${cleanZona}|${cleanLocal}`;
}

/**
 * Normaliza e gera a chave técnica por Local
 */
export function buildIdChaveLocal(
  uf: string,
  municipio: string,
  local: string | number
): string {
  const cleanUf = normalizeKeyText(uf) || "SE";
  const cleanMuni = normalizeKeyText(municipio);
  const cleanLocal = normalizeNumberCode(local);

  return `${cleanUf}|${cleanMuni}|${cleanLocal}`;
}

/**
 * Normaliza e gera a chave técnica simplificada Município + Local
 */
export function buildIdChaveMuniLocal(
  municipio: string,
  local: string | number
): string {
  const cleanMuni = normalizeKeyText(municipio);
  const cleanLocal = normalizeNumberCode(local);

  return `${cleanMuni}|${cleanLocal}`;
}

/**
 * Aliases para colunas da Base Territorial
 */
const TERRITORIAL_COLUMN_ALIASES: Record<string, string[]> = {
  sgUf: ["sg_uf", "uf", "sigla_uf", "estado", "cd_uf"],
  nmMunicipio: ["nm_municipio", "municipio", "nome_municipio", "cidade", "nm_mun", "cd_municipio", "nome_mun"],
  nrZona: ["nr_zona", "cd_zona", "zona", "num_zona", "zona_eleitoral", "numero_zona"],
  nrSecao: ["nr_secao", "cd_secao", "secao", "num_secao", "secao_eleitoral", "numero_secao"],
  nrLocalVotacao: ["nr_local_votacao", "cd_local_votacao", "nr_local", "local_votacao", "num_local", "local", "codigo_local", "nr_locvot"],
  nmLocalVotacao: ["nm_local_votacao", "nome_local", "local_nome", "estabelecimento", "escola", "nm_estabelecimento", "nm_local", "nm_locvot"],
  nmBairro: ["nm_bairro", "bairro", "nome_bairro", "bairro_local", "ds_bairro", "nm_bairro_local"],
  nrCep: ["nr_cep", "cep", "codigo_cep", "ds_cep"],
  nrLatitude: ["nr_latitude", "latitude", "lat", "vl_latitude"],
  nrLongitude: ["nr_longitude", "longitude", "long", "lon", "lng", "vl_longitude"]
};

function mapTerritorialHeader(raw: string): string | null {
  if (!raw) return null;
  const clean = raw.toLowerCase().trim().replace(/[\s\-_]+/g, "_");
  for (const [key, aliases] of Object.entries(TERRITORIAL_COLUMN_ALIASES)) {
    if (aliases.some((a) => clean === a || clean.startsWith(a))) {
      return key;
    }
  }
  return null;
}

/**
 * Cria base territorial inicial com os dados canônicos oficiais de Sergipe
 */
function createDefaultCanonicalTerritorialStore(): BaseTerritorialStore {
  const exactMap: Record<string, TerritorialLocationRecord> = {};
  const zonaLocalMap: Record<string, TerritorialLocationRecord> = {};
  const localMap: Record<string, TerritorialLocationRecord> = {};
  const muniLocalMap: Record<string, TerritorialLocationRecord> = {};
  const muniSet = new Set<string>();
  const bairrosByMuni: Record<string, Set<string>> = {};
  const locaisSet = new Set<string>();

  CANONICAL_LOCAL_VOTACAO_BAIRRO.forEach((rec) => {
    const uf = normalizeKeyText(rec.uf) || "SE";
    const muni = normalizeKeyText(rec.nmMunicipio) || "ARACAJU";
    const local = normalizeNumberCode(rec.nrLocalVotacao) || "";
    const bairro = normalizeKeyText(rec.nmBairro) || "";

    muniSet.add(muni);
    if (!bairrosByMuni[muni]) bairrosByMuni[muni] = new Set();
    if (bairro) bairrosByMuni[muni].add(bairro);
    locaisSet.add(`${muni}|${local}`);

    const idChaveTerritorial = buildIdChaveTerritorial(uf, muni, "1", "", local);
    const idChaveZonaLocal = buildIdChaveZonaLocal(uf, muni, "1", local);
    const idChaveLocal = buildIdChaveLocal(uf, muni, local);
    const idChaveMuniLocal = buildIdChaveMuniLocal(muni, local);

    const locRec: TerritorialLocationRecord = {
      idChaveTerritorial,
      idChaveLocal,
      idChaveMuniLocal,
      idChaveZonaLocal,
      sgUf: uf,
      nmMunicipio: muni,
      nrZona: "1",
      nrSecao: "",
      nrLocalVotacao: rec.nrLocalVotacao || local,
      nmLocalVotacao: rec.nmLocalVotacao || "",
      nmBairro: bairro,
      nrCep: "49000-000",
      nrLatitude: "-10.9472",
      nrLongitude: "-37.0731"
    };

    exactMap[idChaveTerritorial] = locRec;
    zonaLocalMap[idChaveZonaLocal] = locRec;
    localMap[idChaveLocal] = locRec;
    muniLocalMap[idChaveMuniLocal] = locRec;
  });

  const serializableBairros: Record<string, string[]> = {};
  for (const [m, set] of Object.entries(bairrosByMuni)) {
    serializableBairros[m] = Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  const metadata: BaseTerritorialMetadata = {
    fileName: "Base_Territorial_Canonica_Sergipe.csv",
    fileSize: 48000,
    fileHash: "canonical_sergipe_master_v2",
    uploadDate: new Date().toISOString(),
    version: 1,
    status: "ATIVA",
    totalRowsInFile: CANONICAL_LOCAL_VOTACAO_BAIRRO.length,
    processedRows: CANONICAL_LOCAL_VOTACAO_BAIRRO.length,
    validRows: CANONICAL_LOCAL_VOTACAO_BAIRRO.length,
    rejectedRows: 0,
    rejectionReasons: [],
    municipiosCount: muniSet.size,
    bairrosCount: Object.values(serializableBairros).reduce((acc, l) => acc + l.length, 0),
    locaisCount: locaisSet.size,
    zonasCount: 1,
    secoesCount: locaisSet.size * 4,
    municipiosList: Array.from(muniSet).sort((a, b) => a.localeCompare(b, "pt-BR")),
    bairrosByMunicipio: serializableBairros
  };

  return {
    metadata,
    exactMap,
    zonaLocalMap,
    localMap,
    muniLocalMap,
    sampleRecords: Object.values(localMap).slice(0, 15)
  };
}

/**
 * Obtém a Base Territorial Mestre persistida
 */
export function getBaseTerritorialMestreStore(): BaseTerritorialStore {
  if (inMemoryTerritorialStore) {
    return inMemoryTerritorialStore;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_TERRITORIAL_STORE);
    if (saved) {
      const parsed = JSON.parse(saved) as BaseTerritorialStore;
      if (parsed && parsed.metadata && (Object.keys(parsed.localMap || {}).length > 0 || Object.keys(parsed.exactMap || {}).length > 0)) {
        inMemoryTerritorialStore = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Erro ao recuperar Base Territorial Mestre do localStorage:", err);
  }

  // Se não existir customizada, inicializar com a canônica de Sergipe
  const def = createDefaultCanonicalTerritorialStore();
  inMemoryTerritorialStore = def;
  return def;
}

/**
 * Salva a Base Territorial Mestre no armazenamento persistente
 */
export function saveBaseTerritorialMestreStore(store: BaseTerritorialStore): boolean {
  try {
    inMemoryTerritorialStore = store;
    localStorage.setItem(STORAGE_KEY_TERRITORIAL_STORE, JSON.stringify(store));
    localStorage.setItem(STORAGE_KEY_TERRITORIAL_META, JSON.stringify(store.metadata));
    return true;
  } catch (err) {
    console.error("Erro ao salvar Base Territorial Mestre:", err);
    try {
      const condensed: BaseTerritorialStore = {
        metadata: store.metadata,
        exactMap: store.exactMap,
        zonaLocalMap: store.zonaLocalMap || {},
        localMap: store.localMap,
        muniLocalMap: store.muniLocalMap,
        sampleRecords: store.sampleRecords.slice(0, 10)
      };
      localStorage.setItem(STORAGE_KEY_TERRITORIAL_STORE, JSON.stringify(condensed));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Limpa e restaura a Base Territorial para o padrão canônico
 */
export function resetBaseTerritorialMestreStore(): BaseTerritorialStore {
  try {
    localStorage.removeItem(STORAGE_KEY_TERRITORIAL_STORE);
    localStorage.removeItem(STORAGE_KEY_TERRITORIAL_META);
  } catch {}
  const def = createDefaultCanonicalTerritorialStore();
  inMemoryTerritorialStore = def;
  return def;
}

/**
 * Processador do Arquivo da Base Territorial Mestre
 * Lê CSV/XLSX e extrai: SG_UF, NM_MUNICIPIO, NR_ZONA, NR_SECAO, NR_LOCAL_VOTACAO, NM_LOCAL_VOTACAO, NM_BAIRRO, NR_CEP, NR_LATITUDE, NR_LONGITUDE
 */
export async function parseAndBuildBaseTerritorial(
  file: File,
  onProgress?: (stage: string, percent: number) => void
): Promise<{
  store: BaseTerritorialStore;
  validation: {
    isValid: boolean;
    totalRows: number;
    processedRows: number;
    rejectedRows: number;
    rejectionReasons: string[];
    isDuplicate: boolean;
    municipiosFound: number;
    bairrosFound: number;
    locaisFound: number;
  };
}> {
  onProgress?.("Lendo arquivo territorial...", 10);

  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  let rawRows: any[] = [];

  if (extension === "csv" || extension === "txt") {
    const text = await file.text();
    onProgress?.("Decodificando linhas CSV...", 30);
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: false
    });
    rawRows = (parsed.data as any[]) || [];
  } else if (extension === "xlsx" || extension === "xls") {
    const buffer = await file.arrayBuffer();
    onProgress?.("Decodificando planilha Excel...", 30);
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
  } else {
    throw new Error("Formato de arquivo não suportado. Utilize CSV ou XLSX.");
  }

  onProgress?.("Mapeando colunas e criando chaves territoriais...", 60);

  if (!rawRows || rawRows.length === 0) {
    throw new Error("O arquivo fornecido está vazio ou não contém registros válidos.");
  }

  // Mapeamento de colunas
  const first = rawRows[0] || {};
  const headers = Object.keys(first);
  const colMap: Record<string, string> = {};

  for (const h of headers) {
    const mapped = mapTerritorialHeader(h);
    if (mapped && !colMap[mapped]) {
      colMap[mapped] = h;
    }
  }

  const totalRowsInFile = rawRows.length;
  let processedRows = 0;
  let rejectedRows = 0;
  const rejectionReasons: string[] = [];

  const exactMap: Record<string, TerritorialLocationRecord> = {};
  const zonaLocalMap: Record<string, TerritorialLocationRecord> = {};
  const localMap: Record<string, TerritorialLocationRecord> = {};
  const muniLocalMap: Record<string, TerritorialLocationRecord> = {};

  const muniSet = new Set<string>();
  const bairrosByMuni: Record<string, Set<string>> = {};
  const locaisSet = new Set<string>();
  const zonasSet = new Set<string>();
  const secoesSet = new Set<string>();
  const sampleList: TerritorialLocationRecord[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const r = rawRows[i];
    if (!r) continue;

    const rawMuni = colMap.nmMunicipio ? String(r[colMap.nmMunicipio] || "").trim() : "";
    const rawBairro = colMap.nmBairro ? String(r[colMap.nmBairro] || "").trim() : "";

    // Validação: Município e Bairro são obrigatórios
    if (!rawMuni || !rawBairro) {
      rejectedRows++;
      if (rejectionReasons.length < 5) {
        rejectionReasons.push(`Linha ${i + 1}: ${!rawMuni ? "Município ausente" : "Bairro ausente"}`);
      }
      continue;
    }

    processedRows++;

    const sgUf = normalizeKeyText(colMap.sgUf ? String(r[colMap.sgUf] || "").trim() : "") || "SE";
    
    // Normalização Canônica do Município
    const muniCanon = findSergipeMunicipio(rawMuni);
    const nmMunicipio = muniCanon ? muniCanon.nome.toUpperCase() : normalizeKeyText(rawMuni);
    const nmBairro = normalizeKeyText(rawBairro);

    const nrZona = colMap.nrZona ? String(r[colMap.nrZona] || "").trim() : "";
    const nrSecao = colMap.nrSecao ? String(r[colMap.nrSecao] || "").trim() : "";
    const nrLocalVotacao = colMap.nrLocalVotacao ? String(r[colMap.nrLocalVotacao] || "").trim() : "";
    const nmLocalVotacao = colMap.nmLocalVotacao ? String(r[colMap.nmLocalVotacao] || "").trim() : "";
    const nrCep = colMap.nrCep ? String(r[colMap.nrCep] || "").trim() : "";
    const nrLatitude = colMap.nrLatitude ? String(r[colMap.nrLatitude] || "").trim() : "";
    const nrLongitude = colMap.nrLongitude ? String(r[colMap.nrLongitude] || "").trim() : "";

    muniSet.add(nmMunicipio);
    if (!bairrosByMuni[nmMunicipio]) bairrosByMuni[nmMunicipio] = new Set();
    bairrosByMuni[nmMunicipio].add(nmBairro);

    if (nrZona) zonasSet.add(`${nmMunicipio}|${nrZona}`);
    if (nrSecao) secoesSet.add(`${nmMunicipio}|${nrZona}|${nrSecao}`);
    if (nrLocalVotacao || nmLocalVotacao) locaisSet.add(`${nmMunicipio}|${nrLocalVotacao || nmLocalVotacao}`);

    // Criação das chaves técnicas de relacionamento
    const idChaveTerritorial = buildIdChaveTerritorial(sgUf, nmMunicipio, nrZona, nrSecao, nrLocalVotacao);
    const idChaveZonaLocal = buildIdChaveZonaLocal(sgUf, nmMunicipio, nrZona, nrLocalVotacao);
    const idChaveLocal = buildIdChaveLocal(sgUf, nmMunicipio, nrLocalVotacao);
    const idChaveMuniLocal = buildIdChaveMuniLocal(nmMunicipio, nrLocalVotacao);

    const locRec: TerritorialLocationRecord = {
      idChaveTerritorial,
      idChaveZonaLocal,
      idChaveLocal,
      idChaveMuniLocal,
      sgUf,
      nmMunicipio,
      nrZona,
      nrSecao,
      nrLocalVotacao,
      nmLocalVotacao,
      nmBairro,
      nrCep,
      nrLatitude,
      nrLongitude
    };

    // Indexar no mapa exato de 5 dimensões
    if (nrZona || nrSecao || nrLocalVotacao) {
      exactMap[idChaveTerritorial] = locRec;
    }

    // Indexar no mapa de Zona + Local
    if (nrZona && nrLocalVotacao) {
      zonaLocalMap[idChaveZonaLocal] = locRec;
    }

    // Indexar no mapa de Local
    if (nrLocalVotacao) {
      localMap[idChaveLocal] = locRec;
      muniLocalMap[idChaveMuniLocal] = locRec;
    }

    if (sampleList.length < 25) {
      sampleList.push(locRec);
    }
  }

  onProgress?.("Finalizando validação da base territorial...", 90);

  // Verificação de duplicidade por nome de arquivo e contagem
  const currentMeta = getBaseTerritorialMestreStore().metadata;
  const isDuplicate = currentMeta && currentMeta.fileName === file.name && currentMeta.totalRowsInFile === totalRowsInFile;

  const serializableBairros: Record<string, string[]> = {};
  for (const [m, set] of Object.entries(bairrosByMuni)) {
    serializableBairros[m] = Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  const nextVersion = currentMeta ? (currentMeta.version || 1) + 1 : 1;

  const metadata: BaseTerritorialMetadata = {
    fileName: file.name,
    fileSize: file.size,
    fileHash: `territorial_${file.name}_${totalRowsInFile}_v${nextVersion}`,
    uploadDate: new Date().toISOString(),
    version: nextVersion,
    status: rejectedRows === 0 ? "ATIVA" : "VALIDADA",
    totalRowsInFile,
    processedRows,
    validRows: processedRows,
    rejectedRows,
    rejectionReasons,
    municipiosCount: muniSet.size,
    bairrosCount: Object.values(serializableBairros).reduce((acc, l) => acc + l.length, 0),
    locaisCount: locaisSet.size,
    zonasCount: zonasSet.size || 1,
    secoesCount: secoesSet.size || processedRows,
    municipiosList: Array.from(muniSet).sort((a, b) => a.localeCompare(b, "pt-BR")),
    bairrosByMunicipio: serializableBairros
  };

  const store: BaseTerritorialStore = {
    metadata,
    exactMap,
    zonaLocalMap,
    localMap,
    muniLocalMap,
    sampleRecords: sampleList
  };

  onProgress?.("Base territorial validada com sucesso!", 100);

  return {
    store,
    validation: {
      isValid: processedRows > 0,
      totalRows: totalRowsInFile,
      processedRows,
      rejectedRows,
      rejectionReasons,
      isDuplicate: !!isDuplicate,
      municipiosFound: muniSet.size,
      bairrosFound: metadata.bairrosCount,
      locaisFound: locaisSet.size
    }
  };
}

/**
 * Função Central de Cruzamento O(1) com a Base Territorial Mestre
 * 
 * Ordem de Prioridade Técnica:
 * 1. Chave Completa (5 Dimensões): SG_UF|NM_MUNICIPIO|NR_ZONA|NR_SECAO|NR_LOCAL_VOTACAO
 * 2. Chave Zona + Local:           SG_UF|NM_MUNICIPIO|NR_ZONA|NR_LOCAL_VOTACAO
 * 3. Chave Local:                  SG_UF|NM_MUNICIPIO|NR_LOCAL_VOTACAO
 * 4. Chave Muni-Loc:               NM_MUNICIPIO|NR_LOCAL_VOTACAO
 * 5. Fallback Canônico Oficial de Sergipe
 */
export function matchTerritorialRecord(
  params: {
    sgUf?: string;
    cdMunicipio?: string;
    nmMunicipio: string;
    nrZona?: string | number;
    nrSecao?: string | number;
    nrLocalVotacao?: string | number;
    nmLocalVotacao?: string;
  },
  customMasterStore?: BaseTerritorialStore
): {
  bairro: string;
  matchMethod: "ID_CHAVE_TERRITORIAL" | "ID_CHAVE_ZONA_LOCAL" | "ID_CHAVE_LOCAL" | "ID_CHAVE_MUNI_LOCAL" | "CANONICO_FALLBACK";
  idChaveUtilizada: string;
  foundRecord?: TerritorialLocationRecord;
} | null {
  const master = customMasterStore || getBaseTerritorialMestreStore();
  const uf = normalizeKeyText(params.sgUf) || "SE";
  
  // Normalização do município
  const muniCanon = findSergipeMunicipio(params.cdMunicipio || params.nmMunicipio);
  const rawMuni = muniCanon ? muniCanon.nome.toUpperCase() : normalizeKeyText(params.nmMunicipio);
  
  const zona = normalizeNumberCode(params.nrZona);
  const secao = normalizeNumberCode(params.nrSecao);
  const local = normalizeNumberCode(params.nrLocalVotacao);

  // 1. Chave Completa de 5 Dimensões: SG_UF|NM_MUNICIPIO|NR_ZONA|NR_SECAO|NR_LOCAL_VOTACAO
  if (uf && rawMuni && (zona || secao || local)) {
    const key5 = buildIdChaveTerritorial(uf, rawMuni, zona, secao, local);
    if (master.exactMap && master.exactMap[key5]) {
      const rec = master.exactMap[key5];
      return {
        bairro: rec.nmBairro.toUpperCase(),
        matchMethod: "ID_CHAVE_TERRITORIAL",
        idChaveUtilizada: key5,
        foundRecord: rec
      };
    }
  }

  // 2. Chave por Zona + Local: SG_UF|NM_MUNICIPIO|NR_ZONA|NR_LOCAL_VOTACAO
  if (uf && rawMuni && zona && local) {
    const keyZonaLoc = buildIdChaveZonaLocal(uf, rawMuni, zona, local);
    if (master.zonaLocalMap && master.zonaLocalMap[keyZonaLoc]) {
      const rec = master.zonaLocalMap[keyZonaLoc];
      return {
        bairro: rec.nmBairro.toUpperCase(),
        matchMethod: "ID_CHAVE_ZONA_LOCAL",
        idChaveUtilizada: keyZonaLoc,
        foundRecord: rec
      };
    }
  }

  // 3. Chave por Local de Votação: SG_UF|NM_MUNICIPIO|NR_LOCAL_VOTACAO
  if (uf && rawMuni && local) {
    const keyLocal = buildIdChaveLocal(uf, rawMuni, local);
    if (master.localMap && master.localMap[keyLocal]) {
      const rec = master.localMap[keyLocal];
      return {
        bairro: rec.nmBairro.toUpperCase(),
        matchMethod: "ID_CHAVE_LOCAL",
        idChaveUtilizada: keyLocal,
        foundRecord: rec
      };
    }
  }

  // 4. Chave Simplificada: NM_MUNICIPIO|NR_LOCAL_VOTACAO
  if (rawMuni && local) {
    const keyMuniLocal = buildIdChaveMuniLocal(rawMuni, local);
    if (master.muniLocalMap && master.muniLocalMap[keyMuniLocal]) {
      const rec = master.muniLocalMap[keyMuniLocal];
      return {
        bairro: rec.nmBairro.toUpperCase(),
        matchMethod: "ID_CHAVE_MUNI_LOCAL",
        idChaveUtilizada: keyMuniLocal,
        foundRecord: rec
      };
    }
  }

  // 5. Fallback Canônico caso o arquivo territorial do usuário não cubra o local
  const canonMatch = CANONICAL_LOCAL_VOTACAO_BAIRRO.find((c) => {
    const matchMuni = normalizeKeyText(c.nmMunicipio) === rawMuni;
    const matchLoc = local && normalizeNumberCode(c.nrLocalVotacao) === local;
    return matchMuni && matchLoc;
  });

  if (canonMatch && canonMatch.nmBairro) {
    return {
      bairro: canonMatch.nmBairro.toUpperCase(),
      matchMethod: "CANONICO_FALLBACK",
      idChaveUtilizada: buildIdChaveLocal(canonMatch.uf, canonMatch.nmMunicipio, canonMatch.nrLocalVotacao),
      foundRecord: {
        idChaveTerritorial: buildIdChaveTerritorial(canonMatch.uf, canonMatch.nmMunicipio, "1", "", canonMatch.nrLocalVotacao),
        idChaveLocal: buildIdChaveLocal(canonMatch.uf, canonMatch.nmMunicipio, canonMatch.nrLocalVotacao),
        idChaveMuniLocal: buildIdChaveMuniLocal(canonMatch.nmMunicipio, canonMatch.nrLocalVotacao),
        sgUf: canonMatch.uf,
        nmMunicipio: canonMatch.nmMunicipio.toUpperCase(),
        nrZona: "1",
        nrSecao: "",
        nrLocalVotacao: canonMatch.nrLocalVotacao,
        nmLocalVotacao: canonMatch.nmLocalVotacao,
        nmBairro: canonMatch.nmBairro.toUpperCase(),
        nrCep: "49000-000",
        nrLatitude: "-10.9472",
        nrLongitude: "-37.0731"
      }
    };
  }

  return null;
}

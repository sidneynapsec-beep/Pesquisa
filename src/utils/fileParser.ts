import * as XLSX from "xlsx";
import Papa from "papaparse";
import { CANDIDATOS_OFICIAIS_2026, OfficialCandidate2026 } from "../data/candidatosOficiais2026";
import { SERGIPE_MUNICIPALITIES } from "../data/sergipeData";
import { RoleStatistics } from "../types";
import { formatDateBR, formatDateRangeBR } from "./dateFormatter";

export interface MunicipalityRoleTally {
  counts: Record<string, number>;
  totalSample: number;
  validTotal: number;
  invalidTotal: number;
  undecidedTotal: number;
  percentages: Record<string, number>;
  validPercentages: Record<string, number>;
}

export interface ParsedPollDataset {
  institute: string;
  registryNumber: string;
  conre: string;
  statistician: string;
  sampleSize: number;
  marginOfError: number;
  confidenceLevel: number;
  fieldworkStart: string;
  fieldworkEnd: string;
  medianDate: string;
  type: "Registrada" | "Tracking";
  results: Record<string, number>;
  roleResults?: Record<string, Record<string, number>>;
  roleValidResults?: Record<string, Record<string, number>>;
  roleRawCounts?: Record<string, Record<string, number>>;
  roleStats?: Record<string, RoleStatistics>;
  territorialBreakdown?: Record<string, Record<string, number>>;
  territorialRoleBreakdown?: Record<string, Record<string, MunicipalityRoleTally>>;
  rawRows?: any[];
  geoPoints?: Array<{
    label: string;
    latitude: number;
    longitude: number;
    cep?: string;
    cidade?: string;
    bairro?: string;
  }>;
  rawRowsCount: number;
  warnings: string[];
  fileName: string;
}

// Clean string helper: lowercase and strip diacritics
export function normalizeStr(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const PT_MONTHS_MAP: Record<string, number> = {
  "janeiro": 1, "jan": 1,
  "fevereiro": 2, "fev": 2,
  "marco": 3, "março": 3, "mar": 3,
  "abril": 4, "abr": 4,
  "maio": 5, "mai": 5,
  "junho": 6, "jun": 6,
  "julho": 7, "jul": 7,
  "agosto": 8, "ago": 8,
  "setembro": 9, "set": 9,
  "outubro": 10, "out": 10,
  "novembro": 11, "nov": 11,
  "dezembro": 12, "dez": 12
};

/**
 * Calculates the exact midpoint date (YYYY-MM-DD) between start and end dates.
 */
export function computeMedianDate(startStr: string, endStr: string): string {
  try {
    const s = new Date(startStr.includes("T") ? startStr : startStr + "T12:00:00");
    const e = new Date(endStr.includes("T") ? endStr : endStr + "T12:00:00");
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const midTime = s.getTime() + (e.getTime() - s.getTime()) / 2;
      const mid = new Date(midTime);
      const y = mid.getFullYear();
      const m = String(mid.getMonth() + 1).padStart(2, "0");
      const d = String(mid.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  } catch {}
  return startStr || endStr;
}

/**
 * Universal date parser that handles:
 * - Excel date serial numbers (e.g. 45000-48000 -> 2023-2031)
 * - Brazilian formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, DD/MM/YY
 * - ISO formats: YYYY-MM-DD, YYYY/MM/DD, ISO timestamps
 * - Portuguese textual dates: "15 de Agosto de 2026", "15/ago/2026", "Agosto/2026"
 * - Epoch ms or seconds
 * - Strictly rejects dates prior to year 1990 (such as 1970-01-01 or 0 or time-only)
 */
export function parseFlexibleDate(value: any): string | null {
  if (value === null || value === undefined || value === "") return null;

  // Handle Date instance
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const y = value.getFullYear();
    if (y < 1990 || y > 2040) return null;
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Handle numeric values (Excel serial date number or epoch ms/s)
  if (typeof value === "number") {
    if (isNaN(value) || value <= 0) return null;

    // Excel serial date (e.g. 25000 to 80000 -> years 1968 to 2119, 45000-47000 = 2023-2028)
    if (value >= 25000 && value <= 80000) {
      // Excel base is 1899-12-30 (25569 days to 1970-01-01)
      const jsDate = new Date(Math.round((value - 25569) * 86400 * 1000));
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getUTCFullYear();
        if (y >= 1990 && y <= 2040) {
          const m = String(jsDate.getUTCMonth() + 1).padStart(2, "0");
          const d = String(jsDate.getUTCDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
      }
    }

    // Epoch ms (e.g. 1577836800000+ -> 2020+)
    if (value > 946684800000 && value < 2500000000000) {
      const jsDate = new Date(value);
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getFullYear();
        if (y >= 1990 && y <= 2040) {
          const m = String(jsDate.getMonth() + 1).padStart(2, "0");
          const d = String(jsDate.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
      }
    }

    // Epoch seconds
    if (value > 946684800 && value < 2500000000) {
      const jsDate = new Date(value * 1000);
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getFullYear();
        if (y >= 1990 && y <= 2040) {
          const m = String(jsDate.getMonth() + 1).padStart(2, "0");
          const d = String(jsDate.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
      }
    }

    return null;
  }

  const str = String(value).trim();
  if (!str || str === "0" || str === "00:00:00" || str === "1970-01-01" || str.startsWith("1970")) {
    return null;
  }

  // If string is pure numeric (Excel serial as string)
  if (/^\d{5}(\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    if (num >= 25000 && num <= 80000) {
      const jsDate = new Date(Math.round((num - 25569) * 86400 * 1000));
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getUTCFullYear();
        if (y >= 1990 && y <= 2040) {
          const m = String(jsDate.getUTCMonth() + 1).padStart(2, "0");
          const d = String(jsDate.getUTCDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
      }
    }
  }

  // YYYY-MM-DD or YYYY/MM/DD (prioritize full ISO)
  const isoMatch = str.match(/(\b\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (y >= 1990 && y <= 2040 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const brMatch = str.match(/(\b\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/);
  if (brMatch) {
    const d = parseInt(brMatch[1], 10);
    const m = parseInt(brMatch[2], 10);
    let y = parseInt(brMatch[3], 10);
    if (y < 100) y += 2000;
    if (y >= 1990 && y <= 2040 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  // Portuguese textual date formats, e.g.: "15 de agosto de 2026", "15-ago-2026", "15 ago 2026"
  const normLower = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const ptTextMatch = normLower.match(/(\b\d{1,2})\s*(?:de|\-|\/|\s)\s*([a-z]{3,9})\s*(?:de|\-|\/|\s)?\s*(\d{2,4})\b/);
  if (ptTextMatch) {
    const d = parseInt(ptTextMatch[1], 10);
    const monthKey = ptTextMatch[2];
    let y = parseInt(ptTextMatch[3], 10);
    if (y < 100) y += 2000;
    const m = PT_MONTHS_MAP[monthKey] || Object.entries(PT_MONTHS_MAP).find(([k]) => monthKey.startsWith(k))?.[1];
    if (m && y >= 1990 && y <= 2040 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  // Month-Year textual format, e.g.: "Agosto de 2026", "agosto/2026", "ago-2026"
  const ptMonthYearMatch = normLower.match(/([a-z]{3,9})\s*(?:de|\-|\/|\s)\s*(\d{4})\b/);
  if (ptMonthYearMatch) {
    const monthKey = ptMonthYearMatch[1];
    const y = parseInt(ptMonthYearMatch[2], 10);
    const m = PT_MONTHS_MAP[monthKey] || Object.entries(PT_MONTHS_MAP).find(([k]) => monthKey.startsWith(k))?.[1];
    if (m && y >= 1990 && y <= 2040) {
      return `${y}-${String(m).padStart(2, "0")}-15`; // Default to middle of month
    }
  }

  // Try standard JS Date parsing
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      if (y >= 1990 && y <= 2040) {
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    }
  } catch {}

  return null;
}

/**
 * Extracts start, end, and median dates from range strings such as:
 * "10 a 15 de Agosto de 2026", "01/08/2026 a 05/08/2026", "10-15/08/2026"
 */
export function parseDateRange(value: any): { start: string | null; end: string | null; median: string | null } {
  if (!value) return { start: null, end: null, median: null };
  const str = String(value).trim();

  // Pattern: "DD a DD de Mês de AAAA" or "DD a DD/MM/AAAA"
  const normLower = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const rangePattern1 = normLower.match(/(\b\d{1,2})\s*(?:a|ate|-|\/)\s*(\d{1,2})\s*(?:de|\/|-|\s)\s*([a-z0-9]+)\s*(?:de|\/|-|\s)?\s*(\d{2,4})?/);
  if (rangePattern1) {
    const d1 = parseInt(rangePattern1[1], 10);
    const d2 = parseInt(rangePattern1[2], 10);
    const mStr = rangePattern1[3];
    let y = rangePattern1[4] ? parseInt(rangePattern1[4], 10) : 2026;
    if (y < 100) y += 2000;
    const m = /^\d+$/.test(mStr) ? parseInt(mStr, 10) : PT_MONTHS_MAP[mStr];
    if (m && m >= 1 && m <= 12 && d1 >= 1 && d1 <= 31 && d2 >= 1 && d2 <= 31) {
      const start = `${y}-${String(m).padStart(2, "0")}-${String(d1).padStart(2, "0")}`;
      const end = `${y}-${String(m).padStart(2, "0")}-${String(d2).padStart(2, "0")}`;
      return { start, end, median: computeMedianDate(start, end) };
    }
  }

  // Pattern: "DD/MM/AAAA a DD/MM/AAAA"
  const twoDatesMatch = str.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s*(?:a|ate|-|to)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if (twoDatesMatch) {
    const start = parseFlexibleDate(twoDatesMatch[1]);
    const end = parseFlexibleDate(twoDatesMatch[2]);
    if (start && end) {
      return { start, end, median: computeMedianDate(start, end) };
    }
  }

  // Single date fallback
  const single = parseFlexibleDate(str);
  if (single) {
    return { start: single, end: single, median: single };
  }

  return { start: null, end: null, median: null };
}

/**
 * EXTRAI O PERÍODO DE CAMPO EXCLUSIVAMENTE DA COLUNA 'Início da Entrevista'
 * 
 * Regra Definitiva:
 * - Menor data existente na coluna 'Início da Entrevista' = Início do Campo (MIN)
 * - Maior data existente na coluna 'Início da Entrevista' = Fim do Campo (MAX)
 * - Se MIN === MAX, exibe apenas uma data (ex.: "10/08/2026")
 * - Se MIN !== MAX, exibe o intervalo (ex.: "10/08/2026 a 13/08/2026")
 * - NUNCA utiliza a data atual do sistema (nem 30/08/2026 nem Date.now()).
 * - NUNCA cria data fictícia ou estimativa.
 */
export function extractFieldworkPeriodFromRows(rows: any[]): {
  fieldworkStart: string;
  fieldworkEnd: string;
  formattedRange: string;
  hasValidDates: boolean;
} {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { fieldworkStart: "", fieldworkEnd: "", formattedRange: "—", hasValidDates: false };
  }

  // 1. Identificar a coluna 'Início da Entrevista'
  const firstRow = rows[0] || {};
  const headerKeys = Object.keys(firstRow);

  // Busca prioritária exata / normalizada por "Início da Entrevista"
  let targetColKey = headerKeys.find((k) => {
    const norm = normalizeStr(k);
    return (
      norm === "inicio da entrevista" ||
      norm === "iniciodaentrevista" ||
      norm === "inicio entrevista" ||
      norm === "inicio da coleta" ||
      norm === "iniciodacoleta" ||
      norm === "data da entrevista" ||
      norm === "datadacoleta" ||
      norm === "data da coleta"
    );
  });

  // Busca secundária se não encontrou exata
  if (!targetColKey) {
    targetColKey = headerKeys.find((k) => {
      const norm = normalizeStr(k);
      return (
        norm.includes("inicio") ||
        norm.includes("entrevista") ||
        norm.includes("coleta") ||
        norm.includes("data")
      );
    });
  }

  const validDates: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || typeof row !== "object") continue;

    let rawVal = targetColKey ? row[targetColKey] : undefined;

    // Se o valor estiver vazio na coluna principal, tenta escanear as chaves da linha
    if (rawVal === undefined || rawVal === null || rawVal === "") {
      for (const [k, v] of Object.entries(row)) {
        const norm = normalizeStr(k);
        if (
          norm.includes("inicio") ||
          norm.includes("entrevista") ||
          norm.includes("coleta") ||
          norm.includes("data")
        ) {
          const parsed = parseFlexibleDate(v);
          if (parsed) {
            validDates.push(parsed);
            break;
          }
        }
      }
    } else {
      const parsed = parseFlexibleDate(rawVal);
      if (parsed) {
        validDates.push(parsed);
      }
    }
  }

  if (validDates.length === 0) {
    return { fieldworkStart: "", fieldworkEnd: "", formattedRange: "—", hasValidDates: false };
  }

  // Ordenação cronológica ISO (YYYY-MM-DD)
  validDates.sort();

  const minDate = validDates[0];
  const maxDate = validDates[validDates.length - 1];

  const formattedStart = formatDateBR(minDate);
  const formattedEnd = formatDateBR(maxDate);

  const formattedRange =
    minDate === maxDate
      ? formattedStart
      : `${formattedStart} a ${formattedEnd}`;

  return {
    fieldworkStart: minDate,
    fieldworkEnd: maxDate,
    formattedRange,
    hasValidDates: true
  };
}

// Build pre-compiled normalized index for official candidates
const NORMALIZED_OFFICIAL_CANDIDATES = CANDIDATOS_OFICIAIS_2026.map((cand) => {
  const normName = normalizeStr(cand.name);
  const words = normName.split(" ").filter((w) => w.length > 2);
  const firstWord = words[0] || "";
  const lastWord = words[words.length - 1] || "";
  return {
    candidate: cand,
    normName,
    words,
    firstWord,
    lastWord,
    number: cand.number,
    role: cand.role
  };
});

// Normalized municipality list for exact & fuzzy mapping
const NORMALIZED_MUNICIPALITIES = SERGIPE_MUNICIPALITIES.map((m) => ({
  originalName: m.name,
  normName: normalizeStr(m.name),
  territory: m.territory,
  voters: m.voters
}));

// Match raw municipality string to canonical Sergipe municipality name
export function matchMunicipalityName(rawMuni: string): string | null {
  if (!rawMuni) return null;
  const norm = normalizeStr(rawMuni);
  if (!norm) return null;

  // Direct exact normalized match
  const direct = NORMALIZED_MUNICIPALITIES.find((m) => m.normName === norm);
  if (direct) return direct.originalName;

  // Partial / alias matches
  if (norm.includes("aracaju")) return "Aracaju";
  if (norm.includes("socorro") || norm.includes("ns socorro")) return "Nossa Senhora do Socorro";
  if (norm.includes("sao cristovao") || norm.includes("cristovao")) return "São Cristóvão";
  if (norm.includes("itabaiana") && !norm.includes("itabaianinha")) return "Itabaiana";
  if (norm.includes("itabaianinha")) return "Itabaianinha";
  if (norm.includes("itaporanga")) return "Itaporanga d'Ajuda";
  if (norm.includes("lagarto")) return "Lagarto";
  if (norm.includes("estancia")) return "Estância";
  if (norm.includes("tobias")) return "Tobias Barreto";
  if (norm.includes("simao dias")) return "Simão Dias";
  if (norm.includes("barra") || norm.includes("coqueiros")) return "Barra dos Coqueiros";
  if (norm.includes("gloria") || norm.includes("ns gloria")) return "Nossa Senhora da Glória";
  if (norm.includes("dores") || norm.includes("ns dores")) return "Nossa Senhora das Dores";
  if (norm.includes("aparecida") || norm.includes("ns aparecida")) return "Nossa Senhora Aparecida";
  if (norm.includes("caninde")) return "Canindé de São Francisco";
  if (norm.includes("propria")) return "Propriá";
  if (norm.includes("neopolis")) return "Neópolis";
  if (norm.includes("poco redondo")) return "Poço Redondo";
  if (norm.includes("poco verde")) return "Poço Verde";
  if (norm.includes("porto da folha")) return "Porto da Folha";
  if (norm.includes("santo amaro")) return "Santo Amaro das Brotas";
  if (norm.includes("rosario")) return "Rosário do Catete";
  if (norm.includes("maruim")) return "Maruim";
  if (norm.includes("laranjeiras")) return "Laranjeiras";
  if (norm.includes("japaratuba")) return "Japaratuba";
  if (norm.includes("pirambu")) return "Pirambu";
  if (norm.includes("aquidaba")) return "Aquidabã";
  if (norm.includes("capela")) return "Capela";
  if (norm.includes("carmopolis")) return "Carmópolis";
  if (norm.includes("boquim")) return "Boquim";
  if (norm.includes("umbauba")) return "Umbaúba";
  if (norm.includes("cristinapolis")) return "Cristinápolis";
  if (norm.includes("tomar do geru") || norm.includes("geru")) return "Tomar do Geru";
  if (norm.includes("indiaroba")) return "Indiaroba";
  if (norm.includes("santa luzia")) return "Santa Luzia do Itanhy";
  if (norm.includes("campo do brito") || norm.includes("brito")) return "Campo do Brito";
  if (norm.includes("sao domingos")) return "São Domingos";
  if (norm.includes("macambira")) return "Macambira";
  if (norm.includes("frei paulo")) return "Frei Paulo";
  if (norm.includes("pedra mole")) return "Pedra Mole";
  if (norm.includes("pinhao")) return "Pinhão";
  if (norm.includes("carira")) return "Carira";
  if (norm.includes("ribeiropolis")) return "Ribeirópolis";
  if (norm.includes("moita bonita") || norm.includes("moita")) return "Moita Bonita";
  if (norm.includes("malhador")) return "Malhador";
  if (norm.includes("sao miguel")) return "São Miguel do Aleixo";
  if (norm.includes("monte alegre")) return "Monte Alegre de Sergipe";

  // Substring match
  const sub = NORMALIZED_MUNICIPALITIES.find((m) => norm.includes(m.normName) || m.normName.includes(norm));
  if (sub) return sub.originalName;

  return null;
}

// Candidate match result
export interface MatchResult {
  candidateName: string;
  role?: string;
  partyNumber?: string;
  isInvalid?: boolean; // Branco / Nulo
  isUndecided?: boolean; // Ns / Nr
}

// Match candidate against official candidates or invalid answers
export function matchCandidateName(rawName: string, roleFilter?: string): string | null {
  const res = matchOfficialCandidate(rawName, roleFilter);
  return res ? res.candidateName : null;
}

export function matchOfficialCandidate(rawName: string, roleFilter?: string): MatchResult | null {
  if (!rawName) return null;
  const rawStr = String(rawName).trim();
  if (!rawStr) return null;

  const norm = normalizeStr(rawStr);
  if (!norm) return null;

  // 1. Check for Invalid / Blank / Null
  if (
    norm === "branco" ||
    norm === "nulo" ||
    norm === "brancos" ||
    norm === "nulos" ||
    norm === "branco nulo" ||
    norm === "brancos nulos" ||
    norm === "brancos e nulos" ||
    norm === "nenhum" ||
    norm === "nenhum deles" ||
    norm === "voto nulo" ||
    norm === "voto em branco" ||
    norm === "anularia"
  ) {
    return {
      candidateName: "Branco/Nulo",
      isInvalid: true
    };
  }

  // 2. Check for Non-response / Undecided
  if (
    norm === "ns nr" ||
    norm === "ns" ||
    norm === "nr" ||
    norm === "nao sabe" ||
    norm === "nao respondeu" ||
    norm === "nao soube responder" ||
    norm === "indeciso" ||
    norm === "indecisos" ||
    norm === "nao opinou" ||
    norm === "sem resposta" ||
    norm.includes("nao sabe") ||
    norm.includes("nao respondeu")
  ) {
    return {
      candidateName: "Ns/Nr",
      isUndecided: true
    };
  }

  // Candidates pool (filtered by role if provided, otherwise all)
  const pool = roleFilter
    ? NORMALIZED_OFFICIAL_CANDIDATES.filter((c) => c.role === roleFilter)
    : NORMALIZED_OFFICIAL_CANDIDATES;

  // Direct exact match
  const exact = pool.find((c) => c.normName === norm);
  if (exact) {
    return {
      candidateName: exact.candidate.name,
      role: exact.role,
      partyNumber: exact.candidate.partyNumber
    };
  }

  // Number match (if rawStr is numeric like '55', '10', '444', '131', '55015')
  const numMatch = pool.find((c) => c.number === rawStr || c.number === norm);
  if (numMatch) {
    return {
      candidateName: numMatch.candidate.name,
      role: numMatch.role,
      partyNumber: numMatch.candidate.partyNumber
    };
  }

  // Specific canonical known aliases for key 2026 candidates
  // Governador
  if (norm.includes("fabio") || norm.includes("mitidieri")) {
    const cand = pool.find((c) => c.role === "Governador" && c.candidate.name.includes("Fábio"));
    if (cand) return { candidateName: cand.candidate.name, role: "Governador", partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("valmir") || norm.includes("francisquinho")) {
    const cand = pool.find((c) => c.role === "Governador" && c.candidate.name.includes("Valmir"));
    if (cand) return { candidateName: cand.candidate.name, role: "Governador", partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("ricardo marques") || (norm.includes("ricardo") && roleFilter === "Governador")) {
    const cand = pool.find((c) => c.role === "Governador" && c.candidate.name.includes("Ricardo Marques"));
    if (cand) return { candidateName: cand.candidate.name, role: "Governador", partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("cacho") || norm.includes("emanuel cacho")) {
    const cand = pool.find((c) => c.candidate.name.includes("Emanuel Cacho"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("helton") || norm.includes("dr helton")) {
    const cand = pool.find((c) => c.candidate.name.includes("Dr. Helton"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("taty") || norm.includes("cristina de jesus")) {
    const cand = pool.find((c) => c.candidate.name.includes("Taty Cristina"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }

  // Senador
  if (norm.includes("andre moura") || (norm.includes("moura") && (norm.includes("andre") || roleFilter === "Senador"))) {
    const cand = pool.find((c) => c.role === "Senador" && c.candidate.name.includes("André Moura"));
    if (cand) return { candidateName: cand.candidate.name, role: "Senador", partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("rogerio") || norm.includes("carvalho")) {
    const cand = pool.find((c) => c.role === "Senador" && c.candidate.name.includes("Rogerio"));
    if (cand) return { candidateName: cand.candidate.name, role: "Senador", partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("alessandro") || norm.includes("delegado alessandro")) {
    const cand = pool.find((c) => c.candidate.name.includes("Alessandro"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("andre david") || norm.includes("delegado andre david")) {
    const cand = pool.find((c) => c.candidate.name.includes("André David"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("edvaldo") || norm.includes("nogueira")) {
    const cand = pool.find((c) => c.candidate.name.includes("Edvaldo"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("amorim") || norm.includes("eduardo amorim")) {
    const cand = pool.find((c) => c.candidate.name.includes("Eduardo Amorim"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("valadares") || norm.includes("rodrigo valadares")) {
    const cand = pool.find((c) => c.candidate.name.includes("Rodrigo Valadares"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("coronel rocha") || (norm.includes("rocha") && roleFilter === "Senador")) {
    const cand = pool.find((c) => c.candidate.name.includes("Coronel Rocha"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("iran") || norm.includes("iran barbosa")) {
    const cand = pool.find((c) => c.candidate.name.includes("Iran Barbosa"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }

  // Deputados Federais & Estaduais Key Names
  if (norm.includes("yandra")) {
    const cand = pool.find((c) => c.candidate.name.includes("Yandra"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("anderson") && norm.includes("canas")) {
    const cand = pool.find((c) => c.candidate.name.includes("Anderson De Zé"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("heleno") || norm.includes("pastor heleno")) {
    const cand = pool.find((c) => c.candidate.name.includes("Pastor Heleno"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("fabio reis")) {
    const cand = pool.find((c) => c.candidate.name.includes("Fábio Reis"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("katarina")) {
    const cand = pool.find((c) => c.candidate.name.includes("Katarina"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("gustinho")) {
    const cand = pool.find((c) => c.candidate.name.includes("Gustinho"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("icaro")) {
    const cand = pool.find((c) => c.candidate.name.includes("Icaro"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("joao daniel")) {
    const cand = pool.find((c) => c.candidate.name.includes("Joao Daniel"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("marcio macedo")) {
    const cand = pool.find((c) => c.candidate.name.includes("Marcio Macedo"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("luciano bispo")) {
    const cand = pool.find((c) => c.candidate.name.includes("Luciano Bispo"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("cristiano cavalcante")) {
    const cand = pool.find((c) => c.candidate.name.includes("Cristiano Cavalcante"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("pato maravilha") || norm.includes("maravilha")) {
    const cand = pool.find((c) => c.candidate.name.includes("Pato Maravilha"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("ibrain") || norm.includes("ibrain de valmir")) {
    const cand = pool.find((c) => c.candidate.name.includes("Ibrain De Valmir"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("georgeo")) {
    const cand = pool.find((c) => c.candidate.name.includes("Georgeo Passos"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("maisa")) {
    const cand = pool.find((c) => c.candidate.name.includes("Maisa Mitidieri"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("linda brasil")) {
    const cand = pool.find((c) => c.candidate.name.includes("Linda Brasil"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }

  // Generic Substring / Subwords Match in Pool
  const sub = pool.find((c) => norm.includes(c.normName) || c.normName.includes(norm));
  if (sub) {
    return {
      candidateName: sub.candidate.name,
      role: sub.role,
      partyNumber: sub.candidate.partyNumber
    };
  }

  // Fallback: capitalize cleaned text
  const cleanFormatted = rawStr
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return {
    candidateName: cleanFormatted,
    role: roleFilter
  };
}

// Convert heterogeneous inputs (strings with %, commas, periods) into numbers safely
export function parseFlexibleNumber(val: any): number {
  if (typeof val === "number") {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;

  let str = String(val).trim();
  str = str.replace(/[%\sR$]/g, "");

  if (str.includes(",") && !str.includes(".")) {
    str = str.replace(",", ".");
  } else if (str.includes(",") && str.includes(".")) {
    str = str.replace(/\./g, "").replace(",", ".");
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Decodifica buffers com suporte automático a UTF-8, UTF-8 BOM e Latin-1 (ISO-8859-1)
 */
export function decodeTextFile(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  
  // Detecção e remoção de UTF-8 BOM (0xEF, 0xBB, 0xBF)
  let offset = 0;
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    offset = 3;
  }
  const contentBytes = offset > 0 ? bytes.subarray(offset) : bytes;

  try {
    const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
    return utf8Decoder.decode(contentBytes);
  } catch {
    // Fallback tolerante para Latin-1 (ISO-8859-1 / Windows-1252), padrão histórico do TSE
    const latin1Decoder = new TextDecoder("iso-8859-1");
    return latin1Decoder.decode(contentBytes);
  }
}

/**
 * Identifica códigos sentinela oficiais do TSE que representam dados ausentes ou não informados
 */
export function isTseSentinelValue(val: any): boolean {
  if (val === null || val === undefined) return true;
  const s = String(val).trim().toUpperCase();
  return (
    s === "#NULO" ||
    s === "#NULO#" ||
    s === "#NE" ||
    s === "#NE#" ||
    s === "-1" ||
    s === "-3" ||
    s === "-1.0" ||
    s === "-3.0" ||
    s === "NAO INFORMADO" ||
    s === "NÃO INFORMADO" ||
    s === "SEM INFORMACAO" ||
    s === "SEM INFORMAÇÃO"
  );
}

/**
 * Limpa e extrai valores numéricos preservando códigos sentinela como null (não convertendo em positivos acidentalmente)
 */
export function parseTseSafeNumber(val: any): number | null {
  if (isTseSentinelValue(val)) return null;
  return parseFlexibleNumber(val);
}

/**
 * Main Multi-Format File Parser for SEIE Ecosystem:
 * Parses XLSX, XLS, CSV, ODS microdata spreadsheets with full 75 municipalities cross-tabulation.
 * STRICT ZERO MOCK / ZERO HALLUCINATION.
 */
export async function parseSurveyFile(
  file: File,
  fallbackReferenceDate?: string,
  fallbackInstitute?: string
): Promise<ParsedPollDataset> {
  const warnings: string[] = [];
  const fileName = file.name;
  const isCsv = fileName.toLowerCase().endsWith(".csv");
  const isPdf = fileName.toLowerCase().endsWith(".pdf");

  let rawRows: any[] = [];

  if (isCsv) {
    const buffer = await file.arrayBuffer();
    const text = decodeTextFile(buffer);
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });
    rawRows = parsed.data as any[];
  } else if (isPdf) {
    throw new Error("Arquivos PDF de relatórios devem ser convertidos para XLSX ou CSV com os microdados brutos das entrevistas.");
  } else {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }

  if (!rawRows || rawRows.length === 0) {
    throw new Error(`O arquivo '${fileName}' está vazio ou não possui linhas legíveis.`);
  }

  // Metadata Defaults
  let institute = fallbackInstitute || "CTAS";
  let registryNumber = "";
  let conre = "10801";
  let statistician = "Sidney Barreto Batista";
  let sampleSize = rawRows.length;
  let confidenceLevel = 95;
  
  let minRowDate: string | null = null;
  let maxRowDate: string | null = null;

  // Extract exact fieldwork period from the 'Início da Entrevista' column across ALL rows
  const rowFieldwork = extractFieldworkPeriodFromRows(rawRows);
  if (rowFieldwork.hasValidDates) {
    minRowDate = rowFieldwork.fieldworkStart;
    maxRowDate = rowFieldwork.fieldworkEnd;
  }

  // Intelligent multi-layered date detection: rows -> metadata -> filename -> fallback
  const fallbackRange = parseDateRange(fallbackReferenceDate);
  const fileNameRange = parseDateRange(fileName);
  let detectedMetaStart: string | null = null;
  let detectedMetaEnd: string | null = null;
  let detectedMetaMedian: string | null = null;

  const candidateResults: Record<string, number> = {};
  const roleResults: Record<string, Record<string, number>> = {
    "Governador": {},
    "1º Senador": {},
    "2º Senador": {},
    "Senador": {},
    "Deputado Federal": {},
    "Deputado Estadual": {}
  };
  const roleValidResults: Record<string, Record<string, number>> = {
    "Governador": {},
    "1º Senador": {},
    "2º Senador": {},
    "Senador": {},
    "Deputado Federal": {},
    "Deputado Estadual": {}
  };
  const roleRawCounts: Record<string, Record<string, number>> = {
    "Governador": {},
    "1º Senador": {},
    "2º Senador": {},
    "Senador": {},
    "Deputado Federal": {},
    "Deputado Estadual": {}
  };
  const roleStats: Record<string, RoleStatistics> = {};

  const territorialBreakdown: Record<string, Record<string, number>> = {};
  const territorialRoleBreakdown: Record<string, Record<string, MunicipalityRoleTally>> = {
    "Governador": {},
    "1º Senador": {},
    "2º Senador": {},
    "Senador": {},
    "Deputado Federal": {},
    "Deputado Estadual": {}
  };

  const geoPoints: Array<{
    label: string;
    latitude: number;
    longitude: number;
    cep?: string;
    cidade?: string;
    bairro?: string;
  }> = [];

  const firstRow = rawRows[0] || {};
  const headerKeys = Object.keys(firstRow);

  // Check for 15-column microdata keys
  const govColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n === "governador" || n.startsWith("governador") || n.includes("voto governador");
  });
  const sen1ColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n.includes("senador 01") || n.includes("senador 1") || n === "senador1" || n.includes("primeiro senador") || n === "senador";
  });
  const sen2ColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return (n.includes("senador 02") || n.includes("senador 2") || n === "senador2" || n.includes("segundo senador")) && k !== sen1ColKey;
  });
  const depEstColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n.includes("deputado estadual") || n === "deputado estadual" || (n.includes("estadual") && !n.includes("federal"));
  });
  const depFedColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n.includes("deputado federal") || n === "deputado federal" || (n.includes("federal") && !n.includes("estadual"));
  });

  const muniColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n.includes("municipio") || n.includes("cidade") || n.includes("regiao") || n.includes("territorio");
  });

  const latColKey = headerKeys.find((k) => normalizeStr(k).includes("lat"));
  const lngColKey = headerKeys.find((k) => normalizeStr(k).includes("long") || normalizeStr(k).includes("lng"));
  const cepColKey = headerKeys.find((k) => normalizeStr(k).includes("cep"));
  const dateColKey = headerKeys.find((k) => normalizeStr(k).includes("inicio") || normalizeStr(k).includes("data"));

  const isMicrodataSurvey = Boolean(govColKey || sen1ColKey || depEstColKey || depFedColKey);

  if (isMicrodataSurvey) {
    const totalInterviews = rawRows.length;
    sampleSize = totalInterviews;

    const govCounts: Record<string, number> = {};
    const sen1Counts: Record<string, number> = {};
    const sen2Counts: Record<string, number> = {};
    const senCounts: Record<string, number> = {};
    const depEstCounts: Record<string, number> = {};
    const depFedCounts: Record<string, number> = {};

    // Microdata per role per municipality: role -> muni -> counts
    const roleMuniData: Record<
      string,
      Record<
        string,
        {
          counts: Record<string, number>;
          totalSample: number;
          validTotal: number;
          invalidTotal: number;
          undecidedTotal: number;
        }
      >
    > = {
      "Governador": {},
      "1º Senador": {},
      "2º Senador": {},
      "Senador": {},
      "Deputado Federal": {},
      "Deputado Estadual": {}
    };

    const getMuniTally = (role: string, muni: string) => {
      if (!roleMuniData[role][muni]) {
        roleMuniData[role][muni] = {
          counts: {},
          totalSample: 0,
          validTotal: 0,
          invalidTotal: 0,
          undecidedTotal: 0
        };
      }
      return roleMuniData[role][muni];
    };

    rawRows.forEach((row, rowIndex) => {
      // Date detection across rows (scan all rows up to 500 for min/max date range)
      if (rowIndex < 500) {
        let rDate: string | null = null;
        if (dateColKey && row[dateColKey]) {
          rDate = parseFlexibleDate(row[dateColKey]);
        }
        if (!rDate) {
          for (const [k, v] of Object.entries(row)) {
            const norm = normalizeStr(k);
            if (norm.includes("data") || norm.includes("coleta") || norm.includes("inicio") || norm.includes("entrevista")) {
              rDate = parseFlexibleDate(v);
              if (rDate) break;
            }
          }
        }
        if (rDate) {
          if (!minRowDate || rDate < minRowDate) minRowDate = rDate;
          if (!maxRowDate || rDate > maxRowDate) maxRowDate = rDate;
        }
      }

      // Geo points
      if (latColKey && lngColKey && row[latColKey] && row[lngColKey]) {
        const lat = parseFlexibleNumber(row[latColKey]);
        const lng = parseFlexibleNumber(row[lngColKey]);
        if (lat !== 0 && lng !== 0) {
          geoPoints.push({
            label: String(row[muniColKey || "Município"] || `Entrevista ${row["Id da Entrevista"] || rowIndex + 1}`),
            latitude: lat,
            longitude: lng,
            cep: cepColKey ? String(row[cepColKey] || "") : "",
            cidade: muniColKey ? String(row[muniColKey] || "") : "Sergipe",
            bairro: String(row["Bairro"] || "")
          });
        }
      }

      const rawMuni = muniColKey ? String(row[muniColKey] || "").trim() : "";
      const canonicalMuni = matchMunicipalityName(rawMuni) || rawMuni;

      // 1. Governador
      if (govColKey) {
        const rawVal = row[govColKey];
        const match = matchOfficialCandidate(rawVal, "Governador");
        const cand = match ? match.candidateName : "Ns/Nr";
        const isInv = match?.isInvalid || false;
        const isUnd = match?.isUndecided || (!match || !rawVal);

        govCounts[cand] = (govCounts[cand] || 0) + 1;
        if (canonicalMuni) {
          const t = getMuniTally("Governador", canonicalMuni);
          t.totalSample += 1;
          t.counts[cand] = (t.counts[cand] || 0) + 1;
          if (isInv) t.invalidTotal += 1;
          else if (isUnd) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }

      // 2. Senador (Senador 01, Senador 02 and Consolidated)
      if (sen1ColKey) {
        const rawVal1 = row[sen1ColKey];
        const match1 = matchOfficialCandidate(rawVal1, "Senador");
        const cand1 = match1 ? match1.candidateName : (rawVal1 ? String(rawVal1).trim() : "Ns/Nr");
        const isInv1 = match1?.isInvalid || false;
        const isUnd1 = match1?.isUndecided || (!match1 || !rawVal1);

        sen1Counts[cand1] = (sen1Counts[cand1] || 0) + 1;
        senCounts[cand1] = (senCounts[cand1] || 0) + 1;
        if (canonicalMuni) {
          const t1 = getMuniTally("1º Senador", canonicalMuni);
          t1.totalSample += 1;
          t1.counts[cand1] = (t1.counts[cand1] || 0) + 1;
          if (isInv1) t1.invalidTotal += 1;
          else if (isUnd1) t1.undecidedTotal += 1;
          else t1.validTotal += 1;

          const t = getMuniTally("Senador", canonicalMuni);
          t.totalSample += 1;
          t.counts[cand1] = (t.counts[cand1] || 0) + 1;
          if (isInv1) t.invalidTotal += 1;
          else if (isUnd1) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }
      if (sen2ColKey) {
        const rawVal2 = row[sen2ColKey];
        const match2 = matchOfficialCandidate(rawVal2, "Senador");
        const cand2 = match2 ? match2.candidateName : (rawVal2 ? String(rawVal2).trim() : "Ns/Nr");
        const isInv2 = match2?.isInvalid || false;
        const isUnd2 = match2?.isUndecided || (!match2 || !rawVal2);

        sen2Counts[cand2] = (sen2Counts[cand2] || 0) + 1;
        senCounts[cand2] = (senCounts[cand2] || 0) + 1;
        if (canonicalMuni) {
          const t2 = getMuniTally("2º Senador", canonicalMuni);
          t2.totalSample += 1;
          t2.counts[cand2] = (t2.counts[cand2] || 0) + 1;
          if (isInv2) t2.invalidTotal += 1;
          else if (isUnd2) t2.undecidedTotal += 1;
          else t2.validTotal += 1;

          const t = getMuniTally("Senador", canonicalMuni);
          t.totalSample += 1;
          t.counts[cand2] = (t.counts[cand2] || 0) + 1;
          if (isInv2) t.invalidTotal += 1;
          else if (isUnd2) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }

      // 3. Deputado Federal
      if (depFedColKey) {
        const rawValFed = row[depFedColKey];
        const matchFed = matchOfficialCandidate(rawValFed, "Deputado Federal");
        const candFed = matchFed ? matchFed.candidateName : "Ns/Nr";
        const isInvFed = matchFed?.isInvalid || false;
        const isUndFed = matchFed?.isUndecided || (!matchFed || !rawValFed);

        depFedCounts[candFed] = (depFedCounts[candFed] || 0) + 1;
        if (canonicalMuni) {
          const t = getMuniTally("Deputado Federal", canonicalMuni);
          t.totalSample += 1;
          t.counts[candFed] = (t.counts[candFed] || 0) + 1;
          if (isInvFed) t.invalidTotal += 1;
          else if (isUndFed) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }

      // 4. Deputado Estadual
      if (depEstColKey) {
        const rawValEst = row[depEstColKey];
        const matchEst = matchOfficialCandidate(rawValEst, "Deputado Estadual");
        const candEst = matchEst ? matchEst.candidateName : "Ns/Nr";
        const isInvEst = matchEst?.isInvalid || false;
        const isUndEst = matchEst?.isUndecided || (!matchEst || !rawValEst);

        depEstCounts[candEst] = (depEstCounts[candEst] || 0) + 1;
        if (canonicalMuni) {
          const t = getMuniTally("Deputado Estadual", canonicalMuni);
          t.totalSample += 1;
          t.counts[candEst] = (t.counts[candEst] || 0) + 1;
          if (isInvEst) t.invalidTotal += 1;
          else if (isUndEst) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }
    });

    // Helper to calculate total % and valid % for any count map
    const calcPercentages = (counts: Record<string, number>, divisor: number) => {
      const result: Record<string, number> = {};
      const validCounts: Record<string, number> = {};
      let totalValid = 0;

      Object.entries(counts).forEach(([cand, count]) => {
        result[cand] = divisor > 0 ? +((count / divisor) * 100).toFixed(2) : 0;
        if (cand !== "Branco/Nulo" && cand !== "Ns/Nr" && cand !== "Brancos/Nulos" && cand !== "Indecisos") {
          validCounts[cand] = count;
          totalValid += count;
        }
      });

      const validResult: Record<string, number> = {};
      Object.entries(validCounts).forEach(([cand, count]) => {
        validResult[cand] = totalValid > 0 ? +((count / totalValid) * 100).toFixed(2) : 0;
      });

      return { totalPct: result, validPct: validResult, validTotal: totalValid };
    };

    // Calculate statewide role percentages
    const govCalc = calcPercentages(govCounts, totalInterviews);
    roleResults["Governador"] = govCalc.totalPct;
    roleValidResults["Governador"] = govCalc.validPct;
    Object.assign(candidateResults, govCalc.totalPct);

    // Senator calculations:
    // (a) 1º Senador and 2º Senador calculations
    if (Object.keys(sen1Counts).length > 0) {
      const sen1Calc = calcPercentages(sen1Counts, totalInterviews);
      roleResults["1º Senador"] = sen1Calc.totalPct;
      roleValidResults["1º Senador"] = sen1Calc.validPct;
    }
    if (Object.keys(sen2Counts).length > 0) {
      const sen2Calc = calcPercentages(sen2Counts, totalInterviews);
      roleResults["2º Senador"] = sen2Calc.totalPct;
      roleValidResults["2º Senador"] = sen2Calc.validPct;
    }

    // (b) Consolidated Senador: holds combined nominations from both Senador 01 and Senador 02
    // Base of Valid Votes = sum of all valid nominations to real candidates
    // Percentual Nominal = (Candidate Mentions / Total Interviews) for Sample %, and (Candidate Mentions / Total Valid Mentions) for Valid %
    const senValidTotal = Object.entries(senCounts)
      .filter(([k]) => k !== "Branco/Nulo" && k !== "Ns/Nr" && k !== "Brancos/Nulos" && k !== "Indecisos" && k !== "Não sei/Não respondeu")
      .reduce((sum, [, count]) => sum + count, 0);

    const senTotalPct: Record<string, number> = {};
    const senValidPct: Record<string, number> = {};

    Object.entries(senCounts).forEach(([cand, count]) => {
      // In polls with 2 votes, candidate percentage of voters is count / totalInterviews (max 100%)
      senTotalPct[cand] = totalInterviews > 0 ? +((count / totalInterviews) * 100).toFixed(2) : 0;
      if (cand !== "Branco/Nulo" && cand !== "Ns/Nr" && cand !== "Brancos/Nulos" && cand !== "Indecisos" && cand !== "Não sei/Não respondeu") {
        // Proportion of valid senate votes
        senValidPct[cand] = senValidTotal > 0 ? +((count / senValidTotal) * 100).toFixed(2) : 0;
      }
    });

    roleResults["Senador"] = senTotalPct;
    roleValidResults["Senador"] = senValidPct;

    const fedCalc = calcPercentages(depFedCounts, totalInterviews);
    roleResults["Deputado Federal"] = fedCalc.totalPct;
    roleValidResults["Deputado Federal"] = fedCalc.validPct;

    const estCalc = calcPercentages(depEstCounts, totalInterviews);
    roleResults["Deputado Estadual"] = estCalc.totalPct;
    roleValidResults["Deputado Estadual"] = estCalc.validPct;

    const totalSenMentions = Object.values(senCounts).reduce((a, b) => a + b, 0);
    const senDivisor = totalSenMentions > 0 ? totalSenMentions : totalInterviews * 2;

    const buildRoleStats = (counts: Record<string, number>, sampleCount: number): RoleStatistics => {
      let validTotal = 0;
      let invalidTotal = 0;
      let undecidedTotal = 0;

      Object.entries(counts).forEach(([k, v]) => {
        if (k === "Branco/Nulo" || k === "Brancos/Nulos") {
          invalidTotal += v;
        } else if (k === "Ns/Nr" || k === "Indecisos" || k === "Não sei/Não respondeu") {
          undecidedTotal += v;
        } else {
          validTotal += v;
        }
      });

      const totalSample = sampleCount > 0 ? sampleCount : (validTotal + invalidTotal + undecidedTotal);
      return {
        totalSample,
        validTotal,
        invalidTotal,
        undecidedTotal,
        validPercent: totalSample > 0 ? +((validTotal / totalSample) * 100).toFixed(2) : 0,
        invalidPercent: totalSample > 0 ? +((invalidTotal / totalSample) * 100).toFixed(2) : 0,
        undecidedPercent: totalSample > 0 ? +((undecidedTotal / totalSample) * 100).toFixed(2) : 0
      };
    };

    Object.assign(roleStats, {
      "Governador": buildRoleStats(govCounts, totalInterviews),
      "1º Senador": buildRoleStats(sen1Counts, totalInterviews),
      "2º Senador": buildRoleStats(sen2Counts, totalInterviews),
      "Senador": buildRoleStats(senCounts, senDivisor),
      "Deputado Federal": buildRoleStats(depFedCounts, totalInterviews),
      "Deputado Estadual": buildRoleStats(depEstCounts, totalInterviews)
    });

    Object.assign(roleRawCounts, {
      "Governador": govCounts,
      "1º Senador": sen1Counts,
      "2º Senador": sen2Counts,
      "Senador": senCounts,
      "Deputado Federal": depFedCounts,
      "Deputado Estadual": depEstCounts
    });

    // Build structured territorialRoleBreakdown for all roles across municipalities
    (["Governador", "1º Senador", "2º Senador", "Senador", "Deputado Federal", "Deputado Estadual"] as const).forEach((role) => {
      const muniMap = roleMuniData[role];
      Object.entries(muniMap).forEach(([muni, t]) => {
        const percentages: Record<string, number> = {};
        const validPercentages: Record<string, number> = {};

        Object.entries(t.counts).forEach(([cand, count]) => {
          percentages[cand] = t.totalSample > 0 ? +((count / t.totalSample) * 100).toFixed(1) : 0;
          if (cand !== "Branco/Nulo" && cand !== "Ns/Nr" && cand !== "Brancos/Nulos" && cand !== "Indecisos") {
            validPercentages[cand] = t.validTotal > 0 ? +((count / t.validTotal) * 100).toFixed(1) : 0;
          }
        });

        territorialRoleBreakdown[role][muni] = {
          counts: t.counts,
          totalSample: t.totalSample,
          validTotal: t.validTotal,
          invalidTotal: t.invalidTotal,
          undecidedTotal: t.undecidedTotal,
          percentages,
          validPercentages
        };
      });
    });

    // Legacy compatibility for Governador in territorialBreakdown
    Object.entries(territorialRoleBreakdown["Governador"]).forEach(([muni, t]) => {
      territorialBreakdown[muni] = t.validPercentages;
    });
  } else {
    // Structure A: Columnar [ { Candidato: "...", Votos: 34 }, ... ]
    const candidateColKey = headerKeys.find((k) => {
      const n = normalizeStr(k);
      return n.includes("candidato") || n.includes("nome") || n.includes("opcao") || n.includes("chapa");
    });

    const valueColKey = headerKeys.find((k) => {
      const n = normalizeStr(k);
      return (
        n.includes("voto") ||
        n.includes("percent") ||
        n.includes("intencao") ||
        n.includes("%") ||
        n.includes("total") ||
        n.includes("taxa") ||
        n.includes("valor")
      );
    });

    if (candidateColKey && valueColKey) {
      rawRows.forEach((row) => {
        const rawCand = String(row[candidateColKey] || "").trim();
        const rawVal = row[valueColKey];
        if (!rawCand) return;

        const match = matchOfficialCandidate(rawCand);
        const parsedVal = parseFlexibleNumber(rawVal);

        if (match && parsedVal > 0) {
          candidateResults[match.candidateName] = parsedVal;
          const role = match.role || "Governador";
          roleResults[role][match.candidateName] = parsedVal;
        }
      });
    } else {
      // Direct candidate headers (e.g. { "Fábio": 34, "Valmir": 30 })
      rawRows.forEach((row) => {
        headerKeys.forEach((key) => {
          const match = matchOfficialCandidate(key);
          if (match) {
            const val = parseFlexibleNumber(row[key]);
            if (val > 0) {
              candidateResults[match.candidateName] = val;
              const role = match.role || "Governador";
              roleResults[role][match.candidateName] = val;
            }
          }
        });
      });
    }
  }

  // Calculate dynamic margin of error
  const computedMargin = sampleSize > 0 
    ? +(1.96 * Math.sqrt(0.25 / sampleSize) * 100).toFixed(1) 
    : 2.8;
  let marginOfError = computedMargin;

  // Check explicit metadata
  rawRows.forEach((row) => {
    Object.entries(row).forEach(([k, v]) => {
      const normK = normalizeStr(k);
      if (normK.includes("instituto") && v) institute = String(v).trim();
      if (normK.includes("registro") && v) registryNumber = String(v).trim();
      if (normK.includes("conre") && v) conre = String(v).trim();
      if (normK.includes("estatistico") && v) statistician = String(v).trim();
      if (normK.includes("margem") && v) marginOfError = parseFlexibleNumber(v) || marginOfError;
      if (normK.includes("confianca") && v) confidenceLevel = parseFlexibleNumber(v) || confidenceLevel;
      if (normK.includes("inicio") || normK.includes("abertura") || normK.includes("start")) {
        const parsed = parseFlexibleDate(v);
        if (parsed) detectedMetaStart = parsed;
      }
      if (normK.includes("fim") || normK.includes("termino") || normK.includes("fechamento") || normK.includes("end")) {
        const parsed = parseFlexibleDate(v);
        if (parsed) detectedMetaEnd = parsed;
      }
      if (normK.includes("mediana") || normK.includes("median")) {
        const parsed = parseFlexibleDate(v);
        if (parsed) detectedMetaMedian = parsed;
      }
      if (!detectedMetaStart && (normK.includes("data") || normK.includes("periodo") || normK.includes("campo"))) {
        const range = parseDateRange(v);
        if (range.start) detectedMetaStart = range.start;
        if (range.end) detectedMetaEnd = range.end;
        if (range.median) detectedMetaMedian = range.median;
      }
    });
  });

  // Resolve best fieldworkStart, fieldworkEnd, and medianDate faithfully from data
  const resolvedStart =
    minRowDate ||
    detectedMetaStart ||
    fileNameRange.start ||
    fallbackRange.start ||
    "";

  const resolvedEnd =
    maxRowDate ||
    detectedMetaEnd ||
    fileNameRange.end ||
    fallbackRange.end ||
    resolvedStart ||
    "";

  const resolvedMedian =
    (minRowDate && maxRowDate ? computeMedianDate(minRowDate, maxRowDate) : null) ||
    detectedMetaMedian ||
    fileNameRange.median ||
    fallbackRange.median ||
    (resolvedStart && resolvedEnd ? computeMedianDate(resolvedStart, resolvedEnd) : resolvedStart || "");

  return {
    institute,
    registryNumber,
    conre,
    statistician,
    sampleSize,
    marginOfError,
    confidenceLevel,
    fieldworkStart: resolvedStart,
    fieldworkEnd: resolvedEnd,
    medianDate: resolvedMedian,
    type: "Registrada",
    results: candidateResults,
    roleResults,
    roleValidResults,
    roleRawCounts,
    roleStats,
    territorialBreakdown,
    territorialRoleBreakdown,
    rawRows,
    geoPoints: geoPoints.length > 0 ? geoPoints : undefined,
    rawRowsCount: rawRows.length,
    warnings,
    fileName
  };
}

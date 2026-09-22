/**
 * Universal Survey Question & Microdata Detector for SEIE
 * Detects 2ª Opção de Voto, Firmeza/Cristalização, Rejeição, Bairros, Pautas e Demografia
 * with zero mock / zero hallucination.
 */

import { Poll } from "../types";
import { extractRowCoordinates, getLocalGisBairro } from "./reverseGeocoder";

export interface ColumnMapping {
  key: string;
  normalizedKey: string;
  type:
    | "governador"
    | "senador"
    | "deputado_federal"
    | "deputado_estadual"
    | "presidente"
    | "segunda_opcao"
    | "firmeza"
    | "rejeicao"
    | "potencial"
    | "bairro"
    | "municipio"
    | "latitude"
    | "longitude"
    | "sexo"
    | "faixa_etaria"
    | "escolaridade"
    | "renda"
    | "religiao"
    | "problema_principal"
    | "aprovacao_governo"
    | "aprovacao_prefeitura"
    | "unknown";
}

export function normalizeHeader(key: string): string {
  if (!key) return "";
  return key
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .trim();
}

/**
 * Identify the semantic purpose of any spreadsheet column
 */
export function classifyColumn(key: string): ColumnMapping["type"] {
  const norm = normalizeHeader(key);

  // 1. Segunda Opção / Voto Secundário / Cenários
  if (
    norm.includes("segunda opcao") ||
    norm.includes("2a opcao") ||
    norm.includes("2 opcao") ||
    norm.includes("segundo voto") ||
    norm.includes("2o voto") ||
    norm.includes("segunda escolha") ||
    norm.includes("2 escolha") ||
    norm.includes("se nao fosse") ||
    norm.includes("caso desistisse") ||
    norm.includes("voto alternativo") ||
    norm.includes("segundo candidato")
  ) {
    return "segunda_opcao";
  }

  // 2. Firmeza / Cristalização do Voto
  if (
    norm.includes("firmeza") ||
    norm.includes("certeza") ||
    norm.includes("decisao") ||
    norm.includes("definitiv") ||
    norm.includes("pode mudar") ||
    norm.includes("mudaria") ||
    norm.includes("cristaliz") ||
    norm.includes("firme") ||
    norm.includes("certeza do voto") ||
    norm.includes("conviccao")
  ) {
    return "firmeza";
  }

  // 3. Rejeição
  if (
    norm.includes("rejeicao") ||
    norm.includes("rejeita") ||
    norm.includes("nao votaria") ||
    norm.includes("nao vota") ||
    norm.includes("rejeita de jeito nenhum") ||
    norm.includes("menor simpatia")
  ) {
    return "rejeicao";
  }

  // 4. Potencial / Poderia votar
  if (
    norm.includes("poderia votar") ||
    norm.includes("potencial") ||
    norm.includes("consideraria") ||
    norm.includes("chance de votar") ||
    norm.includes("segunda preferencia")
  ) {
    return "potencial";
  }

  // 5. Bairro / Localidade / Comunidade
  if (
    norm.includes("bairro") ||
    norm.includes("localidade") ||
    norm.includes("comunidade") ||
    norm.includes("povoado") ||
    norm.includes("distrito") ||
    norm.includes("zona eleitoral") ||
    norm.includes("setor") ||
    norm.includes("regiao administrativa")
  ) {
    return "bairro";
  }

  // 6. Município / Cidade
  if (
    norm.includes("municipio") ||
    norm.includes("cidade") ||
    norm.includes("territorio")
  ) {
    return "municipio";
  }

  // 7. Demografia
  if (norm.includes("sexo") || norm.includes("genero")) return "sexo";
  if (norm.includes("faixa etaria") || norm.includes("idade")) return "faixa_etaria";
  if (norm.includes("escolaridade") || norm.includes("instrucao") || norm.includes("ensino")) return "escolaridade";
  if (norm.includes("renda") || norm.includes("salario") || norm.includes("economica")) return "renda";
  if (norm.includes("religiao") || norm.includes("credo") || norm.includes("igreja")) return "religiao";

  // 8. Problema Principal / Pauta
  if (
    norm.includes("problema") ||
    norm.includes("prioridade") ||
    norm.includes("maior desafio") ||
    norm.includes("precisa melhorar")
  ) {
    return "problema_principal";
  }

  // 9. Aprovação
  if (norm.includes("aprovacao govern") || norm.includes("gestao estadual") || norm.includes("fabio mitidieri")) return "aprovacao_governo";
  if (norm.includes("aprovacao prefeit") || norm.includes("gestao municipal") || norm.includes("prefeito")) return "aprovacao_prefeitura";

  // 10. Cargos
  if (
    norm.includes("presidente") ||
    norm.includes("presidencia") ||
    norm.includes("presidente da republica") ||
    norm.includes("presidencial")
  ) {
    return "presidente";
  }
  if (norm.includes("governador") || norm.includes("governo") || norm.includes("palacio")) return "governador";
  if (norm.includes("senador") || norm.includes("senado") || norm.includes("senatorial")) return "senador";
  if (norm.includes("deputado federal") || norm.includes("dep federal") || norm.includes("camara federal") || norm.includes("deputados federais")) return "deputado_federal";
  if (norm.includes("deputado estadual") || norm.includes("dep estadual") || norm.includes("assembleia legislativa") || norm.includes("alese") || norm.includes("deputados estaduais")) return "deputado_estadual";

  return "unknown";
}

/**
 * Inspect a poll's microdata rows and return detected columns
 */
export function getSurveyColumnMap(poll: Poll): Record<ColumnMapping["type"], string | null> {
  const map: Record<ColumnMapping["type"], string | null> = {
    governador: null,
    senador: null,
    deputado_federal: null,
    deputado_estadual: null,
    presidente: null,
    segunda_opcao: null,
    firmeza: null,
    rejeicao: null,
    potencial: null,
    bairro: null,
    municipio: null,
    latitude: null,
    longitude: null,
    sexo: null,
    faixa_etaria: null,
    escolaridade: null,
    renda: null,
    religiao: null,
    problema_principal: null,
    aprovacao_governo: null,
    aprovacao_prefeitura: null,
    unknown: null
  };

  const rows = poll.rawRows || poll.data || poll.dados || poll.rows || poll.respostas || [];
  if (!rows || rows.length === 0) return map;

  const firstRow = rows[0] || {};
  const keys = Object.keys(firstRow);

  keys.forEach((key) => {
    const type = classifyColumn(key);
    if (type !== "unknown" && !map[type]) {
      map[type] = key;
    }
  });

  return map;
}

export interface RoleCandidateExtraction {
  name: string;
  votesCount: number;
  pctSample: number;
  pctValid: number;
  party?: string;
  number?: string;
  coalition?: string;
  role: string;
}

export interface RoleSurveyDataResult {
  hasData: boolean;
  role: "Governador" | "Senador" | "Deputado Federal" | "Deputado Estadual" | "Presidente";
  pollId: string;
  institute: string;
  columnFound: string | null;
  totalAnswered: number;
  totalValidAnswered: number;
  candidates: RoleCandidateExtraction[];
  indecisosCount: number;
  indecisosPct: number;
  brancosNulosCount: number;
  brancosNulosPct: number;
  validationStatus: "VALIDATED" | "NOT_FOUND";
  statusMessage: string;
}

/**
 * Extract candidates and percentages STRICTLY for a specified cargo from Diagnóstico (Pesquisas).
 * Zero hallucination: if data does not exist for that cargo, returns hasData: false.
 */
export function extractRoleSurveyData(
  poll: Poll,
  role: "Governador" | "Senador" | "Deputado Federal" | "Deputado Estadual" | "Presidente",
  officialCandidatesList?: { name: string; role: string; coalition?: string; number?: string; partyNumber?: string }[]
): RoleSurveyDataResult {
  const emptyResult: RoleSurveyDataResult = {
    hasData: false,
    role,
    pollId: poll?.id || "",
    institute: poll?.institute || "CTAS",
    columnFound: null,
    totalAnswered: 0,
    totalValidAnswered: 0,
    candidates: [],
    indecisosCount: 0,
    indecisosPct: 0,
    brancosNulosCount: 0,
    brancosNulosPct: 0,
    validationStatus: "NOT_FOUND",
    statusMessage: "DADO NÃO ENCONTRADO NA BASE DE CONHECIMENTO."
  };

  if (!poll) return emptyResult;

  const rows = poll.rawRows || poll.data || poll.dados || poll.rows || poll.respostas || [];
  const colMap = getSurveyColumnMap(poll);

  // Determine target column for this role
  let roleColKey: string | null = null;
  if (role === "Governador") roleColKey = colMap.governador;
  else if (role === "Senador") roleColKey = colMap.senador;
  else if (role === "Deputado Federal") roleColKey = colMap.deputado_federal;
  else if (role === "Deputado Estadual") roleColKey = colMap.deputado_estadual;
  else if (role === "Presidente") roleColKey = colMap.presidente;

  // Fallback: search key matching role
  if (!roleColKey && rows.length > 0) {
    const first = rows[0] || {};
    const normalizedRole = normalizeHeader(role);
    const found = Object.keys(first).find((k) => normalizeHeader(k).includes(normalizedRole));
    if (found) roleColKey = found;
  }

  // Get official candidate registry for this role
  const officialsForRole = (officialCandidatesList || []).filter((c) => c.role === role);

  // 1. Process Microdata Rows if column exists
  if (roleColKey && rows.length > 0) {
    const counts: Record<string, number> = {};
    let totalAnswered = 0;
    let indecisosCount = 0;
    let brancosNulosCount = 0;

    rows.forEach((row: any) => {
      const rawVal = row[roleColKey!];
      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === "") return;

      const valStr = String(rawVal).trim();
      const norm = normalizeHeader(valStr);
      totalAnswered++;

      if (
        norm.includes("indeciso") ||
        norm.includes("ns nr") ||
        norm.includes("nao sabe") ||
        norm.includes("nao respondeu") ||
        norm === "ns" ||
        norm === "nr"
      ) {
        indecisosCount++;
      } else if (
        norm.includes("branco") ||
        norm.includes("nulo") ||
        norm.includes("nenhum") ||
        norm === "b n" ||
        norm === "bn"
      ) {
        brancosNulosCount++;
      } else {
        counts[valStr] = (counts[valStr] || 0) + 1;
      }
    });

    if (totalAnswered > 0 && Object.keys(counts).length > 0) {
      const totalValid = Object.values(counts).reduce((a, b) => a + b, 0);

      const candidateList: RoleCandidateExtraction[] = Object.entries(counts).map(([name, count]) => {
        // Find matching official candidate in same role
        const matchOfficial = officialsForRole.find(
          (o) =>
            normalizeHeader(o.name) === normalizeHeader(name) ||
            normalizeHeader(o.name).includes(normalizeHeader(name)) ||
            normalizeHeader(name).includes(normalizeHeader(o.name))
        );

        return {
          name: matchOfficial ? matchOfficial.name : name,
          votesCount: count,
          pctSample: totalAnswered > 0 ? +((count / totalAnswered) * 100).toFixed(2) : 0,
          pctValid: totalValid > 0 ? +((count / totalValid) * 100).toFixed(2) : 0,
          party: matchOfficial?.partyNumber || matchOfficial?.coalition,
          number: matchOfficial?.number,
          coalition: matchOfficial?.coalition,
          role
        };
      });

      candidateList.sort((a, b) => b.votesCount - a.votesCount);

      return {
        hasData: true,
        role,
        pollId: poll.id,
        institute: poll.institute,
        columnFound: roleColKey,
        totalAnswered,
        totalValidAnswered: totalValid,
        candidates: candidateList,
        indecisosCount,
        indecisosPct: totalAnswered > 0 ? +((indecisosCount / totalAnswered) * 100).toFixed(2) : 0,
        brancosNulosCount,
        brancosNulosPct: totalAnswered > 0 ? +((brancosNulosCount / totalAnswered) * 100).toFixed(2) : 0,
        validationStatus: "VALIDATED",
        statusMessage: `Validado: ${totalAnswered} respostas auditadas no microdado para o cargo ${role}.`
      };
    }
  }

  // 2. Check roleResults or results in poll object
  const roleResultsMap = (poll.roleResults && poll.roleResults[role]) || (role === "Governador" ? poll.results : null);

  if (roleResultsMap && Object.keys(roleResultsMap).length > 0) {
    let indecisosPct = 0;
    let brancosNulosPct = 0;
    const nominalMap: Record<string, number> = {};

    Object.entries(roleResultsMap).forEach(([candName, pct]) => {
      const norm = normalizeHeader(candName);
      const val = Number(pct) || 0;

      if (
        norm.includes("indeciso") ||
        norm.includes("ns nr") ||
        norm.includes("nao sabe") ||
        norm.includes("nao respondeu") ||
        norm === "ns" ||
        norm === "nr"
      ) {
        indecisosPct += val;
      } else if (
        norm.includes("branco") ||
        norm.includes("nulo") ||
        norm.includes("nenhum") ||
        norm === "b n" ||
        norm === "bn"
      ) {
        brancosNulosPct += val;
      } else {
        nominalMap[candName] = val;
      }
    });

    const sumNominal = Object.values(nominalMap).reduce((a, b) => a + b, 0);

    if (sumNominal > 0) {
      const candidateList: RoleCandidateExtraction[] = Object.entries(nominalMap).map(([name, pct]) => {
        const matchOfficial = officialsForRole.find(
          (o) =>
            normalizeHeader(o.name) === normalizeHeader(name) ||
            normalizeHeader(o.name).includes(normalizeHeader(name)) ||
            normalizeHeader(name).includes(normalizeHeader(o.name))
        );

        return {
          name: matchOfficial ? matchOfficial.name : name,
          votesCount: Math.round((pct / 100) * (poll.sampleSize || 1000)),
          pctSample: +pct.toFixed(2),
          pctValid: +((pct / sumNominal) * 100).toFixed(2),
          party: matchOfficial?.partyNumber || matchOfficial?.coalition,
          number: matchOfficial?.number,
          coalition: matchOfficial?.coalition,
          role
        };
      });

      candidateList.sort((a, b) => b.pctValid - a.pctValid);

      return {
        hasData: true,
        role,
        pollId: poll.id,
        institute: poll.institute,
        columnFound: roleColKey || "Tabela de Resultados Oficiais",
        totalAnswered: poll.sampleSize || 1000,
        totalValidAnswered: Math.round(((sumNominal) / 100) * (poll.sampleSize || 1000)),
        candidates: candidateList,
        indecisosCount: Math.round((indecisosPct / 100) * (poll.sampleSize || 1000)),
        indecisosPct: +indecisosPct.toFixed(2),
        brancosNulosCount: Math.round((brancosNulosPct / 100) * (poll.sampleSize || 1000)),
        brancosNulosPct: +brancosNulosPct.toFixed(2),
        validationStatus: "VALIDATED",
        statusMessage: `Validado a partir dos resultados registrados do cargo ${role}.`
      };
    }
  }

  // 3. If neither microdata nor results are present for this role, return strict NOT_FOUND
  return {
    ...emptyResult,
    statusMessage: `DADO NÃO ENCONTRADO NA BASE DE CONHECIMENTO. A pesquisa "${poll.institute} (${poll.medianDate || poll.fieldworkEnd})" não possui registros ou questionários tabulados para o cargo de ${role}.`
  };
}

/**
 * Extract 2ª Opção transfer matrix strictly constrained to candidates of the SAME cargo.
 * Transfers to candidates of different roles are strictly prohibited and discarded.
 */
export function extractRoleSecondOptionTransfer(
  poll: Poll,
  role: "Governador" | "Senador" | "Deputado Federal" | "Deputado Estadual" | "Presidente",
  validCandidateNamesInRole: string[]
): {
  hasData: boolean;
  totalAnswered: number;
  matrix: Record<string, Record<string, number>>; // mainCandidate -> { secondCandidate (same role only): count }
  candidateTotals: Record<string, number>;
} {
  const colMap = getSurveyColumnMap(poll);

  let mainColKey: string | null = null;
  if (role === "Governador") mainColKey = colMap.governador;
  else if (role === "Senador") mainColKey = colMap.senador;
  else if (role === "Deputado Federal") mainColKey = colMap.deputado_federal;
  else if (role === "Deputado Estadual") mainColKey = colMap.deputado_estadual;
  else if (role === "Presidente") mainColKey = colMap.presidente;

  const secColKey = colMap.segunda_opcao;

  const rows = poll.rawRows || poll.data || poll.dados || poll.rows || poll.respostas || [];
  if (!mainColKey || !secColKey || rows.length === 0) {
    return { hasData: false, totalAnswered: 0, matrix: {}, candidateTotals: {} };
  }

  const matrix: Record<string, Record<string, number>> = {};
  const candidateTotals: Record<string, number> = {};
  let totalAnswered = 0;

  const normalizedValidNames = validCandidateNamesInRole.map((n) => ({
    original: n,
    norm: normalizeHeader(n)
  }));

  rows.forEach((row: any) => {
    const rawMain = row[mainColKey!];
    const rawSec = row[secColKey!];

    if (!rawMain || !rawSec) return;

    const mainStr = String(rawMain).trim();
    const secStr = String(rawSec).trim();

    const mainNorm = normalizeHeader(mainStr);
    const secNorm = normalizeHeader(secStr);

    // Validate that main vote is within the same role
    const matchedMain = normalizedValidNames.find(
      (c) => c.norm === mainNorm || c.norm.includes(mainNorm) || mainNorm.includes(c.norm)
    );

    // Validate that second vote is ALSO strictly within the same role
    const matchedSec = normalizedValidNames.find(
      (c) => c.norm === secNorm || c.norm.includes(secNorm) || secNorm.includes(c.norm)
    );

    if (matchedMain && matchedSec && matchedMain.original !== matchedSec.original) {
      totalAnswered++;
      candidateTotals[matchedMain.original] = (candidateTotals[matchedMain.original] || 0) + 1;

      if (!matrix[matchedMain.original]) matrix[matchedMain.original] = {};
      matrix[matchedMain.original][matchedSec.original] =
        (matrix[matchedMain.original][matchedSec.original] || 0) + 1;
    }
  });

  return {
    hasData: totalAnswered > 0,
    totalAnswered,
    matrix,
    candidateTotals
  };
}

/**
 * Extract 2ª Opção transfer matrix if column exists in microdata
 */
export function extractSecondOptionTransferMatrix(
  poll: Poll,
  mainVoteKey?: string,
  secondVoteKey?: string
): {
  hasData: boolean;
  totalAnswered: number;
  matrix: Record<string, Record<string, number>>; // mainCandidate -> { secondCandidate: count }
  candidateTotals: Record<string, number>;
} {
  const colMap = getSurveyColumnMap(poll);
  const mainCol = mainVoteKey || colMap.governador || "Governador";
  const secCol = secondVoteKey || colMap.segunda_opcao;

  const rows = poll.rawRows || poll.data || poll.dados || poll.rows || poll.respostas || [];
  if (!secCol || !rows || rows.length === 0) {
    return { hasData: false, totalAnswered: 0, matrix: {}, candidateTotals: {} };
  }

  const matrix: Record<string, Record<string, number>> = {};
  const candidateTotals: Record<string, number> = {};
  let totalAnswered = 0;

  rows.forEach((row: any) => {
    const mainVal = String(row[mainCol] || "").trim();
    const secVal = String(row[secCol] || "").trim();

    if (mainVal && secVal) {
      totalAnswered++;
      candidateTotals[mainVal] = (candidateTotals[mainVal] || 0) + 1;

      if (!matrix[mainVal]) matrix[mainVal] = {};
      matrix[mainVal][secVal] = (matrix[mainVal][secVal] || 0) + 1;
    }
  });

  return {
    hasData: totalAnswered > 0,
    totalAnswered,
    matrix,
    candidateTotals
  };
}

/**
 * Extract Firmeza / Cristalização distribution per candidate
 */
export function extractCrystalizationData(poll: Poll): {
  hasData: boolean;
  totalAnswered: number;
  overall: { definitivo: number; podeMudar: number; indeciso: number };
  byCandidate: Record<string, { definitivo: number; podeMudar: number; total: number; pctFirmeza: number }>;
} {
  const colMap = getSurveyColumnMap(poll);
  const mainCol = colMap.governador || "Governador";
  const firmezaCol = colMap.firmeza;

  const rows = poll.rawRows || poll.data || poll.dados || poll.rows || poll.respostas || [];
  if (!firmezaCol || !rows || rows.length === 0) {
    return {
      hasData: false,
      totalAnswered: 0,
      overall: { definitivo: 0, podeMudar: 0, indeciso: 0 },
      byCandidate: {}
    };
  }

  let definitivoTotal = 0;
  let podeMudarTotal = 0;
  let indecisoTotal = 0;
  let totalAnswered = 0;
  const byCandidate: Record<string, { definitivo: number; podeMudar: number; total: number; pctFirmeza: number }> = {};

  rows.forEach((row: any) => {
    const mainVal = String(row[mainCol] || "").trim();
    const fVal = normalizeHeader(String(row[firmezaCol] || ""));

    if (fVal) {
      totalAnswered++;
      const isDefinitivo = fVal.includes("definitiv") || fVal.includes("certeza") || fVal.includes("firme") || fVal.includes("nao mud") || fVal.includes("cristaliz");
      const isPodeMudar = fVal.includes("pode mudar") || fVal.includes("talvez") || fVal.includes("duvida") || fVal.includes("mudaria");

      if (isDefinitivo) definitivoTotal++;
      else if (isPodeMudar) podeMudarTotal++;
      else indecisoTotal++;

      if (mainVal) {
        if (!byCandidate[mainVal]) {
          byCandidate[mainVal] = { definitivo: 0, podeMudar: 0, total: 0, pctFirmeza: 0 };
        }
        byCandidate[mainVal].total++;
        if (isDefinitivo) byCandidate[mainVal].definitivo++;
        if (isPodeMudar) byCandidate[mainVal].podeMudar++;
      }
    }
  });

  Object.keys(byCandidate).forEach((c) => {
    const item = byCandidate[c];
    item.pctFirmeza = item.total > 0 ? +((item.definitivo / item.total) * 100).toFixed(1) : 0;
  });

  return {
    hasData: totalAnswered > 0,
    totalAnswered,
    overall: {
      definitivo: totalAnswered > 0 ? +((definitivoTotal / totalAnswered) * 100).toFixed(1) : 0,
      podeMudar: totalAnswered > 0 ? +((podeMudarTotal / totalAnswered) * 100).toFixed(1) : 0,
      indeciso: totalAnswered > 0 ? +((indecisoTotal / totalAnswered) * 100).toFixed(1) : 0
    },
    byCandidate
  };
}

/**
 * Extract Neighborhood / Localities Breakdown with Tactical Status exclusively from real microdata
 */
export interface NeighborhoodMetric {
  bairro: string;
  municipio: string;
  amostra: number;
  lider: string;
  liderVotos: number;
  liderPct: number;
  segundo: string;
  segundoVotos: number;
  segundoPct: number;
  diferenca: number;
  indecisosPct: number;
  brancosNulosPct: number;
  statusTatico: "fortaleza" | "campo_de_batalha" | "adverso" | "baixa_amostra";
  metaViradaVotos: number;
  sourceBadge?: string;
}

export function extractNeighborhoodMetrics(
  poll: Poll,
  leadCandidateName?: string,
  role: string = "Governador",
  externalRows?: any[]
): {
  hasData: boolean;
  totalBairros: number;
  metrics: NeighborhoodMetric[];
  summary: {
    fortalezas: number;
    camposDeBatalha: number;
    adversos: number;
    totalAmostra: number;
  };
} {
  const colMap = getSurveyColumnMap(poll);
  
  // Resolve role column
  let voteCol: string | null = null;
  const roleNorm = normalizeHeader(role);
  if (roleNorm.includes("governador") || roleNorm.includes("governo")) {
    voteCol = colMap.governador;
  } else if (roleNorm.includes("senador") || roleNorm.includes("senado")) {
    voteCol = colMap.senador;
  } else if (roleNorm.includes("federal")) {
    voteCol = colMap.deputado_federal;
  } else if (roleNorm.includes("estadual")) {
    voteCol = colMap.deputado_estadual;
  }

  const rows = externalRows && externalRows.length > 0
    ? externalRows
    : poll.rawRows || poll.data || poll.dados || poll.rows || poll.respostas || (poll as any).coletas || (poll as any).questionarios || [];

  if (!rows || rows.length === 0) {
    return {
      hasData: false,
      totalBairros: 0,
      metrics: [],
      summary: { fortalezas: 0, camposDeBatalha: 0, adversos: 0, totalAmostra: 0 }
    };
  }

  // Auto-detect columns from first row if not mapped
  const firstRow = rows[0] || {};
  const allKeys = Object.keys(firstRow);

  const bairroCol = colMap.bairro || allKeys.find((k) => {
    const n = normalizeHeader(k);
    return n.includes("bairro") || n.includes("localidade") || n.includes("povoado") || n.includes("comunidade") || n.includes("setor");
  }) || null;

  const muniCol = colMap.municipio || allKeys.find((k) => {
    const n = normalizeHeader(k);
    return n.includes("municipio") || n.includes("cidade") || n.includes("territorio");
  }) || null;

  if (!voteCol) {
    voteCol = allKeys.find((k) => {
      const n = normalizeHeader(k);
      if (roleNorm.includes("governador") && (n.includes("govern") || n.includes("governo"))) return true;
      if (roleNorm.includes("senador") && (n.includes("senad") || n.includes("senador"))) return true;
      if (roleNorm.includes("federal") && (n.includes("federal") || n.includes("dep federal"))) return true;
      if (roleNorm.includes("estadual") && (n.includes("estadual") || n.includes("dep estadual"))) return true;
      return false;
    }) || colMap.governador || allKeys.find((k) => {
      const n = normalizeHeader(k);
      return !n.includes("bairro") && !n.includes("municipio") && !n.includes("cidade") && !n.includes("sexo") && !n.includes("idade") && !n.includes("renda") && !n.includes("lat") && !n.includes("long") && !n.includes("id");
    }) || null;
  }

  // Check if rows have coordinates even if bairroCol is missing
  const sampleCoords = rows.length > 0 ? extractRowCoordinates(rows[0]) : null;
  if (!bairroCol && !sampleCoords) {
    return {
      hasData: false,
      totalBairros: 0,
      metrics: [],
      summary: { fortalezas: 0, camposDeBatalha: 0, adversos: 0, totalAmostra: 0 }
    };
  }

  const neighborhoodTallies: Record<
    string,
    {
      bairro: string;
      muni: string;
      counts: Record<string, number>;
      total: number;
      indecisos: number;
      brancosNulos: number;
    }
  > = {};

  rows.forEach((row: any) => {
    let rawBairro = bairroCol ? String(row[bairroCol] || "").trim() : "";
    let rawMuni = muniCol ? String(row[muniCol] || "").trim() : "";

    // If no text bairro, check GPS coordinates
    if (!rawBairro) {
      const coords = extractRowCoordinates(row);
      if (coords) {
        const gis = getLocalGisBairro(coords.lat, coords.lng, rawMuni || undefined);
        rawBairro = gis.bairro;
        if (!rawMuni) rawMuni = gis.municipio;
      }
    }

    if (!rawBairro || rawBairro.toUpperCase() === "NÃO IDENTIFICADO" || rawBairro.toUpperCase() === "FORA DO ESTADO") return;
    if (!rawMuni) rawMuni = "Sergipe";

    const cand = voteCol ? String(row[voteCol] || "Indeciso").trim() : "Indeciso";

    const key = `${rawBairro.trim()}__${rawMuni.trim()}`.toLowerCase();
    if (!neighborhoodTallies[key]) {
      neighborhoodTallies[key] = {
        bairro: rawBairro.trim(),
        muni: rawMuni.trim(),
        counts: {},
        total: 0,
        indecisos: 0,
        brancosNulos: 0
      };
    }

    const item = neighborhoodTallies[key];
    item.total++;
    item.counts[cand] = (item.counts[cand] || 0) + 1;

    const normCand = normalizeHeader(cand);
    if (normCand.includes("indeciso") || normCand.includes("ns nr") || normCand.includes("nao sabe") || normCand.includes("nao respondeu")) {
      item.indecisos++;
    } else if (normCand.includes("branco") || normCand.includes("nulo") || normCand.includes("nenhum") || normCand.includes("ninguem")) {
      item.brancosNulos++;
    }
  });

  const metrics: NeighborhoodMetric[] = [];
  let fortalezasCount = 0;
  let camposCount = 0;
  let adversosCount = 0;

  Object.values(neighborhoodTallies).forEach((data) => {
    const total = data.total;
    if (total === 0) return;

    // Filter candidate list excluding neutral/invalid
    const validCands = Object.entries(data.counts)
      .filter(([name]) => {
        const norm = normalizeHeader(name);
        return !norm.includes("branco") && !norm.includes("nulo") && !norm.includes("indeciso") && !norm.includes("ns nr") && !norm.includes("nao sabe") && !norm.includes("nenhum");
      })
      .sort((a, b) => b[1] - a[1]);

    const lider = validCands[0] ? validCands[0][0] : "Indefinido";
    const liderVotos = validCands[0] ? validCands[0][1] : 0;
    const liderPct = total > 0 ? +((liderVotos / total) * 100).toFixed(1) : 0;

    const segundo = validCands[1] ? validCands[1][0] : "-";
    const segundoVotos = validCands[1] ? validCands[1][1] : 0;
    const segundoPct = total > 0 ? +((segundoVotos / total) * 100).toFixed(1) : 0;

    const diferenca = +(liderPct - segundoPct).toFixed(1);
    const indecisosPct = +((data.indecisos / total) * 100).toFixed(1);
    const brancosNulosPct = +((data.brancosNulos / total) * 100).toFixed(1);

    // Identify candidate vote count & Open Dispute mode
    const isOpenDispute = !leadCandidateName || leadCandidateName === "DISPUTA_ABERTA" || leadCandidateName === "TODOS" || leadCandidateName === "GERAL";
    
    let candVotos = 0;
    if (!isOpenDispute && leadCandidateName) {
      const candMatch = Object.entries(data.counts).find(([name]) =>
        normalizeHeader(name).includes(normalizeHeader(leadCandidateName)) ||
        normalizeHeader(leadCandidateName).includes(normalizeHeader(name))
      );
      if (candMatch) {
        candVotos = candMatch[1];
      }
    }

    const isLeaderFavored = isOpenDispute
      ? true
      : leadCandidateName
      ? normalizeHeader(lider).includes(normalizeHeader(leadCandidateName)) || normalizeHeader(leadCandidateName).includes(normalizeHeader(lider))
      : true;

    // Tactical Status Classification
    let statusTatico: NeighborhoodMetric["statusTatico"] = "campo_de_batalha";
    if (total < 5) {
      statusTatico = "baixa_amostra";
    } else if (isOpenDispute) {
      // In open dispute mode:
      // If gap > 10 pp, one candidate has strong local dominance (fortaleza local)
      // If gap <= 10 pp, it is an active battlefield between top contenders
      if (diferenca > 10) {
        statusTatico = "fortaleza";
        fortalezasCount++;
      } else {
        statusTatico = "campo_de_batalha";
        camposCount++;
      }
    } else if (isLeaderFavored && diferenca > 10) {
      statusTatico = "fortaleza";
      fortalezasCount++;
    } else if (!isLeaderFavored && diferenca > 10) {
      statusTatico = "adverso";
      adversosCount++;
    } else {
      statusTatico = "campo_de_batalha";
      camposCount++;
    }

    // Meta de Virada de Votos exata
    let metaViradaVotos = 0;
    if (isOpenDispute) {
      // In open dispute: votes needed for #2 to surpass #1
      if (liderVotos > segundoVotos) {
        metaViradaVotos = Math.ceil(Math.abs(liderVotos - segundoVotos) / 2) + 1;
      }
    } else if (!isLeaderFavored && liderVotos > candVotos) {
      metaViradaVotos = Math.ceil(Math.abs(liderVotos - candVotos) / 2) + 1;
    }

    metrics.push({
      bairro: data.bairro,
      municipio: data.muni,
      amostra: total,
      lider,
      liderVotos,
      liderPct,
      segundo,
      segundoVotos,
      segundoPct,
      diferenca,
      indecisosPct,
      brancosNulosPct,
      statusTatico,
      metaViradaVotos,
      sourceBadge: "Questionário Base"
    });
  });

  // Sort by sample size descending
  metrics.sort((a, b) => b.amostra - a.amostra);

  return {
    hasData: metrics.length > 0,
    totalBairros: metrics.length,
    metrics,
    summary: {
      fortalezas: fortalezasCount,
      camposDeBatalha: camposCount,
      adversos: adversosCount,
      totalAmostra: rows.length
    }
  };
}

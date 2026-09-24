import { CANDIDATOS_OFICIAIS_2026, OfficialCandidate2026 } from "./candidatosOficiais2026";
import { Poll, RoleStatistics } from "../types";
import { DataProvenance, createProjectionProvenance } from "../types/provenance";
import { parseFlexibleDate, parseDateRange } from "../utils/fileParser";
import {
  TSE_SERGIPE_OFFICIAL_REFERENCE,
  SERGIPE_VALID_VOTES_PROJECTION,
  SERGIPE_MAX_ELECTORATE_PROJECTION
} from "./electionReference";

export interface CandidateProjection extends OfficialCandidate2026 {
  rank: number;
  partyRank?: number; // Posição dentro do partido/federação
  pollDate1: number; // Pesquisa 1 (% Válidos)
  pollDate2: number; // Pesquisa 2 (% Válidos)
  pollDate3: number; // Pesquisa 3 (% Válidos)
  pollAverage: number; // Média calibrada % Votos Válidos (critério oficial TSE)
  pollDate1Total: number; // Pesquisa 1 (% Total)
  pollDate2Total: number; // Pesquisa 2 (% Total)
  pollDate3Total: number; // Pesquisa 3 (% Total)
  pollAverageTotal: number; // Média calibrada % Votos Totais (amostra geral)
  projectedVotes: number; // Quantidade de votos nominais projetados
  rawVotesSample?: number; // Votos brutos na amostra
  status: "ELEITO" | "SEGUNDO_TURNO" | "SUPLENTE" | "NAO_ELEITO";
  statusLabel: string;
  seatNumber?: number; // 1 to 24
  provenance?: DataProvenance;
}

export interface NonValidOption {
  name: string;
  count: number;
  percentageTotal: number;
}

export interface NonValidItem {
  id: string;
  name: string;
  shortTag: string;
  number: string;
  pollDate1Total: number;
  pollDate2Total: number;
  pollDate3Total: number;
  pollAverageTotal: number;
  pollDate1Valid: number;
  pollDate2Valid: number;
  pollDate3Valid: number;
  pollAverageValid: number;
  count: number;
  projectedVotes: number;
  description: string;
}

export interface RoleAggregateStats extends RoleStatistics {
  role: OfficialCandidate2026["role"];
  totalNominalCandidates: number;
  totalValidSumPercent: number;
  totalSampleSumPercent: number;
  nominalCandidatesSamplePercent: number;
  brancoNuloSamplePercent: number;
  indecisosSamplePercent: number;
  nonValidItems: NonValidItem[];
  nonValidOptions: NonValidOption[];
  provenance?: DataProvenance;
}

export interface PartySeatProjection {
  partyOrCoalition: string;
  partyNumber: string;
  totalVotes: number;
  votePercentage: number;
  directSeatsQP: number; // Cadeiras diretas via Quociente Partidário (QP)
  remainderSeats: number; // Cadeiras obtidas na distribuição de sobras (médias D'Hondt)
  totalSeats: number; // directSeatsQP + remainderSeats
  qeMultiple: number; // Quantas vezes atingiu o QE (ex: 1.8x, 0.6x)
  reachedQE: boolean; // Se atingiu o Quociente Eleitoral
  electedCandidates: {
    name: string;
    number: string;
    projectedVotes: number;
    pollAverage: number;
    rankOverall: number;
  }[];
  alternateCandidates: {
    name: string;
    number: string;
    projectedVotes: number;
    pollAverage: number;
    alternateRank: number;
  }[];
}

export interface ProportionalCalculationResult {
  role: "Deputado Federal" | "Deputado Estadual";
  totalValidVotes: number;
  totalSeats: number;
  electoralQuotient: number; // Quociente Eleitoral (QE)
  parties: PartySeatProjection[];
  totalDirectQPSeats: number;
  totalRemainderSeats: number;
  provenance?: DataProvenance;
}

export interface PollHeaderInfo {
  date1: string;
  institute1: string;
  date2: string;
  institute2: string;
  date3: string;
  institute3: string;
  isDynamic: boolean;
  totalPollsCount: number;
}

export const EMPTY_POLL_HEADER: PollHeaderInfo = {
  date1: "-",
  institute1: "-",
  date2: "-",
  institute2: "-",
  date3: "-",
  institute3: "-",
  isDynamic: false,
  totalPollsCount: 0
};

export const DEFAULT_POLL_DATES: PollHeaderInfo = EMPTY_POLL_HEADER;
export const POLL_DATES = EMPTY_POLL_HEADER;

// Estimativa de Votos Válidos (Desconto de ~20% abstenções e ~5% brancos/nulos) - ESTIMATED
export const TOTAL_VOTOS_VALIDOS_ESTIMADOS = SERGIPE_VALID_VOTES_PROJECTION.electorate;
// Projeção Demográfica Eleitoral para Fechamento de Cadastro 2026 - PROJECTION
export const TOTAL_ELEITORADO_SERGIPE = SERGIPE_MAX_ELECTORATE_PROJECTION.electorate;
// Eleitorado Oficial TSE Apto Cadastrado em Sergipe - OFFICIAL
export const TOTAL_ELEITORADO_OFICIAL_TSE = TSE_SERGIPE_OFFICIAL_REFERENCE.electorate;

// Flexible name matcher
function findCandidateInPollResults(candidateName: string, results: Record<string, number>): number | null {
  if (!results) return null;
  if (results[candidateName] !== undefined) return results[candidateName];

  const cleanName = candidateName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const [key, val] of Object.entries(results)) {
    const cleanKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (cleanKey === cleanName) return val;
    if (cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) return val;
    
    // First name match
    const firstWordKey = cleanKey.split(" ")[0];
    const firstWordName = cleanName.split(" ")[0];
    if (firstWordKey.length > 3 && firstWordKey === firstWordName) {
      if (cleanName.includes("fabio") && cleanKey.includes("fabio")) return val;
      if (cleanName.includes("valmir") && cleanKey.includes("valmir")) return val;
      if (cleanName.includes("rogerio") && cleanKey.includes("rogerio")) return val;
      if (cleanName.includes("emilia") && cleanKey.includes("emilia")) return val;
      if (cleanName.includes("alessandro") && cleanKey.includes("alessandro")) return val;
      if (cleanName.includes("yandra") && cleanKey.includes("yandra")) return val;
      if (cleanName.includes("cristiano") && cleanKey.includes("cristiano")) return val;
    }
  }
  return null;
}

// Calculate Proportional Quotient (QE, QP and Sobras D'Hondt) for legislative roles
export function getProportionalSeatsAnalysis(
  role: "Deputado Federal" | "Deputado Estadual",
  calculatedCandidates: CandidateProjection[],
  customTotalValidVotes: number = TOTAL_VOTOS_VALIDOS_ESTIMADOS
): ProportionalCalculationResult {
  const totalSeats = role === "Deputado Federal" ? 8 : 24;
  const totalValidVotes = customTotalValidVotes > 0 ? customTotalValidVotes : TOTAL_VOTOS_VALIDOS_ESTIMADOS;
  // Quociente Eleitoral (QE) = Total de Votos Válidos / Número de Cadeiras (arredondado / inteiro)
  const electoralQuotient = Math.max(1, Math.round(totalValidVotes / totalSeats));

  // Group candidates by Party / Federation / Coalition
  const partyMap: Record<
    string,
    {
      partyOrCoalition: string;
      partyNumber: string;
      candidates: CandidateProjection[];
    }
  > = {};

  calculatedCandidates.forEach((cand) => {
    const key = cand.coalition || cand.partyName || cand.partyNumber || "Outros";
    if (!partyMap[key]) {
      partyMap[key] = {
        partyOrCoalition: key,
        partyNumber: cand.partyNumber,
        candidates: []
      };
    }
    partyMap[key].candidates.push(cand);
  });

  interface TempParty {
    partyOrCoalition: string;
    partyNumber: string;
    totalVotes: number;
    votePercentage: number;
    directSeatsQP: number;
    remainderSeats: number;
    totalSeats: number;
    qeMultiple: number;
    reachedQE: boolean;
    candidates: CandidateProjection[];
  }

  const partyList: TempParty[] = Object.values(partyMap).map((item) => {
    // Sort party candidates by highest votes/average
    item.candidates.sort((a, b) => b.pollAverage - a.pollAverage || b.projectedVotes - a.projectedVotes);

    // Annotate party internal rank (1st, 2nd, 3rd in party)
    item.candidates.forEach((c, idx) => {
      c.partyRank = idx + 1;
    });

    const totalVotes = item.candidates.reduce((sum, c) => sum + c.projectedVotes, 0);
    const votePercentage = +((totalVotes / totalValidVotes) * 100).toFixed(2);
    // Quociente Partidário (QP) = Total de Votos do Partido / QE (número inteiro)
    const directSeatsQP = Math.floor(totalVotes / electoralQuotient);
    const reachedQE = totalVotes >= electoralQuotient;
    const qeMultiple = +(totalVotes / electoralQuotient).toFixed(2);

    return {
      partyOrCoalition: item.partyOrCoalition,
      partyNumber: item.partyNumber,
      totalVotes,
      votePercentage,
      directSeatsQP,
      remainderSeats: 0,
      totalSeats: directSeatsQP,
      qeMultiple,
      reachedQE,
      candidates: item.candidates
    };
  });

  const initialAssignedSeats = partyList.reduce((acc, p) => acc + p.directSeatsQP, 0);
  const seatsToDistribute = totalSeats - initialAssignedSeats;

  // Distribuição de Sobras (Método das Maiores Médias / D'Hondt)
  if (seatsToDistribute > 0 && partyList.length > 0) {
    for (let s = 0; s < seatsToDistribute; s++) {
      let highestAverage = -1;
      let winningPartyIndex = -1;

      partyList.forEach((p, idx) => {
        // Regra D'Hondt: Média = Votos do Partido / (Vagas já obtidas + 1)
        const currentSeats = p.directSeatsQP + p.remainderSeats;
        const average = p.totalVotes / (currentSeats + 1);

        if (average > highestAverage) {
          highestAverage = average;
          winningPartyIndex = idx;
        }
      });

      if (winningPartyIndex !== -1) {
        partyList[winningPartyIndex].remainderSeats += 1;
        partyList[winningPartyIndex].totalSeats += 1;
      }
    }
  }

  // Sort party ranking by total seats then total votes
  partyList.sort((a, b) => b.totalSeats - a.totalSeats || b.totalVotes - a.totalVotes);

  const parties: PartySeatProjection[] = partyList.map((p) => {
    const electedCandidates = p.candidates.slice(0, p.totalSeats).map((c, idx) => ({
      name: c.name,
      number: c.number,
      projectedVotes: c.projectedVotes,
      pollAverage: c.pollAverage,
      rankOverall: c.rank
    }));

    const alternateCandidates = p.candidates.slice(p.totalSeats, p.totalSeats + 6).map((c, idx) => ({
      name: c.name,
      number: c.number,
      projectedVotes: c.projectedVotes,
      pollAverage: c.pollAverage,
      alternateRank: idx + 1
    }));

    return {
      partyOrCoalition: p.partyOrCoalition,
      partyNumber: p.partyNumber,
      totalVotes: p.totalVotes,
      votePercentage: p.votePercentage,
      directSeatsQP: p.directSeatsQP,
      remainderSeats: p.remainderSeats,
      totalSeats: p.totalSeats,
      qeMultiple: p.qeMultiple,
      reachedQE: p.reachedQE,
      electedCandidates,
      alternateCandidates
    };
  });

  const totalDirectQPSeats = parties.reduce((sum, p) => sum + p.directSeatsQP, 0);
  const totalRemainderSeats = parties.reduce((sum, p) => sum + p.remainderSeats, 0);

  return {
    role,
    totalValidVotes,
    totalSeats,
    electoralQuotient,
    parties,
    totalDirectQPSeats,
    totalRemainderSeats
  };
}

// Generate calibrated projection list for any role, dynamically reflecting customPolls
export function getProjectionsByRole(
  role: OfficialCandidate2026["role"],
  customPolls?: Poll[]
): {
  candidates: CandidateProjection[];
  proportionalResult?: ProportionalCalculationResult;
  pollHeaderInfo: PollHeaderInfo;
  roleStats?: RoleAggregateStats;
} {
  if (!customPolls || customPolls.length === 0) {
    return {
      candidates: [],
      proportionalResult: undefined,
      pollHeaderInfo: EMPTY_POLL_HEADER,
      roleStats: undefined
    };
  }

  const candidatesInRole = CANDIDATOS_OFICIAIS_2026.filter((c) => c.role === role);

  const getPollTime = (p: Poll) => {
    const candidates = [
      p.medianDate,
      p.fieldworkEnd,
      (p as any).fimColeta,
      (p as any).dataFim,
      p.fieldworkStart,
      (p as any).dataPesquisa,
      (p as any).date,
      (p as any).createdAt,
      (p as any).data
    ];
    for (const c of candidates) {
      const parsed = parseFlexibleDate(c);
      if (parsed && parsed !== "1970-01-01") {
        const t = new Date(parsed + "T12:00:00").getTime();
        if (!isNaN(t)) return t;
      }
    }
    if (p.fileName) {
      const range = parseDateRange(p.fileName);
      if (range.median && range.median !== "1970-01-01") {
        const t = new Date(range.median + "T12:00:00").getTime();
        if (!isNaN(t)) return t;
      }
    }
    return 0;
  };

  // Filter polls that contain data for this specific role so that a poll without this role
  // is never mistakenly selected as the "latest poll" for this role.
  const pollsWithRole = customPolls.filter((p) => {
    const vr = p.roleValidResults;
    const tr = p.roleResults;
    if (vr && vr[role] && Object.keys(vr[role]).length > 0) return true;
    if (role === "Senador" && vr && ((vr["1º Senador"] && Object.keys(vr["1º Senador"]).length > 0) || (vr["2º Senador"] && Object.keys(vr["2º Senador"]).length > 0))) return true;

    if (tr && tr[role] && Object.keys(tr[role]).length > 0) return true;
    if (role === "Senador" && tr && ((tr["1º Senador"] && Object.keys(tr["1º Senador"]).length > 0) || (tr["2º Senador"] && Object.keys(tr["2º Senador"]).length > 0))) return true;

    if (p.results && Object.keys(p.results).length > 0) {
      const hasAnyCand = candidatesInRole.some(c => findCandidateInPollResults(c.name, p.results) !== null);
      if (hasAnyCand) return true;
      if (role === "Governador") return true;
    }
    return false;
  });

  const activePollsForRole = pollsWithRole.length > 0 ? pollsWithRole : customPolls;
  const sortedPolls = [...activePollsForRole].sort((a, b) => getPollTime(a) - getPollTime(b));

  const pCount = sortedPolls.length;
  const latestPoll = sortedPolls[pCount - 1];
  const prevPoll1 = pCount >= 2 ? sortedPolls[pCount - 2] : sortedPolls[0];
  const prevPoll2 = pCount >= 3 ? sortedPolls[pCount - 3] : prevPoll1;

  const formatDate = (poll: Poll, fallbackIdx: number) => {
    const candidates = [
      poll.medianDate,
      poll.fieldworkEnd,
      (poll as any).fimColeta,
      (poll as any).dataFim,
      poll.fieldworkStart,
      (poll as any).dataPesquisa,
      (poll as any).date,
      (poll as any).createdAt,
      (poll as any).data
    ];
    for (const c of candidates) {
      const parsed = parseFlexibleDate(c);
      if (parsed && parsed !== "1970-01-01") {
        const parts = parsed.split("-");
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }
    }
    if (poll.fileName) {
      const range = parseDateRange(poll.fileName);
      if (range.median && range.median !== "1970-01-01") {
        const parts = range.median.split("-");
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }
    }
    return `Pesquisa ${fallbackIdx}`;
  };

  const dynamicHeader: PollHeaderInfo = {
    date1: formatDate(prevPoll2, pCount >= 3 ? pCount - 2 : 1),
    institute1: `${prevPoll2.institute} (${prevPoll2.registryNumber ? prevPoll2.registryNumber : "SEIE Data"})`,
    date2: formatDate(prevPoll1, pCount >= 2 ? pCount - 1 : 1),
    institute2: `${prevPoll1.institute} (${prevPoll1.registryNumber ? prevPoll1.registryNumber : "SEIE Data"})`,
    date3: formatDate(latestPoll, pCount),
    institute3: `${latestPoll.institute} (${latestPoll.registryNumber ? latestPoll.registryNumber : "SEIE Data"})`,
    isDynamic: true,
    totalPollsCount: pCount
  };

  // Helper to retrieve valid and total percentages for a given poll
  const getPollPercentages = (poll: Poll) => {
    let validMap = (poll.roleValidResults && poll.roleValidResults[role]) || {};
    let totalMap = (poll.roleResults && poll.roleResults[role]) || {};

    if (role === "Senador") {
      if (Object.keys(validMap).length === 0 && poll.roleValidResults && poll.roleValidResults["1º Senador"]) {
        validMap = poll.roleValidResults["1º Senador"];
      }
      if (Object.keys(totalMap).length === 0 && poll.roleResults && poll.roleResults["1º Senador"]) {
        totalMap = poll.roleResults["1º Senador"];
      }
    }

    if (Object.keys(totalMap).length === 0) {
      totalMap = poll.results || {};
    }
    
    // If validMap is empty but totalMap has data, re-normalize nominal candidates
    let resolvedValid = validMap;
    if (Object.keys(resolvedValid).length === 0 && Object.keys(totalMap).length > 0) {
      const nominalOnly: Record<string, number> = {};
      let totalNominal = 0;
      Object.entries(totalMap).forEach(([k, v]) => {
        const norm = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const isNonValid = norm.includes("branco") || norm.includes("nulo") || norm.includes("ns/nr") || norm.includes("indeciso") || norm.includes("nao sabe") || norm.includes("nao respondeu");
        if (!isNonValid) {
          nominalOnly[k] = v;
          totalNominal += v;
        }
      });
      resolvedValid = {};
      Object.entries(nominalOnly).forEach(([k, v]) => {
        resolvedValid[k] = totalNominal > 0 ? +((v / totalNominal) * 100).toFixed(2) : 0;
      });
    }

    return { validMap: resolvedValid, totalMap };
  };

  const latestPercentages = getPollPercentages(latestPoll);
  const prev1Percentages = getPollPercentages(prevPoll1);
  const prev2Percentages = getPollPercentages(prevPoll2);

  // Helper to extract non-valid votes from total map
  const extractNonValidVotes = (totalMap: Record<string, number>) => {
    let brancoNulo = 0;
    let indecisos = 0;

    Object.entries(totalMap).forEach(([k, v]) => {
      const norm = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      if (
        norm.includes("branco") ||
        norm.includes("nulo") ||
        norm === "b/n" ||
        norm === "bn"
      ) {
        brancoNulo += Number(v) || 0;
      } else if (
        norm.includes("indeciso") ||
        norm.includes("ns/nr") ||
        norm.includes("nao sabe") ||
        norm.includes("nao respondeu") ||
        norm === "ns" ||
        norm === "nr"
      ) {
        indecisos += Number(v) || 0;
      }
    });

    return {
      brancoNulo: +brancoNulo.toFixed(2),
      indecisos: +indecisos.toFixed(2)
    };
  };

  const latestNonValid = extractNonValidVotes(latestPercentages.totalMap);
  const prev1NonValid = extractNonValidVotes(prev1Percentages.totalMap);
  const prev2NonValid = extractNonValidVotes(prev2Percentages.totalMap);

  const calculated: CandidateProjection[] = candidatesInRole.map((c) => {
    // 1. Valid % (% Votos Válidos)
    const val3Valid = findCandidateInPollResults(c.name, latestPercentages.validMap);
    const val2Valid = findCandidateInPollResults(c.name, prev1Percentages.validMap);
    const val1Valid = findCandidateInPollResults(c.name, prev2Percentages.validMap);

    const p3Valid = val3Valid !== null ? val3Valid : 0.0;
    const p2Valid = val2Valid !== null ? val2Valid : (pCount >= 2 ? 0.0 : p3Valid);
    const p1Valid = val1Valid !== null ? val1Valid : (pCount >= 3 ? 0.0 : p2Valid);

    const pollAverageValid = pCount === 1 
      ? p3Valid 
      : pCount === 2 
      ? +((p2Valid + p3Valid) / 2).toFixed(2) 
      : +((p1Valid + p2Valid + p3Valid) / 3).toFixed(2);

    // 2. Total % (% Votos Totais)
    const val3Total = findCandidateInPollResults(c.name, latestPercentages.totalMap);
    const val2Total = findCandidateInPollResults(c.name, prev1Percentages.totalMap);
    const val1Total = findCandidateInPollResults(c.name, prev2Percentages.totalMap);

    const p3Total = val3Total !== null ? val3Total : 0.0;
    const p2Total = val2Total !== null ? val2Total : (pCount >= 2 ? 0.0 : p3Total);
    const p1Total = val1Total !== null ? val1Total : (pCount >= 3 ? 0.0 : p2Total);

    const pollAverageTotal = pCount === 1 
      ? p3Total 
      : pCount === 2 
      ? +((p2Total + p3Total) / 2).toFixed(2) 
      : +((p1Total + p2Total + p3Total) / 3).toFixed(2);

    const projectedVotes = Math.round((pollAverageValid / 100) * TOTAL_VOTOS_VALIDOS_ESTIMADOS);

    return {
      ...c,
      rank: 0,
      pollDate1: p1Valid,
      pollDate2: p2Valid,
      pollDate3: p3Valid,
      pollAverage: pollAverageValid,
      pollDate1Total: p1Total,
      pollDate2Total: p2Total,
      pollDate3Total: p3Total,
      pollAverageTotal,
      projectedVotes,
      status: "NAO_ELEITO",
      statusLabel: "Não Eleito"
    };
  });

  // Sort by Valid Average descending
  calculated.sort((a, b) => b.pollAverage - a.pollAverage || b.pollAverageTotal - a.pollAverageTotal);

  calculated.forEach((item, index) => {
    item.rank = index + 1;
  });

  // Build aggregate Role Statistics (N Total, N Válidos, N Brancos/Nulos, N Ns/Nr)
  let totalSample = latestPoll.sampleSize || 0;
  let validTotal = 0;
  let invalidTotal = 0;
  let undecidedTotal = 0;

  if (latestPoll.roleStats && latestPoll.roleStats[role]) {
    const st = latestPoll.roleStats[role];
    totalSample = st.totalSample;
    validTotal = st.validTotal;
    invalidTotal = st.invalidTotal;
    undecidedTotal = st.undecidedTotal;
  } else {
    // Estimate from percentages and sampleSize
    const invPct = latestNonValid.brancoNulo;
    const undPct = latestNonValid.indecisos;
    const valPct = Math.max(0, 100 - invPct - undPct);

    invalidTotal = Math.round((invPct / 100) * totalSample);
    undecidedTotal = Math.round((undPct / 100) * totalSample);
    validTotal = Math.round((valPct / 100) * totalSample);
  }

  const bnDate1 = prev2NonValid.brancoNulo;
  const bnDate2 = prev1NonValid.brancoNulo;
  const bnDate3 = latestNonValid.brancoNulo;
  const bnAvg = pCount === 1 ? bnDate3 : pCount === 2 ? +((bnDate2 + bnDate3) / 2).toFixed(2) : +((bnDate1 + bnDate2 + bnDate3) / 3).toFixed(2);

  const indDate1 = prev2NonValid.indecisos;
  const indDate2 = prev1NonValid.indecisos;
  const indDate3 = latestNonValid.indecisos;
  const indAvg = pCount === 1 ? indDate3 : pCount === 2 ? +((indDate2 + indDate3) / 2).toFixed(2) : +((indDate1 + indDate2 + indDate3) / 3).toFixed(2);

  const nominalSumTotal = +calculated.reduce((acc, c) => acc + c.pollAverageTotal, 0).toFixed(2);
  const nominalSumValid = +calculated.reduce((acc, c) => acc + c.pollAverage, 0).toFixed(2);

  const validPercent = totalSample > 0 ? +((validTotal / totalSample) * 100).toFixed(2) : Math.max(0, +(100 - bnAvg - indAvg).toFixed(2));
  const invalidPercent = totalSample > 0 ? +((invalidTotal / totalSample) * 100).toFixed(2) : bnAvg;
  const undecidedPercent = totalSample > 0 ? +((undecidedTotal / totalSample) * 100).toFixed(2) : indAvg;

  const nonValidItems: NonValidItem[] = [
    {
      id: "branco-nulo",
      name: "Votos Brancos e Nulos",
      shortTag: "BN",
      number: "—",
      pollDate1Total: bnDate1,
      pollDate2Total: bnDate2,
      pollDate3Total: bnDate3,
      pollAverageTotal: bnAvg,
      pollDate1Valid: 0,
      pollDate2Valid: 0,
      pollDate3Valid: 0,
      pollAverageValid: 0,
      count: invalidTotal,
      projectedVotes: 0,
      description: "Votos nulos ou em branco deliberados pelos eleitores (Excluídos da apuração oficial pelo TSE conforme Lei nº 9.504/97)"
    },
    {
      id: "indecisos-ns-nr",
      name: "Indecisos / Não Sabe / Não Respondeu (NS/NR)",
      shortTag: "NS/NR",
      number: "—",
      pollDate1Total: indDate1,
      pollDate2Total: indDate2,
      pollDate3Total: indDate3,
      pollAverageTotal: indAvg,
      pollDate1Valid: 0,
      pollDate2Valid: 0,
      pollDate3Valid: 0,
      pollAverageValid: 0,
      count: undecidedTotal,
      projectedVotes: 0,
      description: "Eleitores indecisos ou que não responderam na pesquisa estimulada (Excluídos do cômputo de válidos nominais)"
    }
  ];

  const nonValidOptions: NonValidOption[] = [
    {
      name: "Brancos / Nulos",
      count: invalidTotal,
      percentageTotal: invalidPercent
    },
    {
      name: "Não Sabe / Não Respondeu (Ns/Nr)",
      count: undecidedTotal,
      percentageTotal: undecidedPercent
    }
  ];

  const roleStats: RoleAggregateStats = {
    role,
    totalSample,
    validTotal,
    invalidTotal,
    undecidedTotal,
    validPercent,
    invalidPercent,
    undecidedPercent,
    totalNominalCandidates: calculated.filter((c) => c.pollAverage > 0).length,
    totalValidSumPercent: 100.0,
    totalSampleSumPercent: 100.0,
    nominalCandidatesSamplePercent: nominalSumTotal > 0 ? nominalSumTotal : validPercent,
    brancoNuloSamplePercent: bnAvg,
    indecisosSamplePercent: indAvg,
    nonValidItems,
    nonValidOptions,
    provenance: {
      source: "SEIE - Estatísticas Agregadas de Amostra",
      type: "ESTIMATED",
      notes: "Agregação das respostas válidas, brancos, nulos e indecisos da amostra."
    }
  };

  // Set provenance for all calculated candidates
  calculated.forEach((c) => {
    c.provenance = createProjectionProvenance(
      "SEIE - Modelo Matemático de Projeções 2026",
      "Projeção eleitoral estatística calculada sobre o histórico eleitoral do TSE e médias de pesquisas."
    );
  });

  let proportionalResult: ProportionalCalculationResult | undefined = undefined;

  if (role === "Deputado Federal" || role === "Deputado Estadual") {
    const candidatesWithVotes = calculated.filter(c => c.pollAverage > 0);
    if (candidatesWithVotes.length > 0) {
      proportionalResult = getProportionalSeatsAnalysis(role, candidatesWithVotes);
      proportionalResult.provenance = createProjectionProvenance(
        "SEIE - Algoritmo Quociente Partidário & D'Hondt",
        "Cálculo de vagas proporcionais pelo Código Eleitoral Brasileiro."
      );

      const partySeatWinners = new Map<string, number>();
      proportionalResult.parties.forEach((p) => {
        partySeatWinners.set(p.partyOrCoalition, p.totalSeats);
      });

      const candidatesByParty = new Map<string, CandidateProjection[]>();
      candidatesWithVotes.forEach((cand) => {
        const key = cand.coalition || cand.partyName || cand.partyNumber;
        if (!candidatesByParty.has(key)) {
          candidatesByParty.set(key, []);
        }
        candidatesByParty.get(key)!.push(cand);
      });

      partySeatWinners.forEach((seatsWon, partyName) => {
        const partyCands = candidatesByParty.get(partyName) || [];
        partyCands.sort((a, b) => b.pollAverage - a.pollAverage || b.projectedVotes - a.projectedVotes);
        partyCands.forEach((cand, idx) => {
          if (idx < seatsWon) {
            cand.status = "ELEITO";
            cand.statusLabel = "Eleito";
          } else if (idx < seatsWon + 2) {
            cand.status = "SUPLENTE";
            cand.statusLabel = "Suplente";
          }
        });
      });
    }
  } else if (role === "Governador") {
    if (calculated.length > 0 && calculated[0].pollAverage > 0) {
      const top1 = calculated[0];
      const top2 = calculated[1];

      // Oficial TSE: Maioria absoluta de votos válidos (> 50%) no 1º Turno
      if (top1.pollAverage > 50.0) {
        top1.status = "ELEITO";
        top1.statusLabel = "Eleito no 1º Turno (>50% Válidos)";
      } else {
        top1.status = "SEGUNDO_TURNO";
        top1.statusLabel = "2º Turno Provável";
        if (top2 && top2.pollAverage > 0) {
          top2.status = "SEGUNDO_TURNO";
          top2.statusLabel = "2º Turno Provável";
        }
      }
    }
  } else if (role === "Senador") {
    // Top 2 elected in 2026 (two vacancies in Sergipe)
    calculated.forEach((cand, idx) => {
      if (cand.pollAverage > 0) {
        if (idx < 2) {
          cand.status = "ELEITO";
          cand.statusLabel = "Eleito Senador (Vaga Oficial)";
        } else if (idx < 4) {
          cand.status = "SUPLENTE";
          cand.statusLabel = "Suplente";
        }
      }
    });
  }

  return {
    candidates: calculated,
    proportionalResult,
    pollHeaderInfo: dynamicHeader,
    roleStats
  };
}

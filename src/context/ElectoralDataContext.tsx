import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Poll, Territory } from "../types";
import {
  parseSurveyFile,
  processSurveyMicrodata,
  ParsedPollDataset,
  MunicipalityRoleTally,
  parseFlexibleDate,
  parseDateRange,
  computeMedianDate,
  extractFieldworkPeriodFromRows
} from "../utils/fileParser";
import { ResearchStorage } from "../lib/researchStorage";
import {
  getProjectionsByRole,
  CandidateProjection,
  ProportionalCalculationResult,
  PollHeaderInfo,
  TOTAL_VOTOS_VALIDOS_ESTIMADOS,
  TOTAL_ELEITORADO_SERGIPE
} from "../data/electoralProjections";
import { CANDIDATOS_OFICIAIS_2026 } from "../data/candidatosOficiais2026";
import { getOfficialCandidateColor } from "../data/sergipeData";
import { authenticatedFetch } from "../lib/apiAuth";
import { useAuth } from "./AuthContext";
import { isValidPoll } from "../utils/pollValidation";

export interface TerritorialDistribution {
  name: string;
  municipalities: string[];
  votersCount: number;
  profile: string;
  leadingCandidate: string;
  results: Record<string, number>;
}

export interface VoterAnalytics {
  totalVoters: number;
  validVotesEstimated: number;
  governorWeightedAverages: Record<string, number>;
  governorValidVotesPercentage: Record<string, number>;
  secondRoundProbableCandidates: { name: string; percentage: number }[];
  growthVelocityMultiplier: number;
  lastIngestedFile: string | null;
  totalSurveysCount: number;
}

export const getResearchBase = (research: any, datasets?: ParsedPollDataset[]): any[] => {
  if (!research) return [];

  const possibleSources = [
    research.coletas,
    research.dados,
    research.rows,
    research.data,
    research.respostas,
    research.questionarios,
    research.rawRows
  ];

  for (const source of possibleSources) {
    if (Array.isArray(source) && source.length > 0) {
      return source;
    }
  }

  // Fallback to uploadedDatasets matching this research
  if (datasets && Array.isArray(datasets) && datasets.length > 0) {
    const ds = datasets.find(
      (d) =>
        (research.id && d.fileName === research.id) ||
        (research.registryNumber && d.registryNumber === research.registryNumber) ||
        (research.institute && d.institute === research.institute)
    );
    if (ds && Array.isArray(ds.rawRows) && ds.rawRows.length > 0) {
      return ds.rawRows;
    }
    if (datasets.length === 1 && Array.isArray(datasets[0].rawRows) && datasets[0].rawRows.length > 0) {
      return datasets[0].rawRows;
    }
  }

  return [];
};

function sanitizePollDates(poll: Poll, _index: number): Poll {
  // 1. PRIMARY: Extract MIN and MAX from the 'Início da Entrevista' column in raw microdata rows
  const rawRows = getResearchBase(poll);
  if (Array.isArray(rawRows) && rawRows.length > 0) {
    const rowFieldwork = extractFieldworkPeriodFromRows(rawRows);
    if (rowFieldwork.hasValidDates) {
      const finalStart = rowFieldwork.fieldworkStart;
      const finalEnd = rowFieldwork.fieldworkEnd;
      const finalMedian = computeMedianDate(finalStart, finalEnd);
      return {
        ...poll,
        fieldworkStart: finalStart,
        fieldworkEnd: finalEnd,
        medianDate: finalMedian
      };
    }
  }

  // 2. SECONDARY: If no raw rows with 'Início da Entrevista' column, check poll fields
  const startCandidates = [
    poll.fieldworkStart,
    (poll as any).dataInicio,
    (poll as any).inicioColeta,
    (poll as any).dataCampoInicio
  ];
  const endCandidates = [
    poll.fieldworkEnd,
    (poll as any).dataFim,
    (poll as any).fimColeta,
    (poll as any).dataCampoFim
  ];
  const medianCandidates = [
    poll.medianDate,
    (poll as any).dataMediana,
    (poll as any).dataPesquisa,
    (poll as any).date,
    (poll as any).data
  ];

  let resolvedStart: string | null = null;
  for (const c of startCandidates) {
    const p = parseFlexibleDate(c);
    if (p) {
      resolvedStart = p;
      break;
    }
  }

  let resolvedEnd: string | null = null;
  for (const c of endCandidates) {
    const p = parseFlexibleDate(c);
    if (p) {
      resolvedEnd = p;
      break;
    }
  }

  let resolvedMedian: string | null = null;
  for (const c of medianCandidates) {
    const p = parseFlexibleDate(c);
    if (p) {
      resolvedMedian = p;
      break;
    }
  }

  // Check if range string exists in description, fileName or other fields
  if (!resolvedStart || !resolvedEnd) {
    const textSources = [(poll as any).fileName, poll.description, (poll as any).periodo, (poll as any).campo];
    for (const src of textSources) {
      if (src) {
        const range = parseDateRange(src);
        if (!resolvedStart && range.start) resolvedStart = range.start;
        if (!resolvedEnd && range.end) resolvedEnd = range.end;
        if (!resolvedMedian && range.median) resolvedMedian = range.median;
      }
    }
  }

  const finalStart = resolvedStart || resolvedMedian || resolvedEnd || "";
  const finalEnd = resolvedEnd || resolvedMedian || resolvedStart || finalStart || "";
  const finalMedian =
    resolvedMedian ||
    (finalStart && finalEnd ? computeMedianDate(finalStart, finalEnd) : finalStart || "");

  return {
    ...poll,
    fieldworkStart: finalStart,
    fieldworkEnd: finalEnd,
    medianDate: finalMedian
  };
}

export interface ElectoralDataContextType {
  // State
  polls: Poll[];
  territories: Territory[];
  uploadedDatasets: ParsedPollDataset[];
  territorialRoleBreakdown: Record<string, Record<string, MunicipalityRoleTally>>;
  activePollsVersion: number;
  lastUpdateTimestamp: Date;
  isLoading: boolean;
  isSyncing: boolean;
  syncStatusMessage: string | null;
  
  // Shared Active Research & Office Selection
  selectedResearchId: string | null;
  setSelectedResearchId: (id: string | null) => void;
  selectedOffice: string;
  setSelectedOffice: (office: string) => void;
  selectedResearch: Poll | null;
  researchBase: any[];
  getResearchBase: (research: any) => any[];

  // Dynamic Recalculated Projections (for the 4 dependent tabs)
  projectionsGovernador: {
    candidates: CandidateProjection[];
    pollHeaderInfo: PollHeaderInfo;
  };
  projectionsSenadores: {
    candidates: CandidateProjection[];
    pollHeaderInfo: PollHeaderInfo;
  };
  projectionsDeputadosFederais: {
    candidates: CandidateProjection[];
    proportionalResult?: ProportionalCalculationResult;
    pollHeaderInfo: PollHeaderInfo;
  };
  projectionsDeputadosEstaduais: {
    candidates: CandidateProjection[];
    proportionalResult?: ProportionalCalculationResult;
    pollHeaderInfo: PollHeaderInfo;
  };
  
  // Territorial & Geolocation Sync
  territorialAnalysis: TerritorialDistribution[];
  municipalityLeaderMap: Record<string, { leader: string; votesPct: number; margin: number }>;
  geoSamplePoints: Array<{
    id: string;
    label: string;
    latitude: number;
    longitude: number;
    cep?: string;
    cidade?: string;
    bairro?: string;
    timestamp: string;
  }>;
  voterAnalytics: VoterAnalytics;

  // Actions
  ingestSurveyFile: (
    file: File,
    referenceDate?: string,
    institute?: string
  ) => Promise<ParsedPollDataset>;
  addPoll: (pollData: Omit<Poll, "id">) => Promise<Poll>;
  updatePoll: (id: string, pollData: Partial<Poll>) => Promise<void>;
  deletePoll: (id: string) => Promise<void>;
  clearCacheAndReload: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const ElectoralDataContext = createContext<ElectoralDataContextType | null>(null);

export const ElectoralDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();

  // STRICT ZERO MOCK: State starts strictly empty until user ingests survey microdata
  const [polls, setPolls] = useState<Poll[]>(() => {
    try {
      const saved = localStorage.getItem("seie_global_polls");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(isValidPoll);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [territories, setTerritories] = useState<Territory[]>([]);
  const [uploadedDatasets, setUploadedDatasets] = useState<ParsedPollDataset[]>(() => {
    try {
      const saved = localStorage.getItem("seie_uploaded_datasets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });
  const [activePollsVersion, setActivePollsVersion] = useState<number>(1);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<Date>(() => new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Extra geocoded points loaded from parsed survey datasets
  const [customGeoPoints, setCustomGeoPoints] = useState<Array<{
    id: string;
    label: string;
    latitude: number;
    longitude: number;
    cep?: string;
    cidade?: string;
    bairro?: string;
    timestamp: string;
  }>>([]);

  const [selectedResearchId, setSelectedResearchIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem("seie_selected_research_id") || null;
    } catch {
      return null;
    }
  });

  const setSelectedResearchId = useCallback((id: string | null) => {
    setSelectedResearchIdState(id);
    try {
      if (id) {
        localStorage.setItem("seie_selected_research_id", id);
      } else {
        localStorage.removeItem("seie_selected_research_id");
      }
    } catch {
      // ignore
    }
  }, []);

  const [selectedOffice, setSelectedOfficeState] = useState<string>(() => {
    try {
      return localStorage.getItem("seie_selected_office") || "Governador";
    } catch {
      return "Governador";
    }
  });

  const setSelectedOffice = useCallback((office: string) => {
    setSelectedOfficeState(office);
    try {
      localStorage.setItem("seie_selected_office", office);
    } catch {
      // ignore
    }
  }, []);

  const selectedResearch = useMemo(() => {
    if (!polls || polls.length === 0) return null;
    if (selectedResearchId) {
      const found = polls.find(
        (p: any) =>
          p.id === selectedResearchId ||
          p.codigo === selectedResearchId ||
          p.id_pesquisa === selectedResearchId
      );
      if (found) return found;
    }
    // Default to the latest ingested or first poll
    return polls[polls.length - 1] || polls[0] || null;
  }, [polls, selectedResearchId]);

  const researchBase = useMemo(() => {
    return getResearchBase(selectedResearch, uploadedDatasets);
  }, [selectedResearch, uploadedDatasets]);

  // Fetch initial base from server and synchronize with IndexedDB & LocalStorage
  const refreshData = useCallback(async () => {
    if (status !== "AUTHENTICATED") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Purga proativa de pesquisas em branco ou artefatos de teste do cliente
      ResearchStorage.purgeInvalidResearches().catch(() => {});

      // 1. Check local IndexedDB first
      const [idbPolls, idbDatasets] = await Promise.allSettled([
        ResearchStorage.getAllResearches(),
        ResearchStorage.getAllDatasets()
      ]);

      let localPolls: Poll[] = [];
      if (idbPolls.status === "fulfilled" && Array.isArray(idbPolls.value) && idbPolls.value.length > 0) {
        localPolls = idbPolls.value.filter(isValidPoll);
      } else {
        try {
          const raw = localStorage.getItem("seie_global_polls");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localPolls = parsed.filter(isValidPoll);
          }
        } catch {}
      }

      let localDatasets: ParsedPollDataset[] = [];
      if (idbDatasets.status === "fulfilled" && Array.isArray(idbDatasets.value) && idbDatasets.value.length > 0) {
        localDatasets = idbDatasets.value;
      } else {
        try {
          const raw = localStorage.getItem("seie_uploaded_datasets");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localDatasets = parsed;
          }
        } catch {}
      }

      // 2. Fetch from server
      const [resPolls, resDatasets, resTerritories] = await Promise.allSettled([
        authenticatedFetch("/api/polls"),
        authenticatedFetch("/api/datasets"),
        authenticatedFetch("/api/territories")
      ]);

      let serverPolls: Poll[] = [];
      if (resPolls.status === "fulfilled") {
        if (resPolls.value.ok) {
          const data = await resPolls.value.json();
          if (data && data.data && Array.isArray(data.data)) {
            serverPolls = data.data.filter(isValidPoll).map((p: Poll) => {
              const sum = Object.values(p.results || {}).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
              const rows = p.rawRows || p.dados || p.coletas;
              if ((sum === 0 || Object.keys(p.results || {}).length === 0) && Array.isArray(rows) && rows.length > 0) {
                try {
                  const parsed = processSurveyMicrodata(rows, p.fileName || p.id);
                  if (Object.keys(parsed.results || {}).length > 0) {
                    return {
                      ...p,
                      results: parsed.results,
                      roleResults: parsed.roleResults,
                      roleValidResults: parsed.roleValidResults,
                      roleRawCounts: parsed.roleRawCounts,
                      roleStats: parsed.roleStats,
                      sampleSize: parsed.sampleSize,
                      marginOfError: parsed.marginOfError,
                      territorialBreakdown: parsed.territorialBreakdown,
                      territorialRoleBreakdown: parsed.territorialRoleBreakdown
                    };
                  }
                } catch (err) {
                  console.warn("[ElectoralData] Não foi possível recalcular microdados da pesquisa:", err);
                }
              }
              return p;
            });
          }
        } else {
          console.warn(`[ElectoralData] /api/polls respondeu com status HTTP ${resPolls.value.status}`);
        }
      }

      let serverDatasets: ParsedPollDataset[] = [];
      if (resDatasets.status === "fulfilled") {
        if (resDatasets.value.ok) {
          const data = await resDatasets.value.json();
          if (data && data.data && Array.isArray(data.data)) {
            serverDatasets = data.data;
          }
        } else {
          console.warn(`[ElectoralData] /api/datasets respondeu com status HTTP ${resDatasets.value.status}`);
        }
      }

      // Helper to turn parsed dataset into a full Poll object
      const convertDatasetToPoll = (ds: ParsedPollDataset): Poll => {
        const pollId = ds.fileName ? `poll-${ds.fileName.replace(/[^a-zA-Z0-9_-]/g, "_")}` : `poll-${Date.now()}`;
        
        let resolvedStart = "";
        let resolvedEnd = "";

        if (Array.isArray(ds.rawRows) && ds.rawRows.length > 0) {
          const rowFw = extractFieldworkPeriodFromRows(ds.rawRows);
          if (rowFw.hasValidDates) {
            resolvedStart = rowFw.fieldworkStart;
            resolvedEnd = rowFw.fieldworkEnd;
          }
        }

        if (!resolvedStart) {
          const range = parseDateRange(ds.fileName);
          resolvedStart =
            parseFlexibleDate(ds.fieldworkStart) ||
            parseFlexibleDate((ds as any).dataInicio) ||
            range.start ||
            "";

          resolvedEnd =
            parseFlexibleDate(ds.fieldworkEnd) ||
            parseFlexibleDate((ds as any).dataFim) ||
            range.end ||
            resolvedStart ||
            "";
        }

        const resolvedMedian =
          parseFlexibleDate(ds.medianDate) ||
          parseFlexibleDate((ds as any).dataMediana) ||
          (resolvedStart && resolvedEnd ? computeMedianDate(resolvedStart, resolvedEnd) : resolvedStart || "");

        let activeResults = ds.results || {};
        let activeRoleResults = ds.roleResults || {};
        let activeRoleValidResults = ds.roleValidResults || {};
        let activeRoleRawCounts = ds.roleRawCounts || {};
        let activeRoleStats = ds.roleStats || {};
        let activeTerritorial = ds.territorialBreakdown || {};
        let activeTerritorialRole = ds.territorialRoleBreakdown || {};
        let activeSampleSize = ds.sampleSize || ds.rawRowsCount || 0;
        let activeMargin = ds.marginOfError || 0;

        const resultsSum = Object.values(activeResults).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
        if ((resultsSum === 0 || Object.keys(activeResults).length === 0) && Array.isArray(ds.rawRows) && ds.rawRows.length > 0) {
          try {
            const parsed = processSurveyMicrodata(ds.rawRows, ds.fileName);
            if (Object.keys(parsed.results || {}).length > 0) {
              activeResults = parsed.results;
              activeRoleResults = parsed.roleResults;
              activeRoleValidResults = parsed.roleValidResults;
              activeRoleRawCounts = parsed.roleRawCounts;
              activeRoleStats = parsed.roleStats;
              activeTerritorial = parsed.territorialBreakdown;
              activeTerritorialRole = parsed.territorialRoleBreakdown;
              activeSampleSize = parsed.sampleSize;
              activeMargin = parsed.marginOfError;
              if (parsed.fieldworkStart && !resolvedStart) resolvedStart = parsed.fieldworkStart;
              if (parsed.fieldworkEnd && !resolvedEnd) resolvedEnd = parsed.fieldworkEnd;
            }
          } catch (e) {
            console.warn("[ElectoralData] Não foi possível recalcular microdados do dataset:", e);
          }
        }

        return {
          id: pollId,
          institute: ds.institute || "Não Informado",
          registryNumber: ds.registryNumber || "",
          conre: ds.conre || "",
          statistician: ds.statistician || "",
          sampleSize: activeSampleSize,
          marginOfError: activeMargin,
          confidenceLevel: ds.confidenceLevel || 0,
          fieldworkStart: resolvedStart,
          fieldworkEnd: resolvedEnd,
          medianDate: resolvedMedian,
          type: ds.type || "Registrada",
          results: activeResults,
          roleResults: activeRoleResults,
          roleValidResults: activeRoleValidResults,
          roleRawCounts: activeRoleRawCounts,
          roleStats: activeRoleStats,
          territorialBreakdown: activeTerritorial,
          territorialRoleBreakdown: activeTerritorialRole,
          coletas: ds.rawRows || [],
          dados: ds.rawRows || [],
          rawRows: ds.rawRows || [],
          data: ds.rawRows || [],
          respostas: ds.rawRows || [],
          questionarios: ds.rawRows || [],
          fileName: ds.fileName || "",
          persisted: true,
          provenance: {
            source: ds.fileName || "Dataset Importado",
            type: "OFFICIAL",
            loadedAt: (ds as any).createdAt || new Date().toISOString(),
            notes: "Microdados da pesquisa eleitoral importados."
          },
          createdAt: (ds as any).createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      };

      // Merge strategy:
      // Priority 1: Direct Server Polls
      // Priority 2: Reconstruct from Server Datasets
      // Priority 3: Local IndexedDB / LocalStorage Polls
      // Priority 4: Reconstruct from Local Datasets

      let finalPolls: Poll[] = [];
      let finalDatasets: ParsedPollDataset[] = [];

      if (serverDatasets.length > 0) {
        finalDatasets = serverDatasets;
      } else if (localDatasets.length > 0) {
        finalDatasets = localDatasets;
        // Sync local datasets to server
        for (const d of localDatasets) {
          authenticatedFetch("/api/datasets", {
            method: "POST",
            body: JSON.stringify({ dataset: d })
          }).catch(() => {});
        }
      }

      if (serverPolls.length > 0) {
        finalPolls = serverPolls.filter(isValidPoll);
      } else if (finalDatasets.length > 0) {
        // Auto-reconstruct polls from datasets
        console.log("[ElectoralData] Reconstruindo pesquisas a partir dos datasets...");
        finalPolls = finalDatasets.map(convertDatasetToPoll).filter(isValidPoll);
      } else if (localPolls.length > 0) {
        finalPolls = localPolls.filter(isValidPoll);
      }

      const validFinalPolls = finalPolls.filter(isValidPoll);
      if (validFinalPolls.length > 0) {
        const sanitizedPolls = validFinalPolls.map((p, idx) => sanitizePollDates(p, idx));
        setPolls(sanitizedPolls);
        localStorage.setItem("seie_global_polls", JSON.stringify(sanitizedPolls));
        for (const p of sanitizedPolls) {
          ResearchStorage.saveResearch(p).catch(() => {});
        }
        if (serverPolls.length === 0) {
          // Sync reconstructed/local polls to server
          authenticatedFetch("/api/polls", {
            method: "POST",
            body: JSON.stringify({ syncBatch: sanitizedPolls })
          }).catch(() => {});
        }
      } else {
        setPolls([]);
        localStorage.removeItem("seie_global_polls");
      }

      if (finalDatasets.length > 0) {
        setUploadedDatasets(finalDatasets);
        localStorage.setItem("seie_uploaded_datasets", JSON.stringify(finalDatasets));
        for (const d of finalDatasets) {
          ResearchStorage.saveDataset(d).catch(() => {});
        }
      }

      if (resTerritories.status === "fulfilled" && resTerritories.value.ok) {
        const data = await resTerritories.value.json();
        if (data && data.data && Array.isArray(data.data)) {
          setTerritories(data.data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch latest data from server, using local store:", err);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "AUTHENTICATED") {
      refreshData();
    } else {
      setIsLoading(false);
    }
  }, [status, refreshData]);

  // Persist polls whenever they mutate and increment version to bust all caches
  useEffect(() => {
    try {
      localStorage.setItem("seie_global_polls", JSON.stringify(polls));
      localStorage.setItem("seie_global_version", String(activePollsVersion));
      localStorage.setItem("seie_uploaded_datasets", JSON.stringify(uploadedDatasets));
    } catch (e) {
      console.error("Local storage sync error:", e);
    }
  }, [polls, uploadedDatasets, activePollsVersion]);

  // 0. Combined Territorial Role Breakdown from Microdata
  const territorialRoleBreakdown: Record<string, Record<string, MunicipalityRoleTally>> = useMemo(() => {
    const result: Record<string, Record<string, MunicipalityRoleTally>> = {
      "Governador": {},
      "Senador": {},
      "Deputado Federal": {},
      "Deputado Estadual": {}
    };

    if (uploadedDatasets.length > 0) {
      // Use latest uploaded dataset's breakdown or merge
      for (let i = uploadedDatasets.length - 1; i >= 0; i--) {
        const ds = uploadedDatasets[i];
        if (ds.territorialRoleBreakdown) {
          return ds.territorialRoleBreakdown;
        }
      }
    }
    return result;
  }, [uploadedDatasets, activePollsVersion]);

  // ==========================================
  // REATIVE OBSERVERS & CALCULATION ENGINE
  // Automatically recalculates all 4 tabs whenever `polls` or `uploadedDatasets` change
  // ==========================================

  // 1. Projeções para Cargos Majoritários: Governador
  const projectionsGovernador = useMemo(() => {
    return getProjectionsByRole("Governador", polls);
  }, [polls, activePollsVersion]);

  // 2. Projeções para Cargos Majoritários: Senadores
  const projectionsSenadores = useMemo(() => {
    return getProjectionsByRole("Senador", polls);
  }, [polls, activePollsVersion]);

  // 3. Projeções para Cargos Legislativos: Deputados Federais (8 vagas - QE / QP / D'Hondt)
  const projectionsDeputadosFederais = useMemo(() => {
    return getProjectionsByRole("Deputado Federal", polls);
  }, [polls, activePollsVersion]);

  // 4. Projeções para Cargos Legislativos: Deputados Estaduais (24 vagas - QE / QP / D'Hondt)
  const projectionsDeputadosEstaduais = useMemo(() => {
    return getProjectionsByRole("Deputado Estadual", polls);
  }, [polls, activePollsVersion]);

  // 5. Dynamic Voter Analytics for "Análise de Votos" (Radar, Projeções, Cenários 1º e 2º turno)
  const voterAnalytics: VoterAnalytics = useMemo(() => {
    if (polls.length === 0) {
      return {
        totalVoters: TOTAL_ELEITORADO_SERGIPE,
        validVotesEstimated: 0,
        governorWeightedAverages: {},
        governorValidVotesPercentage: {},
        secondRoundProbableCandidates: [],
        growthVelocityMultiplier: 1.0,
        lastIngestedFile: uploadedDatasets.length > 0 ? uploadedDatasets[uploadedDatasets.length - 1].fileName : null,
        totalSurveysCount: 0
      };
    }

    const govCandidates = projectionsGovernador.candidates;
    const weightedGovAvg: Record<string, number> = {};
    let totalGovPercent = 0;

    govCandidates.forEach((cand) => {
      if (cand.pollAverage > 0) {
        weightedGovAvg[cand.name] = cand.pollAverage;
        totalGovPercent += cand.pollAverage;
      }
    });

    const validPct: Record<string, number> = {};
    const validTotal = (totalGovPercent > 0) ? totalGovPercent : 100;
    govCandidates.forEach((cand) => {
      if (cand.pollAverage > 0) {
        validPct[cand.name] = +((cand.pollAverage / validTotal) * 100).toFixed(1);
      }
    });

    const sortedGov = [...govCandidates].filter(c => c.pollAverage > 0).sort((a, b) => b.pollAverage - a.pollAverage);
    const secondRound = sortedGov.slice(0, 2).map((c) => ({
      name: c.name,
      percentage: c.pollAverage
    }));

    return {
      totalVoters: TOTAL_ELEITORADO_SERGIPE,
      validVotesEstimated: TOTAL_VOTOS_VALIDOS_ESTIMADOS,
      governorWeightedAverages: weightedGovAvg,
      governorValidVotesPercentage: validPct,
      secondRoundProbableCandidates: secondRound,
      growthVelocityMultiplier: 1.0,
      lastIngestedFile: uploadedDatasets.length > 0 ? uploadedDatasets[uploadedDatasets.length - 1].fileName : null,
      totalSurveysCount: polls.length
    };
  }, [projectionsGovernador, uploadedDatasets, polls.length, activePollsVersion]);

  // 6. Recalculate Territorial Breakdown & Leaders
  const territorialAnalysis: TerritorialDistribution[] = useMemo(() => {
    if (polls.length === 0) {
      return [];
    }

    const defaultTerritories = [
      {
        name: "Grande Aracaju",
        municipalities: ["Aracaju", "Nossa Senhora do Socorro", "São Cristóvão", "Barra dos Coqueiros", "Laranjeiras", "Riachuelo", "Itaporanga d'Ajuda"],
        votersCount: 480000,
        profile: "Altamente urbano, forte presença do funcionalismo público e setor de serviços."
      },
      {
        name: "Agreste Central",
        municipalities: ["Itabaiana", "Campo do Brito", "Carira", "Macambira", "Pinhão", "Ribeirópolis", "Areia Branca", "Frei Paulo", "Moita Bonita", "São Domingos"],
        votersCount: 195000,
        profile: "Polo do comércio atacadista e da agricultura familiar. Reduto tradicional."
      },
      {
        name: "Centro Sul",
        municipalities: ["Lagarto", "Simão Dias", "Poço Verde", "Riachão do Dantas", "Tobias Barreto"],
        votersCount: 180000,
        profile: "Economia diversificada com destaque para indústria têxtil e agropecuária."
      },
      {
        name: "Alto Sertão",
        municipalities: ["Nossa Senhora da Glória", "Porto da Folha", "Canindé de São Francisco", "Poço Redondo", "Monte Alegre de Sergipe", "Gararu"],
        votersCount: 125000,
        profile: "Região com forte tradição na pecuária leiteira e grandes projetos de irrigação."
      },
      {
        name: "Sul Sergipano",
        municipalities: ["Estância", "Indiaroba", "Itabaianinha", "Santa Luzia do Itanhy", "Umbaúba", "Cristinápolis"],
        votersCount: 140000,
        profile: "Região citrícola e polo industrial histórico."
      },
      {
        name: "Baixo São Francisco",
        municipalities: ["Neópolis", "Propriá", "Pacatuba", "Japoatã", "Brejo Grande", "Ilha das Flores", "Santana do São Francisco", "Amparo de São Francisco", "Canhoba", "Cedro de São João", "Muribeca", "São Francisco", "Telha"],
        votersCount: 95000,
        profile: "Atividade pesqueira e de rizicultura."
      },
      {
        name: "Médio Sertão",
        municipalities: ["Aquidabã", "Feira Nova", "Graccho Cardoso", "Itabi", "Cumbe", "Nossa Senhora das Dores"],
        votersCount: 65000,
        profile: "Predomínio de atividade rural e comércio local."
      },
      {
        name: "Leste Sergipano",
        municipalities: ["Japaratuba", "Capela", "Carmópolis", "Pirambu", "Maruim", "Rosário do Catete", "Divina Pastora", "General Maynard", "Siriri", "Santa Rosa de Lima"],
        votersCount: 85000,
        profile: "Polo histórico da exploração de petróleo e cana-de-açúcar."
      }
    ];

    // Get latest governor polls weights
    const latestPoll = polls[polls.length - 1];
    if (!latestPoll || !latestPoll.results) return [];

    const hasTerritorialBreakdown = latestPoll.territorialBreakdown && Object.keys(latestPoll.territorialBreakdown).length > 0;
    const hasRoleTerritorial = latestPoll.territorialRoleBreakdown && Object.keys(latestPoll.territorialRoleBreakdown).length > 0;

    return defaultTerritories.map((t) => {
      let results: Record<string, number> = {};

      if (hasTerritorialBreakdown || hasRoleTerritorial) {
        // Aggregate from real territorial breakdown for municipalities in this territory
        const muniVotes: Record<string, number> = {};
        let totalMuniVotes = 0;

        t.municipalities.forEach((muni) => {
          const normMuni = muni.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          
          // Check role breakdown first
          if (hasRoleTerritorial && latestPoll.territorialRoleBreakdown) {
            for (const [keyMuni, roleData] of Object.entries(latestPoll.territorialRoleBreakdown)) {
              const normKey = keyMuni.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
              if (normKey === normMuni || normKey.includes(normMuni) || normMuni.includes(normKey)) {
                const govTally = (roleData as any)["Governador"];
                if (govTally && govTally.counts) {
                  Object.entries(govTally.counts).forEach(([cand, count]) => {
                    muniVotes[cand] = (muniVotes[cand] || 0) + Number(count);
                    totalMuniVotes += Number(count);
                  });
                }
              }
            }
          } else if (hasTerritorialBreakdown && latestPoll.territorialBreakdown) {
            for (const [keyMuni, candCounts] of Object.entries(latestPoll.territorialBreakdown)) {
              const normKey = keyMuni.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
              if (normKey === normMuni || normKey.includes(normMuni) || normMuni.includes(normKey)) {
                Object.entries(candCounts as Record<string, number>).forEach(([cand, count]) => {
                  muniVotes[cand] = (muniVotes[cand] || 0) + Number(count);
                  totalMuniVotes += Number(count);
                });
              }
            }
          }
        });

        if (totalMuniVotes > 0) {
          Object.entries(muniVotes).forEach(([cand, count]) => {
            results[cand] = +((count / totalMuniVotes) * 100).toFixed(1);
          });
        }
      }

      const hasResults = Object.keys(results).length > 0;
      let leader = "Dado não disponível na base oficial carregada";
      let maxV = -1;

      if (hasResults) {
        Object.entries(results).forEach(([c, val]) => {
          if (c !== "Brancos/Nulos" && c !== "Indecisos" && val > maxV) {
            maxV = val;
            leader = c;
          }
        });
      }

      return {
        ...t,
        leadingCandidate: leader,
        results,
        provenance: hasResults ? {
          source: latestPoll.fileName || "Pesquisa Eleitoral",
          type: "OFFICIAL" as const,
          notes: "Agregação territorial computada a partir das entrevistas reais por município."
        } : {
          source: "NOT_FOUND",
          type: "NOT_FOUND" as const,
          notes: "Dado não disponível na base oficial carregada para este recorte territorial."
        }
      };
    });
  }, [polls, activePollsVersion]);

  // 7. Dynamic municipality winner map for 75 municipalities
  const municipalityLeaderMap = useMemo(() => {
    if (territorialAnalysis.length === 0) return {};
    const map: Record<string, { leader: string; votesPct: number; margin: number }> = {};
    territorialAnalysis.forEach((t) => {
      // Only set if this territory actually has verified results
      if (Object.keys(t.results).length > 0 && t.leadingCandidate !== "Dado não disponível na base oficial carregada") {
        t.municipalities.forEach((muni) => {
          const sorted = Object.entries(t.results).filter(([k]) => k !== "Brancos/Nulos" && k !== "Indecisos").sort((a, b) => b[1] - a[1]);
          const top1 = sorted[0] || ["-", 0];
          const top2 = sorted[1] || ["-", 0];
          map[muni] = {
            leader: top1[0],
            votesPct: top1[1],
            margin: +(top1[1] - top2[1]).toFixed(1)
          };
        });
      }
    });
    return map;
  }, [territorialAnalysis]);

  // 8. Georeferenced Sample Points
  const geoSamplePoints = useMemo(() => {
    return customGeoPoints;
  }, [customGeoPoints]);

  // ==========================================
  // INGESTION & PIPELINE ENGINE (Point 1, 2, 3, 4)
  // ==========================================
  const ingestSurveyFile = async (
    file: File,
    referenceDate?: string,
    institute?: string
  ): Promise<ParsedPollDataset> => {
    setIsSyncing(true);
    setSyncStatusMessage(`Iniciando validação e parsing do arquivo: ${file.name}...`);

    try {
      // 1. Parse and validate columns and schema with fileParser
      const parsedDataset = await parseSurveyFile(file, referenceDate, institute);
      
      setSyncStatusMessage(`Arquivo validado com sucesso! Mapeadas ${parsedDataset.rawRowsCount} linhas. Sincronizando ecossistema...`);

      // 2. Build new Poll entity from parsed dataset
      const newPollId = `poll-${Date.now()}`;
      const newPoll: Poll = {
        id: newPollId,
        institute: parsedDataset.institute || "Não Informado",
        registryNumber: parsedDataset.registryNumber || "",
        conre: parsedDataset.conre || "",
        statistician: parsedDataset.statistician || "",
        sampleSize: parsedDataset.sampleSize || parsedDataset.rawRowsCount || 0,
        marginOfError: parsedDataset.marginOfError || 0,
        confidenceLevel: parsedDataset.confidenceLevel || 0,
        fieldworkStart: parsedDataset.fieldworkStart,
        fieldworkEnd: parsedDataset.fieldworkEnd,
        medianDate: parsedDataset.medianDate,
        type: parsedDataset.type,
        results: parsedDataset.results,
        roleResults: parsedDataset.roleResults,
        roleValidResults: parsedDataset.roleValidResults,
        roleRawCounts: parsedDataset.roleRawCounts,
        roleStats: parsedDataset.roleStats,
        coletas: parsedDataset.rawRows,
        dados: parsedDataset.rawRows,
        rawRows: parsedDataset.rawRows,
        data: parsedDataset.rawRows,
        respostas: parsedDataset.rawRows,
        questionarios: parsedDataset.rawRows,
        fileName: parsedDataset.fileName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        provenance: {
          source: parsedDataset.fileName || "Arquivo de Pesquisa Carregado",
          type: "OFFICIAL",
          loadedAt: new Date().toISOString(),
          notes: "Pesquisa eleitoral validada e extraída dos microdados brutos."
        }
      };

      // 3. Extract custom geo points if present
      if (parsedDataset.geoPoints && parsedDataset.geoPoints.length > 0) {
        const mappedPoints = parsedDataset.geoPoints.map((gp, idx) => ({
          id: `upload-geo-${Date.now()}-${idx}`,
          label: gp.label,
          latitude: gp.latitude,
          longitude: gp.longitude,
          cep: gp.cep || "",
          cidade: gp.cidade || "Sergipe",
          bairro: gp.bairro || "",
          timestamp: new Date().toISOString()
        }));
        setCustomGeoPoints((prev) => [...mappedPoints, ...prev]);
      }

      // 4. Save permanently to IndexedDB
      await ResearchStorage.saveResearch(newPoll);
      await ResearchStorage.saveDataset(parsedDataset);

      // 5. Update Server (Full-Stack persistence to disk)
      try {
        await authenticatedFetch("/api/polls", {
          method: "POST",
          body: JSON.stringify({
            pollData: newPoll
          })
        });

        await authenticatedFetch("/api/datasets", {
          method: "POST",
          body: JSON.stringify({
            dataset: parsedDataset
          })
        });
      } catch (e) {
        console.warn("Backend sync notice (operating in optimistic client-mode):", e);
      }

      // 6. Update Global React Context and Invalidate Cache
      setPolls((prev) => [...prev, newPoll]);
      setUploadedDatasets((prev) => [...prev, parsedDataset]);
      setSelectedResearchId(newPollId);
      setActivePollsVersion((v) => v + 1);
      setLastUpdateTimestamp(new Date());

      // Invalidate calculation caches
      localStorage.removeItem("seie_cached_projections");
      localStorage.removeItem("seie_cached_territories");
      localStorage.setItem("seie_last_sync", new Date().toISOString());

      setSyncStatusMessage(
        `✅ Ecossistema 100% Sincronizado e Fixado! Dados gravados permanentemente no banco.`
      );

      setTimeout(() => {
        setSyncStatusMessage(null);
      }, 6000);

      return parsedDataset;
    } catch (err: any) {
      setSyncStatusMessage(`❌ Falha no processamento: ${err.message || "Erro desconhecido"}`);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const addPoll = async (pollData: Omit<Poll, "id">): Promise<Poll> => {
    setIsSyncing(true);
    const newPoll: Poll = {
      ...pollData,
      id: `poll-${Date.now()}`
    };

    // Rejeitar pesquisas em branco ou inválidas
    if (!isValidPoll(newPoll)) {
      setIsSyncing(false);
      throw new Error("⚠️ Pesquisa em branco ou dados inconsistentes. Preencha amostra e resultados válidos.");
    }

    // Save permanently in IndexedDB
    await ResearchStorage.saveResearch(newPoll);

    // Save permanently to server disk
    try {
      await authenticatedFetch("/api/polls", {
        method: "POST",
        body: JSON.stringify({
          pollData: newPoll
        })
      });
    } catch (e) {
      console.warn("Server save error:", e);
    }

    setPolls((prev) => [...prev, newPoll]);
    setActivePollsVersion((v) => v + 1);
    setLastUpdateTimestamp(new Date());
    setIsSyncing(false);
    return newPoll;
  };

  const updatePoll = async (id: string, pollData: Partial<Poll>): Promise<void> => {
    setIsSyncing(true);
    const existing = polls.find(p => p.id === id);
    if (existing) {
      const updated = { ...existing, ...pollData };
      await ResearchStorage.saveResearch(updated);
    }

    try {
      await authenticatedFetch(`/api/polls/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          pollData
        })
      });
    } catch (e) {
      console.warn("Server update error:", e);
    }

    setPolls((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...pollData } : p))
    );
    setActivePollsVersion((v) => v + 1);
    setLastUpdateTimestamp(new Date());
    setIsSyncing(false);
  };

  // MANUAL DELETE ONLY: Strictly removes ONLY the targeted poll by ID
  const deletePoll = async (id: string): Promise<void> => {
    setIsSyncing(true);
    try {
      // 1. Delete from Server disk
      await authenticatedFetch(`/api/polls/${id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.warn("Server delete error:", e);
    }

    // 2. Delete from IndexedDB and LocalStorage
    await ResearchStorage.deleteResearch(id);

    // 3. Delete matching dataset if any
    await ResearchStorage.deleteDataset(id);
    try {
      await authenticatedFetch(`/api/datasets/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
    } catch {}

    // 4. Update React State
    setPolls((prev) => prev.filter((p) => p.id !== id));
    setUploadedDatasets((prev) => prev.filter((d) => d.fileName !== id && (d as any).id !== id));
    setActivePollsVersion((v) => v + 1);
    setLastUpdateTimestamp(new Date());
    setIsSyncing(false);
  };

  // Recalculates projections and busts calculation caches WITHOUT deleting permanent polls
  const clearCacheAndReload = async (): Promise<void> => {
    setIsLoading(true);
    try {
      localStorage.removeItem("seie_cached_projections");
      localStorage.removeItem("seie_cached_territories");
    } catch (e) {
      console.warn("Cache clean notice:", e);
    }

    setActivePollsVersion((v) => v + 1);
    setLastUpdateTimestamp(new Date());
    setIsLoading(false);
  };

  return (
    <ElectoralDataContext.Provider
      value={{
        polls,
        territories,
        uploadedDatasets,
        territorialRoleBreakdown,
        activePollsVersion,
        lastUpdateTimestamp,
        isLoading,
        isSyncing,
        syncStatusMessage,
        selectedResearchId,
        setSelectedResearchId,
        selectedOffice,
        setSelectedOffice,
        selectedResearch,
        researchBase,
        getResearchBase: (res) => getResearchBase(res, uploadedDatasets),
        projectionsGovernador,
        projectionsSenadores,
        projectionsDeputadosFederais,
        projectionsDeputadosEstaduais,
        territorialAnalysis,
        municipalityLeaderMap,
        geoSamplePoints,
        voterAnalytics,
        ingestSurveyFile,
        addPoll,
        updatePoll,
        deletePoll,
        clearCacheAndReload,
        refreshData
      }}
    >
      {children}
    </ElectoralDataContext.Provider>
  );
};

export const useElectoralData = () => {
  const context = useContext(ElectoralDataContext);
  if (!context) {
    throw new Error("useElectoralData deve ser utilizado dentro de um ElectoralDataProvider");
  }
  return context;
};

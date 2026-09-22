import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { UserRole } from "../types";
import {
  Radio,
  RefreshCw,
  Search,
  ExternalLink,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Sliders,
  ShieldAlert,
  Layers,
  MapPin,
  FileText,
  Trash2,
  Plus,
  X,
  ChevronRight,
  Info,
  Building,
  UserCheck,
  StopCircle,
  Activity,
  Terminal,
  Server,
  Clock,
  Play,
  Check,
  Wifi,
  WifiOff,
  Database,
  ArrowUpRight,
  Tag,
  Eye,
  SlidersHorizontal,
  Compass
} from "lucide-react";
import { authenticatedFetch } from "../lib/apiAuth";

export interface DigitalMention {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;
  time?: string;
  timestamp: number;
  candidateName: string;
  candidateRole: string;
  candidateParty?: string;
  snippet: string;
  municipality: string;
  sourceType: "Notícia" | "Portal" | "Blog" | "Google Trends" | "YouTube" | "Web Pública";
  sentiment: "POSITIVO" | "NEUTRO" | "NEGATIVO" | "INDETERMINADO";
  sentimentReason?: string;
  topics: string[];
  rawSearchQuery: string;
  collectedAt: string;
}

export interface CandidateSearchConfig {
  candidateName: string;
  role: string;
  party: string;
  searchTerms: string[];
  excludeTerms: string[];
  active: boolean;
}

export interface GoogleTrendsItem {
  candidateName: string;
  role: string;
  interestScore: number;
  trendDirection: "up" | "down" | "stable" | "na";
  historicalData?: { date: string; score: number }[];
  searchQuery: string;
  period: string;
  status: "disponivel" | "indisponivel" | "nao_configurada";
  note: string;
}

export interface DiagnosticLogEntry {
  id: string;
  timestamp: string;
  source: string;
  endpointUrl?: string;
  query: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  httpStatus: number | null;
  itemsFound: number;
  status: "DADOS ENCONTRADOS" | "SEM RESULTADOS" | "ERRO" | "TIMEOUT" | "FONTE INDISPONIVEL" | "NAO CONFIGURADA";
  classificationCode?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
  classificationLabel?: string;
  errorMessage?: string;
  responseSnippet?: string;
}

export interface SourceHealthCheck {
  name: string;
  url: string;
  category: string;
  status: "ONLINE" | "OFFLINE" | "TIMEOUT" | "NAO_CONFIGURADA" | "ERRO";
  latencyMs: number;
  httpStatus: number | null;
  itemsCount: number;
  message: string;
  testedAt: string;
  responsePreview?: string;
}

export interface ConnectivityTestResult {
  outcome: "TESTE APROVADO" | "TESTE SEM RESULTADOS" | "ERRO DE CONEXAO / FONTE NAO ACESSIVEL";
  sourceName: string;
  endpointUrl: string;
  queryTerm: string;
  itemsFound: number;
  durationMs: number;
  httpStatus: number | null;
  testedAt: string;
  items: {
    title: string;
    url: string;
    source: string;
    date: string;
    time: string;
    snippet: string;
  }[];
  diagnostic: DiagnosticLogEntry;
}

export interface DigitalRadarData {
  lastUpdated: string | null;
  collectionStatus: "atualizada" | "parcial" | "falha" | "sem_dados";
  statusMessage: string;
  totalMentions: number;
  sourcesActive: string[];
  mentions: DigitalMention[];
  googleTrends: GoogleTrendsItem[];
  diagnosticLogs: DiagnosticLogEntry[];
  candidateConfigs: CandidateSearchConfig[];
}

type CollectionState = 
  | "AGUARDANDO"
  | "BUSCANDO"
  | "DADOS ENCONTRADOS"
  | "SEM RESULTADOS"
  | "ERRO"
  | "FONTE INDISPONIVEL"
  | "TIMEOUT"
  | "INTERROMPIDO";

interface RadarDigitalProps {
  currentRole?: UserRole;
  userEmail?: string;
}

export const KNOWN_SOURCES_LIST = [
  { name: "G1 Sergipe", url: "https://g1.globo.com/rss/g1/se/sergipe/", desc: "Portal de notícias G1 SE (Globo)" },
  { name: "Infonet Sergipe", url: "https://infonet.com.br/feed/", desc: "Principal portal de notícias de Sergipe" },
  { name: "Fan F1 SE", url: "https://fanf1.com.br/feed/", desc: "Portal Fan F1 (Rádio Fan FM / Notícias)" },
  { name: "Jornal do Dia SE", url: "https://jornaldodiase.com.br/feed/", desc: "Jornal do Dia Sergipe" },
  { name: "Hora News SE", url: "https://horanews.net/feed/", desc: "Blog de jornalismo político Hora News" },
  { name: "Destaque Notícias", url: "https://destaquenoticias.com.br/feed/", desc: "Portal Destaque Notícias SE" },
  { name: "Alese Notícias", url: "https://al.se.leg.br/feed/", desc: "Assembleia Legislativa do Estado de Sergipe" },
  { name: "NE9 Nordeste", url: "https://ne9.com.br/feed/", desc: "Portal de Economia e Política do Nordeste" },
  { name: "Agência Brasil Política", url: "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml", desc: "Agência Pública Nacional (EBC)" }
];

export default function RadarDigital({ currentRole = "Administrator", userEmail = "" }: RadarDigitalProps) {
  const [activeTab, setActiveTab] = useState<"FEED" | "CONNECTIVITY" | "DIAGNOSTICS" | "CONFIG">("FEED");
  const [radarData, setRadarData] = useState<DigitalRadarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // State Machine
  const [collectionState, setCollectionState] = useState<CollectionState>("AGUARDANDO");
  const [currentQueryInfo, setCurrentQueryInfo] = useState<{ source: string; query: string; target: string } | null>(null);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ALL");
  const [selectedCandidate, setSelectedCandidate] = useState<string>("ALL");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("ALL");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("ALL");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Collection Scope
  const [collectionScope, setCollectionScope] = useState<"SELECTED" | "ALL">("SELECTED");

  // Modals & Panels
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);
  const [auditTarget, setAuditTarget] = useState<{ title: string; mentions: DigitalMention[] } | null>(null);
  const [editingConfigs, setEditingConfigs] = useState<CandidateSearchConfig[]>([]);

  // Diagnostics State
  const [healthChecks, setHealthChecks] = useState<SourceHealthCheck[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);

  // Dedicated Connectivity Test State
  const [connTestQuery, setConnTestQuery] = useState<string>("Sergipe");
  const [connTestSourceUrl, setConnTestSourceUrl] = useState<string>("https://g1.globo.com/rss/g1/se/sergipe/");
  const [connTestResult, setConnTestResult] = useState<ConnectivityTestResult | null>(null);
  const [isRunningConnTest, setIsRunningConnTest] = useState<boolean>(false);

  // Abort Controller reference
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial data from server
  const fetchRadarData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/radar/data");
      if (!res.ok) throw new Error(`Erro ao consultar dados (${res.status})`);
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setRadarData(json.data);
        setEditingConfigs(json.data.candidateConfigs || []);
        if (json.data.mentions && json.data.mentions.length > 0) {
          setCollectionState("DADOS ENCONTRADOS");
        } else {
          setCollectionState("AGUARDANDO");
        }
      }
    } catch (err: any) {
      console.error("Falha ao carregar Radar Digital:", err);
      setErrorMessage(err.message || "Erro ao conectar com o serviço do Radar Digital.");
      setCollectionState("ERRO");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRadarData();
    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchRadarData]);

  // Dedicated Isolated Connectivity Test Handler
  const handleRunConnectivityTest = async (overrideQuery?: string, overrideSource?: string) => {
    const queryToUse = overrideQuery !== undefined ? overrideQuery : connTestQuery;
    const sourceToUse = overrideSource !== undefined ? overrideSource : connTestSourceUrl;

    try {
      setIsRunningConnTest(true);
      setConnTestResult(null);
      
      const res = await authenticatedFetch("/api/radar/test-connectivity", {
        method: "POST",
        body: JSON.stringify({
          query: queryToUse.trim() || "Sergipe",
          sourceUrl: sourceToUse || undefined
        })
      });

      const json = await res.json();
      if (json.status === "success" && json.data) {
        setConnTestResult(json.data);
      } else {
        throw new Error(json.message || "Falha ao executar o teste de conectividade.");
      }
    } catch (err: any) {
      alert(`Erro no teste de conectividade: ${err.message}`);
    } finally {
      setIsRunningConnTest(false);
    }
  };

  // Execute collection with strict timeout and cancel capability
  const handleExecuteCollection = async (overrideTarget?: string) => {
    const targetCandidate = overrideTarget || (collectionScope === "SELECTED" && selectedCandidate !== "ALL" ? selectedCandidate : undefined);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setErrorMessage(null);
    setSuccessMessage(null);
    setCollectionState("BUSCANDO");
    setCurrentQueryInfo({
      source: "Portais Públicos de Sergipe (G1 SE, Infonet, Fan F1, Alese, Jornal do Dia, etc.)",
      query: targetCandidate ? `Termos de "${targetCandidate}"` : "Termos de todos os candidatos ativos",
      target: targetCandidate || "Todos os Candidatos"
    });

    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = setTimeout(() => {
      controller.abort();
      setCollectionState("TIMEOUT");
      setErrorMessage("A fonte não respondeu dentro do tempo limite (Timeout de 20s). Não foi possível obter dados desta fonte no momento.");
      setCurrentQueryInfo(null);
    }, 20000);

    try {
      const res = await authenticatedFetch("/api/radar/collect", {
        method: "POST",
        body: JSON.stringify({ 
          targetCandidate 
        }),
        signal: controller.signal
      });

      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Não foi possível obter dados desta fonte no momento.`);
      }

      const json = await res.json();
      if (json.status !== "success" || !json.data) {
        throw new Error(json.message || "A fonte retornou uma resposta inválida.");
      }

      setRadarData(json.data);
      setEditingConfigs(json.data.candidateConfigs || []);

      const count = json.data.mentions?.length || 0;
      if (count > 0) {
        setCollectionState("DADOS ENCONTRADOS");
        setSuccessMessage(`Coleta finalizada com sucesso! ${count} notícias e registros públicos catalogados com URLs e fontes auditáveis.`);
      } else {
        setCollectionState("SEM RESULTADOS");
        setErrorMessage("Nenhum resultado encontrado para os filtros selecionados nas fontes consultadas.");
      }

      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      if (err.name === "AbortError" || controller.signal.aborted) {
        if (collectionState !== "TIMEOUT") {
          setCollectionState("INTERROMPIDO");
          setErrorMessage("Coleta interrompida pelo usuário.");
        }
      } else {
        console.error("Erro na coleta:", err);
        setCollectionState("FONTE INDISPONIVEL");
        setErrorMessage(err.message || "Não foi possível obter dados desta fonte no momento.");
      }
    } finally {
      abortControllerRef.current = null;
      setCurrentQueryInfo(null);
    }
  };

  const handleStopCollection = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    setCollectionState("INTERROMPIDO");
    setErrorMessage("Coleta interrompida pelo usuário.");
    setCurrentQueryInfo(null);
  };

  const handleRunDiagnostics = async () => {
    try {
      setIsRunningDiagnostics(true);
      const res = await authenticatedFetch("/api/radar/test-sources", {
        method: "POST"
      });
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        setHealthChecks(json.data);
      } else {
        throw new Error(json.message || "Falha ao executar o diagnóstico das fontes.");
      }
    } catch (err: any) {
      alert(`Erro no diagnóstico: ${err.message}`);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm("Atenção: Deseja realmente limpar todos os registros coletados pelo Radar Digital?")) {
      return;
    }
    try {
      setIsLoading(true);
      const res = await authenticatedFetch("/api/radar/clear", {
        method: "POST"
      });
      const json = await res.json();
      if (json.status === "success") {
        setRadarData(json.data);
        setCollectionState("AGUARDANDO");
        setSuccessMessage("Base do Radar Digital reiniciada com sucesso.");
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Falha ao limpar a base.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfigs = async () => {
    try {
      const res = await authenticatedFetch("/api/radar/config", {
        method: "POST",
        body: JSON.stringify({ configs: editingConfigs })
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || "Falha ao salvar configurações.");
      }
      setIsConfigModalOpen(false);
      fetchRadarData();
      setSuccessMessage("Configurações de busca atualizadas com sucesso!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  // Filtering Logic
  const filteredMentions = useMemo(() => {
    if (!radarData || !radarData.mentions) return [];

    const now = Date.now();

    return radarData.mentions.filter((m) => {
      if (selectedPeriod === "24H") {
        if (now - m.timestamp > 24 * 60 * 60 * 1000) return false;
      } else if (selectedPeriod === "7D") {
        if (now - m.timestamp > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (selectedPeriod === "30D") {
        if (now - m.timestamp > 30 * 24 * 60 * 60 * 1000) return false;
      }

      if (selectedCandidate !== "ALL" && m.candidateName !== selectedCandidate) return false;
      if (selectedRole !== "ALL" && m.candidateRole !== selectedRole) return false;
      if (selectedSentiment !== "ALL" && m.sentiment !== selectedSentiment) return false;
      if (selectedMunicipality !== "ALL" && m.municipality !== selectedMunicipality) return false;
      if (selectedSource !== "ALL" && m.source !== selectedSource) return false;

      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(kw);
        const matchSnippet = m.snippet.toLowerCase().includes(kw);
        const matchCandidate = m.candidateName.toLowerCase().includes(kw);
        const matchSource = m.source.toLowerCase().includes(kw);
        if (!matchTitle && !matchSnippet && !matchCandidate && !matchSource) return false;
      }

      return true;
    });
  }, [radarData, selectedPeriod, selectedCandidate, selectedRole, selectedSentiment, selectedMunicipality, selectedSource, searchKeyword]);

  const filterOptions = useMemo(() => {
    const candidates = new Set<string>();
    const roles = new Set<string>();
    const municipalities = new Set<string>();
    const sources = new Set<string>();

    if (radarData?.candidateConfigs) {
      radarData.candidateConfigs.forEach((c) => {
        candidates.add(c.candidateName);
        if (c.role) roles.add(c.role);
      });
    }

    if (radarData?.mentions) {
      radarData.mentions.forEach((m) => {
        candidates.add(m.candidateName);
        if (m.candidateRole) roles.add(m.candidateRole);
        if (m.municipality && m.municipality !== "Localização não identificada") municipalities.add(m.municipality);
        if (m.source) sources.add(m.source);
      });
    }

    return {
      candidates: Array.from(candidates),
      roles: Array.from(roles),
      municipalities: Array.from(municipalities).sort(),
      sources: Array.from(sources).sort()
    };
  }, [radarData]);

  // Sentiment Breakdown
  const sentimentStats = useMemo(() => {
    const total = filteredMentions.length;
    if (total === 0) return { pos: 0, neu: 0, neg: 0, ind: 0, posPct: 0, neuPct: 0, negPct: 0, indPct: 0 };
    
    let pos = 0, neu = 0, neg = 0, ind = 0;
    filteredMentions.forEach((m) => {
      if (m.sentiment === "POSITIVO") pos++;
      else if (m.sentiment === "NEGATIVO") neg++;
      else if (m.sentiment === "INDETERMINADO") ind++;
      else neu++;
    });

    return {
      pos, neu, neg, ind,
      posPct: Math.round((pos / total) * 100),
      neuPct: Math.round((neu / total) * 100),
      negPct: Math.round((neg / total) * 100),
      indPct: Math.round((ind / total) * 100)
    };
  }, [filteredMentions]);

  // Candidate Distribution
  const candidateDistribution = useMemo(() => {
    const counts: Record<string, { total: number; pos: number; neu: number; neg: number; party?: string }> = {};
    
    filteredMentions.forEach((m) => {
      if (!counts[m.candidateName]) {
        counts[m.candidateName] = { total: 0, pos: 0, neu: 0, neg: 0, party: m.candidateParty };
      }
      counts[m.candidateName].total++;
      if (m.sentiment === "POSITIVO") counts[m.candidateName].pos++;
      else if (m.sentiment === "NEGATIVO") counts[m.candidateName].neg++;
      else counts[m.candidateName].neu++;
    });

    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [filteredMentions]);

  const isSearching = collectionState === "BUSCANDO";

  return (
    <div id="radar-digital-container" className="space-y-6">
      {/* 1. TOP HEADER & NAVIGATION TABS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 shrink-0">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">Radar Digital & Monitoramento</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Conexão Ativa
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1 max-w-3xl">
                Monitoramento e diagnóstico de notícias públicas de Sergipe e tendências digitais com rastreabilidade de fontes, URLs e auditoria técnica.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isSearching ? (
              <button
                id="btn-stop-collection"
                onClick={handleStopCollection}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                Interromper Coleta
              </button>
            ) : (
              <button
                id="btn-refresh-radar"
                onClick={() => handleExecuteCollection()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar Radar
              </button>
            )}

            {currentRole === "Administrator" && (
              <>
                <button
                  id="btn-config-radar"
                  onClick={() => setIsConfigModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Configurações de Busca
                </button>
                <button
                  id="btn-clear-radar"
                  onClick={handleClearData}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-rose-900/30 text-rose-400 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
                  title="Limpar registros coletados"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Base
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800 pt-4 overflow-x-auto">
          <button
            id="tab-btn-feed"
            onClick={() => setActiveTab("FEED")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "FEED"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Radio className="w-4 h-4" />
            Notícias & Feed Digital ({radarData?.mentions?.length || 0})
          </button>

          <button
            id="tab-btn-connectivity"
            onClick={() => {
              setActiveTab("CONNECTIVITY");
              if (!connTestResult && !isRunningConnTest) {
                handleRunConnectivityTest();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "CONNECTIVITY"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Wifi className="w-4 h-4" />
            ⚡ Teste de Conectividade e Fontes
          </button>

          <button
            id="tab-btn-diagnostics"
            onClick={() => {
              setActiveTab("DIAGNOSTICS");
              if (healthChecks.length === 0 && !isRunningDiagnostics) {
                handleRunDiagnostics();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "DIAGNOSTICS"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Auditoria Técnica & Logs ({radarData?.diagnosticLogs?.length || 0})
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME SEARCH STATUS BANNER */}
      {isSearching && currentQueryInfo && (
        <div className="bg-blue-950/60 border border-blue-500/40 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <div>
              <p className="text-white text-sm font-semibold">
                Buscando dados em fontes públicas reais...
              </p>
              <p className="text-blue-300 text-xs mt-0.5">
                Fonte: <span className="font-mono text-white">{currentQueryInfo.source}</span> | Consulta: <span className="font-mono text-white">{currentQueryInfo.query}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleStopCollection}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-4 flex items-start justify-between gap-3 text-rose-300 text-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Aviso da Coleta Digital</p>
              <p className="text-rose-300 text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white text-xs underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: FEED PRINCIPAL & ESTATÍSTICAS                                      */}
      {/* ========================================================================= */}
      {activeTab === "FEED" && (
        <div className="space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Notícias Catalogadas</span>
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {filteredMentions.length}
              </div>
              <p className="text-slate-500 text-xs mt-1">
                De um total de {radarData?.mentions?.length || 0} na base
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Sentimento Predominante</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {sentimentStats.posPct >= sentimentStats.negPct && sentimentStats.posPct >= sentimentStats.neuPct
                    ? "Positivo"
                    : sentimentStats.negPct >= sentimentStats.posPct && sentimentStats.negPct >= sentimentStats.neuPct
                    ? "Negativo"
                    : "Neutro / Informativo"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="text-emerald-400">🟢 {sentimentStats.posPct}% Pos</span>
                <span className="text-slate-400">⚪ {sentimentStats.neuPct}% Neu</span>
                <span className="text-rose-400">🔴 {sentimentStats.negPct}% Neg</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Fontes Públicas Ativas</span>
                <Server className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {radarData?.sourcesActive?.length || 0}
              </div>
              <p className="text-slate-500 text-xs mt-1 truncate">
                {radarData?.sourcesActive?.slice(0, 3).join(", ") || "G1 SE, Infonet, Fan F1"}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Última Coleta em Rede</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-white truncate">
                {radarData?.lastUpdated
                  ? new Date(radarData.lastUpdated).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                  : "Nenhuma coleta"}
              </div>
              <p className="text-emerald-400 text-xs mt-1 font-medium">
                {radarData?.collectionStatus === "atualizada" ? "Base Atualizada" : "Pronta para coleta"}
              </p>
            </div>
          </div>

          {/* GOOGLE TRENDS TRANSPARENCY CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">Índice de Interesse Digital & Tendências</h3>
                  <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                    Base Pública de Notícias
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Índice de menções e visibilidade pública baseado nas notícias reais monitoradas em Sergipe.
                </p>
              </div>
              <span className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-md">
                Google Trends: API não configurada neste ambiente
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mt-4">
              {candidateDistribution.length > 0 ? (
                candidateDistribution.map((cand) => (
                  <div
                    key={cand.name}
                    className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="text-xs font-semibold text-white truncate" title={cand.name}>
                      {cand.name}
                    </div>
                    <div className="text-slate-500 text-[11px] truncate">{cand.party || "Sergipe"}</div>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-xl font-bold text-blue-400">{cand.total}</span>
                      <span className="text-[11px] text-slate-400">menções</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden flex">
                      <div style={{ width: `${(cand.pos / (cand.total || 1)) * 100}%` }} className="bg-emerald-500 h-full" />
                      <div style={{ width: `${(cand.neu / (cand.total || 1)) * 100}%` }} className="bg-slate-500 h-full" />
                      <div style={{ width: `${(cand.neg / (cand.total || 1)) * 100}%` }} className="bg-rose-500 h-full" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center text-slate-500 text-xs">
                  Execute o Radar Digital ou Teste de Conectividade para calcular a distribuição de menções.
                </div>
              )}
            </div>
          </div>

          {/* FILTERS TOOLBAR */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Keyword */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por título, termos ou trecho..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Candidate */}
                <select
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Todos os Candidatos</option>
                  {filterOptions.candidates.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Sentiment */}
                <select
                  value={selectedSentiment}
                  onChange={(e) => setSelectedSentiment(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Todos os Sentimentos</option>
                  <option value="POSITIVO">🟢 Positivo</option>
                  <option value="NEUTRO">⚪ Neutro</option>
                  <option value="NEGATIVO">🔴 Negativo</option>
                  <option value="INDETERMINADO">🟡 Indeterminado</option>
                </select>

                {/* Source */}
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Todas as Fontes</option>
                  {filterOptions.sources.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* Period */}
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Todo o Período</option>
                  <option value="24H">Últimas 24 Horas</option>
                  <option value="7D">Últimos 7 Dias</option>
                  <option value="30D">Últimos 30 Dias</option>
                </select>
              </div>
            </div>
          </div>

          {/* MENTIONS STREAM LIST */}
          <div className="space-y-3">
            {filteredMentions.length > 0 ? (
              filteredMentions.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                          {item.candidateName}
                        </span>
                        {item.candidateParty && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-slate-800 text-slate-300 rounded-md">
                            {item.candidateParty}
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-800/80 text-slate-400 rounded-md border border-slate-700/50">
                          {item.source}
                        </span>
                        {item.municipality && item.municipality !== "Localização não identificada" && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-800/80 text-slate-300 rounded-md">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.municipality}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white hover:text-blue-400 transition-colors leading-snug">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5"
                        >
                          {item.title}
                          <ArrowUpRight className="w-4 h-4 text-slate-400 inline" />
                        </a>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.sentiment === "POSITIVO" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          🟢 Positivo
                        </span>
                      )}
                      {item.sentiment === "NEUTRO" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/20">
                          ⚪ Neutro
                        </span>
                      )}
                      {item.sentiment === "NEGATIVO" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          🔴 Negativo
                        </span>
                      )}
                      {item.sentiment === "INDETERMINADO" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          🟡 Indeterminado
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    {item.snippet}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>Publicado em: <strong className="text-slate-200">{item.date} {item.time ? `às ${item.time}` : ""}</strong></span>
                      {item.sentimentReason && (
                        <span className="italic text-slate-400 hidden sm:inline">
                          — Motivo: {item.sentimentReason}
                        </span>
                      )}
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                    >
                      Acessar Fonte Original
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nenhum registro encontrado</h3>
                  <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                    Nenhuma notícia pública coincide com os filtros atuais. Você pode clicar no botão abaixo para coletar notícias reais da internet.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleExecuteCollection()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow transition-colors"
                  >
                    Coletar Notícias Agora
                  </button>
                  <button
                    onClick={() => setActiveTab("CONNECTIVITY")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-700 transition-colors"
                  >
                    Executar Teste de Conectividade
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TESTE DE CONECTIVIDADE E FONTE (MANDATÓRIO)                         */}
      {/* ========================================================================= */}
      {activeTab === "CONNECTIVITY" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Teste de Conectividade e Fontes Públicas</h2>
                </div>
                <p className="text-slate-400 text-sm mt-1">
                  Validação direta e isolada de acesso à internet e extração de notícias de Sergipe sem intermediários.
                </p>
              </div>

              <button
                id="btn-run-conn-test"
                onClick={() => handleRunConnectivityTest()}
                disabled={isRunningConnTest}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow transition-all"
              >
                {isRunningConnTest ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testando Conexão...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    TESTAR AGORA
                  </>
                )}
              </button>
            </div>

            {/* Test Configuration Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Termo de Consulta para o Teste
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={connTestQuery}
                    onChange={(e) => setConnTestQuery(e.target.value)}
                    placeholder="Ex: Sergipe, Fábio Mitidieri, Aracaju..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["Sergipe", "Fábio Mitidieri", "Valmir de Francisquinho", "Rogério Carvalho", "Alessandro Vieira", "Yandra Moura", "Emília Corrêa", "Aracaju"].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setConnTestQuery(term);
                        handleRunConnectivityTest(term, connTestSourceUrl);
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                        connTestQuery === term
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Fonte de Notícias Selecionada
                </label>
                <select
                  value={connTestSourceUrl}
                  onChange={(e) => setConnTestSourceUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {KNOWN_SOURCES_LIST.map((src) => (
                    <option key={src.url} value={src.url}>
                      {src.name} — ({src.desc})
                    </option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1">
                  URL da fonte: <span className="font-mono text-slate-400">{connTestSourceUrl}</span>
                </p>
              </div>
            </div>

            {/* Test Outcome Display */}
            {connTestResult && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                {/* Result Header */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    connTestResult.outcome === "TESTE APROVADO"
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : connTestResult.outcome === "TESTE SEM RESULTADOS"
                      ? "bg-slate-900 border-slate-700 text-slate-300"
                      : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {connTestResult.outcome === "TESTE APROVADO" && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    )}
                    {connTestResult.outcome === "TESTE SEM RESULTADOS" && (
                      <AlertCircle className="w-6 h-6 text-slate-400 shrink-0" />
                    )}
                    {connTestResult.outcome === "ERRO DE CONEXAO / FONTE NAO ACESSIVEL" && (
                      <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                    )}

                    <div>
                      <h3 className="text-base font-bold tracking-tight text-white">
                        {connTestResult.outcome}
                      </h3>
                      <p className="text-xs opacity-90">
                        {connTestResult.itemsFound > 0
                          ? `${connTestResult.itemsFound} notícias públicas reais retornadas pela fonte "${connTestResult.sourceName}".`
                          : connTestResult.diagnostic.classificationLabel || "Sem registros retornados."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="bg-black/30 px-2.5 py-1 rounded">
                      Status: HTTP {connTestResult.httpStatus || "N/A"}
                    </span>
                    <span className="bg-black/30 px-2.5 py-1 rounded">
                      Latência: {connTestResult.durationMs}ms
                    </span>
                  </div>
                </div>

                {/* Technical Diagnostic Metadata Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800/80 pb-2 mb-2">
                    <span>DIAGNÓSTICO TÉCNICO DA CONSULTA</span>
                    <span className="text-slate-500">Horário: {new Date(connTestResult.testedAt).toLocaleTimeString("pt-BR")}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
                    <div>Fonte Testada: <span className="text-emerald-400">{connTestResult.sourceName}</span></div>
                    <div>Endpoint: <span className="text-slate-400 break-all">{connTestResult.endpointUrl}</span></div>
                    <div>Termo Consultado: <span className="text-amber-400">"{connTestResult.queryTerm}"</span></div>
                    <div>Classificação: <span className="text-blue-400">[{connTestResult.diagnostic.classificationCode || "A"}] {connTestResult.diagnostic.classificationLabel}</span></div>
                  </div>

                  {connTestResult.diagnostic.responseSnippet && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60">
                      <span className="text-slate-500 block mb-1">Trecho da resposta bruta recebida da fonte:</span>
                      <pre className="p-2 bg-slate-900 rounded text-[11px] text-slate-400 overflow-x-auto whitespace-pre-wrap max-h-24">
                        {connTestResult.diagnostic.responseSnippet}
                      </pre>
                    </div>
                  )}
                </div>

                {/* List of Real News Extracted */}
                {connTestResult.items.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Registros Reais Extraídos da Fonte ({connTestResult.items.length})
                    </h4>

                    <div className="space-y-2">
                      {connTestResult.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1.5 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h5 className="text-sm font-bold text-white hover:text-blue-400">
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                                {item.title}
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400 inline" />
                              </a>
                            </h5>
                            <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded shrink-0">
                              {item.source}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs line-clamp-2">
                            {item.snippet}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>Publicado em: <strong className="text-slate-300">{item.date} {item.time ? `às ${item.time}` : ""}</strong></span>
                            <span className="font-mono text-slate-600 truncate max-w-xs">{item.url}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDITORIA TÉCNICA, HEALTH CHECKS & LOGS                            */}
      {/* ========================================================================= */}
      {activeTab === "DIAGNOSTICS" && (
        <div className="space-y-6">
          {/* Source Health Check Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Status de Conectividade das Fontes Públicas</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Verificação em tempo real da disponibilidade de cada portal e feed de notícias monitorado.
                </p>
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningDiagnostics}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostics ? "animate-spin" : ""}`} />
                Testar Todas as Fontes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {healthChecks.length > 0 ? (
                healthChecks.map((hc, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{hc.name}</h4>
                        <span className="text-[11px] text-slate-500">{hc.category}</span>
                      </div>
                      {hc.status === "ONLINE" && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                          ONLINE ({hc.latencyMs}ms)
                        </span>
                      )}
                      {hc.status === "NAO_CONFIGURADA" && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 rounded">
                          NÃO CONFIGURADA
                        </span>
                      )}
                      {hc.status === "TIMEOUT" && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                          TIMEOUT
                        </span>
                      )}
                      {hc.status === "ERRO" && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">
                          ERRO HTTP {hc.httpStatus || ""}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400">{hc.message}</p>
                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      {hc.url}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                  {isRunningDiagnostics ? "Executando teste das fontes..." : "Clique em 'Testar Todas as Fontes' para verificar a latência de cada provedor."}
                </div>
              )}
            </div>
          </div>

          {/* Diagnostic Execution Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Log de Auditoria de Consultas (Audit Trail)</h3>
                <p className="text-slate-400 text-xs">
                  Histórico detalhado de requisições enviadas e respostas recebidas.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {radarData?.diagnosticLogs?.length || 0} registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Horário</th>
                    <th className="py-2.5 px-3">Fonte</th>
                    <th className="py-2.5 px-3">Consulta</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">HTTP</th>
                    <th className="py-2.5 px-3">Latência</th>
                    <th className="py-2.5 px-3">Itens</th>
                    <th className="py-2.5 px-3">Classificação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {radarData?.diagnosticLogs && radarData.diagnosticLogs.length > 0 ? (
                    radarData.diagnosticLogs.slice(0, 30).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                        </td>
                        <td className="py-2 px-3 font-semibold text-white">{log.source}</td>
                        <td className="py-2 px-3 font-mono text-slate-300 truncate max-w-xs">{log.query}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${
                              log.status === "DADOS ENCONTRADOS"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : log.status === "SEM RESULTADOS"
                                ? "bg-slate-800 text-slate-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400">{log.httpStatus || "-"}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">{log.durationMs}ms</td>
                        <td className="py-2 px-3 font-bold text-white">{log.itemsFound}</td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-xs">
                          {log.classificationLabel || log.errorMessage || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Nenhum registro de auditoria disponível.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURAÇÃO DE BUSCA DOS CANDIDATOS (ADMIN)                       */}
      {/* ========================================================================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Configurações de Busca dos Candidatos</h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Ajuste os termos de busca e palavras de exclusão para cada candidato monitorado.
                </p>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {editingConfigs.map((cfg, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white">{cfg.candidateName}</span>
                      <span className="text-xs text-slate-500 ml-2">({cfg.party || "Sem Partido"} • {cfg.role})</span>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfg.active}
                        onChange={(e) => {
                          const updated = [...editingConfigs];
                          updated[idx].active = e.target.checked;
                          setEditingConfigs(updated);
                        }}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      Ativo no Monitoramento
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Termos de Busca / Aliases (separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={cfg.searchTerms.join(", ")}
                      onChange={(e) => {
                        const updated = [...editingConfigs];
                        updated[idx].searchTerms = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                        setEditingConfigs(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Termos de Exclusão (opcional)
                    </label>
                    <input
                      type="text"
                      value={cfg.excludeTerms.join(", ")}
                      onChange={(e) => {
                        const updated = [...editingConfigs];
                        updated[idx].excludeTerms = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                        setEditingConfigs(updated);
                      }}
                      placeholder="Ex: futebol, show, etc."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfigs}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Poll } from "../types";
import { useElectoralData } from "../context/ElectoralDataContext";
import {
  SERGIPE_MUNICIPALITIES,
  SERGIPE_TERRITORIOS,
  SERGIPE_MUNICIPIOS_POR_TERRITORIO,
  getOfficialCandidateColor
} from "../data/sergipeData";
import {
  CANDIDATOS_OFICIAIS_2026,
  OfficialCandidate2026
} from "../data/candidatosOficiais2026";
import { SERGIPE_75_MUNICIPIOS } from "../data/tseSergipeMunicipios";
import { BASE_TERRITORIAL_SERGIPE } from "../data/bairrosElectoralDatabase";
import {
  extractNeighborhoodMetrics,
  normalizeHeader,
  getSurveyColumnMap,
  NeighborhoodMetric
} from "../utils/surveyQuestionDetector";
import {
  extractRowCoordinates,
  getLocalGisStandardizedBairro,
  reverseGeocodeLocation,
  batchGeocodeRows,
  StandardizedGeoResult,
  GeocodeReliabilityStatus,
  saveGeocodeCache,
  getGeocodeCacheStats
} from "../utils/reverseGeocoder";
import { SAMPLE_SERGIPE_GPS_POINTS } from "../data/sampleGpsPoints";
import {
  formatDateBR,
  formatDateRangeBR,
  getPollDateBR,
  getPollDateDetailBR
} from "../utils/dateFormatter";
import { GpsAuditTable } from "./gps/GpsAuditTable";
import { GpsCoordinateSimulator } from "./gps/GpsCoordinateSimulator";

import {
  Crosshair,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  Megaphone,
  Users,
  Target,
  ArrowUpDown,
  Compass,
  CheckCircle2,
  Building2,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  Printer,
  Copy,
  Check,
  Globe2,
  Satellite,
  RefreshCw,
  Landmark,
  UserCheck,
  Briefcase,
  Database,
  Radio,
  SlidersHorizontal,
  ChevronDown,
  TableProperties,
  LayoutDashboard
} from "lucide-react";

interface GpsVotosBairrosProps {
  polls?: Poll[];
}

type RoleFilter = "Governador" | "Senador" | "Deputado Federal" | "Deputado Estadual";
type StatusFilter = "todos" | "campo_de_batalha" | "fortaleza" | "adverso";
type SubTabMode = "tatico" | "auditoria_gps" | "simulador_gps";

// Bairros e localidades canônicas oficiais por município para garantir 100% de autenticidade geográfica
const CANONICAL_BAIRROS_BY_MUNI: Record<string, string[]> = {
  "Aracaju": [
    "13 de Julho", "Jardins", "Farolândia", "Atalaia", "Coroa do Meio", "Aruana", "Robalo",
    "Mosqueiro", "Areia Branca (Zona de Expansão)", "Centro", "São José", "Suíssa",
    "Salgado Filho", "Grageru", "Luzia", "Ponto Novo", "Jabotiana", "Inácio Barbosa",
    "São Conrado", "Santa Maria", "17 de Março", "Aeroporto", "Siqueira Campos", "América",
    "Santos Dumont", "Bugio", "Jardim Centenário", "Olaria", "Soledade", "Lamarão",
    "Japãozinho", "Porto Dantas", "Bairro Industrial", "Santo Antônio", "18 do Forte",
    "Cidade Nova", "Palestina", "Capucho", "Getúlio Vargas", "Cirurgia", "Pereira Lobo"
  ],
  "Nossa Senhora do Socorro": [
    "Marcos Freire I", "Marcos Freire II", "Marcos Freire III", "João Alves",
    "Taiçoca de Fora", "Taiçoca de Dentro", "Fernando Collor", "Piabeta", "Albano Franco",
    "Parque dos Faróis", "Guajará", "Centro / Sede", "Sobrado", "Palestina (Socorro)",
    "Porto Grande", "Tabocas", "Pai André"
  ],
  "São Cristóvão": [
    "Eduardo Gomes", "Rosa Elze", "Rosa Maria", "Madre Paulina", "Tijuquinha",
    "Marcelo Déda (São Cristóvão)", "Jardim Universitário", "Luiz Alves", "Centro Histórico",
    "Povoado Pedreiras", "Povoado Rita Cacete", "Povoado Colônia Miranda", "Povoado Cantinho"
  ],
  "Itabaiana": [
    "Centro", "Rotary", "Chiara Lubich", "Mamede Paes Mendonça", "Porto da Folha",
    "Bananeiras", "São Cristóvão", "Serrano", "Serrinha", "Queimadas",
    "Povoado Carrilho", "Povoado Rio das Pedras", "Povoado Zanguê", "Povoado Dende"
  ],
  "Lagarto": [
    "Centro", "Cidade Nova", "Alto da Boa Vista", "Loiola", "Santo Antônio",
    "Ademar de Carvalho", "Novo Horizonte", "Povoado Jenipapo", "Povoado Colônia Treze",
    "Povoado Olhos D'Água", "Povoado Brejo", "Povoado Quilombo", "Povoado Brasília"
  ],
  "Estância": [
    "Centro", "Cidade Nova", "Alagoas", "Santa Cruz", "Porto D'Areia", "Bairro Novo",
    "Bomfim", "Povoado Porto do Mato", "Praia do Abaís", "Praia das Dunas",
    "Povoado Farnaval", "Povoado Bom Viver"
  ],
  "Barra dos Coqueiros": [
    "Centro", "Atalaia Nova", "Praia da Costa", "Jatobá", "Prisco Viana",
    "Marcelo Déda", "Olimar", "Touro", "Povoado Capuã", "Litoral Norte"
  ],
  "Nossa Senhora da Glória": [
    "Centro", "Divinéia", "Nova Esperança", "Brasília", "Silvino Barbosa",
    "Povoado Angico", "Povoado Feirinha", "Povoado Várzea dos Cágados", "Povoado Piçarras"
  ],
  "Itaporanga d'Ajuda": [
    "Centro", "Bairro Novo", "São José", "Alto da Bela Vista", "Praia da Caueira",
    "Povoado Dorinha", "Povoado Sapé", "Povoado Nova Descoberta"
  ],
  "Propriá": [
    "Centro", "Remanso", "Santa Maria", "Bela Vista", "Matadouro",
    "Povoado São Vicente", "Povoado Boa Esperança"
  ],
  "Tobias Barreto": [
    "Centro", "Santa Rita", "Vila Samambaia", "Cruz das Graças",
    "Povoado Montes Coelhos", "Povoado Nova Brasília", "Povoado Campo Grande"
  ],
  "Simão Dias": [
    "Centro", "Bairro Novo", "Rivalda Silva", "Belo Horizonte",
    "Povoado Triunfo", "Povoado Pastinho", "Povoado Paracatu"
  ]
};

function getCandidatePartyTag(candidate: OfficialCandidate2026 | { name: string; party?: string; coalition?: string }): string {
  if ("party" in candidate && candidate.party && candidate.party.trim()) {
    return candidate.party.trim();
  }
  if ("partyName" in candidate && candidate.partyName && candidate.partyName.trim()) {
    return candidate.partyName.trim();
  }
  const n = normalizeHeader(candidate.name);
  if (n.includes("fabio")) return "PSD";
  if (n.includes("valmir")) return "PL";
  if (n.includes("rogerio")) return "PT";
  if (n.includes("alessandro")) return "MDB";
  if (n.includes("andre moura")) return "UNIÃO";
  if (n.includes("edvaldo")) return "PDT";
  if (n.includes("helton")) return "PSOL";
  if (n.includes("emanuel cacho")) return "PSDB";
  if (n.includes("ricardo marques")) return "PL";
  if (n.includes("taty")) return "DC";
  return "";
}

export default function GpsVotosBairros({ polls: propPolls }: GpsVotosBairrosProps) {
  const globalContext = useElectoralData();

  // Sub tab navigation
  const [activeSubTab, setActiveSubTab] = useState<SubTabMode>("tatico");

  // All polls from context or props
  const allPolls = useMemo(() => {
    return globalContext?.polls && globalContext.polls.length > 0
      ? globalContext.polls
      : propPolls || [];
  }, [globalContext?.polls, propPolls]);

  // 1. Base Selector
  const [selectedBaseId, setSelectedBaseId] = useState<string>("ALL");

  // 2. Filters
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("Governador");
  const [selectedCandidate, setSelectedCandidate] = useState<string>("DISPUTA_ABERTA");
  const [selectedTerritory, setSelectedTerritory] = useState<string>("TODOS");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("TODOS");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"prioridade" | "diferenca" | "indecisos" | "amostra">("prioridade");
  const [copied, setCopied] = useState<boolean>(false);

  // 3. Reverse Geocoding Batch & Audit State
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodeProgress, setGeocodeProgress] = useState<{ processed: number; total: number; percent: number }>({
    processed: 0,
    total: 0,
    percent: 0
  });
  const [auditRows, setAuditRows] = useState<StandardizedGeoResult[]>([]);
  const [onlineGeocodedMap, setOnlineGeocodedMap] = useState<Record<string, StandardizedGeoResult>>({});

  // List of official candidates for active role
  const officialCandidatesForRole = useMemo(() => {
    return CANDIDATOS_OFICIAIS_2026.filter((c) => c.role === selectedRole);
  }, [selectedRole]);

  // Target Polls to aggregate
  const targetPolls = useMemo(() => {
    if (allPolls.length === 0) return [];
    if (selectedBaseId === "ALL") return allPolls;
    const found = allPolls.find((p) => p.id === selectedBaseId);
    return found ? [found] : [allPolls[0]];
  }, [allPolls, selectedBaseId]);

  // Candidate options for active role (including real survey data names)
  const candidateOptions = useMemo(() => {
    const list: { name: string; party?: string }[] = [];
    
    // Add official candidates
    officialCandidatesForRole.forEach((c) => {
      list.push({ name: c.name, party: getCandidatePartyTag(c) });
    });

    // Also collect distinct candidates from actual survey microdata
    targetPolls.forEach((p) => {
      const rows = globalContext?.getResearchBase
        ? globalContext.getResearchBase(p)
        : (p.rawRows || p.data || p.dados || p.rows || p.respostas || []);
      if (rows && rows.length > 0) {
        const colMap = getSurveyColumnMap(p);
        const roleNorm = normalizeHeader(selectedRole);
        let voteCol = colMap.governador;
        if (roleNorm.includes("senador")) voteCol = colMap.senador;
        else if (roleNorm.includes("federal")) voteCol = colMap.deputado_federal;
        else if (roleNorm.includes("estadual")) voteCol = colMap.deputado_estadual;

        if (voteCol) {
          rows.forEach((r: any) => {
            const val = String(r[voteCol] || "").trim();
            if (val) {
              const valNorm = normalizeHeader(val);
              if (
                !valNorm.includes("branco") &&
                !valNorm.includes("nulo") &&
                !valNorm.includes("indeciso") &&
                !valNorm.includes("ns nr") &&
                !valNorm.includes("nao sabe") &&
                !valNorm.includes("nenhum") &&
                !valNorm.includes("ninguem") &&
                !list.some((existing) => existing.name.toLowerCase() === val.toLowerCase())
              ) {
                list.push({ name: val });
              }
            }
          });
        }
      }
    });

    return list;
  }, [officialCandidatesForRole, targetPolls, selectedRole, globalContext]);

  // Sync selectedCandidate when role changes (preserves DISPUTA_ABERTA)
  useEffect(() => {
    if (selectedCandidate === "DISPUTA_ABERTA") return;
    const found = candidateOptions.find((c) => c.name.toLowerCase() === selectedCandidate.toLowerCase());
    if (!found && candidateOptions.length > 0) {
      setSelectedCandidate("DISPUTA_ABERTA");
    }
  }, [selectedRole, candidateOptions]);

  // Available municipalities based on selected Territory
  const availableMunicipalities = useMemo(() => {
    if (selectedTerritory === "TODOS") {
      return SERGIPE_75_MUNICIPIOS.map((m) => m.nome).sort();
    }
    return (SERGIPE_MUNICIPIOS_POR_TERRITORIO[selectedTerritory] || []).sort();
  }, [selectedTerritory]);

  const handleTerritoryChange = (territory: string) => {
    setSelectedTerritory(territory);
    if (territory !== "TODOS") {
      const allowed = SERGIPE_MUNICIPIOS_POR_TERRITORIO[territory] || [];
      if (!allowed.includes(selectedMunicipality)) {
        setSelectedMunicipality("TODOS");
      }
    }
  };

  // Count GPS coordinates in active polls
  const detectedCoordinatesInPolls = useMemo(() => {
    const coords: { lat: number; lng: number; row: any; id: any }[] = [];
    targetPolls.forEach((poll) => {
      const rows = poll.rawRows || poll.data || poll.dados || poll.rows || poll.respostas || [];
      rows.forEach((r: any, idx: number) => {
        const c = extractRowCoordinates(r);
        if (c) {
          coords.push({ ...c, row: r, id: r.id || r.ID || `${poll.id}_${idx + 1}` });
        }
      });
    });
    return coords;
  }, [targetPolls]);

  // Initialize initial audit rows from survey coordinates strictly
  useEffect(() => {
    if (detectedCoordinatesInPolls.length > 0) {
      const initialAudit: StandardizedGeoResult[] = detectedCoordinatesInPolls.map((pt, idx) => {
        const muniHint = pt.row?.municipio || pt.row?.cidade || undefined;
        const key = `${+pt.lat.toFixed(4)},${+pt.lng.toFixed(4)}`;
        if (onlineGeocodedMap[key]) {
          return onlineGeocodedMap[key];
        }
        const quickGis = getLocalGisStandardizedBairro(pt.lat, pt.lng, muniHint);
        quickGis.id = pt.id || idx + 1;
        return quickGis;
      });
      setAuditRows(initialAudit);
    } else {
      setAuditRows([]);
    }
  }, [detectedCoordinatesInPolls]);

  // Load sample points manually ONLY when explicitly clicked by user for simulation
  const handleLoadSampleData = useCallback(() => {
    const sampleAudit: StandardizedGeoResult[] = SAMPLE_SERGIPE_GPS_POINTS.map((pt) => {
      const quickGis = getLocalGisStandardizedBairro(pt.latitude, pt.longitude, pt.municipio);
      quickGis.id = pt.id;
      return quickGis;
    });
    setAuditRows(sampleAudit);
  }, []);

  // Run Batch Geocoding (Online + Cache + Official Match)
  const handleRunBatchGeocoding = useCallback(async () => {
    if (auditRows.length === 0) return;

    setIsGeocoding(true);
    const total = auditRows.length;
    setGeocodeProgress({ processed: 0, total, percent: 0 });

    const newAuditList: StandardizedGeoResult[] = [];
    const newMap: Record<string, StandardizedGeoResult> = { ...onlineGeocodedMap };

    for (let i = 0; i < total; i++) {
      const item = auditRows[i];
      if (item.latitude && item.longitude) {
        const key = `${+item.latitude.toFixed(4)},${+item.longitude.toFixed(4)}`;
        try {
          const res = await reverseGeocodeLocation(item.latitude, item.longitude, item.municipio);
          res.id = item.id;
          newAuditList.push(res);
          newMap[key] = res;
        } catch (e) {
          const fallback = getLocalGisStandardizedBairro(item.latitude, item.longitude, item.municipio);
          fallback.id = item.id;
          newAuditList.push(fallback);
          newMap[key] = fallback;
        }
      } else {
        newAuditList.push(item);
      }

      setGeocodeProgress({
        processed: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100)
      });
    }

    saveGeocodeCache();
    setAuditRows(newAuditList);
    setOnlineGeocodedMap(newMap);
    setIsGeocoding(false);
  }, [auditRows, onlineGeocodedMap]);

  // =========================================================================
  // STRICT DATA COMPUTATION ENGINE (100% SOURCED FROM DIAGNÓSTICO DE PESQUISA)
  // Zero hallucination, zero synthetic generation, zero arbitrary estimation
  // =========================================================================
  const { allBairrosMetrics, stateAggregate } = useMemo(() => {
    const metricsMap: Record<string, NeighborhoodMetric> = {};

    targetPolls.forEach((poll) => {
      const rows = globalContext?.getResearchBase
        ? globalContext.getResearchBase(poll)
        : (poll.rawRows || poll.data || poll.dados || poll.rows || poll.respostas || (poll as any).coletas || (poll as any).questionarios || []);

      if (rows && rows.length > 0) {
        const subMetrics = extractNeighborhoodMetrics(poll, selectedCandidate, selectedRole, rows);
        if (subMetrics.hasData && subMetrics.metrics.length > 0) {
          subMetrics.metrics.forEach((m) => {
            const key = `${m.bairro.toLowerCase()}__${m.municipio.toLowerCase()}`;
            if (!metricsMap[key]) {
              metricsMap[key] = { ...m };
            } else {
              // Combine exact counts across multiple polls without any synthetic estimation
              const prev = metricsMap[key];
              const totalAmostra = prev.amostra + m.amostra;
              const totalLiderVotos = prev.liderVotos + m.liderVotos;
              const totalSegundoVotos = prev.segundoVotos + m.segundoVotos;

              prev.amostra = totalAmostra;
              prev.liderVotos = totalLiderVotos;
              prev.liderPct = totalAmostra > 0 ? +((totalLiderVotos / totalAmostra) * 100).toFixed(1) : 0;
              prev.segundoVotos = totalSegundoVotos;
              prev.segundoPct = totalAmostra > 0 ? +((totalSegundoVotos / totalAmostra) * 100).toFixed(1) : 0;
              prev.diferenca = +(prev.liderPct - prev.segundoPct).toFixed(1);
              prev.indecisosPct = totalAmostra > 0
                ? +(((prev.indecisosPct * prev.amostra + m.indecisosPct * m.amostra) / totalAmostra)).toFixed(1)
                : 0;
              prev.brancosNulosPct = totalAmostra > 0
                ? +(((prev.brancosNulosPct * prev.amostra + m.brancosNulosPct * m.amostra) / totalAmostra)).toFixed(1)
                : 0;
            }
          });
        }
      }
    });

    const list = Object.values(metricsMap);

    return {
      allBairrosMetrics: list,
      stateAggregate: {
        totalLocalidades: list.length,
        fortalezas: list.filter((m) => m.statusTatico === "fortaleza").length,
        camposDeBatalha: list.filter((m) => m.statusTatico === "campo_de_batalha").length,
        adversos: list.filter((m) => m.statusTatico === "adverso").length
      }
    };
  }, [targetPolls, selectedCandidate, selectedRole, globalContext]);

  // Filter and Sort results for Tactical Panel
  const filteredAndSortedList = useMemo(() => {
    let result = allBairrosMetrics.filter((item) => {
      if (selectedTerritory !== "TODOS") {
        const muniInTerritory = SERGIPE_MUNICIPIOS_POR_TERRITORIO[selectedTerritory] || [];
        const matchTerritory = muniInTerritory.some(
          (m) => m.toLowerCase() === item.municipio.toLowerCase()
        );
        if (!matchTerritory) return false;
      }

      if (selectedMunicipality !== "TODOS") {
        if (item.municipio.toLowerCase() !== selectedMunicipality.toLowerCase()) {
          return false;
        }
      }

      if (statusFilter !== "todos") {
        if (item.statusTatico !== statusFilter) return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          item.bairro.toLowerCase().includes(q) ||
          item.municipio.toLowerCase().includes(q) ||
          item.lider.toLowerCase().includes(q) ||
          item.segundo.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "prioridade") {
        const getPriorityWeight = (m: typeof a) => {
          if (m.statusTatico === "campo_de_batalha") return 300 - m.diferenca + m.indecisosPct * 2;
          if (m.statusTatico === "adverso" && m.diferenca <= 10) return 200 - m.diferenca;
          if (m.statusTatico === "fortaleza") return 100 - m.diferenca;
          return 50;
        };
        return getPriorityWeight(b) - getPriorityWeight(a);
      }
      if (sortBy === "indecisos") return b.indecisosPct - a.indecisosPct;
      if (sortBy === "diferenca") return a.diferenca - b.diferenca;
      if (sortBy === "amostra") return b.amostra - a.amostra;
      return 0;
    });

    return result;
  }, [allBairrosMetrics, selectedTerritory, selectedMunicipality, statusFilter, searchTerm, sortBy]);

  // Current Summary
  const currentSummary = useMemo(() => {
    const fortalezas = filteredAndSortedList.filter((m) => m.statusTatico === "fortaleza").length;
    const campos = filteredAndSortedList.filter((m) => m.statusTatico === "campo_de_batalha").length;
    const adversos = filteredAndSortedList.filter((m) => m.statusTatico === "adverso").length;
    const totalMetaVirada = filteredAndSortedList.reduce((acc, m) => acc + (m.metaViradaVotos || 0), 0);
    return { fortalezas, campos, adversos, totalMetaVirada };
  }, [filteredAndSortedList]);

  const isOpenDispute = selectedCandidate === "DISPUTA_ABERTA";

  const selectedPollDateStr = useMemo(() => {
    if (selectedBaseId === "ALL") {
      if (allPolls.length === 0) return "Nenhuma pesquisa cadastrada";
      if (allPolls.length === 1) return getPollDateDetailBR(allPolls[0]);
      const first = allPolls[0];
      const last = allPolls[allPolls.length - 1];
      return `Consolidado (${allPolls.length} pesquisas • ${getPollDateBR(first)} a ${getPollDateBR(last)})`;
    }
    const poll = allPolls.find((p) => p.id === selectedBaseId);
    return poll ? getPollDateDetailBR(poll) : "Sem data";
  }, [allPolls, selectedBaseId]);

  const getTacticalAction = (status: NeighborhoodMetric["statusTatico"], indecisos: number, isOpen?: boolean) => {
    if (isOpen) {
      if (status === "campo_de_batalha") {
        return indecisos >= 12
          ? "Disputa totalmente em aberto. Alto volume de indecisos pode definir o vencedor local."
          : "Disputa acirrada entre 1º e 2º colocados. Localidade sem hegemonia isolada consolidada.";
      }
      if (status === "fortaleza") {
        return "Liderança isolada consolidada do 1º colocado (vantagem > 10 p.p. sobre o 2º).";
      }
      return "Localidade com amostragem reduzida na base cadastrada.";
    }

    if (status === "campo_de_batalha") {
      return indecisos >= 12
        ? "Corpo a corpo intensivo + carreatas. Converter indecisos decide a eleição."
        : "Foco em mobilização de lideranças locais e reforço de propostas diretas.";
    }
    if (status === "fortaleza") {
      return "Manter presença institucional e garantir alto comparecimento nas urnas.";
    }
    return "Contenção de danos. Focar em denúncias de fragilidades do adversário.";
  };

  const handleCopyWhatsApp = () => {
    const territoryText = selectedTerritory === "TODOS" ? "Todos os Territórios" : selectedTerritory;
    const muniText = selectedMunicipality === "TODOS" ? "Todos os Municípios" : selectedMunicipality;
    const topCampos = filteredAndSortedList.filter((b) => b.statusTatico === "campo_de_batalha").slice(0, 5);

    const candLabel = isOpenDispute
      ? "Disputa Aberta (Geral / Sem Referência)"
      : `${selectedCandidate} (${selectedRole})`;

    const text = `🎯 *SEIE - ROTEIRO TÁTICO DE CAMPANHA (BAIRROS & GPS)*
📍 *Território:* ${territoryText} | *Município:* ${muniText}
👤 *Cenário / Referência:* ${candLabel}
📅 *Data / Período da Pesquisa:* ${selectedPollDateStr}

🔥 *TOP 5 CAMPOS DE BATALHA (PRIORIDADE IMEDIATA):*
${
  topCampos.length > 0
    ? topCampos
        .map(
          (b, i) =>
            `${i + 1}. *${b.bairro} (${b.municipio})*
   • Liderança: ${b.lider} (${b.liderPct}%) vs ${b.segundo} (${b.segundoPct}%) | Dif: ${b.diferenca} p.p.
   • Indecisos: *${b.indecisosPct}%* | Meta de Virada: *~${b.metaViradaVotos} votos*
   • Diagnóstico: ${getTacticalAction(b.statusTatico, b.indecisosPct, isOpenDispute)}`
        )
        .join("\n\n")
    : "Nenhum campo de batalha com os filtros atuais."
}

📈 *RESUMO LOCAL:*
• ${isOpenDispute ? "Lideranças Consolidadas" : "Fortalezas Próprias"}: ${currentSummary.fortalezas}
• Zonas de Disputa / Batalha: ${currentSummary.campos}
${!isOpenDispute ? `• Zonas Adversas: ${currentSummary.adversos}\n` : ""}
📌 *Coordenação de Estratégia:* Sidney Barreto Batista (CONRE 10801)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab("tatico")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "tatico"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Painel Tático de Votos por Bairro
        </button>

        <button
          onClick={() => setActiveSubTab("auditoria_gps")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "auditoria_gps"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800"
          }`}
        >
          <TableProperties className="w-4 h-4" />
          Auditoria & Geocodificação Reversa (Lat / Long)
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
            {auditRows.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("simulador_gps")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "simulador_gps"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800"
          }`}
        >
          <Crosshair className="w-4 h-4" />
          Simulador & Validador de Coordenadas
        </button>
      </div>

      {/* Render Active View Mode */}
      {activeSubTab === "auditoria_gps" && (
        <GpsAuditTable
          auditRows={auditRows}
          isGeocoding={isGeocoding}
          geocodedProgress={geocodeProgress}
          onRunBatchGeocoding={handleRunBatchGeocoding}
          onLoadSampleData={handleLoadSampleData}
        />
      )}

      {activeSubTab === "simulador_gps" && <GpsCoordinateSimulator />}

      {activeSubTab === "tatico" && (
        <div className="space-y-6">
          {/* Top Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
                    <Crosshair className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                      GPS de Onde Buscar Votos (Bairros e Campos de Batalha)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Base Unificada dos 75 Municípios de Sergipe com Georreferenciamento por Satélite / GPS
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleCopyWhatsApp}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Roteiro Copiado!" : "Copiar Roteiro WhatsApp"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-gray-900 dark:bg-slate-800 text-white hover:bg-black dark:hover:bg-slate-700 rounded-xl shadow-sm cursor-pointer transition-all border border-gray-700/50"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Roteiro
                </button>
              </div>
            </div>

            {/* HIGH-CONTRAST MASTER FILTERS BAR */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-slate-300">
                  Filtros Estratégicos de Segmentação
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* 1. Base de Pesquisa */}
                <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    Base de Pesquisa
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBaseId}
                      onChange={(e) => setSelectedBaseId(e.target.value)}
                      className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none pr-8 cursor-pointer"
                    >
                      <option value="ALL" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-bold">
                        Consolidado ({allPolls.length} pesquisas)
                      </option>
                      {allPolls.map((p) => {
                        const dateLabel = getPollDateBR(p);
                        const sample = p.sampleSize || (p.rawRows ? p.rawRows.length : 0);
                        return (
                          <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                            {p.institute || "CTAS"} • {dateLabel} ({sample} ent.)
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* 2. Cargo */}
                <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    Cargo em Disputa
                  </label>
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as RoleFilter)}
                      className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none pr-8 cursor-pointer"
                    >
                      <option value="Governador" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Governador</option>
                      <option value="Senador" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Senador</option>
                      <option value="Deputado Federal" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Deputado Federal</option>
                      <option value="Deputado Estadual" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Deputado Estadual</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* 3. Candidato Foco */}
                <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800/70">
                  <label className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Candidato de Referência
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCandidate}
                      onChange={(e) => setSelectedCandidate(e.target.value)}
                      className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-blue-400 dark:border-blue-600 rounded-lg px-3 py-2 text-blue-900 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none pr-8 cursor-pointer"
                    >
                      <option
                        value="DISPUTA_ABERTA"
                        className="bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-black py-1"
                      >
                        ⚡ Disputa Aberta (Geral / Sem Referência)
                      </option>
                      {candidateOptions.map((cand) => {
                        return (
                          <option
                            key={cand.name}
                            value={cand.name}
                            className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-medium py-1"
                          >
                            {cand.name} {cand.party ? `(${cand.party})` : ""}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-blue-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* 4. Território / Região */}
                <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
                    Território / Região (8)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTerritory}
                      onChange={(e) => handleTerritoryChange(e.target.value)}
                      className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none pr-8 cursor-pointer"
                    >
                      <option value="TODOS" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                        Todos os 8 Territórios
                      </option>
                      {SERGIPE_TERRITORIOS.map((t) => (
                        <option key={t} value={t} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* 5. Município (75 Cidades) */}
                <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/70">
                  <label className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                    <Landmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Município ({availableMunicipalities.length})
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMunicipality}
                      onChange={(e) => setSelectedMunicipality(e.target.value)}
                      className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-indigo-400 dark:border-indigo-600 rounded-lg px-3 py-2 text-indigo-900 dark:text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none pr-8 cursor-pointer"
                    >
                      <option value="TODOS" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                        Todos os Municípios ({availableMunicipalities.length})
                      </option>
                      {availableMunicipalities.map((mName) => (
                        <option key={mName} value={mName} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                          {mName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-indigo-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Research Information Bar: Date, Sample, TSE Registration */}
              <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Data da Pesquisa:</span>
                    <strong className="text-blue-950 dark:text-white font-bold">{selectedPollDateStr}</strong>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Amostra:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {targetPolls.reduce((acc, p) => acc + (p.sampleSize || (p.rawRows ? p.rawRows.length : 0)), 0).toLocaleString("pt-BR")} entrevistas
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Fonte Oficial:</span>
                    <span className="font-semibold">Diagnóstico (Pesquisa)</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Resp. Técnico:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Sidney Barreto Batista • CONRE 10801</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fortalezas / Lideranças Isoladas */}
            <div
              onClick={() => setStatusFilter(statusFilter === "fortaleza" ? "todos" : "fortaleza")}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
                statusFilter === "fortaleza"
                  ? "bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500 ring-2 ring-emerald-500"
                  : "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {isOpenDispute ? "Lideranças Isoladas" : "Fortalezas Próprias"}
                </span>
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                  {currentSummary.fortalezas}
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  bairros / locais
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                {isOpenDispute
                  ? "1º colocado com vantagem > 10 p.p. de frente."
                  : "Vantagem consolidada > 10 p.p. de frente."}
              </p>
            </div>

            {/* Campos de Batalha */}
            <div
              onClick={() => setStatusFilter(statusFilter === "campo_de_batalha" ? "todos" : "campo_de_batalha")}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
                statusFilter === "campo_de_batalha"
                  ? "bg-amber-100 dark:bg-amber-900/60 border-amber-500 ring-2 ring-amber-500"
                  : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 hover:border-amber-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  Campos de Batalha
                </span>
                <Crosshair className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-900 dark:text-amber-100">
                  {currentSummary.campos}
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                  {isOpenDispute ? "DISPUTA ACIRRADA" : "FOCO DE RECURSOS"}
                </span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                Diferença &le; 10 p.p. entre líderes ou alta taxa de indecisos.
              </p>
            </div>

            {/* Territórios Adversos */}
            <div
              onClick={() => {
                if (!isOpenDispute) {
                  setStatusFilter(statusFilter === "adverso" ? "todos" : "adverso");
                }
              }}
              className={`p-4 rounded-xl border transition-all shadow-sm ${
                isOpenDispute
                  ? "bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-80 cursor-default"
                  : statusFilter === "adverso"
                  ? "bg-rose-100 dark:bg-rose-900/60 border-rose-500 ring-2 ring-rose-500 cursor-pointer"
                  : "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 hover:border-rose-400 cursor-pointer"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  {isOpenDispute ? "Zonas Adversas" : "Territórios Adversos"}
                </span>
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-900 dark:text-rose-100">
                  {isOpenDispute ? 0 : currentSummary.adversos}
                </span>
                <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                  {isOpenDispute ? "(Disputa Aberta Geral)" : "bairros / locais"}
                </span>
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-1">
                {isOpenDispute
                  ? "Em disputa aberta sem referência, todas as áreas são gerais."
                  : "Liderança do adversário. Foco em contenção."}
              </p>
            </div>

            {/* Meta de Virada Estimada */}
            <div className="p-4 rounded-xl border bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  {isOpenDispute ? "Meta de Virada (2º p/ 1º)" : "Meta Total de Virada"}
                </span>
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-900 dark:text-blue-100 font-mono">
                  ~{currentSummary.totalMetaVirada.toLocaleString()}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                  votos p/ virar
                </span>
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                {isOpenDispute
                  ? "Votos necessários para o 2º lugar alcançar o 1º nos bairros."
                  : "Meta nos bairros filtrados p/ virar a disputa."}
              </p>
            </div>
          </div>

          {/* Main Table Controls & Search */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar bairro, município ou candidato..."
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Tabs and Sorting */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setStatusFilter("todos")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      statusFilter === "todos"
                        ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-slate-400 hover:text-gray-900"
                    }`}
                  >
                    Todos ({filteredAndSortedList.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("campo_de_batalha")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      statusFilter === "campo_de_batalha"
                        ? "bg-amber-500 text-white font-bold shadow-sm"
                        : "text-amber-700 dark:text-amber-400 hover:text-amber-800"
                    }`}
                  >
                    Campos de Batalha
                  </button>
                  <button
                    onClick={() => setStatusFilter("fortaleza")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      statusFilter === "fortaleza"
                        ? "bg-emerald-600 text-white font-bold shadow-sm"
                        : "text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
                    }`}
                  >
                    Fortalezas
                  </button>
                  <button
                    onClick={() => setStatusFilter("adverso")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      statusFilter === "adverso"
                        ? "bg-rose-600 text-white font-bold shadow-sm"
                        : "text-rose-700 dark:text-rose-400 hover:text-rose-800"
                    }`}
                  >
                    Adversos
                  </button>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="prioridade">Ordenar: Prioridade Tática</option>
                    <option value="indecisos">Mais Indecisos (%)</option>
                    <option value="diferenca">Menor Diferença (Mais Acirrado)</option>
                    <option value="amostra">Tamanho da Amostra</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/60 font-semibold">
                    <th className="py-3 px-4">Bairro / Localidade</th>
                    <th className="py-3 px-4">Município</th>
                    <th className="py-3 px-4">{isOpenDispute ? "Cenário da Disputa" : "Status Tático"}</th>
                    <th className="py-3 px-4">Líder vs Segundo</th>
                    <th className="py-3 px-4 text-center">Diferença</th>
                    <th className="py-3 px-4 text-center">Indecisos (%)</th>
                    <th className="py-3 px-4 text-center">{isOpenDispute ? "Meta de Virada (2º p/ 1º)" : "Meta de Virada"}</th>
                    <th className="py-3 px-4">{isOpenDispute ? "Diagnóstico da Disputa" : "Ação Tática de Campanha"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                  {filteredAndSortedList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 px-6 text-center">
                        <div className="max-w-lg mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                            <Database className="w-6 h-6" />
                          </div>
                          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            DADO NÃO ENCONTRADO NA BASE
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                            Nenhum registro encontrado para os critérios selecionados na base de dados oficial do <strong>Diagnóstico de Pesquisa</strong>.
                          </p>
                          <div className="p-3 bg-blue-50/70 dark:bg-slate-800/80 rounded-xl border border-blue-200/70 dark:border-slate-700 text-[11px] text-gray-600 dark:text-slate-400 text-left space-y-1">
                            <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              Regra de Integridade Estatística (Diagnóstico de Pesquisa)
                            </div>
                            <p>
                              O sistema não cria, não estima, não completa e não infere dados inexistentes. Todos os quantitativos de bairros e municípios refletem estritamente as entrevistas cadastradas na base.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedList.map((item, idx) => {
                      const isLeadFavored = !isOpenDispute && item.lider.toLowerCase().includes(selectedCandidate.toLowerCase());

                      return (
                        <tr
                          key={`${item.bairro}-${item.municipio}-${idx}`}
                          className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {/* Bairro */}
                          <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>{item.bairro}</span>
                              {item.sourceBadge && (
                                <span className="ml-1 text-[9px] font-normal px-1.5 py-0.2 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                                  {item.sourceBadge}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Município */}
                          <td className="py-3.5 px-4 text-gray-600 dark:text-slate-300">
                            <span className="font-medium">{item.municipio}</span>
                          </td>

                          {/* Status Tático Badge */}
                          <td className="py-3.5 px-4">
                            {item.statusTatico === "fortaleza" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                <ShieldCheck className="w-3 h-3" />
                                {isOpenDispute ? "Liderança Isolada" : "Fortaleza"}
                              </span>
                            )}
                            {item.statusTatico === "campo_de_batalha" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
                                <Flame className="w-3 h-3 text-amber-600" />
                                {isOpenDispute ? "Disputa Acirrada" : "Campo de Batalha"}
                              </span>
                            )}
                            {item.statusTatico === "adverso" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                                <AlertTriangle className="w-3 h-3" />
                                Adverso
                              </span>
                            )}
                          </td>

                          {/* Líder vs Segundo */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`font-bold ${isLeadFavored ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-slate-100"}`}>
                                  1º {item.lider}
                                </span>
                                <span className="font-mono font-black text-gray-900 dark:text-white">
                                  {item.liderPct}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-slate-400">
                                <span>2º {item.segundo}</span>
                                <span className="font-mono">{item.segundoPct}%</span>
                              </div>
                            </div>
                          </td>

                          {/* Diferença */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-xs">
                            <span className={item.diferenca <= 5.0 ? "text-amber-600 dark:text-amber-400 font-black" : "text-gray-700 dark:text-slate-300"}>
                              {item.diferenca} p.p.
                            </span>
                          </td>

                          {/* Indecisos */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-xs">
                            <span className={item.indecisosPct >= 15 ? "text-indigo-600 dark:text-indigo-400 font-black" : "text-gray-600 dark:text-slate-400"}>
                              {item.indecisosPct}%
                            </span>
                          </td>

                          {/* Meta de Virada */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                            {item.metaViradaVotos > 0 ? (
                              <span className="bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                ~{item.metaViradaVotos} votos
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold">{isOpenDispute ? "Sem diferença" : "Liderando"}</span>
                            )}
                          </td>

                          {/* Ação Tática */}
                          <td className="py-3.5 px-4 text-[11px] text-gray-700 dark:text-slate-300 max-w-xs">
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60">
                              {getTacticalAction(item.statusTatico, item.indecisosPct, isOpenDispute)}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Meta */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 dark:text-slate-400 font-mono">
              <span>Exibindo {filteredAndSortedList.length} de {allBairrosMetrics.length} localidades de Sergipe</span>
              <span>Responsável Técnico: Sidney Barreto Batista • CONRE 10801</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

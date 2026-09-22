import React, { useMemo, useEffect, useState } from "react";
import { Territory } from "../types";
import { useElectoralData } from "../context/ElectoralDataContext";
import {
  SERGIPE_MUNICIPIOS_POR_TERRITORIO,
  SERGIPE_TERRITORIOS,
  getOfficialCandidateColor
} from "../data/sergipeData";
import { getPollDateBR } from "../utils/dateFormatter";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from "recharts";
import {
  BarChart3,
  MapPin,
  Filter,
  AlertCircle,
  Database,
  CheckCircle2,
  Building2,
  Layers,
  Search,
  Download,
  Info,
  Flame,
  Table as TableIcon,
  Users,
  TrendingUp,
  SlidersHorizontal,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Trophy,
  Percent,
  Sparkles
} from "lucide-react";

export type OfficeType =
  | "Governador"
  | "1º Senador"
  | "2º Senador"
  | "Deputado Federal"
  | "Deputado Estadual";

export type DatavizViewMode = "heatmap" | "sparkbars" | "comparator" | "stacked_bars";

const PALETTE = [
  "#1E40AF", "#059669", "#D97706", "#7C3AED", "#DC2626",
  "#0284C7", "#4F46E5", "#EA580C", "#0D9488", "#E11D48",
  "#64748B", "#94A3B8"
];

const normalize = (str: string = "") =>
  String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

// Mapeamento dinâmico: Cidade -> Região/Território Oficial de Sergipe
const CITY_TO_REGION: Record<string, string> = {};
if (SERGIPE_MUNICIPIOS_POR_TERRITORIO) {
  Object.entries(SERGIPE_MUNICIPIOS_POR_TERRITORIO).forEach(([region, cities]) => {
    cities.forEach((c) => {
      CITY_TO_REGION[normalize(c)] = region;
    });
  });
}

// 1. Recuperação centralizada da base oficial da pesquisa selecionada
const getResearchBase = (research: any): any[] => {
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

  return [];
};

// Extração robusta do nome do município da linha de microdados
function extractCity(row: Record<string, any>): string {
  if (!row || typeof row !== "object") return "";

  const direct =
    row["Município"] ||
    row["NM_MUNICIPIO"] ||
    row["municipio"] ||
    row["cidade"] ||
    row["Cidade"] ||
    row["CIDADE"] ||
    row["MUNICIPIO"] ||
    row["Nome do Município"] ||
    row["Município/Povoado"] ||
    "";

  if (direct) return String(direct).trim();

  const keys = Object.keys(row);
  const cityKey = keys.find((k) => {
    const norm = normalize(k);
    return norm === "municipio" || norm === "cidade" || norm === "nm_municipio";
  });

  return cityKey ? String(row[cityKey]).trim() : "";
}

// Extração robusta da menção ao candidato para o cargo selecionado
function extractCandidateVote(row: Record<string, any>, office: OfficeType): string {
  if (!row || typeof row !== "object") return "Outros / Indecisos";

  const keys = Object.keys(row);
  let rawVal: any = undefined;

  if (office === "Governador") {
    const k = keys.find((key) => {
      const n = normalize(key);
      return (
        n === "governador" ||
        n.startsWith("governador") ||
        n.includes("voto governador") ||
        n === "gov"
      );
    });
    if (k) rawVal = row[k];
  } else if (office === "1º Senador") {
    const k = keys.find((key) => {
      const n = normalize(key);
      return (
        n.includes("senador 01") ||
        n.includes("senador 1") ||
        n === "senador1" ||
        n.includes("primeiro senador") ||
        (n === "senador" && !n.includes("2"))
      );
    });
    if (k) rawVal = row[k];
  } else if (office === "2º Senador") {
    const k = keys.find((key) => {
      const n = normalize(key);
      return (
        n.includes("senador 02") ||
        n.includes("senador 2") ||
        n === "senador2" ||
        n.includes("segundo senador")
      );
    });
    if (k) rawVal = row[k];
  } else if (office === "Deputado Federal") {
    const k = keys.find((key) => {
      const n = normalize(key);
      return (
        n.includes("deputado federal") ||
        n === "deputado federal" ||
        (n.includes("federal") && !n.includes("estadual"))
      );
    });
    if (k) rawVal = row[k];
  } else if (office === "Deputado Estadual") {
    const k = keys.find((key) => {
      const n = normalize(key);
      return (
        n.includes("deputado estadual") ||
        n === "deputado estadual" ||
        (n.includes("estadual") && !n.includes("federal"))
      );
    });
    if (k) rawVal = row[k];
  }

  if (rawVal !== undefined && String(rawVal).trim() !== "") {
    return String(rawVal).trim();
  }

  // Fallbacks diretos
  if (row[office]) return String(row[office]).trim();
  if (row["Candidato"]) return String(row["Candidato"]).trim();
  if (row["candidato"]) return String(row["candidato"]).trim();

  return "Outros / Indecisos";
}

// Identifica se uma categoria é especial (brancos, nulos, indecisos, outros)
function isSpecialCategory(name: string): boolean {
  const norm = normalize(name);
  return (
    norm.includes("branco") ||
    norm.includes("nulo") ||
    norm.includes("indecis") ||
    norm.includes("nao sabe") ||
    norm.includes("nao respondeu") ||
    norm.includes("ns/nr") ||
    norm.includes("ns nr") ||
    norm.includes("nenhum") ||
    norm.startsWith("outros")
  );
}

export default function AnaliseTerritorialView(_props?: { territories?: Territory[] }) {
  const {
    polls,
    selectedResearchId,
    setSelectedResearchId,
    selectedOffice: contextSelectedOffice,
    setSelectedOffice: setContextSelectedOffice,
    uploadedDatasets
  } = useElectoralData();

  const [localOffice, setLocalOffice] = useState<OfficeType>(
    (contextSelectedOffice as OfficeType) || "Governador"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerritoryFilter, setSelectedTerritoryFilter] = useState<string>("ALL");

  // Novo estado de UX/Dataviz: Modos de visualização solicitados
  const [viewMode, setViewMode] = useState<DatavizViewMode>("heatmap");
  const [groupLongTail, setGroupLongTail] = useState<boolean>(true);
  const [barOrientation, setBarOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [selectedCandidatesForCompare, setSelectedCandidatesForCompare] = useState<string[]>([]);
  const [tableSortColumn, setTableSortColumn] = useState<string>("stateAvg");
  const [tableSortDir, setTableSortDir] = useState<"asc" | "desc">("desc");

  const selectedOffice = localOffice;
  const handleOfficeChange = (office: OfficeType) => {
    setLocalOffice(office);
    if (setContextSelectedOffice) {
      setContextSelectedOffice(office);
    }
  };

  // 1. Identificar a pesquisa atualmente selecionada
  const selectedResearch = useMemo(() => {
    if (!polls || polls.length === 0) return null;
    if (selectedResearchId) {
      const found = polls.find(
        (poll: any) =>
          poll.id === selectedResearchId ||
          poll.codigo === selectedResearchId ||
          poll.id_pesquisa === selectedResearchId
      );
      if (found) return found;
    }
    return polls[polls.length - 1] || polls[0] || null;
  }, [polls, selectedResearchId]);

  // 2. Recuperar a base de microdados da pesquisa selecionada
  const rawColetas = useMemo(() => {
    if (!selectedResearch) return [];

    const directBase = getResearchBase(selectedResearch);
    if (directBase.length > 0) return directBase;

    if (uploadedDatasets && uploadedDatasets.length > 0) {
      const match = uploadedDatasets.find(
        (d) =>
          (selectedResearch.id && d.fileName === selectedResearch.id) ||
          (selectedResearch.registryNumber && d.registryNumber === selectedResearch.registryNumber) ||
          (selectedResearch.institute && d.institute === selectedResearch.institute)
      );
      if (match && Array.isArray(match.rawRows) && match.rawRows.length > 0) {
        return match.rawRows;
      }
      if (uploadedDatasets.length === 1 && uploadedDatasets[0].rawRows?.length) {
        return uploadedDatasets[0].rawRows;
      }
      // Se não encontrou por ID, mas há datasets enviados, concatena/usa o mais recente
      const latestWithRows = uploadedDatasets.slice().reverse().find((d) => d.rawRows && d.rawRows.length > 0);
      if (latestWithRows && latestWithRows.rawRows) {
        return latestWithRows.rawRows;
      }
    }

    return [];
  }, [selectedResearch, uploadedDatasets]);

  // 3. Processamento estrito dos dados territoriais e cálculo das proporções
  const analysisResult = useMemo(() => {
    const hasMicrodata = Array.isArray(rawColetas) && rawColetas.length > 0;

    if (!hasMicrodata) {
      return {
        chartData: [],
        candidateNames: [],
        researchedCities: [],
        territorySummaries: [],
        candidateStats: [],
        territorialDataAvailable: false,
        dataSource: "sem_microdados" as const,
        selectedResearchId: selectedResearch?.id || null,
        selectedOffice,
        sampleSize: 0,
        territoriesList: [...SERGIPE_TERRITORIOS]
      };
    }

    const regionMap: Record<string, { total: number; counts: Record<string, number> }> = {};
    const cityMap: Record<
      string,
      { region: string; total: number; counts: Record<string, number> }
    > = {};
    const candidateSet = new Set<string>();
    const totalCandidateVotes: Record<string, number> = {};
    let totalAllVotes = 0;

    // Inicializar todos os 8 territórios oficiais
    SERGIPE_TERRITORIOS.forEach((t) => {
      regionMap[t] = { total: 0, counts: {} };
    });

    rawColetas.forEach((row: any) => {
      const city = extractCity(row);
      if (!city) return;

      const normCity = normalize(city);
      const region = CITY_TO_REGION[normCity] || "Região Não Mapeada";
      const candidate = extractCandidateVote(row, selectedOffice);

      candidateSet.add(candidate);
      totalCandidateVotes[candidate] = (totalCandidateVotes[candidate] || 0) + 1;
      totalAllVotes += 1;

      // Agregação por Região/Território
      if (!regionMap[region]) {
        regionMap[region] = { total: 0, counts: {} };
      }
      regionMap[region].total += 1;
      regionMap[region].counts[candidate] = (regionMap[region].counts[candidate] || 0) + 1;

      // Agregação por Município
      if (!cityMap[city]) {
        cityMap[city] = { region, total: 0, counts: {} };
      }
      cityMap[city].total += 1;
      cityMap[city].counts[candidate] = (cityMap[city].counts[candidate] || 0) + 1;
    });

    const cNames = Array.from(candidateSet);
    const activeTerritories = Object.keys(regionMap).filter(
      (r) => regionMap[r].total > 0 || SERGIPE_TERRITORIOS.includes(r as any)
    );

    // Estatísticas Consolidadas por Candidato (Média Estadual + Distribuição Regional)
    const candidateStats = cNames.map((name) => {
      const totalVotes = totalCandidateVotes[name] || 0;
      const statePct = totalAllVotes > 0 ? parseFloat(((totalVotes / totalAllVotes) * 100).toFixed(1)) : 0;
      const isSpecial = isSpecialCategory(name);
      const isLongTail = !isSpecial && statePct < 3.0;

      const regionalPct: Record<string, number> = {};
      const regionalVotes: Record<string, number> = {};

      activeTerritories.forEach((t) => {
        const regTotal = regionMap[t]?.total || 0;
        const regCount = regionMap[t]?.counts[name] || 0;
        regionalVotes[t] = regCount;
        regionalPct[t] = regTotal > 0 ? parseFloat(((regCount / regTotal) * 100).toFixed(1)) : 0;
      });

      // Melhor reduto eleitoral
      let bestRegion = "";
      let bestRegionPct = -1;
      Object.entries(regionalPct).forEach(([reg, pct]) => {
        if (pct > bestRegionPct) {
          bestRegionPct = pct;
          bestRegion = reg;
        }
      });

      return {
        name,
        totalVotes,
        statePct,
        isSpecial,
        isLongTail,
        regionalPct,
        regionalVotes,
        bestRegion,
        bestRegionPct
      };
    });

    // Ordenação decrescente: Líderes (maior para menor) -> Outros (<3%) -> Brancos/Nulos -> Indecisos
    const sortedCandidates = [...candidateStats].sort((a, b) => {
      if (a.isSpecial !== b.isSpecial) {
        return a.isSpecial ? 1 : -1;
      }
      return b.statePct - a.statePct;
    });

    // Detalhamento dos Municípios Pesquisados
    const cCities = Object.entries(cityMap)
      .map(([cityName, info]) => {
        const results = Object.entries(info.counts)
          .map(([candidate, votes]) => ({
            candidate,
            votes,
            percentage: parseFloat(((votes / (info.total || 1)) * 100).toFixed(1))
          }))
          .sort((a, b) => b.votes - a.votes);

        return {
          cityName,
          region: info.region,
          total: info.total,
          results
        };
      })
      .sort((a, b) => b.total - a.total);

    // Resumo consolidado por Território com identificação do Líder
    const territorySummaries = activeTerritories.map((regionName) => {
      const info = regionMap[regionName] || { total: 0, counts: {} };
      const results = Object.entries(info.counts)
        .map(([candidate, votes]) => ({
          candidate,
          votes,
          percentage: info.total > 0 ? parseFloat(((votes / info.total) * 100).toFixed(1)) : 0
        }))
        .sort((a, b) => b.votes - a.votes);

      const citiesInRegion = cCities.filter((c) => c.region === regionName);

      return {
        regionName,
        total: info.total,
        results,
        leader: results[0] || null,
        citiesCount: citiesInRegion.length
      };
    }).sort((a, b) => b.total - a.total);

    // Identificar líderes por território para destacar na matriz
    const leaderPerTerritory: Record<string, { candidate: string; percentage: number }> = {};
    territorySummaries.forEach((ts) => {
      if (ts.results.length > 0 && ts.results[0].votes > 0) {
        leaderPerTerritory[ts.regionName] = {
          candidate: ts.results[0].candidate,
          percentage: ts.results[0].percentage
        };
      }
    });

    return {
      candidateStats: sortedCandidates,
      researchedCities: cCities,
      territorySummaries,
      leaderPerTerritory,
      territorialDataAvailable: true,
      dataSource: "diagnostico_pesquisa" as const,
      selectedResearchId: selectedResearch?.id || null,
      selectedOffice,
      sampleSize: rawColetas.length,
      territoriesList: activeTerritories
    };
  }, [rawColetas, selectedResearch, selectedOffice]);

  // Inicializar comparador com os 2 líderes caso ainda não esteja selecionado
  useEffect(() => {
    if (analysisResult.candidateStats.length > 0 && selectedCandidatesForCompare.length === 0) {
      const topNonSpecial = analysisResult.candidateStats.filter((c) => !c.isSpecial);
      if (topNonSpecial.length >= 2) {
        setSelectedCandidatesForCompare([topNonSpecial[0].name, topNonSpecial[1].name]);
      } else if (topNonSpecial.length === 1) {
        setSelectedCandidatesForCompare([topNonSpecial[0].name]);
      }
    }
  }, [analysisResult.candidateStats, selectedCandidatesForCompare.length]);

  // Dados consolidados com a REGRA DE CAUDA LONGA (< 3% consolidado em 'Outros')
  const processedDisplayData = useMemo(() => {
    if (!analysisResult.territorialDataAvailable) return { displayCandidates: [], chartData: [] };

    const { candidateStats, territoriesList, territorySummaries } = analysisResult;

    if (!groupLongTail) {
      // Sem agrupamento: exibe todas as categorias existentes
      const chartData = territoriesList.map((territory) => {
        const row: Record<string, any> = { region: territory };
        candidateStats.forEach((cand) => {
          row[cand.name] = cand.regionalPct[territory] || 0;
        });
        return row;
      });

      return {
        displayCandidates: candidateStats,
        chartData
      };
    }

    // COM AGRUPAMENTO DE CAUDA LONGA:
    // Separa líderes (>= 3%), categorias especiais ("Branco/Nulo", "Indecisos"), e consolida os < 3% em "Outros (< 3%)"
    const majorCandidates = candidateStats.filter((c) => !c.isLongTail && !c.isSpecial);
    const specialCandidates = candidateStats.filter((c) => c.isSpecial);
    const longTailCandidates = candidateStats.filter((c) => c.isLongTail);

    const consolidatedCandidates = [...majorCandidates];

    // Se houver cauda longa, cria uma entrada agregada "Outros (< 3%)"
    if (longTailCandidates.length > 0) {
      const totalLongTailVotes = longTailCandidates.reduce((acc, c) => acc + c.totalVotes, 0);
      const longTailStatePct = parseFloat(
        longTailCandidates.reduce((acc, c) => acc + c.statePct, 0).toFixed(1)
      );

      const regionalPct: Record<string, number> = {};
      const regionalVotes: Record<string, number> = {};

      territoriesList.forEach((t) => {
        const sumVotes = longTailCandidates.reduce((acc, c) => acc + (c.regionalVotes[t] || 0), 0);
        const sumPct = parseFloat(
          longTailCandidates.reduce((acc, c) => acc + (c.regionalPct[t] || 0), 0).toFixed(1)
        );
        regionalVotes[t] = sumVotes;
        regionalPct[t] = sumPct;
      });

      consolidatedCandidates.push({
        name: `Outros (< 3% • ${longTailCandidates.length} cand.)`,
        totalVotes: totalLongTailVotes,
        statePct: longTailStatePct,
        isSpecial: true,
        isLongTail: false,
        regionalPct,
        regionalVotes,
        bestRegion: "Diversos",
        bestRegionPct: Math.max(...Object.values(regionalPct), 0)
      });
    }

    // Adiciona as categorias especiais ao final
    specialCandidates.forEach((c) => consolidatedCandidates.push(c));

    // Monta o dataset para os gráficos de barras
    const chartData = territoriesList.map((territory) => {
      const row: Record<string, any> = { region: territory };
      consolidatedCandidates.forEach((cand) => {
        row[cand.name] = cand.regionalPct[territory] || 0;
      });
      return row;
    });

    return {
      displayCandidates: consolidatedCandidates,
      chartData
    };
  }, [analysisResult, groupLongTail]);

  // Lista ordenada para a Tabela Dinâmica
  const sortedTableCandidates = useMemo(() => {
    const list = [...processedDisplayData.displayCandidates];
    return list.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      if (tableSortColumn === "stateAvg") {
        valA = a.statePct;
        valB = b.statePct;
      } else if (tableSortColumn === "name") {
        return tableSortDir === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        valA = a.regionalPct[tableSortColumn] || 0;
        valB = b.regionalPct[tableSortColumn] || 0;
      }

      return tableSortDir === "asc" ? valA - valB : valB - valA;
    });
  }, [processedDisplayData.displayCandidates, tableSortColumn, tableSortDir]);

  const handleTableSort = (columnKey: string) => {
    if (tableSortColumn === columnKey) {
      setTableSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setTableSortColumn(columnKey);
      setTableSortDir("desc");
    }
  };

  // Filtro de municípios por busca e território
  const filteredCities = useMemo(() => {
    return analysisResult.researchedCities.filter((c) => {
      const matchSearch =
        normalize(c.cityName).includes(normalize(searchTerm)) ||
        normalize(c.region).includes(normalize(searchTerm));
      const matchTerritory =
        selectedTerritoryFilter === "ALL" || c.region === selectedTerritoryFilter;
      return matchSearch && matchTerritory;
    });
  }, [analysisResult.researchedCities, searchTerm, selectedTerritoryFilter]);

  // Exportação CSV Estruturada
  const handleExportCSV = () => {
    if (!analysisResult.researchedCities.length) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Candidato,Media_Estadual_Pct," + SERGIPE_TERRITORIOS.join(",") + "\n";

    processedDisplayData.displayCandidates.forEach((cand) => {
      const rowVals = [
        `"${cand.name}"`,
        `${cand.statePct}%`,
        ...SERGIPE_TERRITORIOS.map((t) => `${cand.regionalPct[t] || 0}%`)
      ];
      csvContent += rowVals.join(",") + "\n";
    });

    csvContent += "\n--- DETALHAMENTO MUNICIPAL ---\n";
    csvContent += "Municipio,Territorio,Entrevistas,Lider_Local,Pct_Lider,Segundo_Colocado,Pct_Segundo\n";

    analysisResult.researchedCities.forEach((c) => {
      const l1 = c.results[0] || { candidate: "—", percentage: 0 };
      const l2 = c.results[1] || { candidate: "—", percentage: 0 };
      csvContent += `"${c.cityName}","${c.region}",${c.total},"${l1.candidate}",${l1.percentage}%,"${l2.candidate}",${l2.percentage}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `analise_territorial_${selectedOffice.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função auxiliar de intensidade térmica para o Heatmap
  const getHeatmapColor = (pct: number, isLeader: boolean, isSpecial: boolean) => {
    if (pct === 0) return "bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600";
    if (isSpecial) {
      if (pct > 20) return "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold";
      if (pct > 10) return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
      return "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400";
    }
    if (isLeader) {
      return "bg-blue-600 dark:bg-blue-600 text-white font-bold shadow-sm ring-1 ring-blue-400/40";
    }
    if (pct >= 35) return "bg-blue-500 text-white font-semibold";
    if (pct >= 25) return "bg-blue-400/85 text-white font-semibold";
    if (pct >= 15) return "bg-blue-200 dark:bg-blue-900/80 text-blue-950 dark:text-blue-100 font-medium";
    if (pct >= 5) return "bg-blue-100/70 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200";
    return "bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-opacity-90";
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* BARRA SUPERIOR DE CONTROLE: PESQUISA & CARGO */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Análise Territorial e Distribuição por Regiões
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Integração estrita com a base de dados oficial da aba <strong>Diagnóstico (Pesquisa)</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Seletor de Pesquisa Ativa */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <label className="text-[9px] font-mono uppercase text-slate-400 block">Pesquisa Ativa</label>
                <select
                  value={selectedResearch?.id || ""}
                  onChange={(e) => {
                    if (setSelectedResearchId) {
                      setSelectedResearchId(e.target.value);
                    }
                  }}
                  className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                >
                  {polls.map((p) => {
                    const hasMicro =
                      getResearchBase(p).length > 0 ||
                      uploadedDatasets.some(
                        (d) => d.fileName === p.id || d.registryNumber === p.registryNumber
                      );
                    return (
                      <option
                        key={p.id}
                        value={p.id}
                        className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                      >
                        {p.institute} • {getPollDateBR(p)} — {p.registryNumber || p.id} ({p.sampleSize || 0} n){" "}
                        {hasMicro ? "✓ Microdados" : ""}
                      </option>
                    );
                  })}
                  {polls.length === 0 && <option value="">Nenhuma pesquisa cadastrada</option>}
                </select>
              </div>
            </div>

            {/* Seletor de Cargo */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Filter className="w-4 h-4 text-slate-500" />
              <div className="text-left">
                <label className="text-[9px] font-mono uppercase text-slate-400 block">Cargo Eleitoral</label>
                <select
                  value={selectedOffice}
                  onChange={(e) => handleOfficeChange(e.target.value as OfficeType)}
                  className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="Governador" className="bg-white dark:bg-slate-900">Governador</option>
                  <option value="1º Senador" className="bg-white dark:bg-slate-900">1º Senador</option>
                  <option value="2º Senador" className="bg-white dark:bg-slate-900">2º Senador</option>
                  <option value="Deputado Federal" className="bg-white dark:bg-slate-900">Deputado Federal</option>
                  <option value="Deputado Estadual" className="bg-white dark:bg-slate-900">Deputado Estadual</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS DA INTEGRAÇÃO */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {analysisResult.territorialDataAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Fonte Oficial Ativa: {selectedResearch?.institute} (
                {selectedResearch?.registryNumber || selectedResearch?.id})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Microdados Indisponíveis na Pesquisa Selecionada
              </span>
            )}
            <span className="text-slate-500 font-mono text-[11px]">
              {analysisResult.sampleSize} questionários • {analysisResult.researchedCities.length} municípios mapeados
            </span>
          </div>

          {analysisResult.territorialDataAvailable && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Cruzamentos (CSV)
            </button>
          )}
        </div>
      </div>

      {/* CASO: SEM MICRODADOS DISPONÍVEIS */}
      {!analysisResult.territorialDataAvailable && (
        <div className="p-8 max-w-2xl mx-auto my-10 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
              A base de microdados da pesquisa selecionada não está disponível para a Análise Territorial.
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 max-w-lg mx-auto leading-relaxed">
              Para gerar os cruzamentos territoriais, matrizes térmicas e tabelas dinâmicas por região,
              importe uma planilha com as respostas linha a linha das entrevistas na aba <strong>Diagnóstico (Pesquisa)</strong>.
            </p>
          </div>
          <div className="pt-2 text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 inline-block">
            Pesquisa Selecionada: <strong>{selectedResearch?.institute || "Nenhuma"}</strong> (
            {selectedResearch?.registryNumber || "Sem número"})
          </div>
        </div>
      )}

      {/* CASO: MICRODADOS DISPONÍVEIS - SEÇÃO REFORMULADA DE DISTRIBUIÇÃO PROPORCIONAL */}
      {analysisResult.territorialDataAvailable && (
        <>
          {/* PAINEL PRINCIPAL REFORMULADO (DATAVIZ / UX APERFEIÇOADO) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            {/* CABEÇALHO DO PAINEL COM SELETOR DE MODOS E FILTROS */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                    Distribuição Proporcional por Região
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                    8 Territórios Oficiais
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                  Visualização desdobrada para <strong>{selectedOffice}</strong> nos 8 Territórios de Planejamento de Sergipe
                </p>
              </div>

              {/* CONTROLES DE VISUALIZAÇÃO (DATAVIZ MODES & CAUDA LONGA TOGGLE) */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Agrupamento de Cauda Longa (< 3% em "Outros") */}
                <button
                  onClick={() => setGroupLongTail(!groupLongTail)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    groupLongTail
                      ? "bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                  title="Consolida candidatos com intenção média < 3% em 'Outros', reduzindo sobrecarga cognitiva"
                >
                  <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Cauda Longa (&lt; 3%): <strong>{groupLongTail ? "Consolidada" : "Expandida"}</strong></span>
                </button>

                {/* Seletor de Modo (Heatmap / Tabela Sparkbars / Comparador / Barras) */}
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode("heatmap")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === "heatmap"
                        ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Heatmap
                  </button>

                  <button
                    onClick={() => setViewMode("sparkbars")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === "sparkbars"
                        ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    Tabela & Sparkbars
                  </button>

                  <button
                    onClick={() => setViewMode("comparator")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === "comparator"
                        ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Comparador
                  </button>

                  <button
                    onClick={() => setViewMode("stacked_bars")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === "stacked_bars"
                        ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Barras
                  </button>
                </div>
              </div>
            </div>

            {/* MODO 1: HEATMAP (MATRIZ DE CALOR REGIONAL) - FORMATO RECOMENDADO */}
            {viewMode === "heatmap" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      A <strong>Matriz Térmica</strong> cruza todos os {processedDisplayData.displayCandidates.length} candidatos com os 8 territórios sergipanos. O ícone <Crown className="w-3 h-3 text-amber-500 inline mx-0.5" /> destaca a liderança local.
                    </span>
                  </div>
                  {/* Legenda de Intensidade Térmica */}
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                    <span>Intensidade:</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px]">&lt;5%</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-200 text-blue-900 text-[10px]">15%</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-400 text-white text-[10px]">25%</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">Líder</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <th className="p-3.5 font-bold font-serif sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 min-w-[200px]">
                          Candidato / Categoria ({selectedOffice})
                        </th>
                        <th className="p-3.5 text-center font-bold font-mono bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-r border-blue-100 dark:border-blue-900 min-w-[90px]">
                          Média Estado
                        </th>
                        {SERGIPE_TERRITORIOS.map((t) => (
                          <th
                            key={t}
                            className="p-3 text-center font-semibold font-mono min-w-[110px] border-r border-slate-200/60 dark:border-slate-700/60 last:border-r-0"
                          >
                            <div className="truncate">{t}</div>
                            <span className="text-[10px] font-normal text-slate-400 block mt-0.5">
                              {analysisResult.territorySummaries.find((s) => s.regionName === t)?.total || 0} n
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {processedDisplayData.displayCandidates.map((cand) => {
                        const color = getOfficialCandidateColor(cand.name);
                        return (
                          <tr
                            key={cand.name}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            {/* Nome do Candidato */}
                            <td className="p-3.5 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                  style={{ backgroundColor: color }}
                                />
                                <span className={`truncate font-medium ${cand.isSpecial ? "text-slate-500 italic" : "text-slate-900 dark:text-white font-semibold"}`}>
                                  {cand.name}
                                </span>
                              </div>
                            </td>

                            {/* Média Estadual */}
                            <td className="p-3.5 text-center font-mono font-bold text-slate-900 dark:text-white bg-blue-50/30 dark:bg-blue-950/30 border-r border-blue-100/60 dark:border-blue-900/60">
                              {cand.statePct.toFixed(1)}%
                            </td>

                            {/* Células Térmicas dos 8 Territórios */}
                            {SERGIPE_TERRITORIOS.map((t) => {
                              const pct = cand.regionalPct[t] || 0;
                              const votes = cand.regionalVotes[t] || 0;
                              const isLeader = analysisResult.leaderPerTerritory[t]?.candidate === cand.name && pct > 0;
                              const cellColorClass = getHeatmapColor(pct, isLeader, cand.isSpecial);

                              return (
                                <td
                                  key={t}
                                  className="p-2.5 text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0"
                                >
                                  <div
                                    className={`py-1.5 px-2 rounded-xl transition-all flex flex-col items-center justify-center ${cellColorClass}`}
                                    title={`${cand.name} em ${t}: ${pct.toFixed(1)}% (${votes} entrevistas)`}
                                  >
                                    <div className="flex items-center gap-1 font-mono text-xs">
                                      {isLeader && <Crown className="w-3 h-3 text-amber-300 drop-shadow-xs" />}
                                      <span>{pct.toFixed(1)}%</span>
                                    </div>
                                    <span className="text-[9px] opacity-75 font-mono">
                                      {votes} {votes === 1 ? "voto" : "votos"}
                                    </span>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODO 2: TABELA DINÂMICA COM SPARKBARS */}
            {viewMode === "sparkbars" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      Clique nos cabeçalhos para reordenar a tabela por território. Micrográficos de barra horizontal (sparkbars) facilitam comparações executivas.
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <th
                          onClick={() => handleTableSort("name")}
                          className="p-3.5 font-bold font-serif cursor-pointer hover:bg-slate-200/70 transition-colors min-w-[200px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Candidato</span>
                            {tableSortColumn === "name" && <span className="font-mono text-blue-600">{tableSortDir === "asc" ? "▲" : "▼"}</span>}
                          </div>
                        </th>
                        <th
                          onClick={() => handleTableSort("stateAvg")}
                          className="p-3.5 text-center font-bold font-mono bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-r border-blue-100 dark:border-blue-900 cursor-pointer hover:bg-blue-100/80 transition-colors min-w-[100px]"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Média Estado</span>
                            {tableSortColumn === "stateAvg" && <span className="text-blue-600">{tableSortDir === "asc" ? "▲" : "▼"}</span>}
                          </div>
                        </th>
                        {SERGIPE_TERRITORIOS.map((t) => (
                          <th
                            key={t}
                            onClick={() => handleTableSort(t)}
                            className="p-3 text-center font-semibold font-mono min-w-[130px] border-r border-slate-200/60 dark:border-slate-700/60 last:border-r-0 cursor-pointer hover:bg-slate-200/70 transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1 truncate">
                              <span>{t}</span>
                              {tableSortColumn === t && <span className="text-blue-600">{tableSortDir === "asc" ? "▲" : "▼"}</span>}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sortedTableCandidates.map((cand) => {
                        const color = getOfficialCandidateColor(cand.name);
                        return (
                          <tr
                            key={cand.name}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            {/* Nome */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                  style={{ backgroundColor: color }}
                                />
                                <span className={`truncate font-medium ${cand.isSpecial ? "text-slate-500 italic" : "text-slate-900 dark:text-white font-semibold"}`}>
                                  {cand.name}
                                </span>
                              </div>
                            </td>

                            {/* Média Estadual */}
                            <td className="p-3.5 text-center font-mono font-bold text-slate-900 dark:text-white bg-blue-50/30 dark:bg-blue-950/30 border-r border-blue-100/60 dark:border-blue-900/60">
                              {cand.statePct.toFixed(1)}%
                            </td>

                            {/* Células com Sparkbars */}
                            {SERGIPE_TERRITORIOS.map((t) => {
                              const pct = cand.regionalPct[t] || 0;
                              const votes = cand.regionalVotes[t] || 0;
                              const isLeader = analysisResult.leaderPerTerritory[t]?.candidate === cand.name && pct > 0;

                              return (
                                <td
                                  key={t}
                                  className="p-2.5 border-r border-slate-100 dark:border-slate-800 last:border-r-0"
                                >
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[11px] font-mono">
                                      <span className={`flex items-center gap-1 ${isLeader ? "font-bold text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                                        {isLeader && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                                        {pct.toFixed(1)}%
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-normal">
                                        ({votes})
                                      </span>
                                    </div>
                                    {/* Mini barra de progresso (Sparkbar) */}
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${isLeader ? "bg-blue-600" : "bg-blue-400/80"}`}
                                        style={{ width: `${Math.min(pct * 2, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODO 3: COMPARADOR GEOGRÁFICO INTERATIVO (1 ou 2 CANDIDATOS) */}
            {viewMode === "comparator" && (
              <div className="space-y-6">
                {/* Seletor Rápido de Candidatos para Comparação */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                      Selecione até 3 candidatos para confrontação territorial:
                    </span>

                    {/* Presets Rápidos */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const top2 = analysisResult.candidateStats.filter((c) => !c.isSpecial).slice(0, 2).map((c) => c.name);
                          setSelectedCandidatesForCompare(top2);
                        }}
                        className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer"
                      >
                        Top 2 Líderes
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <button
                        onClick={() => {
                          const top3 = analysisResult.candidateStats.filter((c) => !c.isSpecial).slice(0, 3).map((c) => c.name);
                          setSelectedCandidatesForCompare(top3);
                        }}
                        className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer"
                      >
                        Top 3
                      </button>
                    </div>
                  </div>

                  {/* Chips Selecionáveis */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {analysisResult.candidateStats
                      .filter((c) => !c.isSpecial)
                      .map((c) => {
                        const isSelected = selectedCandidatesForCompare.includes(c.name);
                        const color = getOfficialCandidateColor(c.name);
                        return (
                          <button
                            key={c.name}
                            onClick={() => {
                              if (isSelected) {
                                if (selectedCandidatesForCompare.length > 1) {
                                  setSelectedCandidatesForCompare((prev) =>
                                    prev.filter((n) => n !== c.name)
                                  );
                                }
                              } else {
                                if (selectedCandidatesForCompare.length < 3) {
                                  setSelectedCandidatesForCompare((prev) => [...prev, c.name]);
                                } else {
                                  setSelectedCandidatesForCompare([selectedCandidatesForCompare[1], selectedCandidatesForCompare[2], c.name]);
                                }
                              }
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: isSelected ? "#fff" : color }}
                            />
                            <span>{c.name}</span>
                            <span className="font-mono text-[10px] opacity-85">({c.statePct}%)</span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Grid Comparativo dos 8 Territórios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {SERGIPE_TERRITORIOS.map((t) => {
                    const territoryData = analysisResult.territorySummaries.find((s) => s.regionName === t);
                    const totalInterviews = territoryData?.total || 0;

                    // Encontrar dados dos candidatos selecionados para este território
                    const comparedCandData = selectedCandidatesForCompare.map((candName) => {
                      const stat = analysisResult.candidateStats.find((c) => c.name === candName);
                      const pct = stat?.regionalPct[t] || 0;
                      const votes = stat?.regionalVotes[t] || 0;
                      return { name: candName, pct, votes, color: getOfficialCandidateColor(candName) };
                    }).sort((a, b) => b.pct - a.pct);

                    const leaderInTerritory = comparedCandData[0];
                    const runnerUp = comparedCandData[1];
                    const leadDiff = leaderInTerritory && runnerUp ? parseFloat((leaderInTerritory.pct - runnerUp.pct).toFixed(1)) : 0;

                    return (
                      <div
                        key={t}
                        className="bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {t}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-500">
                              {totalInterviews} entrevistas
                            </span>
                          </div>
                          {leadDiff > 0 && leaderInTerritory ? (
                            <span className="text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                              +{leadDiff}% {leaderInTerritory.name.split(" ")[0]}
                            </span>
                          ) : null}
                        </div>

                        {/* Barras Comparativas */}
                        <div className="space-y-2.5">
                          {comparedCandData.map((cand, idx) => (
                            <div key={cand.name} className="space-y-1">
                              <div className="flex justify-between text-xs items-center">
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cand.color }} />
                                  {cand.name}
                                </span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  {cand.pct.toFixed(1)}%{" "}
                                  <span className="text-[10px] font-normal text-slate-400">({cand.votes})</span>
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(cand.pct * 2, 100)}%`,
                                    backgroundColor: cand.color
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODO 4: GRÁFICO DE BARRAS REESTRUTURADO (HORIZONTAL / VERTICAL COM ROTAÇÃO FIXA A -45°) */}
            {viewMode === "stacked_bars" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      {barOrientation === "horizontal"
                        ? "Barras horizontais eliminam sobreposição de nomes dos territórios no eixo vertical."
                        : "Eixo X rotacionado a -45° com margens corrigidas para leitura fluida."}
                    </span>
                  </div>

                  {/* Alternador de Orientação das Barras */}
                  <div className="inline-flex bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setBarOrientation("horizontal")}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                        barOrientation === "horizontal"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Barras Horizontais (Ideal)
                    </button>
                    <button
                      onClick={() => setBarOrientation("vertical")}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                        barOrientation === "vertical"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Barras Verticais (-45°)
                    </button>
                  </div>
                </div>

                <div className="h-[460px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {barOrientation === "horizontal" ? (
                      <BarChart
                        data={processedDisplayData.chartData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 100, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} stroke="#64748b" />
                        <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                        <YAxis
                          type="category"
                          dataKey="region"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          width={110}
                        />
                        <Tooltip
                          formatter={(val: any, name: any) => [`${val}%`, `${name}`]}
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                            color: "#fff",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                          }}
                        />
                        {processedDisplayData.displayCandidates.map((cand, idx) => (
                          <Bar
                            key={cand.name}
                            dataKey={cand.name}
                            stackId="territoryStack"
                            fill={getOfficialCandidateColor(cand.name) || PALETTE[idx % PALETTE.length]}
                          />
                        ))}
                      </BarChart>
                    ) : (
                      <BarChart
                        data={processedDisplayData.chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 85 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} stroke="#64748b" />
                        <XAxis
                          dataKey="region"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          dy={10}
                        />
                        <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                        <Tooltip
                          formatter={(val: any, name: any) => [`${val}%`, `${name}`]}
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                            color: "#fff",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                          }}
                        />
                        {processedDisplayData.displayCandidates.map((cand, idx) => (
                          <Bar
                            key={cand.name}
                            dataKey={cand.name}
                            stackId="territoryStack"
                            fill={getOfficialCandidateColor(cand.name) || PALETTE[idx % PALETTE.length]}
                          />
                        ))}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Legenda Customizada Livre de Sobreposições */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    {processedDisplayData.displayCandidates.map((cand, idx) => {
                      const color = getOfficialCandidateColor(cand.name) || PALETTE[idx % PALETTE.length];
                      return (
                        <div
                          key={cand.name}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] border border-slate-200/80 dark:border-slate-700"
                        >
                          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{cand.name}</span>
                          <span className="font-mono text-slate-400 text-[10px]">({cand.statePct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CONSOLIDAÇÃO DOS 8 TERRITÓRIOS OFICIAIS (CARDS DE RESUMO) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Resumo Territorial ({analysisResult.territorySummaries.length} Regiões Mapeadas)
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Base Real: {analysisResult.sampleSize} entrevistas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysisResult.territorySummaries.map((t) => (
                <div
                  key={t.regionName}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t.regionName}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        {t.citiesCount} municípios amostrados
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                      {t.total} n
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {t.results.slice(0, 4).map((cand, idx) => (
                      <div key={cand.candidate} className="flex justify-between items-center text-xs">
                        <span
                          className={`truncate max-w-[140px] ${
                            idx === 0
                              ? "font-bold text-blue-950 dark:text-blue-300"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {cand.candidate}
                        </span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {cand.percentage}%{" "}
                          <span className="text-[10px] text-slate-400">({cand.votes})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SITUAÇÃO NOS MUNICÍPIOS PESQUISADOS (GRID COM BUSCA E FILTROS) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Situação nos Municípios Pesquisados ({filteredCities.length} de {analysisResult.researchedCities.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Votos nominais e percentuais computados diretamente das entrevistas
                </p>
              </div>

              {/* Filtro e Busca */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar município..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <select
                  value={selectedTerritoryFilter}
                  onChange={(e) => setSelectedTerritoryFilter(e.target.value)}
                  className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Todos os Territórios</option>
                  {SERGIPE_TERRITORIOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredCities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCities.map((c) => (
                  <div
                    key={c.cityName}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5"
                  >
                    <div className="flex justify-between items-baseline border-b border-slate-200 dark:border-slate-700 pb-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {c.cityName}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500">
                          {c.region}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                        {c.total} {c.total === 1 ? "entrevista" : "entrevistas"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {c.results.map((cand, idx) => (
                        <div key={cand.candidate} className="flex justify-between text-xs items-center">
                          <span
                            className={`truncate max-w-[150px] ${
                              idx === 0
                                ? "font-bold text-slate-900 dark:text-white"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {cand.candidate}
                          </span>
                          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                            {cand.percentage}%{" "}
                            <span className="text-[10px] text-slate-400">({cand.votes})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">
                Nenhum município corresponde aos filtros de busca aplicados.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

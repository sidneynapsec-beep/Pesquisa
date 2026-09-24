import React, { useState, useMemo } from "react";
import { OfficialCandidate2026 } from "../data/candidatosOficiais2026";
import { Poll } from "../types";
import { useElectoralData } from "../context/ElectoralDataContext";
import {
  getProjectionsByRole,
  CandidateProjection,
  PartySeatProjection,
  ProportionalCalculationResult,
  TOTAL_VOTOS_VALIDOS_ESTIMADOS,
  TOTAL_ELEITORADO_SERGIPE
} from "../data/electoralProjections";
import {
  Search,
  CheckCircle2,
  Award,
  Landmark,
  Building,
  Layers,
  Calendar,
  BarChart3,
  TrendingUp,
  Filter,
  Users,
  Vote,
  Sparkles,
  Info,
  Check,
  Calculator,
  PieChart,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
  Zap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface CargosProjectionsViewProps {
  role: OfficialCandidate2026["role"];
  polls?: Poll[];
}

export default function CargosProjectionsView({ role, polls: propPolls = [] }: CargosProjectionsViewProps) {
  const globalContext = useElectoralData();
  const activePolls = globalContext?.polls?.length ? globalContext.polls : propPolls;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"todos" | "eleitos" | "suplentes">("todos");
  const [metricDisplay, setMetricDisplay] = useState<"validos" | "totais" | "dual">("dual");
  const [selectedCoalition, setSelectedCoalition] = useState("all");
  const [expandedParty, setExpandedParty] = useState<string | null>(null);

  const [sortField, setSortField] = useState<"rank" | "validos" | "totais" | "baseRecente" | "segundaBase" | "primeiraBase" | "votos">("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (field: "rank" | "validos" | "totais" | "baseRecente" | "segundaBase" | "primeiraBase" | "votos") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder(field === "rank" ? "asc" : "desc");
    }
  };

  const renderSortIndicator = (field: "rank" | "validos" | "totais" | "baseRecente" | "segundaBase" | "primeiraBase" | "votos") => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 inline ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-amber-500 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-amber-500 inline ml-1" />
    );
  };

  const { candidates: projections, proportionalResult, pollHeaderInfo, roleStats } = useMemo(() => {
    return getProjectionsByRole(role, activePolls);
  }, [role, activePolls]);

  // Extract unique coalitions for filter dropdown
  const uniqueCoalitions = useMemo(() => {
    const set = new Set<string>();
    projections.forEach((c) => set.add(c.coalition));
    return Array.from(set).sort();
  }, [projections]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    const list = projections.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.number.includes(searchTerm) ||
        item.coalition.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCoalition = selectedCoalition === "all" || item.coalition === selectedCoalition;

      let matchFilter = true;
      if (filterMode === "eleitos") {
        matchFilter = item.status === "ELEITO" || item.status === "SEGUNDO_TURNO";
      } else if (filterMode === "suplentes") {
        matchFilter = item.status === "SUPLENTE";
      }

      return matchSearch && matchCoalition && matchFilter;
    });

    return [...list].sort((a, b) => {
      let valA = 0;
      let valB = 0;
      switch (sortField) {
        case "rank":
          return sortOrder === "asc" ? a.rank - b.rank : b.rank - a.rank;
        case "validos":
          valA = a.pollAverage;
          valB = b.pollAverage;
          break;
        case "totais":
          valA = a.pollAverageTotal;
          valB = b.pollAverageTotal;
          break;
        case "baseRecente":
          valA = metricDisplay === "validos" ? a.pollDate3 : a.pollDate3Total;
          valB = metricDisplay === "validos" ? b.pollDate3 : b.pollDate3Total;
          break;
        case "segundaBase":
          valA = metricDisplay === "validos" ? a.pollDate2 : a.pollDate2Total;
          valB = metricDisplay === "validos" ? b.pollDate2 : b.pollDate2Total;
          break;
        case "primeiraBase":
          valA = metricDisplay === "validos" ? a.pollDate1 : a.pollDate1Total;
          valB = metricDisplay === "validos" ? b.pollDate1 : b.pollDate1Total;
          break;
        case "votos":
          valA = a.projectedVotes;
          valB = b.projectedVotes;
          break;
        default:
          return a.rank - b.rank;
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [projections, searchTerm, selectedCoalition, filterMode, sortField, sortOrder, metricDisplay]);

  // Counts and quota information per role
  const roleConfig = useMemo(() => {
    switch (role) {
      case "Governador":
        return {
          title: "Governador do Estado",
          icon: Layers,
          color: "blue",
          seatsTotal: 1,
          seatLabel: "1 Vaga (Palácio de Despachos)",
          rule: "Votação Majoritária (50% + 1 dos válidos para vencer no 1º Turno)",
          electedCount: projections.filter((p) => p.status === "ELEITO" || p.status === "SEGUNDO_TURNO").length,
          electedList: projections.slice(0, 2)
        };
      case "Senador":
        return {
          title: "Senado Federal",
          icon: Award,
          color: "emerald",
          seatsTotal: 2,
          seatLabel: "2 Vagas em Disputa (Duplo Voto - Sergipe 2026)",
          rule: "Eleição Majoritária Simples com 2 Vagas (Os 2 candidatos nominais mais votados são eleitos)",
          electedCount: projections.filter((p) => p.status === "ELEITO").length,
          electedList: projections.filter((p) => p.status === "ELEITO").length > 0 ? projections.filter((p) => p.status === "ELEITO") : projections.slice(0, 2)
        };
      case "Deputado Federal":
        return {
          title: "Câmara dos Deputados (Bancada Federal)",
          icon: Landmark,
          color: "amber",
          seatsTotal: 8,
          seatLabel: "8 Vagas (Câmara dos Deputados)",
          rule: "Sistema Proporcional Oficial (Votos Válidos / 8 Cadeiras -> QP + Sobras D'Hondt)",
          electedCount: projections.filter((p) => p.status === "ELEITO").length,
          electedList: projections.filter((p) => p.status === "ELEITO")
        };
      case "Deputado Estadual":
        return {
          title: "Assembleia Legislativa (ALESE)",
          icon: Building,
          color: "purple",
          seatsTotal: 24,
          seatLabel: "24 Vagas (Assembleia Legislativa de Sergipe)",
          rule: "Sistema Proporcional Oficial (Votos Válidos / 24 Cadeiras -> QP + Sobras D'Hondt)",
          electedCount: projections.filter((p) => p.status === "ELEITO").length,
          electedList: projections.filter((p) => p.status === "ELEITO")
        };
    }
  }, [role, projections]);

  const Icon = roleConfig.icon;
  const isProportional = role === "Deputado Federal" || role === "Deputado Estadual";

  const getStatusBadge = (item: CandidateProjection) => {
    if (item.status === "ELEITO") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-emerald-600 text-white shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {item.statusLabel}
        </span>
      );
    }
    if (item.status === "SEGUNDO_TURNO") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-blue-600 text-white shadow-sm">
          <TrendingUp className="w-3.5 h-3.5" />
          {item.statusLabel}
        </span>
      );
    }
    if (item.status === "SUPLENTE") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {item.statusLabel}
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
        Não Eleito
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-slate-700">
              <Icon className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
                Projeção de Vagas e Médias: {roleConfig.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {roleConfig.seatLabel} • Eleições Oficiais Sergipe 2026
              </p>
            </div>
          </div>
        </div>

        {/* Global Electoral Metrics summary */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right">
            <span className="text-[9px] font-mono uppercase text-slate-400 block leading-none">Vagas em Disputa</span>
            <span className="text-sm font-mono font-bold text-blue-900 dark:text-blue-300">
              {roleConfig.seatsTotal} {roleConfig.seatsTotal === 1 ? "Cadeira" : "Cadeiras"}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right">
            <span className="text-[9px] font-mono uppercase text-slate-400 block leading-none">Votos Válidos Est.</span>
            <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
              {TOTAL_VOTOS_VALIDOS_ESTIMADOS.toLocaleString("pt-BR")}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-right">
            <span className="text-[9px] font-mono uppercase text-emerald-700 dark:text-emerald-400 block leading-none">Eleitos Projetados</span>
            <span className="text-sm font-mono font-bold text-emerald-800 dark:text-emerald-300">
              {roleConfig.electedCount} no Limite
            </span>
          </div>
        </div>
      </div>

      {/* Segregação Amostral: Votos Válidos vs. Votos Totais Card (Oculto para Deputados Federais e Estaduais) */}
      {role !== "Deputado Federal" && role !== "Deputado Estadual" && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                  Segregação Rigorosa da Base
                </span>
                <span className="text-[10px] font-mono text-slate-400">Metodologia TSE / TRE-SE</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                Base Amostral vs. Votos Válidos Nominais ({roleConfig.title})
              </h3>
            </div>

            {/* Metric Selector Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setMetricDisplay("validos")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  metricDisplay === "validos"
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                % Válidos (TSE)
              </button>
              <button
                onClick={() => setMetricDisplay("totais")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  metricDisplay === "totais"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                % Totais (Amostra)
              </button>
              <button
                onClick={() => setMetricDisplay("dual")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  metricDisplay === "dual"
                    ? "bg-slate-900 dark:bg-slate-700 text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Exibir Ambos (Dual)
              </button>
            </div>
          </div>

          {/* 4 Cards Breakdown: N Total, N Válidos, Brancos/Nulos, Ns/Nr */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Total da Amostra */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-bold">
                1. Total da Amostra (N Total)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-mono font-black text-slate-900 dark:text-white">
                  {roleStats?.totalSample.toLocaleString("pt-BR") || "-"}
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">100.0% Amostra</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">Todas as entrevistas válidas do arquivo</p>
            </div>

            {/* Card 2: Votos Válidos */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] font-mono uppercase text-emerald-800 dark:text-emerald-400 block font-bold">
                2. Votos Válidos (N Válidos)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-mono font-black text-emerald-800 dark:text-emerald-300">
                  {roleStats?.validTotal.toLocaleString("pt-BR") || "-"}
                </span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  {roleStats?.validPercent || "0.0"}%
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 leading-tight">
                Base Oficial de Cálculo para Eleitos / QE
              </p>
            </div>

            {/* Card 3: Brancos e Nulos */}
            <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <span className="text-[10px] font-mono uppercase text-rose-800 dark:text-rose-400 block font-bold">
                3. Brancos / Nulos
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-mono font-black text-rose-800 dark:text-rose-300">
                  {roleStats?.invalidTotal.toLocaleString("pt-BR") || "-"}
                </span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                  {roleStats?.invalidPercent || "0.0"}%
                </span>
              </div>
              <p className="text-[10px] text-rose-700 dark:text-rose-400 mt-1 leading-tight">
                Votos não aproveitáveis pelo critério do TSE
              </p>
            </div>

            {/* Card 4: Indecisos / Ns/Nr */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] font-mono uppercase text-amber-800 dark:text-amber-400 block font-bold">
                4. Não Sabe / Não Respondeu
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-mono font-black text-amber-800 dark:text-amber-300">
                  {roleStats?.undecidedTotal.toLocaleString("pt-BR") || "-"}
                </span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  {roleStats?.undecidedPercent || "0.0"}%
                </span>
              </div>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 leading-tight">
                Eleitorado indeciso ou espontâneo em aberto
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3 Poll Dates Reference Strip */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-blue-900 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-blue-900/60 pb-3 mb-3">
          <span className="text-xs font-mono font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" /> Pipeline Sincronizado: Base de Cálculo com Pesquisas do Diagnóstico
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {pollHeaderInfo.totalPollsCount} Pesquisa(s) no Ecossistema
            </span>
            <span className="text-[11px] font-mono text-slate-300">
              Regra: Média Ponderada das Coletas × Projeção de Votos Válidos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-amber-300 font-bold uppercase block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block"></span>
                Base Recente (Mais Próxima)
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[180px] block">{pollHeaderInfo.institute3}</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
              {pollHeaderInfo.date3}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-blue-200 uppercase block">2ª Base</span>
              <span className="text-xs font-bold text-white truncate max-w-[180px] block">{pollHeaderInfo.institute2}</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {pollHeaderInfo.date2}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-blue-200 uppercase block">1ª Base</span>
              <span className="text-xs font-bold text-white truncate max-w-[180px] block">{pollHeaderInfo.institute1}</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {pollHeaderInfo.date1}
            </span>
          </div>
        </div>
      </div>

      {/* PROPORTIONAL REPRESENTATION: QUOCIENTE ELEITORAL & PARTIDÁRIO BREAKDOWN (Federal & Estadual) */}
      {isProportional && proportionalResult && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border-2 border-amber-500/30 dark:border-amber-500/20 shadow-md space-y-5">
          {/* Header Quota Strip */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shrink-0">
                <Calculator className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    Cálculo Oficial TSE / TRE-SE
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Sistema Proporcional D'Hondt</span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Distribuição de Cadeiras por Partido / Federação (Quociente Partidário)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Quociente Eleitoral (QE) = {proportionalResult.totalValidVotes.toLocaleString("pt-BR")} votos válidos ÷ {proportionalResult.totalSeats} vagas = <strong className="text-amber-700 dark:text-amber-400 font-black">{proportionalResult.electoralQuotient.toLocaleString("pt-BR")} votos por vaga</strong>
                </p>
              </div>
            </div>

            {/* Quota Highlights */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-1 sm:flex-initial text-center min-w-[130px]">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">Quociente Eleitoral (QE)</span>
                <span className="text-sm font-mono font-black text-amber-700 dark:text-amber-400">
                  {proportionalResult.electoralQuotient.toLocaleString("pt-BR")} v.
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex-1 sm:flex-initial text-center min-w-[120px]">
                <span className="text-[9px] font-mono uppercase text-blue-700 dark:text-blue-400 block">Cadeiras via QP</span>
                <span className="text-sm font-mono font-black text-blue-900 dark:text-blue-300">
                  {proportionalResult.totalDirectQPSeats} Diretas
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex-1 sm:flex-initial text-center min-w-[120px]">
                <span className="text-[9px] font-mono uppercase text-purple-700 dark:text-purple-400 block">Sobras (Médias)</span>
                <span className="text-sm font-mono font-black text-purple-900 dark:text-purple-300">
                  {proportionalResult.totalRemainderSeats} Distribuídas
                </span>
              </div>
            </div>
          </div>

          {/* Party & Federation Seats Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-3.5">Partido / Federação</th>
                  <th className="py-3 px-3 text-right">Votos Legenda + Nominais</th>
                  <th className="py-3 px-3 text-center">% Válidos</th>
                  <th className="py-3 px-3 text-center">Múltiplo QE</th>
                  <th className="py-3 px-3 text-center bg-blue-50/60 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 border-l border-r border-slate-200 dark:border-slate-700">
                    Cadeiras QP Direto
                  </th>
                  <th className="py-3 px-3 text-center bg-purple-50/60 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300 border-r border-slate-200 dark:border-slate-700">
                    Sobras (Médias)
                  </th>
                  <th className="py-3 px-4 text-center bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold border-r border-slate-200 dark:border-slate-700">
                    Total de Cadeiras
                  </th>
                  <th className="py-3 px-4">Titulares Eleitos pelo Partido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {proportionalResult.parties.map((p) => {
                  const hasSeats = p.totalSeats > 0;
                  const isExpanded = expandedParty === p.partyOrCoalition;

                  return (
                    <tr
                      key={p.partyOrCoalition}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        hasSeats ? "bg-amber-50/10 dark:bg-amber-950/10" : "opacity-75"
                      }`}
                    >
                      {/* Party Name & Filter Action */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCoalition(p.partyOrCoalition);
                              setSearchTerm("");
                            }}
                            title={`Filtrar candidatos de ${p.partyOrCoalition}`}
                            className="text-left group cursor-pointer"
                          >
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 block text-xs">
                              {p.partyOrCoalition}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 group-hover:underline">
                              Nº {p.partyNumber} • Clique para filtrar lista
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Total Party Votes */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {p.totalVotes.toLocaleString("pt-BR")}
                      </td>

                      {/* Vote Share */}
                      <td className="py-3.5 px-3 text-center font-mono text-slate-600 dark:text-slate-300">
                        {p.votePercentage}%
                      </td>

                      {/* Multiple of QE */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.reachedQE
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {p.qeMultiple}x QE
                        </span>
                      </td>

                      {/* Direct Seats by QP */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-900 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/10 border-l border-r border-slate-100 dark:border-slate-800">
                        {p.directSeatsQP > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 font-black">
                            {p.directSeatsQP}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Remainder Seats */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-purple-900 dark:text-purple-300 bg-purple-50/30 dark:bg-purple-950/10 border-r border-slate-100 dark:border-slate-800">
                        {p.remainderSeats > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 font-black">
                            +{p.remainderSeats}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Total Seats Won Badge */}
                      <td className="py-3.5 px-4 text-center border-r border-slate-100 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/20">
                        {p.totalSeats > 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-black bg-emerald-600 text-white shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            {p.totalSeats} {p.totalSeats === 1 ? "Cadeira" : "Cadeiras"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">0 Cadeiras</span>
                        )}
                      </td>

                      {/* Elected Names within the party */}
                      <td className="py-3.5 px-4">
                        {p.electedCandidates.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {p.electedCandidates.map((ec, idx) => (
                              <span
                                key={ec.name}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-[11px] font-medium text-slate-900 dark:text-slate-100 shadow-2xs"
                              >
                                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <strong className="font-bold">{ec.name}</strong>
                                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                                  ({ec.projectedVotes.toLocaleString("pt-BR")} v.)
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400 italic">
                            Não atingiu quociente para eleger titular
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Elected Fast Summary Cards */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Quadro Geral: {roleConfig.seatsTotal} Candidatos Titulares Projetados nas Vagas
          </h2>
          <span className="text-[10px] font-mono text-slate-400">Distribuídos pelo Quociente Partidário + Sobras</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roleConfig.electedList.slice(0, roleConfig.seatsTotal).map((cand, idx) => (
            <div
              key={`${cand.name}-${cand.number}`}
              className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  #{cand.seatNumber || idx + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{cand.name}</h4>
                  <p className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 truncate">
                    Nº {cand.number} • {cand.coalition.split(" ")[0]}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-black text-emerald-900 dark:text-emerald-300 block">
                  {cand.pollAverage}%
                </span>
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                  {cand.projectedVotes.toLocaleString("pt-BR")} v.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Buscar por nome, número ou coligação...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Quick Filter Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilterMode("todos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                filterMode === "todos"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Todos ({projections.length})
            </button>
            <button
              onClick={() => setFilterMode("eleitos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === "eleitos"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Eleitos ({roleConfig.electedCount})
            </button>
            <button
              onClick={() => setFilterMode("suplentes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                filterMode === "suplentes"
                  ? "bg-amber-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Suplentes
            </button>
          </div>

          {/* Coalition Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCoalition}
              onChange={(e) => setSelectedCoalition(e.target.value)}
              className="text-xs p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 max-w-[220px]"
            >
              <option value="all">Todas as Coligações ({uniqueCoalitions.length})</option>
              {uniqueCoalitions.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector Toggle (exibido na barra de filtros para Deputados Federais e Estaduais) */}
          {isProportional && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setMetricDisplay("validos")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  metricDisplay === "validos"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
                title="Exibir % de Votos Válidos (TSE)"
              >
                % Válidos
              </button>
              <button
                onClick={() => setMetricDisplay("totais")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  metricDisplay === "totais"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
                title="Exibir % sobre a Amostra Total (100%)"
              >
                % Totais
              </button>
              <button
                onClick={() => setMetricDisplay("dual")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  metricDisplay === "dual"
                    ? "bg-slate-900 dark:bg-slate-700 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
                title="Exibir ambas as métricas lado a lado"
              >
                Dual
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Full Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Tabela Completa de Votação • {filteredData.length} candidatos nominais
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300 font-bold">
              100% Amostra Total (Estimulada)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-300 font-bold">
              100% Votos Válidos (TSE)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Total Amostral (com BN e Indecisos) + Apuração Oficial TSE
          </span>
        </div>

        <div className="overflow-x-auto max-h-[750px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xs">
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-mono uppercase tracking-wider">
                <th
                  onClick={() => handleSort("rank")}
                  className="py-3 px-3 text-center w-12 cursor-pointer select-none group hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                  title="Ordenar por Posição / Classificação"
                >
                  Pos. {renderSortIndicator("rank")}
                </th>
                <th className="py-3 px-3 text-center w-16">Nº Urna</th>
                <th className="py-3 px-4 min-w-[200px]">Candidato / Opção da Amostra</th>

                {/* Dynamic Columns based on metricDisplay */}
                {metricDisplay === "dual" ? (
                  <>
                    <th
                      onClick={() => handleSort("validos")}
                      className="py-3 px-3 text-center bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-black border-l border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      title="Ordenar por Média de Votos Válidos"
                    >
                      % Válidos (TSE) {renderSortIndicator("validos")}
                    </th>
                    <th
                      onClick={() => handleSort("totais")}
                      className="py-3 px-3 text-center bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                      title="Ordenar por Média de Votos Totais"
                    >
                      % Totais (Amostra 100%) {renderSortIndicator("totais")}
                    </th>
                    <th
                      onClick={() => handleSort("baseRecente")}
                      className="py-3 px-3 text-center bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-300 font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                      title="Ordenar pela Base Mais Recente"
                    >
                      Base Recente ({pollHeaderInfo.date3}) {renderSortIndicator("baseRecente")}
                    </th>
                    <th
                      onClick={() => handleSort("segundaBase")}
                      className="py-3 px-3 text-center bg-slate-50 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                      title="Ordenar pela 2ª Base"
                    >
                      2ª Base ({pollHeaderInfo.date2}) {renderSortIndicator("segundaBase")}
                    </th>
                    <th
                      onClick={() => handleSort("primeiraBase")}
                      className="py-3 px-3 text-center bg-slate-50 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                      title="Ordenar pela 1ª Base"
                    >
                      1ª Base ({pollHeaderInfo.date1}) {renderSortIndicator("primeiraBase")}
                    </th>
                  </>
                ) : metricDisplay === "validos" ? (
                  <>
                    <th
                      onClick={() => handleSort("baseRecente")}
                      className="py-3 px-3 text-center bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-300 font-black border-l border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                      title="Ordenar pela Base Mais Recente"
                    >
                      Base Recente ({pollHeaderInfo.date3}) {renderSortIndicator("baseRecente")}
                    </th>
                    <th
                      onClick={() => handleSort("segundaBase")}
                      className="py-3 px-3 text-center bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-bold border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      title="Ordenar pela 2ª Base"
                    >
                      2ª Base ({pollHeaderInfo.date2}) {renderSortIndicator("segundaBase")}
                    </th>
                    <th
                      onClick={() => handleSort("primeiraBase")}
                      className="py-3 px-3 text-center bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-bold border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      title="Ordenar pela 1ª Base"
                    >
                      1ª Base ({pollHeaderInfo.date1}) {renderSortIndicator("primeiraBase")}
                    </th>
                    <th
                      onClick={() => handleSort("validos")}
                      className="py-3 px-4 text-center bg-emerald-100/80 dark:bg-emerald-900/50 font-black text-emerald-900 dark:text-emerald-300 border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-colors"
                      title="Ordenar por Média de Votos Válidos"
                    >
                      Média % Válidos (TSE) {renderSortIndicator("validos")}
                    </th>
                  </>
                ) : (
                  <>
                    <th
                      onClick={() => handleSort("baseRecente")}
                      className="py-3 px-3 text-center bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-300 font-black border-l border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                      title="Ordenar pela Base Mais Recente"
                    >
                      Base Recente ({pollHeaderInfo.date3}) {renderSortIndicator("baseRecente")}
                    </th>
                    <th
                      onClick={() => handleSort("segundaBase")}
                      className="py-3 px-3 text-center bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 font-bold border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                      title="Ordenar pela 2ª Base"
                    >
                      2ª Base ({pollHeaderInfo.date2}) {renderSortIndicator("segundaBase")}
                    </th>
                    <th
                      onClick={() => handleSort("primeiraBase")}
                      className="py-3 px-3 text-center bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 font-bold border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                      title="Ordenar pela 1ª Base"
                    >
                      1ª Base ({pollHeaderInfo.date1}) {renderSortIndicator("primeiraBase")}
                    </th>
                    <th
                      onClick={() => handleSort("totais")}
                      className="py-3 px-4 text-center bg-blue-100/80 dark:bg-blue-900/50 font-black text-blue-900 dark:text-blue-300 border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
                      title="Ordenar por Média de Votos Totais"
                    >
                      Média % Totais (Amostra) {renderSortIndicator("totais")}
                    </th>
                  </>
                )}

                <th
                  onClick={() => handleSort("votos")}
                  className="py-3 px-4 text-center bg-slate-200/50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none group hover:bg-slate-300/60 dark:hover:bg-slate-700/60 transition-colors"
                  title="Ordenar por Qtd. Votos Projetados"
                >
                  Qtd. Votos Projetados {renderSortIndicator("votos")}
                </th>
                <th className="py-3 px-4 text-center">Projeção da Vaga (Eleito)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.length > 0 ? (
                filteredData.map((cand) => {
                  const isElected = cand.status === "ELEITO" || cand.status === "SEGUNDO_TURNO";

                  return (
                    <tr
                      key={`${cand.name}-${cand.number}`}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isElected ? "bg-emerald-50/20 dark:bg-emerald-950/10" : ""
                      }`}
                    >
                      {/* Rank Position */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] ${
                            isElected
                              ? "bg-emerald-600 text-white font-black shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {cand.rank}
                        </span>
                      </td>

                      {/* Ballot Number */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono font-black text-xs px-2 py-1 rounded bg-blue-950 dark:bg-slate-800 text-amber-300 border border-blue-900">
                          {cand.number}
                        </span>
                      </td>

                      {/* Candidate Name & Coalition */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {cand.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                            {cand.coalition}
                          </p>
                        </div>
                      </td>

                      {/* Dynamic Columns Rendering */}
                      {metricDisplay === "dual" ? (
                        <>
                          {/* % Válidos Average */}
                          <td className="py-3.5 px-3 text-center font-mono font-black text-xs bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300 border-l border-r border-slate-100 dark:border-slate-800">
                            <span className="px-2 py-1 rounded bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/50">
                              {cand.pollAverage}%
                            </span>
                          </td>

                          {/* % Totais Average */}
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-xs bg-blue-50/30 dark:bg-blue-950/10 text-blue-800 dark:text-blue-300 border-r border-slate-100 dark:border-slate-800">
                            <span className="px-2 py-1 rounded bg-blue-100/70 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/50">
                              {cand.pollAverageTotal}%
                            </span>
                          </td>

                          {/* Date 3 (Base Recente) */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs font-bold border-r border-slate-100 dark:border-slate-800 bg-amber-50/20 dark:bg-amber-950/10 text-amber-950 dark:text-amber-300">
                            {cand.pollDate3Total}%
                          </td>

                          {/* Date 2 (2ª Base) */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            {cand.pollDate2Total}%
                          </td>

                          {/* Date 1 (1ª Base) */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            {cand.pollDate1Total}%
                          </td>
                        </>
                      ) : metricDisplay === "validos" ? (
                        <>
                          {/* Date 3 (Base Recente) */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs font-bold border-l border-r border-slate-100 dark:border-slate-800 bg-amber-50/20 dark:bg-amber-950/10 text-amber-950 dark:text-amber-300">
                            {cand.pollDate3}%
                          </td>
                          {/* Date 2 (2ª Base) */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            {cand.pollDate2}%
                          </td>
                          {/* Date 1 (1ª Base) */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            {cand.pollDate1}%
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-black text-xs bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-900 dark:text-emerald-300 border-r border-slate-100 dark:border-slate-800">
                            <span className="px-2 py-1 rounded bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/50">
                              {cand.pollAverage}%
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Date 3 (Base Recente) */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs font-bold border-l border-r border-slate-100 dark:border-slate-800 bg-amber-50/20 dark:bg-amber-950/10 text-amber-950 dark:text-amber-300">
                            {cand.pollDate3Total}%
                          </td>
                          {/* Date 2 (2ª Base) */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            {cand.pollDate2Total}%
                          </td>
                          {/* Date 1 (1ª Base) */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            {cand.pollDate1Total}%
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-black text-xs bg-blue-50/40 dark:bg-blue-950/10 text-blue-900 dark:text-blue-300 border-r border-slate-100 dark:border-slate-800">
                            <span className="px-2 py-1 rounded bg-blue-100/70 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/50">
                              {cand.pollAverageTotal}%
                            </span>
                          </td>
                        </>
                      )}

                      {/* Projected Votes nominal count (Derived strictly from Valid %) */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-xs bg-slate-50/50 dark:bg-slate-800/30 text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-800">
                        {cand.projectedVotes.toLocaleString("pt-BR")} votos
                      </td>

                      {/* Seat Projection & Electability Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(cand)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-mono text-xs">
                    Nenhum candidato encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}

              {/* NON-VALID ROWS: Brancos/Nulos & Indecisos (Rendered when no search/elected filter or explicitly) */}
              {filterMode === "todos" && selectedCoalition === "all" && searchTerm === "" && roleStats?.nonValidItems && roleStats.nonValidItems.length > 0 && (
                <>
                  {/* Divider for Non-Valid options */}
                  <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 font-mono text-[10px] uppercase font-bold tracking-wider">
                    <td colSpan={metricDisplay === "dual" ? 9 : 8} className="py-2 px-4 border-t-2 border-b border-slate-300 dark:border-slate-700">
                      Votos Não Válidos / Opções da Amostra (Excluídos da Apuração Oficial TSE)
                    </td>
                  </tr>

                  {roleStats.nonValidItems.map((nv) => {
                    const isBN = nv.id === "branco-nulo";
                    return (
                      <tr
                        key={nv.id}
                        className={isBN ? "bg-rose-50/30 dark:bg-rose-950/10 hover:bg-rose-50/60" : "bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/60"}
                      >
                        {/* Rank */}
                        <td className="py-3 px-3 text-center font-mono text-slate-400">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-200/70 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {nv.shortTag}
                          </span>
                        </td>

                        {/* Ballot Number */}
                        <td className="py-3 px-3 text-center font-mono text-slate-400 text-xs">
                          {nv.number}
                        </td>

                        {/* Name & Description */}
                        <td className="py-3 px-4">
                          <h4 className={`font-bold text-xs ${isBN ? "text-rose-900 dark:text-rose-300" : "text-amber-900 dark:text-amber-300"}`}>
                            {nv.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {nv.description}
                          </p>
                        </td>

                        {/* Dynamic Columns */}
                        {metricDisplay === "dual" ? (
                          <>
                            {/* % Válidos (Always 0% or Excluded) */}
                            <td className="py-3 px-3 text-center font-mono font-bold text-xs bg-slate-100/50 dark:bg-slate-800/40 text-slate-400 border-l border-r border-slate-200 dark:border-slate-700">
                              <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 text-[10px]">
                                Excluído (0%)
                              </span>
                            </td>

                            {/* % Totais Average */}
                            <td className={`py-3 px-3 text-center font-mono font-black text-xs border-r border-slate-200 dark:border-slate-700 ${isBN ? "text-rose-800 dark:text-rose-300 bg-rose-50/40" : "text-amber-800 dark:text-amber-300 bg-amber-50/40"}`}>
                              <span className={`px-2 py-1 rounded border ${isBN ? "bg-rose-100/80 border-rose-300 text-rose-900" : "bg-amber-100/80 border-amber-300 text-amber-900"}`}>
                                {nv.pollAverageTotal}%
                              </span>
                            </td>

                            {/* Date 3 (Base Recente) */}
                            <td className="py-3 px-3 text-center font-mono text-xs font-bold border-r border-slate-200 dark:border-slate-700 bg-amber-50/20 dark:bg-amber-950/10 text-amber-950 dark:text-amber-300">
                              {nv.pollDate3Total}%
                            </td>

                            {/* Date 2 (2ª Base) */}
                            <td className="py-3 px-3 text-center font-mono text-xs border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                              {nv.pollDate2Total}%
                            </td>

                            {/* Date 1 (1ª Base) */}
                            <td className="py-3 px-3 text-center font-mono text-xs border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                              {nv.pollDate1Total}%
                            </td>
                          </>
                        ) : metricDisplay === "validos" ? (
                          <>
                            {/* Date 3 (Base Recente) */}
                            <td className="py-3 px-3 text-center font-mono text-xs text-slate-400 border-l border-r border-slate-200 dark:border-slate-700">
                              0.0%
                            </td>
                            {/* Date 2 (2ª Base) */}
                            <td className="py-3 px-3 text-center font-mono text-xs text-slate-400 border-r border-slate-200 dark:border-slate-700">
                              0.0%
                            </td>
                            {/* Date 1 (1ª Base) */}
                            <td className="py-3 px-3 text-center font-mono text-xs text-slate-400 border-r border-slate-200 dark:border-slate-700">
                              0.0%
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 bg-slate-100/40 dark:bg-slate-800/40 border-r border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 italic">Excluído TSE</span>
                            </td>
                          </>
                        ) : (
                          <>
                            {/* Date 3 (Base Recente) */}
                            <td className="py-3 px-3 text-center font-mono text-xs font-bold border-l border-r border-slate-200 dark:border-slate-700 bg-amber-50/20 dark:bg-amber-950/10 text-amber-950 dark:text-amber-300">
                              {nv.pollDate3Total}%
                            </td>
                            {/* Date 2 (2ª Base) */}
                            <td className="py-3 px-3 text-center font-mono text-xs border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                              {nv.pollDate2Total}%
                            </td>
                            {/* Date 1 (1ª Base) */}
                            <td className="py-3 px-3 text-center font-mono text-xs border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                              {nv.pollDate1Total}%
                            </td>
                            <td className={`py-3 px-4 text-center font-mono font-black text-xs border-r border-slate-200 dark:border-slate-700 ${isBN ? "text-rose-900 bg-rose-50" : "text-amber-900 bg-amber-50"}`}>
                              {nv.pollAverageTotal}%
                            </td>
                          </>
                        )}

                        {/* Projected Votes */}
                        <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 border-r border-slate-200 dark:border-slate-700">
                          {nv.count ? `${nv.count.toLocaleString("pt-BR")} entr.` : "—"}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            Fora da Apuração
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>

            {/* Table Footer: Prominent 100% Amostra & 100% Válidos Summary Rows */}
            <tfoot className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold text-xs border-t-2 border-slate-300 dark:border-slate-700">
              {/* Row 1: 100% Amostra Total */}
              <tr className="bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900">
                <td colSpan={3} className="py-3 px-4 text-left font-bold text-blue-950 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    <span>1. TOTAL GERAL DA AMOSTRA (100% ESTIMULADO)</span>
                    <span className="text-[10px] text-blue-700 dark:text-blue-300 font-normal">
                      (Nominais: {roleStats?.nominalCandidatesSamplePercent || 0}% + BN: {roleStats?.brancoNuloSamplePercent || 0}% + Indecisos: {roleStats?.indecisosSamplePercent || 0}%)
                    </span>
                  </div>
                </td>

                {metricDisplay === "dual" ? (
                  <>
                    <td className="py-3 px-3 text-center text-slate-400 border-l border-r border-blue-200 dark:border-blue-900">
                      —
                    </td>
                    <td className="py-3 px-3 text-center text-blue-900 dark:text-blue-300 font-black text-sm bg-blue-100/80 dark:bg-blue-900/60 border-r border-blue-200 dark:border-blue-900">
                      100.0%
                    </td>
                    <td className="py-3 px-3 text-center text-blue-800 dark:text-blue-300 border-r border-blue-200 dark:border-blue-900">
                      100.0%
                    </td>
                    <td className="py-3 px-3 text-center text-blue-800 dark:text-blue-300 border-r border-blue-200 dark:border-blue-900">
                      100.0%
                    </td>
                    <td className="py-3 px-3 text-center text-blue-800 dark:text-blue-300 border-r border-blue-200 dark:border-blue-900">
                      100.0%
                    </td>
                  </>
                ) : metricDisplay === "validos" ? (
                  <>
                    <td className="py-3 px-3 text-center text-slate-400 border-l border-r border-blue-200 dark:border-blue-900">—</td>
                    <td className="py-3 px-3 text-center text-slate-400 border-r border-blue-200 dark:border-blue-900">—</td>
                    <td className="py-3 px-3 text-center text-slate-400 border-r border-blue-200 dark:border-blue-900">—</td>
                    <td className="py-3 px-4 text-center text-blue-900 dark:text-blue-300 font-black border-r border-blue-200 dark:border-blue-900">100.0% Amostra</td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-3 text-center text-blue-800 dark:text-blue-300 border-l border-r border-blue-200 dark:border-blue-900">100.0%</td>
                    <td className="py-3 px-3 text-center text-blue-800 dark:text-blue-300 border-r border-blue-200 dark:border-blue-900">100.0%</td>
                    <td className="py-3 px-3 text-center text-blue-800 dark:text-blue-300 border-r border-blue-200 dark:border-blue-900">100.0%</td>
                    <td className="py-3 px-4 text-center text-blue-900 dark:text-blue-300 font-black border-r border-blue-200 dark:border-blue-900">100.0%</td>
                  </>
                )}

                <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-blue-200 dark:border-blue-900">
                  {roleStats?.totalSample ? `${roleStats.totalSample.toLocaleString("pt-BR")} entr.` : "Amostra Integral"}
                </td>
                <td className="py-3 px-4 text-center text-slate-500 font-normal text-[10px]">
                  Universo Total de Entrevistas
                </td>
              </tr>

              {/* Row 2: 100% Votos Válidos TSE */}
              <tr className="bg-emerald-50/80 dark:bg-emerald-950/40">
                <td colSpan={3} className="py-3 px-4 text-left font-bold text-emerald-950 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                    <span>2. TOTAL DE VOTOS VÁLIDOS (100% APURAÇÃO TSE)</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-normal">
                      (Base legal de cálculo para Quociente Eleitoral e Cadeiras)
                    </span>
                  </div>
                </td>

                {metricDisplay === "dual" ? (
                  <>
                    <td className="py-3 px-3 text-center text-emerald-900 dark:text-emerald-300 font-black text-sm bg-emerald-100/80 dark:bg-emerald-900/60 border-l border-r border-emerald-200 dark:border-emerald-900">
                      100.0%
                    </td>
                    <td className="py-3 px-3 text-center text-emerald-800 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-900">
                      {roleStats?.nominalCandidatesSamplePercent || roleStats?.validPercent || 100}%
                    </td>
                    <td className="py-3 px-3 text-center text-emerald-800 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-900">
                      100.0%
                    </td>
                    <td className="py-3 px-3 text-center text-emerald-800 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-900">
                      100.0%
                    </td>
                    <td className="py-3 px-3 text-center text-emerald-800 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-900">
                      100.0%
                    </td>
                  </>
                ) : metricDisplay === "validos" ? (
                  <>
                    <td className="py-3 px-3 text-center text-emerald-800 dark:text-emerald-300 border-l border-r border-emerald-200 dark:border-emerald-900">100.0%</td>
                    <td className="py-3 px-3 text-center text-emerald-800 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-900">100.0%</td>
                    <td className="py-3 px-3 text-center text-emerald-800 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-900">100.0%</td>
                    <td className="py-3 px-4 text-center text-emerald-900 dark:text-emerald-300 font-black border-r border-emerald-200 dark:border-emerald-900">100.0%</td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-3 text-center text-emerald-800 dark:text-emerald-300 border-l border-r border-emerald-200 dark:border-emerald-900">100.0%</td>
                    <td className="py-3 px-3 text-center text-emerald-800 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-900">100.0%</td>
                    <td className="py-3 px-3 text-center text-emerald-800 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-900">100.0%</td>
                    <td className="py-3 px-4 text-center text-emerald-900 dark:text-emerald-300 font-black border-r border-emerald-200 dark:border-emerald-900">100.0%</td>
                  </>
                )}

                <td className="py-3 px-4 text-center font-black text-emerald-900 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-900">
                  {TOTAL_VOTOS_VALIDOS_ESTIMADOS.toLocaleString("pt-BR")} votos
                </td>
                <td className="py-3 px-4 text-center text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                  Base 100% Votos Válidos
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Non-Valid Votes Breakdown Section */}
      {roleStats && roleStats.nonValidOptions && roleStats.nonValidOptions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Vote className="w-4 h-4 text-slate-500" />
              Demonstrativo de Votos Não Válidos ({roleConfig.title})
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Excluídos do cômputo de Votos Válidos nominais conforme Lei nº 9.504/97
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roleStats.nonValidOptions.map((opt) => (
              <div
                key={opt.name}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{opt.name}</h4>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {opt.count.toLocaleString("pt-BR")} entrevistas registradas
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-black text-slate-800 dark:text-slate-200 block">
                    {opt.percentageTotal}%
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">da Amostra Total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Methodological Context Note */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Metodologia TSE (Código Eleitoral):</strong> Os votos válidos são calculados deduzindo-se da amostra total os votos brancos, nulos e indecisos/não respondidos. O Quociente Eleitoral (QE) e as sobras partidárias (D'Hondt) utilizam obrigatoriamente a base de votos válidos nominais.
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
          Instituto CTAS, CONRE 10801, Estatístico Responsável Sidney Barreto Batista.
        </div>
      </div>
    </div>
  );
}

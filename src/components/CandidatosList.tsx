import React, { useState, useMemo } from "react";
import { CANDIDATOS_OFICIAIS_2026, OfficialCandidate2026 } from "../data/candidatosOficiais2026";
import { PRE_CANDIDATES, CANDIDATE_COLORS } from "../data/sergipeData";
import {
  Users,
  Search,
  Filter,
  Vote,
  Award,
  Layers,
  Landmark,
  Building,
  Info,
  ShieldCheck,
  Hash
} from "lucide-react";

export default function CandidatosList() {
  const [activeViewMode, setActiveViewMode] = useState<"todos" | "Governador" | "Senador" | "Deputado Federal" | "Deputado Estadual">("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoalition, setSelectedCoalition] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<OfficialCandidate2026 | null>(
    CANDIDATOS_OFICIAIS_2026[0]
  );

  // Extract unique coalitions for filter dropdown
  const allCoalitions = useMemo(() => {
    const set = new Set<string>();
    CANDIDATOS_OFICIAIS_2026.forEach((c) => set.add(c.coalition));
    return Array.from(set).sort();
  }, []);

  // Filter candidates based on search, view mode (role), and coalition
  const filteredCandidates = useMemo(() => {
    return CANDIDATOS_OFICIAIS_2026.filter((c) => {
      const matchRole = activeViewMode === "todos" || c.role === activeViewMode;
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.number.includes(searchTerm) ||
        c.coalition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCoalition = selectedCoalition === "all" || c.coalition === selectedCoalition;
      return matchRole && matchSearch && matchCoalition;
    });
  }, [activeViewMode, searchTerm, selectedCoalition]);

  // Counts per role
  const counts = useMemo(() => {
    return {
      all: CANDIDATOS_OFICIAIS_2026.length,
      gov: CANDIDATOS_OFICIAIS_2026.filter((c) => c.role === "Governador").length,
      sen: CANDIDATOS_OFICIAIS_2026.filter((c) => c.role === "Senador").length,
      fed: CANDIDATOS_OFICIAIS_2026.filter((c) => c.role === "Deputado Federal").length,
      est: CANDIDATOS_OFICIAIS_2026.filter((c) => c.role === "Deputado Estadual").length,
    };
  }, []);

  const getRoleBadgeStyle = (role: OfficialCandidate2026["role"]) => {
    switch (role) {
      case "Governador":
        return "bg-blue-600 text-white border-blue-500";
      case "Senador":
        return "bg-emerald-600 text-white border-emerald-500";
      case "Deputado Federal":
        return "bg-amber-600 text-white border-amber-500";
      case "Deputado Estadual":
        return "bg-purple-600 text-white border-purple-500";
      default:
        return "bg-slate-700 text-white border-slate-600";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-blue-950 dark:text-slate-100 flex items-center gap-2">
            <Vote className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            Candidatos Oficiais Eleições 2026
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            Quadro consolidado oficial de candidaturas, coligações, cargos da totalização e números de urna em Sergipe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {counts.all} Candidaturas Registradas
          </span>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setActiveViewMode("todos")}
          className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between border cursor-pointer ${
            activeViewMode === "todos"
              ? "bg-blue-950 text-white border-blue-950 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <span>Todos</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 dark:bg-slate-800">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveViewMode("Governador")}
          className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between border cursor-pointer ${
            activeViewMode === "Governador"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Governador
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300">
            {counts.gov}
          </span>
        </button>

        <button
          onClick={() => setActiveViewMode("Senador")}
          className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between border cursor-pointer ${
            activeViewMode === "Senador"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Senador
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
            {counts.sen}
          </span>
        </button>

        <button
          onClick={() => setActiveViewMode("Deputado Federal")}
          className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between border cursor-pointer ${
            activeViewMode === "Deputado Federal"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5" /> Dep. Federal
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
            {counts.fed}
          </span>
        </button>

        <button
          onClick={() => setActiveViewMode("Deputado Estadual")}
          className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between border cursor-pointer ${
            activeViewMode === "Deputado Estadual"
              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" /> Dep. Estadual
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300">
            {counts.est}
          </span>
        </button>
      </div>

      {/* Search & Coalition Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome de urna, número ou coligação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCoalition}
            onChange={(e) => setSelectedCoalition(e.target.value)}
            className="w-full md:w-80 text-xs p-2.5 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
          >
            <option value="all">Todas as Coligações / Federações ({allCoalitions.length})</option>
            {allCoalitions.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Candidate Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Candidates List Table / Scroll */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Listagem de Candidatos ({filteredCandidates.length} exibidos)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Clique para inspecionar</span>
          </div>

          <div className="max-h-[640px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((cand) => {
                const isSelected =
                  selectedCandidate &&
                  selectedCandidate.name === cand.name &&
                  selectedCandidate.number === cand.number;

                return (
                  <button
                    key={`${cand.name}-${cand.number}`}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`w-full text-left p-3.5 transition-all flex items-center justify-between gap-4 cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-l-blue-600"
                        : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Urna Ballot Number Badge */}
                      <div className="w-14 h-11 rounded-lg bg-blue-950 dark:bg-slate-800 text-white flex flex-col items-center justify-center shrink-0 border border-blue-900">
                        <span className="text-[8px] font-mono text-blue-300 leading-none uppercase">Urna</span>
                        <span className="text-sm font-mono font-black tracking-tight text-white">{cand.number}</span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {cand.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {cand.coalition}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadgeStyle(
                          cand.role
                        )}`}
                      >
                        {cand.role}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Nº Partido: {cand.partyNumber}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400 font-mono text-xs">
                Nenhum candidato encontrado com os filtros especificados.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detail Spotlight Card */}
        <div className="lg:col-span-1 space-y-4">
          {selectedCandidate ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 sticky top-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">
                  Ficha Eleitoral 2026
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadgeStyle(
                    selectedCandidate.role
                  )}`}
                >
                  {selectedCandidate.role}
                </span>
              </div>

              {/* Urna Simulation Box */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-xl border border-blue-900 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-blue-300 uppercase block">Nome de Urna</span>
                    <h3 className="text-xl font-serif font-black text-white mt-0.5">
                      {selectedCandidate.name}
                    </h3>
                  </div>
                  <div className="bg-blue-600/30 border border-blue-400/30 px-3 py-1.5 rounded-lg text-right">
                    <span className="text-[8px] font-mono text-blue-200 uppercase block">Número</span>
                    <span className="text-xl font-mono font-black text-amber-300 tracking-wider">
                      {selectedCandidate.number}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-900/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">Totalização</span>
                    <span className="font-bold text-slate-200">{selectedCandidate.role}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">Código Partidário</span>
                    <span className="font-mono font-bold text-amber-400">{selectedCandidate.partyNumber}</span>
                  </div>
                </div>
              </div>

              {/* Coalition details */}
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Coligação / Federação Partidária
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {selectedCandidate.coalition}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Regras de Votação (TSE Sergipe)
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedCandidate.role === "Governador" &&
                      "Votação majoritária de 2 dígitos. Necessita de 50% + 1 dos votos válidos no 1º turno para evitar segundo turno."}
                    {selectedCandidate.role === "Senador" &&
                      "Votação majoritária de 3 dígitos. Em 2026 serão eleitos dois senadores por Sergipe."}
                    {selectedCandidate.role === "Deputado Federal" &&
                      "Votação proporcional de 4 dígitos. Sergipe possui bancada com 8 vagas na Câmara dos Deputados."}
                    {selectedCandidate.role === "Deputado Estadual" &&
                      "Votação proporcional de 5 dígitos. Sergipe possui 24 vagas na Assembleia Legislativa (ALESE)."}
                  </p>
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Sistema SEIE 2026
                </span>
                <span>Registro Oficial</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 font-mono text-xs">
              Selecione um candidato ao lado para visualizar os detalhes completos da candidatura.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

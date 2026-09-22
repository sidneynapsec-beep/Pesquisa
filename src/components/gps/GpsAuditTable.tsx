import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  StandardizedGeoResult,
  GeocodeReliabilityStatus,
  clearGeocodeCache,
  getGeocodeCacheStats,
  saveGeocodeCache
} from "../../utils/reverseGeocoder";
import { SERGIPE_75_MUNICIPIOS } from "../../data/tseSergipeMunicipios";
import {
  Search,
  Download,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Database,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Compass,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

interface GpsAuditTableProps {
  auditRows: StandardizedGeoResult[];
  isGeocoding: boolean;
  geocodedProgress: { processed: number; total: number; percent: number };
  onRunBatchGeocoding: () => void;
  onLoadSampleData: () => void;
}

export function GpsAuditTable({
  auditRows,
  isGeocoding,
  geocodedProgress,
  onRunBatchGeocoding,
  onLoadSampleData
}: GpsAuditTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"TODOS" | GeocodeReliabilityStatus>("TODOS");
  const [selectedMuni, setSelectedMuni] = useState("TODOS");
  const [copied, setCopied] = useState(false);
  const [cacheStats, setCacheStats] = useState(() => getGeocodeCacheStats());

  const handleClearCache = () => {
    if (window.confirm("Deseja realmente limpar o cache local de geocodificação?")) {
      clearGeocodeCache();
      setCacheStats(getGeocodeCacheStats());
    }
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    return auditRows.filter((r) => {
      if (statusFilter !== "TODOS" && r.statusConfiabilidade !== statusFilter) {
        return false;
      }
      if (selectedMuni !== "TODOS" && r.municipio.toLowerCase() !== selectedMuni.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          r.bairro.toLowerCase().includes(q) ||
          r.municipio.toLowerCase().includes(q) ||
          (r.logradouro && r.logradouro.toLowerCase().includes(q)) ||
          (r.cep && r.cep.includes(q)) ||
          String(r.id || "").includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [auditRows, statusFilter, selectedMuni, searchTerm]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = auditRows.length;
    const sucesso = auditRows.filter((r) => r.statusConfiabilidade === "SUCESSO").length;
    const aproximado = auditRows.filter((r) => r.statusConfiabilidade === "APROXIMADO").length;
    const foraMuni = auditRows.filter((r) => r.statusConfiabilidade === "FORA_MUNICIPIO").length;
    const naoCadastrado = auditRows.filter((r) => r.statusConfiabilidade === "BAIRRO_NAO_CADASTRADO").length;
    const naoIdentificado = auditRows.filter((r) => r.statusConfiabilidade === "NAO_IDENTIFICADO").length;

    return { total, sucesso, aproximado, foraMuni, naoCadastrado, naoIdentificado };
  }, [auditRows]);

  // Export to Excel (.xlsx)
  const handleExportXLSX = () => {
    if (filteredRows.length === 0) return;

    const dataToExport = filteredRows.map((r, i) => ({
      "ID": r.id || i + 1,
      "Latitude": r.latitude,
      "Longitude": r.longitude,
      "Coordenadas": r.coordenadasFormatadas,
      "Município": r.municipio,
      "Bairro Padronizado Oficial": r.bairro,
      "Bairro Original / Detectado": r.bairroOriginal || "",
      "Logradouro / Endereço": r.logradouro || "",
      "Número": r.numero || "",
      "CEP": r.cep || "",
      "Estado": r.estado || "SE",
      "Distância do Centro (km)": +r.distanciaCentroKm.toFixed(2),
      "Fonte da Geocodificação": r.fonte,
      "Status de Confiabilidade": r.statusConfiabilidade,
      "Confiabilidade (%)": `${r.confiabilidadePercent}%`,
      "Detalhes de Auditoria": r.detalhesAuditoria
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Geolocalizacao_SEIE");
    XLSX.writeFile(wb, `SEIE_Geocodificacao_Bairros_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRows.length === 0) return;

    const headers = [
      "ID", "Latitude", "Longitude", "Municipio", "Bairro_Padronizado",
      "Bairro_Original", "Logradouro", "CEP", "Status_Confiabilidade", "Confiabilidade_Pct", "Auditoria"
    ];

    const csvLines = [headers.join(";")];
    filteredRows.forEach((r, i) => {
      csvLines.push([
        r.id || i + 1,
        r.latitude,
        r.longitude,
        `"${r.municipio}"`,
        `"${r.bairro}"`,
        `"${r.bairroOriginal || ""}"`,
        `"${r.logradouro || ""}"`,
        `"${r.cep || ""}"`,
        r.statusConfiabilidade,
        `${r.confiabilidadePercent}%`,
        `"${r.detalhesAuditoria.replace(/"/g, '""')}"`
      ].join(";"));
    });

    const blob = new Blob(["\uFEFF" + csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SEIE_Geocodificacao_Bairros_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopyClipboard = () => {
    if (filteredRows.length === 0) return;

    const text = [
      "ID\tLatitude\tLongitude\tMunicípio\tBairro Padronizado\tLogradouro\tCEP\tStatus\tAuditoria",
      ...filteredRows.map((r, i) =>
        `${r.id || i + 1}\t${r.latitude}\t${r.longitude}\t${r.municipio}\t${r.bairro}\t${r.logradouro || ""}\t${r.cep || ""}\t${r.statusConfiabilidade}\t${r.detalhesAuditoria}`
      )
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner / Explanation */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md border border-blue-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/30 text-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-400/30">
                Identificação Automática por Latitude & Longitude
              </span>
              <span className="text-xs text-blue-200">SEIE Geo-Engine 2026</span>
            </div>
            <h2 className="text-xl font-black mt-1 text-white flex items-center gap-2">
              Auditoria de Geocodificação Reversa & Padronização de Bairros
            </h2>
            <p className="text-xs text-blue-100/90 mt-1 max-w-3xl leading-relaxed">
              O sistema utiliza a <strong>Latitude e Longitude como referência geográfica primária</strong> para determinar o bairro e localidade de cada entrevista. Os resultados são padronizados contra a <strong>base oficial dos 75 municípios de Sergipe</strong>, garantindo integridade territorial sem inventar dados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onRunBatchGeocoding}
              disabled={isGeocoding || auditRows.length === 0}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                isGeocoding
                  ? "bg-blue-600/70 text-white cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30 hover:scale-[1.02]"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isGeocoding ? "animate-spin" : ""}`} />
              {isGeocoding ? "Processando Lote..." : "Executar Geocodificação em Lote"}
            </button>

            {auditRows.length === 0 && (
              <button
                onClick={onLoadSampleData}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Carregar Amostra Sergipe (50 Pontos Reais)
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar if active */}
        {isGeocoding && (
          <div className="mt-4 pt-3 border-t border-blue-700/60">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span>Processando pontos geográficos em lote...</span>
              <span>{geocodedProgress.processed} / {geocodedProgress.total} ({geocodedProgress.percent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-blue-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${geocodedProgress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards: Status de Confiabilidade */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div
          onClick={() => setStatusFilter("TODOS")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "TODOS"
              ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500"
              : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-300"
          }`}
        >
          <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            Total Pontos GPS
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-white mt-1">
            {stats.total}
          </div>
          <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
            Registros processados
          </div>
        </div>

        {/* 1. SUCESSO */}
        <div
          onClick={() => setStatusFilter("SUCESSO")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "SUCESSO"
              ? "bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500"
              : "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400"
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            1. Sucesso Oficial
          </div>
          <div className="text-xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
            {stats.sucesso}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
            Base oficial validada
          </div>
        </div>

        {/* 2. APROXIMADO */}
        <div
          onClick={() => setStatusFilter("APROXIMADO")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "APROXIMADO"
              ? "bg-amber-100 dark:bg-amber-950/80 border-amber-500 ring-2 ring-amber-500"
              : "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 hover:border-amber-400"
          }`}
        >
          <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3 h-3 text-amber-600" />
            2. GIS Aproximado
          </div>
          <div className="text-xl font-black text-amber-900 dark:text-amber-100 mt-1">
            {stats.aproximado}
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
            Centróide &lt; 4km
          </div>
        </div>

        {/* 3. FORA_MUNICIPIO */}
        <div
          onClick={() => setStatusFilter("FORA_MUNICIPIO")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "FORA_MUNICIPIO"
              ? "bg-orange-100 dark:bg-orange-950/80 border-orange-500 ring-2 ring-orange-500"
              : "bg-orange-50/60 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/60 hover:border-orange-400"
          }`}
        >
          <div className="text-[11px] font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            3. Fora Município
          </div>
          <div className="text-xl font-black text-orange-900 dark:text-orange-100 mt-1">
            {stats.foraMuni}
          </div>
          <div className="text-[10px] text-orange-700 dark:text-orange-400 mt-0.5">
            Fora do limite indicado
          </div>
        </div>

        {/* 4. BAIRRO_NAO_CADASTRADO */}
        <div
          onClick={() => setStatusFilter("BAIRRO_NAO_CADASTRADO")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "BAIRRO_NAO_CADASTRADO"
              ? "bg-purple-100 dark:bg-purple-950/80 border-purple-500 ring-2 ring-purple-500"
              : "bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60 hover:border-purple-400"
          }`}
        >
          <div className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-600" />
            4. Não Cadastrado
          </div>
          <div className="text-xl font-black text-purple-900 dark:text-purple-100 mt-1">
            {stats.naoCadastrado}
          </div>
          <div className="text-[10px] text-purple-700 dark:text-purple-400 mt-0.5">
            Retornado s/ match
          </div>
        </div>

        {/* 5. NAO_IDENTIFICADO */}
        <div
          onClick={() => setStatusFilter("NAO_IDENTIFICADO")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "NAO_IDENTIFICADO"
              ? "bg-rose-100 dark:bg-rose-950/80 border-rose-500 ring-2 ring-rose-500"
              : "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 hover:border-rose-400"
          }`}
        >
          <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            5. Não Identificado
          </div>
          <div className="text-xl font-black text-rose-900 dark:text-rose-100 mt-1">
            {stats.naoIdentificado}
          </div>
          <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-0.5">
            Sem invenção de nomes
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Municipality Filter, Export Buttons */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Bairro, Município, Rua, CEP ou ID..."
              className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Municipality Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedMuni}
              onChange={(e) => setSelectedMuni(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-gray-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos os Municípios (75)</option>
              {SERGIPE_75_MUNICIPIOS.map((m) => (
                <option key={m.codigoTse || m.nome} value={m.nome}>
                  {m.nome}
                </option>
              ))}
            </select>

            {/* Export buttons */}
            <button
              onClick={handleExportXLSX}
              disabled={filteredRows.length === 0}
              className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Exportar para Excel (.xlsx) com todas as colunas auditáveis"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Exportar Excel (.xlsx)
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredRows.length === 0}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 flex items-center gap-1.5 border border-gray-300 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>

            <button
              onClick={handleCopyClipboard}
              disabled={filteredRows.length === 0}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 flex items-center gap-1.5 border border-gray-300 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>

            <button
              onClick={handleClearCache}
              className="px-2.5 py-2 text-xs font-medium rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
              title={`Limpar Cache (${cacheStats.count} coordenadas cacheadas)`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/60 font-semibold">
                <th className="py-3 px-3 w-12 text-center">ID</th>
                <th className="py-3 px-3">Coordenadas (Lat / Long)</th>
                <th className="py-3 px-3">Município</th>
                <th className="py-3 px-4">Bairro Padronizado Oficial</th>
                <th className="py-3 px-3">Logradouro / CEP</th>
                <th className="py-3 px-3 text-center">Dist. Centro</th>
                <th className="py-3 px-3">Status de Confiabilidade</th>
                <th className="py-3 px-4">Detalhes de Auditoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 dark:text-slate-500">
                    <Compass className="w-10 h-10 mx-auto mb-2 opacity-40 animate-pulse text-blue-500" />
                    <p className="font-semibold text-gray-700 dark:text-slate-300">
                      Nenhuma coordenada geográfica correspondente encontrada.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      Carregue uma planilha com colunas de Latitude/Longitude ou clique no botão &quot;Carregar Amostra Sergipe&quot; para demonstrar a geocodificação.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, idx) => {
                  return (
                    <tr
                      key={`${r.id || idx}-${r.latitude}-${r.longitude}`}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3 px-3 text-center font-mono font-medium text-gray-500 dark:text-slate-400">
                        {r.id || idx + 1}
                      </td>

                      {/* Coordenadas */}
                      <td className="py-3 px-3 font-mono text-[11px] text-gray-800 dark:text-slate-200">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{r.latitude ? `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}` : "N/A"}</span>
                        </div>
                      </td>

                      {/* Município */}
                      <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">
                        {r.municipio}
                      </td>

                      {/* Bairro Padronizado */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {r.bairro}
                          </span>
                          {r.bairroOriginal && r.bairroOriginal !== r.bairro && (
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 line-through">
                              {r.bairroOriginal}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Logradouro / CEP */}
                      <td className="py-3 px-3 text-gray-600 dark:text-slate-300 text-[11px]">
                        {r.logradouro ? (
                          <div>
                            <span className="font-medium">{r.logradouro}</span>
                            {r.numero && <span>, {r.numero}</span>}
                            {r.cep && <span className="block text-[10px] text-gray-400">CEP: {r.cep}</span>}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-slate-500 italic">S/ logradouro</span>
                        )}
                      </td>

                      {/* Distância Centro */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-gray-600 dark:text-slate-400">
                        {r.distanciaCentroKm > 0 ? `${r.distanciaCentroKm.toFixed(1)} km` : "-"}
                      </td>

                      {/* Status de Confiabilidade Badge */}
                      <td className="py-3 px-3">
                        {r.statusConfiabilidade === "SUCESSO" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            SUCESSO ({r.confiabilidadePercent}%)
                          </span>
                        )}
                        {r.statusConfiabilidade === "APROXIMADO" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            <Compass className="w-3 h-3" />
                            APROXIMADO ({r.confiabilidadePercent}%)
                          </span>
                        )}
                        {r.statusConfiabilidade === "FORA_MUNICIPIO" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
                            <AlertTriangle className="w-3 h-3" />
                            FORA MUNICÍPIO
                          </span>
                        )}
                        {r.statusConfiabilidade === "BAIRRO_NAO_CADASTRADO" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                            <Layers className="w-3 h-3" />
                            NÃO CADASTRADO
                          </span>
                        )}
                        {r.statusConfiabilidade === "NAO_IDENTIFICADO" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                            <AlertTriangle className="w-3 h-3" />
                            NÃO IDENTIFICADO
                          </span>
                        )}
                      </td>

                      {/* Detalhes de Auditoria */}
                      <td className="py-3 px-4 text-[11px] text-gray-600 dark:text-slate-400 max-w-xs">
                        <div className="truncate" title={r.detalhesAuditoria}>
                          {r.detalhesAuditoria}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 dark:text-slate-400 font-mono">
          <span>Exibindo {filteredRows.length} de {auditRows.length} coordenadas auditadas</span>
          <span>Cache Ativo: {cacheStats.count} locais gravados em memória</span>
        </div>
      </div>
    </div>
  );
}

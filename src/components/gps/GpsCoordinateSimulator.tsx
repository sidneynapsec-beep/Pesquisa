import React, { useState } from "react";
import {
  StandardizedGeoResult,
  reverseGeocodeLocation,
  getLocalGisStandardizedBairro,
  getHaversineDistanceKm
} from "../../utils/reverseGeocoder";
import {
  MapPin,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Crosshair,
  Building2
} from "lucide-react";

interface PresetPoint {
  label: string;
  muni: string;
  bairroEsperado: string;
  lat: number;
  lng: number;
  tipo: "capital" | "interior" | "litoral" | "invalido";
}

const PRESET_POINTS: PresetPoint[] = [
  { label: "Aracaju - 13 de Julho (Beira Mar)", muni: "Aracaju", bairroEsperado: "13 de Julho", lat: -10.9320, lng: -37.0510, tipo: "capital" },
  { label: "Aracaju - Jardins (Shopping)", muni: "Aracaju", bairroEsperado: "Jardins", lat: -10.9395, lng: -37.0620, tipo: "capital" },
  { label: "Aracaju - Santos Dumont (Zona Norte)", muni: "Aracaju", bairroEsperado: "Santos Dumont", lat: -10.8920, lng: -37.0720, tipo: "capital" },
  { label: "Aracaju - Farolândia (UNIT / Augusto Franco)", muni: "Aracaju", bairroEsperado: "Farolândia", lat: -10.9650, lng: -37.0550, tipo: "capital" },
  { label: "Aracaju - Mosqueiro (Zona de Expansão)", muni: "Aracaju", bairroEsperado: "Mosqueiro", lat: -11.0820, lng: -37.1550, tipo: "litoral" },
  { label: "N. Sra. do Socorro - Marcos Freire II", muni: "Nossa Senhora do Socorro", bairroEsperado: "Marcos Freire II", lat: -10.8520, lng: -37.0780, tipo: "interior" },
  { label: "N. Sra. do Socorro - Taiçoca", muni: "Nossa Senhora do Socorro", bairroEsperado: "Taiçoca de Fora", lat: -10.8650, lng: -37.0850, tipo: "interior" },
  { label: "São Cristóvão - Eduardo Gomes / Rosa Elze", muni: "São Cristóvão", bairroEsperado: "Eduardo Gomes", lat: -10.9520, lng: -37.1420, tipo: "interior" },
  { label: "Itabaiana - Centro / Rotary", muni: "Itabaiana", bairroEsperado: "Centro", lat: -10.6860, lng: -37.4260, tipo: "interior" },
  { label: "Lagarto - Centro / Loiola", muni: "Lagarto", bairroEsperado: "Centro", lat: -10.9170, lng: -37.6500, tipo: "interior" },
  { label: "Estância - Centro / Cidade Nova", muni: "Estância", bairroEsperado: "Centro", lat: -11.2680, lng: -37.4380, tipo: "interior" },
  { label: "Ponto em Alto Mar (Fora de Sergipe)", muni: "Oceano Atlântico", bairroEsperado: "NÃO IDENTIFICADO", lat: -10.0000, lng: -35.0000, tipo: "invalido" }
];

export function GpsCoordinateSimulator() {
  const [latInput, setLatInput] = useState<string>("-10.93200");
  const [lngInput, setLngInput] = useState<string>("-37.05100");
  const [muniHint, setMuniHint] = useState<string>("Aracaju");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<StandardizedGeoResult | null>(null);

  const handleTestCoordinate = async (latStr?: string, lngStr?: string, hint?: string) => {
    const lat = parseFloat(latStr || latInput);
    const lng = parseFloat(lngStr || lngInput);
    const mHint = hint !== undefined ? hint : muniHint;

    if (isNaN(lat) || isNaN(lng)) {
      alert("Por favor, insira coordenadas de Latitude e Longitude válidas.");
      return;
    }

    setIsLoading(true);
    try {
      const geo = await reverseGeocodeLocation(lat, lng, mHint || undefined);
      setResult(geo);
    } catch (e) {
      const fallback = getLocalGisStandardizedBairro(lat, lng, mHint || undefined);
      setResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (p: PresetPoint) => {
    setLatInput(p.lat.toFixed(5));
    setLngInput(p.lng.toFixed(5));
    setMuniHint(p.muni);
    handleTestCoordinate(p.lat.toFixed(5), p.lng.toFixed(5), p.muni);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
          <Crosshair className="w-4 h-4" />
          Simulador Interativo de Geocodificação Reversa
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
          Validação em Tempo Real de Latitude e Longitude
        </h2>
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 max-w-2xl">
          Teste qualquer par de coordenadas geográficas para inspecionar o fluxo de resolução, o cálculo geodésico Haversine e a padronização contra a base oficial de bairros e povoados de Sergipe.
        </p>

        {/* Inputs */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
              Latitude (ex: -10.93200)
            </label>
            <input
              type="text"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              placeholder="-10.93200"
              className="w-full text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
              Longitude (ex: -37.05100)
            </label>
            <input
              type="text"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              placeholder="-37.05100"
              className="w-full text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
              Município (Opcional / Contexto)
            </label>
            <input
              type="text"
              value={muniHint}
              onChange={(e) => setMuniHint(e.target.value)}
              placeholder="Aracaju, Itabaiana, etc."
              className="w-full text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={() => handleTestCoordinate()}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Search className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Processando Coordenada..." : "Identificar Bairro Automaticamente"}
          </button>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-2">
          Pontos Predefinidos de Sergipe (Clique para Testar Instantaneamente):
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_POINTS.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSelectPreset(p)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 border border-gray-200 dark:border-slate-700 transition-all cursor-pointer text-gray-700 dark:text-slate-300"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Breakdown Card */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Resultado da Identificação Automática
              </h3>
            </div>

            {/* Status Badge */}
            <div>
              {result.statusConfiabilidade === "SUCESSO" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  SUCESSO - Bairro Validado na Base Oficial ({result.confiabilidadePercent}%)
                </span>
              )}
              {result.statusConfiabilidade === "APROXIMADO" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  APROXIMADO - Centróide GIS Proximidade ({result.confiabilidadePercent}%)
                </span>
              )}
              {result.statusConfiabilidade === "FORA_MUNICIPIO" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  FORA DO MUNICÍPIO PESQUISADO
                </span>
              )}
              {result.statusConfiabilidade === "BAIRRO_NAO_CADASTRADO" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  BAIRRO NÃO CADASTRADO NA BASE CANÔNICA
                </span>
              )}
              {result.statusConfiabilidade === "NAO_IDENTIFICADO" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  NÃO IDENTIFICADO (Sem Invenção de Nomes)
                </span>
              )}
            </div>
          </div>

          {/* Key Metric Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase">
                Bairro Padronizado Oficial
              </span>
              <div className="text-lg font-black text-gray-900 dark:text-white mt-1">
                {result.bairro}
              </div>
              {result.bairroOriginal && (
                <span className="text-[11px] text-gray-500 dark:text-slate-400 block mt-0.5">
                  Retorno bruto: {result.bairroOriginal}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase">
                Município & Estado
              </span>
              <div className="text-lg font-black text-gray-900 dark:text-white mt-1">
                {result.municipio} - {result.estado}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-slate-400 block mt-0.5">
                Distância: {result.distanciaCentroKm.toFixed(2)} km do centro
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase">
                Logradouro & CEP
              </span>
              <div className="text-sm font-bold text-gray-900 dark:text-white mt-1 truncate">
                {result.logradouro || "Não retornado"} {result.numero ? `, nº ${result.numero}` : ""}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-slate-400 block mt-0.5 font-mono">
                CEP: {result.cep || "N/A"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase">
                Fonte de Resolução
              </span>
              <div className="text-sm font-bold text-gray-900 dark:text-white mt-1 font-mono uppercase">
                {result.fonte}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-slate-400 block mt-0.5">
                Lat: {result.latitude}, Long: {result.longitude}
              </span>
            </div>
          </div>

          {/* Audit Details text */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
            <strong>Relatório de Auditoria:</strong> {result.detalhesAuditoria}
          </div>
        </div>
      )}
    </div>
  );
}

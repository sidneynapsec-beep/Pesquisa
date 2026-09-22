import React, { useState, useRef, useMemo } from "react";
import {
  Printer,
  FileText,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  LayoutList,
  Database,
  Calendar
} from "lucide-react";
import { useElectoralData } from "../../context/ElectoralDataContext";
import { Poll } from "../../types";
import { isValidPoll } from "../../utils/pollValidation";
import { adaptPollToCtasReport } from "../../utils/ctasDataAdapter";
import { getPollInsertedDateBR, getPollMedianDateBR } from "../../utils/dateFormatter";
import { CtasCoverPage, CtasBackcoverPage } from "./CtasCoverPage";
import {
  Page02SumarioFichaTecnica,
  Page03PerfilAmostra,
  Page04Presidencial,
  Page06Governo,
  Page09SwotFabio,
  Page10Senado1,
  Page12SenadoConsolidado,
  Page13MigracaoSenado,
  Page44Recomendacoes
} from "./CtasContentPages";
import {
  Page17Aracaju,
  Page32Comparativo,
  Page43ProjecaoHistorica
} from "./CtasRegionalPages";

export interface CtasExecutiveReportViewProps {
  activePoll?: Poll | null;
  rawRows?: any[];
  reportData?: any;
}

export const CtasExecutiveReportView: React.FC<CtasExecutiveReportViewProps> = ({
  activePoll: propActivePoll,
  rawRows: propRawRows,
  reportData: _propReportData
}) => {
  const { polls, selectedResearchId, setSelectedResearchId, getResearchBase } = useElectoralData();

  const [viewMode, setViewMode] = useState<"continuous" | "single">("continuous");
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedBriefing, setCopiedBriefing] = useState<boolean>(false);

  const reportContainerRef = useRef<HTMLDivElement>(null);

  // Determinar pesquisas válidas (eliminando qualquer resquício em branco)
  const validPolls = useMemo(() => polls.filter(isValidPoll), [polls]);

  // Determinar a pesquisa ativa (prioriza prop ou contexto)
  const currentPoll: Poll | null = useMemo(() => {
    if (propActivePoll && isValidPoll(propActivePoll)) return propActivePoll;
    if (selectedResearchId) {
      const found = validPolls.find((p) => p.id === selectedResearchId);
      if (found) return found;
    }
    return validPolls[0] || null;
  }, [propActivePoll, selectedResearchId, validPolls]);

  // Determinar os microdados da pesquisa ativa
  const currentRows: any[] = useMemo(() => {
    if (propRawRows && propRawRows.length > 0) return propRawRows;
    if (currentPoll) {
      const base = getResearchBase(currentPoll);
      if (base && base.length > 0) return base;
    }
    return [];
  }, [propRawRows, currentPoll, getResearchBase]);

  // Adaptador dinâmico: Constrói todos os dados do relatório CTAS a partir da base
  const dynamicData = useMemo(() => {
    return adaptPollToCtasReport(currentPoll, currentRows, validPolls);
  }, [currentPoll, currentRows, validPolls]);

  const currentPollMedianDate = useMemo(() => {
    return getPollMedianDateBR(currentPoll) || dynamicData.meta.date || "";
  }, [currentPoll, dynamicData.meta.date]);

  const currentPollInsertedDate = useMemo(() => {
    return getPollInsertedDateBR(currentPoll) || "";
  }, [currentPoll]);

  const currentPollInsertedDateFull = useMemo(() => {
    return getPollInsertedDateBR(currentPoll, true) || currentPollInsertedDate;
  }, [currentPoll, currentPollInsertedDate]);

  const govLeader = dynamicData.governo.kpis.leader;
  const govRunnerUp = dynamicData.governo.kpis.runnerUp;
  const senLeader = dynamicData.senado1.kpis.leader;
  const senRunnerUp = dynamicData.senado1.kpis.runnerUp;

  // Lista organizada de páginas com os dados 100% dinâmicos injetados
  const pagesList = useMemo(() => [
    { id: "capa", title: "Capa Oficial", comp: <CtasCoverPage data={dynamicData} /> },
    { id: "sumario", title: "Pág 02 · Sumário & Ficha Técnica", comp: <Page02SumarioFichaTecnica data={dynamicData} /> },
    { id: "perfil", title: "Pág 03 · 01 Perfil da Amostra", comp: <Page03PerfilAmostra data={dynamicData} /> },
    { id: "presidencial", title: "Pág 04 · 02 Cenário Presidencial", comp: <Page04Presidencial data={dynamicData} /> },
    { id: "governo", title: `Pág 06 · 03 Cenário Governo (${govLeader.name})`, comp: <Page06Governo data={dynamicData} /> },
    { id: "swot", title: `Pág 09 · 03.3 ${govLeader.name} (Governo) — SWOT`, comp: <Page09SwotFabio data={dynamicData} /> },
    { id: "senado1", title: "Pág 10 · 04.1 Senado — 1º Voto", comp: <Page10Senado1 data={dynamicData} /> },
    { id: "senadoConsolidado", title: "Pág 12 · 04.3 Senado — Consolidado (1º+2º)", comp: <Page12SenadoConsolidado data={dynamicData} /> },
    { id: "migracao", title: "Pág 13 · 04.4 Senado — Migração 2º Voto", comp: <Page13MigracaoSenado data={dynamicData} /> },
    { id: "aracaju", title: "Pág 17 · 05.1 Aracaju — Cenários & Deputados", comp: <Page17Aracaju data={dynamicData} /> },
    { id: "comparativo", title: "Pág 32 · 08 Comparativo Estadual × Tracking", comp: <Page32Comparativo data={dynamicData} /> },
    { id: "projecao", title: "Pág 43 · 09 Projeção Votos Válidos (TSE)", comp: <Page43ProjecaoHistorica data={dynamicData} /> },
    { id: "conclusao", title: "Pág 44 · 10 Recomendações Estratégicas", comp: <Page44Recomendacoes data={dynamicData} /> },
    { id: "contracapa", title: "Pág 45 · Contracapa Oficial", comp: <CtasBackcoverPage data={dynamicData} /> },
  ], [dynamicData, govLeader.name]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyBriefing = () => {
    const isFirstRound = govLeader.validPct >= 50.0;
    const briefingText = `📊 BRIEFING EXECUTIVO CTAS — ${dynamicData.meta.title.toUpperCase()}
${dynamicData.meta.institute} · ${dynamicData.meta.sampleSize} Entrevistas · Margem: ${dynamicData.meta.marginOfError} · Nível de Confiança: ${dynamicData.meta.confidenceLevel}
Data/Período: ${dynamicData.meta.date}

🏛️ CENÁRIO PRINCIPAL (GOVERNO / MAJORITÁRIO):
• Líder: ${govLeader.name} com ${govLeader.totalPct.toFixed(1)}% do total e ${govLeader.validPct.toFixed(1)}% dos votos válidos (${isFirstRound ? "vitória em 1º turno neste cenário" : "2º turno"}).
• 2º Colocado: ${govRunnerUp.name} com ${govRunnerUp.totalPct.toFixed(1)}% do total (${govRunnerUp.validPct.toFixed(1)}% válidos).
• Vantagem nos Válidos: ${dynamicData.governo.kpis.diffValid} (${dynamicData.governo.kpis.diffStatus}).
• Votos Indefinidos (Não sabe + Branco/Nulo): ${dynamicData.governo.kpis.undecidedInvalidPct.toFixed(1)}%.

🗳️ CENÁRIO SENADO (1º VOTO):
• ${senLeader.name} (${senLeader.validPct.toFixed(1)}% válidos) e ${senRunnerUp.name} (${senRunnerUp.validPct.toFixed(1)}% válidos) na disputa de liderança.
• Indecisos + Branco/Nulo no Senado: ${dynamicData.senado1.kpis.undecidedInvalidPct.toFixed(1)}%.

🎯 RECOMENDAÇÃO CTAS:
${dynamicData.recomendacoesFinais.recomendacaoCTAS}`;

    navigator.clipboard.writeText(briefingText);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-y-auto ctas-report-root">
      {/* Top Action Bar (no-print) */}
      <div className="no-print sticky top-0 z-50 bg-[#0f2d3a] text-white px-4 py-3 border-b border-cyan-950 flex flex-wrap items-center justify-between gap-3 shadow-md">
        
        {/* Identificação e Pesquisa Selecionada */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#134456] border border-cyan-400/30 flex items-center justify-center font-bold text-xs text-white shadow-xs">
            ctas.
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white">
                Relatório Oficial CTAS
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                100% FIEL À BASE
              </span>
            </div>
            <p className="text-[11px] text-cyan-200/70">
              {dynamicData.meta.title} · {dynamicData.meta.sampleSize} entrevistas · Margem {dynamicData.meta.marginOfError}
              {currentPollMedianDate && (
                <> · <span className="text-cyan-300 font-medium">Data: {currentPollMedianDate}</span></>
              )}
            </p>
          </div>
        </div>

        {/* Seletor Dinâmico de Base / Microdados */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-black/30 border border-cyan-400/25 rounded-lg px-2.5 py-1 text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-cyan-300 text-[11px] font-medium hidden sm:inline whitespace-nowrap">Base / Pesquisa:</span>
            <select
              id="ctas-official-poll-selector"
              value={currentPoll?.id || ""}
              onChange={(e) => setSelectedResearchId(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              title={
                currentPollMedianDate
                  ? `Base ativa: ${currentPoll?.institute || "CTAS"} • Data: ${currentPollMedianDate}. Clique para alternar.`
                  : "Alternar base de microdados para recalcular todo o Relatório Oficial CTAS dinamicamente"
              }
            >
              {validPolls.map((p) => {
                const pDate = getPollMedianDateBR(p);
                return (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.institute} • {(p as any).name || (p as any).location || p.description || "Pesquisa"} (N={p.sampleSize || ((p as any).rawRows?.length ?? "—")}){pDate ? ` • ${pDate}` : ""}
                  </option>
                );
              })}
            </select>
            {currentPollMedianDate && (
              <div
                className="hidden sm:flex items-center gap-1 pl-2 border-l border-cyan-500/30 text-[11px] text-cyan-200 shrink-0"
                title={`Data de realização da pesquisa: ${currentPollMedianDate}${currentPollInsertedDateFull ? ` (Inserida no sistema: ${currentPollInsertedDateFull})` : ""}`}
              >
                <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="text-cyan-300/80 font-normal">Data:</span>
                <strong className="font-semibold text-white font-mono">{currentPollMedianDate}</strong>
              </div>
            )}
          </div>

          {/* Seletor de Modo: Todas as Páginas vs Por Página */}
          <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              id="btn-mode-all-pages"
              onClick={() => setViewMode("continuous")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "continuous"
                  ? "bg-[#134456] text-white font-medium shadow-xs"
                  : "text-cyan-200/70 hover:text-white"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Todas as Páginas</span>
            </button>
            <button
              id="btn-mode-single-page"
              onClick={() => setViewMode("single")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "single"
                  ? "bg-[#134456] text-white font-medium shadow-xs"
                  : "text-cyan-200/70 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Por Página</span>
            </button>
          </div>

          {/* Quick Page Jump (seletor) */}
          <select
            value={currentPageIndex}
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              setCurrentPageIndex(idx);
              if (viewMode === "continuous") {
                const targetEl = document.getElementById(`ctas-page-${idx}`);
                if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
              }
            }}
            aria-label="Ir para página"
            className="bg-black/30 border border-white/15 text-white text-xs rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-cyan-400 outline-hidden"
          >
            {pagesList.map((p, idx) => (
              <option key={p.id} value={idx} className="bg-slate-900 text-white">
                {p.title}
              </option>
            ))}
          </select>

          {/* Zoom controls */}
          <div className="hidden lg:flex items-center bg-black/20 rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
              className="p-1 text-cyan-200/70 hover:text-white"
              title="Reduzir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono text-cyan-100">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
              className="p-1 text-cyan-200/70 hover:text-white"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copiar Briefing Estratégico Dinâmico */}
          <button
            onClick={handleCopyBriefing}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 text-cyan-100 border border-cyan-400/30 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            title="Copiar texto do briefing executivo formatado com os dados reais desta pesquisa para WhatsApp ou coordenação"
          >
            {copiedBriefing ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copiar Briefing</span>
              </>
            )}
          </button>

          {/* Imprimir / Salvar PDF */}
          <button
            id="btn-print-official-report"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Navegação de Página Única (quando ativo) */}
      {viewMode === "single" && (
        <div className="no-print bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-700 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageIndex((p) => Math.max(p - 1, 0))}
              disabled={currentPageIndex === 0}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium">
              Página {currentPageIndex + 1} de {pagesList.length} —{" "}
              <strong className="text-slate-900">{pagesList[currentPageIndex].title}</strong>
            </span>
            <button
              onClick={() => setCurrentPageIndex((p) => Math.min(p + 1, pagesList.length - 1))}
              disabled={currentPageIndex === pagesList.length - 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Formatado em Proporção A4 (210mm × 297mm)
          </div>
        </div>
      )}

      {/* Pages Canvas Area */}
      <div
        ref={reportContainerRef}
        className="flex-1 p-4 md:p-8 flex flex-col items-center gap-8 overflow-y-auto"
        style={{
          transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
          transformOrigin: "top center"
        }}
      >
        {viewMode === "continuous" ? (
          // Render All Pages sequentially with clear A4 separation
          pagesList.map((p, idx) => (
            <div key={p.id} id={`ctas-page-${idx}`} className="w-full flex justify-center">
              {p.comp}
            </div>
          ))
        ) : (
          // Render Single Page
          <div className="w-full flex justify-center">
            {pagesList[currentPageIndex].comp}
          </div>
        )}
      </div>
    </div>
  );
};

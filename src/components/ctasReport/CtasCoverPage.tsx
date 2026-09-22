import React from "react";
import { CTAS_TRACKING_ONDA1 } from "../../data/ctasExecutiveReportData";
import { CtasReportDataType } from "../../utils/ctasDataAdapter";

export const CtasCoverPage: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { meta } = data;

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-[#134456] text-white p-16 flex flex-col justify-between relative overflow-hidden font-sans select-none box-border shadow-2xl mx-auto">
      {/* Background Decorative Diagonal Stripes (Very Subtle) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Header Logo */}
      <div className="flex items-center gap-3 relative z-10 pt-4">
        <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg shadow-inner">
          ctas.
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-white font-sans">ctas.</span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-cyan-200 font-semibold">
            CONSULTORIA & PESQUISA
          </span>
        </div>
      </div>

      {/* Center Main Content */}
      <div className="relative z-10 my-auto py-8">
        {/* Edition Track Eyebrow */}
        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-cyan-300/90 mb-4 font-mono">
          {meta.edition}
        </div>

        {/* Serif Hero Title */}
        <h1 className="text-5xl font-serif font-bold text-white tracking-tight leading-[1.1] mb-6">
          Tracking Eleitoral <br />
          <span className="font-serif italic font-normal text-cyan-100">Grande Aracaju</span>
        </h1>

        {/* Subtitle / Scope Description */}
        <p className="text-sm text-cyan-100/80 max-w-xl leading-relaxed font-light mb-12">
          {meta.subtitle}
        </p>

        {/* 6 Key Metrics Grid (Exact Replica of Cover) */}
        <div className="grid grid-cols-4 gap-6 pt-8 border-t border-cyan-500/20">
          <div className="border-l-2 border-cyan-400/60 pl-3">
            <div className="text-2xl font-bold text-white font-mono">
              {meta.sampleSize}
            </div>
            <div className="text-[8px] uppercase tracking-wider text-cyan-200/80 font-medium mt-1 leading-tight">
              ENTREVISTAS VÁLIDAS
            </div>
          </div>

          <div className="border-l-2 border-cyan-400/60 pl-3">
            <div className="text-2xl font-bold text-white font-mono">
              {meta.marginOfError}
            </div>
            <div className="text-[8px] uppercase tracking-wider text-cyan-200/80 font-medium mt-1 leading-tight">
              MARGEM DE ERRO ({meta.confidenceLevel} CONF.)
            </div>
          </div>

          <div className="border-l-2 border-cyan-400/60 pl-3">
            <div className="text-2xl font-bold text-white font-mono">
              {meta.municipalitiesCount}
            </div>
            <div className="text-[8px] uppercase tracking-wider text-cyan-200/80 font-medium mt-1 leading-tight">
              MUNICÍPIOS PESQUISADOS
            </div>
          </div>

          <div className="border-l-2 border-cyan-400/60 pl-3">
            <div className="text-2xl font-bold text-white font-mono">
              {meta.electoralScenariosCount}
            </div>
            <div className="text-[8px] uppercase tracking-wider text-cyan-200/80 font-medium mt-1 leading-tight">
              CENÁRIOS ELEITORAIS
            </div>
          </div>

          <div className="border-l-2 border-cyan-400/60 pl-3">
            <div className="text-2xl font-bold text-white font-mono">
              {meta.date}
            </div>
            <div className="text-[8px] uppercase tracking-wider text-cyan-200/80 font-medium mt-1 leading-tight">
              DATA DA PESQUISA
            </div>
          </div>

          <div className="border-l-2 border-cyan-400/60 pl-3 col-span-2">
            <div className="text-2xl font-bold text-white font-mono">
              {meta.fieldworkHours}
            </div>
            <div className="text-[8px] uppercase tracking-wider text-cyan-200/80 font-medium mt-1 leading-tight">
              PERÍODO DE CAMPO
            </div>
          </div>

          <div className="border-l-2 border-cyan-400/60 pl-3">
            <div className="text-2xl font-bold text-white font-mono">
              {meta.stateComparisonBase}
            </div>
            <div className="text-[8px] uppercase tracking-wider text-cyan-200/80 font-medium mt-1 leading-tight">
              BASE ESTADUAL DE COMPARAÇÃO
            </div>
          </div>
        </div>
      </div>

      {/* Cover Bottom Footer */}
      <div className="relative z-10 pt-6 border-t border-cyan-500/20 flex items-center justify-between text-[9px] text-cyan-200/70 font-sans">
        <div>
          {meta.institute} · {meta.methodologyNotes}
        </div>
        <div className="font-medium text-cyan-100 font-mono">
          {meta.monthYear}
        </div>
      </div>
    </div>
  );
};

export const CtasBackcoverPage: React.FC<{ data?: typeof CTAS_TRACKING_ONDA1 }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const meta = data.meta;
  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-[#134456] text-white p-16 flex flex-col items-center justify-center relative overflow-hidden font-sans select-none box-border shadow-2xl mx-auto text-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center text-white font-bold text-3xl shadow-2xl mb-6">
          ctas.
        </div>
        
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          {meta.institute || "ctas."}
        </h2>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200 font-semibold mb-10">
          CONSULTORIA & PESQUISA
        </p>

        <div className="w-16 h-0.5 bg-cyan-400/40 mb-10 mx-auto" />

        <p className="text-[10px] text-cyan-100/70 leading-relaxed font-light">
          Este relatório é de uso reservado. A reprodução total ou parcial sem autorização da {meta.institute || "CTAS Consultoria & Pesquisa"} é vedada.
        </p>
        <p className="text-[9px] font-mono text-cyan-300/50 mt-4">
          Sistema Especialista de Inteligência Eleitoral • SEIE
        </p>
      </div>
    </div>
  );
};

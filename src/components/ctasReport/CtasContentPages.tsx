import React from "react";
import { CtasHeader, CtasFooter } from "./CtasHeaderFooter";
import { CTAS_TRACKING_ONDA1 } from "../../data/ctasExecutiveReportData";
import { CtasReportDataType } from "../../utils/ctasDataAdapter";

// =========================================================================
// PÁGINA 02: SUMÁRIO & FICHA TÉCNICA
// =========================================================================
export const Page02SumarioFichaTecnica: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { fichaTecnica } = data;

  const sumarioItems = [
    { num: "01", title: "Ficha técnica e metodologia", page: "02" },
    { num: "02", title: "Perfil da amostra", page: "03" },
    { num: "03", title: "Cenário Presidencial", page: "04" },
    { num: "04", title: "Presidencial — leitura por segmento", page: "05" },
    { num: "05", title: "Cenário Governo de Sergipe", page: "06" },
    { num: "06", title: "Governo — leitura por segmento", page: "07" },
    { num: "07", title: "Fábio (Governo) — coalizão e efeito presidencial", page: "08" },
    { num: "08", title: "Fábio (Governo) — coalizão com Senado e SWOT", page: "09" },
    { num: "09", title: "Senado — 1º voto (estimulado e válidos)", page: "10" },
    { num: "10", title: "Senado — 2º voto (estimulado e válidos)", page: "11" },
    { num: "11", title: "Senado — consolidado (1º + 2º voto)", page: "12" },
    { num: "12", title: "Senado — migração do 2º voto", page: "13" },
    { num: "13", title: "Governo × Senado (1º voto e consolidado)", page: "14" },
    { num: "14", title: "Presidente × Senado (1º voto e consolidado)", page: "15" },
    { num: "15", title: "Senado por município (1º, 2º e consolidado)", page: "16" },
    { num: "16", title: "Aracaju — cenários, cruzamentos e deputados", page: "17–19" },
    { num: "17", title: "Nossa Senhora do Socorro — cenários, cruzamentos e deputados", page: "20–22" },
    { num: "18", title: "São Cristóvão — cenários, cruzamentos e deputados", page: "23–25" },
    { num: "19", title: "Barra dos Coqueiros — cenários, cruzamentos e deputados", page: "26–28" },
    { num: "20", title: "Deputado Estadual e Deputado Federal", page: "29" },
    { num: "21", title: "Deputados — leitura por município", page: "30" },
    { num: "22", title: "Leitura regional — Presidente e Governo por município", page: "31" },
    { num: "23", title: "Comparativo estadual × Onda 1 — consolidado", page: "32–33" },
    { num: "24", title: "Comparativo por município", page: "34–41" },
    { num: "25", title: "Projeção — metodologia histórica", page: "42" },
    { num: "26", title: "Projeção de votos válidos — Governo e Senado", page: "43" },
    { num: "27", title: "Análise estratégica e recomendações", page: "44" },
  ];

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionTitle="SUMÁRIO & FICHA TÉCNICA" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* Sumário */}
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 mb-3 tracking-tight">
            Sumário
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[9px]">
            {sumarioItems.map((item) => (
              <div key={item.num} className="flex items-center justify-between border-b border-slate-100 py-0.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                  <span className="font-mono font-bold text-[#134456] shrink-0">{item.num}</span>
                  <span className="text-slate-700 leading-snug">{item.title}</span>
                </div>
                <span className="font-mono text-slate-400 shrink-0 ml-2">{item.page}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ficha Técnica */}
        <div className="mt-4">
          <h2 className="text-xl font-bold font-serif text-slate-900 mb-2 tracking-tight">
            Ficha Técnica
          </h2>
          <div className="border border-slate-200 rounded-sm overflow-hidden text-[9px]">
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <td className="py-1 px-3 font-semibold text-slate-800 w-1/4">Contratante / execução</td>
                  <td className="py-1 px-3 text-slate-700">{fichaTecnica.contratante}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 px-3 font-semibold text-slate-800">Âmbito geográfico</td>
                  <td className="py-1 px-3 text-slate-700">{fichaTecnica.ambito}</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <td className="py-1 px-3 font-semibold text-slate-800">Universo</td>
                  <td className="py-1 px-3 text-slate-700">{fichaTecnica.universo}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 px-3 font-semibold text-slate-800">Amostra</td>
                  <td className="py-1 px-3 text-slate-700">{fichaTecnica.amostraDetalhe}</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <td className="py-1 px-3 font-semibold text-slate-800">Margem de erro</td>
                  <td className="py-1 px-3 text-slate-700">{fichaTecnica.margemErro}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 px-3 font-semibold text-slate-800">Período de campo</td>
                  <td className="py-1 px-3 text-slate-700">{fichaTecnica.periodoCampo}</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <td className="py-1 px-3 font-semibold text-slate-800">Técnica</td>
                  <td className="py-1 px-3 text-slate-700">{fichaTecnica.tecnica}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 px-3 font-semibold text-slate-800">Base de comparação</td>
                  <td className="py-1 px-3 text-slate-700">{fichaTecnica.baseComparacao}</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <td className="py-1 px-3 font-semibold text-slate-800">Data da pesquisa</td>
                  <td className="py-1 px-3 text-slate-700 font-mono font-medium">
                    {data.meta.date || (data.meta as any).medianDate || "—"}
                  </td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="py-1 px-3 font-semibold text-slate-800">Tracking</td>
                  <td className="py-1 px-3 text-slate-700">{fichaTecnica.trackingRegra}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Nota Metodológica Box */}
          <div className="mt-3 p-3 bg-slate-50 border-l-3 border-[#134456] rounded-r text-[8.5px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Nota metodológica.</strong> {fichaTecnica.notaMetodologica}
          </div>
        </div>
      </div>

      <CtasFooter pageNumber={2} />
    </div>
  );
};

// =========================================================================
// PÁGINA 03: 01 PERFIL DA AMOSTRA
// =========================================================================
export const Page03PerfilAmostra: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { perfilAmostra } = data;

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="01" sectionTitle="PERFIL DA AMOSTRA" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            <span className="text-amber-500 mr-2 font-mono text-xl">01</span>
            Perfil da Amostra
          </h2>
          <p className="text-[9.5px] text-slate-500 mt-1 mb-6 max-w-2xl leading-relaxed">
            Distribuição dos 1022 entrevistados por sexo, faixa etária, renda familiar e escolaridade, base para a leitura cruzada dos cenários eleitorais nas próximas seções.
          </p>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6">
            {/* Sexo */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                Sexo
              </h3>
              <div className="space-y-1.5 text-[9px]">
                {perfilAmostra.sexo.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-700 flex-1 pr-2 leading-tight">{item.label}</span>
                    <div className="w-28 sm:w-36 h-3 bg-slate-100 rounded-sm overflow-hidden shrink-0 mx-2">
                      <div className="h-full bg-[#134456]" style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="font-mono text-slate-800 w-20 text-right shrink-0">{item.pct}% ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Faixa Etária */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                Faixa etária
              </h3>
              <div className="space-y-1 text-[9px]">
                {perfilAmostra.faixaEtaria.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-700 flex-1 pr-2 leading-tight">{item.label}</span>
                    <div className="w-24 sm:w-32 h-2 bg-slate-100 rounded-sm overflow-hidden shrink-0 mx-2">
                      <div className="h-full bg-[#134456]" style={{ width: `${Math.min(item.pct * 2.5, 100)}%` }} />
                    </div>
                    <span className="font-mono text-slate-800 w-16 text-right shrink-0">{item.pct}% ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Renda Familiar */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                Renda familiar
              </h3>
              <div className="space-y-1.5 text-[9px]">
                {perfilAmostra.renda.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-700 flex-1 pr-2 leading-tight">{item.label}</span>
                    <div className="w-24 sm:w-32 h-2.5 bg-slate-100 rounded-sm overflow-hidden shrink-0 mx-2">
                      <div className="h-full bg-[#134456]" style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="font-mono text-slate-800 w-20 text-right shrink-0">{item.pct}% ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Escolaridade */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                Escolaridade
              </h3>
              <div className="space-y-1 text-[9px]">
                {perfilAmostra.escolaridade.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-700 flex-1 pr-2 leading-tight">{item.label}</span>
                    <div className="w-24 sm:w-32 h-2 bg-slate-100 rounded-sm overflow-hidden shrink-0 mx-2">
                      <div className="h-full bg-[#134456]" style={{ width: `${Math.min(item.pct * 2, 100)}%` }} />
                    </div>
                    <span className="font-mono text-slate-800 w-16 text-right shrink-0">{item.pct}% ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leitura do perfil Box */}
        <div className="p-4 bg-slate-50 border-l-4 border-amber-500 rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Leitura do perfil.</strong> {perfilAmostra.leitura}
        </div>
      </div>

      <CtasFooter pageNumber={3} />
    </div>
  );
};

// =========================================================================
// PÁGINA 04: 02 CENÁRIO PRESIDENCIAL 2026
// =========================================================================
export const Page04Presidencial: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { presidencial } = data;
  const { kpis, ranking, leitura } = presidencial;

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="02" sectionTitle="CENÁRIO PRESIDENCIAL" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            <span className="text-amber-500 mr-2 font-mono text-xl">02</span>
            Cenário Presidencial 2026
          </h2>
          <p className="text-[9.5px] text-slate-500 mt-1 mb-4">
            Pergunta estimulada: "Se a eleição para Presidente do Brasil fosse hoje, em qual candidato(a) votaria?". Resultados ordenados de forma decrescente.
          </p>

          {/* 4 KPI Top Cards */}
          <div className="kpi-cards-grid indicadores-row mb-5">
            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                LÍDER (VOTOS VÁLIDOS)
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric nome-candidato text-xl font-bold text-slate-900 font-serif">
                  {kpis.leader.name}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.leader.totalPct}% do total · <strong className="text-slate-900">{kpis.leader.validPct}% dos válidos</strong>
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                2º COLOCADO (VOTOS VÁLIDOS)
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric nome-candidato text-xl font-bold text-slate-900 font-serif">
                  {kpis.runnerUp.name}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.runnerUp.totalPct}% do total · <strong className="text-slate-900">{kpis.runnerUp.validPct}% dos válidos</strong>
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                VANTAGEM S/ VÁLIDOS
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric text-xl font-bold text-slate-900 font-mono">
                  {kpis.diffValid}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.diffStatus}
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                INDECISOS + BRANCO/NULO
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric text-xl font-bold text-slate-900 font-mono">
                  {kpis.undecidedInvalidPct}%
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.validVotesCount} votos válidos de {kpis.totalVotesCount} entrevistas
              </div>
            </div>
          </div>

          {/* Gráfico de Barras Horizontais Simplificado */}
          <div className="space-y-1.5 mb-5 bg-slate-50/50 p-3 rounded border border-slate-100">
            {ranking.slice(0, 7).map((c) => (
              <div key={c.name} className="flex items-center text-[8.5px]">
                <span className="w-5 text-slate-400 font-mono shrink-0">{c.rank}</span>
                <span className="w-48 font-medium text-slate-700 leading-tight shrink-0 whitespace-normal break-words">{c.name}</span>
                <div className="flex-1 mx-3 h-3 bg-slate-200/80 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${c.totalPct * 1.8}%`,
                      backgroundColor: c.color || "#134456"
                    }}
                  />
                </div>
                <span className="w-12 text-right font-mono font-bold text-slate-800 shrink-0">
                  {c.totalPct}%
                </span>
              </div>
            ))}
          </div>

          {/* Tabela de Dados Completa */}
          <div className="border border-slate-200 rounded overflow-hidden text-[8.5px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#134456] text-white font-medium">
                  <th className="py-1 px-2 text-center w-8">#</th>
                  <th className="py-1 px-3">CANDIDATO(A)</th>
                  <th className="py-1 px-3 text-center">MENÇÕES</th>
                  <th className="py-1 px-3 text-right">% S/ TOTAL</th>
                  <th className="py-1 px-3 text-right">% S/ VÁLIDOS</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, idx) => (
                  <tr
                    key={row.name}
                    className={`border-b border-slate-100 ${
                      row.isInvalid ? "text-slate-400 italic bg-slate-50/40" : "text-slate-700"
                    } ${idx % 2 === 1 ? "bg-slate-50/20" : ""}`}
                  >
                    <td className="py-1 px-2 text-center font-mono text-slate-400">{row.rank}</td>
                    <td className="py-1 px-3 font-medium text-slate-800">{row.name}</td>
                    <td className="py-1 px-3 text-center font-mono">{row.votes}</td>
                    <td className="py-1 px-3 text-right font-mono font-semibold">{row.totalPct.toFixed(1)}%</td>
                    <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                      {row.validPct !== null ? `${row.validPct.toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100/80 font-bold text-slate-900 border-t border-slate-300">
                  <td colSpan={2} className="py-1 px-3">Total</td>
                  <td className="py-1 px-3 text-center font-mono">{kpis.totalVotesCount}</td>
                  <td className="py-1 px-3 text-right font-mono">100,0%</td>
                  <td className="py-1 px-3 text-right font-mono">100,0% ({kpis.validVotesCount})</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Leitura estratégica Box */}
        <div className="p-3 bg-slate-50 border-l-4 border-amber-500 rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Leitura estratégica.</strong> {leitura}
        </div>
      </div>

      <CtasFooter pageNumber={4} />
    </div>
  );
};

// =========================================================================
// PÁGINA 06: 03 CENÁRIO GOVERNO DE SERGIPE
// =========================================================================
export const Page06Governo: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { governo } = data;
  const { kpis, ranking, leitura } = governo;

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="03" sectionTitle="CENÁRIO GOVERNO DE SERGIPE" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            <span className="text-amber-500 mr-2 font-mono text-xl">03</span>
            Cenário Governo de Sergipe
          </h2>
          <p className="text-[9.5px] text-slate-500 mt-1 mb-4">
            Pergunta estimulada: "Se a eleição para o Governo de Sergipe fosse hoje, em qual candidato(a) votaria?". Resultados ordenados de forma decrescente.
          </p>

          {/* 4 KPI Top Cards */}
          <div className="kpi-cards-grid indicadores-row mb-5">
            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                LÍDER (VOTOS VÁLIDOS)
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric nome-candidato text-xl font-bold text-slate-900 font-serif">
                  {kpis.leader.name}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.leader.totalPct}% do total · <strong className="text-slate-900">{kpis.leader.validPct}% dos válidos</strong>
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                2º COLOCADO (VOTOS VÁLIDOS)
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric nome-candidato text-xl font-bold text-slate-900 font-serif">
                  {kpis.runnerUp.name}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.runnerUp.totalPct}% do total · <strong className="text-slate-900">{kpis.runnerUp.validPct}% dos válidos</strong>
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                VANTAGEM S/ VÁLIDOS
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric text-xl font-bold text-slate-900 font-mono">
                  {kpis.diffValid}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.diffStatus}
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                INDECISOS + BRANCO/NULO
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric text-xl font-bold text-slate-900 font-mono">
                  {kpis.undecidedInvalidPct}%
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.validVotesCount} votos válidos de {kpis.totalVotesCount} entrevistas
              </div>
            </div>
          </div>

          {/* Gráfico de Barras Horizontais */}
          <div className="space-y-1.5 mb-5 bg-slate-50/50 p-3 rounded border border-slate-100">
            {ranking.slice(0, 6).map((c) => (
              <div key={c.name} className="flex items-center text-[8.5px]">
                <span className="w-5 text-slate-400 font-mono shrink-0">{c.rank}</span>
                <span className="w-48 font-medium text-slate-700 leading-tight shrink-0 whitespace-normal break-words">{c.name}</span>
                <div className="flex-1 mx-3 h-3 bg-slate-200/80 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${c.totalPct * 2.2}%`,
                      backgroundColor: c.color || "#0284c7"
                    }}
                  />
                </div>
                <span className="w-12 text-right font-mono font-bold text-slate-800 shrink-0">
                  {c.totalPct}%
                </span>
              </div>
            ))}
          </div>

          {/* Tabela de Dados Completa */}
          <div className="border border-slate-200 rounded overflow-hidden text-[8.5px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#134456] text-white font-medium">
                  <th className="py-1 px-2 text-center w-8">#</th>
                  <th className="py-1 px-3">CANDIDATO(A)</th>
                  <th className="py-1 px-3 text-center">MENÇÕES</th>
                  <th className="py-1 px-3 text-right">% S/ TOTAL</th>
                  <th className="py-1 px-3 text-right">% S/ VÁLIDOS</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, idx) => (
                  <tr
                    key={row.name}
                    className={`border-b border-slate-100 ${
                      row.isInvalid ? "text-slate-400 italic bg-slate-50/40" : "text-slate-700"
                    } ${idx % 2 === 1 ? "bg-slate-50/20" : ""}`}
                  >
                    <td className="py-1 px-2 text-center font-mono text-slate-400">{row.rank}</td>
                    <td className="py-1 px-3 font-medium text-slate-800">{row.name}</td>
                    <td className="py-1 px-3 text-center font-mono">{row.votes}</td>
                    <td className="py-1 px-3 text-right font-mono font-semibold">{row.totalPct.toFixed(1)}%</td>
                    <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                      {row.validPct !== null ? `${row.validPct.toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100/80 font-bold text-slate-900 border-t border-slate-300">
                  <td colSpan={2} className="py-1 px-3">Total</td>
                  <td className="py-1 px-3 text-center font-mono">{kpis.totalVotesCount}</td>
                  <td className="py-1 px-3 text-right font-mono">100,0%</td>
                  <td className="py-1 px-3 text-right font-mono">100,0% ({kpis.validVotesCount})</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Leitura estratégica Box */}
        <div className="p-3 bg-slate-50 border-l-4 border-amber-500 rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Leitura estratégica.</strong> {leitura}
        </div>
      </div>

      <CtasFooter pageNumber={6} />
    </div>
  );
};

// =========================================================================
// PÁGINA 09: 03.3 FÁBIO (GOVERNO) — COALIZÃO COM O SENADO E SWOT
// =========================================================================
export const Page09SwotFabio: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { swotFabio, governo } = data;
  const leaderName = governo?.kpis?.leader?.name || "Fábio";

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="03" sectionTitle="FÁBIO — ANÁLISE ESTRATÉGICA" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            <span className="text-amber-500 mr-2 font-mono text-xl">03.3</span>
            {leaderName} (Governo) — Análise Estratégica e SWOT
          </h2>
          <p className="text-[9.5px] text-slate-500 mt-1 mb-4">
            Quais pré-candidaturas ao Senado compartilham base eleitoral com Fábio e com Valmir, seguido de síntese SWOT.
          </p>

          {/* Matriz SWOT 4 Quadrantes */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Forças */}
            <div className="p-3 rounded border border-emerald-200 bg-emerald-50/50">
              <h3 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Forças
              </h3>
              <ul className="space-y-1 text-[8.5px] text-emerald-950 list-disc list-inside leading-snug">
                {swotFabio.forcas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            {/* Fraquezas */}
            <div className="p-3 rounded border border-rose-200 bg-rose-50/50">
              <h3 className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Fraquezas
              </h3>
              <ul className="space-y-1 text-[8.5px] text-rose-950 list-disc list-inside leading-snug">
                {swotFabio.fraquezas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            {/* Oportunidades */}
            <div className="p-3 rounded border border-sky-200 bg-sky-50/50">
              <h3 className="text-xs font-bold text-sky-800 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Oportunidades
              </h3>
              <ul className="space-y-1 text-[8.5px] text-sky-950 list-disc list-inside leading-snug">
                {swotFabio.oportunidades.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            {/* Ameaças */}
            <div className="p-3 rounded border border-amber-200 bg-amber-50/50">
              <h3 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Ameaças
              </h3>
              <ul className="space-y-1 text-[8.5px] text-amber-950 list-disc list-inside leading-snug">
                {swotFabio.ameacas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recomendação CTAS Box */}
        <div className="p-3 bg-slate-50 border-l-4 border-[#134456] rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Recomendação CTAS.</strong> {swotFabio.recomendacao}
        </div>
      </div>

      <CtasFooter pageNumber={9} />
    </div>
  );
};

// =========================================================================
// PÁGINA 10: 04.1 SENADO — 1º VOTO
// =========================================================================
export const Page10Senado1: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { senado1 } = data;
  const { kpis, ranking, leitura } = senado1;

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="04" sectionTitle="CENÁRIO SENADO — 1º VOTO" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            <span className="text-amber-500 mr-2 font-mono text-xl">04.1</span>
            Senado — 1º Voto
          </h2>
          <p className="text-[9.5px] text-slate-500 mt-1 mb-4">
            Pergunta estimulada: "Para senador, o(a) senhor(a) deve escolher dois nomes diferentes: qual seria seu 1º voto?". Resultados ordenados de forma decrescente.
          </p>

          {/* 4 KPI Top Cards */}
          <div className="kpi-cards-grid indicadores-row mb-5">
            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                LÍDER (VOTOS VÁLIDOS)
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric nome-candidato text-xl font-bold text-slate-900 font-serif">
                  {kpis.leader.name}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.leader.totalPct}% do total · <strong className="text-slate-900">{kpis.leader.validPct}% dos válidos</strong>
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                2º COLOCADO (VOTOS VÁLIDOS)
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric nome-candidato text-xl font-bold text-slate-900 font-serif">
                  {kpis.runnerUp.name}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.runnerUp.totalPct}% do total · <strong className="text-slate-900">{kpis.runnerUp.validPct}% dos válidos</strong>
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                VANTAGEM S/ VÁLIDOS
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric text-xl font-bold text-slate-900 font-mono">
                  {kpis.diffValid}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.diffStatus}
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                INDECISOS + BRANCO/NULO
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric text-xl font-bold text-slate-900 font-mono">
                  {kpis.undecidedInvalidPct}%
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.validVotesCount} votos válidos de {kpis.totalVotesCount} entrevistas
              </div>
            </div>
          </div>

          {/* Tabela de Dados Completa */}
          <div className="border border-slate-200 rounded overflow-hidden text-[8.5px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#134456] text-white font-medium">
                  <th className="py-1 px-2 text-center w-8">#</th>
                  <th className="py-1 px-3">CANDIDATO(A)</th>
                  <th className="py-1 px-3 text-center">MENÇÕES</th>
                  <th className="py-1 px-3 text-right">% S/ TOTAL</th>
                  <th className="py-1 px-3 text-right">% S/ VÁLIDOS</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, idx) => (
                  <tr
                    key={row.name}
                    className={`border-b border-slate-100 ${
                      row.isInvalid ? "text-slate-400 italic bg-slate-50/40" : "text-slate-700"
                    } ${idx % 2 === 1 ? "bg-slate-50/20" : ""}`}
                  >
                    <td className="py-1 px-2 text-center font-mono text-slate-400">{row.rank}</td>
                    <td className="py-1 px-3 font-medium text-slate-800">{row.name}</td>
                    <td className="py-1 px-3 text-center font-mono">{row.votes}</td>
                    <td className="py-1 px-3 text-right font-mono font-semibold">{row.totalPct.toFixed(1)}%</td>
                    <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                      {row.validPct !== null ? `${row.validPct.toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leitura estratégica Box */}
        <div className="p-3 bg-slate-50 border-l-4 border-amber-500 rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Leitura estratégica.</strong> {leitura}
        </div>
      </div>

      <CtasFooter pageNumber={10} />
    </div>
  );
};

// =========================================================================
// PÁGINA 12: 04.3 SENADO — VOTO CONSOLIDADO (1º + 2º)
// =========================================================================
export const Page12SenadoConsolidado: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { senadoConsolidado } = data;
  const { kpis, ranking, leitura } = senadoConsolidado;

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="04" sectionTitle="CENÁRIO SENADO — CONSOLIDADO" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            <span className="text-amber-500 mr-2 font-mono text-xl">04.3</span>
            Senado — Voto Consolidado (1º + 2º)
          </h2>
          <p className="text-[9.5px] text-slate-500 mt-1 mb-4">
            Soma das menções de cada candidato(a) no 1º e no 2º voto. A base "estimulado" considera as menções possíveis (2 × 1022 = 2044). A coluna "% eleitores" indica a parcela do eleitorado que cita o nome em qualquer dos dois votos.
          </p>

          {/* 4 KPI Top Cards */}
          <div className="kpi-cards-grid indicadores-row mb-5">
            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                LÍDER — % VÁLIDOS
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric nome-candidato text-xl font-bold text-slate-900 font-serif">
                  {kpis.leader}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.leaderValidPct} das menções válidas
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                2º COLOCADO
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric nome-candidato text-xl font-bold text-slate-900 font-serif">
                  {kpis.runnerUp}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.runnerUpValidPct} das menções válidas
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                ALCANCE DO LÍDER
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric text-xl font-bold text-slate-900 font-mono">
                  {kpis.reachLeader}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                {kpis.reachText}
              </div>
            </div>

            <div className="kpi-card indicador-item bg-slate-50 border border-slate-200 rounded-md">
              <div className="kpi-card-header kpi-label text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                BASE DE VOTOS VÁLIDOS
              </div>
              <div className="kpi-card-body kpi-value-name">
                <div className="kpi-main-metric text-xl font-bold text-slate-900 font-mono">
                  {kpis.validMentions}
                </div>
              </div>
              <div className="kpi-card-footer kpi-supporting-text text-[8.5px] text-slate-600 mt-0.5">
                menções válidas de {kpis.totalPossibleMentions} possíveis
              </div>
            </div>
          </div>

          {/* Tabela de Consolidado */}
          <div className="border border-slate-200 rounded overflow-hidden text-[8.5px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#134456] text-white font-medium">
                  <th className="py-1 px-2 text-center w-8">#</th>
                  <th className="py-1 px-3">CANDIDATO(A)</th>
                  <th className="py-1 px-3 text-center">MENÇÕES (1º+2º)</th>
                  <th className="py-1 px-3 text-right">% S/ TOTAL</th>
                  <th className="py-1 px-3 text-right">% ELEITORES</th>
                  <th className="py-1 px-3 text-right">% S/ VÁLIDOS</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, idx) => (
                  <tr
                    key={row.name}
                    className={`border-b border-slate-100 ${
                      row.isInvalid ? "text-slate-400 italic bg-slate-50/40" : "text-slate-700"
                    } ${idx % 2 === 1 ? "bg-slate-50/20" : ""}`}
                  >
                    <td className="py-1 px-2 text-center font-mono text-slate-400">{row.rank}</td>
                    <td className="py-1 px-3 font-medium text-slate-800">{row.name}</td>
                    <td className="py-1 px-3 text-center font-mono">{row.votes}</td>
                    <td className="py-1 px-3 text-right font-mono font-semibold">{row.totalPct.toFixed(1)}%</td>
                    <td className="py-1 px-3 text-right font-mono font-semibold">
                      {row.electorPct !== null ? `${row.electorPct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                      {row.validPct !== null ? `${row.validPct.toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leitura estratégica Box */}
        <div className="p-3 bg-slate-50 border-l-4 border-amber-500 rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Leitura estratégica.</strong> {leitura}
        </div>
      </div>

      <CtasFooter pageNumber={12} />
    </div>
  );
};

// =========================================================================
// PÁGINA 13: 04.4 SENADO — PARA ONDE MIGRA O 2º VOTO
// =========================================================================
export const Page13MigracaoSenado: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { migracaoSenado } = data;
  const { headers, rows, leitura } = migracaoSenado;

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="04" sectionTitle="SENADO — MIGRAÇÃO DO 2º VOTO" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            <span className="text-amber-500 mr-2 font-mono text-xl">04.4</span>
            Senado — Para Onde Migra o 2º Voto
          </h2>
          <p className="text-[9.5px] text-slate-500 mt-1 mb-4">
            Para cada candidato(a) citado(a) em 1º lugar, a distribuição do 2º voto de seus eleitores. Leitura por linha (cada linha soma 100%); em destaque, o nome que mais recebe o 2º voto.
          </p>

          {/* Matriz Completa de Migração */}
          <div className="border border-slate-200 rounded overflow-x-auto text-[7.5px] mb-4">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#134456] text-white font-medium">
                  <th className="py-1 px-2 text-left w-24">1º VOTO ↓ / 2º VOTO →</th>
                  {headers.map((h) => (
                    <th key={h} className="py-1 px-1 text-center font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.name} className={`border-b border-slate-100 ${idx % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                    <td className="py-1 px-2 text-left font-semibold text-slate-800">{r.name}</td>
                    {r.values.map((v, i) => (
                      <td key={i} className={`py-1 px-1 font-mono ${v !== null && v > 20 ? "font-bold text-blue-900 bg-blue-50" : "text-slate-600"}`}>
                        {v !== null ? `${v.toFixed(1)}%` : "—"}
                      </td>
                    ))}
                    <td className="py-1 px-1 font-mono font-bold text-slate-900">{r.base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards de Destaque por Candidato */}
          <div className="grid grid-cols-3 gap-2.5 mb-2 text-[8px]">
            {rows.slice(0, 6).map((r) => (
              <div key={r.name} className="p-2 border border-slate-200 rounded bg-slate-50/70">
                <div className="font-bold text-slate-900 leading-tight whitespace-normal break-words">{r.name}</div>
                <div className="text-slate-500 mt-0.5">Base: {r.base} eleitores (1º voto)</div>
                <div className="text-slate-700 mt-1 font-medium">
                  Principal 2º voto: <strong className="text-blue-900">{r.primaryTarget}</strong>
                </div>
                <div className="text-slate-500">Não define 2º voto: {r.undefPct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leitura estratégica Box */}
        <div className="p-3 bg-slate-50 border-l-4 border-amber-500 rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Leitura estratégica.</strong> {leitura}
        </div>
      </div>

      <CtasFooter pageNumber={13} />
    </div>
  );
};

// =========================================================================
// PÁGINA 44: 10 ANÁLISE ESTRATÉGICA E RECOMENDAÇÕES FINAIS
// =========================================================================
export const Page44Recomendacoes: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { recomendacoesFinais } = data;
  const { presidencial, governo, senado, swotGeral, recomendacaoCTAS } = recomendacoesFinais;

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="10" sectionTitle="ANÁLISE ESTRATÉGICA" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            <span className="text-amber-500 mr-2 font-mono text-xl">10</span>
            Análise Estratégica e Recomendações
          </h2>
          <p className="text-[9.5px] text-slate-500 mt-1 mb-4">
            Síntese dos cenários, dos cruzamentos e do comparativo com a estadual de setembro.
          </p>

          {/* 3 Blocos de Síntese Superior */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded border border-slate-200 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 mb-1.5 border-b border-slate-200 pb-1">
                Presidencial
              </h3>
              <ul className="space-y-1 text-[8px] text-slate-700 list-disc list-inside leading-snug">
                {presidencial.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded border border-slate-200 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 mb-1.5 border-b border-slate-200 pb-1">
                Governo
              </h3>
              <ul className="space-y-1 text-[8px] text-slate-700 list-disc list-inside leading-snug">
                {governo.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded border border-slate-200 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 mb-1.5 border-b border-slate-200 pb-1">
                Senado
              </h3>
              <ul className="space-y-1 text-[8px] text-slate-700 list-disc list-inside leading-snug">
                {senado.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Matriz SWOT Consolidada */}
          <h3 className="text-xs font-bold font-serif text-slate-900 mb-2">
            Matriz SWOT — Cenário majoritário (Governo e Senado)
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-2.5 rounded border border-emerald-200 bg-emerald-50/50">
              <h4 className="text-[10px] font-bold text-emerald-800 mb-1">Forças</h4>
              <ul className="space-y-1 text-[8px] text-emerald-950 list-disc list-inside leading-tight">
                {swotGeral.forcas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded border border-rose-200 bg-rose-50/50">
              <h4 className="text-[10px] font-bold text-rose-800 mb-1">Fraquezas</h4>
              <ul className="space-y-1 text-[8px] text-rose-950 list-disc list-inside leading-tight">
                {swotGeral.fraquezas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded border border-sky-200 bg-sky-50/50">
              <h4 className="text-[10px] font-bold text-sky-800 mb-1">Oportunidades</h4>
              <ul className="space-y-1 text-[8px] text-sky-950 list-disc list-inside leading-tight">
                {swotGeral.oportunidades.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded border border-amber-200 bg-amber-50/50">
              <h4 className="text-[10px] font-bold text-amber-800 mb-1">Ameaças</h4>
              <ul className="space-y-1 text-[8px] text-amber-950 list-disc list-inside leading-tight">
                {swotGeral.ameacas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recomendação CTAS Box */}
        <div className="p-3.5 bg-slate-50 border-l-4 border-[#134456] rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Recomendação CTAS.</strong> {recomendacaoCTAS}
        </div>
      </div>

      <CtasFooter pageNumber={44} />
    </div>
  );
};

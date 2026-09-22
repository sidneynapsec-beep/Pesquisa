import React from "react";
import { CtasHeader, CtasFooter } from "./CtasHeaderFooter";
import { CTAS_TRACKING_ONDA1 } from "../../data/ctasExecutiveReportData";
import { CtasReportDataType } from "../../utils/ctasDataAdapter";

// =========================================================================
// PÁGINA 17: 05.1 ARACAJU — PRESIDENTE, GOVERNO E SENADO
// =========================================================================
export const Page17Aracaju: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { municipios } = data;
  const aracaju = municipios.find((m) => m.nome === "Aracaju") || municipios[0] || CTAS_TRACKING_ONDA1.municipios[0];

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="05.1" sectionTitle="ARACAJU" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
                <span className="text-amber-500 mr-2 font-mono text-xl">05.1</span>
                Aracaju
              </h2>
              <p className="text-[9px] text-slate-500">
                Presidente, Governo e Senado (1º voto, 2º voto e consolidado).
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-slate-100 rounded text-[9px] font-mono text-slate-700">
                {aracaju.amostra} entrevistas · Margem {aracaju.margem}
              </span>
            </div>
          </div>

          {/* Grid de 3 Tabelas: Presidente, Governo, Senado 1º Voto */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Presidente em Aracaju */}
            <div className="border border-slate-200 rounded overflow-hidden text-[8px]">
              <div className="bg-[#134456] text-white py-1 px-2 font-bold flex justify-between">
                <span>PRESIDENTE</span>
                <span className="font-mono text-[7.5px] opacity-80">{aracaju.presidente.validos} válidos</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {aracaju.presidente.ranking.map((r, i) => (
                    <tr key={r.name} className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                      <td className="py-1 px-2 font-medium whitespace-normal break-words leading-tight">{r.name}</td>
                      <td className="py-1 px-1 text-right font-mono font-bold text-slate-900">
                        {r.validPct ? `${r.validPct.toFixed(1)}%` : `${r.totalPct.toFixed(1)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Governo em Aracaju */}
            <div className="border border-slate-200 rounded overflow-hidden text-[8px]">
              <div className="bg-[#134456] text-white py-1 px-2 font-bold flex justify-between">
                <span>GOVERNO</span>
                <span className="font-mono text-[7.5px] opacity-80">{aracaju.governo.validos} válidos</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {aracaju.governo.ranking.map((r, i) => (
                    <tr key={r.name} className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                      <td className="py-1 px-2 font-medium whitespace-normal break-words leading-tight">{r.name}</td>
                      <td className="py-1 px-1 text-right font-mono font-bold text-slate-900">
                        {r.validPct ? `${r.validPct.toFixed(1)}%` : `${r.totalPct.toFixed(1)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Senado 1º Voto em Aracaju */}
            <div className="border border-slate-200 rounded overflow-hidden text-[8px]">
              <div className="bg-[#134456] text-white py-1 px-2 font-bold">
                SENADO 1º VOTO
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {aracaju.senado1.map((r, i) => (
                    <tr key={r.name} className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                      <td className="py-1 px-2 font-medium whitespace-normal break-words leading-tight">{r.name}</td>
                      <td className="py-1 px-1 text-right font-mono font-bold text-slate-900">
                        {r.validPct ? `${r.validPct.toFixed(1)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Deputados mais lembrados em Aracaju */}
          <h3 className="text-[10px] font-bold font-serif text-slate-900 uppercase tracking-wider mb-2">
            Deputados mais citados espontaneamente em Aracaju
          </h3>
          <div className="grid grid-cols-2 gap-3 text-[8px]">
            <div className="border border-slate-200 rounded p-2 bg-slate-50/60">
              <div className="font-bold text-slate-800 mb-1 border-b border-slate-200 pb-0.5">
                Deputado Estadual (Top Aracaju)
              </div>
              <div className="space-y-1">
                {aracaju.deputados.estadual.map((d) => (
                  <div key={d.name} className="flex justify-between">
                    <span className="text-slate-700">{d.name}</span>
                    <span className="font-mono font-bold text-slate-900">{d.validPct}% válidos ({d.votes})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded p-2 bg-slate-50/60">
              <div className="font-bold text-slate-800 mb-1 border-b border-slate-200 pb-0.5">
                Deputado Federal (Top Aracaju)
              </div>
              <div className="space-y-1">
                {aracaju.deputados.federal.map((d) => (
                  <div key={d.name} className="flex justify-between">
                    <span className="text-slate-700">{d.name}</span>
                    <span className="font-mono font-bold text-slate-900">{d.validPct}% válidos ({d.votes})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leitura estratégica Box */}
        <div className="p-3 bg-slate-50 border-l-4 border-amber-500 rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Leitura estratégica.</strong> {aracaju.leitura}
        </div>
      </div>

      <CtasFooter pageNumber={17} />
    </div>
  );
};

// =========================================================================
// PÁGINA 32: 08 COMPARATIVO — ESTADUAL DE SETEMBRO × ONDA 1 (CONSOLIDADO)
// =========================================================================
export const Page32Comparativo: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { comparativoConsolidado } = data;
  const { governo, senado1, leitura } = comparativoConsolidado;

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="08" sectionTitle="COMPARATIVO ESTADUAL × ONDA 1" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            <span className="text-amber-500 mr-2 font-mono text-xl">08</span>
            Comparativo — Estadual de Setembro × Onda 1
          </h2>
          <p className="text-[9.5px] text-slate-500 mt-1 mb-4">
            Comparação entre a pesquisa estadual de setembro (recorte dos 4 municípios, 492 entrevistas) e a Onda 1 da tracking (1022 entrevistas). Indicadores: ▲ subiu fora da margem, ▼ caiu fora da margem, = estável.
          </p>

          {/* Tabela Comparativa Governo */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <span>Governo de Sergipe</span>
              <span className="text-[8px] font-normal text-slate-500">Recorte Grande Aracaju</span>
            </h3>
            <div className="border border-slate-200 rounded overflow-hidden text-[8px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#134456] text-white font-medium">
                    <th className="py-1 px-2.5">CANDIDATO(A)</th>
                    <th className="py-1 px-2 text-right">SET. (TOTAL)</th>
                    <th className="py-1 px-2 text-right">ONDA 1 (TOTAL)</th>
                    <th className="py-1 px-2 text-right">VAR. TOTAL</th>
                    <th className="py-1 px-2 text-right">SET. (VÁLIDOS)</th>
                    <th className="py-1 px-2 text-right">ONDA 1 (VÁLIDOS)</th>
                    <th className="py-1 px-2 text-right">VAR. VÁLIDOS</th>
                    <th className="py-1 px-2 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {governo.map((r, i) => (
                    <tr key={r.name} className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                      <td className="py-1 px-2.5 font-medium text-slate-800">{r.name}</td>
                      <td className="py-1 px-2 text-right font-mono">{r.setTotal.toFixed(1)}%</td>
                      <td className="py-1 px-2 text-right font-mono">{r.onda1Total.toFixed(1)}%</td>
                      <td className={`py-1 px-2 text-right font-mono font-bold ${r.varTotal < 0 ? "text-rose-600" : r.varTotal > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                        {r.varTotal > 0 ? `+${r.varTotal.toFixed(1)}` : r.varTotal.toFixed(1)}
                      </td>
                      <td className="py-1 px-2 text-right font-mono">{r.setValid ? `${r.setValid.toFixed(1)}%` : "—"}</td>
                      <td className="py-1 px-2 text-right font-mono">{r.onda1Valid ? `${r.onda1Valid.toFixed(1)}%` : "—"}</td>
                      <td className={`py-1 px-2 text-right font-mono font-bold ${r.varValid && r.varValid < 0 ? "text-rose-600" : r.varValid && r.varValid > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                        {r.varValid ? (r.varValid > 0 ? `+${r.varValid.toFixed(1)}` : r.varValid.toFixed(1)) : "—"}
                      </td>
                      <td className="py-1 px-2 text-center font-mono font-semibold">
                        {r.statusTotal === "Caiu" && <span className="text-rose-600 font-bold">▼ Caiu</span>}
                        {r.statusTotal === "Subiu" && <span className="text-emerald-600 font-bold">▲ Subiu</span>}
                        {r.statusTotal === "Estável" && <span className="text-slate-500">= Estável</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela Comparativa Senado 1º Voto */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <span>Senado — 1º Voto</span>
              <span className="text-[8px] font-normal text-slate-500">Recorte Grande Aracaju</span>
            </h3>
            <div className="border border-slate-200 rounded overflow-hidden text-[8px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#134456] text-white font-medium">
                    <th className="py-1 px-2.5">CANDIDATO(A)</th>
                    <th className="py-1 px-2 text-right">SET. (TOTAL)</th>
                    <th className="py-1 px-2 text-right">ONDA 1 (TOTAL)</th>
                    <th className="py-1 px-2 text-right">VAR. TOTAL</th>
                    <th className="py-1 px-2 text-right">SET. (VÁLIDOS)</th>
                    <th className="py-1 px-2 text-right">ONDA 1 (VÁLIDOS)</th>
                    <th className="py-1 px-2 text-right">VAR. VÁLIDOS</th>
                    <th className="py-1 px-2 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {senado1.map((r, i) => (
                    <tr key={r.name} className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                      <td className="py-1 px-2.5 font-medium text-slate-800">{r.name}</td>
                      <td className="py-1 px-2 text-right font-mono">{r.setTotal.toFixed(1)}%</td>
                      <td className="py-1 px-2 text-right font-mono">{r.onda1Total.toFixed(1)}%</td>
                      <td className={`py-1 px-2 text-right font-mono font-bold ${r.varTotal < 0 ? "text-rose-600" : r.varTotal > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                        {r.varTotal > 0 ? `+${r.varTotal.toFixed(1)}` : r.varTotal.toFixed(1)}
                      </td>
                      <td className="py-1 px-2 text-right font-mono">{r.setValid ? `${r.setValid.toFixed(1)}%` : "—"}</td>
                      <td className="py-1 px-2 text-right font-mono">{r.onda1Valid ? `${r.onda1Valid.toFixed(1)}%` : "—"}</td>
                      <td className={`py-1 px-2 text-right font-mono font-bold ${r.varValid && r.varValid < 0 ? "text-rose-600" : r.varValid && r.varValid > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                        {r.varValid ? (r.varValid > 0 ? `+${r.varValid.toFixed(1)}` : r.varValid.toFixed(1)) : "—"}
                      </td>
                      <td className="py-1 px-2 text-center font-mono font-semibold">
                        {r.statusTotal === "Caiu" && <span className="text-rose-600 font-bold">▼ Caiu</span>}
                        {r.statusTotal === "Subiu" && <span className="text-emerald-600 font-bold">▲ Subiu</span>}
                        {r.statusTotal === "Estável" && <span className="text-slate-500">= Estável</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leitura estratégica Box */}
        <div className="p-3 bg-slate-50 border-l-4 border-amber-500 rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Leitura estratégica.</strong> {leitura}
        </div>
      </div>

      <CtasFooter pageNumber={32} />
    </div>
  );
};

// =========================================================================
// PÁGINA 43: 09 PROJEÇÃO DE VOTOS VÁLIDOS — BASE HISTÓRICA
// =========================================================================
export const Page43ProjecaoHistorica: React.FC<{ data?: CtasReportDataType }> = ({ data = CTAS_TRACKING_ONDA1 }) => {
  const { projecaoHistorica } = data;
  const { governoMediaValidos, senadoMediaValidos, governoProjecao, senadoProjecao, leitura } = projecaoHistorica;

  return (
    <div className="ctas-page ctas-page-break w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between select-none box-border shadow-md mx-auto">
      <CtasHeader sectionNumber="09" sectionTitle="PROJEÇÃO DE VOTOS VÁLIDOS" />

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            <span className="text-amber-500 mr-2 font-mono text-xl">09</span>
            Projeção de Votos Válidos — Base Histórica
          </h2>
          <p className="text-[9.5px] text-slate-500 mt-1 mb-4">
            Aplicação do índice histórico de votos válidos do TSE em Sergipe (Governo: {governoMediaValidos}%; Senado: {senadoMediaValidos}%) sobre os percentuais válidos da pesquisa.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Projeção Governo */}
            <div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded mb-2 flex justify-between items-center">
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">MÉDIA HISTÓRICA TSE</div>
                  <div className="text-sm font-bold text-slate-900">Governo de Sergipe</div>
                </div>
                <div className="text-right font-mono text-sm font-bold text-[#134456]">
                  {governoMediaValidos}% válidos
                </div>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden text-[8.5px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#134456] text-white">
                      <th className="py-1 px-2.5">CANDIDATO</th>
                      <th className="py-1 px-2 text-right">PESQUISA</th>
                      <th className="py-1 px-2 text-right">PROJETADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {governoProjecao.map((r, i) => (
                      <tr key={r.name} className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                        <td className="py-1 px-2.5 font-medium text-slate-800">{r.name}</td>
                        <td className="py-1 px-2 text-right font-mono">{r.validosPesquisa.toFixed(1)}%</td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-blue-900 bg-blue-50/50">
                          {r.projetadoHistorico.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Projeção Senado */}
            <div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded mb-2 flex justify-between items-center">
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">MÉDIA HISTÓRICA TSE</div>
                  <div className="text-sm font-bold text-slate-900">Senado (2 Vagas)</div>
                </div>
                <div className="text-right font-mono text-sm font-bold text-[#134456]">
                  {senadoMediaValidos}% válidos
                </div>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden text-[8.5px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#134456] text-white">
                      <th className="py-1 px-2.5">CANDIDATO</th>
                      <th className="py-1 px-2 text-right">PESQUISA</th>
                      <th className="py-1 px-2 text-right">PROJETADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {senadoProjecao.map((r, i) => (
                      <tr key={r.name} className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                        <td className="py-1 px-2.5 font-medium text-slate-800">{r.name}</td>
                        <td className="py-1 px-2 text-right font-mono">{r.validosPesquisa.toFixed(1)}%</td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-blue-900 bg-blue-50/50">
                          {r.projetadoHistorico.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Leitura estratégica Box */}
        <div className="p-3 bg-slate-50 border-l-4 border-amber-500 rounded-r text-[9.5px] text-slate-700 leading-relaxed shadow-xs">
          <strong className="text-slate-900 font-bold">Leitura da projeção.</strong> {leitura}
        </div>
      </div>

      <CtasFooter pageNumber={43} />
    </div>
  );
};

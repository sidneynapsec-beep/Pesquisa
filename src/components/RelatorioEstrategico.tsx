import React from "react";
import { CtasExecutiveReportView } from "./ctasReport/CtasExecutiveReportView";

/**
 * ============================================================================
 * RELATÓRIO OFICIAL CTAS — TEMPLATE CANÔNICO & DEFINITIVO
 * ============================================================================
 * 
 * Documento analítico único, oficial e 100% dinâmico da aplicação CTAS.
 * Orientado exclusivamente à base de microdados / pesquisa selecionada.
 * 
 * Elimina estruturalmente qualquer duplicidade anterior (anexos, versões
 * paralelas, slides redundantes). Ambas as formas de visualização ("Todas as
 * Páginas" e "Por Página") consomem rigorosamente a mesma árvore de dados
 * e o mesmo template canônico de 14 páginas A4.
 */
export default function RelatorioEstrategico() {
  return (
    <main className="w-full h-full min-h-screen bg-slate-100 flex flex-col">
      <CtasExecutiveReportView />
    </main>
  );
}

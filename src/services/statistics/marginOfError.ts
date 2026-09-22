/**
 * Motor Estatístico Central - Cálculo e Auditoria de Margem de Erro Amostral
 * 
 * Referência matemática padrão:
 *   ME = z * sqrt( (p * (1 - p) / n) * Deff * FPC )
 * 
 * Onde:
 *   - n = tamanho nominal da amostra
 *   - p = proporção populacional hipotética (p = 0.5 para máxima variância / estimativa conservadora)
 *   - z = escore crítico da distribuição normal padrão associado ao nível de confiança (ex: 1.95996 para 95%)
 *   - Deff = efeito de desenho (Design Effect). Quando não especificado, registra-se explicitamente
 *     Deff = 1 como assunção para cálculo.
 *   - FPC = Fator de Correção para População Finita: (N - n) / (N - 1) no cálculo da variância.
 *     Aplicável estritamente quando N é conhecido e a fração amostral n/N é relevante.
 *     Caso contrário, FPC = 1.0 (não aplicado / população tratada como infinita).
 *   - n_eff = n / Deff (tamanho efetivo da amostra)
 * 
 * DISTINÇÃO OBRIGATÓRIA:
 *   - MARGEM INFORMADA: margem declarada na ficha técnica da pesquisa/fonte.
 *   - MARGEM CALCULADA: margem calculada pelo SEIE segundo os parâmetros metodológicos disponíveis.
 */

import { resolveDesignEffect, DesignEffectSpecification } from "./designEffect";

export interface MarginOfErrorAuditResult {
  reportedMargin: number | null; // Margem informada pela fonte/pesquisa (null se não informada)
  calculatedMargin: number;      // Margem calculada pelo SEIE
  difference: number | null;     // calculatedMargin - reportedMargin
  isConsistent: boolean | null;  // se a diferença está dentro da tolerância metodológica (<= 0.15 pp)
  sampleSize: number;            // n nominal
  effectiveSampleSize: number;   // n_eff = n / Deff
  confidenceLevel: number;       // Ex: 95
  zScore: number;                // Ex: 1.95996
  proportion: number;            // p (0.0 a 1.0)
  deffSpecification: DesignEffectSpecification;
  deff: number;
  fpcApplied: boolean;
  fpcFactor: number;             // sqrt((N - n) / (N - 1)) ou 1.0
  populationSize: number | null; // N (null se não aplicável/não informado)
  formulaDescription: string;
  notes: string[];
}

export interface MarginOfErrorParams {
  sampleSize: number;            // n
  reportedMargin?: number;       // Margem informada pela pesquisa
  confidenceLevel?: number;      // Nível de confiança (ex: 95)
  proportion?: number;           // p (default: 0.5 para variância máxima)
  deff?: number;                 // Design Effect
  populationSize?: number;       // N (apenas se conhecido; NÃO inventar)
  applyFPC?: boolean;            // Se true e populationSize > sampleSize, aplica correção finita
}

/**
 * Retorna o valor crítico z da distribuição normal padrão para o nível de confiança informado.
 * Valores canônicos com dupla precisão:
 * - 90% -> 1.644854
 * - 95% -> 1.959964
 * - 99% -> 2.575829
 */
export function getZScore(confidenceLevel: number): number {
  if (confidenceLevel >= 98.5) return 2.575829;
  if (confidenceLevel >= 94) return 1.959964;
  if (confidenceLevel >= 89) return 1.644854;

  const alpha = 1 - Math.max(0.5, Math.min(0.999, confidenceLevel / 100));
  if (alpha <= 0.01) return 2.575829;
  if (alpha <= 0.05) return 1.959964;
  if (alpha <= 0.10) return 1.644854;
  return 1.959964;
}

/**
 * Calcula formalmente a Margem de Erro Amostral com parâmetros explícitos e rastreabilidade total.
 */
export function calculateAuditedMarginOfError(params: MarginOfErrorParams): MarginOfErrorAuditResult {
  const n = Math.max(1, Math.round(params.sampleSize));
  const conf = params.confidenceLevel && params.confidenceLevel > 0 ? params.confidenceLevel : 95;
  const z = getZScore(conf);
  const p = params.proportion !== undefined && params.proportion >= 0 && params.proportion <= 1
    ? params.proportion
    : 0.5;

  const notes: string[] = [];

  // Resolver Efeito de Desenho (Deff)
  const deffSpec = resolveDesignEffect(params.deff);
  const deff = deffSpec.deff;
  notes.push(deffSpec.notes);

  // Tamanho efetivo da amostra: n_eff = n / Deff
  const effectiveSampleSize = Math.max(1, Math.round(n / deff));

  // Correção de População Finita (FPC):
  // NÃO inventar N. Aplicar apenas se populationSize for expressamente informado e maior que n.
  let fpcApplied = false;
  let fpcFactor = 1.0;
  let populationN: number | null = null;

  if (params.applyFPC && params.populationSize !== undefined && params.populationSize > n) {
    populationN = params.populationSize;
    fpcApplied = true;
    fpcFactor = Math.sqrt((populationN - n) / (populationN - 1));
    notes.push(`FPC aplicado com população N = ${populationN.toLocaleString("pt-BR")}. Fator = ${fpcFactor.toFixed(6)}.`);
  } else {
    notes.push("FPC não aplicado (população tratada como infinita ou tamanho N não fornecido).");
  }

  // Erro padrão: SE = sqrt( [p(1-p)/n] * Deff ) * fpcFactor
  const standardError = Math.sqrt((p * (1 - p) / n) * deff) * fpcFactor;

  // Margem de erro em pontos percentuais (escala 0% a 100%)
  const calculatedMargin = Number((z * standardError * 100).toFixed(2));

  // Margem informada
  const reportedMargin = params.reportedMargin !== undefined && params.reportedMargin !== null
    ? Number(params.reportedMargin.toFixed(2))
    : null;

  let difference: number | null = null;
  let isConsistent: boolean | null = null;

  if (reportedMargin !== null) {
    difference = Number((calculatedMargin - reportedMargin).toFixed(2));
    isConsistent = Math.abs(difference) <= 0.15;
  }

  const formulaDescription = fpcApplied
    ? `ME = z (${z.toFixed(2)}) * sqrt([p(1-p)/n] * Deff * [(N-n)/(N-1)]) * 100`
    : `ME = z (${z.toFixed(2)}) * sqrt([p(1-p)/n] * Deff) * 100`;

  return {
    reportedMargin,
    calculatedMargin,
    difference,
    isConsistent,
    sampleSize: n,
    effectiveSampleSize,
    confidenceLevel: conf,
    zScore: Number(z.toFixed(4)),
    proportion: p,
    deffSpecification: deffSpec,
    deff,
    fpcApplied,
    fpcFactor: Number(fpcFactor.toFixed(6)),
    populationSize: populationN,
    formulaDescription,
    notes
  };
}

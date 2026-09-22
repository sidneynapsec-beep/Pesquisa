/**
 * Motor Estatístico Central - Intervalos de Confiança para Proporções
 * 
 * Regra matemática:
 *   p ± ME
 * 
 * Restrições axiomáticas de probabilidade:
 *   - 0 <= p <= 1
 *   - limite inferior (ciLower) >= 0
 *   - limite superior (ciUpper) <= 1
 *   - 0 <= ciLower <= ciUpper <= 1 (ou 0% <= ciLowerPct <= ciUpperPct <= 100%)
 */

import { getZScore } from "./marginOfError";

export interface ConfidenceIntervalResult {
  p: number;                  // Proporção pontual (0.0 a 1.0)
  percentage: number;         // Percentual pontual (0.0% a 100.0%)
  ciLower: number;            // Limite inferior em proporção [0, 1]
  ciUpper: number;            // Limite superior em proporção [0, 1]
  ciLowerPercentage: number;  // Limite inferior em porcentagem [0, 100]
  ciUpperPercentage: number;  // Limite superior em porcentagem [0, 100]
  marginOfErrorPercentage: number; // ME em pontos percentuais
  confidenceLevel: number;    // Ex: 95
  zScore: number;             // Ex: 1.95996
  method: "DirectME" | "Wald" | "Wilson";
}

/**
 * Calcula o intervalo de confiança direto a partir da proporção p e da margem de erro ME.
 * Respeita estritamente: 0 <= p <= 1, ciLower >= 0, ciUpper <= 1.
 * 
 * @param p Proporção (0.0 a 1.0) ou percentual (se p > 1, ex: 45.0 para 45%)
 * @param marginOfErrorPct Margem de erro em pontos percentuais (ex: 2.8) ou em proporção (ex: 0.028)
 */
export function calculateDirectConfidenceInterval(
  pInput: number,
  marginOfErrorPctInput: number,
  confidenceLevel: number = 95
): ConfidenceIntervalResult {
  // Se a margem for informada em pontos percentuais (> 0.5) ou pInput > 1, estamos em escala de porcentagem [0, 100]
  const isPercentScale = marginOfErrorPctInput > 0.5 || pInput > 1;
  const p = isPercentScale ? Math.max(0, Math.min(100, pInput)) / 100 : Math.max(0, Math.min(1, pInput));
  
  const mePct = isPercentScale ? marginOfErrorPctInput : marginOfErrorPctInput * 100;
  const meProp = mePct / 100;

  // p ± ME
  const lower = Math.max(0, p - meProp);
  const upper = Math.min(1, p + meProp);

  const z = getZScore(confidenceLevel);


  return {
    p,
    percentage: Number((p * 100).toFixed(4)),
    ciLower: Number(lower.toFixed(6)),
    ciUpper: Number(upper.toFixed(6)),
    ciLowerPercentage: Number((lower * 100).toFixed(2)),
    ciUpperPercentage: Number((upper * 100).toFixed(2)),
    marginOfErrorPercentage: Number(mePct.toFixed(2)),
    confidenceLevel,
    zScore: Number(z.toFixed(4)),
    method: "DirectME"
  };
}

/**
 * Intervalo de Confiança pelo Método de Wald:
 *   CI = p ± z * sqrt( (p * (1 - p)) / n )
 * 
 * Respeita estritamente: 0 <= lower <= upper <= 1 para qualquer p in [0, 1].
 */
export function calculateWaldConfidenceInterval(
  pInput: number,
  nInput: number,
  confidenceLevel: number = 95,
  deff: number = 1.0
): ConfidenceIntervalResult {
  const p = pInput > 1 ? pInput / 100 : Math.max(0, Math.min(1, pInput));
  const n = Math.max(1, Math.round(nInput));
  const safeDeff = Math.max(0.0001, deff);
  const z = getZScore(confidenceLevel);

  // Se p = 0 ou p = 1, p*(1-p) = 0 => erro padrão = 0
  const variance = (p * (1 - p) / n) * safeDeff;
  const se = Math.sqrt(Math.max(0, variance));
  const me = z * se;

  const lower = Math.max(0, p - me);
  const upper = Math.min(1, p + me);

  return {
    p,
    percentage: Number((p * 100).toFixed(4)),
    ciLower: Number(lower.toFixed(6)),
    ciUpper: Number(upper.toFixed(6)),
    ciLowerPercentage: Number((lower * 100).toFixed(2)),
    ciUpperPercentage: Number((upper * 100).toFixed(2)),
    marginOfErrorPercentage: Number((me * 100).toFixed(2)),
    confidenceLevel,
    zScore: Number(z.toFixed(4)),
    method: "Wald"
  };
}

/**
 * Intervalo de Confiança pelo Método Wilson Score:
 *   CI = [p + z²/(2n) ± z * sqrt( p(1-p)/n + z²/(4n²) )] / (1 + z²/n)
 * 
 * Evita limites fora de [0, 1] e garante excelente cobertura em caudas e amostras moderadas.
 */
export function calculateWilsonScoreInterval(
  pInput: number,
  nInput: number,
  confidenceLevel: number = 95
): ConfidenceIntervalResult {
  const p = pInput > 1 ? pInput / 100 : Math.max(0, Math.min(1, pInput));
  const n = Math.max(1, Math.round(nInput));
  const z = getZScore(confidenceLevel);
  const z2 = z * z;

  const denominator = 1 + z2 / n;
  const centerAdjusted = (p + z2 / (2 * n)) / denominator;
  const insideSqrt = Math.max(0, (p * (1 - p)) / n + z2 / (4 * n * n));
  const margin = (z * Math.sqrt(insideSqrt)) / denominator;

  const lower = Math.max(0, centerAdjusted - margin);
  const upper = Math.min(1, centerAdjusted + margin);

  return {
    p,
    percentage: Number((p * 100).toFixed(4)),
    ciLower: Number(lower.toFixed(6)),
    ciUpper: Number(upper.toFixed(6)),
    ciLowerPercentage: Number((lower * 100).toFixed(2)),
    ciUpperPercentage: Number((upper * 100).toFixed(2)),
    marginOfErrorPercentage: Number((margin * 100).toFixed(2)),
    confidenceLevel,
    zScore: Number(z.toFixed(4)),
    method: "Wilson"
  };
}

/**
 * Função despachante para cálculo de intervalo de confiança por método especificado.
 */
export function calculateConfidenceIntervalWithMethod(params: {
  proportion: number;
  sampleSize: number;
  confidenceLevel?: number;
  deff?: number;
  method?: "wald" | "wilson" | "direct";
  marginOfError?: number;
}): ConfidenceIntervalResult {
  const method = params.method || "wilson";
  if (method === "wilson") {
    return calculateWilsonScoreInterval(params.proportion, params.sampleSize, params.confidenceLevel ?? 95);
  }
  if (method === "wald") {
    return calculateWaldConfidenceInterval(
      params.proportion,
      params.sampleSize,
      params.confidenceLevel ?? 95,
      params.deff ?? 1.0
    );
  }
  return calculateDirectConfidenceInterval(
    params.proportion,
    params.marginOfError ?? 0,
    params.confidenceLevel ?? 95
  );
}


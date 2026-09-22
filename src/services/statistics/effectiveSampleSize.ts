/**
 * Motor Estatístico Central - Tamanho Efetivo da Amostra (Effective Sample Size)
 * 
 * Em planos amostrais complexos (conglomerados, estratificação, ponderação),
 * a precisão estatística da amostra é proporcional ao tamanho efetivo:
 * 
 *   n_eff = n / Deff
 * 
 * Onde:
 *   n = tamanho nominal da amostra (número de entrevistas realizadas)
 *   Deff = efeito de desenho (Design Effect)
 */

import { resolveDesignEffect, DesignEffectSpecification } from "./designEffect";

export interface EffectiveSampleSizeResult {
  nominalSampleSize: number;   // n nominal
  deffSpecification: DesignEffectSpecification;
  deff: number;                // Deff empregado
  effectiveSampleSize: number; // n_eff = n / Deff
  efficiencyRatio: number;     // 1 / Deff (eficiência relativa a AAS)
  description: string;
}

/**
 * Calcula o tamanho efetivo da amostra a partir de n nominal e Deff.
 */
export function calculateEffectiveSampleSize(
  nominalSample: number,
  deffInput?: number | DesignEffectSpecification
): EffectiveSampleSizeResult {
  const n = Math.max(1, Math.round(nominalSample));
  const deffSpec = typeof deffInput === "object" && deffInput !== null
    ? deffInput
    : resolveDesignEffect(typeof deffInput === "number" ? deffInput : undefined);


  const safeDeff = Math.max(0.0001, deffSpec.deff);
  const nEff = Math.max(1, Math.round(n / safeDeff));
  const efficiency = Number(((1 / safeDeff) * 100).toFixed(1));

  const note = deffSpec.isAssumed
    ? `Amostra nominal de ${n} com Deff=${safeDeff.toFixed(2)} (assunção para cálculo). Tamanho efetivo n_eff = ${nEff} (${efficiency}% de eficiência relativa).`
    : `Amostra nominal de ${n} com Deff=${safeDeff.toFixed(2)} (informado). Tamanho efetivo n_eff = ${nEff} (${efficiency}% de eficiência relativa).`;

  return {
    nominalSampleSize: n,
    deffSpecification: deffSpec,
    deff: safeDeff,
    effectiveSampleSize: nEff,
    efficiencyRatio: efficiency,
    description: note
  };
}

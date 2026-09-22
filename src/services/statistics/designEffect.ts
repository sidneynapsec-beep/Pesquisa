/**
 * Motor Estatístico Central - Efeito de Desenho (Design Effect / Deff)
 * 
 * O Efeito de Desenho (Deff) quantifica a razão entre a variância da estimativa
 * sob o plano amostral complexo (estratificado e/ou por conglomerados) e a variância
 * sob Amostra Aleatória Simples (AAS) com o mesmo tamanho amostral:
 * 
 *   Deff = Var_complexa(p) / Var_AAS(p)
 * 
 * DIRETRIZ METODOLÓGICA:
 * - Não assumir Deff = 1 como verdade metodológica universal.
 * - Se a pesquisa não declarar ou não houver cálculo de Deff, registrar explicitamente
 *   como 'assunção para cálculo' (deffAssumed = true) e não como característica observada.
 */

export interface DesignEffectSpecification {
  deff: number;
  isAssumed: boolean;
  source: "REPORTED" | "CALCULATED" | "ASSUMED";
  notes: string;
}

/**
 * Resolve a especificação do Efeito de Desenho (Deff).
 * Se nenhum Deff for informado, adota Deff = 1.0 como premissa analítica (assunção),
 * identificando formalmente a assunção para evitar que seja apresentada como medida empírica.
 */
export function resolveDesignEffect(reportedDeff?: number): DesignEffectSpecification {
  if (reportedDeff !== undefined && reportedDeff !== null && reportedDeff > 0) {
    return {
      deff: reportedDeff,
      isAssumed: false,
      source: "REPORTED",
      notes: `Deff informado pela pesquisa/metodologia: ${reportedDeff.toFixed(2)}.`
    };
  }

  return {
    deff: 1.0,
    isAssumed: true,
    source: "ASSUMED",
    notes: "Deff = 1.0 (assunção metodológica para cálculo na ausência de especificação do plano amostral complexo)."
  };
}


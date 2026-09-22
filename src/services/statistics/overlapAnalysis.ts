/**
 * Motor Estatístico Central - Análise de Sobreposição de Faixas de Incerteza
 * 
 * DIRETRIZ METODOLÓGICA:
 * Não classificar automaticamente dois candidatos como "empate técnico" apenas
 * porque seus intervalos de confiança se sobrepõem.
 * 
 * Sem a aplicação de um teste de hipótese específico para diferença de proporções
 * em amostras dependentes/multinomiais, a designação estatisticamente rigorosa é:
 *   "faixas de incerteza sobrepostas"
 */

export interface IntervalInput {
  candidateName: string;
  estimate: number;     // Estimativa pontual (percentual)
  lower: number;        // Limite inferior do IC
  upper: number;        // Limite superior do IC
}

export interface OverlapComparisonResult {
  candidateA: string;
  candidateB: string;
  hasOverlap: boolean;
  overlapLower: number | null;
  overlapUpper: number | null;
  overlapWidth: number | null;
  technicalLabel: "faixas de incerteza sobrepostas" | "intervalos de confiança distintos";
  isTechnicalTieProhibited: boolean; // true para reforçar proibição do rótulo genérico de empate técnico
  description: string;
}

/**
 * Compara dois candidatos e verifica rigorosamente a sobreposição de faixas de incerteza.
 */
export function analyzeIntervalOverlap(
  candA: IntervalInput,
  candB: IntervalInput
): OverlapComparisonResult {
  const overlapLower = Math.max(candA.lower, candB.lower);
  const overlapUpper = Math.min(candA.upper, candB.upper);
  const hasOverlap = overlapLower <= overlapUpper;

  if (hasOverlap) {
    const overlapWidth = Number((overlapUpper - overlapLower).toFixed(2));
    return {
      candidateA: candA.candidateName,
      candidateB: candB.candidateName,
      hasOverlap: true,
      overlapLower: Number(overlapLower.toFixed(2)),
      overlapUpper: Number(overlapUpper.toFixed(2)),
      overlapWidth,
      technicalLabel: "faixas de incerteza sobrepostas",
      isTechnicalTieProhibited: true,
      description: `As estimativas de ${candA.candidateName} [${candA.lower.toFixed(1)}%, ${candA.upper.toFixed(1)}%] e ${candB.candidateName} [${candB.lower.toFixed(1)}%, ${candB.upper.toFixed(1)}%] apresentam faixas de incerteza sobrepostas no segmento [${overlapLower.toFixed(1)}%, ${overlapUpper.toFixed(1)}%]. Sem teste formal pareado, não rotular automaticamente como 'empate técnico'.`
    };
  }

  return {
    candidateA: candA.candidateName,
    candidateB: candB.candidateName,
    hasOverlap: false,
    overlapLower: null,
    overlapUpper: null,
    overlapWidth: null,
    technicalLabel: "intervalos de confiança distintos",
    isTechnicalTieProhibited: false,
    description: `Os intervalos de confiança de ${candA.candidateName} [${candA.lower.toFixed(1)}%, ${candA.upper.toFixed(1)}%] e ${candB.candidateName} [${candB.lower.toFixed(1)}%, ${candB.upper.toFixed(1)}%] não se interceptam.`
  };
}

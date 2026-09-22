/**
 * Motor Estatístico Central - Ponderação Amostral e Decaimento Temporal para Tracking
 * 
 * Modelo Científico:
 *   w_i = sampleWeight_i * temporalWeight_i
 *   w_i = n_i * exp( -lambda * deltaDays_i )
 * 
 * Onde:
 *   - sampleWeight_i = n_i (tamanho da amostra real; NÃO inventar se ausente)
 *   - temporalWeight_i = exp( -lambda * deltaDays_i )
 *   - lambda = ln(2) / halfLifeDays (taxa de decaimento exponencial)
 *   - deltaDays_i = dias transcorridos entre a data real da pesquisa e a data de referência
 * 
 * DIRETRIZES FUNDAMENTAIS:
 *   1. Separar explicitamente sampleWeight de temporalWeight.
 *   2. NÃO substituir datas ausentes pela data atual.
 *   3. Se a pesquisa não possuir data válida de campo: registrar "Data não informada"
 *      e NÃO aplicar peso temporal baseado em data inventada.
 */

export interface PollSamplePoint {
  id: string;
  institute: string;
  sampleSize: number;
  medianDate?: string;       // YYYY-MM-DD
  fieldworkStart?: string;
  fieldworkEnd?: string;
  results: Record<string, number>;
  validResults?: Record<string, number>;
}

export interface WeightedPollResult {
  pollId: string;
  institute: string;
  fieldDate: string;           // Data real ou "Data não informada"
  hasValidDate: boolean;
  daysDiff: number | null;     // null se data não informada
  sampleSize: number;
  sampleWeight: number;        // Peso amostral derivado de n_i
  temporalWeight: number | null; // Peso temporal derivado de exp(-lambda * deltaDays)
  combinedWeight: number;      // sampleWeight * (temporalWeight ?? 1.0)
  normalizedWeight: number;    // Peso relativo normalizado (soma = 1.0)
  notes: string;
}

export interface CandidateTrackingAggregate {
  candidateName: string;
  weightedEstimate: number;    // Média ponderada
  weightedVariance: number;
  confidenceInterval: {
    lower: number;
    upper: number;
    marginOfError: number;
  };
  uncertaintyOverlapFlag?: boolean;
  dataPointsCount: number;
}

export interface TrackingAggregationResult {
  referenceDate: string;
  halfLifeDays: number;
  decayLambda: number;
  totalNominalSample: number;
  pollsWeightSummary: WeightedPollResult[];
  candidates: Record<string, CandidateTrackingAggregate>;
  hasUndatedPolls: boolean;
  calculationVersion: string;
}

/**
 * Calcula a diferença em dias entre duas datas (YYYY-MM-DD).
 * Retorna null se alguma das datas for inválida ou não informada.
 */
export function calculateDaysDifference(targetDate?: string | null, referenceDate?: string | null): number | null {
  if (!targetDate || !referenceDate) return null;
  if (targetDate.startsWith("1970") || referenceDate.startsWith("1970")) return null;
  try {
    const da = new Date(targetDate.includes("T") ? targetDate : `${targetDate}T12:00:00Z`).getTime();
    const db = new Date(referenceDate.includes("T") ? referenceDate : `${referenceDate}T12:00:00Z`).getTime();
    if (isNaN(da) || isNaN(db)) return null;
    return Math.max(0, Math.round((db - da) / (1000 * 60 * 60 * 24)));
  } catch {
    return null;
  }
}

/**
 * Calcula o peso temporal exponencial com base na diferença de dias e meia-vida (padrão: 14 dias).
 * Formula: exp( - (ln(2) / halfLifeDays) * deltaDays )
 */
export function computeTemporalWeight(deltaDays: number, halfLifeDays: number = 14): number {
  if (deltaDays <= 0) return 1.0;
  const lambda = Math.LN2 / Math.max(1, halfLifeDays);
  return Math.exp(-lambda * deltaDays);
}


/**
 * Executa a agregação de pesquisas com separação estrita entre peso amostral e peso temporal.
 */
export function computeTrackingAggregation(
  polls: PollSamplePoint[],
  options?: {
    halfLifeDays?: number;   // Padrão: 14 dias
    referenceDate?: string;  // Data de referência (default: data mais recente das pesquisas com data)
    useValidVotes?: boolean;
  }
): TrackingAggregationResult {
  const halfLife = options?.halfLifeDays && options.halfLifeDays > 0 ? options.halfLifeDays : 14;
  const lambda = Math.LN2 / halfLife;
  const useValid = options?.useValidVotes ?? true;

  if (!polls || polls.length === 0) {
    return {
      referenceDate: "Nenhuma pesquisa informada",
      halfLifeDays: halfLife,
      decayLambda: Number(lambda.toFixed(6)),
      totalNominalSample: 0,
      pollsWeightSummary: [],
      candidates: {},
      hasUndatedPolls: false,
      calculationVersion: "TRACKING_TEMPORAL_AUDITED_V2.1"
    };
  }

  // Identificar datas válidas reais nas pesquisas
  const validDates = polls
    .map((p) => p.medianDate || p.fieldworkEnd || p.fieldworkStart)
    .filter((d): d is string => Boolean(d && d.length >= 8 && !d.startsWith("1970")))
    .sort();

  // Definir data de referência com base na data mais recente existente nas pesquisas
  let refDate = options?.referenceDate;
  if (!refDate) {
    refDate = validDates.length > 0 ? validDates[validDates.length - 1] : "Data de referência não disponível";
  }

  let hasUndatedPolls = false;
  let totalNominalSample = 0;
  let sumCombinedWeights = 0;

  // 1. Cálculo de pesos individuais
  const intermediate = polls.map((p) => {
    const rawDate = p.medianDate || p.fieldworkEnd || p.fieldworkStart;
    const hasValidDate = Boolean(rawDate && rawDate.length >= 8 && !rawDate.startsWith("1970"));

    if (!hasValidDate) {
      hasUndatedPolls = true;
    }

    // sampleWeight: baseado no tamanho real da amostra. Se não informado, usar 0 ou peso 1 neutro sem inflar
    const n = Math.max(0, p.sampleSize || 0);
    totalNominalSample += n;
    const sampleWeight = n > 0 ? n : 1.0;

    let deltaDays: number | null = null;
    let temporalWeight: number | null = null;
    let combinedWeight = 0;
    let note = "";

    if (hasValidDate && refDate && refDate !== "Data de referência não disponível") {
      deltaDays = calculateDaysDifference(rawDate, refDate);
      if (deltaDays !== null) {
        temporalWeight = Math.exp(-lambda * deltaDays);
        combinedWeight = sampleWeight * temporalWeight;
        note = `deltaDays = ${deltaDays}, exp(-lambda*t) = ${temporalWeight.toFixed(4)}.`;
      } else {
        combinedWeight = sampleWeight;
        note = "Data não informada: decaimento temporal não aplicado.";
      }
    } else {
      // SEM DATA: NÃO inventar data atual! Registrar "Data não informada"
      combinedWeight = sampleWeight;
      note = "Data não informada: ponderado apenas pelo peso amostral, sem decaimento temporal.";
    }

    sumCombinedWeights += combinedWeight;

    return {
      poll: p,
      fieldDate: hasValidDate ? (rawDate || "") : "Data não informada",
      hasValidDate,
      daysDiff: deltaDays,
      sampleSize: n,
      sampleWeight,
      temporalWeight,
      combinedWeight,
      note
    };
  });

  // 2. Normalização dos pesos
  const pollsWeightSummary: WeightedPollResult[] = intermediate.map((item) => {
    const norm = sumCombinedWeights > 0 ? item.combinedWeight / sumCombinedWeights : 1 / intermediate.length;
    return {
      pollId: item.poll.id,
      institute: item.poll.institute,
      fieldDate: item.fieldDate,
      hasValidDate: item.hasValidDate,
      daysDiff: item.daysDiff,
      sampleSize: item.sampleSize,
      sampleWeight: item.sampleWeight,
      temporalWeight: item.temporalWeight !== null ? Number(item.temporalWeight.toFixed(4)) : null,
      combinedWeight: Number(item.combinedWeight.toFixed(2)),
      normalizedWeight: Number(norm.toFixed(4)),
      notes: item.note
    };
  });

  // 3. Agregar por candidato
  const candidateNamesSet = new Set<string>();
  for (const p of polls) {
    const dict = useValid && p.validResults ? p.validResults : p.results;
    for (const cand of Object.keys(dict || {})) {
      candidateNamesSet.add(cand);
    }
  }

  const candidates: Record<string, CandidateTrackingAggregate> = {};

  for (const candName of candidateNamesSet) {
    let weightedSum = 0;
    let sumWeightsForCand = 0;
    let count = 0;

    for (let i = 0; i < intermediate.length; i++) {
      const p = intermediate[i].poll;
      const weight = pollsWeightSummary[i].normalizedWeight;
      const dict = useValid && p.validResults ? p.validResults : p.results;
      if (dict && dict[candName] !== undefined && dict[candName] !== null) {
        weightedSum += Number(dict[candName]) * weight;
        sumWeightsForCand += weight;
        count++;
      }
    }

    const finalEstimate = sumWeightsForCand > 0 ? Number((weightedSum / sumWeightsForCand).toFixed(2)) : 0;

    // Variância ponderada
    let varianceSum = 0;
    for (let i = 0; i < intermediate.length; i++) {
      const p = intermediate[i].poll;
      const weight = pollsWeightSummary[i].normalizedWeight;
      const dict = useValid && p.validResults ? p.validResults : p.results;
      if (dict && dict[candName] !== undefined && dict[candName] !== null) {
        varianceSum += weight * Math.pow(Number(dict[candName]) - finalEstimate, 2);
      }
    }

    const weightedStdDev = Math.sqrt(varianceSum);
    // Margem com z=1.96
    const me = Number((Math.max(1.0, 1.96 * (weightedStdDev / Math.sqrt(Math.max(1, count))))).toFixed(2));

    candidates[candName] = {
      candidateName: candName,
      weightedEstimate: finalEstimate,
      weightedVariance: Number(varianceSum.toFixed(4)),
      confidenceInterval: {
        lower: Math.max(0, Number((finalEstimate - me).toFixed(2))),
        upper: Math.min(100, Number((finalEstimate + me).toFixed(2))),
        marginOfError: me
      },
      dataPointsCount: count
    };
  }

  return {
    referenceDate: refDate,
    halfLifeDays: halfLife,
    decayLambda: Number(lambda.toFixed(6)),
    totalNominalSample,
    pollsWeightSummary,
    candidates,
    hasUndatedPolls,
    calculationVersion: "TRACKING_TEMPORAL_AUDITED_V2.1"
  };
}

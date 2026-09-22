/**
 * Motor Estatístico Central - Cálculo Rigoroso de Votos Válidos
 * 
 * Em apurações e projeções de votos válidos (Art. 77, § 2º da CF e Código Eleitoral):
 *   % Válido = (Votos Nominais do Candidato / Total de Votos Válidos Nominais) * 100
 * 
 * REGRAS METODOLÓGICAS:
 * 1. Votos Brancos e Nulos NÃO entram no denominador de votos válidos.
 * 2. NS/NR e Indecisos NÃO entram no denominador de votos válidos.
 * 3. Categorias não reconhecidas NÃO devem ser silenciosamente classificadas como não-válidas.
 * 4. Valores sentinela negativos (ex: -1, -3, -9) NÃO podem ser convertidos para positivos (ex: Math.abs).
 *    Devem ser identificados como valores sentinela de pesquisa/abstenção.
 * 5. Não forçar 99.9% ou 100.1% a 100.0%. Preservar o valor bruto e a soma real observada.
 */

export type NonValidClassification = "BLANK_OR_NULL" | "UNDECIDED_OR_NR" | "SENTINEL" | "NOMINAL";

export interface NonValidAnalysis {
  classification: NonValidClassification;
  isInvalid: boolean;     // Brancos/Nulos
  isUndecided: boolean;   // Indecisos/NS/NR
  isSentinel: boolean;    // Valores sentinela (-1, -3, etc.)
  normalizedCategory?: string;
}

export interface CandidateRawVoteItem {
  name: string;
  party?: string;
  rawCount?: number;
  samplePercentage: number;
  questionPosition?: 1 | 2; // Posição da pergunta (relevante para Senado: 1º ou 2º voto)
}

export interface CandidateValidVoteItem {
  name: string;
  party?: string;
  samplePercentage: number;  // Valor bruto na amostra total (preservado sem alteração)
  validPercentage: number;   // Percentual em votos válidos
  ciLower: number;           // Limite inferior do IC de válidos
  ciUpper: number;           // Limite superior do IC de válidos
  marginOfError: number;     // Margem de erro inflacionada para a base de válidos
  questionPosition?: 1 | 2;
}

export interface ValidVotesComputationResult {
  totalSampleSum: number;     // Soma real bruta observada da amostra (ex: 99.9%, 100.0%, 100.1%)
  totalValidNominalSum: number; // Soma das intenções nominais válidas na amostra
  totalComputedValidSum: number; // Soma dos percentuais de votos válidos calculados (em torno de 100%)
  blankNullSum: number;       // Soma de brancos e nulos
  undecidedSum: number;       // Soma de indecisos e NS/NR
  sentinelSum: number;        // Soma de valores sentinela
  nonValidSum: number;        // blankNullSum + undecidedSum + sentinelSum
  candidates: CandidateValidVoteItem[];
  sentinelEntries: Array<{ name: string; value: number }>;
  notes: string[];
}

/**
 * Normaliza e classifica uma opção de voto.
 * Categorias suportadas:
 * - Branco, Brancos, Em Branco
 * - Nulo, Nulos, Voto Nulo
 * - Branco/Nulo, Brancos/Nulos, Branco ou Nulo, Brancos ou Nulos
 * - Nenhum, Ninguém
 * - NS, NR, NS/NR, Não Sabe, Não Respondeu
 * - Indeciso, Indecisos
 */
export function classifyVoteOption(name: string, rawValue?: number): NonValidAnalysis {
  // Verificação de valor sentinela numérico (valores negativos como -1, -3, -9)
  if (rawValue !== undefined && rawValue < 0) {
    return {
      classification: "SENTINEL",
      isInvalid: false,
      isUndecided: true,
      isSentinel: true,
      normalizedCategory: `SENTINEL (${rawValue})`
    };
  }

  const clean = (name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 1. Brancos e Nulos
  const isBlank =
    clean === "branco" ||
    clean === "brancos" ||
    clean === "em branco" ||
    clean === "voto branco" ||
    clean === "votos brancos" ||
    clean === "voto em branco" ||
    clean === "votos em branco";

  const isNull =
    clean === "nulo" ||
    clean === "nulos" ||
    clean === "voto nulo" ||
    clean === "votos nulos";

  const isBlankOrNull =
    isBlank ||
    isNull ||
    clean === "branco/nulo" ||
    clean === "brancos/nulos" ||
    clean === "branco / nulo" ||
    clean === "brancos / nulos" ||
    clean === "branco ou nulo" ||
    clean === "brancos ou nulos" ||
    clean === "nenhum" ||
    clean === "ninguem";

  if (isBlankOrNull) {
    return {
      classification: "BLANK_OR_NULL",
      isInvalid: true,
      isUndecided: false,
      isSentinel: false,
      normalizedCategory: isBlank ? "Branco" : isNull ? "Nulo" : "Branco/Nulo"
    };
  }

  // 2. Indecisos / Não Sabe / Não Respondeu
  const isUndecided =
    clean.includes("indecis") ||
    clean.includes("nao sabe") ||
    clean.includes("nao respondeu") ||
    clean.includes("sem resposta") ||
    clean === "ns" ||
    clean === "nr" ||
    clean === "ns/nr" ||
    clean === "ns / nr" ||
    clean === "ns-nr" ||
    clean.includes("ns/nr") ||
    clean.includes("/ ns") ||
    clean.includes("/ns") ||
    clean.includes("ns /");

  if (isUndecided) {
    return {
      classification: "UNDECIDED_OR_NR",
      isInvalid: false,
      isUndecided: true,
      isSentinel: false,
      normalizedCategory: clean.includes("indecis") ? "Indeciso" : "NS/NR"
    };
  }

  // 3. Qualquer outra categoria NÃO reconhecida é tratada como NOMINAL
  // (evita que candidatos com nomes incomuns sejam silenciosamente descartados)
  return {
    classification: "NOMINAL",
    isInvalid: false,
    isUndecided: false,
    isSentinel: false
  };
}

/**
 * Compatibilidade legada
 */
export function isNonValidOption(name: string): { isInvalid: boolean; isUndecided: boolean } {
  const analysis = classifyVoteOption(name);
  return {
    isInvalid: analysis.isInvalid,
    isUndecided: analysis.isUndecided
  };
}

/**
 * Calcula a distribuição de votos válidos com exclusão estrita de
 * Brancos, Nulos, Indecisos e valores sentinela.
 * Preserva os percentuais brutos originais.
 */
export function computeValidVotesDistribution(
  results: Record<string, number> | CandidateRawVoteItem[],
  baseMarginOfError: number = 2.0
): ValidVotesComputationResult {
  const items: CandidateRawVoteItem[] = Array.isArray(results)
    ? results
    : Object.entries(results).map(([name, pct]) => ({
        name,
        samplePercentage: Number(pct)
      }));

  let totalSampleSum = 0;
  let blankNullSum = 0;
  let undecidedSum = 0;
  let sentinelSum = 0;
  let validNominalSum = 0;
  const sentinelEntries: Array<{ name: string; value: number }> = [];

  const analyzedItems = items.map((item) => {
    const rawVal = item.samplePercentage;
    const analysis = classifyVoteOption(item.name, rawVal);

    if (analysis.isSentinel) {
      sentinelSum += Math.abs(rawVal);
      sentinelEntries.push({ name: item.name, value: rawVal });
      // Valores sentinela não entram na soma de intenções nominais válidas
      return { item, analysis, usableValue: 0 };
    }

    const safeVal = Math.max(0, rawVal || 0);
    totalSampleSum += safeVal;

    if (analysis.isInvalid) {
      blankNullSum += safeVal;
    } else if (analysis.isUndecided) {
      undecidedSum += safeVal;
    } else {
      validNominalSum += safeVal;
    }

    return { item, analysis, usableValue: safeVal };
  });

  const candidates: CandidateValidVoteItem[] = [];

  if (validNominalSum > 0) {
    for (const { item, analysis, usableValue } of analyzedItems) {
      if (analysis.classification !== "NOMINAL") continue;

      // % Válido = (Votos do Candidato / Total de Válidos) * 100
      const validPct = Number(((usableValue / validNominalSum) * 100).toFixed(4));
      
      // Inflacionamento da Margem de Erro para a subpopulação de válidos
      const inflationFactor = totalSampleSum > 0 ? totalSampleSum / validNominalSum : 1.0;
      const effectiveME = Number((baseMarginOfError * inflationFactor).toFixed(2));

      candidates.push({
        name: item.name,
        party: item.party,
        samplePercentage: usableValue,
        validPercentage: Number(validPct.toFixed(2)),
        ciLower: Math.max(0, Number((validPct - effectiveME).toFixed(2))),
        ciUpper: Math.min(100, Number((validPct + effectiveME).toFixed(2))),
        marginOfError: effectiveME,
        questionPosition: item.questionPosition
      });
    }
  }

  // Ordenação decrescente por votos válidos
  candidates.sort((a, b) => b.validPercentage - a.validPercentage);

  const totalComputedValidSum = Number(
    candidates.reduce((acc, c) => acc + c.validPercentage, 0).toFixed(2)
  );

  const notes: string[] = [
    "Votos válidos calculados deduzindo-se Brancos, Nulos, Indecisos e valores sentinela.",
    `Massa nominal de válidos: ${validNominalSum.toFixed(2)}% da amostra total.`
  ];

  if (sentinelEntries.length > 0) {
    notes.push(`${sentinelEntries.length} registro(s) identificado(s) como valor sentinela (não convertidos em votos nominais).`);
  }

  return {
    totalSampleSum: Number(totalSampleSum.toFixed(2)),
    totalValidNominalSum: Number(validNominalSum.toFixed(2)),
    totalComputedValidSum,
    blankNullSum: Number(blankNullSum.toFixed(2)),
    undecidedSum: Number(undecidedSum.toFixed(2)),
    sentinelSum: Number(sentinelSum.toFixed(2)),
    nonValidSum: Number((blankNullSum + undecidedSum + sentinelSum).toFixed(2)),
    candidates,
    sentinelEntries,
    notes
  };
}

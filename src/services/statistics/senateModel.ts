/**
 * Motor Estatístico Central - Modelo para Eleição ao Senado Federal (Sergipe 2026)
 * 
 * Regra Constitucional (Art. 46, § 1º da CF):
 *   Renovação de 2/3 da Câmara Alta em 2026: Cada eleitor tem direito a DOIS votos nominais independentes.
 * 
 * DISTINÇÃO METODOLÓGICA OBRIGATÓRIA:
 *   A) Percentual de menções / respondentes:
 *      Proporção de eleitores que mencionaram o candidato (em 1º ou 2º voto).
 *      A soma dos percentuais entre todos os candidatos pode atingir até 200%.
 *      AVISO OBRIGATÓRIO: "Percentual de menções — cada eleitor possui dois votos para o Senado."
 *   B) Percentual de votos nominais válidos emitidos:
 *      Proporção dos votos nominais destinados ao candidato sobre o total de votos nominais válidos emitidos.
 *      A soma entre todos os candidatos é rigorosamente 100%.
 *   C) Preservação da posição da pergunta:
 *      questionPosition: 1 (1ª opção de voto) ou 2 (2ª opção de voto), quando discriminada na base.
 */

export interface SenateCandidateInput {
  name: string;
  party: string;
  firstVoteCount?: number;     // Votos na 1ª opção
  secondVoteCount?: number;    // Votos na 2ª opção
  totalVotesNominal?: number;   // Soma de 1º e 2º votos
  electorPercent?: number;     // % de menções em relação aos respondentes
  questionPosition?: 1 | 2;    // Se aplicável a uma pergunta isolada
}

export interface SenateAuditedCandidate {
  name: string;
  party: string;
  totalVotesNominal: number;
  respondentMentionPercent: number; // % sobre os eleitores respondentes (soma pode atingir até 200%)
  validVotesPercent: number;        // % sobre o total de votos nominais válidos emitidos (soma = 100%)
  rank: number;
  isProjectedElected: boolean;      // 1º ou 2º colocado
  seatAllocated?: "1ª Vaga" | "2ª Vaga";
  questionPosition?: 1 | 2;
}

export interface SenateModelComputation {
  totalElectorateOrSample: number;
  totalValidNominalVotes: number;
  totalMentionSumPercent: number; // Soma dos percentuais de menção (pode chegar a 200%)
  totalValidSumPercent: number;   // Soma dos percentuais em votos válidos (100.0%)
  warningDisclaimer: string;      // "Percentual de menções — cada eleitor possui dois votos para o Senado."
  candidates: SenateAuditedCandidate[];
  calculationVersion: string;
  notes: string[];
}

export const SENATE_DUAL_VOTE_DISCLAIMER = "Percentual de menções — cada eleitor possui dois votos para o Senado.";

/**
 * Modela a apuração e projeção do Senado 2026 com dupla vaga.
 */
export function computeSenateModel2026(
  candidatesInput: SenateCandidateInput[],
  sampleTotal: number,
  options?: {
    blankNullFirst?: number;
    blankNullSecond?: number;
    undecidedFirst?: number;
    undecidedSecond?: number;
  }
): SenateModelComputation {
  const n = Math.max(1, sampleTotal);

  // 1. Totalizar votos nominais
  let totalNominal = 0;
  const processed = candidatesInput.map((c) => {
    let votes = c.totalVotesNominal || 0;
    if (!votes && (c.firstVoteCount !== undefined || c.secondVoteCount !== undefined)) {
      votes = (c.firstVoteCount || 0) + (c.secondVoteCount || 0);
    }
    if (!votes && c.electorPercent !== undefined) {
      votes = Math.round((c.electorPercent / 100) * n);
    }

    const mentionPct = c.electorPercent !== undefined
      ? Number(c.electorPercent.toFixed(2))
      : Number(((votes / n) * 100).toFixed(2));

    totalNominal += votes;

    return {
      name: c.name,
      party: c.party,
      totalVotesNominal: votes,
      respondentMentionPercent: mentionPct,
      questionPosition: c.questionPosition
    };
  });

  // 2. Votos válidos totais emitidos para os candidatos
  const validNominalSum = Math.max(1, totalNominal);

  const candidates: SenateAuditedCandidate[] = processed.map((c) => {
    // Percentual sobre os votos nominais válidos emitidos (soma 100%)
    const validPct = Number(((c.totalVotesNominal / validNominalSum) * 100).toFixed(2));

    return {
      name: c.name,
      party: c.party,
      totalVotesNominal: c.totalVotesNominal,
      respondentMentionPercent: c.respondentMentionPercent,
      validVotesPercent: validPct,
      rank: 0,
      isProjectedElected: false,
      questionPosition: c.questionPosition
    };
  });

  // Ordenação decrescente por quantidade de votos
  candidates.sort((a, b) => b.totalVotesNominal - a.totalVotesNominal);

  candidates.forEach((c, idx) => {
    c.rank = idx + 1;
    if (idx === 0) {
      c.isProjectedElected = true;
      c.seatAllocated = "1ª Vaga";
    } else if (idx === 1) {
      c.isProjectedElected = true;
      c.seatAllocated = "2ª Vaga";
    }
  });

  const totalMentionSumPercent = Number(
    candidates.reduce((acc, c) => acc + c.respondentMentionPercent, 0).toFixed(2)
  );
  const totalValidSumPercent = Number(
    candidates.reduce((acc, c) => acc + c.validVotesPercent, 0).toFixed(2)
  );

  const notes: string[] = [
    SENATE_DUAL_VOTE_DISCLAIMER,
    "Eleição com renovação de 2/3 (duas vagas) para o Senado Federal.",
    "A soma de menções/respondentes pode atingir até 200% em razão do voto duplo.",
    "A soma de votos válidos nominais totaliza 100.0% dos votos emitidos aos concorrentes."
  ];

  if (totalMentionSumPercent > 200.5) {
    notes.push(
      `ALERTA METODOLÓGICO: A soma das menções nominais (${totalMentionSumPercent}%) ultrapassa o limite constitucional/matemático de 200% para eleição de duas vagas.`
    );
  }

  return {
    totalElectorateOrSample: n,
    totalValidNominalVotes: validNominalSum,
    totalMentionSumPercent,
    totalValidSumPercent,
    warningDisclaimer: SENATE_DUAL_VOTE_DISCLAIMER,
    candidates,
    calculationVersion: "SENATE_2026_DUAL_SEAT_V2.1",
    notes
  };
}

/**
 * Valida a soma de menções em pesquisas para o Senado Federal (duas vagas).
 * Limite constitucional/metodológico: até 200.5% (com tolerância de arredondamento).
 */
export function validateSenateMentionsSum(sum: number): {
  isValid: boolean;
  isOverLimit: boolean;
  message: string;
} {
  const isOverLimit = sum > 200.5;
  const isValid = sum >= 0 && !isOverLimit;
  const message = isOverLimit
    ? `Soma de menções ao Senado (${sum.toFixed(1)}%) ultrapassa o limite constitucional de 200% para 2 vagas.`
    : `Soma de menções ao Senado (${sum.toFixed(1)}%) compatível com eleição de 2 vagas (máximo 200%).`;

  return { isValid, isOverLimit, message };
}


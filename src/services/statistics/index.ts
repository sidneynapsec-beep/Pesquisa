/**
 * Motor Estatístico Central - Exportação Unificada
 * Sistema Especialista em Inteligência Eleitoral (SEIE)
 * 
 * Centraliza e unifica todos os serviços estatísticos auditados:
 * 1. Margem de Erro Amostral (marginOfError.ts)
 * 2. Intervalos de Confiança (confidenceInterval.ts)
 * 3. Tamanho Efetivo de Amostra (effectiveSampleSize.ts)
 * 4. Efeito de Desenho (designEffect.ts)
 * 5. Distribuição de Votos Válidos (validVotes.ts)
 * 6. Modelo de Eleição para o Senado (senateModel.ts)
 * 7. Ponderação Amostral e Temporal (temporalWeighting.ts)
 * 8. Análise de Faixas de Incerteza Sobrepostas (overlapAnalysis.ts)
 */

export * from "./designEffect";
export * from "./effectiveSampleSize";
export * from "./marginOfError";
export * from "./confidenceInterval";
export * from "./validVotes";
export * from "./senateModel";
export * from "./temporalWeighting";
export * from "./overlapAnalysis";

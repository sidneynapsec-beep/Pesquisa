import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  calculateAuditedMarginOfError,
  calculateDirectConfidenceInterval,
  calculateConfidenceIntervalWithMethod,
  calculateEffectiveSampleSize,
  resolveDesignEffect,
  computeValidVotesDistribution,
  classifyVoteOption,
  computeSenateModel2026,
  SENATE_DUAL_VOTE_DISCLAIMER,
  calculateDaysDifference,
  computeTemporalWeight,
  computeTrackingAggregation,
  analyzeIntervalOverlap
} from "../src/services/statistics";

describe("SEIE Motor Estatístico Central - Testes Automatizados de Rigor Metodológico", () => {

  describe("1. Margem de Erro Amostral e FPC", () => {
    it("Calcula a margem de erro conservadora padrão (p=0.5, 95% conf, z=1.96) para n=1000", () => {
      const result = calculateAuditedMarginOfError({
        sampleSize: 1000,
        proportion: 0.5,
        confidenceLevel: 95,
        deff: 1.0,
        reportedMargin: 3.1
      });

      // ME = 1.95996 * 0.5 / sqrt(1000) = 0.030989... -> ~3.1%
      assert.strictEqual(result.sampleSize, 1000);
      assert.strictEqual(result.effectiveSampleSize, 1000);
      assert.strictEqual(result.calculatedMargin, 3.1);
      assert.strictEqual(result.reportedMargin, 3.1);
      assert.strictEqual(result.isConsistent, true);
      assert.strictEqual(result.fpcApplied, false);
      assert.ok(result.notes.some(n => n.includes("FPC não aplicado")));
    });

    it("Distingue explicitamente Margem Informada vs Margem Calculada quando divergem", () => {
      const result = calculateAuditedMarginOfError({
        sampleSize: 800,
        proportion: 0.5,
        confidenceLevel: 95,
        deff: 1.0,
        reportedMargin: 2.5 // Instituto informou 2.5%, mas para n=800 é ~3.46%
      });

      // Para n=800, ME real é 3.46%
      assert.strictEqual(result.calculatedMargin, 3.46);
      assert.strictEqual(result.reportedMargin, 2.5);
      assert.strictEqual(result.isConsistent, false);
      assert.strictEqual(result.difference, 0.96);
    });

    it("Aplica FPC apenas quando o tamanho populacional N é explicitamente fornecido", () => {
      const semFPC = calculateAuditedMarginOfError({
        sampleSize: 500,
        proportion: 0.5,
        confidenceLevel: 95,
        populationSize: undefined
      });

      const comFPC = calculateAuditedMarginOfError({
        sampleSize: 500,
        proportion: 0.5,
        confidenceLevel: 95,
        applyFPC: true,
        populationSize: 2000 // População pequena de município
      });

      assert.strictEqual(semFPC.fpcApplied, false);
      assert.strictEqual(comFPC.fpcApplied, true);
      assert.ok(comFPC.fpcFactor !== null && comFPC.fpcFactor < 1.0);
      // Margem com FPC deve ser estritamente menor
      assert.ok(comFPC.calculatedMargin < semFPC.calculatedMargin);
    });
  });

  describe("2. Efeito de Desenho (Deff) e Tamanho Efetivo Amostral", () => {
    it("Calcula n_eff = n / Deff e reduz o tamanho efetivo quando Deff > 1.0", () => {
      const eff = calculateEffectiveSampleSize(1500, 1.5);
      assert.strictEqual(eff.nominalSampleSize, 1500);
      assert.strictEqual(eff.deff, 1.5);
      assert.strictEqual(eff.effectiveSampleSize, 1000);
      assert.strictEqual(eff.efficiencyRatio, 66.7);
    });

    it("Resolve Deff explícito marcando se foi reportado ou assumido", () => {
      const reported = resolveDesignEffect(1.35);
      assert.strictEqual(reported.deff, 1.35);
      assert.strictEqual(reported.isAssumed, false);
      assert.strictEqual(reported.source, "REPORTED");

      const assumed = resolveDesignEffect(undefined);
      assert.strictEqual(assumed.deff, 1.0);
      assert.strictEqual(assumed.isAssumed, true);
      assert.strictEqual(assumed.source, "ASSUMED");
      assert.strictEqual(assumed.notes.includes("assunção metodológica"), true);
    });

    it("Margem de erro aumenta proporcionalmente ao Deff", () => {
      const semDeff = calculateAuditedMarginOfError({ sampleSize: 1000, deff: 1.0 });
      const comDeff = calculateAuditedMarginOfError({ sampleSize: 1000, deff: 1.44 }); // sqrt(1.44) = 1.2
      
      // Com Deff=1.44, ME deve ser 20% maior (3.10 * 1.2 = 3.72)
      assert.strictEqual(semDeff.calculatedMargin, 3.1);
      assert.strictEqual(comDeff.calculatedMargin, 3.72);
    });
  });

  describe("3. Intervalos de Confiança (Wald e Wilson Score) e Limites [0, 1]", () => {
    it("Garante que o limite inferior nunca seja inferior a 0 e o superior nunca ultrapasse 100%", () => {
      // Candidato com 1% em amostra com margem de 3.1%
      const icWald = calculateDirectConfidenceInterval(1.0, 3.1, 95);
      assert.strictEqual(icWald.ciLowerPercentage, 0); // Truncado em 0, nunca negativo
      assert.strictEqual(icWald.ciUpperPercentage, 4.1);

      // Candidato com 98% em amostra com margem de 3.1%
      const icAlto = calculateDirectConfidenceInterval(98.0, 3.1, 95);
      assert.strictEqual(icAlto.ciLowerPercentage, 94.9);
      assert.strictEqual(icAlto.ciUpperPercentage, 100); // Truncado em 100%
    });

    it("Calcula Wilson Score com assimetria rigorosa próximo dos limites (p=0 e p=1)", () => {
      const wilsonZero = calculateConfidenceIntervalWithMethod({
        proportion: 0.0,
        sampleSize: 500,
        method: "wilson"
      });
      assert.strictEqual(wilsonZero.ciLowerPercentage, 0);
      assert.ok(wilsonZero.ciUpperPercentage > 0);

      const wilsonUm = calculateConfidenceIntervalWithMethod({
        proportion: 1.0,
        sampleSize: 500,
        method: "wilson"
      });
      assert.strictEqual(wilsonUm.ciUpperPercentage, 100);
      assert.ok(wilsonUm.ciLowerPercentage < 100);
    });
  });

  describe("4. Distribuição de Votos Válidos e Classificação de Sentinelas", () => {
    it("Classifica corretamente categorias não-nominais (Brancos, Nulos, Indecisos, Sentinelas)", () => {
      assert.strictEqual(classifyVoteOption("Voto Branco").classification, "BLANK_OR_NULL");
      assert.strictEqual(classifyVoteOption("Nulo").classification, "BLANK_OR_NULL");
      assert.strictEqual(classifyVoteOption("Não Sabe / Não Respondeu").classification, "UNDECIDED_OR_NR");
      assert.strictEqual(classifyVoteOption("NS/NR").classification, "UNDECIDED_OR_NR");
      assert.strictEqual(classifyVoteOption("Indecisos").classification, "UNDECIDED_OR_NR");
      assert.strictEqual(classifyVoteOption("Desconhecido", -1).classification, "SENTINEL");
      assert.strictEqual(classifyVoteOption("Abstenção", -3).classification, "SENTINEL");

      // Candidatos reais devem ser classificados como NOMINAL
      assert.strictEqual(classifyVoteOption("Fábio Mitidieri").classification, "NOMINAL");
      assert.strictEqual(classifyVoteOption("Rogério Carvalho").classification, "NOMINAL");
    });

    it("Distribui votos válidos em 100% sem adulterar a soma bruta da amostra original", () => {
      const rawResults = [
        { name: "Candidato Alfa", samplePercentage: 40.0 },
        { name: "Candidato Beta", samplePercentage: 40.0 },
        { name: "Branco / Nulo", samplePercentage: 10.0 },
        { name: "Indecisos / NS", samplePercentage: 10.0 }
      ];

      const validDist = computeValidVotesDistribution(rawResults);

      // Total amostral bruto preservado (100.0%)
      assert.strictEqual(validDist.totalSampleSum, 100.0);
      // Votos nominais totais na amostra: 80.0%
      assert.strictEqual(validDist.totalValidNominalSum, 80.0);
      // Não válidos: 20.0%
      assert.strictEqual(validDist.nonValidSum, 20.0);

      // Distribuição de válidos: 40 / 80 = 50.0% cada
      const alfa = validDist.candidates.find(c => c.name === "Candidato Alfa")!;
      const beta = validDist.candidates.find(c => c.name === "Candidato Beta")!;
      assert.strictEqual(alfa.validPercentage, 50.0);
      assert.strictEqual(beta.validPercentage, 50.0);

      // Soma dos válidos deve totalizar 100.0%
      assert.strictEqual(validDist.totalComputedValidSum, 100.0);
    });

    it("Preserva somas reais de amostra com arredondamento como 99.9% ou 100.1% sem distorção forçada", () => {
      const rawResults = [
        { name: "Cand 1", samplePercentage: 33.3 },
        { name: "Cand 2", samplePercentage: 33.3 },
        { name: "Cand 3", samplePercentage: 33.3 }
      ]; // Soma bruta = 99.9%

      const dist = computeValidVotesDistribution(rawResults);
      assert.strictEqual(dist.totalSampleSum, 99.9);
      // Válidos distribuídos proporcionalmente somam 100.0% (ou 99.99% antes de arredondamento)
      assert.strictEqual(Math.round(dist.totalComputedValidSum), 100);
    });
  });

  describe("5. Modelo Eleitoral do Senado (Duas Vagas)", () => {
    it("Permite soma de menções de até 200% para o Senado e inclui aviso obrigatório", () => {
      const senateCandidates = [
        { name: "Candidato Senador A", party: "PARTIDO 1", electorPercent: 55.0, totalVotesNominal: 550 },
        { name: "Candidato Senador B", party: "PARTIDO 2", electorPercent: 45.0, totalVotesNominal: 450 },
        { name: "Candidato Senador C", party: "PARTIDO 3", electorPercent: 30.0, totalVotesNominal: 300 },
        { name: "Candidato Senador D", party: "PARTIDO 4", electorPercent: 20.0, totalVotesNominal: 200 }
      ];

      const model = computeSenateModel2026(senateCandidates, 1000);

      // Soma total de menções nominais = 55 + 45 + 30 + 20 = 150.0%
      assert.strictEqual(model.totalMentionSumPercent, 150.0);
      assert.strictEqual(model.warningDisclaimer, SENATE_DUAL_VOTE_DISCLAIMER);
      assert.strictEqual(model.warningDisclaimer, "Percentual de menções — cada eleitor possui dois votos para o Senado.");

      // Candidato A tem 550 / 1500 = 36.67% dos votos nominais válidos
      const candA = model.candidates.find(c => c.name === "Candidato Senador A")!;
      assert.strictEqual(candA.validVotesPercent, 36.67);
      assert.strictEqual(candA.isProjectedElected, true);
      assert.strictEqual(candA.seatAllocated, "1ª Vaga");

      const candB = model.candidates.find(c => c.name === "Candidato Senador B")!;
      assert.strictEqual(candB.isProjectedElected, true);
      assert.strictEqual(candB.seatAllocated, "2ª Vaga");
    });

    it("Alerta quando a soma de menções ultrapassa 200% (limite constitucional de duplo voto)", () => {
      const invalidSenate = [
        { name: "A", party: "P1", electorPercent: 90.0, totalVotesNominal: 900 },
        { name: "B", party: "P2", electorPercent: 80.0, totalVotesNominal: 800 },
        { name: "C", party: "P3", electorPercent: 50.0, totalVotesNominal: 500 }
      ]; // Soma = 220%

      const model = computeSenateModel2026(invalidSenate, 1000);
      assert.strictEqual(model.totalMentionSumPercent, 220.0);
      assert.ok(model.notes.some(n => n.includes("ultrapassa o limite")));
    });
  });

  describe("6. Ponderação Temporal e Amostral Sem Invenção de Datas", () => {
    it("Calcula a diferença em dias entre datas reais no formato YYYY-MM-DD", () => {
      const diff = calculateDaysDifference("2026-05-01", "2026-05-15");
      assert.strictEqual(diff, 14);
    });

    it("Retorna null e não inventa data se a data estiver ausente ou for sentinela 1970", () => {
      assert.strictEqual(calculateDaysDifference(null, "2026-05-15"), null);
      assert.strictEqual(calculateDaysDifference("1970-01-01", "2026-05-15"), null);
    });

    it("Aplica decaimento temporal exponencial com meia-vida de 14 dias: deltaDays=14 -> peso=0.5", () => {
      const weight14 = computeTemporalWeight(14, 14);
      assert.ok(Math.abs(weight14 - 0.5) < 0.001);

      const weight0 = computeTemporalWeight(0, 14);
      assert.strictEqual(weight0, 1.0);
    });

    it("Agrega pesquisas separando explicitamente peso amostral e temporal sem data fictícia", () => {
      const polls = [
        {
          id: "P1",
          institute: "Instituto A",
          sampleSize: 1000,
          medianDate: "2026-05-01", // Mais antiga (14 dias atrás)
          results: { "Candidato X": 30.0 }
        },
        {
          id: "P2",
          institute: "Instituto B",
          sampleSize: 1000,
          medianDate: "2026-05-15", // Mais recente (0 dias atrás)
          results: { "Candidato X": 40.0 }
        },
        {
          id: "P3",
          institute: "Instituto C",
          sampleSize: 1000,
          medianDate: undefined, // Sem data informada
          results: { "Candidato X": 35.0 }
        }
      ];

      const agg = computeTrackingAggregation(polls, {
        referenceDate: "2026-05-15",
        halfLifeDays: 14,
        useValidVotes: false
      });

      assert.strictEqual(agg.totalNominalSample, 3000);
      assert.strictEqual(agg.pollsWeightSummary.length, 3);

      // P3 sem data não deve ter temporalWeight inventado
      const p3 = agg.pollsWeightSummary.find(i => i.pollId === "P3")!;
      assert.strictEqual(p3.daysDiff, null);
      assert.strictEqual(p3.temporalWeight, null);
      assert.strictEqual(p3.hasValidDate, false);
      assert.ok(p3.notes.includes("Data não informada"));

      // Média agregada para Candidato X deve refletir maior peso para a pesquisa recente
      const candX = agg.candidates["Candidato X"];
      assert.ok(candX !== undefined);
      assert.ok(candX.weightedEstimate > 30.0);
    });
  });

  describe("7. Análise de Faixas de Incerteza Sobrepostas", () => {
    it("Proíbe o rótulo automático de 'empate técnico' e classifica como 'faixas de incerteza sobrepostas'", () => {
      const candA = { candidateName: "Candidato 1", estimate: 42.0, lower: 39.0, upper: 45.0 };
      const candB = { candidateName: "Candidato 2", estimate: 40.0, lower: 37.0, upper: 43.0 };

      const comparison = analyzeIntervalOverlap(candA, candB);

      assert.strictEqual(comparison.hasOverlap, true);
      assert.strictEqual(comparison.overlapLower, 39.0);
      assert.strictEqual(comparison.overlapUpper, 43.0);
      assert.strictEqual(comparison.overlapWidth, 4.0);
      assert.strictEqual(comparison.technicalLabel, "faixas de incerteza sobrepostas");
      assert.strictEqual(comparison.isTechnicalTieProhibited, true);
      assert.strictEqual(comparison.description.includes("não rotular automaticamente como 'empate técnico'"), true);
    });

    it("Classifica como 'intervalos de confiança distintos' quando não há sobreposição", () => {
      const candLider = { candidateName: "Líder", estimate: 55.0, lower: 52.0, upper: 58.0 };
      const candSegundo = { candidateName: "Segundo", estimate: 35.0, lower: 32.0, upper: 38.0 };

      const comparison = analyzeIntervalOverlap(candLider, candSegundo);

      assert.strictEqual(comparison.hasOverlap, false);
      assert.strictEqual(comparison.technicalLabel, "intervalos de confiança distintos");
      assert.strictEqual(comparison.isTechnicalTieProhibited, false);
    });
  });

});

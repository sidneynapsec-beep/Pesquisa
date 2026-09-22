import React, { useState, useMemo, useCallback } from "react";
import { Poll } from "../types";
import { useElectoralData } from "../context/ElectoralDataContext";
import { CANDIDATOS_OFICIAIS_2026 } from "../data/candidatosOficiais2026";
import { HISTORICAL_POLLS } from "../data/historicalPolls";
import { extractRoleSurveyData } from "../utils/surveyQuestionDetector";
import { getPollDateBR } from "../utils/dateFormatter";
import {
  Sliders,
  TrendingUp,
  Scale,
  Calculator,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  ShieldCheck,
  Building,
  Award,
  Landmark,
  FileSpreadsheet,
  History,
  MapPin,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Sparkles,
  BarChart3
} from "lucide-react";

export type ElectoralRole =
  | "Governador"
  | "Presidente"
  | "Prefeito"
  | "Senador"
  | "Deputado Federal"
  | "Deputado Estadual";

export type BaseComparisonType =
  | "pesquisa_atual"
  | "pesquisa_anterior"
  | "resultado_oficial_tse"
  | "cenario_manual";

export interface TransferRowHypothesis {
  sourceName: string;
  sourceType: "candidato" | "indeciso" | "branco_nulo";
  sourceShare: number; // % in observed survey
  toCandA: number; // % transfer to A
  toCandB: number; // % transfer to B
  toBlankNull: number; // % transfer to Blank/Null
  toUndecided: number; // % transfer to Undecided/Abstention
  originTag: "Hipótese de Cenário" | "Dado Observado (Pesquisa)" | "Resultado Oficial (TSE)";
}

interface CaminhoDaVitoriaProps {
  polls?: Poll[];
}

export default function CaminhoDaVitoria({ polls: propPolls = [] }: CaminhoDaVitoriaProps) {
  const globalContext = useElectoralData();
  const allPolls = useMemo(() => {
    if (globalContext?.polls && globalContext.polls.length > 0) {
      return globalContext.polls;
    }
    return propPolls;
  }, [globalContext?.polls, propPolls]);

  // Selected Role (Strictly Enforced)
  const [selectedRole, setSelectedRole] = useState<ElectoralRole>("Governador");

  // Selected Comparison Base
  const [comparisonBase, setComparisonBase] = useState<BaseComparisonType>("pesquisa_atual");

  // Selected Poll ID from Diagnóstico (Pesquisas)
  const [selectedPollId, setSelectedPollId] = useState<string>(() => {
    return allPolls.length > 0 ? allPolls[allPolls.length - 1].id : "";
  });

  // Selected Historical Poll ID for comparison
  const [selectedHistoricalPollId, setSelectedHistoricalPollId] = useState<string>(() => {
    return HISTORICAL_POLLS.length > 0 ? HISTORICAL_POLLS[0].id : "";
  });

  // Official TSE Historical Reference
  const [selectedTseReference, setSelectedTseReference] = useState<string>("tse-gov-2022");

  // Current Poll Object
  const currentPoll = useMemo(() => {
    if (comparisonBase === "resultado_oficial_tse") {
      // Find official TSE poll
      return HISTORICAL_POLLS.find((p) => p.id === "hist-tse-2022-governador") || null;
    }
    if (comparisonBase === "pesquisa_anterior") {
      return (
        allPolls.find((p) => p.id === selectedHistoricalPollId) ||
        HISTORICAL_POLLS.find((p) => p.id === selectedHistoricalPollId) ||
        allPolls[0] ||
        null
      );
    }
    return allPolls.find((p) => p.id === selectedPollId) || allPolls[allPolls.length - 1] || allPolls[0] || null;
  }, [allPolls, selectedPollId, comparisonBase, selectedHistoricalPollId]);

  // Check if role allows 2nd round (Executive roles only)
  const isSecondRoundEligible = useMemo(() => {
    return selectedRole === "Governador" || selectedRole === "Presidente" || selectedRole === "Prefeito";
  }, [selectedRole]);

  // Extract Survey Data for the Selected Role
  const roleSurveyData = useMemo(() => {
    if (!currentPoll || !isSecondRoundEligible) {
      return {
        hasData: false,
        candidates: [],
        brancosNulosPct: 0,
        indecisosPct: 0,
        totalSample: 0,
        marginOfError: 0,
        institute: "",
        registryNumber: "",
        date: ""
      };
    }

    // Attempt role extraction via survey detector
    if (selectedRole === "Governador" || selectedRole === "Presidente") {
      const extracted = extractRoleSurveyData(currentPoll, selectedRole as any, CANDIDATOS_OFICIAIS_2026);
      if (extracted.hasData && extracted.candidates.length > 0) {
        return {
          hasData: true,
          candidates: extracted.candidates.map((c) => ({
            name: c.name,
            pctSample: c.pctSample,
            pctValid: c.pctValid,
            party: c.party || c.coalition || "PARTIDO",
            votesCount: c.votesCount
          })),
          brancosNulosPct: extracted.brancosNulosPct,
          indecisosPct: extracted.indecisosPct,
          totalSample: extracted.totalAnswered || currentPoll.sampleSize || 1000,
          marginOfError: currentPoll.marginOfError || 2.8,
          institute: currentPoll.institute || "CTAS",
          registryNumber: currentPoll.registryNumber || "SE-2026/TSE",
          date: getPollDateBR(currentPoll.medianDate || currentPoll.fieldworkEnd)
        };
      }
    }

    // Fallback: check currentPoll.roleResults or currentPoll.results
    const roleKey = selectedRole;
    const roleMap = currentPoll.roleResults?.[roleKey] || (selectedRole === "Governador" ? currentPoll.results : null);
    
    if (roleMap && Object.keys(roleMap).length > 0) {
      const cands: { name: string; pctSample: number; pctValid: number; party: string; votesCount: number }[] = [];
      let bn = 0;
      let ind = 0;
      let validSum = 0;

      Object.entries(roleMap).forEach(([k, v]) => {
        const num = Number(v) || 0;
        const norm = k.toLowerCase();
        if (norm.includes("branco") || norm.includes("nulo")) {
          bn += num;
        } else if (norm.includes("indecis") || norm.includes("ns") || norm.includes("nr") || norm.includes("nao sabe")) {
          ind += num;
        } else {
          cands.push({
            name: k,
            pctSample: num,
            pctValid: 0,
            party: "REGISTRADO",
            votesCount: Math.round((num / 100) * (currentPoll.sampleSize || 1000))
          });
          validSum += num;
        }
      });

      // Normalize valid %
      const totalValid = validSum > 0 ? validSum : 1;
      const normalizedCands = cands.map((c) => ({
        ...c,
        pctValid: +((c.pctSample / totalValid) * 100).toFixed(1)
      }));

      // Sort descending by sample %
      normalizedCands.sort((a, b) => b.pctSample - a.pctSample);

      return {
        hasData: normalizedCands.length >= 2,
        candidates: normalizedCands,
        brancosNulosPct: bn,
        indecisosPct: ind,
        totalSample: currentPoll.sampleSize || 1000,
        marginOfError: currentPoll.marginOfError || 2.8,
        institute: currentPoll.institute || "CTAS",
        registryNumber: currentPoll.registryNumber || "SE-2026/TSE",
        date: getPollDateBR(currentPoll.medianDate || currentPoll.fieldworkEnd)
      };
    }

    return {
      hasData: false,
      candidates: [],
      brancosNulosPct: 0,
      indecisosPct: 0,
      totalSample: currentPoll.sampleSize || 0,
      marginOfError: currentPoll.marginOfError || 0,
      institute: currentPoll.institute || "",
      registryNumber: currentPoll.registryNumber || "",
      date: ""
    };
  }, [currentPoll, selectedRole, isSecondRoundEligible]);

  // Selected Candidate A and Candidate B for 2nd round simulation
  const [candidateA, setCandidateA] = useState<string>("");
  const [candidateB, setCandidateB] = useState<string>("");

  // Sync default candidates when role survey data changes
  React.useEffect(() => {
    if (roleSurveyData.hasData && roleSurveyData.candidates.length >= 2) {
      setCandidateA(roleSurveyData.candidates[0].name);
      setCandidateB(roleSurveyData.candidates[1].name);
    } else {
      setCandidateA("");
      setCandidateB("");
    }
  }, [roleSurveyData.hasData, roleSurveyData.candidates, selectedPollId, selectedRole, comparisonBase]);

  // Transfer Matrix Hypotheses State (Eliminated Candidates + Indecisos + Brancos/Nulos)
  const [transferHypotheses, setTransferHypotheses] = useState<Record<string, { toA: number; toB: number; toBN: number; toInd: number }>>({});

  // Preset scenarios
  const [activeScenarioPreset, setActiveScenarioPreset] = useState<"conservador" | "intermediario" | "alternativo" | "personalizado">("intermediario");

  // Apply scenario preset
  const applyPreset = useCallback(
    (preset: "conservador" | "intermediario" | "alternativo") => {
      setActiveScenarioPreset(preset);
      const newHypotheses: Record<string, { toA: number; toB: number; toBN: number; toInd: number }> = {};

      const eliminated = roleSurveyData.candidates.filter(
        (c) => c.name !== candidateA && c.name !== candidateB
      );

      eliminated.forEach((c) => {
        if (preset === "conservador") {
          // Even conservative split with high retention in blank/undecided
          newHypotheses[c.name] = { toA: 30, toB: 30, toBN: 25, toInd: 15 };
        } else if (preset === "intermediario") {
          // Moderate polarized transfer
          newHypotheses[c.name] = { toA: 50, toB: 30, toBN: 15, toInd: 5 };
        } else if (preset === "alternativo") {
          // Asymmetric transfer
          newHypotheses[c.name] = { toA: 30, toB: 55, toBN: 10, toInd: 5 };
        }
      });

      // Indecisos transfer
      if (preset === "conservador") {
        newHypotheses["__INDECISOS__"] = { toA: 25, toB: 25, toBN: 20, toInd: 30 };
      } else if (preset === "intermediario") {
        newHypotheses["__INDECISOS__"] = { toA: 40, toB: 35, toBN: 15, toInd: 10 };
      } else if (preset === "alternativo") {
        newHypotheses["__INDECISOS__"] = { toA: 30, toB: 45, toBN: 15, toInd: 10 };
      }

      // Brancos / Nulos migration
      if (preset === "conservador") {
        newHypotheses["__BRANCOS_NULOS__"] = { toA: 10, toB: 10, toBN: 75, toInd: 5 };
      } else if (preset === "intermediario") {
        newHypotheses["__BRANCOS_NULOS__"] = { toA: 15, toB: 15, toBN: 65, toInd: 5 };
      } else if (preset === "alternativo") {
        newHypotheses["__BRANCOS_NULOS__"] = { toA: 10, toB: 20, toBN: 65, toInd: 5 };
      }

      setTransferHypotheses(newHypotheses);
    },
    [roleSurveyData.candidates, candidateA, candidateB]
  );

  // Initialize transfer hypotheses when candidates change
  React.useEffect(() => {
    if (roleSurveyData.hasData && candidateA && candidateB) {
      applyPreset("intermediario");
    }
  }, [roleSurveyData.hasData, candidateA, candidateB, applyPreset]);

  // Update specific transfer cell
  const handleUpdateTransfer = (
    key: string,
    field: "toA" | "toB" | "toBN" | "toInd",
    value: number
  ) => {
    setActiveScenarioPreset("personalizado");
    setTransferHypotheses((prev) => {
      const current = prev[key] || { toA: 0, toB: 0, toBN: 0, toInd: 0 };
      const updated = { ...current, [field]: Math.max(0, Math.min(100, value)) };
      return { ...prev, [key]: updated };
    });
  };

  // Auto-balance transfer to 100%
  const handleAutoBalance = (key: string) => {
    setTransferHypotheses((prev) => {
      const current = prev[key] || { toA: 0, toB: 0, toBN: 0, toInd: 0 };
      const currentSum = current.toA + current.toB + current.toBN + current.toInd;
      if (currentSum === 0) {
        return { ...prev, [key]: { toA: 40, toB: 40, toBN: 15, toInd: 5 } };
      }
      const factor = 100 / currentSum;
      return {
        ...prev,
        [key]: {
          toA: Math.round(current.toA * factor),
          toB: Math.round(current.toB * factor),
          toBN: Math.round(current.toBN * factor),
          toInd: 100 - Math.round(current.toA * factor) - Math.round(current.toB * factor) - Math.round(current.toBN * factor)
        }
      };
    });
  };

  // Eliminated Candidates List
  const eliminatedCandidates = useMemo(() => {
    return roleSurveyData.candidates.filter(
      (c) => c.name !== candidateA && c.name !== candidateB
    );
  }, [roleSurveyData.candidates, candidateA, candidateB]);

  // Observed Base Stats for Candidate A & B
  const observedCandA = useMemo(() => {
    return roleSurveyData.candidates.find((c) => c.name === candidateA) || null;
  }, [roleSurveyData.candidates, candidateA]);

  const observedCandB = useMemo(() => {
    return roleSurveyData.candidates.find((c) => c.name === candidateB) || null;
  }, [roleSurveyData.candidates, candidateB]);

  // Mathematical Calculation Engine (Real-Time Simulation)
  const simulationCalculation = useMemo(() => {
    if (!observedCandA || !observedCandB) return null;

    let sampleA = observedCandA.pctSample;
    let sampleB = observedCandB.pctSample;
    let sampleBN = roleSurveyData.brancosNulosPct;
    let sampleInd = roleSurveyData.indecisosPct;

    const transferBreakdown: {
      source: string;
      originalShare: number;
      gainA: number;
      gainB: number;
      gainBN: number;
      gainInd: number;
      sumValid: boolean;
    }[] = [];

    let hasSumError = false;

    // 1. Process Eliminated Candidates
    eliminatedCandidates.forEach((cand) => {
      const hyp = transferHypotheses[cand.name] || { toA: 0, toB: 0, toBN: 0, toInd: 0 };
      const sum = hyp.toA + hyp.toB + hyp.toBN + hyp.toInd;
      const isValid = Math.abs(sum - 100) < 0.1;
      if (!isValid) hasSumError = true;

      const gainA = (cand.pctSample * hyp.toA) / 100;
      const gainB = (cand.pctSample * hyp.toB) / 100;
      const gainBN = (cand.pctSample * hyp.toBN) / 100;
      const gainInd = (cand.pctSample * hyp.toInd) / 100;

      sampleA += gainA;
      sampleB += gainB;
      sampleBN += gainBN;
      sampleInd += gainInd;

      transferBreakdown.push({
        source: `Eleitores de ${cand.name}`,
        originalShare: cand.pctSample,
        gainA,
        gainB,
        gainBN,
        gainInd,
        sumValid: isValid
      });
    });

    // 2. Process Indecisos
    if (roleSurveyData.indecisosPct > 0) {
      const hypInd = transferHypotheses["__INDECISOS__"] || { toA: 0, toB: 0, toBN: 0, toInd: 0 };
      const sum = hypInd.toA + hypInd.toB + hypInd.toBN + hypInd.toInd;
      const isValid = Math.abs(sum - 100) < 0.1;
      if (!isValid) hasSumError = true;

      const gainA = (roleSurveyData.indecisosPct * hypInd.toA) / 100;
      const gainB = (roleSurveyData.indecisosPct * hypInd.toB) / 100;
      const gainBN = (roleSurveyData.indecisosPct * hypInd.toBN) / 100;
      const gainInd = (roleSurveyData.indecisosPct * hypInd.toInd) / 100;

      // In the simulated pool, Indecisos are replaced by their distribution
      sampleA += gainA;
      sampleB += gainB;
      sampleBN += gainBN;
      sampleInd = gainInd; // updated remaining undecided

      transferBreakdown.push({
        source: "Indecisos / Não Sabem",
        originalShare: roleSurveyData.indecisosPct,
        gainA,
        gainB,
        gainBN,
        gainInd,
        sumValid: isValid
      });
    }

    // 3. Process Brancos / Nulos
    if (roleSurveyData.brancosNulosPct > 0) {
      const hypBN = transferHypotheses["__BRANCOS_NULOS__"] || { toA: 0, toB: 0, toBN: 100, toInd: 0 };
      const sum = hypBN.toA + hypBN.toB + hypBN.toBN + hypBN.toInd;
      const isValid = Math.abs(sum - 100) < 0.1;
      if (!isValid) hasSumError = true;

      const gainA = (roleSurveyData.brancosNulosPct * hypBN.toA) / 100;
      const gainB = (roleSurveyData.brancosNulosPct * hypBN.toB) / 100;
      const gainBN = (roleSurveyData.brancosNulosPct * hypBN.toBN) / 100;
      const gainInd = (roleSurveyData.brancosNulosPct * hypBN.toInd) / 100;

      sampleA += gainA;
      sampleB += gainB;
      sampleBN = gainBN; // updated remaining blank/null
      sampleInd += gainInd;

      transferBreakdown.push({
        source: "Brancos / Nulos",
        originalShare: roleSurveyData.brancosNulosPct,
        gainA,
        gainB,
        gainBN,
        gainInd,
        sumValid: isValid
      });
    }

    // Votos Válidos calculation (strictly excluding Blank, Null, Undecided)
    const validTotal = sampleA + sampleB;
    const validPctA = validTotal > 0 ? +((sampleA / validTotal) * 100).toFixed(1) : 50.0;
    const validPctB = validTotal > 0 ? +((sampleB / validTotal) * 100).toFixed(1) : 50.0;
    const validMargin = +(validPctA - validPctB).toFixed(1);

    // Margin of error intervals
    const me = roleSurveyData.marginOfError || 2.8;
    const intervalA = {
      min: +(validPctA - me).toFixed(1),
      max: +(validPctA + me).toFixed(1)
    };
    const intervalB = {
      min: +(validPctB - me).toFixed(1),
      max: +(validPctB + me).toFixed(1)
    };
    const isTechnicalTie = intervalA.min <= intervalB.max && intervalB.min <= intervalA.max;

    return {
      sampleA: +sampleA.toFixed(1),
      sampleB: +sampleB.toFixed(1),
      sampleBN: +sampleBN.toFixed(1),
      sampleInd: +sampleInd.toFixed(1),
      validPctA,
      validPctB,
      validMargin,
      intervalA,
      intervalB,
      marginOfError: me,
      isTechnicalTie,
      transferBreakdown,
      hasSumError
    };
  }, [
    observedCandA,
    observedCandB,
    eliminatedCandidates,
    roleSurveyData.brancosNulosPct,
    roleSurveyData.indecisosPct,
    roleSurveyData.marginOfError,
    transferHypotheses
  ]);

  // Sensitivity Analysis ("O que acontece se...?")
  const [sensitivityTargetSource, setSensitivityTargetSource] = useState<string>("");

  React.useEffect(() => {
    if (eliminatedCandidates.length > 0) {
      setSensitivityTargetSource(eliminatedCandidates[0].name);
    } else if (roleSurveyData.indecisosPct > 0) {
      setSensitivityTargetSource("__INDECISOS__");
    }
  }, [eliminatedCandidates, roleSurveyData.indecisosPct]);

  const sensitivityCurve = useMemo(() => {
    if (!observedCandA || !observedCandB || !sensitivityTargetSource || !simulationCalculation) {
      return [];
    }

    const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const results: {
      transferToA: number;
      transferToB: number;
      validA: number;
      validB: number;
      margin: number;
    }[] = [];

    // Target pool size
    let poolShare = 0;
    if (sensitivityTargetSource === "__INDECISOS__") {
      poolShare = roleSurveyData.indecisosPct;
    } else if (sensitivityTargetSource === "__BRANCOS_NULOS__") {
      poolShare = roleSurveyData.brancosNulosPct;
    } else {
      const c = eliminatedCandidates.find((cand) => cand.name === sensitivityTargetSource);
      poolShare = c?.pctSample || 0;
    }

    if (poolShare <= 0) return [];

    // Base shares from all other components
    const currentBaseA = simulationCalculation.sampleA - ((poolShare * (transferHypotheses[sensitivityTargetSource]?.toA || 0)) / 100);
    const currentBaseB = simulationCalculation.sampleB - ((poolShare * (transferHypotheses[sensitivityTargetSource]?.toB || 0)) / 100);

    steps.forEach((pctA) => {
      const pctB = 100 - pctA; // remaining to B
      const simA = currentBaseA + (poolShare * pctA) / 100;
      const simB = currentBaseB + (poolShare * pctB) / 100;
      const totalValid = simA + simB;
      const validA = totalValid > 0 ? +((simA / totalValid) * 100).toFixed(1) : 50;
      const validB = totalValid > 0 ? +((simB / totalValid) * 100).toFixed(1) : 50;
      results.push({
        transferToA: pctA,
        transferToB: pctB,
        validA,
        validB,
        margin: +(validA - validB).toFixed(1)
      });
    });

    return results;
  }, [
    observedCandA,
    observedCandB,
    sensitivityTargetSource,
    simulationCalculation,
    eliminatedCandidates,
    roleSurveyData.indecisosPct,
    roleSurveyData.brancosNulosPct,
    transferHypotheses
  ]);

  // Break-Even Point (Ponto de Equilíbrio) Calculator
  const breakEvenPoint = useMemo(() => {
    if (!observedCandA || !observedCandB || !simulationCalculation || !sensitivityTargetSource) {
      return null;
    }

    let poolShare = 0;
    let poolLabel = "";
    if (sensitivityTargetSource === "__INDECISOS__") {
      poolShare = roleSurveyData.indecisosPct;
      poolLabel = "Indecisos";
    } else if (sensitivityTargetSource === "__BRANCOS_NULOS__") {
      poolShare = roleSurveyData.brancosNulosPct;
      poolLabel = "Brancos/Nulos";
    } else {
      const c = eliminatedCandidates.find((cand) => cand.name === sensitivityTargetSource);
      poolShare = c?.pctSample || 0;
      poolLabel = c ? `eleitores de ${c.name}` : "grupo selecionado";
    }

    if (poolShare <= 0) return null;

    const currentBaseA = simulationCalculation.sampleA - ((poolShare * (transferHypotheses[sensitivityTargetSource]?.toA || 0)) / 100);
    const currentBaseB = simulationCalculation.sampleB - ((poolShare * (transferHypotheses[sensitivityTargetSource]?.toB || 0)) / 100);

    // Condition for exact tie: currentBaseA + poolShare * x = currentBaseB + poolShare * (1 - x)
    // 2 * poolShare * x = currentBaseB - currentBaseA + poolShare
    // x = (currentBaseB - currentBaseA + poolShare) / (2 * poolShare)
    const requiredX = ((currentBaseB - currentBaseA + poolShare) / (2 * poolShare)) * 100;

    if (requiredX >= 0 && requiredX <= 100) {
      return {
        isAchievable: true,
        requiredPctA: +requiredX.toFixed(1),
        requiredPctB: +(100 - requiredX).toFixed(1),
        poolLabel,
        description: `Neste cenário, uma transferência de ${requiredX.toFixed(1)}% dos ${poolLabel} para ${candidateA} (e ${(100 - requiredX).toFixed(1)}% para ${candidateB}) igualaria matematicamente os resultados projetados em 50,0% dos votos válidos.`
      };
    }

    return {
      isAchievable: false,
      requiredPctA: +requiredX.toFixed(1),
      requiredPctB: +(100 - requiredX).toFixed(1),
      poolLabel,
      description: `Empate matematicamente inalcançável variando apenas este grupo: a vantagem observada excede a totalidade dos votos disponíveis nos ${poolLabel} (${poolShare.toFixed(1)}% da amostra).`
    };
  }, [
    observedCandA,
    observedCandB,
    simulationCalculation,
    sensitivityTargetSource,
    candidateA,
    candidateB,
    eliminatedCandidates,
    roleSurveyData.indecisosPct,
    roleSurveyData.brancosNulosPct,
    transferHypotheses
  ]);

  // Historical Poll Comparison
  const historicalPollList = useMemo(() => {
    return allPolls.filter((p) => {
      const roleMap = p.roleResults?.[selectedRole] || (selectedRole === "Governador" ? p.results : null);
      return roleMap && Object.keys(roleMap).length > 0;
    });
  }, [allPolls, selectedRole]);

  // Modal / Toggle for Calculation Memory (Memória de Cálculo)
  const [showCalculationAudit, setShowCalculationAudit] = useState(false);
  const [copiedAudit, setCopiedAudit] = useState(false);

  // Copy Calculation Memory to Clipboard
  const handleCopyAudit = () => {
    if (!simulationCalculation || !observedCandA || !observedCandB) return;

    const text = `=== MEMÓRIA DE CÁLCULO - CAMINHO DA VITÓRIA (SEIE) ===
Data da Geração: ${new Date().toLocaleString("pt-BR")}
Cargo: ${selectedRole}
Base de Dados: ${roleSurveyData.institute} (${roleSurveyData.registryNumber}) - Campo: ${roleSurveyData.date}
Amostra Total (N): ${roleSurveyData.totalSample} entrevistas
Margem de Erro: ±${roleSurveyData.marginOfError} p.p.

1. DADOS OBSERVADOS NA PESQUISA:
- ${candidateA}: ${observedCandA.pctSample}% (Amostra) | ${observedCandA.pctValid}% (Votos Válidos)
- ${candidateB}: ${observedCandB.pctSample}% (Amostra) | ${observedCandB.pctValid}% (Votos Válidos)
- Brancos/Nulos Observados: ${roleSurveyData.brancosNulosPct}%
- Indecisos Observados: ${roleSurveyData.indecisosPct}%

2. HIPÓTESES DE TRANSFERÊNCIA APLICADAS:
${simulationCalculation.transferBreakdown
  .map(
    (t) =>
      `* ${t.source} (${t.originalShare}%): -> ${candidateA}: +${t.gainA.toFixed(2)} p.p. | -> ${candidateB}: +${t.gainB.toFixed(2)} p.p. | -> BN: +${t.gainBN.toFixed(2)} p.p. | -> Indeciso: +${t.gainInd.toFixed(2)} p.p.`
  )
  .join("\n")}

3. RESULTADO DO CENÁRIO SIMULADO:
- Total Projetado ${candidateA}: ${simulationCalculation.sampleA}% (Amostra) -> ${simulationCalculation.validPctA}% (Votos Válidos) [Intervalo: ${simulationCalculation.intervalA.min}% a ${simulationCalculation.intervalA.max}%]
- Total Projetado ${candidateB}: ${simulationCalculation.sampleB}% (Amostra) -> ${simulationCalculation.validPctB}% (Votos Válidos) [Intervalo: ${simulationCalculation.intervalB.min}% a ${simulationCalculation.intervalB.max}%]
- Diferença Projetada: ${simulationCalculation.validMargin > 0 ? "+" : ""}${simulationCalculation.validMargin} p.p.
- Situação Estatística: ${simulationCalculation.isTechnicalTie ? "Empate Técnico no cenário simulado" : "Diferença fora da margem de erro"}

AVISO LEGAL: Trata-se de uma simulação matemática baseada nas hipóteses informadas, não de uma previsão eleitoral ou resultado oficial.`;

    navigator.clipboard.writeText(text);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 3000);
  };

  // Render State 1: Ineligible Cargo for Second Round (Point 5)
  if (!isSecondRoundEligible) {
    return (
      <div className="space-y-6 animate-fade-in" id="caminho-vitoria-ineligible">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                Simulador de Segundo Turno
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Regra Constitucional Art. 28 e 77 CF/88
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mt-1">
              Caminho da Vitória: Simulação de Segundo Turno
            </h1>
          </div>

          {/* Cargo Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2">Cargo:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ElectoralRole)}
              className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
              id="cargo-selector-ineligible"
            >
              <option value="Governador">Governador (Com 2º Turno)</option>
              <option value="Presidente">Presidente (Com 2º Turno)</option>
              <option value="Prefeito">Prefeito (Com 2º Turno &gt;200k eleitores)</option>
              <option value="Senador">Senador (Turno Único)</option>
              <option value="Deputado Federal">Deputado Federal (Proporcional)</option>
              <option value="Deputado Estadual">Deputado Estadual (Proporcional)</option>
            </select>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-8 rounded-2xl max-w-2xl mx-auto my-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-amber-950 dark:text-amber-200">
              Este cenário não possui segundo turno previsto para o cargo/circunscrição selecionado.
            </h2>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-2 leading-relaxed max-w-lg mx-auto">
              A legislação eleitoral brasileira (Constituição Federal e Código Eleitoral) prevê segundo turno exclusivamente para os cargos majoritários do Poder Executivo (<strong>Presidente</strong>, <strong>Governador</strong> e <strong>Prefeito</strong> em municípios com mais de 200.000 eleitores) quando nenhum candidato obtém a maioria absoluta dos votos válidos (50% + 1 voto) no primeiro turno.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 font-mono">
              Eleições para Senador ocorrem pelo sistema majoritário de turno único simples. Eleições para Deputado ocorrem pelo sistema proporcional (Quociente Eleitoral).
            </p>
          </div>
          <button
            onClick={() => setSelectedRole("Governador")}
            className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow cursor-pointer inline-flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Mudar para Governador (Simulação de 2º Turno)
          </button>
        </div>
      </div>
    );
  }

  // Render State 2: No Survey Data Found in Diagnóstico (Pesquisa) (Point 21 & 22)
  if (!roleSurveyData.hasData || roleSurveyData.candidates.length < 2) {
    return (
      <div className="space-y-6 animate-fade-in" id="caminho-vitoria-no-data">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 px-2.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                Diagnóstico Obrigatório
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Conformidade com Base Real
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mt-1">
              Caminho da Vitória: Simulador de Segundo Turno
            </h1>
          </div>

          {/* Cargo Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2">Cargo:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ElectoralRole)}
              className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
              id="cargo-selector-empty"
            >
              <option value="Governador">Governador</option>
              <option value="Presidente">Presidente</option>
              <option value="Prefeito">Prefeito</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl max-w-xl mx-auto my-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
              Caminho da Vitória
            </span>
            <h2 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
              Sem dados suficientes para realizar a simulação.
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Insira ou disponibilize uma base válida no <strong>Diagnóstico (Pesquisa)</strong> antes de executar o simulador. O sistema nunca inventa candidatos ou intenções de voto fictícias.
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
            DADO NÃO ENCONTRADO NA BASE DE PESQUISA.
          </div>
        </div>
      </div>
    );
  }

  // Active Simulation View (Full Technical Workbench)
  return (
    <div className="space-y-6 animate-fade-in" id="caminho-da-vitoria-main">
      {/* Top Header & Context Metadata */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              Simulador Matemático de Segundo Turno
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Dado Observado: {roleSurveyData.institute} ({roleSurveyData.registryNumber})
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Campo: {roleSurveyData.date} • N={roleSurveyData.totalSample} • ME: ±{roleSurveyData.marginOfError} p.p.
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mt-1">
            Caminho da Vitória — Cenários & Transferência de Votos
          </h1>
        </div>

        {/* Global Action: Calculation Audit Memory */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalculationAudit(!showCalculationAudit)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            id="btn-show-calculation-audit"
          >
            <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Como este resultado foi calculado?</span>
            {showCalculationAudit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Audit Memory Drawer / Accordion */}
      {showCalculationAudit && (
        <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 animate-fade-in" id="panel-calculation-audit">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              <h3 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wider">
                Auditoria e Memória de Cálculo Matemático
              </h3>
            </div>
            <button
              onClick={handleCopyAudit}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-blue-300 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedAudit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedAudit ? "Copiado!" : "Copiar Memória de Cálculo"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">1. Base Utilizada</span>
              <p className="text-slate-200 font-bold">{roleSurveyData.institute}</p>
              <p className="text-slate-400 text-[11px]">Registro: {roleSurveyData.registryNumber}</p>
              <p className="text-slate-400 text-[11px]">Data: {roleSurveyData.date}</p>
              <p className="text-slate-400 text-[11px]">Amostra: {roleSurveyData.totalSample} entrevistas</p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">2. Fórmula de Transferência</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <code className="text-amber-300">Voto(A) = VotoBase(A) + Σ(Voto(K) × Taxa(K→A))</code>
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <code className="text-amber-300">Válidos(A) = (Voto(A) / [Voto(A) + Voto(B)]) × 100</code>
              </p>
              <p className="text-slate-400 text-[10px]">Brancos e nulos são rigorosamente excluídos do denominador dos votos válidos.</p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">3. Intervalo de Incerteza</span>
              <p className="text-slate-200">Margem de Erro: ±{roleSurveyData.marginOfError} p.p.</p>
              <p className="text-slate-300 text-[11px]">
                {candidateA}: {simulationCalculation?.intervalA.min}% a {simulationCalculation?.intervalA.max}%
              </p>
              <p className="text-slate-300 text-[11px]">
                {candidateB}: {simulationCalculation?.intervalB.min}% a {simulationCalculation?.intervalB.max}%
              </p>
              <p className="text-emerald-400 text-[10px]">
                {simulationCalculation?.isTechnicalTie ? "Empate Técnico no cenário simulado." : "Diferença fora da margem de erro."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Scenario Configuration Area (Point 6) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6" id="card-scenario-config">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-sm font-serif font-bold text-slate-900 dark:text-slate-100">
                1. Configuração do Cenário de Segundo Turno
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seleção de cargo, candidatos concorrentes e base observada.
              </p>
            </div>
          </div>

          {/* Basis of Comparison Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setComparisonBase("pesquisa_atual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                comparisonBase === "pesquisa_atual"
                  ? "bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-300 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Pesquisa Atual
            </button>
            <button
              onClick={() => setComparisonBase("pesquisa_anterior")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                comparisonBase === "pesquisa_anterior"
                  ? "bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-300 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setComparisonBase("resultado_oficial_tse")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                comparisonBase === "resultado_oficial_tse"
                  ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Resultado TSE
            </button>
          </div>
        </div>

        {/* Form Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Cargo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Cargo (Executivo)
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ElectoralRole)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              id="select-role-main"
            >
              <option value="Governador">Governador</option>
              <option value="Presidente">Presidente</option>
              <option value="Prefeito">Prefeito</option>
            </select>
          </div>

          {/* Candidato A */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Candidato A (Finalista 1)
            </label>
            <select
              value={candidateA}
              onChange={(e) => {
                if (e.target.value === candidateB) {
                  // swap or alert
                  setCandidateB(candidateA);
                }
                setCandidateA(e.target.value);
              }}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 outline-none"
              id="select-cand-a"
            >
              {roleSurveyData.candidates.map((c) => (
                <option key={c.name} value={c.name} disabled={c.name === candidateB}>
                  {c.name} ({c.pctSample}% na pesquisa)
                </option>
              ))}
            </select>
          </div>

          {/* Candidato B */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Candidato B (Finalista 2)
            </label>
            <select
              value={candidateB}
              onChange={(e) => {
                if (e.target.value === candidateA) {
                  setCandidateA(candidateB);
                }
                setCandidateB(e.target.value);
              }}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 outline-none"
              id="select-cand-b"
            >
              {roleSurveyData.candidates.map((c) => (
                <option key={c.name} value={c.name} disabled={c.name === candidateA}>
                  {c.name} ({c.pctSample}% na pesquisa)
                </option>
              ))}
            </select>
          </div>

          {/* Pesquisa / Base Selecionada */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Pesquisa / Base de Campo
            </label>
            {comparisonBase === "pesquisa_atual" ? (
              <select
                value={selectedPollId}
                onChange={(e) => setSelectedPollId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                id="select-poll-id"
              >
                {allPolls.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.institute} ({p.registryNumber || "S/Reg"}) - {getPollDateBR(p.medianDate || p.fieldworkEnd)}
                  </option>
                ))}
              </select>
            ) : comparisonBase === "pesquisa_anterior" ? (
              <select
                value={selectedHistoricalPollId}
                onChange={(e) => setSelectedHistoricalPollId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                id="select-hist-poll-id"
              >
                {HISTORICAL_POLLS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.institute} - {p.year} ({p.description})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium">
                Fonte: Resultado Eleitoral Oficial (TSE)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Real-Time Simulated Outcome Cards (Points 10, 11, 15) */}
      {simulationCalculation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="section-simulation-results">
          {/* Card Candidate A */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-sm relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-xs font-mono font-bold text-blue-900 dark:text-blue-300 uppercase">
                  CANDIDATO A (SIMULAÇÃO)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold">
                CENÁRIO SIMULADO
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                {candidateA}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Dado Observado 1º Turno: {observedCandA?.pctSample}% na amostra ({observedCandA?.pctValid}% válidos)
              </p>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Votos Válidos Projetados</span>
                <span className="text-3xl font-serif font-extrabold text-blue-900 dark:text-blue-400">
                  {simulationCalculation.validPctA}%
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 border-t border-blue-100 dark:border-blue-900/40 pt-1.5">
                <span>Intervalo (±{simulationCalculation.marginOfError} p.p.):</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {simulationCalculation.intervalA.min}% a {simulationCalculation.intervalA.max}%
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Total sobre a Amostra:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {simulationCalculation.sampleA}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, simulationCalculation.validPctA)}%` }}
              />
            </div>
          </div>

          {/* Card Candidate B */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                <span className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-300 uppercase">
                  CANDIDATO B (SIMULAÇÃO)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                CENÁRIO SIMULADO
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                {candidateB}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Dado Observado 1º Turno: {observedCandB?.pctSample}% na amostra ({observedCandB?.pctValid}% válidos)
              </p>
            </div>

            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Votos Válidos Projetados</span>
                <span className="text-3xl font-serif font-extrabold text-emerald-900 dark:text-emerald-400">
                  {simulationCalculation.validPctB}%
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 border-t border-emerald-100 dark:border-emerald-900/40 pt-1.5">
                <span>Intervalo (±{simulationCalculation.marginOfError} p.p.):</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {simulationCalculation.intervalB.min}% a {simulationCalculation.intervalB.max}%
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Total sobre a Amostra:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {simulationCalculation.sampleB}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, simulationCalculation.validPctB)}%` }}
              />
            </div>
          </div>

          {/* Card Summary Metrics & Technical Narrative */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Diagnóstico Comparativo
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    simulationCalculation.isTechnicalTie
                      ? "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300"
                      : "bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300"
                  }`}
                >
                  {simulationCalculation.isTechnicalTie ? "Empate Técnico no Cenário" : "Diferença Significativa"}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono">Diferença Projetada (Votos Válidos):</span>
                <p className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                  {simulationCalculation.validMargin > 0
                    ? `${candidateA} +${simulationCalculation.validMargin} p.p.`
                    : simulationCalculation.validMargin < 0
                    ? `${candidateB} +${Math.abs(simulationCalculation.validMargin)} p.p.`
                    : "Empate Exato (50,0% vs 50,0%)"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Branco / Nulo Restante</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{simulationCalculation.sampleBN}%</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Indecisos Restantes</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{simulationCalculation.sampleInd}%</span>
                </div>
              </div>
            </div>

            {/* Technical Narrative (Point 19) */}
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-3 italic bg-white/50 dark:bg-slate-800/40 p-2.5 rounded-lg">
              "Trata-se de uma simulação matemática baseada nas hipóteses informadas e não de uma previsão ou resultado eleitoral. Os denominadores de votos válidos excluem abstenções e nulos conforme as regras do TSE."
            </div>
          </div>
        </div>
      )}

      {/* Sum Validation Warning if transfers do not equal 100% (Point 14) */}
      {simulationCalculation?.hasSumError && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              <strong>Atenção:</strong> A distribuição das transferências precisa totalizar 100% em cada linha para manter a consistência matemática da amostra.
            </span>
          </div>
          <button
            onClick={() => {
              eliminatedCandidates.forEach((c) => handleAutoBalance(c.name));
              handleAutoBalance("__INDECISOS__");
              handleAutoBalance("__BRANCOS_NULOS__");
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 text-xs shrink-0 cursor-pointer shadow-sm"
          >
            Auto-Ajustar Todas para 100%
          </button>
        </div>
      )}

      {/* Section 3: Vote Transfer Matrix (Matriz de Transferência) (Points 7, 8, 14) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6" id="card-transfer-matrix">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Scale className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              2. Matriz de Transferência de Votos (Hipóteses do Usuário)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Defina para onde migram os eleitores dos candidatos eliminados e os indecisos no 2º turno.
            </p>
          </div>

          {/* Scenario Preset Buttons (Point 8) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Cenários Prontos:</span>
            <button
              onClick={() => applyPreset("conservador")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeScenarioPreset === "conservador"
                  ? "bg-slate-800 text-white font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Cenário 1 — Conservador
            </button>
            <button
              onClick={() => applyPreset("intermediario")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeScenarioPreset === "intermediario"
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Cenário 2 — Intermediário
            </button>
            <button
              onClick={() => applyPreset("alternativo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeScenarioPreset === "alternativo"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Cenário 3 — Alternativo
            </button>
          </div>
        </div>

        {/* Transfer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                <th className="p-3">Origem do Voto (1º Turno)</th>
                <th className="p-3 text-right">Peso na Pesquisa</th>
                <th className="p-3 text-center bg-blue-50/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                  % Para {candidateA}
                </th>
                <th className="p-3 text-center bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                  % Para {candidateB}
                </th>
                <th className="p-3 text-center">% Branco / Nulo</th>
                <th className="p-3 text-center">% Indeciso / Abstenção</th>
                <th className="p-3 text-center">Soma Total</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Eliminated Candidates Rows */}
              {eliminatedCandidates.map((cand) => {
                const hyp = transferHypotheses[cand.name] || { toA: 0, toB: 0, toBN: 0, toInd: 0 };
                const sum = hyp.toA + hyp.toB + hyp.toBN + hyp.toInd;
                const isSumValid = Math.abs(sum - 100) < 0.1;

                return (
                  <tr key={cand.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <span>{cand.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {cand.party}
                        </span>
                        <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400">
                          [Hipótese]
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {cand.pctSample}%
                    </td>
                    <td className="p-2 text-center bg-blue-50/20 dark:bg-blue-950/10">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={hyp.toA}
                          onChange={(e) => handleUpdateTransfer(cand.name, "toA", parseFloat(e.target.value) || 0)}
                          className="w-16 text-center font-mono font-bold p-1 rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 text-xs"
                        />
                        <span className="text-slate-400">%</span>
                      </div>
                    </td>
                    <td className="p-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={hyp.toB}
                          onChange={(e) => handleUpdateTransfer(cand.name, "toB", parseFloat(e.target.value) || 0)}
                          className="w-16 text-center font-mono font-bold p-1 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-300 text-xs"
                        />
                        <span className="text-slate-400">%</span>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={hyp.toBN}
                          onChange={(e) => handleUpdateTransfer(cand.name, "toBN", parseFloat(e.target.value) || 0)}
                          className="w-16 text-center font-mono p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                        />
                        <span className="text-slate-400">%</span>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={hyp.toInd}
                          onChange={(e) => handleUpdateTransfer(cand.name, "toInd", parseFloat(e.target.value) || 0)}
                          className="w-16 text-center font-mono p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                        />
                        <span className="text-slate-400">%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isSumValid
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200"
                            : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200"
                        }`}
                      >
                        {sum}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {!isSumValid && (
                        <button
                          onClick={() => handleAutoBalance(cand.name)}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-mono"
                        >
                          Ajustar 100%
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Indecisos Row */}
              {roleSurveyData.indecisosPct > 0 && (
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 bg-slate-50/20">
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <span>Indecisos / Não Sabem</span>
                      <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400">
                        [Hipótese]
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                    {roleSurveyData.indecisosPct}%
                  </td>
                  <td className="p-2 text-center bg-blue-50/20 dark:bg-blue-950/10">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={transferHypotheses["__INDECISOS__"]?.toA || 0}
                        onChange={(e) => handleUpdateTransfer("__INDECISOS__", "toA", parseFloat(e.target.value) || 0)}
                        className="w-16 text-center font-mono font-bold p-1 rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 text-xs"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </td>
                  <td className="p-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={transferHypotheses["__INDECISOS__"]?.toB || 0}
                        onChange={(e) => handleUpdateTransfer("__INDECISOS__", "toB", parseFloat(e.target.value) || 0)}
                        className="w-16 text-center font-mono font-bold p-1 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-300 text-xs"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={transferHypotheses["__INDECISOS__"]?.toBN || 0}
                        onChange={(e) => handleUpdateTransfer("__INDECISOS__", "toBN", parseFloat(e.target.value) || 0)}
                        className="w-16 text-center font-mono p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={transferHypotheses["__INDECISOS__"]?.toInd || 0}
                        onChange={(e) => handleUpdateTransfer("__INDECISOS__", "toInd", parseFloat(e.target.value) || 0)}
                        className="w-16 text-center font-mono p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono">
                    {(() => {
                      const hyp = transferHypotheses["__INDECISOS__"] || { toA: 0, toB: 0, toBN: 0, toInd: 0 };
                      const sum = hyp.toA + hyp.toB + hyp.toBN + hyp.toInd;
                      const isSumValid = Math.abs(sum - 100) < 0.1;
                      return (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isSumValid
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200"
                          }`}
                        >
                          {sum}%
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleAutoBalance("__INDECISOS__")}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-mono"
                    >
                      Ajustar 100%
                    </button>
                  </td>
                </tr>
              )}

              {/* Brancos / Nulos Row */}
              {roleSurveyData.brancosNulosPct > 0 && (
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 bg-slate-50/20">
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <span>Brancos / Nulos</span>
                      <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400">
                        [Hipótese]
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                    {roleSurveyData.brancosNulosPct}%
                  </td>
                  <td className="p-2 text-center bg-blue-50/20 dark:bg-blue-950/10">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={transferHypotheses["__BRANCOS_NULOS__"]?.toA || 0}
                        onChange={(e) => handleUpdateTransfer("__BRANCOS_NULOS__", "toA", parseFloat(e.target.value) || 0)}
                        className="w-16 text-center font-mono font-bold p-1 rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 text-xs"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </td>
                  <td className="p-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={transferHypotheses["__BRANCOS_NULOS__"]?.toB || 0}
                        onChange={(e) => handleUpdateTransfer("__BRANCOS_NULOS__", "toB", parseFloat(e.target.value) || 0)}
                        className="w-16 text-center font-mono font-bold p-1 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-300 text-xs"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={transferHypotheses["__BRANCOS_NULOS__"]?.toBN || 0}
                        onChange={(e) => handleUpdateTransfer("__BRANCOS_NULOS__", "toBN", parseFloat(e.target.value) || 0)}
                        className="w-16 text-center font-mono p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={transferHypotheses["__BRANCOS_NULOS__"]?.toInd || 0}
                        onChange={(e) => handleUpdateTransfer("__BRANCOS_NULOS__", "toInd", parseFloat(e.target.value) || 0)}
                        className="w-16 text-center font-mono p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono">
                    {(() => {
                      const hyp = transferHypotheses["__BRANCOS_NULOS__"] || { toA: 0, toB: 0, toBN: 0, toInd: 0 };
                      const sum = hyp.toA + hyp.toB + hyp.toBN + hyp.toInd;
                      const isSumValid = Math.abs(sum - 100) < 0.1;
                      return (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isSumValid
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200"
                          }`}
                        >
                          {sum}%
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleAutoBalance("__BRANCOS_NULOS__")}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-mono"
                    >
                      Ajustar 100%
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Sensitivity Analysis & Break-Even Point (Points 16, 17) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="section-sensitivity-breakeven">
        {/* Sensitivity Analysis ("O que acontece se...?") */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-serif font-bold text-slate-900 dark:text-slate-100">
                3. Análise de Sensibilidade ("O que acontece se...?")
              </h2>
            </div>
            {/* Variable selector */}
            <select
              value={sensitivityTargetSource}
              onChange={(e) => setSensitivityTargetSource(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            >
              {eliminatedCandidates.map((c) => (
                <option key={c.name} value={c.name}>
                  Votos de {c.name} ({c.pctSample}%)
                </option>
              ))}
              {roleSurveyData.indecisosPct > 0 && (
                <option value="__INDECISOS__">Indecisos ({roleSurveyData.indecisosPct}%)</option>
              )}
            </select>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Veja como o resultado dos votos válidos reage matematicamente a cada variação de 10 p.p. na taxa de transferência deste grupo:
          </p>

          <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-mono text-[10px] sticky top-0">
                <tr>
                  <th className="p-2">Transferência para {candidateA}</th>
                  <th className="p-2 text-right">Projetado {candidateA}</th>
                  <th className="p-2 text-right">Projetado {candidateB}</th>
                  <th className="p-2 text-right">Saldo (Válidos)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {sensitivityCurve.map((row) => (
                  <tr key={row.transferToA} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-2 text-slate-700 dark:text-slate-300 font-bold">
                      {row.transferToA}% → {candidateA} ({row.transferToB}% → {candidateB})
                    </td>
                    <td className="p-2 text-right font-bold text-blue-700 dark:text-blue-400">
                      {row.validA}%
                    </td>
                    <td className="p-2 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      {row.validB}%
                    </td>
                    <td className="p-2 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          row.margin > 0
                            ? "text-blue-700 bg-blue-50 dark:bg-blue-950"
                            : row.margin < 0
                            ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950"
                            : "text-slate-700 bg-slate-100"
                        }`}
                      >
                        {row.margin > 0 ? `+${row.margin} p.p.` : `${row.margin} p.p.`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Break-Even Point (Ponto de Equilíbrio) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Scale className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-serif font-bold text-slate-900 dark:text-slate-100">
                4. Ponto de Equilíbrio Matemático (Empate em 50,0%)
              </h2>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Calcula qual transferência percentual faria os dois candidatos atingirem exatamente o mesmo percentual projetado (50,0% vs 50,0% dos votos válidos):
            </p>

            {breakEvenPoint ? (
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  breakEvenPoint.isAchievable
                    ? "bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50"
                    : "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      breakEvenPoint.isAchievable
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200"
                        : "bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {breakEvenPoint.isAchievable ? "Empate Matemático Possível" : "Empate Inalcançável"}
                  </span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                  {breakEvenPoint.description}
                </p>
                {breakEvenPoint.isAchievable && (
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-blue-100 dark:border-blue-900/40">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Transferência necessária para {candidateA}:</span>
                      <span className="font-bold text-blue-900 dark:text-blue-300">{breakEvenPoint.requiredPctA}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Transferência necessária para {candidateB}:</span>
                      <span className="font-bold text-emerald-900 dark:text-emerald-300">{breakEvenPoint.requiredPctB}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-mono p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                Selecione um grupo de eleitores válido para calcular o ponto de equilíbrio.
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            O Ponto de Equilíbrio é uma métrica puramente aritmética da margem de disputa.
          </div>
        </div>
      </div>

      {/* Section 5: Historical Timeline & Survey Tracking (Point 13) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4" id="section-historical-comparison">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-serif font-bold text-slate-900 dark:text-slate-100">
              5. Histórico Comparativo de Pesquisas Registradas no Sistema
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {historicalPollList.length} pesquisas encontradas para o cargo de {selectedRole}
          </span>
        </div>

        {historicalPollList.length > 1 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-mono text-[10px]">
                <tr>
                  <th className="p-2.5">Data / Período</th>
                  <th className="p-2.5">Instituto</th>
                  <th className="p-2.5">Nº Registro TSE</th>
                  <th className="p-2.5">Amostra (N)</th>
                  <th className="p-2.5 text-right">{candidateA}</th>
                  <th className="p-2.5 text-right">{candidateB}</th>
                  <th className="p-2.5 text-right">Brancos/Nulos</th>
                  <th className="p-2.5 text-right">Indecisos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {historicalPollList.map((p) => {
                  const roleMap = p.roleResults?.[selectedRole] || (selectedRole === "Governador" ? p.results : {});
                  const valA = roleMap?.[candidateA] || "-";
                  const valB = roleMap?.[candidateB] || "-";
                  const valBN = roleMap?.["Brancos/Nulos"] || "-";
                  const valInd = roleMap?.["Indecisos"] || "-";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300">
                        {getPollDateBR(p.medianDate || p.fieldworkEnd)}
                      </td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">{p.institute}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">{p.registryNumber || "SE-2026/TSE"}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">{p.sampleSize || 1000}</td>
                      <td className="p-2.5 text-right font-bold text-blue-700 dark:text-blue-400">{valA}%</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400">{valB}%</td>
                      <td className="p-2.5 text-right text-slate-600 dark:text-slate-400">{valBN}%</td>
                      <td className="p-2.5 text-right text-slate-600 dark:text-slate-400">{valInd}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 font-mono">
            Apenas 1 pesquisa registrada no Diagnóstico para este cargo. Adicione mais pesquisas na aba Diagnóstico para visualizar a série temporal comparativa.
          </div>
        )}
      </div>
    </div>
  );
}

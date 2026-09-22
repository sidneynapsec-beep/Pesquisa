import React, { useState, useMemo } from "react";
import { Poll } from "../types";
import { useElectoralData } from "../context/ElectoralDataContext";
import { CANDIDATOS_OFICIAIS_2026 } from "../data/candidatosOficiais2026";
import {
  extractRoleSurveyData,
  extractRoleSecondOptionTransfer,
  extractCrystalizationData,
  getSurveyColumnMap,
  RoleCandidateExtraction
} from "../utils/surveyQuestionDetector";
import { getPollDateBR } from "../utils/dateFormatter";
import {
  Sliders,
  Sparkles,
  RefreshCw,
  Trophy,
  AlertCircle,
  TrendingUp,
  Percent,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  PieChart as PieIcon,
  ShieldCheck,
  Layers,
  Award,
  Landmark,
  Building,
  Flag,
  Copy,
  Check,
  Info,
  ChevronRight,
  Database
} from "lucide-react";

export type ElectoralRole =
  | "Governador"
  | "Senador"
  | "Deputado Federal"
  | "Deputado Estadual"
  | "Presidente";

interface SimuladorGuerraProps {
  polls?: Poll[];
}

export default function SimuladorGuerra({ polls: propPolls = [] }: SimuladorGuerraProps) {
  const globalContext = useElectoralData();
  const allPolls = useMemo(() => {
    if (globalContext?.polls && globalContext.polls.length > 0) {
      return globalContext.polls;
    }
    return propPolls;
  }, [globalContext?.polls, propPolls]);

  // Selected Poll / Survey from Diagnóstico (Pesquisa)
  const [selectedPollId, setSelectedPollId] = useState<string>(
    allPolls.length > 0 ? allPolls[0].id : ""
  );

  const currentPoll = useMemo(() => {
    return allPolls.find((p) => p.id === selectedPollId) || allPolls[0] || null;
  }, [allPolls, selectedPollId]);

  // Selected Electoral Role (STRICT ISOLATION)
  const [selectedRole, setSelectedRole] = useState<ElectoralRole>("Governador");

  // Simulation Controls State
  const [removedCandidate, setRemovedCandidate] = useState<string>("none");
  const [transferSplit, setTransferSplit] = useState<Record<string, number>>({});
  const [undecidedConversion, setUndecidedConversion] = useState<number>(50); // % of undecideds to convert
  const [candidateUndecidedShares, setCandidateUndecidedShares] = useState<Record<string, number>>({});
  const [abstentionRate, setAbstentionRate] = useState<number>(18); // General turnout abstention %
  const [copiedScript, setCopiedScript] = useState(false);

  // Reset simulator state when switching poll or role
  const handleReset = () => {
    setRemovedCandidate("none");
    setTransferSplit({});
    setUndecidedConversion(50);
    setCandidateUndecidedShares({});
    setAbstentionRate(18);
  };

  // 1. Role Data Extraction & Validation (Zero Hallucination Pipeline)
  // Candidato -> Cargo -> Eleição -> Base de dados
  const roleSurveyResult = useMemo(() => {
    if (!currentPoll) {
      return {
        hasData: false,
        role: selectedRole,
        pollId: "",
        institute: "CTAS",
        columnFound: null,
        totalAnswered: 0,
        totalValidAnswered: 0,
        candidates: [] as RoleCandidateExtraction[],
        indecisosCount: 0,
        indecisosPct: 0,
        brancosNulosCount: 0,
        brancosNulosPct: 0,
        validationStatus: "NOT_FOUND" as const,
        statusMessage: "Nenhuma pesquisa eleitoral cadastrada na aba Diagnóstico (Pesquisa)."
      };
    }

    return extractRoleSurveyData(currentPoll, selectedRole, CANDIDATOS_OFICIAIS_2026);
  }, [currentPoll, selectedRole]);

  // Candidate names strictly in this role
  const candidateNamesInRole = useMemo(() => {
    return roleSurveyResult.candidates.map((c) => c.name);
  }, [roleSurveyResult.candidates]);

  // 2. Second Option Transfer Matrix strictly filtered to this exact same cargo
  const secondOptionData = useMemo(() => {
    if (!currentPoll || !roleSurveyResult.hasData || candidateNamesInRole.length === 0) {
      return { hasData: false, totalAnswered: 0, matrix: {}, candidateTotals: {} };
    }
    return extractRoleSecondOptionTransfer(currentPoll, selectedRole, candidateNamesInRole);
  }, [currentPoll, selectedRole, roleSurveyResult.hasData, candidateNamesInRole]);

  // 3. Firmeza / Cristalização (if available in survey microdata)
  const crystalData = useMemo(() => {
    if (!currentPoll || !roleSurveyResult.hasData) {
      return {
        hasData: false,
        totalAnswered: 0,
        overall: { definitivo: 0, podeMudar: 0, indeciso: 0 },
        byCandidate: {}
      };
    }
    return extractCrystalizationData(currentPoll);
  }, [currentPoll, roleSurveyResult.hasData]);

  // 4. Compute Simulated Results (Strictly Same Cargo Redistribution)
  const simulatedResults = useMemo(() => {
    if (!roleSurveyResult.hasData || roleSurveyResult.candidates.length === 0) {
      return null;
    }

    const baseCandidates = roleSurveyResult.candidates;
    let currentWorkingShares: Record<string, number> = {};
    const originalValidMap: Record<string, number> = {};
    const originalSampleMap: Record<string, number> = {};

    baseCandidates.forEach((c) => {
      currentWorkingShares[c.name] = c.pctSample;
      originalSampleMap[c.name] = c.pctSample;
      originalValidMap[c.name] = c.pctValid;
    });

    let currentUndecided = roleSurveyResult.indecisosPct;
    let currentInvalid = roleSurveyResult.brancosNulosPct;

    // STEP 1: Handle Dropped Candidate (Strict Same-Cargo Isolation)
    if (removedCandidate !== "none" && currentWorkingShares[removedCandidate] !== undefined) {
      const votesToTransfer = currentWorkingShares[removedCandidate];
      delete currentWorkingShares[removedCandidate];

      const remainingCands = Object.keys(currentWorkingShares);

      if (remainingCands.length > 0) {
        // Check if real 2nd option matrix exists strictly within this cargo
        const realTransfers = secondOptionData.matrix[removedCandidate];

        if (realTransfers && Object.keys(realTransfers).length > 0) {
          const totalSecAnswered = (Object.values(realTransfers) as number[]).reduce(
            (a: number, b: number) => Number(a) + Number(b),
            0
          );

          remainingCands.forEach((cand) => {
            const matchedCount = Object.entries(realTransfers).find(
              ([k]) => k.toLowerCase() === cand.toLowerCase() || k.includes(cand) || cand.includes(k)
            );
            const count = matchedCount ? Number(matchedCount[1]) : 0;
            const share = totalSecAnswered > 0 ? count / totalSecAnswered : 1 / remainingCands.length;
            currentWorkingShares[cand] += votesToTransfer * share;
          });
        } else {
          // Proportional or custom transfer split among remaining candidates of this cargo
          const totalCustomSet = remainingCands.reduce(
            (acc, cand) => acc + (transferSplit[cand] !== undefined ? transferSplit[cand] : 0),
            0
          );

          if (totalCustomSet > 0) {
            remainingCands.forEach((cand) => {
              const customShare = (transferSplit[cand] || 0) / totalCustomSet;
              currentWorkingShares[cand] += votesToTransfer * customShare;
            });
          } else {
            // Proportional to current base weight among remaining candidates
            const sumRemainingSample = remainingCands.reduce(
              (sum, c) => sum + (originalSampleMap[c] || 0),
              0
            );

            remainingCands.forEach((cand) => {
              const weight =
                sumRemainingSample > 0
                  ? (originalSampleMap[cand] || 0) / sumRemainingSample
                  : 1 / remainingCands.length;
              currentWorkingShares[cand] += votesToTransfer * weight;
            });
          }
        }
      }
    }

    // STEP 2: Convert Undecided Voters
    const convertedUndecidedVotes = currentUndecided * (undecidedConversion / 100);
    currentUndecided -= convertedUndecidedVotes;

    const remainingActiveCands = Object.keys(currentWorkingShares);
    const sumActiveShares = remainingActiveCands.reduce(
      (sum, c) => sum + currentWorkingShares[c],
      0
    );

    remainingActiveCands.forEach((cand) => {
      const defaultWeight =
        sumActiveShares > 0 ? currentWorkingShares[cand] / sumActiveShares : 1 / remainingActiveCands.length;
      const customShare =
        candidateUndecidedShares[cand] !== undefined
          ? candidateUndecidedShares[cand] / 100
          : defaultWeight;
      currentWorkingShares[cand] += convertedUndecidedVotes * customShare;
    });

    // STEP 3: Compute Official TSE Valid Votes (Base 100% Nominais)
    const totalSimulatedValidSum = Object.values(currentWorkingShares).reduce((sum, v) => sum + v, 0);
    const simulatedValidPercentages: Record<string, number> = {};

    Object.entries(currentWorkingShares).forEach(([cand, val]) => {
      simulatedValidPercentages[cand] =
        totalSimulatedValidSum > 0 ? +((val / totalSimulatedValidSum) * 100).toFixed(2) : 0;
    });

    // Sort simulated results
    const sortedSimulated = Object.entries(simulatedValidPercentages)
      .map(([name, validPct]) => {
        const originalValid = originalValidMap[name] || 0;
        const originalSample = originalSampleMap[name] || 0;
        const totalPct = +(currentWorkingShares[name] || 0).toFixed(2);
        const deltaValid = +(validPct - originalValid).toFixed(2);

        // Find candidate details
        const details = roleSurveyResult.candidates.find((c) => c.name === name);

        return {
          name,
          party: details?.party || "",
          number: details?.number || "",
          coalition: details?.coalition || "",
          originalSample,
          originalValid,
          totalPct,
          validPct,
          deltaValid
        };
      })
      .sort((a, b) => b.validPct - a.validPct);

    const leader = sortedSimulated[0];
    const runnerUp = sortedSimulated[1];
    const isFirstRoundVictory =
      (selectedRole === "Governador" || selectedRole === "Presidente") &&
      leader &&
      leader.validPct > 50.0;

    return {
      candidates: sortedSimulated,
      simulatedUndecided: +currentUndecided.toFixed(1),
      simulatedInvalid: +currentInvalid.toFixed(1),
      totalSimulatedValid: +totalSimulatedValidSum.toFixed(1),
      isFirstRoundVictory,
      leader,
      runnerUp,
      selectedRole
    };
  }, [
    roleSurveyResult,
    removedCandidate,
    secondOptionData,
    transferSplit,
    undecidedConversion,
    candidateUndecidedShares,
    selectedRole
  ]);

  // Copy Tactical Script / Diagnosis
  const handleCopyScript = () => {
    if (!simulatedResults || !currentPoll) return;

    let text = `🗳️ *SIMULAÇÃO DE DESISTÊNCIA — CARGO: ${selectedRole.toUpperCase()}*\n`;
    text += `📊 *Fonte Oficial:* Diagnóstico de Pesquisa (${currentPoll.institute} - ${currentPoll.medianDate || currentPoll.fieldworkEnd})\n`;
    text += `📋 *Regra de Isolamento:* ${selectedRole} ➔ ${selectedRole} (Sem cruzamento entre cargos distintos)\n`;
    text += `🚫 *Cenário de Desistência:* ${removedCandidate !== "none" ? `Retirada de ${removedCandidate}` : "Cenário Completo (Todos os candidatos)"}\n`;
    text += `📈 *Conversão de Indecisos:* ${undecidedConversion}%\n\n`;
    text += `🏆 *RESULTADO SIMULADO EM VOTOS VÁLIDOS (CRITÉRIO OFICIAL TSE):*\n`;

    simulatedResults.candidates.forEach((cand, idx) => {
      const deltaSign = cand.deltaValid >= 0 ? `+${cand.deltaValid}` : `${cand.deltaValid}`;
      text += `${idx + 1}º ${cand.name} (${cand.party || "Sem Partido"}): ${cand.validPct}% dos válidos [${deltaSign} p.p. vs original ${cand.originalValid}%]\n`;
    });

    text += `\n📌 *Diagnóstico Tático:* `;
    if (selectedRole === "Governador" || selectedRole === "Presidente") {
      if (simulatedResults.isFirstRoundVictory) {
        text += `Vitória em 1º Turno consolidada de ${simulatedResults.leader.name} com ${simulatedResults.leader.validPct}% dos votos válidos.\n`;
      } else {
        text += `Segundo Turno provável entre ${simulatedResults.leader?.name} (${simulatedResults.leader?.validPct}%) e ${simulatedResults.runnerUp?.name} (${simulatedResults.runnerUp?.validPct}%).\n`;
      }
    } else {
      text += `Ranking simulado para a disputa de ${selectedRole} em Sergipe com base estrita no microdado auditado.\n`;
    }

    text += `\n🔒 *Validação:* Estatístico Responsável Sidney Barreto Batista — CONRE 10801`;

    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Role Configuration Helper
  const getRoleIcon = (role: ElectoralRole) => {
    switch (role) {
      case "Governador":
        return Layers;
      case "Senador":
        return Award;
      case "Deputado Federal":
        return Landmark;
      case "Deputado Estadual":
        return Building;
      case "Presidente":
        return Flag;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Container */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                <Sliders className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Simulador de Desistência & Cenários Eleitorais
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-3xl">
              Simule a retirada de candidatos e redistribuição de votos{" "}
              <strong>rigorosamente isolada pelo mesmo cargo eletivo</strong> (Governo ➔ Governo,
              Senado ➔ Senado, etc.), utilizando como fonte oficial e exclusiva a aba{" "}
              <strong>Diagnóstico (Pesquisa)</strong> com certificação CONRE 10801.
            </p>
          </div>

          {/* Research Selector & Reset Button */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedPollId}
                onChange={(e) => {
                  setSelectedPollId(e.target.value);
                  handleReset();
                }}
                className="text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {allPolls.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.institute || "CTAS"} • {getPollDateBR(p)} ({p.sampleSize || 1000} ent.)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-all"
              title="Redefinir simulação para os valores originais"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Redefinir
            </button>
          </div>
        </div>

        {/* Cargo Selector Tabs (Strict Cargo Isolation Mandatory) */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mr-2">
            Cargo Eletivo:
          </span>
          {(
            [
              "Governador",
              "Senador",
              "Deputado Federal",
              "Deputado Estadual",
              "Presidente"
            ] as ElectoralRole[]
          ).map((role) => {
            const Icon = getRoleIcon(role);
            const isSelected = selectedRole === role;

            return (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  handleReset();
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30"
                    : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Pipeline Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1 rounded-full ${
              roleSurveyResult.hasData
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
            }`}
          >
            {roleSurveyResult.hasData ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white">
                Validação Obrigatória: Candidato ➔ Cargo ({selectedRole}) ➔ Eleição 2026 ➔ Diagnóstico (Pesquisa)
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  roleSurveyResult.hasData
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                }`}
              >
                {roleSurveyResult.hasData ? "BASE AUDITADA" : "SEM DADOS NA BASE"}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
              {roleSurveyResult.statusMessage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
          <span className="bg-gray-200 dark:bg-slate-800 px-2 py-1 rounded font-mono">
            Isolamento: {selectedRole} ➔ {selectedRole}
          </span>
        </div>
      </div>

      {/* ZERO HALLUCINATION GUARD: If no data found for this cargo, display anti-hallucination box */}
      {!roleSurveyResult.hasData ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-base font-black text-amber-900 dark:text-amber-200">
              DADO NÃO ENCONTRADO NA BASE DE CONHECIMENTO.
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              A pesquisa eleitoral selecionada (<strong>{currentPoll?.institute || "CTAS"}</strong>)
              não possui coluna, questionário ou registros tabulados para o cargo de{" "}
              <strong>{selectedRole}</strong> na aba <strong>Diagnóstico (Pesquisa)</strong>.
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
              O sistema cumpre rigorosamente as normas de integridade estatística (CONRE 10801) e a
              diretriz anti-alucinação, sendo proibido inventar votos, estimar números inexistentes ou
              misturar candidatos de outros cargos.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedRole("Governador")}
              className="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all cursor-pointer"
            >
              Ver Disputa ao Governo do Estado
            </button>
            {allPolls.length > 1 && (
              <button
                onClick={() => {
                  const other = allPolls.find((p) => p.id !== selectedPollId);
                  if (other) setSelectedPollId(other.id);
                }}
                className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Alternar para Outra Pesquisa
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Main Simulation Layout when Data is Validated */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 1: Simular Desistência (Strictly Same Cargo) */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  1. Simular Desistência de Candidato
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded font-mono">
                  {selectedRole}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Selecione qual candidato a <strong>{selectedRole}</strong> deixará a disputa. Seus
                votos serão transferidos <strong>única e exclusivamente</strong> para os demais
                candidatos que disputam o mesmo cargo.
              </p>

              <select
                value={removedCandidate}
                onChange={(e) => setRemovedCandidate(e.target.value)}
                className="w-full text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="none">Nenhum (Todos os candidatos a {selectedRole} na disputa)</option>
                {roleSurveyResult.candidates.map((c) => (
                  <option key={c.name} value={c.name}>
                    Retirar {c.name} ({c.pctSample}% amostra | {c.pctValid}% válidos)
                  </option>
                ))}
              </select>

              {removedCandidate !== "none" && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Votos de {removedCandidate} redistribuídos entre candidatos a {selectedRole}:
                  </div>
                  <p className="text-[11px] opacity-90">
                    {secondOptionData.hasData
                      ? `Base de redistribuição: Matriz real de 2ª opção para ${selectedRole} (${secondOptionData.totalAnswered} questionários auditados).`
                      : `Base de redistribuição: Proporção direta entre os demais candidatos que disputam o cargo de ${selectedRole}.`}
                  </p>
                </div>
              )}
            </div>

            {/* Card 2: Conversão de Indecisos */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  2. Cristalização & Conversão de Indecisos
                </h3>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                  {undecidedConversion}% convertidos
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Taxa de indecisos na base de {selectedRole}:{" "}
                <strong>{roleSurveyResult.indecisosPct}%</strong>. Defina quantos % desses eleitores
                decidem seu voto na reta final.
              </p>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={undecidedConversion}
                onChange={(e) => setUndecidedConversion(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>0% (Indecisos continuam nulos)</span>
                <span>50% (Padrão histórico)</span>
                <span>100% (Todos decidem)</span>
              </div>
            </div>

            {/* Card 3: Abstenção no Dia da Eleição */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-500" />
                  3. Taxa Estimada de Abstenção
                </h3>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                  {abstentionRate}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Média histórica em Sergipe (TSE): abstenção típica de 16% a 20% do eleitorado apto.
              </p>

              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={abstentionRate}
                onChange={(e) => setAbstentionRate(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Action Card: Export Tactical Report */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Relatório Executivo
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded font-mono">
                  CONRE 10801
                </span>
              </div>
              <h4 className="text-sm font-bold">
                Exportar Roteiro Estratégico de Desistência
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gere o diagnóstico textual pronto para WhatsApp ou reuniões de comando com todas as
                métricas auditadas de <strong>{selectedRole}</strong>.
              </p>

              <button
                onClick={handleCopyScript}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Copiado para a Área de Transferência!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Diagnóstico Tático
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Results Panel (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Victory / Outcome Banner */}
            {simulatedResults && (
              <div
                className={`rounded-xl p-5 border shadow-sm flex items-center justify-between transition-all ${
                  simulatedResults.isFirstRoundVictory
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100"
                    : "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      simulatedResults.isFirstRoundVictory
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                      Projeção do Cenário ({selectedRole})
                    </span>
                    <h3 className="text-base font-black">
                      {selectedRole === "Governador" || selectedRole === "Presidente" ? (
                        simulatedResults.isFirstRoundVictory ? (
                          `Vitória em 1º Turno de ${simulatedResults.leader?.name} (${simulatedResults.leader?.validPct}% dos Válidos)!`
                        ) : (
                          `Segundo Turno Provável: ${simulatedResults.candidates[0]?.name} (${simulatedResults.candidates[0]?.validPct}%) vs ${simulatedResults.candidates[1]?.name} (${simulatedResults.candidates[1]?.validPct}%)`
                        )
                      ) : (
                        `Líder da Disputa ao ${selectedRole}: ${simulatedResults.leader?.name} com ${simulatedResults.leader?.validPct}% dos Votos Válidos`
                      )}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Results Table */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Resultado Simulado — Votos Válidos Oficiais (TSE)
                  </h3>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">
                    Candidatos ao cargo de <strong>{selectedRole}</strong> (Base 100% Nominais)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-1 rounded">
                  {removedCandidate !== "none" ? `Sem ${removedCandidate}` : "Cenário Base"}
                </span>
              </div>

              <div className="p-5 space-y-5">
                {simulatedResults?.candidates.map((cand, index) => {
                  const isLeader = index === 0;
                  const isOver50 =
                    (selectedRole === "Governador" || selectedRole === "Presidente") &&
                    cand.validPct > 50.0;
                  const deltaSign = cand.deltaValid >= 0 ? `+${cand.deltaValid}` : `${cand.deltaValid}`;

                  return (
                    <div key={cand.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              isLeader
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {cand.name}
                          </span>
                          {cand.party && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              ({cand.party})
                            </span>
                          )}
                          {isOver50 && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                              Eleito 1º Turno
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-gray-400 text-[11px]">
                            Original: {cand.originalValid}%
                          </span>
                          <span
                            className={`text-[11px] font-bold ${
                              cand.deltaValid > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : cand.deltaValid < 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-gray-400"
                            }`}
                          >
                            ({deltaSign} p.p.)
                          </span>
                          <span
                            className={`font-black text-sm ${
                              isLeader
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-800 dark:text-slate-200"
                            }`}
                          >
                            {cand.validPct}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar with 50% Threshold Mark */}
                      <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden relative">
                        {(selectedRole === "Governador" || selectedRole === "Presidente") && (
                          <div
                            className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-rose-500/60 z-10"
                            title="Linha de 50% + 1 para vitória em 1º Turno"
                          />
                        )}
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver50
                              ? "bg-emerald-500"
                              : isLeader
                              ? "bg-blue-600"
                              : "bg-slate-400 dark:bg-slate-600"
                          }`}
                          style={{ width: `${Math.min(cand.validPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Footer */}
              <div className="p-4 bg-gray-50 dark:bg-slate-950/50 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-slate-400 gap-2">
                <span>
                  Indecisos Restantes:{" "}
                  <strong>{simulatedResults?.simulatedUndecided}%</strong>
                </span>
                <span>
                  Brancos/Nulos:{" "}
                  <strong>{simulatedResults?.simulatedInvalid}%</strong>
                </span>
                <span>
                  Total Válidos:{" "}
                  <strong>{simulatedResults?.totalSimulatedValid}%</strong>
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  Amostra Base: {roleSurveyResult.totalAnswered} respostas
                </span>
              </div>
            </div>

            {/* Firmeza / Cristalização Data (if present in microdata) */}
            {crystalData.hasData && (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Firmeza do Voto no Questionário Auditado ({selectedRole})
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                    <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
                      Voto Definitivo (Cristalizado)
                    </span>
                    <span className="text-lg font-black text-emerald-900 dark:text-emerald-100">
                      {crystalData.overall.definitivo}%
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
                    <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold block">
                      Pode Mudar (Volátil)
                    </span>
                    <span className="text-lg font-black text-amber-900 dark:text-amber-100">
                      {crystalData.overall.podeMudar}%
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-slate-400 font-semibold block">
                      Não Sabe / Indeciso
                    </span>
                    <span className="text-lg font-black text-gray-800 dark:text-slate-200">
                      {crystalData.overall.indeciso}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

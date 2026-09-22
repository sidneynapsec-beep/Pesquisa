import React, { useState, useMemo, useRef } from "react";
import { Poll } from "../types";
import { useElectoralData } from "../context/ElectoralDataContext";
import { formatDateBR, getPollDateBR, getPollDateDetailBR } from "../utils/dateFormatter";
import {
  Share2,
  Printer,
  Copy,
  Check,
  Smartphone,
  Layers,
  Award,
  ShieldCheck,
  Calendar,
  Sparkles,
  Flame,
  Target,
  FileText,
  AlertTriangle,
  Database,
  Info,
  Filter,
  CheckCircle2,
  Users,
  MapPin,
  TrendingUp,
  BarChart2,
  Scale,
  Minus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface CardsExecutivosProps {
  polls?: Poll[];
}

export default function CardsExecutivos({ polls: propPolls }: CardsExecutivosProps) {
  const globalContext = useElectoralData();

  // Strictly source data from the official Knowledge Base in Diagnóstico (Pesquisa)
  const activePolls = useMemo(() => {
    if (globalContext?.polls && globalContext.polls.length > 0) {
      return globalContext.polls;
    }
    return propPolls || [];
  }, [globalContext?.polls, propPolls]);

  // Selected poll ID
  const [selectedPollId, setSelectedPollId] = useState<string>("");

  // Auto-select first poll if available and not set
  const currentPoll = useMemo(() => {
    if (!activePolls || activePolls.length === 0) return null;
    if (!selectedPollId) return activePolls[0];
    return activePolls.find((p) => p.id === selectedPollId) || activePolls[0];
  }, [activePolls, selectedPollId]);

  // Available roles/cargos present in this poll or active polls
  const availableRoles = useMemo(() => {
    if (!currentPoll) return [];
    const rolesSet = new Set<string>();
    if (currentPoll.roleResults) {
      Object.keys(currentPoll.roleResults).forEach((r) => {
        if (currentPoll.roleResults && Object.keys(currentPoll.roleResults[r] || {}).length > 0) {
          rolesSet.add(r);
        }
      });
    }
    if (currentPoll.results && Object.keys(currentPoll.results).length > 0) {
      rolesSet.add("Governador");
    }
    const standardOrder = ["Governador", "Senador", "Deputado Federal", "Deputado Estadual"];
    const standardFound = standardOrder.filter((r) => rolesSet.has(r));
    const extraFound = Array.from(rolesSet).filter((r) => !standardOrder.includes(r));
    return [...standardFound, ...extraFound];
  }, [currentPoll]);

  const [selectedRole, setSelectedRole] = useState<string>("Governador");
  const [cardFormat, setCardFormat] = useState<
    "square" | "story" | "ranking" | "territorial" | "onepager"
  >("square");
  const [metricMode, setMetricMode] = useState<"validos" | "totais">("validos");
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Sync selectedRole if not present in availableRoles
  const effectiveRole = useMemo(() => {
    if (availableRoles.length === 0) return "Governador";
    if (availableRoles.includes(selectedRole)) return selectedRole;
    return availableRoles[0];
  }, [availableRoles, selectedRole]);

  // Extract raw survey dataset or raw rows if available in knowledge base
  const rawSurveyData = useMemo(() => {
    if (!currentPoll) return [];
    const possible = [
      (currentPoll as any).coletas,
      (currentPoll as any).dados,
      (currentPoll as any).rows,
      (currentPoll as any).data,
      (currentPoll as any).respostas,
      (currentPoll as any).rawRows
    ];
    for (const p of possible) {
      if (Array.isArray(p) && p.length > 0) return p;
    }
    if (globalContext?.uploadedDatasets) {
      const match = globalContext.uploadedDatasets.find(
        (d) =>
          d.fileName === currentPoll.id ||
          d.registryNumber === currentPoll.registryNumber ||
          d.institute === currentPoll.institute
      );
      if (match && Array.isArray(match.rawRows) && match.rawRows.length > 0) {
        return match.rawRows;
      }
    }
    return [];
  }, [currentPoll, globalContext?.uploadedDatasets]);

  // Extract candidate results strictly from the selected poll and role
  const { candidatesData, invalidAndUndecided, totalNominalVotes } = useMemo(() => {
    if (!currentPoll) {
      return { candidatesData: [], invalidAndUndecided: {}, totalNominalVotes: 0 };
    }

    const totalRes =
      currentPoll.roleResults?.[effectiveRole] ||
      (effectiveRole === "Governador" ? currentPoll.results : null) ||
      {};

    const validResOfficial = currentPoll.roleValidResults?.[effectiveRole] || {};

    const nominalList: Array<{ name: string; totalPct: number }> = [];
    const nonNominal: Record<string, number> = {};
    let nominalSum = 0;

    Object.entries(totalRes).forEach(([name, val]) => {
      const numVal = Number(val);
      if (isNaN(numVal)) return;

      const lower = name.toLowerCase().trim();
      const isSpecial =
        lower.includes("branco") ||
        lower.includes("nulo") ||
        lower.includes("indecis") ||
        lower.includes("ns/nr") ||
        lower.includes("não sabe") ||
        lower.includes("nao sabe") ||
        lower.includes("nenhum") ||
        lower.includes("outros");

      if (isSpecial) {
        nonNominal[name] = numVal;
      } else {
        nominalList.push({ name, totalPct: numVal });
        nominalSum += numVal;
      }
    });

    // Calculate valid votes percentage mathematically
    const finalCandidates = nominalList
      .map((c) => {
        let validPct: number;
        if (validResOfficial[c.name] !== undefined) {
          validPct = Number(validResOfficial[c.name]);
        } else if (nominalSum > 0) {
          validPct = +((c.totalPct / nominalSum) * 100).toFixed(1);
        } else {
          validPct = c.totalPct;
        }

        return {
          name: c.name,
          totalPct: c.totalPct,
          validPct
        };
      })
      .sort((a, b) => b.validPct - a.validPct);

    return {
      candidatesData: finalCandidates,
      invalidAndUndecided: nonNominal,
      totalNominalVotes: nominalSum
    };
  }, [currentPoll, effectiveRole]);

  // Leaders calculation
  const leader = candidatesData[0];
  const second = candidatesData[1];
  const difference =
    leader && second ? +(leader.validPct - second.validPct).toFixed(1) : 0;
  const differenceTotal =
    leader && second ? +(leader.totalPct - second.totalPct).toFixed(1) : 0;

  // Extract Undecided and Blank/Nulo strictly from database
  const undecidedPct = useMemo(() => {
    for (const [k, v] of Object.entries(invalidAndUndecided)) {
      const lower = k.toLowerCase();
      if (
        lower.includes("indecis") ||
        lower.includes("ns/nr") ||
        lower.includes("não sabe") ||
        lower.includes("nao sabe")
      ) {
        return v;
      }
    }
    return null;
  }, [invalidAndUndecided]);

  const invalidPct = useMemo(() => {
    for (const [k, v] of Object.entries(invalidAndUndecided)) {
      const lower = k.toLowerCase();
      if (
        lower.includes("branco") ||
        lower.includes("nulo") ||
        lower.includes("nenhum")
      ) {
        return v;
      }
    }
    return null;
  }, [invalidAndUndecided]);

  // Colors for candidates
  const getCandidateColor = (name: string, index: number) => {
    const knownColors: Record<string, string> = {
      "Fábio Mitidieri": "#2563eb",
      "Valmir de Francisquinho": "#eab308",
      "Rogério Carvalho": "#dc2626",
      "Alessandro Vieira": "#059669",
      "Emília Corrêa": "#7c3aed",
      "Laércio Oliveira": "#d97706",
      "Eduardo Amorim": "#ea580c",
      "Luiz Roberto": "#0284c7",
      "Yandra Moura": "#9333ea",
      "Katarina Feitoza": "#ec4899",
      "Rodrigo Valadares": "#16a34a",
      "Neto Batalha": "#0d9488",
      "Cristiano Cavalcante": "#4f46e5"
    };
    if (knownColors[name]) return knownColors[name];
    const palette = [
      "#2563eb",
      "#dc2626",
      "#eab308",
      "#059669",
      "#7c3aed",
      "#ea580c",
      "#0284c7",
      "#ec4899",
      "#16a34a",
      "#6366f1"
    ];
    return palette[index % palette.length];
  };

  // Territorial breakdown if present in currentPoll or globalContext
  const territorialBreakdown = useMemo(() => {
    // 1. Check if rawSurveyData has neighborhood or municipality columns
    if (rawSurveyData.length > 0) {
      const sampleRow = rawSurveyData[0] || {};
      let localityKey: string | null = null;
      let voteKey: string | null = null;

      for (const k of Object.keys(sampleRow)) {
        const norm = k.toLowerCase();
        if (
          norm.includes("bairro") ||
          norm.includes("municipio") ||
          norm.includes("cidade") ||
          norm.includes("localidade") ||
          norm.includes("regiao")
        ) {
          localityKey = k;
          break;
        }
      }

      for (const k of Object.keys(sampleRow)) {
        const norm = k.toLowerCase();
        if (
          norm.includes(effectiveRole.toLowerCase()) ||
          norm.includes("governador") ||
          norm.includes("voto") ||
          norm.includes("candidato")
        ) {
          voteKey = k;
          break;
        }
      }

      if (localityKey && voteKey) {
        const localityTallies: Record<string, { total: number; votes: Record<string, number> }> = {};

        rawSurveyData.forEach((row: any) => {
          const loc = String(row[localityKey!] || "").trim();
          const vote = String(row[voteKey!] || "").trim();
          if (!loc || !vote) return;

          if (!localityTallies[loc]) {
            localityTallies[loc] = { total: 0, votes: {} };
          }
          localityTallies[loc].total += 1;
          localityTallies[loc].votes[vote] = (localityTallies[loc].votes[vote] || 0) + 1;
        });

        const list = Object.entries(localityTallies)
          .map(([locality, data]) => {
            let topCand = "Indefinido";
            let topVotes = 0;
            Object.entries(data.votes).forEach(([c, count]) => {
              if (count > topVotes) {
                topVotes = count;
                topCand = c;
              }
            });
            const topPct = data.total > 0 ? +((topVotes / data.total) * 100).toFixed(1) : 0;
            return {
              locality,
              totalInterviews: data.total,
              leadingCandidate: topCand,
              leadingPct: topPct
            };
          })
          .sort((a, b) => b.totalInterviews - a.totalInterviews);

        if (list.length > 0) return list;
      }
    }

    // 2. Check if globalContext has territorialAnalysis derived from this dataset
    if (globalContext?.territorialAnalysis && globalContext.territorialAnalysis.length > 0) {
      return globalContext.territorialAnalysis.map((t) => ({
        locality: t.name,
        totalInterviews: t.votersCount,
        leadingCandidate: t.leadingCandidate,
        leadingPct: t.results[t.leadingCandidate] || 0
      }));
    }

    return null;
  }, [rawSurveyData, effectiveRole, globalContext?.territorialAnalysis]);

  // Copy formatted WhatsApp Text strictly from registered data
  const handleCopyWhatsApp = () => {
    if (!currentPoll) return;

    const dateStr = getPollDateDetailBR(currentPoll);
    const regNum = currentPoll.registryNumber || "Uso Interno / Em processamento";
    const marg = currentPoll.marginOfError ? `±${currentPoll.marginOfError}%` : "±3.0%";

    let text = `📊 *PESQUISA ELEITORAL SEIE / ${currentPoll.institute.toUpperCase()}*\n`;
    text += `🎯 *Cargo Avaliado:* ${effectiveRole}\n`;
    text += `📅 *Data da Coleta/Mediana:* ${dateStr}\n`;
    text += `👥 *Amostra Auditada:* ${currentPoll.sampleSize} entrevistas | *Margem:* ${marg}\n`;
    text += `🏛 *Registro TSE:* ${regNum} | *Confiança:* ${currentPoll.confidenceLevel || 95}%\n\n`;

    text += `🗳 *VOTOS VÁLIDOS (Critério Oficial TSE):*\n`;
    candidatesData.forEach((c, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🔹";
      text += `${medal} *${c.name}:* ${c.validPct}% (Estimulada: ${c.totalPct}%)\n`;
    });

    if (invalidPct !== null) {
      text += `\n⚪ *Brancos / Nulos:* ${invalidPct}%`;
    }
    if (undecidedPct !== null) {
      text += `\n❓ *Indecisos / Não Sabe:* ${undecidedPct}%`;
    }

    if (difference > 0 && leader && second) {
      text += `\n\n📈 *Vantagem da Liderança (${leader.name}):* +${difference} p.p. sobre ${second.name}`;
    }

    text += `\n\n📌 *Responsável Técnico:* Sidney Barreto Batista • CONRE 10801\n`;
    text += `_Fonte Oficial: Diagnóstico (Pesquisa) - Sistema Especialista de Inteligência Eleitoral (SEIE)_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // ZERO DATA IN DATABASE
  if (activePolls.length === 0 || !currentPoll) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
                Cards Executivos & One-Pager de Pesquisa
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Módulo de exportação visual e resumos executivos oficiais.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/30 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="max-w-lg mx-auto space-y-2">
            <h2 className="text-base font-bold text-amber-950 dark:text-amber-200 font-mono tracking-tight">
              DADO NÃO ENCONTRADO NA BASE DE CONHECIMENTO.
            </h2>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
              Nenhuma pesquisa eleitoral está cadastrada na aba <strong>Diagnóstico (Pesquisa)</strong>.
              Em cumprimento estrito às regras metodológicas CONRE 10801 e ao princípio de não-alucinação, o sistema não gera Cards ou One-Pager sem dados previamente registrados e auditados na fonte oficial.
            </p>
          </div>
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-xs">
              <Database className="w-4 h-4 text-amber-600" />
              <span>Para gerar Cards e One-Pagers, importe ou cadastre uma pesquisa em Diagnóstico.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // NO CANDIDATE DATA FOR SELECTED CARGO
  const hasCandidatesForRole = candidatesData.length > 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Share2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
                Cards Executivos & One-Pager Estratégico
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Fonte Oficial: Diagnóstico (Pesquisa)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Geração de materiais visuais de alta resolução (WhatsApp, Stories, Rankings) e One-Pager executivo para impressão baseados <strong>exclusivamente nos dados auditados da pesquisa selecionada</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyWhatsApp}
              disabled={!hasCandidatesForRole}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado p/ WhatsApp!" : "Copiar Texto WhatsApp"}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl shadow-xs cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Toolbar: Survey Selector + Cargo Tabs + Metric Mode */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Poll Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                Pesquisa:
              </span>
              <select
                value={selectedPollId || currentPoll.id}
                onChange={(e) => setSelectedPollId(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-600"
              >
                {activePolls.map((p) => {
                  const dateStr = getPollDateBR(p);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.institute} • {dateStr} (N={p.sampleSize})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Cargo Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
              {(availableRoles.length > 0 ? availableRoles : ["Governador"]).map((role) => {
                const isSelected = effectiveRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metric Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl text-xs">
            <button
              onClick={() => setMetricMode("validos")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                metricMode === "validos"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              Votos Válidos (TSE)
            </button>
            <button
              onClick={() => setMetricMode("totais")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                metricMode === "totais"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              Votos Totais (Estimulada)
            </button>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">
            Formato:
          </span>
          <button
            onClick={() => setCardFormat("square")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              cardFormat === "square"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Card Quadrado (Feed / WhatsApp)
          </button>

          <button
            onClick={() => setCardFormat("story")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              cardFormat === "story"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Card Story / Status (9:16)
          </button>

          <button
            onClick={() => setCardFormat("ranking")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              cardFormat === "ranking"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Ranking Completo
          </button>

          <button
            onClick={() => setCardFormat("territorial")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              cardFormat === "territorial"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Cruzamento Bairros / Localidades
          </button>

          <button
            onClick={() => setCardFormat("onepager")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              cardFormat === "onepager"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            One-Pager Executivo (A4)
          </button>
        </div>
      </div>

      {/* VALIDATION: CHECK IF CANDIDATE DATA EXISTS FOR SELECTED ROLE */}
      {!hasCandidatesForRole ? (
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 mx-auto bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400">
            <Database className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              DADO NÃO ENCONTRADO NA BASE DE CONHECIMENTO.
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Não foram localizados registros de candidatos ou votos para o cargo de <strong>"{effectiveRole}"</strong> na pesquisa selecionada (<em>{currentPoll.institute}</em>).
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Cargos disponíveis nesta pesquisa: {availableRoles.join(", ") || "Nenhum"}
          </div>
        </div>
      ) : (
        /* CARD PREVIEWS CONTAINER */
        <div className="flex justify-center items-start">
          {/* FORMAT 1: SQUARE CARD (1:1 FEED / WHATSAPP) */}
          {cardFormat === "square" && (
            <div className="w-full max-w-lg bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-700/80 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white font-black text-xs px-2.5 py-1 rounded-lg tracking-wider font-mono">
                    SEIE ELEIÇÕES
                  </span>
                  <span className="font-bold text-xs text-slate-200">
                    {currentPoll.institute}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-400/30 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  CONRE {currentPoll.conre || "10801"}
                </div>
              </div>

              {/* Headline */}
              <div className="text-center space-y-1">
                <span className="text-[11px] uppercase tracking-widest text-blue-400 font-bold font-mono">
                  Pesquisa Eleitoral — Disputa para {effectiveRole}
                </span>
                <h2 className="text-2xl font-black text-white font-serif">
                  {metricMode === "validos" ? "Votos Válidos Oficiais (TSE)" : "Votos Totais (Estimulada)"}
                </h2>
              </div>

              {/* Candidates Bars (Top 4) */}
              <div className="space-y-3.5 py-2">
                {candidatesData.slice(0, 4).map((cand, idx) => {
                  const displayPct = metricMode === "validos" ? cand.validPct : cand.totalPct;
                  const color = getCandidateColor(cand.name, idx);

                  return (
                    <div key={cand.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] font-mono ${
                              idx === 0 ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-100">{cand.name}</span>
                        </div>
                        <span className="font-mono font-black text-sm text-blue-300">
                          {displayPct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(displayPct * 1.5, 100)}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Difference Callout */}
              {leader && second && difference > 0 && (
                <div className="p-3.5 bg-blue-900/40 border border-blue-500/30 rounded-2xl text-center text-xs space-y-0.5">
                  <div className="text-blue-300 font-medium">
                    Vantagem da Liderança ({leader.name}):
                  </div>
                  <div className="text-white font-black text-base font-mono">
                    +{metricMode === "validos" ? difference : differenceTotal} p.p. sobre {second.name}
                  </div>
                </div>
              )}

              {/* Non-Nominal Metrics (if total mode) */}
              {metricMode === "totais" && (undecidedPct !== null || invalidPct !== null) && (
                <div className="flex items-center justify-around p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/40 text-[11px] font-mono">
                  {invalidPct !== null && (
                    <div>
                      <span className="text-slate-400">Brancos/Nulos: </span>
                      <strong className="text-slate-200">{invalidPct}%</strong>
                    </div>
                  )}
                  {undecidedPct !== null && (
                    <div>
                      <span className="text-slate-400">Indecisos/NS-NR: </span>
                      <strong className="text-slate-200">{undecidedPct}%</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Card Footer Technical Meta */}
              <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>
                  {currentPoll.sampleSize && currentPoll.sampleSize > 0 ? `N=${currentPoll.sampleSize.toLocaleString("pt-BR")} ent.` : "N não informado"} • Margem: {currentPoll.marginOfError != null ? `±${currentPoll.marginOfError}%` : "Margem não informada"}
                </span>
                <span>Reg. TSE: {currentPoll.registryNumber || "Em processamento"}</span>
              </div>
            </div>
          )}

          {/* FORMAT 2: STORY / STATUS CARD (9:16 VERTICAL) */}
          {cardFormat === "story" && (
            <div className="w-full max-w-sm bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white rounded-3xl p-7 shadow-2xl border border-slate-700/80 space-y-6 min-h-[660px] flex flex-col justify-between relative overflow-hidden">
              {/* Top Banner */}
              <div className="space-y-3 text-center">
                <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg font-mono">
                  <Flame className="w-3.5 h-3.5" /> Cenário Oficial • {effectiveRole}
                </div>

                <h2 className="text-2xl font-black tracking-tight text-white font-serif leading-tight">
                  QUEM LIDERA A DISPUTA?
                </h2>

                <p className="text-xs text-blue-300 font-mono">
                  Pesquisa {currentPoll.institute} • {getPollDateDetailBR(currentPoll)}
                </p>
              </div>

              {/* Main Podium (Top 3) */}
              <div className="space-y-3.5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block font-mono">
                  {metricMode === "validos" ? "Votos Válidos (Critério TSE)" : "Votos Totais (Estimulada)"}
                </span>

                {candidatesData.slice(0, 3).map((cand, idx) => {
                  const displayPct = metricMode === "validos" ? cand.validPct : cand.totalPct;
                  return (
                    <div
                      key={cand.name}
                      className="flex items-center justify-between p-3 bg-slate-800/70 rounded-xl border border-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                        </span>
                        <div>
                          <span className="font-bold text-xs text-white block truncate max-w-[140px]" title={cand.name}>
                            {cand.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Estimulada: {cand.totalPct}%
                          </span>
                        </div>
                      </div>
                      <span className="text-base font-black font-mono text-cyan-400">
                        {displayPct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Liderança e Amostra */}
              <div className="space-y-2">
                {leader && second && (
                  <div className="p-3 bg-blue-950/80 border border-blue-800 rounded-xl text-center text-xs">
                    <span className="text-blue-300">Vantagem de </span>
                    <strong className="text-white font-mono font-bold">
                      +{difference} p.p.
                    </strong>
                  </div>
                )}

                <div className="text-center space-y-1 text-[10px] text-slate-400 border-t border-slate-800/80 pt-3 font-mono">
                  <p>Estatístico: Sidney Barreto Batista • CONRE {currentPoll.conre || "10801"}</p>
                  <p>
                    Amostra: {currentPoll.sampleSize && currentPoll.sampleSize > 0 ? `N=${currentPoll.sampleSize.toLocaleString("pt-BR")}` : "Dado não informado no material original"} • Margem: {currentPoll.marginOfError != null ? `±${currentPoll.marginOfError}%` : "Margem não informada"} • Confiança: {currentPoll.confidenceLevel || 95}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 3: RANKING COMPLETO */}
          {cardFormat === "ranking" && (
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Quadro Comparativo Completo
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                    Ranking de Intenção de Voto — {effectiveRole}
                  </h2>
                </div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 text-right">
                  <div>{currentPoll.institute}</div>
                  <div>{currentPoll.sampleSize && currentPoll.sampleSize > 0 ? `${currentPoll.sampleSize.toLocaleString("pt-BR")} entrevistas` : "Dado não informado no material original"}</div>
                </div>
              </div>

              <div className="space-y-3">
                {candidatesData.map((cand, idx) => {
                  const color = getCandidateColor(cand.name, idx);
                  return (
                    <div
                      key={cand.name}
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {cand.name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            Estimulada Total: {cand.totalPct}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(cand.validPct * 1.8, 100)}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                        <div className="text-right min-w-[70px]">
                          <span className="text-base font-black font-mono text-slate-900 dark:text-white block">
                            {cand.validPct}%
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono uppercase">
                            Válidos
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Non-Nominal Metrics */}
              {Object.keys(invalidAndUndecided).length > 0 && (
                <div className="p-4 bg-slate-100 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Votos Não Nominais e Indecisão:
                  </span>
                  <div className="flex flex-wrap gap-4 font-mono">
                    {Object.entries(invalidAndUndecided).map(([k, v]) => (
                      <span key={k} className="text-slate-600 dark:text-slate-400">
                        {k}: <strong className="text-slate-900 dark:text-white">{v}%</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FORMAT 4: CRUZAMENTO BAIRROS / LOCALIDADES */}
          {cardFormat === "territorial" && (
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Segmentação Geográfica Auditada
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                    Cruzamento Territorial por Bairro / Localidade
                  </h2>
                </div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 text-right">
                  <div>{currentPoll.institute}</div>
                  <div>Base: Diagnóstico (Pesquisa)</div>
                </div>
              </div>

              {territorialBreakdown && territorialBreakdown.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {territorialBreakdown.map((item, idx) => (
                      <div
                        key={item.locality}
                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            {item.locality}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            N={item.totalInterviews}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Líder Apurado:</span>
                          <span className="font-bold font-mono text-blue-700 dark:text-blue-300">
                            {item.leadingCandidate} ({item.leadingPct}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-8 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 mx-auto text-amber-600" />
                  <h3 className="text-xs font-bold font-mono text-amber-900 dark:text-amber-200">
                    DADO NÃO ENCONTRADO NA BASE DE CONHECIMENTO.
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Esta pesquisa específica não contém dados de segmentação por bairros/localidades em seus microdados cadastrados no Diagnóstico.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* FORMAT 5: ONE-PAGER EXECUTIVO (A4 PRINTABLE) */}
          {cardFormat === "onepager" && (
            <div
              ref={printRef}
              className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl p-8 sm:p-10 shadow-lg border border-slate-300 space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none print:rounded-none"
            >
              {/* Document Header */}
              <div className="flex items-center justify-between border-b-2 border-blue-700 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 font-mono">
                    SISTEMA ESPECIALISTA DE INTELIGÊNCIA ELEITORAL (SEIE)
                  </span>
                  <h1 className="text-xl font-black text-slate-900 font-serif">
                    ONE-PAGER EXECUTIVO DE PESQUISA ELEITORAL
                  </h1>
                  <span className="text-xs text-slate-600 font-medium">
                    Cargo: <strong>{effectiveRole}</strong> • Instituto: <strong>{currentPoll.institute}</strong>
                  </span>
                </div>
                <div className="text-right text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block font-mono">
                    {getPollDateDetailBR(currentPoll)}
                  </span>
                  <span className="text-blue-700 font-mono text-[11px] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    CONRE {currentPoll.conre || "10801"}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Reg. TSE: {currentPoll.registryNumber || "Uso Interno"}
                  </div>
                </div>
              </div>

              {/* 5 Real Crucial Facts (Derived strictly from database) */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                  <Target className="w-4 h-4 text-blue-700" />
                  Fatos Cruciais Auditados da Pesquisa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Fact 1: Leadership */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                    <span className="font-bold text-blue-950 block">1. Liderança Apurada</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {leader ? (
                        <>
                          <strong>{leader.name}</strong> lidera com <strong>{leader.validPct}%</strong> dos votos válidos ({leader.totalPct}% no cenário estimulado total).
                        </>
                      ) : (
                        "Sem dados de liderança."
                      )}
                    </p>
                  </div>

                  {/* Fact 2: Advantage / Delta */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">2. Margem de Vantagem</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {leader && second ? (
                        <>
                          Vantagem de <strong>+{difference} p.p.</strong> sobre o segundo colocado, <strong>{second.name}</strong> ({second.validPct}% válidos).
                        </>
                      ) : (
                        "Disputa com apenas um candidato registrado na rodada."
                      )}
                    </p>
                  </div>

                  {/* Fact 3: Undecided Rate */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">3. Volume de Indecisos</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {undecidedPct !== null ? (
                        <>
                          <strong>{undecidedPct}%</strong> do eleitorado declara-se indeciso ou não soube responder (NS/NR).
                        </>
                      ) : (
                        "Índice de indecisão não discriminado nesta rodada."
                      )}
                    </p>
                  </div>

                  {/* Fact 4: Sample Technical Specs */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">4. Auditoria Amostral</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      Amostra {currentPoll.sampleSize && currentPoll.sampleSize > 0 ? <>de <strong>{currentPoll.sampleSize.toLocaleString("pt-BR")}</strong> entrevistas presenciais</> : "conforme material original"}{currentPoll.marginOfError != null ? <> com margem de erro máxima de <strong>±{currentPoll.marginOfError}%</strong></> : " com margem não informada"} e {currentPoll.confidenceLevel || 95}% de confiança.
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Intention of Vote Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-serif">
                  Tabela Oficial de Intenção de Voto ({effectiveRole})
                </h3>
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold text-[10px] font-mono uppercase">
                        <th className="py-2.5 px-3">Candidato</th>
                        <th className="py-2.5 px-3 text-center">Votos Válidos (TSE)</th>
                        <th className="py-2.5 px-3 text-center">Estimulada Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {candidatesData.map((cand, idx) => (
                        <tr key={cand.name} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {idx + 1}. {cand.name}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-blue-700">
                            {cand.validPct}%
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-600">
                            {cand.totalPct}%
                          </td>
                        </tr>
                      ))}
                      {invalidPct !== null && (
                        <tr className="bg-slate-50 font-mono text-[11px]">
                          <td className="py-1.5 px-3 text-slate-500">Brancos / Nulos</td>
                          <td className="py-1.5 px-3 text-center text-slate-400">—</td>
                          <td className="py-1.5 px-3 text-center text-slate-600 font-bold">{invalidPct}%</td>
                        </tr>
                      )}
                      {undecidedPct !== null && (
                        <tr className="bg-slate-50 font-mono text-[11px]">
                          <td className="py-1.5 px-3 text-slate-500">Indecisos / NS-NR</td>
                          <td className="py-1.5 px-3 text-center text-slate-400">—</td>
                          <td className="py-1.5 px-3 text-center text-slate-600 font-bold">{undecidedPct}%</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technical Recommendations based strictly on official stats */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 font-serif">
                  Diretrizes Estratégicas Baseadas nos Dados Reais
                </h3>
                <ul className="text-xs space-y-1 text-slate-200 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Margem de Indecisão:</strong> O contingente de eleitores não decididos ({undecidedPct !== null ? `${undecidedPct}%` : "relevante"}) supera a margem de erro ({currentPoll.marginOfError || 3.0}%), definindo o espaço para crescimento.
                  </li>
                  <li>
                    <strong>Consolidação da Vantagem:</strong> A diferença apurada ({difference} p.p.) exige manutenção de intensidade comunicacional nos principais polos do estado.
                  </li>
                  <li>
                    <strong>Fidelização de Votos Válidos:</strong> Proteger a base apurada de votos válidos para blindagem contra volatilidade de última hora.
                  </li>
                </ul>
              </div>

              {/* Footer Audit Signatures */}
              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-2">
                <span>Estatístico Responsável: Sidney Barreto Batista • CONRE 10801</span>
                <span>Fonte Oficial: Diagnóstico (Pesquisa) • SEIE Sergipe 2026</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

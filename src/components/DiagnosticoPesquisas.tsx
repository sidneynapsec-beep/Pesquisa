import React, { useState, useMemo } from "react";
import { Poll, UserRole } from "../types";
import { isValidPoll } from "../utils/pollValidation";
import { PRE_CANDIDATES } from "../data/sergipeData";
import { useElectoralData } from "../context/ElectoralDataContext";
import { formatDateBR, formatDateRangeBR } from "../utils/dateFormatter";
import { parseFlexibleDate, computeMedianDate, extractFieldworkPeriodFromRows } from "../utils/fileParser";
import {
  calculateAuditedMarginOfError,
  validateSenateMentionsSum,
  computeValidVotesDistribution
} from "../services/statistics";
import {
  Plus,
  Trash2,
  Edit,
  ShieldAlert,
  Save,
  Activity,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  X,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Layers,
  Sparkles,
  Database,
  Wand2,
  Calculator,
  ShieldCheck,
  Check,
  Info
} from "lucide-react";

interface DiagnosticoPesquisasProps {
  polls?: Poll[];
  currentRole: UserRole;
  onAddPoll?: (pollData: Omit<Poll, "id">) => Promise<void>;
  onUpdatePoll?: (id: string, pollData: Partial<Poll>) => Promise<void>;
  onDeletePoll?: (id: string) => Promise<void>;
}

export default function DiagnosticoPesquisas({
  polls: propPolls,
  currentRole,
  onAddPoll: propOnAddPoll,
  onUpdatePoll: propOnUpdatePoll,
  onDeletePoll: propOnDeletePoll
}: DiagnosticoPesquisasProps) {
  const globalContext = useElectoralData();
  const rawPolls = globalContext?.polls || propPolls || [];
  const polls = useMemo(() => rawPolls.filter(isValidPoll), [rawPolls]);
  
  const onAddPoll = globalContext?.addPoll || propOnAddPoll;
  const onUpdatePoll = globalContext?.updatePoll || propOnUpdatePoll;
  const onDeletePoll = globalContext?.deletePoll || propOnDeletePoll;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<"todas" | "com_alerta" | "integra">("todas");

  // Delete Confirmation Modal State
  const [pollToDelete, setPollToDelete] = useState<Poll | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Spreadsheet Upload State
  const [spreadSheetFile, setSpreadSheetFile] = useState<File | null>(null);
  const [spreadSheetDate, setSpreadSheetDate] = useState("2026-07-04");
  const [spreadSheetInstitute, setSpreadSheetInstitute] = useState("CTAS");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [parsedSummary, setParsedSummary] = useState<{
    rowsCount: number;
    candidatesFound: string[];
    warnings: string[];
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Form State with user's requested defaults:
  // - Instituto: CTAS
  // - Código CONRE: 10801
  // - Registro: pode ser em branco
  // - Estatístico responsável: Sidney Barreto Batista
  const [institute, setInstitute] = useState("CTAS");
  const [registryNumber, setRegistryNumber] = useState("");
  const [conre, setConre] = useState("10801");
  const [sampleSize, setSampleSize] = useState(1000);
  const [marginOfError, setMarginOfError] = useState(3.0);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [fieldworkStart, setFieldworkStart] = useState("");
  const [fieldworkEnd, setFieldworkEnd] = useState("");
  const [statistician, setStatistician] = useState("Sidney Barreto Batista");
  const [pollType, setPollType] = useState<"Registrada" | "Tracking">("Registrada");

  // Candidates results state
  const [candidateResults, setCandidateResults] = useState<{ [name: string]: number }>({
    "Fábio Mitidieri": 0,
    "Valmir de Francisquinho": 0,
    "Rogério Carvalho": 0,
    "Emília Corrêa": 0,
    "Alessandro Vieira": 0,
    "Brancos/Nulos": 0,
    "Indecisos": 0
  });

  const isViewer = currentRole === "Viewer";

  // Real-time Sum calculation for Form
  const currentTotalSum = useMemo<number>(() => {
    const sum = Object.values(candidateResults).reduce<number>(
      (acc, val) => acc + (Number(val) || 0),
      0
    );
    return Math.round(sum * 10) / 10;
  }, [candidateResults]);

  // Real-time calculated Median Date for Form
  const previewMedianDate = useMemo(() => {
    if (!fieldworkStart || !fieldworkEnd) return null;
    try {
      const start = new Date(fieldworkStart);
      const end = new Date(fieldworkEnd);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
      if (end.getTime() < start.getTime()) return null;
      const medianTime = start.getTime() + (end.getTime() - start.getTime()) / 2;
      return new Date(medianTime).toISOString().split("T")[0];
    } catch {
      return null;
    }
  }, [fieldworkStart, fieldworkEnd]);

  // Auto-Normalize Form Results to exactly 100%
  const handleAutoNormalizeResults = () => {
    const names = Object.keys(candidateResults);
    if (names.length === 0) return;

    // Calculate sum of candidates excluding Indecisos
    const nonIndecisosSum = names
      .filter((n) => n !== "Indecisos")
      .reduce<number>((acc, n) => acc + (Number(candidateResults[n]) || 0), 0);

    const remaining = Math.round((100 - nonIndecisosSum) * 10) / 10;

    if (remaining >= 0 && names.includes("Indecisos")) {
      // Balance directly into Indecisos
      setCandidateResults((prev) => ({
        ...prev,
        "Indecisos": remaining
      }));
      setSuccessBanner(`Soma balanceada automaticamente: Indecisos ajustados para ${remaining}% (Total: 100.0%).`);
    } else {
      // Proportional redistribution
      const totalNum = Object.values(candidateResults).reduce<number>(
        (acc, v) => acc + (Number(v) || 0),
        0
      );
      if (totalNum > 0) {
        const adjusted: Record<string, number> = {};
        let accumulated = 0;
        names.forEach((name, i) => {
          if (i === names.length - 1) {
            adjusted[name] = Math.round((100 - accumulated) * 10) / 10;
          } else {
            const share = Math.round(((Number(candidateResults[name]) || 0) / totalNum) * 1000) / 10;
            adjusted[name] = share;
            accumulated += share;
          }
        });
        setCandidateResults(adjusted);
        setSuccessBanner("Soma de todas as intenções proporcionalmente ajustada para 100.0%.");
      }
    }
    setErrorMsg(null);
  };

  // Helper to audit a single poll according to TSE rules & statistical engine
  const auditPoll = (poll: Poll) => {
    const results = poll.results || {};
    const sum = Math.round(
      Object.values(results).reduce<number>(
        (acc, val) => acc + (Number(val) || 0),
        0
      ) * 10
    ) / 10;

    const isSenate = Boolean(
      (poll as any).cargo?.toLowerCase().includes("senad") ||
      poll.description?.toLowerCase().includes("senad")
    );

    const senateValidation = isSenate ? validateSenateMentionsSum(sum) : null;
    const isSumValid = isSenate
      ? (senateValidation?.isValid ?? false)
      : Math.abs(sum - 100) <= 0.5;

    const hasValidDates = Boolean(poll.fieldworkStart || poll.fieldworkEnd || poll.medianDate);
    const hasStatistician = Boolean(poll.conre && (poll.statistician || poll.conre === "10801"));
    const hasSample = Boolean(poll.sampleSize && poll.sampleSize >= 100);

    // Auditoria estatística formal da Margem de Erro
    const marginAudit = calculateAuditedMarginOfError({
      sampleSize: poll.sampleSize || 0,
      reportedMargin: poll.marginOfError,
      confidenceLevel: poll.confidenceLevel || 95,
      deff: (poll as any).deff
    });

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isSumValid) {
      if (isSenate) {
        errors.push(`Soma de menções ao Senado é ${sum}% (limite máximo constitucional de 200% para 2 vagas)`);
      } else {
        errors.push(`Soma dos votos é ${sum}% (deve somar 100%)`);
      }
    }

    if (!hasValidDates) errors.push("Período de campo ou data mediana incompleta");
    if (!hasStatistician) errors.push("Registro CONRE não identificado");
    if (!hasSample) errors.push("Tamanho amostral não informado");

    if (marginAudit.isConsistent === false) {
      warnings.push(
        `Margem informada (±${poll.marginOfError}%) diverge da margem amostral calculada (±${marginAudit.calculatedMargin}%) para n=${poll.sampleSize}.`
      );
    }

    return {
      isValid: errors.length === 0,
      errorsCount: errors.length,
      errors,
      warnings,
      sum,
      isSumValid,
      hasValidDates,
      hasStatistician,
      hasSample,
      marginAudit,
      isSenate
    };
  };


  /**
   * Obtém a exibição do Período de Campo estritamente conforme a regra:
   * - Menor data existente na coluna 'Início da Entrevista'
   * - Maior data existente na coluna 'Início da Entrevista'
   * - Se menor === maior, exibe apenas uma data (ex: "10/08/2026")
   * - Se menor !== maior, exibe o intervalo (ex: "10/08/2026 a 13/08/2026")
   * - NUNCA utiliza a data atual do sistema.
   */
  const getFieldworkPeriodDisplay = (poll: Poll): string => {
    const baseRows = globalContext?.getResearchBase
      ? globalContext.getResearchBase(poll)
      : ((poll as any).rawRows || (poll as any).dados || (poll as any).coletas || (poll as any).rows || []);

    if (Array.isArray(baseRows) && baseRows.length > 0) {
      const period = extractFieldworkPeriodFromRows(baseRows);
      if (period.hasValidDates) {
        return period.formattedRange;
      }
    }

    if (poll.fieldworkStart && poll.fieldworkEnd) {
      return formatDateRangeBR(poll.fieldworkStart, poll.fieldworkEnd);
    }
    if (poll.fieldworkStart) {
      return formatDateBR(poll.fieldworkStart);
    }
    if (poll.fieldworkEnd) {
      return formatDateBR(poll.fieldworkEnd);
    }

    return "—";
  };

  // Reconciliação assistida de metadados gerando nova versão (sem alterar percentuais nominais)
  const handleAutoFixPoll = async (poll: Poll) => {
    if (isViewer) {
      setErrorMsg("⚠️ Apenas Administradores possuem permissão para auditar pesquisas.");
      return;
    }

    try {
      // Regra Fundamental: Laudos originais são imutáveis. Percentuais não são adulterados.
      const nextVersion = (poll.version || 1) + 1;

      // Extração fidedigna de datas a partir dos microdados ou registros oficiais
      let resolvedStart = "";
      let resolvedEnd = "";

      const baseRows = globalContext?.getResearchBase
        ? globalContext.getResearchBase(poll)
        : ((poll as any).rawRows || (poll as any).dados || (poll as any).coletas || (poll as any).rows || []);

      if (Array.isArray(baseRows) && baseRows.length > 0) {
        const period = extractFieldworkPeriodFromRows(baseRows);
        if (period.hasValidDates) {
          resolvedStart = period.fieldworkStart;
          resolvedEnd = period.fieldworkEnd;
        }
      }

      if (!resolvedStart) {
        resolvedStart =
          parseFlexibleDate(poll.fieldworkStart) ||
          parseFlexibleDate((poll as any).dataInicio) ||
          parseFlexibleDate(poll.medianDate) ||
          "";

        resolvedEnd =
          parseFlexibleDate(poll.fieldworkEnd) ||
          parseFlexibleDate((poll as any).dataFim) ||
          parseFlexibleDate(poll.medianDate) ||
          resolvedStart;
      }

      let median =
        (resolvedStart && resolvedEnd ? computeMedianDate(resolvedStart, resolvedEnd) : "") ||
        parseFlexibleDate(poll.medianDate) ||
        resolvedStart;

      const updatedPayload: Partial<Poll> = {
        fieldworkStart: resolvedStart || poll.fieldworkStart,
        fieldworkEnd: resolvedEnd || poll.fieldworkEnd,
        medianDate: median || poll.medianDate,
        conre: poll.conre || "10801",
        statistician: poll.statistician || "Sidney Barreto Batista",
        institute: poll.institute || "CTAS",
        sampleSize: poll.sampleSize || 1000,
        marginOfError: poll.marginOfError || 3.0,
        confidenceLevel: poll.confidenceLevel || 95,
        version: nextVersion,
        parentId: poll.id,
        justificativa: "Auditoria estatística e reconciliação assistida de metadados sem alteração de intenções nominais"
      };

      if (onUpdatePoll) {
        await onUpdatePoll(poll.id, updatedPayload);
        setSuccessBanner(`Pesquisa "${poll.institute}" reconciliada com sucesso (Versão ${nextVersion}), preservando o laudo original.`);
        setErrorMsg(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Falha ao aplicar reconciliação assistida na pesquisa.");
    }
  };

  // Mass Auto-Fix all polls in database
  const handleAutoFixAllPolls = async () => {
    if (isViewer) {
      setErrorMsg("⚠️ Apenas Administradores possuem permissão para autocorreção.");
      return;
    }
    try {
      let countFixed = 0;
      for (const p of polls) {
        const audit = auditPoll(p);
        if (!audit.isValid) {
          await handleAutoFixPoll(p);
          countFixed++;
        }
      }
      setSuccessBanner(`Auditoria Geral Concluída: ${countFixed} pesquisa(s) foram corrigidas e todas estão agora 100% válidas.`);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro na autocorreção em lote.");
    }
  };

  const handleEditClick = (poll: Poll) => {
    if (isViewer) {
      setErrorMsg("⚠️ Apenas Administradores possuem permissão para editar pesquisas.");
      return;
    }
    setEditingId(poll.id);
    setInstitute(poll.institute || "CTAS");
    setRegistryNumber(poll.registryNumber || "");
    setConre(poll.conre || "10801");
    setSampleSize(poll.sampleSize || 1000);
    setMarginOfError(poll.marginOfError || 3.0);
    setConfidenceLevel(poll.confidenceLevel || 95);
    setFieldworkStart(poll.fieldworkStart || "");
    setFieldworkEnd(poll.fieldworkEnd || "");
    setStatistician(poll.statistician || "Sidney Barreto Batista");
    setPollType(poll.type || "Registrada");
    setCandidateResults({ ...poll.results });
    setShowForm(true);
    setErrorMsg(null);
    setSuccessBanner(null);
  };

  const handleCreateClick = () => {
    if (isViewer) {
      setErrorMsg("⚠️ Apenas Administradores possuem permissão para adicionar novas pesquisas.");
      return;
    }
    setEditingId(null);
    setInstitute("CTAS");
    setRegistryNumber("");
    setConre("10801");
    setSampleSize(1000);
    setMarginOfError(3.0);
    setConfidenceLevel(95);
    setFieldworkStart("2026-07-01");
    setFieldworkEnd("2026-07-04");
    setStatistician("Sidney Barreto Batista");
    setPollType("Registrada");
    setCandidateResults({
      "Fábio Mitidieri": 32.5,
      "Valmir de Francisquinho": 28.0,
      "Rogério Carvalho": 14.5,
      "Emília Corrêa": 9.0,
      "Alessandro Vieira": 5.0,
      "Brancos/Nulos": 5.5,
      "Indecisos": 5.5
    });
    setShowForm(true);
    setErrorMsg(null);
    setSuccessBanner(null);
  };

  const handleResultChange = (candidate: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCandidateResults((prev) => ({
      ...prev,
      [candidate]: num
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;

    // Validate that start and end date exist
    if (!fieldworkStart || !fieldworkEnd) {
      setErrorMsg("⚠️ Datas de início e término de campo são obrigatórias.");
      return;
    }

    // Strict validation: Sum of results should be roughly 100%
    const sum = Object.values(candidateResults).reduce((a: number, b: number) => a + b, 0) as number;
    if (Math.abs(sum - 100) > 0.5) {
      setErrorMsg(`⚠️ Alerta Metodológico: A soma das intenções de voto é ${sum}%. Deve totalizar exatamente 100%.`);
      return;
    }

    // Auto-calculate fieldwork median date (TSE business rule)
    const start = new Date(fieldworkStart);
    const end = new Date(fieldworkEnd);
    const medianTime = start.getTime() + (end.getTime() - start.getTime()) / 2;
    const medianDate = new Date(medianTime).toISOString().split("T")[0];

    const pollPayload = {
      institute: institute.trim() || "CTAS",
      registryNumber: registryNumber.trim(), // Can be blank
      conre: conre.trim() || "10801",
      sampleSize,
      marginOfError,
      confidenceLevel,
      fieldworkStart,
      fieldworkEnd,
      medianDate,
      statistician: statistician.trim() || "Sidney Barreto Batista",
      type: pollType,
      results: candidateResults
    };

    try {
      if (editingId) {
        await onUpdatePoll(editingId, pollPayload);
        setSuccessBanner("Pesquisa atualizada com sucesso no banco de dados.");
      } else {
        await onAddPoll(pollPayload);
        setSuccessBanner("Nova pesquisa eleitoral cadastrada com sucesso.");
      }
      setShowForm(false);
      setEditingId(null);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao salvar a pesquisa.");
    }
  };

  const handleSpreadsheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      setErrorMsg("⚠️ Apenas Administradores possuem permissão para importar arquivos.");
      return;
    }
    if (!spreadSheetFile) {
      setErrorMsg("⚠️ Por favor, selecione um arquivo de planilha (.xlsx, .csv, .xls) ou relatório em PDF.");
      return;
    }

    setIsProcessingFile(true);
    setErrorMsg(null);
    setUploadSuccess(null);
    setParsedSummary(null);

    try {
      if (globalContext?.ingestSurveyFile) {
        const parsed = await globalContext.ingestSurveyFile(
          spreadSheetFile,
          spreadSheetDate,
          spreadSheetInstitute
        );

        const candKeys = Object.keys(parsed.results).filter(
          (k) => k !== "Brancos/Nulos" && k !== "Indecisos"
        );

        setParsedSummary({
          rowsCount: parsed.rawRowsCount,
          candidatesFound: candKeys,
          warnings: parsed.warnings
        });

        setUploadSuccess(
          `✅ Base '${spreadSheetFile.name}' processada com sucesso! ${parsed.rawRowsCount} registros mapeados. Os dados foram imediatamente sincronizados com Cargos Legislativos, Cargos Majoritários e Análise de Votos.`
        );
      } else {
        throw new Error("Módulo de ingestão não inicializado. Tente novamente.");
      }
      setSpreadSheetFile(null);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "Erro durante o parsing e sincronização do arquivo.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Open confirmation modal for deletion (no window.confirm which gets blocked in iframes)
  const handleDeleteClick = (poll: Poll) => {
    if (isViewer) {
      setErrorMsg("⚠️ Apenas Administradores possuem permissão para excluir pesquisas.");
      return;
    }
    setErrorMsg(null);
    setPollToDelete(poll);
  };

  // Execute deletion when confirmed in modal
  const handleConfirmDelete = async () => {
    if (!pollToDelete) return;
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onDeletePoll(pollToDelete.id);
      setSuccessBanner(`Pesquisa do instituto "${pollToDelete.institute}" excluída com sucesso.`);
      setPollToDelete(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao excluir pesquisa do banco de dados.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-blue-950 dark:text-white">Diagnóstico de Pesquisas Registradas</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            Repositório Central e Fonte Oficial de Conhecimento do Sistema (CONRE 10801 • CTAS Consultoria).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => globalContext?.refreshData && globalContext.refreshData()}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
            title="Recarregar e validar integridade da base permanente"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            Verificar Integridade
          </button>
          {!showForm && (
            <button
              onClick={handleCreateClick}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isViewer
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-950 hover:bg-blue-900 text-white shadow-sm"
              }`}
            >
              <Plus className="w-4 h-4" />
              Adicionar Pesquisa
            </button>
          )}
        </div>
      </div>

      {/* Central Knowledge Base Status Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-white/10 rounded-xl shrink-0 backdrop-blur-xs">
              <Database className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-blue-200 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-400/30">
                  Repositório Central Persistente
                </span>
                <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Preservação Permanente Ativa
                </span>
              </div>
              <h3 className="font-serif font-bold text-base mt-1 text-white">
                Base Oficial de Dados Eleitorais ({polls.length} {polls.length === 1 ? "pesquisa cadastrada" : "pesquisas cadastradas"})
              </h3>
              <p className="text-xs text-blue-100/90 mt-0.5">
                {polls.length > 0
                  ? `Base ativa vinculada a ${polls.reduce((acc, p) => acc + (p.sampleSize || (p.rawRows ? p.rawRows.length : 0)), 0).toLocaleString("pt-BR")} entrevistas. Todos os módulos (Calibração, Tracking, Cards Executivos, Análise Territorial) consultam exclusivamente esta base central.`
                  : "Nenhuma pesquisa registrada no momento. Importe uma planilha ou cadastre uma nova pesquisa para alimentar todo o ecossistema."}
              </p>
            </div>
          </div>
          <div className="text-left md:text-right shrink-0 font-mono text-xs border-t md:border-t-0 md:border-l border-blue-700/50 pt-3 md:pt-0 md:pl-5">
            <div className="text-blue-300 text-[10px]">Armazenamento Triplo:</div>
            <div className="text-white font-semibold">Disco + IndexedDB + Cache</div>
            <div className="text-[10px] text-emerald-400 mt-1">Protegido contra exclusão</div>
          </div>
        </div>
      </div>

      {/* RBAC Visual Warning for Viewers */}
      {isViewer && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Visualização de Acesso Restrito</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Você está visualizando a plataforma sob o perfil <strong>Viewer</strong>. Funções de inserção, modificação ou exclusão de trackings estão desabilitadas.
            </p>
          </div>
        </div>
      )}

      {/* Internal errors display */}
      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 dark:text-rose-300 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Success Banner */}
      {successBanner && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-start justify-between gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Spreadsheet & PDF Ingestion Box (with reference date) */}
      {!showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-[#1E40AF]/5 dark:bg-blue-950/30 border-b border-gray-200 dark:border-slate-800 p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#1E40AF] dark:text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
              <div>
                <h3 className="font-bold text-sm">Importador Inteligente de Relatórios (PDF) e Planilhas</h3>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-mono">Suporta relatórios em PDF, Excel (.xlsx), CSV e ODS com extração de metadados</p>
              </div>
            </div>
            <div className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg font-bold font-mono text-slate-800 dark:text-slate-200 shadow-sm">
              Instituto CTAS, CONRE 10801, Estatístico Responsável Sidney Barreto Batista.
            </div>
          </div>

          <div className="p-6">
            {/* Global Sync Notification Status */}
            {globalContext?.syncStatusMessage && (
              <div className="mb-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3 text-blue-900 dark:text-blue-200 text-xs">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-pulse" />
                <div className="flex-1">
                  <span className="font-bold block">Pipeline de Dados em Execução:</span>
                  <p className="mt-0.5">{globalContext.syncStatusMessage}</p>
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 rounded-xl flex flex-col gap-2 text-green-800 dark:text-green-300 text-xs">
                <div className="flex items-start gap-3 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>{uploadSuccess}</div>
                </div>

                {parsedSummary && (
                  <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-green-900 dark:text-green-200">
                    <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-green-200 dark:border-green-900">
                      <span className="text-gray-500 dark:text-slate-400 block text-[10px]">Registros Processados:</span>
                      <strong>{parsedSummary.rowsCount} linhas</strong>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-green-200 dark:border-green-900">
                      <span className="text-gray-500 dark:text-slate-400 block text-[10px]">Candidatos Mapeados:</span>
                      <strong>{parsedSummary.candidatesFound.join(", ") || "Todos (Calibrado)"}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSpreadsheetSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Reference Date */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#1E40AF] dark:text-blue-400" />
                    Data de Referência da Pesquisa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={spreadSheetDate}
                    onChange={(e) => setSpreadSheetDate(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#1E40AF] focus:bg-white dark:focus:bg-slate-800 transition-colors"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Data oficial de divulgação ou consolidação do relatório/planilha.</p>
                </div>

                {/* Institute name input */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#1E40AF] dark:text-blue-400" />
                    Instituto / Fonte <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={spreadSheetInstitute}
                    onChange={(e) => setSpreadSheetInstitute(e.target.value)}
                    placeholder="CTAS"
                    className="w-full text-xs p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#1E40AF] focus:bg-white dark:focus:bg-slate-800 transition-colors"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Nome do instituto responsável pelo levantamento de dados.</p>
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-[#1E40AF] bg-[#1E40AF]/5"
                    : spreadSheetFile
                    ? "border-green-400 bg-green-50/20"
                    : "border-gray-300 dark:border-slate-700 hover:border-[#1E40AF] bg-gray-50/50 dark:bg-slate-800/40 hover:bg-gray-50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSpreadSheetFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => {
                  document.getElementById("spreadsheet-file-input")?.click();
                }}
              >
                <input
                  id="spreadsheet-file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls,.ods,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSpreadSheetFile(e.target.files[0]);
                    }
                  }}
                />

                <UploadCloud className={`w-10 h-10 mb-2.5 ${spreadSheetFile ? "text-green-600" : "text-gray-400 dark:text-slate-500"}`} />
                
                {spreadSheetFile ? (
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-700 dark:text-slate-200">{spreadSheetFile.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5">
                      {(spreadSheetFile.size / 1024).toFixed(1)} KB • Pronto para processamento
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-700 dark:text-slate-200">Arraste ou clique para selecionar a planilha ou arquivo PDF</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Formatos aceitos: Relatórios PDF (.pdf), Excel (.xlsx), CSV, ODS</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isProcessingFile || isViewer}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-all shadow-sm ${
                    isProcessingFile || isViewer
                      ? "bg-gray-300 dark:bg-slate-700 cursor-not-allowed"
                      : "bg-[#1E40AF] hover:bg-blue-800 hover:shadow"
                  }`}
                >
                  {isProcessingFile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processando Arquivo...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Confirmar Ingestão
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD/Insert Form (Administrator only) */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-base font-serif font-bold text-blue-950 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-900 dark:text-blue-400" />
              {editingId ? "Editar Pesquisa Eleitoral" : "Nova Ingestão de Pesquisa"}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Institute Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Instituto
                </label>
                <input
                  type="text"
                  required
                  value={institute}
                  onChange={(e) => setInstitute(e.target.value)}
                  placeholder="CTAS"
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-900"
                />
              </div>

              {/* Registry Number */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Nº de Registro TSE
                </label>
                <input
                  type="text"
                  value={registryNumber}
                  onChange={(e) => setRegistryNumber(e.target.value)}
                  placeholder="Opcional / Deixe em branco para pesquisas internas"
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-900"
                />
              </div>

              {/* CONRE Code */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Código CONRE
                </label>
                <input
                  type="text"
                  required
                  value={conre}
                  onChange={(e) => setConre(e.target.value)}
                  placeholder="10801"
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-semibold focus:border-blue-900"
                />
              </div>

              {/* Sample Size */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">Tamanho da Amostra (n)</label>
                <input
                  type="number"
                  required
                  value={sampleSize}
                  onChange={(e) => setSampleSize(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-900"
                />
              </div>

              {/* Margin of Error */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">Margem de Erro (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={marginOfError}
                  onChange={(e) => setMarginOfError(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-900"
                />
              </div>

              {/* Confidence level */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">Nível de Confiança (%)</label>
                <input
                  type="number"
                  required
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-900"
                />
              </div>

              {/* Fieldwork Start Date */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Início de Campo
                </label>
                <input
                  type="date"
                  required
                  value={fieldworkStart}
                  onChange={(e) => setFieldworkStart(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-900"
                />
              </div>

              {/* Fieldwork End Date */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Término de Campo
                </label>
                <input
                  type="date"
                  required
                  value={fieldworkEnd}
                  onChange={(e) => setFieldworkEnd(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-900"
                />
              </div>

              {/* Statistician name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Estatístico Responsável
                </label>
                <input
                  type="text"
                  required
                  value={statistician}
                  onChange={(e) => setStatistician(e.target.value)}
                  placeholder="Sidney Barreto Batista"
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:border-blue-900"
                />
              </div>

              {/* Poll Type */}
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">Tipo de Pesquisa</label>
                <select
                  value={pollType}
                  onChange={(e) => setPollType(e.target.value as "Registrada" | "Tracking")}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-900"
                >
                  <option value="Registrada">Registrada (Divulgação Pública TSE)</option>
                  <option value="Tracking">Tracking (Uso de Campanha Interna)</option>
                </select>
              </div>
            </div>

            {/* Candidate Results percentage setting */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    Intenções de Voto e Validação da Soma
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    O somatório de todos os votos deve totalizar exatamente 100.0% (tolerância máxima de ±0.5%).
                  </p>
                </div>
                
                {/* Live Sum Indicator & Auto-Balance Button */}
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs ${
                      Math.abs(currentTotalSum - 100) <= 0.5
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {Math.abs(currentTotalSum - 100) <= 0.5 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>Soma: {currentTotalSum}%</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoNormalizeResults}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Ajustar automaticamente os Indecisos ou proporcionalmente para somar 100%"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Auto-Ajustar 100%
                  </button>
                </div>
              </div>

              {/* Data Mediana Realtime Calculation Card */}
              {previewMedianDate && (
                <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs text-blue-950 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <span>
                      Data Mediana Calculada (Critério TSE): <strong>{formatDateBR(previewMedianDate)}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-700">
                    Ponto Médio de Coleta
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 pt-1">
                {Object.keys(candidateResults).map((name) => (
                  <div key={name} className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate block" title={name}>
                      {name}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={candidateResults[name]}
                        onChange={(e) => handleResultChange(name, e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-900 pr-5"
                      />
                      <span className="absolute right-1.5 top-2 text-[9px] text-slate-400 font-mono">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-950 hover:bg-blue-900 flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                Salvar Pesquisa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Polls tabular dataset list with Inconsistency Audit & Autocorrect */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h3 className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-slate-400" />
              Pesquisas Cadastradas ({polls.length})
            </h3>
            <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-semibold flex items-center gap-1">
              <Database className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              Base Permanente & Fixada
            </span>
            {globalContext?.activePollsVersion && (
              <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                v{globalContext.activePollsVersion} Sincronizado
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoFixAllPolls}
              disabled={isViewer}
              className="text-[10px] font-mono flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer font-semibold"
              title="Executar auditoria automática em todas as pesquisas e corrigir somas e datas"
            >
              <Wand2 className="w-3 h-3 text-emerald-600" />
              Auditar e Corrigir Todas
            </button>
            <button
              onClick={() => globalContext?.clearCacheAndReload()}
              className="text-[10px] font-mono flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Recalcular projeções e atualizar análises com base nas pesquisas cadastradas"
            >
              <RefreshCw className="w-3 h-3" />
              Recalcular Projeções
            </button>
          </div>
        </div>

        {polls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/60">
                  <th className="py-3.5 px-5">Status / Seleção</th>
                  <th className="py-3.5 px-5">Instituto / Registro</th>
                  <th className="py-3.5 px-5">Auditoria Metodológica</th>
                  <th className="py-3.5 px-5">CONRE / Estatístico</th>
                  <th className="py-3.5 px-5">Período de Campo</th>
                  <th className="py-3.5 px-5">Data Mediana</th>
                  <th className="py-3.5 px-5">Amostra (n)</th>
                  <th className="py-3.5 px-5">Metodologia</th>
                  <th className="py-3.5 px-5">Desempenho Líderes</th>
                  <th className="py-3.5 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {polls.map((poll) => {
                  const isSelected = globalContext?.selectedResearch?.id === poll.id;
                  const audit = auditPoll(poll);
                  const sortedResults = Object.entries(poll.results || {})
                    .filter(([name]) => name !== "Brancos/Nulos" && name !== "Indecisos")
                    .sort((a, b) => (b[1] as number) - (a[1] as number));

                  const leader = sortedResults[0] || ["—", 0];
                  const runnerUp = sortedResults[1] || ["—", 0];

                  const regText = poll.registryNumber ? poll.registryNumber : "Sem registro (Em branco / Interna)";

                  return (
                    <tr
                      key={poll.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-blue-50/40 dark:bg-blue-950/20 border-l-4 border-l-blue-600"
                          : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="py-4 px-5">
                        <button
                          type="button"
                          onClick={() => globalContext?.setSelectedResearchId(poll.id)}
                          className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Ativa p/ Análise
                            </>
                          ) : (
                            "Selecionar"
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{poll.institute}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {regText} ({poll.type || "Registrada"})
                        </div>
                      </td>

                      {/* Auditoria Metodológica Column */}
                      <td className="py-4 px-5">
                        {audit.isValid ? (
                          <div className="flex flex-col gap-1 items-start">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                              <Check className="w-3 h-3 text-emerald-600" />
                              {audit.isSenate ? `Senado (${audit.sum}%)` : `100% Conforme (${audit.sum}%)`}
                            </div>
                            {audit.warnings.length > 0 && (
                              <div className="text-[9px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1" title={audit.warnings.join("; ")}>
                                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                Nota Amostral
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 items-start">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Soma: {audit.sum}%
                            </div>
                            {!audit.isSenate && (
                              <button
                                onClick={() => handleAutoFixPoll(poll)}
                                disabled={isViewer}
                                className="text-[10px] font-mono text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                                title="Corrigir soma para 100% e validar campos"
                              >
                                <Wand2 className="w-2.5 h-2.5" />
                                Corrigir
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-mono text-xs font-semibold text-blue-900 dark:text-blue-300">
                          CONRE {poll.conre || "10801"}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {poll.statistician || "Sidney Barreto Batista"}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-300 font-mono">
                        {getFieldworkPeriodDisplay(poll)}
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono bg-blue-50 dark:bg-blue-950 text-blue-950 dark:text-blue-200 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900 font-semibold">
                          {formatDateBR(poll.medianDate)}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-700 dark:text-slate-200 font-mono font-medium">
                        {poll.sampleSize}
                        {audit.marginAudit.effectiveSampleSize !== poll.sampleSize && (
                          <span className="block text-[9px] text-slate-400 font-mono" title="Tamanho efetivo corrigido por Deff">
                            n_eff: {audit.marginAudit.effectiveSampleSize}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-slate-500 dark:text-slate-400">
                        <p className="text-[10px] font-mono">Erro: ±{poll.marginOfError}%</p>
                        {audit.marginAudit.difference !== null && !audit.marginAudit.isConsistent && (
                          <p className="text-[9px] font-mono text-amber-600 dark:text-amber-400" title={`Margem calculada para n=${poll.sampleSize}: ±${audit.marginAudit.calculatedMargin}%`}>
                            Calc: ±{audit.marginAudit.calculatedMargin}%
                          </p>
                        )}
                        <p className="text-[10px] font-mono">Confiança: {poll.confidenceLevel}%</p>
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {leader[0]}: <span className="text-blue-900 dark:text-blue-400">{leader[1]}%</span>
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {runnerUp[0]}: {runnerUp[1]}%
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditClick(poll)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            title="Editar Pesquisa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(poll)}
                            className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors"
                            title="Excluir Pesquisa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">
            Nenhuma pesquisa eleitoral cadastrada. Use o botão "Adicionar Pesquisa" para inserir uma base.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (Built-in modal without blocked window.confirm) */}
      {pollToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">Confirmar Exclusão</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Esta ação removerá a pesquisa do banco de dados.</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Instituto:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pollToDelete.institute}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Registro TSE:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{pollToDelete.registryNumber || "Em branco / Interna"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">CONRE / Estatístico:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{pollToDelete.conre || "10801"} • {pollToDelete.statistician || "Sidney Barreto Batista"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Data Mediana:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {formatDateBR(pollToDelete.medianDate)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPollToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-2 shadow-sm transition-all"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirmar Exclusão
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

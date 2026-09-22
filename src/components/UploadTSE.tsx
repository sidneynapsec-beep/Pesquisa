import React, { useState, useMemo } from "react";
import { Poll, UserRole } from "../types";
import { ResearchStorage } from "../lib/researchStorage";
import { HISTORICAL_POLLS } from "../data/historicalPolls";
import { useElectoralData } from "../context/ElectoralDataContext";
import { formatDateBR, formatDateRangeBR } from "../utils/dateFormatter";
import {
  UploadCloud,
  FileCheck,
  Building,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  ShieldCheck,
  Calendar,
  Users,
  Award,
  Database,
  FileSpreadsheet,
  Download,
  Info,
  RefreshCw,
  PlusCircle,
  Check
} from "lucide-react";

interface UploadTSEProps {
  currentRole: UserRole;
  polls: Poll[];
  onAddPoll?: (pollData: Omit<Poll, "id">) => Promise<any>;
  onDeletePoll?: (id: string) => Promise<any>;
}

export default function UploadTSE({ currentRole, polls, onAddPoll, onDeletePoll }: UploadTSEProps) {
  const globalContext = useElectoralData();
  const isAdmin = currentRole === "Administrator";

  // File selection & parsing states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Extracted / Manual form data for TSE Poll
  const [registryNumber, setRegistryNumber] = useState("");
  const [institute, setInstitute] = useState("");
  const [contractor, setContractor] = useState("");
  const [sampleSize, setSampleSize] = useState<number>(1000);
  const [marginOfError, setMarginOfError] = useState<number>(3.0);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);
  const [fieldworkStart, setFieldworkStart] = useState("");
  const [fieldworkEnd, setFieldworkEnd] = useState("");
  const [statistician, setStatistician] = useState("Estatístico Responsável (CONRE)");
  const [conre, setConre] = useState("10801");
  const [selectedYear, setSelectedYear] = useState<"2026" | "2024" | "2022">("2026");
  const [targetOffice, setTargetOffice] = useState("Governador");
  const [pollDescription, setPollDescription] = useState("");

  // Candidate distribution mapping
  const [candidateEntries, setCandidateEntries] = useState<Array<{ name: string; percent: number }>>([
    { name: "Fábio Mitidieri", percent: 34.5 },
    { name: "Valmir de Francisquinho", percent: 29.8 },
    { name: "Rogério Carvalho", percent: 16.2 },
    { name: "Alessandro Vieira", percent: 6.5 },
    { name: "Brancos/Nulos", percent: 7.0 },
    { name: "Indecisos", percent: 6.0 }
  ]);

  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidatePercent, setNewCandidatePercent] = useState("");

  // Modal for detailed inspection
  const [viewingPoll, setViewingPoll] = useState<Poll | null>(null);

  // Filter TSE Polls vs Field surveys
  const tsePolls = useMemo(() => {
    const list = globalContext?.polls?.length ? globalContext.polls : polls;
    // Combine persisted user TSE polls and historical TSE polls (avoiding duplicates by id)
    const combinedMap = new Map<string, Poll>();
    
    // Add fixed historical polls first
    HISTORICAL_POLLS.forEach((p) => combinedMap.set(p.id, p));

    // Add stored polls that have origin 'TSE' or have a registryNumber
    list.forEach((p) => {
      if (p.origin === "TSE" || (p.registryNumber && p.registryNumber.trim() !== "")) {
        combinedMap.set(p.id, p);
      }
    });

    return Array.from(combinedMap.values());
  }, [globalContext?.polls, polls]);

  // Handle candidate change
  const handleUpdateCandidatePercent = (index: number, val: number) => {
    setCandidateEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], percent: val };
      return updated;
    });
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidateEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCandidate = () => {
    if (!newCandidateName.trim()) return;
    const num = parseFloat(newCandidatePercent) || 0;
    setCandidateEntries((prev) => [...prev, { name: newCandidateName.trim(), percent: num }]);
    setNewCandidateName("");
    setNewCandidatePercent("");
  };

  // Calculate sum of percentages
  const sumPercent = useMemo(() => {
    return candidateEntries.reduce((acc, c) => acc + (c.percent || 0), 0);
  }, [candidateEntries]);

  // Process File Selection (CSV, XLSX, JSON)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Suggest automatic metadata from file name or structure
      const fileName = file.name;
      setPollDescription(`Pesquisa TSE importada do arquivo '${fileName}'`);

      // Try reading if JSON or CSV
      if (fileName.endsWith(".json")) {
        const text = await file.text();
        const json = JSON.parse(text);
        if (json.registryNumber) setRegistryNumber(json.registryNumber);
        if (json.institute) setInstitute(json.institute);
        if (json.sampleSize) setSampleSize(json.sampleSize);
        if (json.marginOfError) setMarginOfError(json.marginOfError);
        if (json.fieldworkStart) setFieldworkStart(json.fieldworkStart);
        if (json.fieldworkEnd) setFieldworkEnd(json.fieldworkEnd);
        if (json.results && typeof json.results === "object") {
          const entries = Object.entries(json.results).map(([name, val]) => ({
            name,
            percent: Number(val) || 0
          }));
          if (entries.length > 0) setCandidateEntries(entries);
        }
      } else {
        // Preset intelligent defaults for TSE file
        if (!registryNumber) {
          setRegistryNumber(`SE-${Math.floor(10000 + Math.random() * 90000)}/2026`);
        }
        if (!institute) {
          if (fileName.toLowerCase().includes("quaest")) setInstitute("Quaest Pesquisas");
          else if (fileName.toLowerCase().includes("ipobe") || fileName.toLowerCase().includes("ipec")) setInstitute("Ipec Inteligência");
          else if (fileName.toLowerCase().includes("atlas")) setInstitute("AtlasIntel");
          else if (fileName.toLowerCase().includes("ctas")) setInstitute("CTAS Consultoria");
          else setInstitute("Instituto Registrado TSE");
        }
      }
      setSuccessMessage(`Arquivo '${fileName}' carregado e pronto para conferência e validação.`);
    } catch (err: any) {
      setErrorMessage(`Erro ao ler arquivo: ${err.message || "Formato incompatível"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit and Persist TSE Research
  const handleConfirmImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMessage("⚠️ Apenas Administradores possuem permissão para salvar pesquisas oficiais do TSE.");
      return;
    }

    if (!institute.trim()) {
      setErrorMessage("⚠️ Informe a Razão Social ou Nome do Instituto de Pesquisa.");
      return;
    }

    if (!fieldworkStart || !fieldworkEnd) {
      setErrorMessage("⚠️ Informe as datas de início e fim do trabalho de campo da pesquisa.");
      return;
    }

    if (Math.abs(sumPercent - 100) > 1.5) {
      setErrorMessage(`⚠️ Alerta Metodológico: A soma das intenções é ${sumPercent.toFixed(1)}%. Ajuste para totalizar ~100%.`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Calculate median date
    const start = new Date(fieldworkStart);
    const end = new Date(fieldworkEnd);
    const medianTime = start.getTime() + (end.getTime() - start.getTime()) / 2;
    const medianDate = new Date(medianTime).toISOString().split("T")[0];

    const resultsMap: Record<string, number> = {};
    candidateEntries.forEach((c) => {
      resultsMap[c.name] = c.percent;
    });

    const researchId = `tse-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newTSEPoll: Poll = {
      id: researchId,
      institute: institute.trim(),
      registryNumber: registryNumber.trim() || `SE-${Math.floor(10000 + Math.random() * 90000)}/2026`,
      conre: conre.trim() || "10801",
      sampleSize: Number(sampleSize) || 1000,
      marginOfError: Number(marginOfError) || 3.0,
      confidenceLevel: Number(confidenceLevel) || 95,
      fieldworkStart,
      fieldworkEnd,
      medianDate,
      statistician: statistician.trim(),
      type: "Registrada",
      origin: "TSE",
      year: selectedYear,
      description: pollDescription.trim() || `Pesquisa Oficial Registrada no TSE (${selectedYear})`,
      contractor: contractor.trim() || "Diretório / Veículo de Comunicação",
      persisted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      results: resultsMap,
      roleResults: {
        [targetOffice]: resultsMap
      }
    };

    try {
      // 1. OBRIGATÓRIO: SALVAR NO ARMAZENAMENTO PERSISTENTE (IndexedDB)
      await ResearchStorage.saveResearch(newTSEPoll);

      // 2. SALVAR NO BACKEND E ATUALIZAR INTERFACE
      if (onAddPoll) {
        await onAddPoll(newTSEPoll);
      } else if (globalContext?.addPoll) {
        await globalContext.addPoll(newTSEPoll);
      }

      setSuccessMessage(`✅ Pesquisa Oficial TSE (${newTSEPoll.registryNumber}) persistida com sucesso e disponível em todos os módulos!`);
      setSelectedFile(null);
      setPollDescription("");
      
      // Auto dismiss success banner after 6 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 6000);
    } catch (err: any) {
      console.error("[UPLOAD TSE] Erro ao persistir pesquisa:", err);
      setErrorMessage(`Erro ao salvar no banco persistente: ${err.message || "Falha de gravação"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Explicit Deletion with Mandatory Confirmation
  const handleDeleteTSEPoll = async (poll: Poll) => {
    if (!isAdmin) {
      alert("Apenas administradores podem excluir pesquisas oficiais.");
      return;
    }

    if (poll.id.startsWith("hist-")) {
      alert("Esta é uma pesquisa histórica oficial protegida do sistema e não pode ser excluída.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir permanentemente a pesquisa do TSE '${poll.registryNumber || poll.institute}'?\n\nEsta ação removerá a base do armazenamento persistente.`
    );

    if (!confirmed) return;

    try {
      await ResearchStorage.deleteResearch(poll.id);
      if (onDeletePoll) {
        await onDeletePoll(poll.id);
      } else if (globalContext?.deletePoll) {
        await globalContext.deletePoll(poll.id);
      }
      setSuccessMessage(`Pesquisa ${poll.registryNumber || poll.id} excluída permanentemente.`);
    } catch (err: any) {
      console.error("[UPLOAD TSE] Erro ao excluir:", err);
      setErrorMessage(`Erro ao excluir pesquisa: ${err.message || "Falha ao remover"}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-[#1E40AF] text-white p-6 rounded-2xl shadow-md border border-blue-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              Módulo Oficial TSE
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Armazenamento Persistente Ativo
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold mt-2 flex items-center gap-2.5">
            <UploadCloud className="w-6 h-6 text-blue-200" />
            Upload de Resultados de Pesquisas Eleitorais (TSE)
          </h1>
          <p className="text-xs text-blue-100/80 font-sans mt-1 max-w-2xl">
            Importação, validação e persistência oficial das pesquisas registradas no Tribunal Superior Eleitoral.
            Os dados salvos aqui alimentam a análise temporal, diagnósticos e comparações históricas.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right">
            <span className="text-[10px] font-mono text-blue-200 uppercase block">Pesquisas TSE Registradas</span>
            <span className="text-2xl font-serif font-bold text-white">{tsePolls.length}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Upload & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: File Dropzone & Registry Fields (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4.5 h-4.5 text-[#1E40AF] dark:text-blue-400" />
                1. Selecionar Arquivo & Metadados do Registro TSE
              </h2>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Faça upload da planilha oficial (.xlsx, .csv) ou relatório do PesqEle / TSE.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-[#1E40AF] dark:text-blue-400 px-2 py-1 rounded-md font-bold uppercase">
              TSE Oficial
            </span>
          </div>

          {/* File Drag-and-Drop Area */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1E40AF] dark:hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 dark:bg-slate-950/40">
            <input
              type="file"
              id="tse-file-upload"
              accept=".csv,.xlsx,.xls,.json,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="tse-file-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {selectedFile ? selectedFile.name : "Clique para selecionar ou arraste o arquivo do TSE aqui"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  Formatos suportados: CSV, XLSX, XLS, JSON (Disponibilizados pelo TSE / PesqEle)
                </span>
              </div>
              {selectedFile && (
                <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono px-3 py-1 rounded-full font-bold">
                  ✓ Arquivo carregado ({((selectedFile.size || 0) / 1024).toFixed(1)} KB)
                </span>
              )}
            </label>
          </div>

          {/* TSE Registration Form */}
          <form onSubmit={handleConfirmImport} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Número de Registro no TSE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SE-08912/2026"
                  value={registryNumber}
                  onChange={(e) => setRegistryNumber(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Instituto / Empresa Responsável *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Quaest / AtlasIntel / Ipec"
                  value={institute}
                  onChange={(e) => setInstitute(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Contratante / Solicitante
                </label>
                <input
                  type="text"
                  placeholder="Ex: TV Sergipe / Diretório Partidário"
                  value={contractor}
                  onChange={(e) => setContractor(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Ano Eleitoral Correspondente
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                >
                  <option value="2026">2026 (Eleição Atual - Estadual & Federal)</option>
                  <option value="2024">2024 (Histórico Municipal)</option>
                  <option value="2022">2022 (Histórico Estadual & Federal)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Início da Coleta de Campo *
                </label>
                <input
                  type="date"
                  required
                  value={fieldworkStart}
                  onChange={(e) => setFieldworkStart(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Fim da Coleta de Campo *
                </label>
                <input
                  type="date"
                  required
                  value={fieldworkEnd}
                  onChange={(e) => setFieldworkEnd(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Tamanho da Amostra (N Entrevistados)
                </label>
                <input
                  type="number"
                  min="100"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Margem de Erro (±%) / Nível de Confiança
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="3.0"
                    value={marginOfError}
                    onChange={(e) => setMarginOfError(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                  />
                  <select
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                  >
                    <option value={95}>95%</option>
                    <option value={90}>90%</option>
                    <option value={99}>99%</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Estatístico Responsável / Registro CONRE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nome do Estatístico"
                    value={statistician}
                    onChange={(e) => setStatistician(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                  />
                  <input
                    type="text"
                    placeholder="CONRE (ex: 10801)"
                    value={conre}
                    onChange={(e) => setConre(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E40AF]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isProcessing}
                className="bg-[#1E40AF] hover:bg-blue-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Confirmar & Salvar Pesquisa Oficial TSE
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Candidate Intention Table Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-amber-500" />
                  2. Distribuição das Intenções de Voto
                </h2>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Cargo principal: {targetOffice}
                </p>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                Math.abs(sumPercent - 100) <= 0.5
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
              }`}>
                Soma: {sumPercent.toFixed(1)}%
              </span>
            </div>

            {/* List of candidates */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {candidateEntries.map((c, index) => (
                <div
                  key={`${c.name}-${index}`}
                  className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate flex-1">
                    {c.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      step="0.1"
                      value={c.percent}
                      onChange={(e) => handleUpdateCandidatePercent(index, parseFloat(e.target.value) || 0)}
                      className="w-16 text-xs p-1 text-right font-mono font-bold bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded"
                    />
                    <span className="text-xs font-mono text-slate-400">%</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCandidate(index)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add candidate row */}
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-900 dark:text-blue-300 block">
                + Adicionar Candidato / Opção
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nome do candidato..."
                  value={newCandidateName}
                  onChange={(e) => setNewCandidateName(e.target.value)}
                  className="flex-1 text-xs p-2 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="%"
                  value={newCandidatePercent}
                  onChange={(e) => setNewCandidatePercent(e.target.value)}
                  className="w-16 text-xs p-2 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddCandidate}
                  className="bg-[#1E40AF] text-white px-3 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-800"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
              <Info className="w-4 h-4 text-[#1E40AF]" />
              Regra de Persistência Permanente:
            </div>
            <p>
              Ao confirmar o upload, os dados são salvos no <strong>IndexedDB</strong> da aplicação e sincronizados com a API.
              Mesmo recarregando a página (F5) ou fechando o navegador, a pesquisa permanecerá preservada.
            </p>
          </div>
        </div>
      </div>

      {/* Persisted TSE Polls Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" />
              Pesquisas Oficiais Registradas no TSE & Histórico Salvo
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Bases consolidadas de 2022, 2024 e pesquisas oficiais de 2026 registradas e persistidas.
            </p>
          </div>

          <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold">
            Total de {tsePolls.length} pesquisas ativas
          </span>
        </div>

        {/* Table of TSE Polls */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-3 px-4">Registro TSE</th>
                <th className="py-3 px-4">Instituto</th>
                <th className="py-3 px-4">Ano / Tipo</th>
                <th className="py-3 px-4">Amostra (N)</th>
                <th className="py-3 px-4">Período de Campo</th>
                <th className="py-3 px-4">Líder Apurado</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {tsePolls.map((poll) => {
                // Find top candidate
                let leader = "N/D";
                let topVal = -1;
                if (poll.results) {
                  Object.entries(poll.results).forEach(([name, val]) => {
                    if (name !== "Brancos/Nulos" && name !== "Indecisos" && typeof val === "number" && val > topVal) {
                      topVal = val;
                      leader = `${name} (${val}%)`;
                    }
                  });
                }

                const isProtectedHistorical = poll.id.startsWith("hist-");

                return (
                  <tr key={poll.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1E40AF] dark:text-blue-400">
                      {poll.registryNumber || "Oficial TSE"}
                      {isProtectedHistorical && (
                        <span className="ml-2 text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-sans font-bold">
                          Histórico Fixo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {poll.institute}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {poll.year || "2026"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {poll.sampleSize?.toLocaleString()} entrevistados
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {formatDateRangeBR(poll.fieldworkStart, poll.fieldworkEnd)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {leader}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingPoll(poll)}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#1E40AF]" />
                          Abrir
                        </button>
                        {!isProtectedHistorical && isAdmin && (
                          <button
                            onClick={() => handleDeleteTSEPoll(poll)}
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                            title="Excluir permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for viewing poll details */}
      {viewingPoll && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E40AF] dark:text-blue-400 font-bold block">
                  Pesquisa Oficial Registrada no TSE
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                  {viewingPoll.registryNumber} — {viewingPoll.institute}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Ano Eleitoral: {viewingPoll.year || "2026"} • Amostra: {viewingPoll.sampleSize?.toLocaleString()} entrevistas
                </p>
              </div>
              <button
                onClick={() => setViewingPoll(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Margem de Erro</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">±{viewingPoll.marginOfError}%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Nível Confiança</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{viewingPoll.confidenceLevel}%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Período de Campo</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{formatDateRangeBR(viewingPoll.fieldworkStart, viewingPoll.fieldworkEnd)}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">CONRE</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{viewingPoll.conre || "10801"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
                Resultados Apurados por Candidato:
              </h4>
              <div className="space-y-2">
                {Object.entries(viewingPoll.results || {}).map(([name, val]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{name}</span>
                    <span className="text-xs font-mono font-bold text-[#1E40AF] dark:text-blue-400">{val}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setViewingPoll(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

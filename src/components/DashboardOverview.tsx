import React, { useMemo, useEffect, useState } from "react";
import { Poll, ActiveTab } from "../types";
import { CANDIDATE_COLORS, getOfficialCandidateColor, PRE_CANDIDATES } from "../data/sergipeData";
import { useElectoralData } from "../context/ElectoralDataContext";
import { formatDateBR } from "../utils/dateFormatter";
import { matchOfficialCandidate } from "../utils/fileParser";
import {
  Calendar,
  Users,
  TrendingUp,
  Activity,
  Map,
  BarChart3,
  Building,
  Radio,
  LineChart as RechartsLineIcon,
  Layers,
  ArrowRight,
  Filter
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const COLOR_PALETTE = [
  "#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED",
  "#0284C7", "#4F46E5", "#EA580C", "#0D9488", "#E11D48",
  "#F59E0B", "#10B981", "#6366F1", "#8B5CF6", "#EC4899"
];

// Helper to normalize strings for robust matching
const normalize = (str: string = "") =>
  String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Robust date parser supporting Brazilian (DD/MM/YYYY), ISO (YYYY-MM-DD), Date objects, Excel numbers, etc.
// Strictly rejects invalid dates or dates prior to 2020 (such as 1970-01-01)
export const parseResearchDate = (value: any): string | null => {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const y = value.getFullYear();
    if (y < 2020 || y > 2035) return null;
    return formatDate(value);
  }

  // Number: Excel serial (45000-48000) or Epoch ms/s
  if (typeof value === "number") {
    if (isNaN(value) || value <= 0) return null;
    if (value >= 25000 && value <= 80000) {
      const jsDate = new Date(Math.round((value - 25569) * 86400 * 1000));
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getUTCFullYear();
        if (y >= 2020 && y <= 2035) {
          const m = String(jsDate.getUTCMonth() + 1).padStart(2, "0");
          const d = String(jsDate.getUTCDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
      }
    }
    if (value > 1577836800000 && value < 2500000000000) {
      const jsDate = new Date(value);
      if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() >= 2020 && jsDate.getFullYear() <= 2035) {
        return formatDate(jsDate);
      }
    }
    if (value > 1577836800 && value < 2500000000) {
      const jsDate = new Date(value * 1000);
      if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() >= 2020 && jsDate.getFullYear() <= 2035) {
        return formatDate(jsDate);
      }
    }
    return null;
  }

  const text = String(value).trim();
  if (!text || text === "0" || text === "00:00:00" || text === "1970-01-01" || text.startsWith("1970")) {
    return null;
  }

  // Excel serial string
  if (/^\d{5}(\.\d+)?$/.test(text)) {
    const num = parseFloat(text);
    if (num >= 25000 && num <= 80000) {
      const jsDate = new Date(Math.round((num - 25569) * 86400 * 1000));
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getUTCFullYear();
        if (y >= 2020 && y <= 2035) {
          const m = String(jsDate.getUTCMonth() + 1).padStart(2, "0");
          const d = String(jsDate.getUTCDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
      }
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const brMatch = text.match(/(\b\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/);
  if (brMatch) {
    const [, day, month, rawYear] = brMatch;
    let year = Number(rawYear);
    if (year < 100) year += 2000;
    if (year >= 2020 && year <= 2035 && Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= 31) {
      const date = new Date(year, Number(month) - 1, Number(day));
      if (!isNaN(date.getTime())) {
        return formatDate(date);
      }
    }
  }

  // YYYY-MM-DD
  const isoMatch = text.match(/(\b\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/);
  if (isoMatch) {
    const [, rawYear, month, day] = isoMatch;
    const year = Number(rawYear);
    if (year >= 2020 && year <= 2035 && Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= 31) {
      const date = new Date(year, Number(month) - 1, Number(day));
      if (!isNaN(date.getTime())) {
        return formatDate(date);
      }
    }
  }

  // Standard ISO / JS parsing
  try {
    const parsed = new Date(text);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      if (y >= 2020 && y <= 2035) {
        return formatDate(parsed);
      }
    }
  } catch {}

  return null;
};

// Procura datas recursivamente em objetos internos caso necessário
export const findDateInObject = (obj: any): string | null => {
  if (!obj || typeof obj !== "object") {
    return null;
  }

  const dateKeys = [
    "fieldworkEnd",
    "fieldworkStart",
    "medianDate",
    "fimColeta",
    "fim_coleta",
    "dataFim",
    "data_fim",
    "dataPesquisa",
    "data_pesquisa",
    "dataDaPesquisa",
    "data_da_pesquisa",
    "dataColeta",
    "data_coleta",
    "inicioColeta",
    "inicio_coleta",
    "datePesquisa",
    "date_pesquisa",
    "realizacao",
    "periodo",
    "createdAt",
    "created_at",
    "date",
    "data"
  ];

  for (const key of dateKeys) {
    const value = obj[key];
    const parsed = parseResearchDate(value);
    if (parsed) return parsed;
  }

  return null;
};

// 1. Identificação robusta da data da pesquisa conforme as regras prioritárias:
// fim da coleta -> início da coleta / mediana -> data da pesquisa -> date -> scan de microdados -> filename
export const getPollDate = (poll: any): string | null => {
  if (!poll || typeof poll !== "object") return null;

  const candidates = [
    poll.fieldworkEnd,
    poll.fimColeta,
    poll.fim_coleta,
    poll.dataFim,
    poll.data_fim,
    poll.medianDate,
    poll.fieldworkStart,
    poll.inicioColeta,
    poll.inicio_coleta,
    poll.dataInicio,
    poll.data_inicio,
    poll.dataPesquisa,
    poll.data_pesquisa,
    poll.dataDaPesquisa,
    poll.data_da_pesquisa,
    poll.dataColeta,
    poll.data_coleta,
    poll.datePesquisa,
    poll.date_pesquisa,
    poll.realizacao,
    poll.periodo,
    poll.date,
    poll.createdAt,
    poll.created_at,
    typeof poll.data === "string" ? poll.data : null,
    poll.fileName,
    poll.description
  ];

  for (const value of candidates) {
    if (value !== undefined && value !== null) {
      const parsed = parseResearchDate(value);
      if (parsed) return parsed;
    }
  }

  // Verifica se há chave de data em sub-objetos (ex: poll.headerInfo, poll.meta, poll.info)
  const nestedSubObjects = [poll.headerInfo, poll.meta, poll.metadata, poll.info];
  for (const sub of nestedSubObjects) {
    if (sub && typeof sub === "object") {
      const parsed = findDateInObject(sub);
      if (parsed) return parsed;
    }
  }

  // Scan rawRows if present
  if (Array.isArray(poll.rawRows) && poll.rawRows.length > 0) {
    for (let i = 0; i < Math.min(50, poll.rawRows.length); i++) {
      const row = poll.rawRows[i];
      if (row && typeof row === "object") {
        for (const [k, v] of Object.entries(row)) {
          const norm = k.toLowerCase();
          if (norm.includes("data") || norm.includes("coleta") || norm.includes("inicio") || norm.includes("entrevista")) {
            const parsed = parseResearchDate(v);
            if (parsed) return parsed;
          }
        }
      }
    }
  }

  return null;
};

// 2. Identificação dos resultados de candidatos por pesquisa (Agregados ou Microdados)
export const getPollCandidates = (
  poll: any,
  selectedOffice: string = "Governador"
): { name: string; percentage: number }[] => {
  if (!poll) return [];

  const normOffice = normalize(selectedOffice);
  const isSen1 =
    normOffice.includes("senador") &&
    (normOffice.includes("1") || normOffice.includes("primeiro") || normOffice.includes("1o") || normOffice.includes("01"));
  const isSen2 =
    normOffice.includes("senador") &&
    (normOffice.includes("2") || normOffice.includes("segundo") || normOffice.includes("2o") || normOffice.includes("02"));
  const isGenericSen = normOffice.includes("senador") && !isSen1 && !isSen2;

  // 1. RESULTADOS ESTRUTURADOS POR CARGO (roleResults / results / roleValidResults)
  if (poll.roleResults && typeof poll.roleResults === "object") {
    let roleKey: string | undefined;

    if (isSen1) {
      roleKey = Object.keys(poll.roleResults).find((k) => {
        const nk = normalize(k);
        return nk.includes("senador") && (nk.includes("1") || nk.includes("primeiro") || nk.includes("1o") || nk.includes("01"));
      });
    } else if (isSen2) {
      roleKey = Object.keys(poll.roleResults).find((k) => {
        const nk = normalize(k);
        return nk.includes("senador") && (nk.includes("2") || nk.includes("segundo") || nk.includes("2o") || nk.includes("02"));
      });
    } else if (isGenericSen) {
      roleKey = Object.keys(poll.roleResults).find((k) => {
        const nk = normalize(k);
        return nk === "senador" || (nk.includes("senador") && !nk.includes("1") && !nk.includes("2") && !nk.includes("primeiro") && !nk.includes("segundo"));
      });
    } else {
      roleKey = Object.keys(poll.roleResults).find((k) => {
        const nk = normalize(k);
        return nk.includes(normOffice) || normOffice.includes(nk);
      });
    }

    if (roleKey && poll.roleResults[roleKey] && Object.keys(poll.roleResults[roleKey]).length > 0) {
      const candidatesMap = poll.roleResults[roleKey];
      if (typeof candidatesMap === "object") {
        return Object.entries(candidatesMap)
          .map(([name, val]: [string, any]) => ({
            name: String(name).trim(),
            percentage: Number(
              typeof val === "number"
                ? val
                : (val?.perc ?? val?.percentual ?? val?.percentage ?? val?.valor ?? val?.votesPct ?? 0)
            )
          }))
          .filter((c) => c.name && Number.isFinite(c.percentage))
          .sort((a, b) => b.percentage - a.percentage);
      }
    }
  }

  // 2. MICRODADOS: if roleResults did NOT have the specific office, compute directly from microdados
  const rows =
    poll.coletas ||
    poll.rows ||
    poll.respostas ||
    poll.questionarios ||
    poll.dados ||
    (Array.isArray(poll.data) ? poll.data : null) ||
    poll.rawRows;

  if (Array.isArray(rows) && rows.length > 0) {
    const counts: Record<string, number> = {};
    const totalSample = poll.sampleSize || rows.length;

    rows.forEach((row: any) => {
      if (!row || typeof row !== "object") return;
      const candidate = extractCandidateVote(row, selectedOffice);
      if (!candidate || candidate === "null" || candidate === "undefined") return;

      const name = String(candidate).trim();
      if (!name) return;

      counts[name] = (counts[name] || 0) + 1;
    });

    if (Object.keys(counts).length > 0) {
      return Object.entries(counts)
        .map(([name, count]) => ({
          name,
          percentage: Number(((count / totalSample) * 100).toFixed(2))
        }))
        .filter((c) => c.name && Number.isFinite(c.percentage))
        .sort((a, b) => b.percentage - a.percentage);
    }
  }

  // 3. Fallbacks diretos ONLY if not explicitly requesting 1º or 2º Senador (to prevent mixing data)
  if (!isSen1 && !isSen2) {
    if (poll.results && typeof poll.results === "object" && !Array.isArray(poll.results)) {
      const entries = Object.entries(poll.results);
      if (entries.length > 0) {
        return entries
          .map(([name, val]: [string, any]) => ({
            name: String(name).trim(),
            percentage: Number(
              typeof val === "number"
                ? val
                : (val?.perc ?? val?.percentual ?? val?.percentage ?? val?.valor ?? 0)
            )
          }))
          .filter((c) => c.name && Number.isFinite(c.percentage))
          .sort((a, b) => b.percentage - a.percentage);
      }
    }

    const aggregated =
      poll.candidatos ||
      poll.candidates ||
      (Array.isArray(poll.resultados) ? poll.resultados : null) ||
      (Array.isArray(poll.results) ? poll.results : null);

    if (Array.isArray(aggregated) && aggregated.length > 0) {
      return aggregated
        .map((c: any) => ({
          name:
            c.nome ||
            c.name ||
            c.candidato ||
            c.candidate ||
            (typeof c === "string" ? c : ""),
          percentage: Number(
            c.perc ??
            c.percentual ??
            c.percentage ??
            c.valor ??
            c.votesPct ??
            0
          )
        }))
        .filter((c: any) => c.name && Number.isFinite(c.percentage))
        .sort((a, b) => b.percentage - a.percentage);
    }
  }

  return [];
};

// 3. Centralização da recuperação da base de microdados da pesquisa
export const getResearchBase = (poll: any, uploadedDatasets?: any[]): any[] => {
  if (!poll) return [];
  const sources = [
    poll.coletas,
    poll.dados,
    poll.rows,
    Array.isArray(poll.data) ? poll.data : null,
    poll.respostas,
    poll.questionarios,
    poll.rawRows
  ];

  for (const source of sources) {
    if (Array.isArray(source) && source.length > 0) {
      return source;
    }
  }

  if (uploadedDatasets && uploadedDatasets.length > 0) {
    const match = uploadedDatasets.find(
      (d) =>
        (poll.id && d.fileName === poll.id) ||
        (poll.registryNumber && d.registryNumber === poll.registryNumber) ||
        (poll.institute && d.institute === poll.institute)
    );
    if (match && Array.isArray(match.rawRows) && match.rawRows.length > 0) {
      return match.rawRows;
    }
  }

  return [];
};

// 4. Extração do voto do candidato para a linha de microdados
function extractCandidateVote(row: Record<string, any>, office: string): string {
  if (!row || typeof row !== "object") return "";

  const normOffice = normalize(office);
  const keys = Object.keys(row);
  let rawVal: any = undefined;

  if (normOffice.includes("gov")) {
    const k = keys.find((key) => {
      const n = normalize(key);
      return (
        n === "governador" ||
        n.startsWith("governador") ||
        n.includes("voto governador") ||
        n === "gov"
      );
    });
    if (k) rawVal = row[k];
  } else if (normOffice.includes("senador")) {
    const isSecond =
      normOffice.includes("2") ||
      normOffice.includes("segundo") ||
      normOffice.includes("2o") ||
      normOffice.includes("02");
    const k = keys.find((key) => {
      const n = normalize(key);
      if (isSecond) {
        return (
          n.includes("senador 02") ||
          n.includes("senador 2") ||
          n === "senador2" ||
          n.includes("segundo senador") ||
          n.includes("2o senador") ||
          n.includes("2º senador")
        );
      }
      return (
        n.includes("senador 01") ||
        n.includes("senador 1") ||
        n === "senador1" ||
        n.includes("primeiro senador") ||
        n.includes("1o senador") ||
        n.includes("1º senador") ||
        (n === "senador" && !n.includes("2"))
      );
    });
    if (k) rawVal = row[k];
  } else if (normOffice.includes("federal")) {
    const k = keys.find((key) => {
      const n = normalize(key);
      return n.includes("deputado federal") || n === "deputado federal" || (n.includes("federal") && !n.includes("estadual"));
    });
    if (k) rawVal = row[k];
  } else if (normOffice.includes("estadual")) {
    const k = keys.find((key) => {
      const n = normalize(key);
      return n.includes("deputado estadual") || n === "deputado estadual" || (n.includes("estadual") && !n.includes("federal"));
    });
    if (k) rawVal = row[k];
  }

  if (rawVal !== undefined && String(rawVal).trim() !== "") {
    const rawStr = String(rawVal).trim();
    const match = matchOfficialCandidate(rawStr, normOffice.includes("senador") ? "Senador" : undefined);
    if (match) return match.candidateName;
    return rawStr;
  }

  if (row[office]) return String(row[office]).trim();
  if (row["Candidato"]) return String(row["Candidato"]).trim();
  if (row["candidato"]) return String(row["candidato"]).trim();
  if (row["Candidate"]) return String(row["Candidate"]).trim();
  if (row["candidate"]) return String(row["candidate"]).trim();

  return "";
}

// Constrói os dados da série temporal a partir de todas as pesquisas disponíveis
export const buildTemporalData = (polls: any[], selectedOffice: string) => {
  if (!Array.isArray(polls)) {
    return [];
  }

  const temporalData = [];

  for (const poll of polls) {
    const date = getPollDate(poll);

    if (!date) {
      console.warn("[SÉRIE TEMPORAL] Pesquisa sem data:", poll);
      continue;
    }

    const candidates = getPollCandidates(poll, selectedOffice);

    if (!candidates || candidates.length === 0) {
      console.warn("[SÉRIE TEMPORAL] Pesquisa sem resultados:", poll);
      continue;
    }

    temporalData.push({
      date,
      pollId:
        poll.id ||
        poll.codigo ||
        poll.id_pesquisa ||
        null,
      pollName:
        poll.institute ||
        poll.nome ||
        poll.nomePesquisa ||
        poll.nome_pesquisa ||
        poll.titulo ||
        "Pesquisa",
      sampleSize:
        poll.sampleSize ||
        poll.amostra ||
        poll.amostraTotal ||
        poll.tamanhoAmostra ||
        0,
      candidates
    });
  }

  return temporalData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

const isNeutralOption = (name: string) => {
  const norm = normalize(name);
  return (
    norm.includes("branco") ||
    norm.includes("nulo") ||
    norm.includes("indeciso") ||
    norm.includes("ns/nr") ||
    norm.includes("ns nr") ||
    norm.includes("nao sabe") ||
    norm.includes("nao sei") ||
    norm.includes("nao respondeu") ||
    norm.includes("nenhum") ||
    norm.includes("ninguem") ||
    norm.includes("outros / indecisos") ||
    norm.includes("outros/indecisos")
  );
};

const getCandidateColor = (name: string, index: number): string => {
  if (CANDIDATE_COLORS[name]) return CANDIDATE_COLORS[name];
  const official = getOfficialCandidateColor(name);
  if (official) return official;
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
};

// Custom, highly immersive, and interactive tooltip showing candidate names and colors
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-2 backdrop-blur-sm min-w-[220px]">
        <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold uppercase tracking-wider">
          {label}
        </p>
        <div className="space-y-1.5">
          {sortedPayload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" 
                  style={{ backgroundColor: entry.stroke || entry.color }} 
                />
                <span className="text-slate-700 dark:text-slate-200 font-semibold truncate max-w-[150px] text-[11px]">
                  {entry.name}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {entry.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardOverviewProps {
  polls: Poll[];
  onNavigate: (tab: ActiveTab) => void;
}

export default function DashboardOverview({ polls: propsPolls, onNavigate }: DashboardOverviewProps) {
  const globalContext = useElectoralData();
  const effectivePolls = (globalContext?.polls && globalContext.polls.length > 0) ? globalContext.polls : (propsPolls || []);
  const selectedOffice = globalContext?.selectedOffice || "Governador";
  const uploadedDatasets = globalContext?.uploadedDatasets || [];

  // Dynamic current date and synchronized countdown calculation
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 1º Turno das Eleições 2026: 04 de Outubro de 2026
  const electionDate = new Date(2026, 9, 4);
  const todayMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  const diffTime = electionDate.getTime() - todayMidnight.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const startDate = new Date(2025, 0, 1);
  const totalDuration = electionDate.getTime() - startDate.getTime();
  const elapsed = Math.max(0, todayMidnight.getTime() - startDate.getTime());
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  const formattedToday = currentDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  // =========================================================================
  // GERAÇÃO DA SÉRIE TEMPORAL COM SUPORTE A DADOS AGREGADOS E MICRODADOS
  // =========================================================================
  const temporalData = useMemo(() => {
    return buildTemporalData(effectivePolls, selectedOffice);
  }, [effectivePolls, selectedOffice]);

  // Lista única global de candidatos na série temporal
  const temporalCandidateNames = useMemo(() => {
    return Array.from(
      new Set(
        temporalData.flatMap((item) =>
          item.candidates.map((c: any) => c.name)
        )
      )
    );
  }, [temporalData]);

  // Formato tabular para o Recharts LineChart
  const temporalChartData = useMemo(() => {
    return temporalData.map((item) => {
      const formattedDate = formatDateBR(item.date);
      const instShort = item.pollName ? item.pollName.split(" ")[0] : "Pesquisa";

      const row: Record<string, any> = {
        date: item.date,
        name: `${formattedDate} (${instShort})`,
        pollId: item.pollId,
        pollName: item.pollName,
        institute: item.pollName,
        sampleSize: item.sampleSize
      };

      temporalCandidateNames.forEach((candidate) => {
        const result = item.candidates.find((c: any) => c.name === candidate);
        row[candidate] = result ? result.percentage : null;
      });

      return row;
    });
  }, [temporalData, temporalCandidateNames]);

  const regularCandidates = useMemo(() => {
    return temporalCandidateNames.filter((name) => !isNeutralOption(name));
  }, [temporalCandidateNames]);

  const specialCandidates = useMemo(() => {
    return temporalCandidateNames.filter((name) => isNeutralOption(name));
  }, [temporalCandidateNames]);

  // Diagnóstico obrigatório via console.table e console.log (Requisitos 12 e 13)
  useEffect(() => {
    if (effectivePolls && effectivePolls.length > 0) {
      console.table(
        effectivePolls.map((poll: any) => ({
          id: poll.id || poll.codigo || poll.id_pesquisa,
          nome: poll.institute || poll.nome || poll.nomePesquisa || poll.titulo,
          dataEncontrada: getPollDate(poll),
          candidatos: getPollCandidates(poll, selectedOffice).length
        }))
      );

      console.log(
        "[SÉRIE TEMPORAL] Dados finais:",
        temporalChartData
      );

      console.log(
        "[SÉRIE TEMPORAL] Candidatos mapeados:",
        temporalCandidateNames
      );
    }
  }, [effectivePolls, temporalChartData, temporalCandidateNames, selectedOffice]);

  // Ponto mais recente da série para widgets de ranking
  const latestItem = useMemo(() => {
    if (!temporalData.length) return null;
    return temporalData[temporalData.length - 1];
  }, [temporalData]);

  const ranking = useMemo(() => {
    if (!latestItem) return [];
    return latestItem.candidates
      .filter((c: any) => !isNeutralOption(c.name))
      .sort((a: any, b: any) => b.percentage - a.percentage)
      .map((c: any) => [c.name, c.percentage] as [string, number]);
  }, [latestItem]);

  const analysisCards = [
    {
      id: "diagnostico" as ActiveTab,
      title: "Diagnóstico",
      desc: "Status detalhado de pesquisas registradas",
      color: "text-blue-600 bg-blue-50 border-blue-100",
      icon: Activity
    },
    {
      id: "mapa-eleitoral" as ActiveTab,
      title: "Mapa Eleitoral",
      desc: "Cartografia com os 75 municípios sergipanos",
      color: "text-rose-600 bg-rose-50 border-rose-100",
      icon: Map
    },
    {
      id: "analise-territorial" as ActiveTab,
      title: "Análise Territorial",
      desc: "Desempenho por territórios de planejamento",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      icon: BarChart3
    }
  ];

  const intelligenceCards = [
    {
      id: "radar" as ActiveTab,
      title: "Radar",
      desc: "Monitoramento síncrono de redes e trackings",
      color: "text-amber-600 bg-amber-50 border-amber-100",
      icon: Radio
    },
    {
      id: "caminho-vitoria" as ActiveTab,
      title: "Caminho da Vitória",
      desc: "Simulações e projeções de segundo turno",
      color: "text-teal-600 bg-teal-50 border-teal-100",
      icon: TrendingUp
    },
    {
      id: "projecao" as ActiveTab,
      title: "Projeção",
      desc: "Modelos preditivos e regressões estatísticas",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      icon: RechartsLineIcon
    },
    {
      id: "composicao-chapa" as ActiveTab,
      title: "Composição de Chapa",
      desc: "Análise de coligações e puxadores de votos",
      color: "text-slate-600 bg-slate-50 border-slate-100",
      icon: Layers
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-blue-950 dark:text-white">Inteligência Eleitoral unificada</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
          Dados síncronos e simulação geopolítica baseada nas resoluções vigentes do TSE.
        </p>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Election Countdown Card */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-950 text-white p-6 rounded-2xl shadow-md relative overflow-hidden border border-blue-800">
          <div className="absolute right-4 top-4 opacity-10">
            <Calendar className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <p className="text-xs font-mono uppercase tracking-widest text-blue-300">ELEIÇÕES GERAIS 2026 • 1º TURNO</p>
            <span className="text-[10px] font-mono bg-blue-800/80 px-2 py-0.5 rounded border border-blue-700/60 text-blue-200">
              04/10/2026
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <span className="text-5xl font-serif font-black tracking-tight">{diffDays}</span>
            <span className="text-sm font-mono ml-2 text-blue-200">dias restantes</span>
          </div>
          <div className="mt-6 relative z-10">
            <div className="flex justify-between text-xs text-blue-300 font-mono mb-1.5">
              <span>Hoje ({formattedToday})</span>
              <span>{progressPercent}% cumprido</span>
              <span>04 Out 2026</span>
            </div>
            <div className="w-full bg-blue-900/60 h-2.5 rounded-full overflow-hidden border border-blue-700/30">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Candidates Linked Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Candidatos</p>
              <h3 className="text-4xl font-serif font-bold text-slate-800 dark:text-white mt-2">
                {temporalCandidateNames.length > 0 ? temporalCandidateNames.length : 26}{" "}
                <span className="text-xs font-sans font-normal text-slate-500">mapeados</span>
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-300 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex gap-1.5 items-center">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>{regularCandidates.length} Candidatos</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <span>{temporalData.length} Pontos Temporais</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>Cargo: {selectedOffice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Temporal LineChart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-serif font-bold text-blue-950 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                Série Temporal de Intenção de Votos
              </h2>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                {selectedOffice}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Evolução histórica calculada a partir de todas as pesquisas registradas e trackings disponíveis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {globalContext?.setSelectedOffice && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedOffice}
                  onChange={(e) => globalContext.setSelectedOffice(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer text-xs"
                >
                  <option value="Governador" className="bg-white dark:bg-slate-900">Governador</option>
                  <option value="1º Senador" className="bg-white dark:bg-slate-900">1º Senador</option>
                  <option value="2º Senador" className="bg-white dark:bg-slate-900">2º Senador</option>
                  <option value="Deputado Federal" className="bg-white dark:bg-slate-900">Deputado Federal</option>
                  <option value="Deputado Estadual" className="bg-white dark:bg-slate-900">Deputado Estadual</option>
                </select>
              </div>
            )}
            <div className="text-right">
              <span className="bg-blue-50 dark:bg-blue-950 text-blue-950 dark:text-blue-200 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold border border-blue-100 dark:border-blue-800">
                Última Atualização: {latestItem ? (latestItem.pollName ? `${formatDateBR(latestItem.date)} (${latestItem.pollName.split(" ")[0]})` : formatDateBR(latestItem.date)) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {temporalChartData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temporalChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="opacity-40" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis unit="%" tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                
                {/* Linhas para todos os candidatos encontrados na base temporal */}
                {regularCandidates.map((candidateName, idx) => (
                  <Line
                    key={candidateName}
                    type="monotone"
                    dataKey={candidateName}
                    stroke={getCandidateColor(candidateName, idx)}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 1.5, stroke: "#ffffff" }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: "#ffffff" }}
                    connectNulls
                  />
                ))}

                {/* Opções neutras (Brancos/Nulos, Indecisos) com linhas tracejadas */}
                {specialCandidates.map((optionName) => {
                  const isIndeciso = normalize(optionName).includes("indeciso") || normalize(optionName).includes("ns/nr");
                  const strokeColor = isIndeciso ? "#64748B" : "#94A3B8";
                  return (
                    <Line
                      key={optionName}
                      type="monotone"
                      dataKey={optionName}
                      stroke={CANDIDATE_COLORS[optionName] || strokeColor}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3, strokeWidth: 1, stroke: "#ffffff" }}
                      connectNulls
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-mono text-sm">
            Nenhum dado de pesquisa registrado para exibir na série temporal.
          </div>
        )}

        {/* Latest ranking widget */}
        {ranking.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Posicionamento no Último Tracking ({latestItem?.pollName})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {ranking.map(([name, pct], idx) => {
                return (
                  <div key={name} className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                    <span className="text-slate-400 font-mono font-bold text-sm">#{idx + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{name}</p>
                      <p className="text-sm font-mono font-bold text-blue-900 dark:text-blue-400 mt-0.5">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Análise de Votos */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
          ANÁLISE DE VOTOS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analysisCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group flex flex-col justify-between min-h-[110px] sm:min-h-[130px] sm:h-36 h-auto cursor-pointer"
              >
                <div className="flex justify-between items-start w-full">
                  <div className={`p-2 rounded-lg ${card.color.split(" ")[1]} ${card.color.split(" ")[0]} border ${card.color.split(" ")[2]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-serif font-bold text-slate-800 dark:text-white">{card.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{card.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Inteligência Estratégica */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
          INTELIGÊNCIA ESTRATÉGICA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {intelligenceCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group flex flex-col justify-between min-h-[110px] sm:min-h-[130px] sm:h-36 h-auto cursor-pointer"
              >
                <div className="flex justify-between items-start w-full">
                  <div className={`p-2 rounded-lg ${card.color.split(" ")[1]} ${card.color.split(" ")[0]} border ${card.color.split(" ")[2]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-serif font-bold text-slate-800 dark:text-white">{card.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{card.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/**
 * Utilitário de formatação de datas no padrão brasileiro (DD/MM/AAAA)
 * com proteção contra deslocamentos de fuso horário UTC/GMT.
 */

export function formatDateBR(dateInput?: string | Date | number | null): string {
  if (!dateInput) return "—";

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return "—";

    // Se já estiver no padrão brasileiro DD/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    // Se for formato YYYY-MM-DD
    const isoDateMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoDateMatch) {
      const year = isoDateMatch[1];
      const month = isoDateMatch[2].padStart(2, "0");
      const day = isoDateMatch[3].padStart(2, "0");
      return `${day}/${month}/${year}`;
    }

    // Se for formato DD-MM-YYYY
    const brHyphenMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (brHyphenMatch) {
      const day = brHyphenMatch[1].padStart(2, "0");
      const month = brHyphenMatch[2].padStart(2, "0");
      const year = brHyphenMatch[3];
      return `${day}/${month}/${year}`;
    }
  }

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return typeof dateInput === "string" ? dateInput : "—";
    
    // Formata usando toLocaleDateString no fuso brasileiro
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    });
  } catch {
    return typeof dateInput === "string" ? dateInput : "—";
  }
}

export function formatDateRangeBR(
  startDate?: string | Date | null,
  endDate?: string | Date | null
): string {
  const start = formatDateBR(startDate);
  const end = formatDateBR(endDate);

  if (start !== "—" && end !== "—") {
    if (start === end) return start;
    return `${start} a ${end}`;
  }
  if (start !== "—") return `A partir de ${start}`;
  if (end !== "—") return `Até ${end}`;
  return "Sem data";
}

export interface PollDateFields {
  medianDate?: string;
  fieldworkStart?: string;
  fieldworkEnd?: string;
  date?: string;
}

export function getPollDateBR(poll?: PollDateFields | string | null): string {
  if (!poll) return "—";
  if (typeof poll === "string") return formatDateBR(poll);
  if (poll.medianDate) return formatDateBR(poll.medianDate);
  if (poll.fieldworkEnd) return formatDateBR(poll.fieldworkEnd);
  if (poll.fieldworkStart) return formatDateBR(poll.fieldworkStart);
  if (poll.date) return formatDateBR(poll.date);
  return "Sem data";
}

export function getPollDateDetailBR(poll?: PollDateFields | string | null): string {
  if (!poll) return "Sem data";
  if (typeof poll === "string") return formatDateBR(poll);
  if (poll.fieldworkStart && poll.fieldworkEnd) {
    const range = formatDateRangeBR(poll.fieldworkStart, poll.fieldworkEnd);
    if (poll.medianDate) {
      const median = formatDateBR(poll.medianDate);
      return `${range} (Mediana: ${median})`;
    }
    return range;
  }
  return getPollDateBR(poll);
}

/**
 * Retorna a data mediana da pesquisa no formato brasileiro DD/MM/AAAA.
 * Se a pesquisa tiver fieldworkStart e fieldworkEnd, calcula a data mediana caso medianDate não esteja preenchida.
 */
export function getPollMedianDateBR(poll?: any): string {
  if (!poll) return "";
  if (typeof poll === "string") return formatDateBR(poll);

  // Candidatos diretos a data mediana
  const candidate =
    poll.medianDate ||
    poll.dataMediana ||
    poll.data_mediana ||
    poll.date ||
    poll.dataPesquisa;

  if (candidate && candidate !== "1970-01-01" && !String(candidate).startsWith("1970")) {
    const formatted = formatDateBR(candidate);
    if (formatted !== "—") return formatted;
  }

  // Fallback: calcular a partir do início e fim do campo
  const start = poll.fieldworkStart || poll.dataInicio || poll.inicioColeta;
  const end = poll.fieldworkEnd || poll.dataFim || poll.fimColeta;
  if (start && end && start !== "1970-01-01" && end !== "1970-01-01") {
    try {
      const d1 = new Date(start);
      const d2 = new Date(end);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
        const mid = new Date(d1.getTime() + (d2.getTime() - d1.getTime()) / 2);
        const formatted = formatDateBR(mid);
        if (formatted !== "—") return formatted;
      }
    } catch {}
    const formattedStart = formatDateBR(start);
    if (formattedStart !== "—") return formattedStart;
  }

  if (start && start !== "1970-01-01") {
    const f = formatDateBR(start);
    if (f !== "—") return f;
  }
  if (end && end !== "1970-01-01") {
    const f = formatDateBR(end);
    if (f !== "—") return f;
  }

  return "";
}

/**
 * Retorna a data em que a base de pesquisa foi inserida / importada no sistema.
 * Prioriza dados de timestamp de auditoria (createdAt, loadedAt, provenance.loadedAt),
 * com fallback inteligente para períodos de campo ou data mediana.
 */
export function getPollInsertedDateBR(poll?: any, includeTime: boolean = false): string {
  if (!poll) return "";

  const rawCandidate =
    poll.createdAt ||
    poll.loadedAt ||
    poll.provenance?.loadedAt ||
    poll.dataInsercao ||
    poll.data_insercao ||
    poll.dataUpload ||
    poll.uploadDate ||
    poll.importedAt ||
    poll.updatedAt ||
    poll.medianDate ||
    poll.fieldworkEnd ||
    poll.fieldworkStart ||
    poll.date;

  if (!rawCandidate) return "";

  // Se já for string contendo DD/MM/AAAA
  if (typeof rawCandidate === "string") {
    const brMatch = rawCandidate.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
    if (brMatch && !includeTime) {
      return brMatch[1];
    }
  }

  // Tenta extrair hora se solicitado e se disponível
  if (includeTime) {
    try {
      const d = new Date(rawCandidate);
      if (!isNaN(d.getTime())) {
        const baseDate = formatDateBR(d);
        if (baseDate !== "—") {
          const hh = String(d.getHours()).padStart(2, "0");
          const mm = String(d.getMinutes()).padStart(2, "0");
          if (hh !== "00" || mm !== "00" || (typeof rawCandidate === "string" && rawCandidate.includes("T"))) {
            return `${baseDate} às ${hh}:${mm}`;
          }
          return baseDate;
        }
      }
    } catch {
      // fallback
    }
  }

  const formatted = formatDateBR(rawCandidate);
  return formatted !== "—" ? formatted : "";
}

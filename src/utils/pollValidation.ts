import { Poll } from "../types";

/**
 * Validação rigorosa de pesquisas eleitorais.
 * Bloqueia pesquisas em branco, stubs de testes e registros corrompidos.
 */
export function isValidPoll(p: any): boolean {
  if (!p || typeof p !== "object") return false;

  const id = String(p.id || "").trim();
  const institute = String(p.institute || "").trim().toLowerCase();

  // 1. Bloquear artefatos de testes ou institutos fictícios de auditoria
  if (
    id.startsWith("poll-test") ||
    id.startsWith("test-") ||
    institute.includes("test") ||
    institute.includes("hackinstitute")
  ) {
    return false;
  }

  // 2. Contabilizar microdados/questionários coletados
  const rawRows = p.rawRows || p.coletas || p.dados || p.respostas || p.questionarios || [];
  const rawRowsCount = Array.isArray(rawRows) ? rawRows.length : 0;

  // 3. Tamanho amostral declarado
  const sampleSize = typeof p.sampleSize === "number" && !isNaN(p.sampleSize) ? p.sampleSize : 0;

  // 4. Resultados de candidatos / perguntas
  const resultsKeys = p.results && typeof p.results === "object" ? Object.keys(p.results).length : 0;
  const roleResultsKeys = p.roleResults && typeof p.roleResults === "object" ? Object.keys(p.roleResults).length : 0;

  // Se não tem microdados E não tem tamanho amostral válido (> 0), a pesquisa está em branco
  if (rawRowsCount === 0 && sampleSize <= 0) {
    return false;
  }

  // Se não tem microdados e só tem 1 chave genérica (ex: {"Attacker": 99} ou {"Valadares": 35}) sem amostra
  if (rawRowsCount === 0 && resultsKeys <= 1 && roleResultsKeys === 0) {
    return false;
  }

  // 5. Nome / Identificação
  const name = String(p.name || p.fileName || p.title || p.description || "").trim();
  // Se não tem nome nenhum e o instituto é genérico/desconhecido, está em branco
  if (!name && (institute === "" || institute === "não informado" || institute === "nao informado")) {
    return false;
  }

  return true;
}

/**
 * Retorna se uma pesquisa é considerada "em branco" ou inválida.
 */
export function isBlankOrInvalidPoll(p: any): boolean {
  return !isValidPoll(p);
}

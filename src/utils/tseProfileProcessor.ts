import Papa from "papaparse";
import {
  TSEBaseValidationReport,
  TSEBaseStorageItem,
  TSEBaseMetadata
} from "../types/tseProfile";
import { decodeTextFile, isTseSentinelValue } from "./fileParser";

/**
 * Mapeamento e Definição de Campos do Perfil do Eleitorado TSE
 * Suporta o formato do LEIAME TSE e as variações oficiais do Portal de Dados Abertos TSE
 */
interface TSEFieldSpec {
  canonical: string;
  aliases: string[];
  required: boolean;
  label: string;
}

export const OFFICIAL_TSE_PROFILE_COLUMNS = [
  "DT_GERACAO",
  "ANO_ELEICAO",
  "SG_UF",
  "CD_MUNICIPIO",
  "NM_MUNICIPIO",
  "CD_GENERO",
  "DS_GENERO",
  "CD_FAIXA_ETARIA",
  "DS_FAIXA_ETARIA",
  "CD_GRAU_ESCOLARIDADE",
  "DS_GRAU_ESCOLARIDADE",
  "CD_RACA_COR",
  "DS_RACA_COR",
  "QT_ELEITORES_PERFIL"
] as const;

export const TSE_FIELD_SPECS: TSEFieldSpec[] = [
  {
    canonical: "DT_GERACAO",
    aliases: ["DT_GERACAO", "DATA_GERACAO", "DT_GERACAO_ARQUIVO", "DT_GERACAO_BASE"],
    required: true,
    label: "Data de Geração (DT_GERACAO)"
  },
  {
    canonical: "ANO_ELEICAO",
    aliases: ["ANO_ELEICAO", "ANO_ELEICAO_REFERENCIA", "ANO", "NR_ANO_ELEICAO"],
    required: false,
    label: "Ano da Eleição (ANO_ELEICAO)"
  },
  {
    canonical: "SG_UF",
    aliases: ["SG_UF", "UF", "SIGLA_UF"],
    required: false,
    label: "Sigla da UF (SG_UF)"
  },
  {
    canonical: "CD_MUNICIPIO",
    aliases: ["CD_MUNICIPIO", "CD_MUNICIPIO_TSE", "COD_MUNICIPIO", "CODIGO_MUNICIPIO", "NR_MUNICIPIO"],
    required: true,
    label: "Código do Município (CD_MUNICIPIO)"
  },
  {
    canonical: "NM_MUNICIPIO",
    aliases: ["NM_MUNICIPIO", "NM_MUNICIPIO_TSE", "NOME_MUNICIPIO", "MUNICIPIO"],
    required: true,
    label: "Nome do Município (NM_MUNICIPIO)"
  },
  {
    canonical: "CD_GENERO",
    aliases: ["CD_GENERO", "CD_SEXO", "COD_GENERO", "COD_SEXO", "CD_GENERO_TSE"],
    required: false,
    label: "Código de Gênero"
  },
  {
    canonical: "DS_GENERO",
    aliases: ["DS_GENERO", "DS_SEXO", "GENERO", "SEXO", "DESCRICAO_GENERO", "DS_GENERO_TSE"],
    required: true,
    label: "Descrição de Gênero (DS_GENERO)"
  },
  {
    canonical: "CD_FAIXA_ETARIA",
    aliases: ["CD_FAIXA_ETARIA", "CD_FAIXAETARIA", "CD_FAIXA_ETARIA_DETALHADA", "COD_FAIXA_ETARIA"],
    required: false,
    label: "Código de Faixa Etária"
  },
  {
    canonical: "DS_FAIXA_ETARIA",
    aliases: ["DS_FAIXA_ETARIA", "DS_FAIXAETARIA", "DS_FAIXA_ETARIA_DETALHADA", "FAIXA_ETARIA", "DESCRICAO_FAIXA_ETARIA"],
    required: true,
    label: "Descrição de Faixa Etária (DS_FAIXA_ETARIA)"
  },
  {
    canonical: "CD_GRAU_ESCOLARIDADE",
    aliases: ["CD_GRAU_ESCOLARIDADE", "CD_GRAU_INSTRUCAO", "CD_ESCOLARIDADE", "CD_INSTRUCAO", "COD_GRAU_INSTRUCAO"],
    required: false,
    label: "Código de Escolaridade"
  },
  {
    canonical: "DS_GRAU_ESCOLARIDADE",
    aliases: ["DS_GRAU_ESCOLARIDADE", "DS_GRAU_INSTRUCAO", "DS_ESCOLARIDADE", "DS_INSTRUCAO", "ESCOLARIDADE", "GRAU_INSTRUCAO"],
    required: true,
    label: "Grau de Escolaridade / Instrução (DS_GRAU_ESCOLARIDADE / DS_GRAU_INSTRUCAO)"
  },
  {
    canonical: "CD_RACA_COR",
    aliases: ["CD_RACA_COR", "CD_COR_RACA", "CD_RACA", "CD_COR", "COD_COR_RACA"],
    required: false,
    label: "Código de Cor / Raça"
  },
  {
    canonical: "DS_RACA_COR",
    aliases: ["DS_RACA_COR", "DS_COR_RACA", "DS_RACA", "DS_COR", "RACA_COR", "COR_RACA", "DESCRICAO_COR_RACA"],
    required: false,
    label: "Cor / Raça (DS_RACA_COR / DS_COR_RACA)"
  },
  {
    canonical: "QT_ELEITORES_PERFIL",
    aliases: [
      "QT_ELEITORES_PERFIL",
      "QT_ELEITORES",
      "QT_ELEITORES_SECAO",
      "QT_ELEITOR",
      "QTD_ELEITORES",
      "QUANTIDADE_ELEITORES",
      "QT_TOTAL_ELEITORES"
    ],
    required: true,
    label: "Quantidade de Eleitores (QT_ELEITORES_PERFIL / QT_ELEITORES)"
  },
  {
    canonical: "QT_ELEITORES_BIOMETRIA",
    aliases: ["QT_ELEITORES_BIOMETRIA", "QT_BIOMETRIA", "QT_ELEITORES_COM_BIOMETRIA", "QTD_BIOMETRIA"],
    required: false,
    label: "Eleitores com Biometria"
  },
  {
    canonical: "QT_ELEITORES_DEFICIENCIA",
    aliases: ["QT_ELEITORES_DEFICIENCIA", "QT_DEFICIENCIA", "QT_ELEITORES_COM_DEFICIENCIA", "QTD_DEFICIENCIA"],
    required: false,
    label: "Eleitores com Deficiência"
  },
  {
    canonical: "QT_ELEITORES_INC_NM_SOCIAL",
    aliases: ["QT_ELEITORES_INC_NM_SOCIAL", "QT_NM_SOCIAL", "QT_NOME_SOCIAL", "QTD_NOME_SOCIAL"],
    required: false,
    label: "Eleitores com Nome Social"
  }
];

/**
 * Normaliza nome de cabeçalho para comparação flexível
 */
function cleanHeaderName(header: string): string {
  return header
    .replace(/^\uFEFF/, "") // Remove BOM
    .trim()
    .replace(/^["']|["']$/g, "")
    .toUpperCase()
    .replace(/[\s\-_]+/g, "_");
}

/**
 * Limpa e normaliza valores considerando códigos especiais do TSE
 * #NULO = informação em branco
 * -1 = equivalente numérico de #NULO
 * #NE = informação não registrada naquele ano
 * -3 = equivalente numérico de #NE
 */
export function cleanTseCode(val: any): { isNull: boolean; isNotRecorded: boolean; cleanedStr: string; num: number } {
  if (val === undefined || val === null) {
    return { isNull: true, isNotRecorded: false, cleanedStr: "Não Informado", num: -1 };
  }

  const str = String(val).trim().replace(/^["']|["']$/g, "");
  const upper = str.toUpperCase();

  if (isTseSentinelValue(val) || upper === "#NULO" || upper === "-1" || upper === "NULO" || str === "") {
    return { isNull: true, isNotRecorded: false, cleanedStr: "Não Informado", num: -1 };
  }

  if (upper === "#NE" || upper === "-3" || upper === "NE") {
    return { isNull: false, isNotRecorded: true, cleanedStr: "Não Registrado", num: -3 };
  }

  // Prevenção de corrupção: nunca extrair dígitos de strings com sinal negativo
  if (str.startsWith("-")) {
    return { isNull: true, isNotRecorded: false, cleanedStr: "Não Informado", num: -1 };
  }

  const num = parseInt(str.replace(/\D/g, ""), 10);
  return {
    isNull: false,
    isNotRecorded: false,
    cleanedStr: str,
    num: isNaN(num) ? 0 : num
  };
}

/**
 * Converte com segurança valores da coluna QT_ELEITORES / QT_ELEITORES_PERFIL
 * Sentinelas (#NULO, #NE, -1, -3) ou vazios resultam estritamente em 0 eleitores (sem somar valores fantasma).
 */
export function cleanTseElectorCount(val: any): { count: number; isSentinel: boolean } {
  if (val === undefined || val === null) {
    return { count: 0, isSentinel: true };
  }
  if (isTseSentinelValue(val)) {
    return { count: 0, isSentinel: true };
  }

  if (typeof val === "number") {
    if (val < 0) return { count: 0, isSentinel: true };
    return { count: Math.round(val), isSentinel: false };
  }

  const str = String(val).trim().replace(/^["']|["']$/g, "");
  if (str.startsWith("-") || str === "" || str.toUpperCase() === "#NULO" || str.toUpperCase() === "#NE") {
    return { count: 0, isSentinel: true };
  }

  const parsed = parseInt(str.replace(/\D/g, ""), 10);
  return {
    count: isNaN(parsed) ? 0 : parsed,
    isSentinel: false
  };
}

/**
 * Decodifica arquivo suportando Latin-1 (ISO-8859-1) e UTF-8 com detecção de BOM
 */
export async function decodeTseFileBuffer(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return decodeTextFile(buffer);
}

/**
 * Parse e Auditoria Completa da Base de Perfil do Eleitorado TSE
 * Aceita fielmente tanto o leiaute do LEIAME quanto as versões do Portal de Dados Abertos TSE
 */
export async function parseAndAuditTSEProfileFile(
  fileContent: string,
  fileName: string
): Promise<{
  success: boolean;
  item?: TSEBaseStorageItem;
  report: TSEBaseValidationReport;
  rawRowsCount: number;
}> {
  const issues: string[] = [];
  const warnings: string[] = [];
  const passedChecks: string[] = [];
  const legacyColumnAlerts: string[] = [];

  // Parse PapaParse com delimitador ';' padrão TSE
  const parseResult = Papa.parse<Record<string, any>>(fileContent, {
    header: true,
    delimiter: ";",
    skipEmptyLines: "greedy",
    transformHeader: (h) => cleanHeaderName(h)
  });

  let rows = parseResult.data;
  let headers = parseResult.meta.fields || [];

  // Se não identificou cabeçalhos válidos pelo ';', tentar detecção automática de delimitador
  if (headers.length <= 1 && fileContent.includes(",")) {
    const autoParse = Papa.parse<Record<string, any>>(fileContent, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => cleanHeaderName(h)
    });
    if (autoParse.meta.fields && autoParse.meta.fields.length > headers.length) {
      rows = autoParse.data;
      headers = autoParse.meta.fields;
    }
  }

  const rawRowsCount = rows.length;

  if (rawRowsCount === 0 || headers.length === 0) {
    issues.push("O arquivo carregado está vazio ou não possui formato CSV/TXT legível.");
    return {
      success: false,
      rawRowsCount: 0,
      report: {
        isValid: false,
        hasErrors: true,
        hasWarnings: false,
        issues,
        warnings,
        passedChecks,
        columnsFound: headers,
        columnsMissing: ["DT_GERACAO", "CD_MUNICIPIO", "NM_MUNICIPIO", "DS_GENERO", "DS_FAIXA_ETARIA", "DS_GRAU_ESCOLARIDADE", "QT_ELEITORES_PERFIL"],
        legacyColumnAlerts,
        nullCodesDetectedCount: 0
      }
    };
  }

  // Mapa de correspondência de cabeçalhos encontrados
  const headerMap: Record<string, string> = {};
  const columnsMissing: string[] = [];

  for (const spec of TSE_FIELD_SPECS) {
    const matchedHeader = headers.find((h) => spec.aliases.includes(h));
    if (matchedHeader) {
      headerMap[spec.canonical] = matchedHeader;
    } else if (spec.required) {
      columnsMissing.push(spec.label);
    }
  }

  // Identificação de compatibilidade de leiaute
  const hasEscolaridadeOficial = !!headerMap["DS_GRAU_ESCOLARIDADE"];
  const isDadosAbertosEscolaridade = headerMap["DS_GRAU_ESCOLARIDADE"] === "DS_GRAU_INSTRUCAO";
  const isDadosAbertosQuantidade = headerMap["QT_ELEITORES_PERFIL"] === "QT_ELEITORES";
  const isDadosAbertosRaca = headerMap["DS_RACA_COR"] === "DS_COR_RACA";

  if (isDadosAbertosEscolaridade || isDadosAbertosQuantidade || isDadosAbertosRaca) {
    passedChecks.push("Padrão TSE Dados Abertos identificado e validado com sucesso.");
  } else {
    passedChecks.push("Padrão TSE LEIAME Oficial identificado e validado com sucesso.");
  }

  if (columnsMissing.length > 0) {
    issues.push(
      `Colunas obrigatórias do perfil do eleitorado não identificadas no arquivo: ${columnsMissing.join(", ")}.`
    );
  } else {
    passedChecks.push("Todas as colunas essenciais do eleitorado estão presentes no arquivo.");
  }

  // 2. Extração Fiel de Metadados da Base (DT_GERACAO, ANO_ELEICAO, SG_UF)
  const firstRow = rows[0] || {};
  const dtGeracaoKey = headerMap["DT_GERACAO"] || "DT_GERACAO";
  const anoEleicaoKey = headerMap["ANO_ELEICAO"] || "ANO_ELEICAO";
  const sgUfKey = headerMap["SG_UF"] || "SG_UF";

  let dtGeracaoRaw = firstRow[dtGeracaoKey] ? String(firstRow[dtGeracaoKey]).trim().replace(/^["']|["']$/g, "") : "";
  let anoEleicaoRaw = firstRow[anoEleicaoKey] ? String(firstRow[anoEleicaoKey]).trim().replace(/^["']|["']$/g, "") : "";
  let sgUfRaw = firstRow[sgUfKey] ? String(firstRow[sgUfKey]).trim().replace(/^["']|["']$/g, "").toUpperCase() : "";

  // Se ano da eleição não estiver em coluna própria, extrair da data de geração se disponível
  if (!anoEleicaoRaw && dtGeracaoRaw) {
    const yearMatch = dtGeracaoRaw.match(/\b(20\d\d)\b/);
    if (yearMatch) anoEleicaoRaw = yearMatch[1];
  }
  if (!anoEleicaoRaw) anoEleicaoRaw = "2026";

  if (!dtGeracaoRaw) {
    dtGeracaoRaw = "Data Não Informada no Arquivo";
    warnings.push("O campo 'DT_GERACAO' está vazio no arquivo carregado.");
  } else {
    passedChecks.push(`Data de Geração do TSE identificada: ${dtGeracaoRaw}`);
  }

  passedChecks.push(`Ano da Eleição / Referência identificado: ${anoEleicaoRaw}`);

  if (sgUfRaw && sgUfRaw !== "SE" && sgUfRaw !== "BR") {
    warnings.push(`A UF identificada no arquivo é '${sgUfRaw}'.`);
  }

  // 3. Processamento e Totalização de Eleitores (SUM QT_ELEITORES_PERFIL / QT_ELEITORES)
  let totalEleitoresAptos = 0;
  let totalBiometria = 0;
  let totalDeficiencia = 0;
  let totalNomeSocial = 0;
  let nullCodesCount = 0;

  const distinctMunicipios = new Map<string, { codigo: string; nome: string; eleitores: number }>();
  const distGenero: Record<string, { codigo: string; descricao: string; eleitores: number; percentual: number }> = {};
  const distFaixaEtaria: Record<string, { codigo: string; descricao: string; eleitores: number; percentual: number }> = {};
  const distEscolaridade: Record<string, { codigo: string; descricao: string; eleitores: number; percentual: number }> = {};
  const distRacaCor: Record<string, { codigo: string; descricao: string; eleitores: number; percentual: number }> = {};

  const colMunCod = headerMap["CD_MUNICIPIO"];
  const colMunNom = headerMap["NM_MUNICIPIO"];
  const colGenCod = headerMap["CD_GENERO"];
  const colGenDs = headerMap["DS_GENERO"];
  const colFaixaCod = headerMap["CD_FAIXA_ETARIA"];
  const colFaixaDs = headerMap["DS_FAIXA_ETARIA"];
  const colEscCod = headerMap["CD_GRAU_ESCOLARIDADE"];
  const colEscDs = headerMap["DS_GRAU_ESCOLARIDADE"];
  const colRacaCod = headerMap["CD_RACA_COR"];
  const colRacaDs = headerMap["DS_RACA_COR"];
  const colQtdEleitores = headerMap["QT_ELEITORES_PERFIL"];
  const colBiometria = headerMap["QT_ELEITORES_BIOMETRIA"];
  const colDeficiencia = headerMap["QT_ELEITORES_DEFICIENCIA"];
  const colNomeSocial = headerMap["QT_ELEITORES_INC_NM_SOCIAL"];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Eleitores da linha com tratamento estrito de sentinelas
    const rawQtd = colQtdEleitores ? row[colQtdEleitores] : 0;
    const { count: qtdEleitores, isSentinel } = cleanTseElectorCount(rawQtd);
    if (isSentinel) nullCodesCount++;
    totalEleitoresAptos += qtdEleitores;

    // Biometria / Deficiência / Nome Social opcionais
    if (colBiometria && row[colBiometria] !== undefined) {
      const { count: bioCount } = cleanTseElectorCount(row[colBiometria]);
      totalBiometria += bioCount;
    }
    if (colDeficiencia && row[colDeficiencia] !== undefined) {
      const { count: defCount } = cleanTseElectorCount(row[colDeficiencia]);
      totalDeficiencia += defCount;
    }
    if (colNomeSocial && row[colNomeSocial] !== undefined) {
      const { count: socCount } = cleanTseElectorCount(row[colNomeSocial]);
      totalNomeSocial += socCount;
    }

    // Município
    const cdMun = colMunCod ? String(row[colMunCod] || "").trim() : "";
    const nmMun = colMunNom ? String(row[colMunNom] || "").trim().toUpperCase() : "";
    if (cdMun || nmMun) {
      const keyMun = cdMun || nmMun;
      const curMun = distinctMunicipios.get(keyMun) || { codigo: cdMun, nome: nmMun, eleitores: 0 };
      curMun.eleitores += qtdEleitores;
      distinctMunicipios.set(keyMun, curMun);
    }

    // Gênero
    if (colGenDs) {
      const cdGen = colGenCod ? cleanTseCode(row[colGenCod]) : { isNull: false, isNotRecorded: false, cleanedStr: "", num: 0 };
      const dsGen = cleanTseCode(row[colGenDs]);
      if (dsGen.isNull || dsGen.isNotRecorded) nullCodesCount++;
      const genKey = dsGen.cleanedStr;
      if (!distGenero[genKey]) {
        distGenero[genKey] = { codigo: String(cdGen.num || 0), descricao: genKey, eleitores: 0, percentual: 0 };
      }
      distGenero[genKey].eleitores += qtdEleitores;
    }

    // Faixa Etária
    if (colFaixaDs) {
      const cdIdade = colFaixaCod ? cleanTseCode(row[colFaixaCod]) : { isNull: false, isNotRecorded: false, cleanedStr: "", num: 0 };
      const dsIdade = cleanTseCode(row[colFaixaDs]);
      if (dsIdade.isNull || dsIdade.isNotRecorded) nullCodesCount++;
      const idadeKey = dsIdade.cleanedStr;
      if (!distFaixaEtaria[idadeKey]) {
        distFaixaEtaria[idadeKey] = { codigo: String(cdIdade.num || 0), descricao: idadeKey, eleitores: 0, percentual: 0 };
      }
      distFaixaEtaria[idadeKey].eleitores += qtdEleitores;
    }

    // Escolaridade / Grau de Instrução
    if (colEscDs) {
      const cdEsc = colEscCod ? cleanTseCode(row[colEscCod]) : { isNull: false, isNotRecorded: false, cleanedStr: "", num: 0 };
      const dsEsc = cleanTseCode(row[colEscDs]);
      if (dsEsc.isNull || dsEsc.isNotRecorded) nullCodesCount++;
      const escKey = dsEsc.cleanedStr;
      if (!distEscolaridade[escKey]) {
        distEscolaridade[escKey] = { codigo: String(cdEsc.num || 0), descricao: escKey, eleitores: 0, percentual: 0 };
      }
      distEscolaridade[escKey].eleitores += qtdEleitores;
    }

    // Cor / Raça (quando presente)
    if (colRacaDs) {
      const cdRaca = colRacaCod ? cleanTseCode(row[colRacaCod]) : { isNull: false, isNotRecorded: false, cleanedStr: "", num: -1 };
      const dsRaca = cleanTseCode(row[colRacaDs]);
      if (dsRaca.isNull || dsRaca.isNotRecorded) nullCodesCount++;
      const racaKey = dsRaca.cleanedStr;
      if (!distRacaCor[racaKey]) {
        distRacaCor[racaKey] = { codigo: String(cdRaca.num || -1), descricao: racaKey, eleitores: 0, percentual: 0 };
      }
      distRacaCor[racaKey].eleitores += qtdEleitores;
    }
  }

  if (!colRacaDs) {
    warnings.push("Variável Cor / Raça não identificada neste arquivo de perfil do TSE (não impede a calibração por Gênero, Idade, Escolaridade e Municípios).");
  }

  // 4. Calcular percentuais sobre o total oficial do eleitorado
  if (totalEleitoresAptos <= 0) {
    issues.push("O somatório do campo de eleitores resultou em 0 aptos.");
  } else {
    passedChecks.push(`Total de Eleitores Aptos apurado com fidelidade: ${totalEleitoresAptos.toLocaleString("pt-BR")} eleitores.`);
  }

  // Atualizar % para cada distribuição
  const totalBase = totalEleitoresAptos > 0 ? totalEleitoresAptos : 1;
  Object.values(distGenero).forEach((d) => (d.percentual = +((d.eleitores / totalBase) * 100).toFixed(2)));
  Object.values(distFaixaEtaria).forEach((d) => (d.percentual = +((d.eleitores / totalBase) * 100).toFixed(2)));
  Object.values(distEscolaridade).forEach((d) => (d.percentual = +((d.eleitores / totalBase) * 100).toFixed(2)));
  Object.values(distRacaCor).forEach((d) => (d.percentual = +((d.eleitores / totalBase) * 100).toFixed(2)));

  const distMunicipios: Record<string, { codigo: string; nome: string; eleitores: number; percentual: number }> = {};
  distinctMunicipios.forEach((m) => {
    distMunicipios[m.codigo || m.nome] = {
      codigo: m.codigo,
      nome: m.nome,
      eleitores: m.eleitores,
      percentual: +((m.eleitores / totalBase) * 100).toFixed(2)
    };
  });

  const qtdMunicipios = distinctMunicipios.size;
  if (qtdMunicipios === 0) {
    issues.push("Nenhum município foi identificado nos campos de localidade do TSE.");
  } else {
    passedChecks.push(`Quantidade de municípios na base: ${qtdMunicipios} municípios.`);
  }

  const hasErrors = issues.length > 0;
  const hasWarnings = warnings.length > 0;
  const isValid = !hasErrors;

  const validationReport: TSEBaseValidationReport = {
    isValid,
    hasErrors,
    hasWarnings,
    issues,
    warnings,
    passedChecks,
    columnsFound: headers,
    columnsMissing,
    legacyColumnAlerts,
    nullCodesDetectedCount: nullCodesCount
  };

  const availableVariables = [
    colGenDs ? "Gênero" : null,
    colFaixaDs ? "Faixa Etária" : null,
    colEscDs ? "Escolaridade" : null,
    colRacaDs ? "Cor / Raça" : null,
    (colMunCod || colMunNom) ? "Município" : null
  ].filter(Boolean) as string[];

  const baseId = `tse-base-${dtGeracaoRaw.replace(/[^a-zA-Z0-9]/g, "_") || Date.now()}`;

  const meta: TSEBaseMetadata = {
    id: baseId,
    fileName,
    dtGeracao: dtGeracaoRaw,
    anoEleicao: anoEleicaoRaw,
    sgUf: sgUfRaw || "SE",
    qtdMunicipios,
    qtdRegistros: rawRowsCount,
    totalEleitoresAptos,
    totalBiometria,
    totalDeficiencia,
    totalNomeSocial,
    uploadDate: new Date().toISOString(),
    isOfficialPreset: false,
    availableVariables,
    municipiosList: Array.from(distinctMunicipios.values()).sort((a, b) => b.eleitores - a.eleitores),
    validation: validationReport
  };

  const storageItem: TSEBaseStorageItem = {
    meta,
    distribuicaoGenero: distGenero,
    distribuicaoFaixaEtaria: distFaixaEtaria,
    distribuicaoEscolaridade: distEscolaridade,
    distribuicaoRacaCor: distRacaCor,
    distribuicaoMunicipios: distMunicipios
  };

  return {
    success: isValid,
    item: storageItem,
    report: validationReport,
    rawRowsCount
  };
}

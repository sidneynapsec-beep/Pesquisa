/**
 * Tipos e Interfaces Oficiais para Perfil do Eleitorado TSE
 * Baseado estritamente no LEIAME Oficial do Tribunal Superior Eleitoral (TSE)
 */

import { DataProvenance } from "./provenance";

export interface TSEProfileRecord {
  DT_GERACAO: string;
  ANO_ELEICAO: string | number;
  SG_UF: string;
  CD_MUNICIPIO: string;
  NM_MUNICIPIO: string;
  CD_GENERO: string | number;
  DS_GENERO: string;
  CD_FAIXA_ETARIA: string | number;
  DS_FAIXA_ETARIA: string;
  CD_GRAU_ESCOLARIDADE: string | number;
  DS_GRAU_ESCOLARIDADE: string;
  CD_RACA_COR: string | number;
  DS_RACA_COR: string;
  QT_ELEITORES_PERFIL: number;
  QT_ELEITORES_BIOMETRIA?: number;
  QT_ELEITORES_DEFICIENCIA?: number;
  QT_ELEITORES_INC_NM_SOCIAL?: number;
  [key: string]: any;
}

export interface TSECategoryDistribution {
  variavel: "Gênero" | "Faixa Etária" | "Escolaridade" | "Cor / Raça" | "Município";
  codigo: string | number;
  categoria: string;
  eleitoradoTse: number;
  percentualTse: number;
  amostraPlanejada: number;
  entrevistadosAmostra: number;
  percentualAmostra: number;
  diferencaPct: number; // percentualAmostra - percentualTse
  pesoRaking: number; // percentualTse / percentualAmostra
  status: "EQUILIBRADO" | "SUBREPRESENTADO" | "SUPERREPRESENTADO";
}

export interface TSEBaseValidationReport {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  issues: string[];
  warnings: string[];
  passedChecks: string[];
  columnsFound: string[];
  columnsMissing: string[];
  legacyColumnAlerts: string[];
  nullCodesDetectedCount: number;
}

export interface TSEBaseMetadata {
  id: string;
  fileName: string;
  dtGeracao: string; // Data real no arquivo TSE (NUNCA data atual do sistema)
  anoEleicao: string;
  sgUf: string;
  qtdMunicipios: number;
  qtdRegistros: number; // Quantidade de linhas/estratos no arquivo
  totalEleitoresAptos: number; // SUM(QT_ELEITORES_PERFIL)
  totalBiometria: number; // SUM(QT_ELEITORES_BIOMETRIA)
  totalDeficiencia: number; // SUM(QT_ELEITORES_DEFICIENCIA)
  totalNomeSocial: number; // SUM(QT_ELEITORES_INC_NM_SOCIAL)
  uploadDate: string;
  isOfficialPreset?: boolean;
  availableVariables: string[];
  municipiosList: { codigo: string; nome: string; eleitores: number }[];
  validation: TSEBaseValidationReport;
  provenance?: DataProvenance;
}

export interface TSEBaseStorageItem {
  meta: TSEBaseMetadata;
  // Estratificação agregada por variável
  distribuicaoGenero: Record<string, { codigo: string; descricao: string; eleitores: number; percentual: number }>;
  distribuicaoFaixaEtaria: Record<string, { codigo: string; descricao: string; eleitores: number; percentual: number }>;
  distribuicaoEscolaridade: Record<string, { codigo: string; descricao: string; eleitores: number; percentual: number }>;
  distribuicaoRacaCor: Record<string, { codigo: string; descricao: string; eleitores: number; percentual: number }>;
  distribuicaoMunicipios: Record<string, { codigo: string; nome: string; eleitores: number; percentual: number }>;
  provenance?: DataProvenance;
}

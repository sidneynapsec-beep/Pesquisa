/**
 * Fonte Única da Verdade e Estrutura Canônica de Eleitorado e Metadados
 * SEIE - Sergipe 2026 • CTAS Consultoria e Pesquisa
 */

export type ElectorateReferenceType = "OFFICIAL" | "ESTIMATED" | "PROJECTION";

export interface ElectionReferenceData {
  id?: string;
  electorate: number;
  source: string;
  referenceDate: string;
  type: ElectorateReferenceType;
  sourceFile?: string;
  notes?: string;
  description?: string;
  isDefault?: boolean;
  provenance?: {
    datasetId?: string;
    organ: string;
    resolution?: string;
    conreResponsible?: string;
  };
}

/**
 * Registro Canônico Oficial do Eleitorado de Sergipe (Base TSE Oficial)
 */
export const TSE_SERGIPE_OFFICIAL_REFERENCE: ElectionReferenceData = {
  id: "tse-se-oficial-2024-2026",
  electorate: 1650412,
  source: "TSE - Perfil do Eleitorado / Dados Abertos Oficiais",
  referenceDate: "07/2024",
  type: "OFFICIAL",
  description: "Total de eleitores aptos registrados no Tribunal Superior Eleitoral para o Estado de Sergipe.",
  isDefault: true,
  provenance: {
    organ: "Tribunal Superior Eleitoral (TSE)",
    resolution: "Resolução TSE nº 23.600/2019 e atualizações",
    conreResponsible: "CONRE 10801"
  }
};

/**
 * Estimativa de Comparecimento e Votos Válidos Projetados para 2026
 */
export const SERGIPE_VALID_VOTES_PROJECTION: ElectionReferenceData = {
  id: "est-se-validos-2026",
  electorate: 1320000,
  source: "Estimativa de Votos Válidos (Desconto de ~20% Abstenção e ~5% Brancos/Nulos)",
  referenceDate: "10/2026",
  type: "ESTIMATED",
  description: "Massa de votos válidos estimada para cálculo de quociente eleitoral (QE) e quociente partidário (QP).",
  isDefault: false,
  provenance: {
    organ: "SEIE / Modelo Preditivo CTAS",
    conreResponsible: "CONRE 10801"
  }
};

/**
 * Projeção de Teto Populacional de Eleitores para Outubro de 2026
 */
export const SERGIPE_MAX_ELECTORATE_PROJECTION: ElectionReferenceData = {
  id: "proj-se-eleitorado-fechamento-2026",
  electorate: 1715000,
  source: "Projeção Estatística de Crescimento Demográfico Eleitoral",
  referenceDate: "10/2026",
  type: "PROJECTION",
  description: "Teto de eleitores projetado para o fechamento de cadastro das Eleições Gerais de 2026.",
  isDefault: false,
  provenance: {
    organ: "SEIE / Modelo Demográfico CTAS",
    conreResponsible: "CONRE 10801"
  }
};

export const ALL_ELECTION_REFERENCES: ElectionReferenceData[] = [
  TSE_SERGIPE_OFFICIAL_REFERENCE,
  SERGIPE_VALID_VOTES_PROJECTION,
  SERGIPE_MAX_ELECTORATE_PROJECTION
];

export function getActiveElectionReference(type: ElectorateReferenceType = "OFFICIAL"): ElectionReferenceData {
  const found = ALL_ELECTION_REFERENCES.find((r) => r.type === type);
  return found || TSE_SERGIPE_OFFICIAL_REFERENCE;
}

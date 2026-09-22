import { DataProvenance } from "./types/provenance";

export type { DataProvenance } from "./types/provenance";
export type UserRole = "Administrator" | "Viewer";

export interface CandidateResult {
  [candidateName: string]: number;
}

export interface RoleStatistics {
  totalSample: number;       // N Total de entrevistas no cargo
  validTotal: number;        // N Votos Válidos nominais
  invalidTotal: number;      // N Brancos / Nulos
  undecidedTotal: number;    // N Ns / Nr (Indecisos)
  validPercent: number;      // % Válidos sobre a Amostra
  invalidPercent: number;    // % Brancos/Nulos sobre a Amostra
  undecidedPercent: number;  // % Ns/Nr sobre a Amostra
}

export interface Poll {
  id: string;
  institute: string;
  registryNumber: string;
  conre: string;
  sampleSize: number;
  marginOfError: number;
  confidenceLevel: number;
  fieldworkStart: string;
  fieldworkEnd: string;
  medianDate: string;
  statistician: string;
  type: "Registrada" | "Tracking";
  origin?: "TSE" | "CAMPO" | "HISTORICO_2022" | "HISTORICO_2024" | string;
  year?: "2022" | "2024" | "2026" | string;
  description?: string;
  contractor?: string;
  persisted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  results: CandidateResult;
  roleResults?: { [role: string]: CandidateResult };
  roleValidResults?: { [role: string]: CandidateResult };
  roleRawCounts?: { [role: string]: { [candidateOrOption: string]: number } };
  roleStats?: { [role: string]: RoleStatistics };
  coletas?: any[];
  dados?: any[];
  rows?: any[];
  data?: any[];
  respostas?: any[];
  questionarios?: any[];
  rawRows?: any[];
  territorialBreakdown?: any;
  territorialRoleBreakdown?: any;
  fileName?: string;
  codigo?: string;
  id_pesquisa?: string;
  version?: number;
  parentId?: string;
  justificativa?: string;
  isOriginal?: boolean;
  provenance?: DataProvenance;
}

export interface MunicipioInfo {
  nome: string;
  territorio: string;
  poloRegional?: boolean;
}

export interface Territory {
  name: string;
  municipalities: string[];
  votersCount: number;
  profile: string;
  leadingCandidate: string;
  provenance?: DataProvenance;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export interface AccessRequest {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  organization?: string;
  status: "pending" | "approved" | "rejected";
  grantedRole?: UserRole;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

export type ActiveTab =
  | "visao-geral"
  | "candidatos"
  | "governador"
  | "senadores"
  | "deputados-estaduais"
  | "deputados-federais"
  | "diagnostico"
  | "relatorio-estrategico"
  | "gps-votos"
  | "simulador-guerra"
  | "tracking-tendencias"
  | "cards-executivos"
  | "calibracao-amostral"
  | "mapa-eleitoral"
  | "analise-territorial"
  | "radar"
  | "caminho-vitoria"
  | "projecao"
  | "narrativas"
  | "chat-ai"
  | "gestao-acessos"
  | "configuracoes";

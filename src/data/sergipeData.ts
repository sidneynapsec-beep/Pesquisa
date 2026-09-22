import { Territory } from "../types";
import {
  CANONICAL_SERGIPE_TERRITORIES,
  CANONICAL_MUNICIPIOS_POR_TERRITORIO,
  CANONICAL_REGIONAL_POLES,
  CANONICAL_MUNICIPALITIES_DATA,
  SergipeTerritorioCanonico
} from "./canonicalTerritories";

export interface MunicipioInfo {
  nome: string;
  territorio: string;
  poloRegional?: boolean;
}

export const SERGIPE_TERRITORIOS = CANONICAL_SERGIPE_TERRITORIES;
export type SergipeTerritorio = SergipeTerritorioCanonico;

export const SERGIPE_MUNICIPIOS_POR_TERRITORIO = CANONICAL_MUNICIPIOS_POR_TERRITORIO;
export const SERGIPE_POLOS_REGIONAIS = CANONICAL_REGIONAL_POLES;

export const SERGIPE_MUNICIPIOS_INFO: MunicipioInfo[] = CANONICAL_MUNICIPALITIES_DATA.map((m) => ({
  nome: m.name,
  territorio: m.territory,
  poloRegional: !!m.isRegionalPole
}));

export interface Municipality {
  name: string;
  territory: string;
  voters: number;
  pastWinner2022: string;
}

// Histórico oficial de 2022 para os 75 municípios
const PAST_WINNERS_2022: Record<string, string> = {
  "Aracaju": "Fábio Mitidieri",
  "Barra dos Coqueiros": "Rogério Carvalho",
  "Itaporanga d'Ajuda": "Fábio Mitidieri",
  "Laranjeiras": "Fábio Mitidieri",
  "Maruim": "Fábio Mitidieri",
  "Nossa Senhora do Socorro": "Rogério Carvalho",
  "Riachuelo": "Rogério Carvalho",
  "São Cristóvão": "Fábio Mitidieri",
  "Itabaiana": "Valmir de Francisquinho",
  "Campo do Brito": "Valmir de Francisquinho",
  "Carira": "Valmir de Francisquinho",
  "Frei Paulo": "Fábio Mitidieri",
  "Macambira": "Valmir de Francisquinho",
  "Moita Bonita": "Valmir de Francisquinho",
  "Pinhão": "Valmir de Francisquinho",
  "Ribeirópolis": "Valmir de Francisquinho",
  "São Domingos": "Valmir de Francisquinho",
  "Areia Branca": "Fábio Mitidieri",
  "Malhador": "Fábio Mitidieri",
  "Pedra Mole": "Fábio Mitidieri",
  "São Miguel do Aleixo": "Fábio Mitidieri",
  "Nossa Senhora Aparecida": "Fábio Mitidieri",
  "Lagarto": "Fábio Mitidieri",
  "Simão Dias": "Fábio Mitidieri",
  "Tobias Barreto": "Fábio Mitidieri",
  "Poço Verde": "Rogério Carvalho",
  "Riachão do Dantas": "Fábio Mitidieri",
  "Nossa Senhora da Glória": "Fábio Mitidieri",
  "Porto da Folha": "Rogério Carvalho",
  "Canindé de São Francisco": "Rogério Carvalho",
  "Poço Redondo": "Rogério Carvalho",
  "Monte Alegre de Sergipe": "Fábio Mitidieri",
  "Gararu": "Rogério Carvalho",
  "Nossa Senhora de Lourdes": "Fábio Mitidieri",
  "Estância": "Fábio Mitidieri",
  "Itabaianinha": "Fábio Mitidieri",
  "Umbaúba": "Fábio Mitidieri",
  "Cristinápolis": "Fábio Mitidieri",
  "Indiaroba": "Fábio Mitidieri",
  "Santa Luzia do Itanhy": "Rogério Carvalho",
  "Arauá": "Fábio Mitidieri",
  "Boquim": "Fábio Mitidieri",
  "Pedrinhas": "Fábio Mitidieri",
  "Tomar do Geru": "Fábio Mitidieri",
  "Salgado": "Fábio Mitidieri",
  "Propriá": "Rogério Carvalho",
  "Neópolis": "Fábio Mitidieri",
  "Pacatuba": "Rogério Carvalho",
  "Japoatã": "Rogério Carvalho",
  "Brejo Grande": "Rogério Carvalho",
  "Ilha das Flores": "Rogério Carvalho",
  "Santana do São Francisco": "Rogério Carvalho",
  "Amparo de São Francisco": "Fábio Mitidieri",
  "Canhoba": "Rogério Carvalho",
  "Cedro de São João": "Fábio Mitidieri",
  "Muribeca": "Rogério Carvalho",
  "São Francisco": "Fábio Mitidieri",
  "Telha": "Rogério Carvalho",
  "Malhada dos Bois": "Fábio Mitidieri",
  "Aquidabã": "Fábio Mitidieri",
  "Nossa Senhora das Dores": "Fábio Mitidieri",
  "Feira Nova": "Fábio Mitidieri",
  "Graccho Cardoso": "Rogério Carvalho",
  "Itabi": "Fábio Mitidieri",
  "Cumbe": "Fábio Mitidieri",
  "Capela": "Fábio Mitidieri",
  "Carmópolis": "Fábio Mitidieri",
  "Japaratuba": "Fábio Mitidieri",
  "Pirambu": "Rogério Carvalho",
  "Rosário do Catete": "Fábio Mitidieri",
  "General Maynard": "Fábio Mitidieri",
  "Santa Rosa de Lima": "Fábio Mitidieri",
  "Siriri": "Fábio Mitidieri",
  "Divina Pastora": "Fábio Mitidieri",
  "Santo Amaro das Brotas": "Fábio Mitidieri"
};

export const SERGIPE_MUNICIPALITIES: Municipality[] = CANONICAL_MUNICIPALITIES_DATA.map((m) => ({
  name: m.name,
  territory: m.territory,
  voters: m.officialElectorate2024 || 10000,
  pastWinner2022: PAST_WINNERS_2022[m.name] || "Fábio Mitidieri"
}));

export interface Candidate {
  name: string;
  party: string;
  spectrum: "Governista" | "Oposição de Esquerda" | "Oposição de Direita" | "Independente";
  bio: string;
  avatarColor: string;
  avatarText: string;
}

export { CANDIDATOS_OFICIAIS_2026, type OfficialCandidate2026 } from "./candidatosOficiais2026";

// Color palette for candidates inside charts and maps (Ultra-vibrant, high-contrast palette)
export const CANDIDATE_COLORS: { [name: string]: string } = {
  // Governador 2026
  "Fábio": "#1E40AF", // PSD Blue
  "Fábio Mitidieri": "#1E40AF",
  "Valmir De Francisquinho": "#059669", // PL / Opposition Emerald
  "Valmir de Francisquinho": "#059669",
  "Ricardo Marques": "#D97706", // Amber / Warm Orange
  "Dr. Helton": "#EA580C", // PSOL / REDE Orange
  "Emanuel Cacho": "#0284C7", // PSDB Sky Blue
  "Taty Cristina De Jesus": "#7C3AED", // DC Purple

  // Senador 2026
  "André Moura": "#4F46E5", // União Brasil Indigo
  "Coronel Rocha": "#15803D", // PL Green
  "Delegado Alessandro": "#0D9488", // MDB Teal
  "Alessandro Vieira": "#0D9488",
  "Delegado André David": "#047857", // Emerald Dark
  "Eduardo Amorim": "#0369A1", // Sky Dark
  "Edvaldo": "#E11D48", // PDT Rose
  "Iran Barbosa": "#C2410C", // PSOL Rust Orange
  "Paulinho Da União Tur": "#6D28D9", // Purple
  "Renatinha": "#DB2777", // Pink
  "Rodrigo Valadares": "#B45309", // Warm Gold
  "Rogerio Carvalho": "#DC2626", // PT Red
  "Rogério Carvalho": "#DC2626",

  // Deputados Federais Destacados
  "Yandra Moura": "#6366F1",
  "Anderson De Zé Das Canas": "#2563EB",
  "Pastor Heleno": "#7C3AED",
  "Fábio Reis": "#1D4ED8",
  "Delegada Katarina": "#3B82F6",
  "Gustinho Ribeiro": "#4338CA",
  "Icaro De Valmir": "#10B981",
  "Joao Daniel": "#EF4444",
  "Marcio Macedo": "#B91C1C",
  "Thiago De Joaldo": "#8B5CF6",
  "Breno Garibalde": "#F59E0B",
  "Elber Batalha": "#D97706",
  "Marcos Santana": "#FBBF24",
  "Capitão Samuel": "#3730A3",
  "Sheyla Galba": "#818CF8",
  "Neto Batalha": "#60A5FA",
  "Nitinho": "#93C5FD",

  // Deputados Estaduais Destacados
  "Luciano Bispo": "#1E3A8A",
  "Cristiano Cavalcante": "#4F46E5",
  "Pato Maravilha": "#6366F1",
  "Ibrain De Valmir": "#059669",
  "Georgeo Passos": "#6D28D9",
  "Maisa Mitidieri": "#2563EB",
  "Netinho Guimarães": "#312E81",
  "Adailton Martins": "#1D4ED8",
  "Garibalde": "#0F766E",
  "Jorginho Araujo": "#1E40AF",
  "Kaká Santos": "#4338CA",
  "Linda Brasil": "#EA580C",
  "Fábio Henrique": "#14B8A6",
  "Delegada Danielle": "#0D9488",
  "Paulo Jr": "#DC2626",
  "Marcelo Sobral": "#4F46E5",
  "Dra Lidiane Lucena": "#818CF8",
  "Chico Do Correio": "#B91C1C",
  "Camilo Daniel": "#EF4444",
  "Candisse Carvalho": "#F87171",
  "Padre Inaldo": "#991B1B",
  "Kitty Lima": "#F59E0B",
  "Marcos Oliveira": "#7C3AED",
  "Peter Costa": "#047857",

  // Invalid / Nulls / Undecided
  "Branco/Nulo": "#94A3B8", // Cool Slate Gray
  "Brancos/Nulos": "#94A3B8",
  "Ns/Nr": "#64748B", // Contrast Slate
  "Indecisos": "#64748B"
};

// Generates or retrieves a stable color for any official candidate
export function getOfficialCandidateColor(candidateName: string, partyNumber?: string): string {
  if (CANDIDATE_COLORS[candidateName]) {
    return CANDIDATE_COLORS[candidateName];
  }

  // Check matching by first words
  for (const [key, color] of Object.entries(CANDIDATE_COLORS)) {
    if (candidateName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(candidateName.toLowerCase())) {
      return color;
    }
  }

  // Fallback palette by party code or hash
  const partyPrefix = partyNumber ? partyNumber.slice(0, 2) : "99";
  const partyColorMap: { [party: string]: string } = {
    "55": "#1E40AF", // PSD
    "10": "#059669", // Republicans / Valmir
    "22": "#D97706", // PL
    "13": "#DC2626", // PT
    "44": "#4F46E5", // União
    "11": "#4338CA", // PP
    "15": "#0D9488", // MDB
    "12": "#E11D48", // PDT
    "40": "#F59E0B", // PSB
    "50": "#EA580C", // PSOL
    "45": "#0284C7", // PSDB
    "20": "#06B6D4", // PODE
    "70": "#D946EF", // AVANTE
    "30": "#F97316", // NOVO
    "27": "#7C3AED", // DC
    "43": "#16A34A", // PV
    "65": "#991B1B", // PCdoB
    "80": "#78350F"  // UP
  };

  if (partyColorMap[partyPrefix]) {
    return partyColorMap[partyPrefix];
  }

  // Stable deterministic color hash
  let hash = 0;
  for (let i = 0; i < candidateName.length; i++) {
    hash = candidateName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [210, 150, 25, 270, 340, 190, 40, 290, 170, 10];
  const hue = hues[Math.abs(hash) % hues.length];
  return `hsl(${hue}, 75%, 45%)`;
}

export const PRE_CANDIDATES: Candidate[] = [
  {
    name: "Fábio",
    party: "PSD",
    spectrum: "Governista",
    bio: "Governador de Sergipe e candidato à reeleição pelo PSD e coligação Sergipe Cresce Com Você.",
    avatarColor: "bg-blue-600",
    avatarText: "FM"
  },
  {
    name: "Valmir De Francisquinho",
    party: "PL",
    spectrum: "Oposição de Direita",
    bio: "Candidato a Governador pela coligação Muda Sergipe Com a Força do Povo.",
    avatarColor: "bg-emerald-600",
    avatarText: "VF"
  },
  {
    name: "Ricardo Marques",
    party: "PL",
    spectrum: "Oposição de Direita",
    bio: "Candidato a Governador pela coligação Fé e Coragem Pra Mudar.",
    avatarColor: "bg-amber-600",
    avatarText: "RM"
  },
  {
    name: "Emanuel Cacho",
    party: "PSDB",
    spectrum: "Independente",
    bio: "Candidato a Governador pela Federação PSDB Cidadania.",
    avatarColor: "bg-sky-600",
    avatarText: "EC"
  },
  {
    name: "Dr. Helton",
    party: "PSOL",
    spectrum: "Oposição de Esquerda",
    bio: "Candidato a Governador pela Federação PSOL REDE.",
    avatarColor: "bg-orange-600",
    avatarText: "DH"
  }
];

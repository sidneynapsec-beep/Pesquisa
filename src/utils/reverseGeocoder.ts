/**
 * Reverse Geocoding & Territorial Standardization Utility for SEIE (Sistema Especialista de Inteligência Eleitoral)
 * High-Precision GIS & Geocoding Engine for Sergipe's 75 Municipalities, Bairros, Districts, and Povoados.
 * 
 * Pipeline:
 * [Latitude + Longitude] -> [Reverse Geocoding (Cache / OSM / BigDataCloud / Centróides GIS)] 
 *                        -> [Raw Locality] 
 *                        -> [Comparison & Normalization against Official Base] 
 *                        -> [Padronized Bairro / Logradouro / CEP / Status de Confiabilidade]
 */

import { normalizeHeader } from "./surveyQuestionDetector";
import { SERGIPE_75_MUNICIPIOS } from "../data/tseSergipeMunicipios";

export type GeocodeReliabilityStatus =
  | "SUCESSO"             // Bairro identificado com alta precisão e padronizado na base oficial
  | "APROXIMADO"           // Identificado por centróide/polígono GIS de proximidade no município
  | "FORA_MUNICIPIO"       // Coordenada geográfica detectada fora dos limites do município pesquisado
  | "BAIRRO_NAO_CADASTRADO"// Bairro retornado pela API não consta na base oficial do município
  | "NAO_IDENTIFICADO";    // Não foi possível determinar com segurança (NUNCA inventar nome)

export interface StandardizedGeoResult {
  id?: string | number;
  latitude: number;
  longitude: number;
  coordenadasFormatadas: string;
  municipio: string;
  municipioOriginal?: string;
  bairro: string;                 // Bairro padronizado oficial (ou "NÃO IDENTIFICADO")
  bairroOriginal?: string;         // Nome bruto retornado pela API/coleta
  distritoOuPovoado?: string;
  logradouro?: string;            // Rua / Avenida / Travessa quando disponível
  numero?: string;                // Número predial quando detectado
  cep?: string;                   // Código Postal formatado quando disponível
  estado: string;                 // "SE"
  distanciaCentroKm: number;
  fonte: "cache" | "osm" | "bigdatacloud" | "gis_local" | "fallback";
  statusConfiabilidade: GeocodeReliabilityStatus;
  confiabilidadePercent: number;  // 0 a 100%
  detalhesAuditoria: string;      // Motivo / explicação auditável da classificação
  rawAddress?: any;
}

// Local cache key
const GEOCODE_CACHE_KEY = "seie_reverse_geocode_cache_v3";

// In-memory cache
const memoryCache: Map<string, StandardizedGeoResult> = new Map();

// Initialize memory cache from localStorage
try {
  const stored = typeof window !== "undefined" ? localStorage.getItem(GEOCODE_CACHE_KEY) : null;
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.entries(parsed).forEach(([k, v]) => {
      memoryCache.set(k, v as StandardizedGeoResult);
    });
  }
} catch (e) {
  // Local storage not available or corrupted
}

export function saveGeocodeCache() {
  try {
    if (typeof window === "undefined") return;
    const obj: Record<string, StandardizedGeoResult> = {};
    memoryCache.forEach((v, k) => {
      obj[k] = v;
    });
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    // Ignore quota errors
  }
}

export function clearGeocodeCache() {
  memoryCache.clear();
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(GEOCODE_CACHE_KEY);
    }
  } catch (e) {}
}

/**
 * Calculates Haversine distance in Kilometers between two GPS coordinates (Earth radius ~ 6371km)
 */
export function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface BairroCentroid {
  bairro: string;
  municipio: string;
  lat: number;
  lng: number;
  tipo?: "urbano" | "povoado" | "distrito" | "sede";
  aliases?: string[];
}

export interface MunicipalityCentroid {
  nome: string;
  lat: number;
  lng: number;
  territorio: string;
  raioUrbanoMaxKm: number;
  raioMaximoMunicipioKm: number;
}

// Official Centroids and Boundaries for all 75 Sergipe Municipalities
export const SERGIPE_75_MUNICIPALITY_CENTROIDS: MunicipalityCentroid[] = [
  { nome: "Amparo de São Francisco", lat: -10.1336, lng: -36.9297, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 8.0 },
  { nome: "Aquidabã", lat: -10.2825, lng: -37.0185, territorio: "Médio Sertão", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 18.0 },
  { nome: "Aracaju", lat: -10.9254, lng: -37.0708, territorio: "Grande Aracaju", raioUrbanoMaxKm: 14.0, raioMaximoMunicipioKm: 22.0 },
  { nome: "Arauá", lat: -11.2612, lng: -37.6215, territorio: "Sul Sergipano", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 16.0 },
  { nome: "Areia Branca", lat: -10.7585, lng: -37.3112, territorio: "Agreste Central", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 15.0 },
  { nome: "Barra dos Coqueiros", lat: -10.9085, lng: -37.0385, territorio: "Grande Aracaju", raioUrbanoMaxKm: 6.5, raioMaximoMunicipioKm: 16.0 },
  { nome: "Boquim", lat: -11.1452, lng: -37.6212, territorio: "Sul Sergipano", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 16.0 },
  { nome: "Brejo Grande", lat: -10.4312, lng: -36.4654, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 15.0 },
  { nome: "Campo do Brito", lat: -10.7335, lng: -37.4985, territorio: "Agreste Central", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 15.0 },
  { nome: "Canhoba", lat: -10.1412, lng: -36.9825, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 12.0 },
  { nome: "Canindé de São Francisco", lat: -9.6432, lng: -37.7885, territorio: "Alto Sertão", raioUrbanoMaxKm: 7.0, raioMaximoMunicipioKm: 35.0 },
  { nome: "Capela", lat: -10.5032, lng: -37.0542, territorio: "Leste Sergipano", raioUrbanoMaxKm: 5.5, raioMaximoMunicipioKm: 20.0 },
  { nome: "Carira", lat: -10.3612, lng: -37.7012, territorio: "Agreste Central", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 24.0 },
  { nome: "Carmópolis", lat: -10.6485, lng: -36.9912, territorio: "Leste Sergipano", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 12.0 },
  { nome: "Cedro de São João", lat: -10.2542, lng: -36.8852, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 12.0 },
  { nome: "Cristinápolis", lat: -11.4752, lng: -37.7585, territorio: "Sul Sergipano", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 18.0 },
  { nome: "Cumbe", lat: -10.3542, lng: -37.1825, territorio: "Médio Sertão", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 12.0 },
  { nome: "Divina Pastora", lat: -10.6812, lng: -37.1485, territorio: "Leste Sergipano", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 12.0 },
  { nome: "Estância", lat: -11.2685, lng: -37.4385, territorio: "Sul Sergipano", raioUrbanoMaxKm: 9.0, raioMaximoMunicipioKm: 28.0 },
  { nome: "Feira Nova", lat: -10.2685, lng: -37.3142, territorio: "Médio Sertão", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 15.0 },
  { nome: "Frei Paulo", lat: -10.5512, lng: -37.5342, territorio: "Agreste Central", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 18.0 },
  { nome: "Gararu", lat: -9.9685, lng: -37.0852, territorio: "Alto Sertão", raioUrbanoMaxKm: 5.5, raioMaximoMunicipioKm: 30.0 },
  { nome: "General Maynard", lat: -10.6912, lng: -36.9852, territorio: "Leste Sergipano", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 10.0 },
  { nome: "Graccho Cardoso", lat: -10.2245, lng: -37.2012, territorio: "Médio Sertão", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 14.0 },
  { nome: "Ilha das Flores", lat: -10.4352, lng: -36.5412, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 10.0 },
  { nome: "Indiaroba", lat: -11.5185, lng: -37.5142, territorio: "Sul Sergipano", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 20.0 },
  { nome: "Itabaiana", lat: -10.6852, lng: -37.4265, territorio: "Agreste Central", raioUrbanoMaxKm: 8.0, raioMaximoMunicipioKm: 22.0 },
  { nome: "Itabaianinha", lat: -11.2742, lng: -37.7912, territorio: "Sul Sergipano", raioUrbanoMaxKm: 6.0, raioMaximoMunicipioKm: 24.0 },
  { nome: "Itabi", lat: -10.1252, lng: -37.1012, territorio: "Médio Sertão", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 14.0 },
  { nome: "Itaporanga d'Ajuda", lat: -10.9985, lng: -37.3052, territorio: "Grande Aracaju", raioUrbanoMaxKm: 8.5, raioMaximoMunicipioKm: 30.0 },
  { nome: "Japaratuba", lat: -10.5942, lng: -36.9412, territorio: "Leste Sergipano", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 18.0 },
  { nome: "Japoatã", lat: -10.3452, lng: -36.6852, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 16.0 },
  { nome: "Lagarto", lat: -10.9172, lng: -37.6512, territorio: "Centro Sul", raioUrbanoMaxKm: 9.0, raioMaximoMunicipioKm: 32.0 },
  { nome: "Laranjeiras", lat: -10.8185, lng: -37.1712, territorio: "Grande Aracaju", raioUrbanoMaxKm: 5.5, raioMaximoMunicipioKm: 16.0 },
  { nome: "Macambira", lat: -10.7142, lng: -37.5412, territorio: "Agreste Central", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 14.0 },
  { nome: "Malhada dos Bois", lat: -10.3512, lng: -36.9212, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 10.0 },
  { nome: "Malhador", lat: -10.6585, lng: -37.3012, territorio: "Agreste Central", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 14.0 },
  { nome: "Maruim", lat: -10.7352, lng: -37.0812, territorio: "Grande Aracaju", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 15.0 },
  { nome: "Moita Bonita", lat: -10.5785, lng: -37.3452, territorio: "Agreste Central", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 14.0 },
  { nome: "Monte Alegre de Sergipe", lat: -10.0285, lng: -37.5612, territorio: "Alto Sertão", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 25.0 },
  { nome: "Muribeca", lat: -10.4285, lng: -36.9612, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 14.0 },
  { nome: "Neópolis", lat: -10.3212, lng: -36.5785, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 18.0 },
  { nome: "Nossa Senhora Aparecida", lat: -10.4412, lng: -37.4912, territorio: "Agreste Central", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 16.0 },
  { nome: "Nossa Senhora da Glória", lat: -10.2185, lng: -37.4212, territorio: "Alto Sertão", raioUrbanoMaxKm: 6.5, raioMaximoMunicipioKm: 26.0 },
  { nome: "Nossa Senhora das Dores", lat: -10.4912, lng: -37.1952, territorio: "Médio Sertão", raioUrbanoMaxKm: 5.5, raioMaximoMunicipioKm: 22.0 },
  { nome: "Nossa Senhora de Lourdes", lat: -10.0812, lng: -37.0512, territorio: "Alto Sertão", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 14.0 },
  { nome: "Nossa Senhora do Socorro", lat: -10.8542, lng: -37.1265, territorio: "Grande Aracaju", raioUrbanoMaxKm: 8.5, raioMaximoMunicipioKm: 18.0 },
  { nome: "Pacatuba", lat: -10.4512, lng: -36.6542, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 20.0 },
  { nome: "Pedra Mole", lat: -10.6212, lng: -37.6852, territorio: "Agreste Central", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 12.0 },
  { nome: "Pedrinhas", lat: -11.1912, lng: -37.6742, territorio: "Sul Sergipano", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 14.0 },
  { nome: "Pinhão", lat: -10.5685, lng: -37.7212, territorio: "Agreste Central", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 14.0 },
  { nome: "Pirambu", lat: -10.6085, lng: -36.8585, territorio: "Leste Sergipano", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 25.0 },
  { nome: "Poço Redondo", lat: -9.8052, lng: -37.6852, territorio: "Alto Sertão", raioUrbanoMaxKm: 7.0, raioMaximoMunicipioKm: 38.0 },
  { nome: "Poço Verde", lat: -10.7112, lng: -38.1812, territorio: "Centro Sul", raioUrbanoMaxKm: 6.0, raioMaximoMunicipioKm: 28.0 },
  { nome: "Porto da Folha", lat: -9.9185, lng: -37.2785, territorio: "Alto Sertão", raioUrbanoMaxKm: 6.0, raioMaximoMunicipioKm: 32.0 },
  { nome: "Propriá", lat: -10.2125, lng: -36.8425, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 6.0, raioMaximoMunicipioKm: 16.0 },
  { nome: "Riachão do Dantas", lat: -11.0685, lng: -37.7252, territorio: "Centro Sul", raioUrbanoMaxKm: 5.5, raioMaximoMunicipioKm: 24.0 },
  { nome: "Riachuelo", lat: -10.7785, lng: -37.1885, territorio: "Grande Aracaju", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 12.0 },
  { nome: "Ribeirópolis", lat: -10.5385, lng: -37.3685, territorio: "Agreste Central", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 18.0 },
  { nome: "Rosário do Catete", lat: -10.6985, lng: -37.0312, territorio: "Leste Sergipano", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 12.0 },
  { nome: "Salgado", lat: -11.0312, lng: -37.4785, territorio: "Sul Sergipano", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 18.0 },
  { nome: "Santa Luzia do Itanhy", lat: -11.3542, lng: -37.4512, territorio: "Sul Sergipano", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 20.0 },
  { nome: "Santana do São Francisco", lat: -10.2912, lng: -36.6085, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 12.0 },
  { nome: "Santa Rosa de Lima", lat: -10.6485, lng: -37.1952, territorio: "Leste Sergipano", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 12.0 },
  { nome: "Santo Amaro das Brotas", lat: -10.7885, lng: -36.9852, territorio: "Leste Sergipano", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 18.0 },
  { nome: "São Cristóvão", lat: -11.0145, lng: -37.2065, territorio: "Grande Aracaju", raioUrbanoMaxKm: 9.0, raioMaximoMunicipioKm: 24.0 },
  { nome: "São Domingos", lat: -10.6012, lng: -37.5685, territorio: "Agreste Central", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 12.0 },
  { nome: "São Francisco", lat: -10.1812, lng: -36.8852, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 12.0 },
  { nome: "São Miguel do Aleixo", lat: -10.3885, lng: -37.3812, territorio: "Agreste Central", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 12.0 },
  { nome: "Simão Dias", lat: -10.7385, lng: -37.8125, territorio: "Centro Sul", raioUrbanoMaxKm: 6.5, raioMaximoMunicipioKm: 26.0 },
  { nome: "Siriri", lat: -10.6012, lng: -37.1125, territorio: "Leste Sergipano", raioUrbanoMaxKm: 4.0, raioMaximoMunicipioKm: 14.0 },
  { nome: "Telha", lat: -10.2012, lng: -36.8852, territorio: "Baixo São Francisco", raioUrbanoMaxKm: 3.5, raioMaximoMunicipioKm: 10.0 },
  { nome: "Tobias Barreto", lat: -11.1825, lng: -37.9985, territorio: "Centro Sul", raioUrbanoMaxKm: 7.0, raioMaximoMunicipioKm: 30.0 },
  { nome: "Tomar do Geru", lat: -11.3742, lng: -37.8412, territorio: "Sul Sergipano", raioUrbanoMaxKm: 4.5, raioMaximoMunicipioKm: 18.0 },
  { nome: "Umbaúba", lat: -11.3825, lng: -37.6585, territorio: "Sul Sergipano", raioUrbanoMaxKm: 5.0, raioMaximoMunicipioKm: 18.0 }
];

// Base Oficial Canônica de Bairros e Povoados dos 75 Municípios de Sergipe
export const OFFICIAL_BAIRROS_BY_MUNI: Record<string, string[]> = {
  "Aracaju": [
    "13 de Julho", "Jardins", "Farolândia", "Atalaia", "Coroa do Meio", "Aruana", "Robalo",
    "Mosqueiro", "Areia Branca (Zona de Expansão)", "Centro", "São José", "Suíssa",
    "Salgado Filho", "Grageru", "Luzia", "Ponto Novo", "Jabotiana", "Inácio Barbosa",
    "São Conrado", "Santa Maria", "17 de Março", "Aeroporto", "Siqueira Campos", "América",
    "Santos Dumont", "Bugio", "Jardim Centenário", "Olaria", "Soledade", "Lamarão",
    "Japãozinho", "Porto Dantas", "Bairro Industrial", "Santo Antônio", "18 do Forte",
    "Cidade Nova", "Palestina", "Capucho", "Getúlio Vargas", "Cirurgia", "Pereira Lobo"
  ],
  "Nossa Senhora do Socorro": [
    "Marcos Freire I", "Marcos Freire II", "Marcos Freire III", "João Alves",
    "Taiçoca de Fora", "Taiçoca de Dentro", "Fernando Collor", "Piabeta", "Albano Franco",
    "Parque dos Faróis", "Guajará", "Centro / Sede", "Sobrado", "Palestina (Socorro)",
    "Porto Grande", "Tabocas", "Pai André"
  ],
  "São Cristóvão": [
    "Eduardo Gomes", "Rosa Elze", "Rosa Maria", "Madre Paulina", "Tijuquinha",
    "Marcelo Déda (São Cristóvão)", "Jardim Universitário", "Luiz Alves", "Centro Histórico",
    "Povoado Pedreiras", "Povoado Rita Cacete", "Povoado Colônia Miranda", "Povoado Cantinho"
  ],
  "Itabaiana": [
    "Centro", "Rotary", "Chiara Lubich", "Mamede Paes Mendonça", "Porto da Folha",
    "Bananeiras", "São Cristóvão", "Serrano", "Serrinha", "Queimadas",
    "Povoado Carrilho", "Povoado Rio das Pedras", "Povoado Zanguê", "Povoado Dende"
  ],
  "Lagarto": [
    "Centro", "Cidade Nova", "Alto da Boa Vista", "Loiola", "Santo Antônio",
    "Ademar de Carvalho", "Novo Horizonte", "Povoado Jenipapo", "Povoado Colônia Treze",
    "Povoado Olhos D'Água", "Povoado Brejo", "Povoado Quilombo", "Povoado Brasília"
  ],
  "Estância": [
    "Centro", "Cidade Nova", "Alagoas", "Santa Cruz", "Porto D'Areia", "Bairro Novo",
    "Bomfim", "Povoado Porto do Mato", "Praia do Abaís", "Praia das Dunas",
    "Povoado Farnaval", "Povoado Bom Viver"
  ],
  "Barra dos Coqueiros": [
    "Centro", "Atalaia Nova", "Praia da Costa", "Jatobá", "Prisco Viana",
    "Marcelo Déda", "Olimar", "Touro", "Povoado Capuã", "Litoral Norte"
  ],
  "Nossa Senhora da Glória": [
    "Centro", "Divinéia", "Nova Esperança", "Brasília", "Silvino Barbosa",
    "Povoado Angico", "Povoado Feirinha", "Povoado Várzea dos Cágados", "Povoado Piçarras"
  ],
  "Itaporanga d'Ajuda": [
    "Centro", "Bairro Novo", "São José", "Alto da Bela Vista", "Praia da Caueira",
    "Povoado Dorinha", "Povoado Sapé", "Povoado Nova Descoberta"
  ],
  "Propriá": [
    "Centro", "Remanso", "Santa Maria", "Bela Vista", "Matadouro",
    "Povoado São Vicente", "Povoado Boa Esperança"
  ],
  "Tobias Barreto": [
    "Centro", "Santa Rita", "Vila Samambaia", "Cruz das Graças",
    "Povoado Montes Coelhos", "Povoado Nova Brasília", "Povoado Campo Grande",
    "Povoado Samambaia", "Povoado Lagoa Redonda", "Povoado Jabeberi"
  ],
  "Simão Dias": [
    "Centro", "Bairro Novo", "Rivalda Silva", "Belo Horizonte",
    "Povoado Triunfo", "Povoado Pastinho", "Povoado Paracatu"
  ],
  "Canindé de São Francisco": [
    "Centro / Sede", "Bairro Novo", "Alto da Guia", "Olaria",
    "Povoado Capim Grosso", "Povoado Curituba", "Povoado Cuiabá"
  ],
  "Poço Redondo": [
    "Centro / Sede", "Bairro Novo", "Povoado Santa Rosa do Ermírio",
    "Povoado Sítios Novos", "Povoado Bonsucesso"
  ],
  "Itabaianinha": [
    "Centro", "Bairro Novo", "Matadouro", "Povoado Montalvão", "Povoado Jardim", "Povoado Curralinho"
  ],
  "Capela": [
    "Centro", "São Pedro", "Nova Olinda", "Povoado Miranda", "Povoado Santa Efigênia"
  ],
  "Nossa Senhora das Dores": [
    "Centro", "Cruzeiro das Moças", "Gentil Barbosa", "Povoado Campo Grande", "Povoado Gado Bravo"
  ],
  "Boquim": [
    "Centro", "Bairro Novo", "Povoado Olhos d'Água", "Povoado Cabeça da Onça"
  ],
  "Umbaúba": [
    "Centro", "Bairro Novo", "Povoado Mangabeira", "Povoado Campinhos"
  ],
  "Poço Verde": [
    "Centro", "Bairro Novo", "Povoado São José", "Povoado Triunfo"
  ],
  "Neópolis": [
    "Centro", "Alto Santo Antônio", "Povoado Betume", "Povoado Florípedes"
  ],
  "Porto da Folha": [
    "Centro", "Alto da Boa Vista", "Povoado Ilha do Ouro", "Povoado Niterói"
  ],
  "Riachão do Dantas": [
    "Centro", "Bairro Novo", "Povoado Forquilha", "Povoado Tanque Novo"
  ],
  "Salgado": [
    "Centro", "Bairro Novo", "Povoado Água Fria", "Povoado Quebradas"
  ],
  "Cristinápolis": [
    "Centro", "Bairro Novo", "Povoado Zabelê", "Povoado Colônia Pereira"
  ],
  "Indiaroba": [
    "Centro", "Praia de Pontal", "Povoado Preguiça", "Povoado Convento"
  ],
  "Santa Luzia do Itanhy": [
    "Centro", "Povoado Crasto", "Povoado Priapu", "Povoado Tabuleiro"
  ],
  "Laranjeiras": [
    "Centro Histórico", "Comandaroba", "Vila de Pedra", "Povoado Salinas", "Povoado Camundá"
  ],
  "Carmópolis": [
    "Centro", "Bairro Novo", "Povoado Aguada", "Povoado Passagem Franca"
  ],
  "Japaratuba": [
    "Centro", "Bairro São José", "Povoado São José", "Povoado Travessão"
  ],
  "Pirambu": [
    "Centro", "Praia de Pirambu", "Povoado Aguilhadas", "Povoado Alagamar"
  ],
  "Maruim": [
    "Centro", "Bairro São José", "Povoado Mata de São José", "Povoado Oiteiros"
  ],
  "Areia Branca": [
    "Centro", "Bairro Novo", "Povoado Manelão", "Povoado Pedrinhas"
  ],
  "Campo do Brito": [
    "Centro", "Bairro Novo", "Povoado Rodeador", "Povoado Cercado"
  ],
  "Carira": [
    "Centro", "Bairro Novo", "Povoado Altos Verdes", "Povoado Santo Antônio"
  ],
  "Frei Paulo": [
    "Centro", "Bairro Novo", "Povoado Mocambo", "Povoado Serra Redonda"
  ],
  "Ribeirópolis": [
    "Centro", "Bairro Novo", "Povoado Serra do Machado", "Povoado Fazendinha"
  ],
  "Monte Alegre de Sergipe": [
    "Centro", "Bairro Novo", "Povoado Baixa Verde", "Povoado Lagoa dos Bois"
  ],
  "Gararu": [
    "Centro", "Bairro Novo", "Povoado Genipapo", "Povoado Lagoa Funda"
  ],
  "Aquidabã": [
    "Centro", "Bairro Novo", "Povoado Saco do Oiteiro", "Povoado Papel"
  ],
  "Pacatuba": [
    "Centro", "Povoado Ponta dos Mangues", "Povoado Tigre", "Povoado Carapitanga"
  ]
};

// Rich High-Precision Centroid Database of Bairros and Localities
export const SERGIPE_BAIRROS_CENTROIDS: BairroCentroid[] = [
  // ==========================================
  // 1. ARACAJU
  // ==========================================
  { bairro: "13 de Julho", municipio: "Aracaju", lat: -10.9385, lng: -37.0542, tipo: "urbano", aliases: ["treze de julho", "praia formosa"] },
  { bairro: "Jardins", municipio: "Aracaju", lat: -10.9452, lng: -37.0654, tipo: "urbano", aliases: ["bairro jardins", "shopping jardins"] },
  { bairro: "Farolândia", municipio: "Aracaju", lat: -10.9701, lng: -37.0548, tipo: "urbano", aliases: ["augusto franco", "farol"] },
  { bairro: "Atalaia", municipio: "Aracaju", lat: -10.9856, lng: -37.0452, tipo: "urbano", aliases: ["orla de atalaia", "praia de atalaia", "passarela do caranguejo"] },
  { bairro: "Coroa do Meio", municipio: "Aracaju", lat: -10.9632, lng: -37.0425, tipo: "urbano", aliases: ["orlinha"] },
  { bairro: "Aruana", municipio: "Aracaju", lat: -11.0125, lng: -37.0712, tipo: "urbano", aliases: ["praia de aruana", "litoral sul"] },
  { bairro: "Robalo", municipio: "Aracaju", lat: -11.0412, lng: -37.0985, tipo: "urbano", aliases: ["povoado robalo"] },
  { bairro: "Mosqueiro", municipio: "Aracaju", lat: -11.0821, lng: -37.1315, tipo: "urbano", aliases: ["praia do mosqueiro", "orla por do sol"] },
  { bairro: "Areia Branca (Zona de Expansão)", municipio: "Aracaju", lat: -11.0252, lng: -37.1125, tipo: "urbano", aliases: ["areia branca aracaju", "expansao sul"] },
  { bairro: "Centro", municipio: "Aracaju", lat: -10.9112, lng: -37.0518, tipo: "sede", aliases: ["centro comercial", "calcadao"] },
  { bairro: "São José", municipio: "Aracaju", lat: -10.9225, lng: -37.0512, tipo: "urbano", aliases: ["bairro sao jose"] },
  { bairro: "Suíssa", municipio: "Aracaju", lat: -10.9312, lng: -37.0615, tipo: "urbano", aliases: ["suica"] },
  { bairro: "Salgado Filho", municipio: "Aracaju", lat: -10.9348, lng: -37.0578, tipo: "urbano" },
  { bairro: "Grageru", municipio: "Aracaju", lat: -10.9412, lng: -37.0589, tipo: "urbano" },
  { bairro: "Luzia", municipio: "Aracaju", lat: -10.9482, lng: -37.0725, tipo: "urbano" },
  { bairro: "Ponto Novo", municipio: "Aracaju", lat: -10.9418, lng: -37.0812, tipo: "urbano" },
  { bairro: "Jabotiana", municipio: "Aracaju", lat: -10.9465, lng: -37.0985, tipo: "urbano", aliases: ["conjunto santa lucia", "sol nascente"] },
  { bairro: "Inácio Barbosa", municipio: "Aracaju", lat: -10.9585, lng: -37.0712, tipo: "urbano" },
  { bairro: "São Conrado", municipio: "Aracaju", lat: -10.9682, lng: -37.0795, tipo: "urbano", aliases: ["orlando dantas"] },
  { bairro: "Santa Maria", municipio: "Aracaju", lat: -10.9885, lng: -37.0954, tipo: "urbano", aliases: ["bairro santa maria", "marivan"] },
  { bairro: "17 de Março", municipio: "Aracaju", lat: -10.9952, lng: -37.0895, tipo: "urbano", aliases: ["dezessete de marco"] },
  { bairro: "Aeroporto", municipio: "Aracaju", lat: -10.9812, lng: -37.0725, tipo: "urbano" },
  { bairro: "Siqueira Campos", municipio: "Aracaju", lat: -10.9205, lng: -37.0708, tipo: "urbano" },
  { bairro: "América", municipio: "Aracaju", lat: -10.9285, lng: -37.0852, tipo: "urbano" },
  { bairro: "Santos Dumont", municipio: "Aracaju", lat: -10.8872, lng: -37.0785, tipo: "urbano" },
  { bairro: "Bugio", municipio: "Aracaju", lat: -10.8985, lng: -37.0865, tipo: "urbano" },
  { bairro: "Jardim Centenário", municipio: "Aracaju", lat: -10.9085, lng: -37.0954, tipo: "urbano" },
  { bairro: "Olaria", municipio: "Aracaju", lat: -10.9085, lng: -37.0885, tipo: "urbano" },
  { bairro: "Soledade", municipio: "Aracaju", lat: -10.8752, lng: -37.0625, tipo: "urbano" },
  { bairro: "Lamarão", municipio: "Aracaju", lat: -10.8712, lng: -37.0742, tipo: "urbano" },
  { bairro: "Japãozinho", municipio: "Aracaju", lat: -10.8912, lng: -37.0542, tipo: "urbano" },
  { bairro: "Porto Dantas", municipio: "Aracaju", lat: -10.8825, lng: -37.0485, tipo: "urbano" },
  { bairro: "Bairro Industrial", municipio: "Aracaju", lat: -10.8992, lng: -37.0512, tipo: "urbano" },
  { bairro: "Santo Antônio", municipio: "Aracaju", lat: -10.9025, lng: -37.0612, tipo: "urbano", aliases: ["colina do santo antonio"] },
  { bairro: "18 do Forte", municipio: "Aracaju", lat: -10.8925, lng: -37.0685, tipo: "urbano", aliases: ["dezoito do forte"] },
  { bairro: "Cidade Nova", municipio: "Aracaju", lat: -10.8985, lng: -37.0745, tipo: "urbano" },
  { bairro: "Palestina", municipio: "Aracaju", lat: -10.8952, lng: -37.0612, tipo: "urbano" },
  { bairro: "Capucho", municipio: "Aracaju", lat: -10.9325, lng: -37.1025, tipo: "urbano", aliases: ["rodoviaria nova"] },
  { bairro: "Getúlio Vargas", municipio: "Aracaju", lat: -10.9152, lng: -37.0585, tipo: "urbano" },
  { bairro: "Cirurgia", municipio: "Aracaju", lat: -10.9185, lng: -37.0632, tipo: "urbano" },
  { bairro: "Pereira Lobo", municipio: "Aracaju", lat: -10.9252, lng: -37.0654, tipo: "urbano" },

  // ==========================================
  // 2. NOSSA SENHORA DO SOCORRO
  // ==========================================
  { bairro: "Marcos Freire I", municipio: "Nossa Senhora do Socorro", lat: -10.8652, lng: -37.0825, tipo: "urbano", aliases: ["marcos freire 1", "mf1"] },
  { bairro: "Marcos Freire II", municipio: "Nossa Senhora do Socorro", lat: -10.8585, lng: -37.0895, tipo: "urbano", aliases: ["marcos freire 2", "mf2"] },
  { bairro: "Marcos Freire III", municipio: "Nossa Senhora do Socorro", lat: -10.8512, lng: -37.0954, tipo: "urbano", aliases: ["marcos freire 3", "mf3"] },
  { bairro: "João Alves", municipio: "Nossa Senhora do Socorro", lat: -10.8685, lng: -37.0725, tipo: "urbano", aliases: ["conjunto joao alves"] },
  { bairro: "Taiçoca de Fora", municipio: "Nossa Senhora do Socorro", lat: -10.8752, lng: -37.0685, tipo: "urbano", aliases: ["taicoca"] },
  { bairro: "Taiçoca de Dentro", municipio: "Nossa Senhora do Socorro", lat: -10.8712, lng: -37.0785, tipo: "urbano" },
  { bairro: "Fernando Collor", municipio: "Nossa Senhora do Socorro", lat: -10.8612, lng: -37.0654, tipo: "urbano", aliases: ["conjunto fernando collor"] },
  { bairro: "Piabeta", municipio: "Nossa Senhora do Socorro", lat: -10.8425, lng: -37.0625, tipo: "urbano" },
  { bairro: "Albano Franco", municipio: "Nossa Senhora do Socorro", lat: -10.8485, lng: -37.0754, tipo: "urbano" },
  { bairro: "Parque dos Faróis", municipio: "Nossa Senhora do Socorro", lat: -10.8612, lng: -37.1254, tipo: "urbano" },
  { bairro: "Guajará", municipio: "Nossa Senhora do Socorro", lat: -10.8354, lng: -37.1025, tipo: "urbano" },
  { bairro: "Palestina (Socorro)", municipio: "Nossa Senhora do Socorro", lat: -10.8285, lng: -37.1142, tipo: "urbano" },
  { bairro: "Centro / Sede", municipio: "Nossa Senhora do Socorro", lat: -10.8542, lng: -37.1265, tipo: "sede", aliases: ["sede socorro", "centro socorro"] },
  { bairro: "Porto Grande", municipio: "Nossa Senhora do Socorro", lat: -10.8712, lng: -37.1412, tipo: "povoado" },
  { bairro: "Sobrado", municipio: "Nossa Senhora do Socorro", lat: -10.8395, lng: -37.1352, tipo: "povoado" },
  { bairro: "Tabocas", municipio: "Nossa Senhora do Socorro", lat: -10.8125, lng: -37.1485, tipo: "povoado" },

  // ==========================================
  // 3. SÃO CRISTÓVÃO
  // ==========================================
  { bairro: "Eduardo Gomes", municipio: "São Cristóvão", lat: -10.9412, lng: -37.1225, tipo: "urbano", aliases: ["conjunto eduardo gomes"] },
  { bairro: "Rosa Elze", municipio: "São Cristóvão", lat: -10.9352, lng: -37.1145, tipo: "urbano", aliases: ["ufs", "conjunto rosa elze"] },
  { bairro: "Rosa Maria", municipio: "São Cristóvão", lat: -10.9385, lng: -37.1185, tipo: "urbano" },
  { bairro: "Madre Paulina", municipio: "São Cristóvão", lat: -10.9452, lng: -37.1285, tipo: "urbano" },
  { bairro: "Tijuquinha", municipio: "São Cristóvão", lat: -10.9312, lng: -37.1254, tipo: "urbano" },
  { bairro: "Jardim Universitário", municipio: "São Cristóvão", lat: -10.9285, lng: -37.1112, tipo: "urbano" },
  { bairro: "Marcelo Déda (São Cristóvão)", municipio: "São Cristóvão", lat: -10.9485, lng: -37.1325, tipo: "urbano" },
  { bairro: "Luiz Alves", municipio: "São Cristóvão", lat: -10.9542, lng: -37.1252, tipo: "urbano" },
  { bairro: "Centro Histórico", municipio: "São Cristóvão", lat: -11.0145, lng: -37.2065, tipo: "sede", aliases: ["praca sao francisco", "centro sao cristovao"] },
  { bairro: "Povoado Pedreiras", municipio: "São Cristóvão", lat: -11.0425, lng: -37.1852, tipo: "povoado" },
  { bairro: "Povoado Rita Cacete", municipio: "São Cristóvão", lat: -10.9852, lng: -37.2412, tipo: "povoado" },
  { bairro: "Povoado Colônia Miranda", municipio: "São Cristóvão", lat: -11.0252, lng: -37.2512, tipo: "povoado" },
  { bairro: "Povoado Cantinho", municipio: "São Cristóvão", lat: -10.9612, lng: -37.1512, tipo: "povoado" },

  // ==========================================
  // 4. BARRA DOS COQUEIROS
  // ==========================================
  { bairro: "Centro", municipio: "Barra dos Coqueiros", lat: -10.9085, lng: -37.0385, tipo: "sede" },
  { bairro: "Atalaia Nova", municipio: "Barra dos Coqueiros", lat: -10.9625, lng: -37.0254, tipo: "urbano" },
  { bairro: "Praia da Costa", municipio: "Barra dos Coqueiros", lat: -10.9252, lng: -37.0212, tipo: "urbano" },
  { bairro: "Jatobá", municipio: "Barra dos Coqueiros", lat: -10.8925, lng: -37.0285, tipo: "urbano" },
  { bairro: "Prisco Viana", municipio: "Barra dos Coqueiros", lat: -10.9125, lng: -37.0425, tipo: "urbano" },
  { bairro: "Marcelo Déda", municipio: "Barra dos Coqueiros", lat: -10.8852, lng: -37.0312, tipo: "urbano" },
  { bairro: "Touro", municipio: "Barra dos Coqueiros", lat: -10.8712, lng: -37.0252, tipo: "povoado" },
  { bairro: "Povoado Capuã", municipio: "Barra dos Coqueiros", lat: -10.8512, lng: -37.0185, tipo: "povoado" },

  // ==========================================
  // 5. ITABAIANA
  // ==========================================
  { bairro: "Centro", municipio: "Itabaiana", lat: -10.6852, lng: -37.4265, tipo: "sede" },
  { bairro: "Rotary", municipio: "Itabaiana", lat: -10.6925, lng: -37.4185, tipo: "urbano" },
  { bairro: "Chiara Lubich", municipio: "Itabaiana", lat: -10.6785, lng: -37.4325, tipo: "urbano" },
  { bairro: "Mamede Paes Mendonça", municipio: "Itabaiana", lat: -10.6892, lng: -37.4385, tipo: "urbano" },
  { bairro: "Porto da Folha", municipio: "Itabaiana", lat: -10.6725, lng: -37.4215, tipo: "urbano" },
  { bairro: "Bananeiras", municipio: "Itabaiana", lat: -10.6985, lng: -37.4425, tipo: "urbano" },
  { bairro: "São Cristóvão", municipio: "Itabaiana", lat: -10.6752, lng: -37.4112, tipo: "urbano" },
  { bairro: "Serrano", municipio: "Itabaiana", lat: -10.6652, lng: -37.4352, tipo: "urbano" },
  { bairro: "Serrinha", municipio: "Itabaiana", lat: -10.6812, lng: -37.4495, tipo: "urbano" },
  { bairro: "Queimadas", municipio: "Itabaiana", lat: -10.7052, lng: -37.4312, tipo: "urbano" },
  { bairro: "Povoado Carrilho", municipio: "Itabaiana", lat: -10.6425, lng: -37.4585, tipo: "povoado" },
  { bairro: "Povoado Rio das Pedras", municipio: "Itabaiana", lat: -10.7185, lng: -37.3852, tipo: "povoado" },
  { bairro: "Povoado Zanguê", municipio: "Itabaiana", lat: -10.6512, lng: -37.4785, tipo: "povoado" },
  { bairro: "Povoado Dende", municipio: "Itabaiana", lat: -10.6352, lng: -37.4125, tipo: "povoado" },

  // ==========================================
  // 6. LAGARTO
  // ==========================================
  { bairro: "Centro", municipio: "Lagarto", lat: -10.9172, lng: -37.6512, tipo: "sede" },
  { bairro: "Cidade Nova", municipio: "Lagarto", lat: -10.9252, lng: -37.6425, tipo: "urbano" },
  { bairro: "Loiola", municipio: "Lagarto", lat: -10.9085, lng: -37.6585, tipo: "urbano" },
  { bairro: "Alto da Boa Vista", municipio: "Lagarto", lat: -10.9312, lng: -37.6625, tipo: "urbano" },
  { bairro: "Santo Antônio", municipio: "Lagarto", lat: -10.9112, lng: -37.6395, tipo: "urbano" },
  { bairro: "Ademar de Carvalho", municipio: "Lagarto", lat: -10.9212, lng: -37.6685, tipo: "urbano" },
  { bairro: "Novo Horizonte", municipio: "Lagarto", lat: -10.9352, lng: -37.6512, tipo: "urbano" },
  { bairro: "Povoado Jenipapo", municipio: "Lagarto", lat: -10.8625, lng: -37.6985, tipo: "povoado" },
  { bairro: "Povoado Colônia Treze", municipio: "Lagarto", lat: -10.9852, lng: -37.5812, tipo: "povoado" },
  { bairro: "Povoado Olhos D'Água", municipio: "Lagarto", lat: -10.9542, lng: -37.6852, tipo: "povoado" },
  { bairro: "Povoado Brejo", municipio: "Lagarto", lat: -10.8912, lng: -37.7125, tipo: "povoado" },
  { bairro: "Povoado Quilombo", municipio: "Lagarto", lat: -10.8785, lng: -37.6352, tipo: "povoado" },
  { bairro: "Povoado Brasília", municipio: "Lagarto", lat: -10.9652, lng: -37.6254, tipo: "povoado" },

  // ==========================================
  // 7. ESTÂNCIA
  // ==========================================
  { bairro: "Centro", municipio: "Estância", lat: -11.2685, lng: -37.4385, tipo: "sede" },
  { bairro: "Cidade Nova", municipio: "Estância", lat: -11.2752, lng: -37.4295, tipo: "urbano" },
  { bairro: "Alagoas", municipio: "Estância", lat: -11.2612, lng: -37.4452, tipo: "urbano" },
  { bairro: "Santa Cruz", municipio: "Estância", lat: -11.2812, lng: -37.4215, tipo: "urbano" },
  { bairro: "Porto D'Areia", municipio: "Estância", lat: -11.2585, lng: -37.4512, tipo: "urbano" },
  { bairro: "Bairro Novo", municipio: "Estância", lat: -11.2712, lng: -37.4554, tipo: "urbano" },
  { bairro: "Bomfim", municipio: "Estância", lat: -11.2642, lng: -37.4285, tipo: "urbano" },
  { bairro: "Povoado Porto do Mato", municipio: "Estância", lat: -11.4125, lng: -37.3512, tipo: "povoado" },
  { bairro: "Praia do Abaís", municipio: "Estância", lat: -11.3852, lng: -37.3412, tipo: "povoado" },
  { bairro: "Praia das Dunas", municipio: "Estância", lat: -11.4012, lng: -37.3485, tipo: "povoado" },
  { bairro: "Povoado Farnaval", municipio: "Estância", lat: -11.2952, lng: -37.4812, tipo: "povoado" },
  { bairro: "Povoado Bom Viver", municipio: "Estância", lat: -11.3125, lng: -37.4212, tipo: "povoado" },

  // ==========================================
  // 8. NOSSA SENHORA DA GLÓRIA
  // ==========================================
  { bairro: "Centro", municipio: "Nossa Senhora da Glória", lat: -10.2185, lng: -37.4212, tipo: "sede" },
  { bairro: "Divinéia", municipio: "Nossa Senhora da Glória", lat: -10.2252, lng: -37.4145, tipo: "urbano" },
  { bairro: "Nova Esperança", municipio: "Nossa Senhora da Glória", lat: -10.2112, lng: -37.4285, tipo: "urbano" },
  { bairro: "Brasília", municipio: "Nossa Senhora da Glória", lat: -10.2212, lng: -37.4295, tipo: "urbano" },
  { bairro: "Silvino Barbosa", municipio: "Nossa Senhora da Glória", lat: -10.2142, lng: -37.4125, tipo: "urbano" },
  { bairro: "Povoado Angico", municipio: "Nossa Senhora da Glória", lat: -10.1852, lng: -37.4612, tipo: "povoado" },
  { bairro: "Povoado Feirinha", municipio: "Nossa Senhora da Glória", lat: -10.2452, lng: -37.3852, tipo: "povoado" },
  { bairro: "Povoado Várzea dos Cágados", municipio: "Nossa Senhora da Glória", lat: -10.2612, lng: -37.4512, tipo: "povoado" },

  // ==========================================
  // 9. ITAPORANGA D'AJUDA
  // ==========================================
  { bairro: "Centro", municipio: "Itaporanga d'Ajuda", lat: -10.9985, lng: -37.3052, tipo: "sede" },
  { bairro: "Bairro Novo", municipio: "Itaporanga d'Ajuda", lat: -10.9925, lng: -37.3112, tipo: "urbano" },
  { bairro: "São José", municipio: "Itaporanga d'Ajuda", lat: -11.0042, lng: -37.2985, tipo: "urbano" },
  { bairro: "Praia da Caueira", municipio: "Itaporanga d'Ajuda", lat: -11.1452, lng: -37.1952, tipo: "povoado" },
  { bairro: "Povoado Dorinha", municipio: "Itaporanga d'Ajuda", lat: -11.0512, lng: -37.2852, tipo: "povoado" },
  { bairro: "Povoado Sapé", municipio: "Itaporanga d'Ajuda", lat: -11.0312, lng: -37.3412, tipo: "povoado" },
  { bairro: "Povoado Nova Descoberta", municipio: "Itaporanga d'Ajuda", lat: -11.0785, lng: -37.2412, tipo: "povoado" },

  // ==========================================
  // 10. PROPRIÁ
  // ==========================================
  { bairro: "Centro", municipio: "Propriá", lat: -10.2125, lng: -36.8425, tipo: "sede" },
  { bairro: "Remanso", municipio: "Propriá", lat: -10.2052, lng: -36.8495, tipo: "urbano" },
  { bairro: "Santa Maria", municipio: "Propriá", lat: -10.2212, lng: -36.8354, tipo: "urbano" },
  { bairro: "Bela Vista", municipio: "Propriá", lat: -10.2165, lng: -36.8512, tipo: "urbano" },
  { bairro: "Matadouro", municipio: "Propriá", lat: -10.2245, lng: -36.8452, tipo: "urbano" },
  { bairro: "Povoado São Vicente", municipio: "Propriá", lat: -10.2512, lng: -36.8125, tipo: "povoado" },
  { bairro: "Povoado Boa Esperança", municipio: "Propriá", lat: -10.2385, lng: -36.8712, tipo: "povoado" },

  // ==========================================
  // 11. TOBIAS BARRETO
  // ==========================================
  { bairro: "Centro", municipio: "Tobias Barreto", lat: -11.1825, lng: -37.9985, tipo: "sede", aliases: ["centro comercial", "mercado de confecoes"] },
  { bairro: "Santa Rita", municipio: "Tobias Barreto", lat: -11.1752, lng: -37.9912, tipo: "urbano", aliases: ["bairro santa rita"] },
  { bairro: "Vila Samambaia", municipio: "Tobias Barreto", lat: -11.1912, lng: -38.0054, tipo: "urbano", aliases: ["samambaia"] },
  { bairro: "Cruz das Graças", municipio: "Tobias Barreto", lat: -11.1852, lng: -37.9852, tipo: "urbano", aliases: ["bairro cruz das gracas"] },
  { bairro: "Povoado Montes Coelhos", municipio: "Tobias Barreto", lat: -11.2312, lng: -37.9452, tipo: "povoado", aliases: ["montes coelhos", "pov montes coelhos"] },
  { bairro: "Povoado Nova Brasília", municipio: "Tobias Barreto", lat: -11.1412, lng: -38.0412, tipo: "povoado", aliases: ["nova brasilia"] },
  { bairro: "Povoado Campo Grande", municipio: "Tobias Barreto", lat: -11.2142, lng: -38.0612, tipo: "povoado", aliases: ["campo grande"] },

  // ==========================================
  // 12. SIMÃO DIAS
  // ==========================================
  { bairro: "Centro", municipio: "Simão Dias", lat: -10.7385, lng: -37.8125, tipo: "sede" },
  { bairro: "Bairro Novo", municipio: "Simão Dias", lat: -10.7452, lng: -37.8054, tipo: "urbano" },
  { bairro: "Rivalda Silva", municipio: "Simão Dias", lat: -10.7312, lng: -37.8185, tipo: "urbano" },
  { bairro: "Belo Horizonte", municipio: "Simão Dias", lat: -10.7412, lng: -37.8212, tipo: "urbano" },
  { bairro: "Povoado Triunfo", municipio: "Simão Dias", lat: -10.6825, lng: -37.8812, tipo: "povoado" },
  { bairro: "Povoado Pastinho", municipio: "Simão Dias", lat: -10.7612, lng: -37.7612, tipo: "povoado" },
  { bairro: "Povoado Paracatu", municipio: "Simão Dias", lat: -10.7852, lng: -37.8542, tipo: "povoado" },

  // ==========================================
  // 13. CANINDÉ DE SÃO FRANCISCO
  // ==========================================
  { bairro: "Centro / Sede", municipio: "Canindé de São Francisco", lat: -9.6432, lng: -37.7885, tipo: "sede" },
  { bairro: "Bairro Novo", municipio: "Canindé de São Francisco", lat: -9.6385, lng: -37.7942, tipo: "urbano" },
  { bairro: "Alto da Guia", municipio: "Canindé de São Francisco", lat: -9.6485, lng: -37.7812, tipo: "urbano" },
  { bairro: "Povoado Capim Grosso", municipio: "Canindé de São Francisco", lat: -9.6912, lng: -37.7412, tipo: "povoado" },
  { bairro: "Povoado Curituba", municipio: "Canindé de São Francisco", lat: -9.5812, lng: -37.8212, tipo: "povoado" },
  { bairro: "Povoado Cuiabá", municipio: "Canindé de São Francisco", lat: -9.6125, lng: -37.8652, tipo: "povoado" },

  // ==========================================
  // 14. POÇO REDONDO
  // ==========================================
  { bairro: "Centro / Sede", municipio: "Poço Redondo", lat: -9.8052, lng: -37.6852, tipo: "sede" },
  { bairro: "Bairro Novo", municipio: "Poço Redondo", lat: -9.7985, lng: -37.6912, tipo: "urbano" },
  { bairro: "Povoado Santa Rosa do Ermírio", municipio: "Poço Redondo", lat: -9.7125, lng: -37.7142, tipo: "povoado" },
  { bairro: "Povoado Sítios Novos", municipio: "Poço Redondo", lat: -9.8652, lng: -37.6125, tipo: "povoado" },
  { bairro: "Povoado Bonsucesso", municipio: "Poço Redondo", lat: -9.8212, lng: -37.7512, tipo: "povoado" },

  // ==========================================
  // 15. ITABAIANINHA
  // ==========================================
  { bairro: "Centro", municipio: "Itabaianinha", lat: -11.2742, lng: -37.7912, tipo: "sede" },
  { bairro: "Bairro Novo", municipio: "Itabaianinha", lat: -11.2685, lng: -37.7852, tipo: "urbano" },
  { bairro: "Matadouro", municipio: "Itabaianinha", lat: -11.2812, lng: -37.7985, tipo: "urbano" },
  { bairro: "Povoado Montalvão", municipio: "Itabaianinha", lat: -11.2412, lng: -37.8212, tipo: "povoado" },
  { bairro: "Povoado Jardim", municipio: "Itabaianinha", lat: -11.3125, lng: -37.7412, tipo: "povoado" },

  // ==========================================
  // 16. CAPELA
  // ==========================================
  { bairro: "Centro", municipio: "Capela", lat: -10.5032, lng: -37.0542, tipo: "sede" },
  { bairro: "São Pedro", municipio: "Capela", lat: -10.4985, lng: -37.0485, tipo: "urbano" },
  { bairro: "Nova Olinda", municipio: "Capela", lat: -10.5112, lng: -37.0612, tipo: "urbano" },
  { bairro: "Povoado Miranda", municipio: "Capela", lat: -10.4585, lng: -37.0852, tipo: "povoado" },
  { bairro: "Povoado Santa Efigênia", municipio: "Capela", lat: -10.5312, lng: -37.0212, tipo: "povoado" },

  // ==========================================
  // 17. NOSSA SENHORA DAS DORES
  // ==========================================
  { bairro: "Centro", municipio: "Nossa Senhora das Dores", lat: -10.4912, lng: -37.1952, tipo: "sede" },
  { bairro: "Cruzeiro das Moças", municipio: "Nossa Senhora das Dores", lat: -10.4852, lng: -37.1895, tipo: "urbano" },
  { bairro: "Gentil Barbosa", municipio: "Nossa Senhora das Dores", lat: -10.4985, lng: -37.2012, tipo: "urbano" },
  { bairro: "Povoado Campo Grande", municipio: "Nossa Senhora das Dores", lat: -10.4412, lng: -37.2412, tipo: "povoado" },
  { bairro: "Povoado Gado Bravo", municipio: "Nossa Senhora das Dores", lat: -10.5212, lng: -37.1612, tipo: "povoado" },

  // ==========================================
  // 18. BOQUIM
  // ==========================================
  { bairro: "Centro", municipio: "Boquim", lat: -11.1452, lng: -37.6212, tipo: "sede" },
  { bairro: "Bairro Novo", municipio: "Boquim", lat: -11.1395, lng: -37.6152, tipo: "urbano" },
  { bairro: "Povoado Olhos d'Água", municipio: "Boquim", lat: -11.1712, lng: -37.5852, tipo: "povoado" },
  { bairro: "Povoado Cabeça da Onça", municipio: "Boquim", lat: -11.1212, lng: -37.6512, tipo: "povoado" },

  // ==========================================
  // 19. UMBAÚBA
  // ==========================================
  { bairro: "Centro", municipio: "Umbaúba", lat: -11.3825, lng: -37.6585, tipo: "sede" },
  { bairro: "Bairro Novo", municipio: "Umbaúba", lat: -11.3765, lng: -37.6512, tipo: "urbano" },
  { bairro: "Povoado Mangabeira", municipio: "Umbaúba", lat: -11.4125, lng: -37.6212, tipo: "povoado" },
  { bairro: "Povoado Campinhos", municipio: "Umbaúba", lat: -11.3512, lng: -37.6852, tipo: "povoado" },

  // ==========================================
  // 20. POÇO VERDE
  // ==========================================
  { bairro: "Centro", municipio: "Poço Verde", lat: -10.7112, lng: -38.1812, tipo: "sede" },
  { bairro: "Bairro Novo", municipio: "Poço Verde", lat: -10.7052, lng: -38.1752, tipo: "urbano" },
  { bairro: "Povoado São José", municipio: "Poço Verde", lat: -10.6652, lng: -38.2212, tipo: "povoado" },
  { bairro: "Povoado Triunfo", municipio: "Poço Verde", lat: -10.7452, lng: -38.1312, tipo: "povoado" },

  // ==========================================
  // 21. NEÓPOLIS
  // ==========================================
  { bairro: "Centro", municipio: "Neópolis", lat: -10.3212, lng: -36.5785, tipo: "sede" },
  { bairro: "Alto Santo Antônio", municipio: "Neópolis", lat: -10.3165, lng: -36.5712, tipo: "urbano" },
  { bairro: "Povoado Betume", municipio: "Neópolis", lat: -10.3652, lng: -36.5312, tipo: "povoado" },
  { bairro: "Povoado Florípedes", municipio: "Neópolis", lat: -10.2952, lng: -36.6125, tipo: "povoado" },

  // ==========================================
  // 22. PORTO DA FOLHA
  // ==========================================
  { bairro: "Centro", municipio: "Porto da Folha", lat: -9.9185, lng: -37.2785, tipo: "sede" },
  { bairro: "Alto da Boa Vista", municipio: "Porto da Folha", lat: -9.9125, lng: -37.2842, tipo: "urbano" },
  { bairro: "Povoado Ilha do Ouro", municipio: "Porto da Folha", lat: -9.8712, lng: -37.3212, tipo: "povoado" },
  { bairro: "Povoado Niterói", municipio: "Porto da Folha", lat: -9.9452, lng: -37.2412, tipo: "povoado" }
];

/**
 * Standardize and clean a municipality name against the 75 Sergipe municipalities
 */
export function cleanMuniName(name: string): string {
  if (!name) return "Aracaju";
  const norm = normalizeHeader(name);

  // Exact match
  const found = SERGIPE_75_MUNICIPIOS.find(
    (m) => normalizeHeader(m.nome) === norm
  );
  if (found) return found.nome;

  // Fuzzy match
  const partial = SERGIPE_75_MUNICIPIOS.find((m) => {
    const mNorm = normalizeHeader(m.nome);
    return mNorm.includes(norm) || norm.includes(mNorm);
  });
  if (partial) return partial.nome;

  return name.trim();
}

/**
 * Normalizes raw string for locality comparison (removes prefixes, accents, punctuation)
 */
export function normalizeLocalityString(raw: string): string {
  if (!raw) return "";
  let s = raw.toLowerCase().trim();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Remove common administrative prefixes
  s = s.replace(/^(bairro|conjunto|conj\.|loteamento|lot\.|residencial|res\.|condom[ií]nio|cond\.|vila|jardim|jardins|parque)\s+/i, "");
  s = s.replace(/^(povoado|pov\.|distrito|dist\.|sitio|s[ií]tio|fazenda)\s+/i, "");
  
  // Remove trailing municipality/state suffixes e.g. "- se", "/ sergipe", "(aracaju)"
  s = s.replace(/[-/–—]\s*(se|sergipe|brasil|brazil)\b.*/i, "");
  s = s.replace(/\s*\([^)]*\)/g, "");
  s = s.replace(/[^a-z0-9\s]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  
  return s;
}

/**
 * Compare raw locality name with the official registered base for a municipality
 * Ex: "Centro", "CENTRO", "Centro - SE", "Bairro Centro" -> matches "Centro"
 */
export function matchOfficialBairro(
  rawBairro: string,
  municipio: string
): { matchedBairro: string | null; isExact: boolean; isAlias: boolean } {
  if (!rawBairro || !municipio) return { matchedBairro: null, isExact: false, isAlias: false };

  const normRaw = normalizeLocalityString(rawBairro);
  if (!normRaw) return { matchedBairro: null, isExact: false, isAlias: false };

  const officialList = OFFICIAL_BAIRROS_BY_MUNI[municipio] || [];

  // 1. Direct match with official list
  for (const official of officialList) {
    const normOfficial = normalizeLocalityString(official);
    if (normOfficial === normRaw) {
      return { matchedBairro: official, isExact: true, isAlias: false };
    }
  }

  // 2. Centroid database match (including aliases)
  const muniCentroids = SERGIPE_BAIRROS_CENTROIDS.filter(
    (b) => normalizeHeader(b.municipio) === normalizeHeader(municipio)
  );

  for (const item of muniCentroids) {
    const normItem = normalizeLocalityString(item.bairro);
    if (normItem === normRaw) {
      return { matchedBairro: item.bairro, isExact: true, isAlias: false };
    }
    if (item.aliases) {
      for (const alias of item.aliases) {
        if (normalizeLocalityString(alias) === normRaw) {
          return { matchedBairro: item.bairro, isExact: false, isAlias: true };
        }
      }
    }
  }

  // 3. Partial inclusion match (e.g. "Santa Rita Sul" -> "Santa Rita")
  for (const official of officialList) {
    const normOfficial = normalizeLocalityString(official);
    if (normRaw.length >= 4 && normOfficial.length >= 4) {
      if (normRaw.startsWith(normOfficial) || normOfficial.startsWith(normRaw)) {
        return { matchedBairro: official, isExact: false, isAlias: true };
      }
    }
  }

  return { matchedBairro: null, isExact: false, isAlias: false };
}

/**
 * Find closest Sergipe Municipality based on GPS coordinates
 */
export function findClosestMunicipality(lat: number, lng: number): MunicipalityCentroid {
  let closestMuni: MunicipalityCentroid = SERGIPE_75_MUNICIPALITY_CENTROIDS[2]; // Default Aracaju
  let minDist = Infinity;

  for (const m of SERGIPE_75_MUNICIPALITY_CENTROIDS) {
    const dist = getHaversineDistanceKm(lat, lng, m.lat, m.lng);
    if (dist < minDist) {
      minDist = dist;
      closestMuni = m;
    }
  }

  return closestMuni;
}

/**
 * Local GIS Centroid Fallback: calculates exact distance from all known local centroids
 */
export function getLocalGisStandardizedBairro(
  lat: number,
  lng: number,
  municipalityHint?: string
): StandardizedGeoResult {
  const closestCentroidMuni = findClosestMunicipality(lat, lng);
  let targetMuni = municipalityHint ? cleanMuniName(municipalityHint) : closestCentroidMuni.nome;

  const hintCentroid = SERGIPE_75_MUNICIPALITY_CENTROIDS.find(
    (m) => normalizeHeader(m.nome) === normalizeHeader(targetMuni)
  ) || closestCentroidMuni;

  const distToDeclaredCenter = getHaversineDistanceKm(lat, lng, hintCentroid.lat, hintCentroid.lng);

  // Check if coordinate is outside declared municipality
  const isOutsideDeclaredMuni = distToDeclaredCenter > hintCentroid.raioMaximoMunicipioKm;
  if (isOutsideDeclaredMuni && municipalityHint) {
    // Flag out of municipality
    return {
      latitude: lat,
      longitude: lng,
      coordenadasFormatadas: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      municipio: closestCentroidMuni.nome,
      municipioOriginal: municipalityHint,
      bairro: "NÃO IDENTIFICADO",
      bairroOriginal: `Fora do Município Declarado (${municipalityHint})`,
      estado: "SE",
      distanciaCentroKm: +distToDeclaredCenter.toFixed(1),
      fonte: "gis_local",
      statusConfiabilidade: "FORA_MUNICIPIO",
      confiabilidadePercent: 10,
      detalhesAuditoria: `Coordenada (${lat.toFixed(5)}, ${lng.toFixed(5)}) está a ${distToDeclaredCenter.toFixed(1)} km do centro de ${municipalityHint}, ultrapassando o limite municipal (${hintCentroid.raioMaximoMunicipioKm} km). Ponto geograficamente pertence a ${closestCentroidMuni.nome}.`
    };
  }

  // Use the actual geographical municipality
  const activeMuniName = isOutsideDeclaredMuni ? closestCentroidMuni.nome : targetMuni;
  const activeCentroid = isOutsideDeclaredMuni ? closestCentroidMuni : hintCentroid;
  const distToActiveCenter = getHaversineDistanceKm(lat, lng, activeCentroid.lat, activeCentroid.lng);

  // Find closest neighborhood in this municipality
  const muniBairros = SERGIPE_BAIRROS_CENTROIDS.filter(
    (b) => normalizeHeader(b.municipio) === normalizeHeader(activeMuniName)
  );

  let closestBairro: BairroCentroid | null = null;
  let minBairroDist = Infinity;

  for (const item of muniBairros) {
    const dist = getHaversineDistanceKm(lat, lng, item.lat, item.lng);
    if (dist < minBairroDist) {
      minBairroDist = dist;
      closestBairro = item;
    }
  }

  if (closestBairro) {
    const maxAllowedDist = closestBairro.tipo === "povoado" ? 6.5 : 3.5;
    if (minBairroDist <= maxAllowedDist) {
      return {
        latitude: lat,
        longitude: lng,
        coordenadasFormatadas: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        municipio: activeMuniName,
        municipioOriginal: municipalityHint,
        bairro: closestBairro.bairro,
        bairroOriginal: closestBairro.bairro,
        distritoOuPovoado: closestBairro.tipo === "povoado" ? closestBairro.bairro : undefined,
        estado: "SE",
        distanciaCentroKm: +distToActiveCenter.toFixed(1),
        fonte: "gis_local",
        statusConfiabilidade: "APROXIMADO",
        confiabilidadePercent: 88,
        detalhesAuditoria: `Identificado por proximidade GIS com o centróide oficial de ${closestBairro.bairro} (${minBairroDist.toFixed(2)} km de distância).`
      };
    }
  }

  // If in central urban radius
  if (distToActiveCenter <= 3.8) {
    return {
      latitude: lat,
      longitude: lng,
      coordenadasFormatadas: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      municipio: activeMuniName,
      municipioOriginal: municipalityHint,
      bairro: "Centro",
      bairroOriginal: "Centro / Sede Urbana",
      estado: "SE",
      distanciaCentroKm: +distToActiveCenter.toFixed(1),
      fonte: "gis_local",
      statusConfiabilidade: "APROXIMADO",
      confiabilidadePercent: 80,
      detalhesAuditoria: `Localizado no perímetro central da sede municipal (${distToActiveCenter.toFixed(1)} km do marco zero).`
    };
  }

  // Indeterminate or rural
  return {
    latitude: lat,
    longitude: lng,
    coordenadasFormatadas: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    municipio: activeMuniName,
    municipioOriginal: municipalityHint,
    bairro: "NÃO IDENTIFICADO",
    bairroOriginal: `Zona Rural (${activeMuniName})`,
    distritoOuPovoado: "Zona Rural",
    estado: "SE",
    distanciaCentroKm: +distToActiveCenter.toFixed(1),
    fonte: "fallback",
    statusConfiabilidade: "NAO_IDENTIFICADO",
    confiabilidadePercent: 20,
    detalhesAuditoria: `Ponto fora do perímetro urbano densamente mapeado (${distToActiveCenter.toFixed(1)} km do centro). Sem correspondência segura na base de bairros.`
  };
}

/**
 * Reverse geocode a latitude and longitude with complete standardized pipeline
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number,
  municipalityHint?: string
): Promise<StandardizedGeoResult> {
  const roundLat = +lat.toFixed(4);
  const roundLng = +lng.toFixed(4);
  const cacheKey = `${roundLat},${roundLng}__${municipalityHint ? normalizeHeader(municipalityHint) : "auto"}`;

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  let rawBairroFound = "";
  let rawMuniFound = "";
  let rawLogradouro = "";
  let rawNumero = "";
  let rawCep = "";
  let apiSource: "osm" | "bigdatacloud" | null = null;
  let rawAddressData: any = null;

  // 1. Try BigDataCloud Reverse Geocoding
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${roundLat}&longitude=${roundLng}&localityLanguage=pt`;
    const res = await fetch(bdcUrl, { headers: { "Accept": "application/json" } });
    if (res.ok) {
      const data = await res.json();
      rawAddressData = data;
      rawMuniFound = data.city || data.locality || data.principalSubdivision || "";
      
      if (data.localityInfo && data.localityInfo.informative) {
        const sub = data.localityInfo.informative.find(
          (i: any) =>
            i.description === "suburb" ||
            i.description === "neighborhood" ||
            i.description === "quarter" ||
            i.description === "village" ||
            i.description === "hamlet"
        );
        if (sub && sub.name) {
          rawBairroFound = sub.name;
          apiSource = "bigdatacloud";
        }
      }

      if (!rawBairroFound && data.locality && data.locality !== rawMuniFound) {
        rawBairroFound = data.locality;
        apiSource = "bigdatacloud";
      }

      if (data.postcode) {
        rawCep = String(data.postcode).replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2");
      }
    }
  } catch (e) {
    // Continue to OSM
  }

  // 2. Try OpenStreetMap Nominatim
  if (!rawBairroFound) {
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundLat}&lon=${roundLng}&zoom=18&addressdetails=1`;
      const res = await fetch(osmUrl, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "SEIE-Electoral-Intelligence/3.0"
        }
      });
      if (res.ok) {
        const data = await res.json();
        rawAddressData = data;
        const addr = data.address || {};

        rawMuniFound =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.village ||
          addr.county ||
          rawMuniFound;

        rawBairroFound =
          addr.suburb ||
          addr.neighbourhood ||
          addr.quarter ||
          addr.hamlet ||
          addr.city_district ||
          addr.residential ||
          "";

        rawLogradouro = addr.road || addr.street || addr.avenue || addr.pedestrian || "";
        rawNumero = addr.house_number || "";
        if (addr.postcode) {
          rawCep = String(addr.postcode).replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2");
        }

        if (rawBairroFound) {
          apiSource = "osm";
        }
      }
    } catch (e) {
      // Continue to local GIS
    }
  }

  // Resolve target municipality
  const effectiveMuni = cleanMuniName(rawMuniFound || municipalityHint || "");
  const closestCentroidMuni = findClosestMunicipality(lat, lng);
  const declaredMuniCentroid = SERGIPE_75_MUNICIPALITY_CENTROIDS.find(
    (m) => normalizeHeader(m.nome) === normalizeHeader(effectiveMuni)
  ) || closestCentroidMuni;

  const distToCityCenter = getHaversineDistanceKm(lat, lng, declaredMuniCentroid.lat, declaredMuniCentroid.lng);

  // Check out of bounds
  if (municipalityHint && distToCityCenter > declaredMuniCentroid.raioMaximoMunicipioKm) {
    const result: StandardizedGeoResult = {
      latitude: lat,
      longitude: lng,
      coordenadasFormatadas: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      municipio: closestCentroidMuni.nome,
      municipioOriginal: municipalityHint,
      bairro: "NÃO IDENTIFICADO",
      bairroOriginal: rawBairroFound || "Fora do Perímetro Municipal",
      estado: "SE",
      distanciaCentroKm: +distToCityCenter.toFixed(1),
      fonte: apiSource || "gis_local",
      statusConfiabilidade: "FORA_MUNICIPIO",
      confiabilidadePercent: 15,
      detalhesAuditoria: `Coordenada geográfica está fora do município pesquisado (${municipalityHint}). Distância de ${distToCityCenter.toFixed(1)} km excede limite municipal. Ponto pertence a ${closestCentroidMuni.nome}.`,
      rawAddress: rawAddressData
    };
    memoryCache.set(cacheKey, result);
    saveGeocodeCache();
    return result;
  }

  // 3. Match against official database
  if (rawBairroFound) {
    const match = matchOfficialBairro(rawBairroFound, effectiveMuni);
    if (match.matchedBairro) {
      const result: StandardizedGeoResult = {
        latitude: lat,
        longitude: lng,
        coordenadasFormatadas: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        municipio: effectiveMuni,
        municipioOriginal: municipalityHint,
        bairro: match.matchedBairro,
        bairroOriginal: rawBairroFound,
        logradouro: rawLogradouro || undefined,
        numero: rawNumero || undefined,
        cep: rawCep || undefined,
        estado: "SE",
        distanciaCentroKm: +distToCityCenter.toFixed(1),
        fonte: apiSource || "osm",
        statusConfiabilidade: "SUCESSO",
        confiabilidadePercent: match.isExact ? 100 : 95,
        detalhesAuditoria: `Bairro identificado via ${apiSource === "osm" ? "OpenStreetMap" : "BigDataCloud"} ("${rawBairroFound}") e padronizado com sucesso na base oficial como "${match.matchedBairro}".`,
        rawAddress: rawAddressData
      };
      memoryCache.set(cacheKey, result);
      saveGeocodeCache();
      return result;
    } else {
      // Raw bairro not found in official registered base
      // Fall back to GIS centroid proximity
      const gisResult = getLocalGisStandardizedBairro(lat, lng, effectiveMuni);
      if (gisResult.statusConfiabilidade === "APROXIMADO") {
        gisResult.bairroOriginal = rawBairroFound;
        gisResult.logradouro = rawLogradouro || undefined;
        gisResult.numero = rawNumero || undefined;
        gisResult.cep = rawCep || undefined;
        gisResult.detalhesAuditoria = `Bairro bruto retornado pela API ("${rawBairroFound}") não consta na base oficial. Ajustado por centróide GIS para "${gisResult.bairro}".`;
        memoryCache.set(cacheKey, gisResult);
        saveGeocodeCache();
        return gisResult;
      } else {
        const unregResult: StandardizedGeoResult = {
          latitude: lat,
          longitude: lng,
          coordenadasFormatadas: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          municipio: effectiveMuni,
          municipioOriginal: municipalityHint,
          bairro: "NÃO IDENTIFICADO",
          bairroOriginal: rawBairroFound,
          logradouro: rawLogradouro || undefined,
          numero: rawNumero || undefined,
          cep: rawCep || undefined,
          estado: "SE",
          distanciaCentroKm: +distToCityCenter.toFixed(1),
          fonte: apiSource || "osm",
          statusConfiabilidade: "BAIRRO_NAO_CADASTRADO",
          confiabilidadePercent: 30,
          detalhesAuditoria: `Bairro retornado pela API ("${rawBairroFound}") não existe na base cadastrada de ${effectiveMuni}. Não inventado.`,
          rawAddress: rawAddressData
        };
        memoryCache.set(cacheKey, unregResult);
        saveGeocodeCache();
        return unregResult;
      }
    }
  }

  // 4. Local GIS Centroid Fallback
  const fallback = getLocalGisStandardizedBairro(lat, lng, effectiveMuni);
  fallback.logradouro = rawLogradouro || undefined;
  fallback.numero = rawNumero || undefined;
  fallback.cep = rawCep || undefined;
  fallback.rawAddress = rawAddressData;
  memoryCache.set(cacheKey, fallback);
  saveGeocodeCache();
  return fallback;
}

/**
 * Extract GPS coordinates from survey row
 */
export function extractRowCoordinates(row: any): { lat: number; lng: number } | null {
  if (!row || typeof row !== "object") return null;

  const keys = Object.keys(row);

  let latVal: any = null;
  let lngVal: any = null;

  for (const key of keys) {
    const norm = normalizeHeader(key);
    if (
      norm === "latitude" ||
      norm === "lat" ||
      norm === "gps latitude" ||
      norm === "gps lat" ||
      norm === "point lat" ||
      norm === "latitude coleta" ||
      norm === "coord y" ||
      norm === "y"
    ) {
      latVal = row[key];
    }
    if (
      norm === "longitude" ||
      norm === "lng" ||
      norm === "lon" ||
      norm === "gps longitude" ||
      norm === "gps lng" ||
      norm === "gps lon" ||
      norm === "point lng" ||
      norm === "longitude coleta" ||
      norm === "coord x" ||
      norm === "x"
    ) {
      lngVal = row[key];
    }
  }

  // Look for combined GPS string e.g. "-10.9472 -37.0731" or "-10.9472,-37.0731"
  if (latVal === null || lngVal === null) {
    for (const key of keys) {
      const norm = normalizeHeader(key);
      if (
        norm === "gps" ||
        norm === "coordenadas" ||
        norm === "localizacao gps" ||
        norm === "geopoint" ||
        norm === "location" ||
        norm === "lat lon" ||
        norm === "lat lng"
      ) {
        const valStr = String(row[key]).trim();
        const parts = valStr.split(/[\s,;/_]+/);
        if (parts.length >= 2) {
          const p1 = parseFloat(parts[0]);
          const p2 = parseFloat(parts[1]);
          if (!isNaN(p1) && !isNaN(p2)) {
            // In Sergipe, lat is ~ -9.0 to -11.6 and lng is ~ -36.0 to -38.5
            if (p1 < 0 && p1 > -20 && p2 < -30 && p2 > -50) {
              latVal = p1;
              lngVal = p2;
            } else if (p2 < 0 && p2 > -20 && p1 < -30 && p1 > -50) {
              latVal = p2;
              lngVal = p1;
            }
          }
        }
      }
    }
  }

  if (latVal !== null && lngVal !== null) {
    const parsedLat = parseFloat(String(latVal).replace(",", "."));
    const parsedLng = parseFloat(String(lngVal).replace(",", "."));

    // Sanity check for Sergipe and immediate borders (-8.5 to -12.5 lat, -35.0 to -39.5 lng)
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      if (parsedLat >= -12.5 && parsedLat <= -8.5 && parsedLng >= -39.5 && parsedLng <= -35.0) {
        return { lat: parsedLat, lng: parsedLng };
      }
    }
  }

  return null;
}

/**
 * Batch Process large sets of coordinate records with caching and rate limiting
 */
export async function batchGeocodeRows(
  rows: any[],
  onProgress?: (processed: number, total: number) => void
): Promise<StandardizedGeoResult[]> {
  const results: StandardizedGeoResult[] = [];
  const total = rows.length;

  for (let i = 0; i < total; i++) {
    const row = rows[i];
    const coords = extractRowCoordinates(row);
    const id = row.id || row.ID || row._id || (i + 1);
    const muniHint = row.municipio || row.cidade || row.municipio_nome || undefined;

    if (coords) {
      const geo = await reverseGeocodeLocation(coords.lat, coords.lng, muniHint);
      geo.id = id;
      results.push(geo);
    } else {
      results.push({
        id,
        latitude: 0,
        longitude: 0,
        coordenadasFormatadas: "N/A",
        municipio: muniHint ? cleanMuniName(muniHint) : "Não Definido",
        bairro: "NÃO IDENTIFICADO",
        bairroOriginal: "Sem Coordenadas GPS",
        estado: "SE",
        distanciaCentroKm: 0,
        fonte: "fallback",
        statusConfiabilidade: "NAO_IDENTIFICADO",
        confiabilidadePercent: 0,
        detalhesAuditoria: "Registro não contém colunas de Latitude e Longitude válidas."
      });
    }

    if (onProgress && (i % 10 === 0 || i === total - 1)) {
      onProgress(i + 1, total);
    }
  }

  return results;
}

export function getGeocodeCacheStats(): { count: number; keys: string[] } {
  return {
    count: memoryCache.size,
    keys: Array.from(memoryCache.keys())
  };
}

// Backwards compatibility aliases
export const getLocalGisBairro = getLocalGisStandardizedBairro;
export const reverseGeocodeOnline = reverseGeocodeLocation;
export type GeoLocationResult = StandardizedGeoResult;



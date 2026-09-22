/**
 * Fonte Canônica Única da Estrutura Territorial de Sergipe - SEIE
 * 
 * Este módulo é a ÚNICA fonte da verdade para a divisão territorial do Estado de Sergipe:
 * - Exatamente 75 Municípios Oficiais (conforme IBGE e TRE/TSE)
 * - Exatamente 8 Territórios de Planejamento Oficiais do Estado de Sergipe
 * 
 * Regra Inviolável: Nenhuma lista ou componente deve recriar ou hardcodificar
 * listas paralelas de municípios ou territórios; todas devem derivar desta fonte canônica.
 */

export interface CanonicalMunicipalityDefinition {
  name: string;
  territory: SergipeTerritorioCanonico;
  ibgeCode?: string;
  isRegionalPole?: boolean;
  officialElectorate2024?: number;
}

export const CANONICAL_SERGIPE_TERRITORIES = [
  "Grande Aracaju",
  "Agreste Central",
  "Centro Sul",
  "Alto Sertão",
  "Médio Sertão",
  "Baixo São Francisco",
  "Leste Sergipano",
  "Sul Sergipano"
] as const;

export type SergipeTerritorioCanonico = (typeof CANONICAL_SERGIPE_TERRITORIES)[number];

export const CANONICAL_REGIONAL_POLES: Record<SergipeTerritorioCanonico, string> = {
  "Grande Aracaju": "Aracaju",
  "Agreste Central": "Itabaiana",
  "Centro Sul": "Lagarto",
  "Alto Sertão": "Nossa Senhora da Glória",
  "Médio Sertão": "Nossa Senhora das Dores",
  "Baixo São Francisco": "Propriá",
  "Leste Sergipano": "Capela",
  "Sul Sergipano": "Estância"
};

/**
 * Mapeamento canônico dos 75 municípios para seus 8 territórios oficiais
 */
export const CANONICAL_MUNICIPALITIES_DATA: CanonicalMunicipalityDefinition[] = [
  // 1. Grande Aracaju (8 municípios)
  { name: "Aracaju", territory: "Grande Aracaju", isRegionalPole: true, officialElectorate2024: 416605 },
  { name: "Barra dos Coqueiros", territory: "Grande Aracaju", officialElectorate2024: 29554 },
  { name: "Itaporanga d'Ajuda", territory: "Grande Aracaju", officialElectorate2024: 26842 },
  { name: "Laranjeiras", territory: "Grande Aracaju", officialElectorate2024: 21978 },
  { name: "Maruim", territory: "Grande Aracaju", officialElectorate2024: 12984 },
  { name: "Nossa Senhora do Socorro", territory: "Grande Aracaju", officialElectorate2024: 119854 },
  { name: "Riachuelo", territory: "Grande Aracaju", officialElectorate2024: 8745 },
  { name: "São Cristóvão", territory: "Grande Aracaju", officialElectorate2024: 59312 },

  // 2. Agreste Central (14 municípios)
  { name: "Areia Branca", territory: "Agreste Central", officialElectorate2024: 15420 },
  { name: "Campo do Brito", territory: "Agreste Central", officialElectorate2024: 14890 },
  { name: "Carira", territory: "Agreste Central", officialElectorate2024: 17230 },
  { name: "Frei Paulo", territory: "Agreste Central", officialElectorate2024: 12140 },
  { name: "Itabaiana", territory: "Agreste Central", isRegionalPole: true, officialElectorate2024: 73520 },
  { name: "Macambira", territory: "Agreste Central", officialElectorate2024: 6890 },
  { name: "Malhador", territory: "Agreste Central", officialElectorate2024: 10210 },
  { name: "Moita Bonita", territory: "Agreste Central", officialElectorate2024: 9840 },
  { name: "Nossa Senhora Aparecida", territory: "Agreste Central", officialElectorate2024: 7650 },
  { name: "Pedra Mole", territory: "Agreste Central", officialElectorate2024: 3120 },
  { name: "Pinhão", territory: "Agreste Central", officialElectorate2024: 5890 },
  { name: "Ribeirópolis", territory: "Agreste Central", officialElectorate2024: 15840 },
  { name: "São Domingos", territory: "Agreste Central", officialElectorate2024: 8790 },
  { name: "São Miguel do Aleixo", territory: "Agreste Central", officialElectorate2024: 3950 },

  // 3. Centro Sul (5 municípios)
  { name: "Lagarto", territory: "Centro Sul", isRegionalPole: true, officialElectorate2024: 78940 },
  { name: "Poço Verde", territory: "Centro Sul", officialElectorate2024: 18920 },
  { name: "Riachão do Dantas", territory: "Centro Sul", officialElectorate2024: 16540 },
  { name: "Simão Dias", territory: "Centro Sul", officialElectorate2024: 33450 },
  { name: "Tobias Barreto", territory: "Centro Sul", officialElectorate2024: 42100 },

  // 4. Alto Sertão (7 municípios)
  { name: "Canindé de São Francisco", territory: "Alto Sertão", officialElectorate2024: 24560 },
  { name: "Gararu", territory: "Alto Sertão", officialElectorate2024: 10450 },
  { name: "Monte Alegre de Sergipe", territory: "Alto Sertão", officialElectorate2024: 12890 },
  { name: "Nossa Senhora da Glória", territory: "Alto Sertão", isRegionalPole: true, officialElectorate2024: 32150 },
  { name: "Nossa Senhora de Lourdes", territory: "Alto Sertão", officialElectorate2024: 5980 },
  { name: "Poço Redondo", territory: "Alto Sertão", officialElectorate2024: 25430 },
  { name: "Porto da Folha", territory: "Alto Sertão", officialElectorate2024: 22180 },

  // 5. Médio Sertão (6 municípios)
  { name: "Aquidabã", territory: "Médio Sertão", officialElectorate2024: 16750 },
  { name: "Cumbe", territory: "Médio Sertão", officialElectorate2024: 3890 },
  { name: "Feira Nova", territory: "Médio Sertão", officialElectorate2024: 5120 },
  { name: "Graccho Cardoso", territory: "Médio Sertão", officialElectorate2024: 4950 },
  { name: "Itabi", territory: "Médio Sertão", officialElectorate2024: 4560 },
  { name: "Nossa Senhora das Dores", territory: "Médio Sertão", isRegionalPole: true, officialElectorate2024: 20120 },

  // 6. Baixo São Francisco (14 municípios)
  { name: "Amparo de São Francisco", territory: "Baixo São Francisco", officialElectorate2024: 2310 },
  { name: "Brejo Grande", territory: "Baixo São Francisco", officialElectorate2024: 6780 },
  { name: "Canhoba", territory: "Baixo São Francisco", officialElectorate2024: 3650 },
  { name: "Cedro de São João", territory: "Baixo São Francisco", officialElectorate2024: 4890 },
  { name: "Ilha das Flores", territory: "Baixo São Francisco", officialElectorate2024: 7120 },
  { name: "Japoatã", territory: "Baixo São Francisco", officialElectorate2024: 10450 },
  { name: "Malhada dos Bois", territory: "Baixo São Francisco", officialElectorate2024: 3560 },
  { name: "Muribeca", territory: "Baixo São Francisco", officialElectorate2024: 6980 },
  { name: "Neópolis", territory: "Baixo São Francisco", officialElectorate2024: 15430 },
  { name: "Pacatuba", territory: "Baixo São Francisco", officialElectorate2024: 11230 },
  { name: "Propriá", territory: "Baixo São Francisco", isRegionalPole: true, officialElectorate2024: 23410 },
  { name: "Santana do São Francisco", territory: "Baixo São Francisco", officialElectorate2024: 6540 },
  { name: "São Francisco", territory: "Baixo São Francisco", officialElectorate2024: 3120 },
  { name: "Telha", territory: "Baixo São Francisco", officialElectorate2024: 3240 },

  // 7. Leste Sergipano (10 municípios)
  { name: "Capela", territory: "Leste Sergipano", isRegionalPole: true, officialElectorate2024: 24650 },
  { name: "Carmópolis", territory: "Leste Sergipano", officialElectorate2024: 13540 },
  { name: "Divina Pastora", territory: "Leste Sergipano", officialElectorate2024: 4890 },
  { name: "General Maynard", territory: "Leste Sergipano", officialElectorate2024: 3120 },
  { name: "Japaratuba", territory: "Leste Sergipano", officialElectorate2024: 14210 },
  { name: "Pirambu", territory: "Leste Sergipano", officialElectorate2024: 7890 },
  { name: "Rosário do Catete", territory: "Leste Sergipano", officialElectorate2024: 8760 },
  { name: "Santa Rosa de Lima", territory: "Leste Sergipano", officialElectorate2024: 3950 },
  { name: "Santo Amaro das Brotas", territory: "Leste Sergipano", officialElectorate2024: 9870 },
  { name: "Siriri", territory: "Leste Sergipano", officialElectorate2024: 7120 },

  // 8. Sul Sergipano (11 municípios)
  { name: "Arauá", territory: "Sul Sergipano", officialElectorate2024: 9230 },
  { name: "Boquim", territory: "Sul Sergipano", officialElectorate2024: 21450 },
  { name: "Cristinápolis", territory: "Sul Sergipano", officialElectorate2024: 14780 },
  { name: "Estância", territory: "Sul Sergipano", isRegionalPole: true, officialElectorate2024: 51230 },
  { name: "Indiaroba", territory: "Sul Sergipano", officialElectorate2024: 13560 },
  { name: "Itabaianinha", territory: "Sul Sergipano", officialElectorate2024: 34120 },
  { name: "Pedrinhas", territory: "Sul Sergipano", officialElectorate2024: 7890 },
  { name: "Salgado", territory: "Sul Sergipano", officialElectorate2024: 16540 },
  { name: "Santa Luzia do Itanhy", territory: "Sul Sergipano", officialElectorate2024: 12430 },
  { name: "Tomar do Geru", territory: "Sul Sergipano", officialElectorate2024: 10890 },
  { name: "Umbaúba", territory: "Sul Sergipano", officialElectorate2024: 19870 }
];

/**
 * Dicionário derivado: Território -> Lista de Nomes de Municípios
 */
export const CANONICAL_MUNICIPIOS_POR_TERRITORIO: Record<SergipeTerritorioCanonico, string[]> = 
  CANONICAL_SERGIPE_TERRITORIES.reduce((acc, territory) => {
    acc[territory] = CANONICAL_MUNICIPALITIES_DATA
      .filter((m) => m.territory === territory)
      .map((m) => m.name)
      .sort((a, b) => a.localeCompare("pt-BR"));
    return acc;
  }, {} as Record<SergipeTerritorioCanonico, string[]>);

/**
 * Mapa derivado: Nome Normalizado -> Definição Canônica
 */
export const CANONICAL_MUNICIPALITY_LOOKUP: Map<string, CanonicalMunicipalityDefinition> = new Map();

CANONICAL_MUNICIPALITIES_DATA.forEach((m) => {
  const normKey = m.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  CANONICAL_MUNICIPALITY_LOOKUP.set(normKey, m);
});

/**
 * Função canônica de verificação e obtenção de município
 */
export function getCanonicalMunicipality(rawName: string): CanonicalMunicipalityDefinition | null {
  if (!rawName) return null;
  const normKey = rawName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  return CANONICAL_MUNICIPALITY_LOOKUP.get(normKey) || null;
}

/**
 * Retorna os 8 territórios estruturados com metadados para APIs e Frontend
 */
export function getCanonicalTerritoriesData() {
  return CANONICAL_SERGIPE_TERRITORIES.map((territory) => {
    const cities = CANONICAL_MUNICIPIOS_POR_TERRITORIO[territory];
    const pole = CANONICAL_REGIONAL_POLES[territory];
    const totalElectorate = CANONICAL_MUNICIPALITIES_DATA
      .filter((m) => m.territory === territory)
      .reduce((sum, m) => sum + (m.officialElectorate2024 || 0), 0);

    return {
      name: territory,
      cities,
      citiesCount: cities.length,
      regionalPole: pole,
      totalElectorate
    };
  });
}

// @ts-nocheck
// src/data/canonicalTerritories.ts
var CANONICAL_SERGIPE_TERRITORIES = [
  "Grande Aracaju",
  "Agreste Central",
  "Centro Sul",
  "Alto Sert\xE3o",
  "M\xE9dio Sert\xE3o",
  "Baixo S\xE3o Francisco",
  "Leste Sergipano",
  "Sul Sergipano"
];
var CANONICAL_REGIONAL_POLES = {
  "Grande Aracaju": "Aracaju",
  "Agreste Central": "Itabaiana",
  "Centro Sul": "Lagarto",
  "Alto Sert\xE3o": "Nossa Senhora da Gl\xF3ria",
  "M\xE9dio Sert\xE3o": "Nossa Senhora das Dores",
  "Baixo S\xE3o Francisco": "Propri\xE1",
  "Leste Sergipano": "Capela",
  "Sul Sergipano": "Est\xE2ncia"
};
var CANONICAL_MUNICIPALITIES_DATA = [
  // 1. Grande Aracaju (8 municípios)
  { name: "Aracaju", territory: "Grande Aracaju", isRegionalPole: true, officialElectorate2024: 416605 },
  { name: "Barra dos Coqueiros", territory: "Grande Aracaju", officialElectorate2024: 29554 },
  { name: "Itaporanga d'Ajuda", territory: "Grande Aracaju", officialElectorate2024: 26842 },
  { name: "Laranjeiras", territory: "Grande Aracaju", officialElectorate2024: 21978 },
  { name: "Maruim", territory: "Grande Aracaju", officialElectorate2024: 12984 },
  { name: "Nossa Senhora do Socorro", territory: "Grande Aracaju", officialElectorate2024: 119854 },
  { name: "Riachuelo", territory: "Grande Aracaju", officialElectorate2024: 8745 },
  { name: "S\xE3o Crist\xF3v\xE3o", territory: "Grande Aracaju", officialElectorate2024: 59312 },
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
  { name: "Pinh\xE3o", territory: "Agreste Central", officialElectorate2024: 5890 },
  { name: "Ribeir\xF3polis", territory: "Agreste Central", officialElectorate2024: 15840 },
  { name: "S\xE3o Domingos", territory: "Agreste Central", officialElectorate2024: 8790 },
  { name: "S\xE3o Miguel do Aleixo", territory: "Agreste Central", officialElectorate2024: 3950 },
  // 3. Centro Sul (5 municípios)
  { name: "Lagarto", territory: "Centro Sul", isRegionalPole: true, officialElectorate2024: 78940 },
  { name: "Po\xE7o Verde", territory: "Centro Sul", officialElectorate2024: 18920 },
  { name: "Riach\xE3o do Dantas", territory: "Centro Sul", officialElectorate2024: 16540 },
  { name: "Sim\xE3o Dias", territory: "Centro Sul", officialElectorate2024: 33450 },
  { name: "Tobias Barreto", territory: "Centro Sul", officialElectorate2024: 42100 },
  // 4. Alto Sertão (7 municípios)
  { name: "Canind\xE9 de S\xE3o Francisco", territory: "Alto Sert\xE3o", officialElectorate2024: 24560 },
  { name: "Gararu", territory: "Alto Sert\xE3o", officialElectorate2024: 10450 },
  { name: "Monte Alegre de Sergipe", territory: "Alto Sert\xE3o", officialElectorate2024: 12890 },
  { name: "Nossa Senhora da Gl\xF3ria", territory: "Alto Sert\xE3o", isRegionalPole: true, officialElectorate2024: 32150 },
  { name: "Nossa Senhora de Lourdes", territory: "Alto Sert\xE3o", officialElectorate2024: 5980 },
  { name: "Po\xE7o Redondo", territory: "Alto Sert\xE3o", officialElectorate2024: 25430 },
  { name: "Porto da Folha", territory: "Alto Sert\xE3o", officialElectorate2024: 22180 },
  // 5. Médio Sertão (6 municípios)
  { name: "Aquidab\xE3", territory: "M\xE9dio Sert\xE3o", officialElectorate2024: 16750 },
  { name: "Cumbe", territory: "M\xE9dio Sert\xE3o", officialElectorate2024: 3890 },
  { name: "Feira Nova", territory: "M\xE9dio Sert\xE3o", officialElectorate2024: 5120 },
  { name: "Graccho Cardoso", territory: "M\xE9dio Sert\xE3o", officialElectorate2024: 4950 },
  { name: "Itabi", territory: "M\xE9dio Sert\xE3o", officialElectorate2024: 4560 },
  { name: "Nossa Senhora das Dores", territory: "M\xE9dio Sert\xE3o", isRegionalPole: true, officialElectorate2024: 20120 },
  // 6. Baixo São Francisco (14 municípios)
  { name: "Amparo de S\xE3o Francisco", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 2310 },
  { name: "Brejo Grande", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 6780 },
  { name: "Canhoba", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 3650 },
  { name: "Cedro de S\xE3o Jo\xE3o", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 4890 },
  { name: "Ilha das Flores", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 7120 },
  { name: "Japoat\xE3", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 10450 },
  { name: "Malhada dos Bois", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 3560 },
  { name: "Muribeca", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 6980 },
  { name: "Ne\xF3polis", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 15430 },
  { name: "Pacatuba", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 11230 },
  { name: "Propri\xE1", territory: "Baixo S\xE3o Francisco", isRegionalPole: true, officialElectorate2024: 23410 },
  { name: "Santana do S\xE3o Francisco", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 6540 },
  { name: "S\xE3o Francisco", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 3120 },
  { name: "Telha", territory: "Baixo S\xE3o Francisco", officialElectorate2024: 3240 },
  // 7. Leste Sergipano (10 municípios)
  { name: "Capela", territory: "Leste Sergipano", isRegionalPole: true, officialElectorate2024: 24650 },
  { name: "Carm\xF3polis", territory: "Leste Sergipano", officialElectorate2024: 13540 },
  { name: "Divina Pastora", territory: "Leste Sergipano", officialElectorate2024: 4890 },
  { name: "General Maynard", territory: "Leste Sergipano", officialElectorate2024: 3120 },
  { name: "Japaratuba", territory: "Leste Sergipano", officialElectorate2024: 14210 },
  { name: "Pirambu", territory: "Leste Sergipano", officialElectorate2024: 7890 },
  { name: "Ros\xE1rio do Catete", territory: "Leste Sergipano", officialElectorate2024: 8760 },
  { name: "Santa Rosa de Lima", territory: "Leste Sergipano", officialElectorate2024: 3950 },
  { name: "Santo Amaro das Brotas", territory: "Leste Sergipano", officialElectorate2024: 9870 },
  { name: "Siriri", territory: "Leste Sergipano", officialElectorate2024: 7120 },
  // 8. Sul Sergipano (11 municípios)
  { name: "Arau\xE1", territory: "Sul Sergipano", officialElectorate2024: 9230 },
  { name: "Boquim", territory: "Sul Sergipano", officialElectorate2024: 21450 },
  { name: "Cristin\xE1polis", territory: "Sul Sergipano", officialElectorate2024: 14780 },
  { name: "Est\xE2ncia", territory: "Sul Sergipano", isRegionalPole: true, officialElectorate2024: 51230 },
  { name: "Indiaroba", territory: "Sul Sergipano", officialElectorate2024: 13560 },
  { name: "Itabaianinha", territory: "Sul Sergipano", officialElectorate2024: 34120 },
  { name: "Pedrinhas", territory: "Sul Sergipano", officialElectorate2024: 7890 },
  { name: "Salgado", territory: "Sul Sergipano", officialElectorate2024: 16540 },
  { name: "Santa Luzia do Itanhy", territory: "Sul Sergipano", officialElectorate2024: 12430 },
  { name: "Tomar do Geru", territory: "Sul Sergipano", officialElectorate2024: 10890 },
  { name: "Umba\xFAba", territory: "Sul Sergipano", officialElectorate2024: 19870 }
];
var CANONICAL_MUNICIPIOS_POR_TERRITORIO = CANONICAL_SERGIPE_TERRITORIES.reduce((acc, territory) => {
  acc[territory] = CANONICAL_MUNICIPALITIES_DATA.filter((m) => m.territory === territory).map((m) => m.name).sort((a, b) => a.localeCompare("pt-BR"));
  return acc;
}, {});
var CANONICAL_MUNICIPALITY_LOOKUP = /* @__PURE__ */ new Map();
CANONICAL_MUNICIPALITIES_DATA.forEach((m) => {
  const normKey = m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  CANONICAL_MUNICIPALITY_LOOKUP.set(normKey, m);
});
function getCanonicalMunicipality(rawName) {
  if (!rawName) return null;
  const normKey = rawName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  return CANONICAL_MUNICIPALITY_LOOKUP.get(normKey) || null;
}
function getCanonicalTerritoriesData() {
  return CANONICAL_SERGIPE_TERRITORIES.map((territory) => {
    const cities = CANONICAL_MUNICIPIOS_POR_TERRITORIO[territory];
    const pole = CANONICAL_REGIONAL_POLES[territory];
    const totalElectorate = CANONICAL_MUNICIPALITIES_DATA.filter((m) => m.territory === territory).reduce((sum, m) => sum + (m.officialElectorate2024 || 0), 0);
    return {
      name: territory,
      cities,
      citiesCount: cities.length,
      regionalPole: pole,
      totalElectorate
    };
  });
}

// src/utils/fileParser.ts
import * as XLSX from "xlsx";
import Papa from "papaparse";

// src/data/candidatosOficiais2026.ts
var CANDIDATOS_OFICIAIS_2026 = [
  // --- GOVERNADOR (6) ---
  { name: "Dr. Helton", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Governador", number: "50", partyNumber: "50" },
  { name: "Emanuel Cacho", coalition: "FEDERA\xC7\xC3O PSDB CIDADANIA(PSDB/CIDADANIA)", role: "Governador", number: "45", partyNumber: "45" },
  { name: "F\xE1bio", coalition: "SERGIPE CRESCE COM VOC\xCA", role: "Governador", number: "55", partyNumber: "55" },
  { name: "Ricardo Marques", coalition: "F\xC9 E CORAGEM PRA MUDAR.", role: "Governador", number: "22", partyNumber: "22" },
  { name: "Taty Cristina De Jesus", coalition: "DC", role: "Governador", number: "27", partyNumber: "27" },
  { name: "Valmir De Francisquinho", coalition: "MUDA SERGIPE COM A FOR\xC7A DO POVO", role: "Governador", number: "10", partyNumber: "10" },
  // --- SENADOR (11) ---
  { name: "Andr\xE9 Moura", coalition: "SERGIPE CRESCE COM VOC\xCA", role: "Senador", number: "444", partyNumber: "44" },
  { name: "Coronel Rocha", coalition: "F\xC9 E CORAGEM PRA MUDAR", role: "Senador", number: "221", partyNumber: "22" },
  { name: "Delegado Alessandro", coalition: "MDB", role: "Senador", number: "155", partyNumber: "15" },
  { name: "Delegado Andr\xE9 David", coalition: "MUDA SERGIPE COM A FOR\xC7A DO POVO", role: "Senador", number: "101", partyNumber: "10" },
  { name: "Eduardo Amorim", coalition: "MUDA SERGIPE COM A FOR\xC7A DO POVO", role: "Senador", number: "100", partyNumber: "10" },
  { name: "Edvaldo", coalition: "PDT", role: "Senador", number: "123", partyNumber: "12" },
  { name: "Iran Barbosa", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Senador", number: "500", partyNumber: "50" },
  { name: "Paulinho Da Uni\xE3o Tur", coalition: "DC", role: "Senador", number: "270", partyNumber: "27" },
  { name: "Renatinha", coalition: "DC", role: "Senador", number: "277", partyNumber: "27" },
  { name: "Rodrigo Valadares", coalition: "F\xC9 E CORAGEM PRA MUDAR", role: "Senador", number: "222", partyNumber: "22" },
  { name: "Rogerio Carvalho", coalition: "SERGIPE CRESCE COM VOC\xCA", role: "Senador", number: "131", partyNumber: "13" },
  // --- DEPUTADO FEDERAL (108) ---
  { name: "Ac\xE1cio Cardoso", coalition: "FEDERA\xC7\xC3O PSDB CIDADANIA(PSDB/CIDADANIA)", role: "Deputado Federal", number: "4545", partyNumber: "45" },
  { name: "Alberto Macedo", coalition: "REPUBLICANOS", role: "Deputado Federal", number: "1044", partyNumber: "10" },
  { name: "Alessandra Da Ong Pet Aju", coalition: "AVANTE", role: "Deputado Federal", number: "7000", partyNumber: "70" },
  { name: "Alex Pintado", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Federal", number: "4400", partyNumber: "44" },
  { name: "Allan Marques", coalition: "NOVO", role: "Deputado Federal", number: "3033", partyNumber: "30" },
  { name: "Amanda Oliveira", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Federal", number: "4343", partyNumber: "43" },
  { name: "Anderson De Z\xE9 Das Canas", coalition: "PSD", role: "Deputado Federal", number: "5515", partyNumber: "55" },
  { name: "Andr\xE9 Santana", coalition: "PODE", role: "Deputado Federal", number: "2066", partyNumber: "20" },
  { name: "Andr\xE9a Cora\xE7\xE3o Valente", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Federal", number: "1199", partyNumber: "11" },
  { name: "Andresa De Valmir", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Federal", number: "1320", partyNumber: "13" },
  { name: "Angela De Miranda", coalition: "PSB", role: "Deputado Federal", number: "4011", partyNumber: "40" },
  { name: "Bagadal", coalition: "PDT", role: "Deputado Federal", number: "1210", partyNumber: "12" },
  { name: "Beatriz Andrade", coalition: "PDT", role: "Deputado Federal", number: "1200", partyNumber: "12" },
  { name: "Breno Garibalde", coalition: "PSB", role: "Deputado Federal", number: "4004", partyNumber: "40" },
  { name: "Bruna Makida", coalition: "UP", role: "Deputado Federal", number: "8080", partyNumber: "80" },
  { name: "Bruna Teles", coalition: "PDT", role: "Deputado Federal", number: "1222", partyNumber: "12" },
  { name: "Cabo Didi", coalition: "AVANTE", role: "Deputado Federal", number: "7090", partyNumber: "70" },
  { name: "Caju", coalition: "PDT", role: "Deputado Federal", number: "1234", partyNumber: "12" },
  { name: "Cantora Debora Cristiane", coalition: "FEDERA\xC7\xC3O PSDB CIDADANIA(PSDB/CIDADANIA)", role: "Deputado Federal", number: "4577", partyNumber: "45" },
  { name: "Capit\xE3o Samuel", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Federal", number: "4422", partyNumber: "44" },
  { name: "China Da Borracharia", coalition: "MDB", role: "Deputado Federal", number: "1540", partyNumber: "15" },
  { name: "Claudio Luis Apresentador", coalition: "AVANTE", role: "Deputado Federal", number: "7070", partyNumber: "70" },
  { name: "Claudio Mitidieri", coalition: "PSB", role: "Deputado Federal", number: "4040", partyNumber: "40" },
  { name: "Coronel Mano", coalition: "AVANTE", role: "Deputado Federal", number: "7022", partyNumber: "70" },
  { name: "Da\xEDa", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Federal", number: "5000", partyNumber: "50" },
  { name: "Davi", coalition: "MISS\xC3O", role: "Deputado Federal", number: "1414", partyNumber: "14" },
  { name: "Deivisson De Jesus", coalition: "NOVO", role: "Deputado Federal", number: "3012", partyNumber: "30" },
  { name: "Delegada Katarina", coalition: "PSD", role: "Deputado Federal", number: "5505", partyNumber: "55" },
  { name: "Delegado Augusto C\xE9sar", coalition: "PL", role: "Deputado Federal", number: "2201", partyNumber: "22" },
  { name: "Delegado M\xE1rio Leony", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Federal", number: "5050", partyNumber: "50" },
  { name: "Deysy Lima", coalition: "MISS\xC3O", role: "Deputado Federal", number: "1404", partyNumber: "14" },
  { name: "Din\xE1 Almeida", coalition: "PL", role: "Deputado Federal", number: "2277", partyNumber: "22" },
  { name: "Dr Manuel Marcos", coalition: "PSD", role: "Deputado Federal", number: "5511", partyNumber: "55" },
  { name: "Dr. Andre Sotero", coalition: "FEDERA\xC7\xC3O PSDB CIDADANIA(PSDB/CIDADANIA)", role: "Deputado Federal", number: "2323", partyNumber: "23" },
  { name: "Dr. Emerson", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Federal", number: "5019", partyNumber: "50" },
  { name: "Dra Catia Justo", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Federal", number: "6555", partyNumber: "65" },
  { name: "Dra. Cl\xEAcia", coalition: "REPUBLICANOS", role: "Deputado Federal", number: "1077", partyNumber: "10" },
  { name: "Dra. Jeanne Lima", coalition: "FEDERA\xC7\xC3O PSDB CIDADANIA(PSDB/CIDADANIA)", role: "Deputado Federal", number: "2333", partyNumber: "23" },
  { name: "Edileuza S\xE1 Melo", coalition: "NOVO", role: "Deputado Federal", number: "3024", partyNumber: "30" },
  { name: "Elber Batalha", coalition: "PSB", role: "Deputado Federal", number: "4010", partyNumber: "40" },
  { name: "Eliana Da Sopa", coalition: "MDB", role: "Deputado Federal", number: "1577", partyNumber: "15" },
  { name: "Emanuelly Hora", coalition: "REPUBLICANOS", role: "Deputado Federal", number: "1026", partyNumber: "10" },
  { name: "Engenheiro Isaac", coalition: "MISS\xC3O", role: "Deputado Federal", number: "1411", partyNumber: "14" },
  { name: "Everton Souza", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Federal", number: "4313", partyNumber: "43" },
  { name: "Fabiana Santana", coalition: "FEDERA\xC7\xC3O RENOVA\xC7\xC3O SOLID\xC1RIA(25-PRD/77-SOLIDARIEDADE)", role: "Deputado Federal", number: "7707", partyNumber: "77" },
  { name: "F\xE1bio Reis", coalition: "PSD", role: "Deputado Federal", number: "5555", partyNumber: "55" },
  { name: "Felipe De Rocha", coalition: "AGIR", role: "Deputado Federal", number: "3666", partyNumber: "36" },
  { name: "Fiote", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Federal", number: "1112", partyNumber: "11" },
  { name: "Flavio Brasil", coalition: "PSD", role: "Deputado Federal", number: "5523", partyNumber: "55" },
  { name: "Galo Motorista", coalition: "PDT", role: "Deputado Federal", number: "1255", partyNumber: "12" },
  { name: "Gedalva Umbaub\xE1", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Federal", number: "1133", partyNumber: "11" },
  { name: "Gel De Sergipe", coalition: "DC", role: "Deputado Federal", number: "2777", partyNumber: "27" },
  { name: "Genivaldo Campos", coalition: "PODE", role: "Deputado Federal", number: "2030", partyNumber: "20" },
  { name: "Gilmar Da Est\xE2ncia", coalition: "DC", role: "Deputado Federal", number: "2789", partyNumber: "27" },
  { name: "Gilson Eletricista", coalition: "PODE", role: "Deputado Federal", number: "2020", partyNumber: "20" },
  { name: "Giovanna Rocha", coalition: "FEDERA\xC7\xC3O RENOVA\xC7\xC3O SOLID\xC1RIA(25-PRD/77-SOLIDARIEDADE)", role: "Deputado Federal", number: "7777", partyNumber: "77" },
  { name: "Givaldo Silva", coalition: "FEDERA\xC7\xC3O RENOVA\xC7\xC3O SOLID\xC1RIA(25-PRD/77-SOLIDARIEDADE)", role: "Deputado Federal", number: "7733", partyNumber: "77" },
  { name: "Gleidoaldo", coalition: "FEDERA\xC7\xC3O RENOVA\xC7\xC3O SOLID\xC1RIA(25-PRD/77-SOLIDARIEDADE)", role: "Deputado Federal", number: "7766", partyNumber: "77" },
  { name: "Grace Kelly", coalition: "NOVO", role: "Deputado Federal", number: "3001", partyNumber: "30" },
  { name: "Gracinha Garcez", coalition: "REPUBLICANOS", role: "Deputado Federal", number: "1012", partyNumber: "10" },
  { name: "Gustinho Ribeiro", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Federal", number: "1177", partyNumber: "11" },
  { name: "Icaro De Valmir", coalition: "REPUBLICANOS", role: "Deputado Federal", number: "1000", partyNumber: "10" },
  { name: "Igor Baima", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Federal", number: "5013", partyNumber: "50" },
  { name: "Ingrid Oliveira", coalition: "PODE", role: "Deputado Federal", number: "2002", partyNumber: "20" },
  { name: "Irm\xE3 Mabel", coalition: "MDB", role: "Deputado Federal", number: "1515", partyNumber: "15" },
  { name: "Irm\xE3 Micheli", coalition: "DC", role: "Deputado Federal", number: "2727", partyNumber: "27" },
  { name: "Isabel Ferreira", coalition: "PSD", role: "Deputado Federal", number: "5513", partyNumber: "55" },
  { name: "Izabela Morais", coalition: "AGIR", role: "Deputado Federal", number: "3688", partyNumber: "36" },
  { name: "Jeferson Vasco", coalition: "AVANTE", role: "Deputado Federal", number: "7007", partyNumber: "70" },
  { name: "Joao Daniel", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Federal", number: "1311", partyNumber: "13" },
  { name: "Jo\xE3o Marcelo", coalition: "MISS\xC3O", role: "Deputado Federal", number: "1444", partyNumber: "14" },
  { name: "Jonmhara", coalition: "MISS\xC3O", role: "Deputado Federal", number: "1477", partyNumber: "14" },
  { name: "Jornalista Susane Vidal", coalition: "REPUBLICANOS", role: "Deputado Federal", number: "1033", partyNumber: "10" },
  { name: "Juliana Silva M\xE3e At\xEDpica", coalition: "AVANTE", role: "Deputado Federal", number: "7079", partyNumber: "70" },
  { name: "Juliana Vargas", coalition: "PSD", role: "Deputado Federal", number: "5599", partyNumber: "55" },
  { name: "Kel Guimar\xE3es", coalition: "MISS\xC3O", role: "Deputado Federal", number: "1488", partyNumber: "14" },
  { name: "Lene Hall", coalition: "FEDERA\xC7\xC3O RENOVA\xC7\xC3O SOLID\xC1RIA(25-PRD/77-SOLIDARIEDADE)", role: "Deputado Federal", number: "7711", partyNumber: "77" },
  { name: "Levi Oliveira", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Federal", number: "1111", partyNumber: "11" },
  { name: "L\xFAcia Barroso", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Federal", number: "5010", partyNumber: "50" },
  { name: "Luiz Fernando", coalition: "MISS\xC3O", role: "Deputado Federal", number: "1441", partyNumber: "14" },
  { name: "Luiz\xE3o Dona Trampi", coalition: "PL", role: "Deputado Federal", number: "2200", partyNumber: "22" },
  { name: "Mafy De Ygor Gomes", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Federal", number: "1333", partyNumber: "13" },
  { name: "Major Jailson", coalition: "MDB", role: "Deputado Federal", number: "1593", partyNumber: "15" },
  { name: "Marcio Macedo", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Federal", number: "1313", partyNumber: "13" },
  { name: "Marcos Franco", coalition: "PSB", role: "Deputado Federal", number: "4015", partyNumber: "40" },
  { name: "Marcos Romeu", coalition: "DC", role: "Deputado Federal", number: "2788", partyNumber: "27" },
  { name: "Marcos Santana", coalition: "PSB", role: "Deputado Federal", number: "4000", partyNumber: "40" },
  { name: "Maria Concei\xE7\xE3o", coalition: "NOVO", role: "Deputado Federal", number: "3030", partyNumber: "30" },
  { name: "Maria Raimunda", coalition: "DC", role: "Deputado Federal", number: "2722", partyNumber: "27" },
  { name: "Marleide Santos", coalition: "PODE", role: "Deputado Federal", number: "2055", partyNumber: "20" },
  { name: "Marquinhos Fontes", coalition: "FEDERA\xC7\xC3O PSDB CIDADANIA(PSDB/CIDADANIA)", role: "Deputado Federal", number: "4510", partyNumber: "45" },
  { name: "Mateus Henriques", coalition: "UP", role: "Deputado Federal", number: "8000", partyNumber: "80" },
  { name: "Mendon\xE7a Prado", coalition: "PL", role: "Deputado Federal", number: "2210", partyNumber: "22" },
  { name: "Mission\xE1ria Gisele", coalition: "REPUBLICANOS", role: "Deputado Federal", number: "1023", partyNumber: "10" },
  { name: "Moacir Da Ambul\xE2ncia", coalition: "FEDERA\xC7\xC3O RENOVA\xC7\xC3O SOLID\xC1RIA(25-PRD/77-SOLIDARIEDADE)", role: "Deputado Federal", number: "7722", partyNumber: "77" },
  { name: "Moana Valadares", coalition: "PL", role: "Deputado Federal", number: "2222", partyNumber: "22" },
  { name: "Nalldo Amaro", coalition: "PDT", role: "Deputado Federal", number: "1211", partyNumber: "12" },
  { name: "Natali Da Sa\xFAde", coalition: "FEDERA\xC7\xC3O PSDB CIDADANIA(PSDB/CIDADANIA)", role: "Deputado Federal", number: "4555", partyNumber: "45" },
  { name: "Neo Sobral", coalition: "PL", role: "Deputado Federal", number: "2244", partyNumber: "22" },
  { name: "Neto Batalha", coalition: "PSD", role: "Deputado Federal", number: "5588", partyNumber: "55" },
  { name: "Nitinho", coalition: "PSD", role: "Deputado Federal", number: "5577", partyNumber: "55" },
  { name: "Pastor Heleno", coalition: "REPUBLICANOS", role: "Deputado Federal", number: "1010", partyNumber: "10" },
  { name: "Pastora T\xE2nia", coalition: "PDT", role: "Deputado Federal", number: "1236", partyNumber: "12" },
  { name: "Pituxo", coalition: "MDB", role: "Deputado Federal", number: "1555", partyNumber: "15" },
  { name: "Pr. Paulo Roberto", coalition: "PODE", role: "Deputado Federal", number: "2022", partyNumber: "20" },
  { name: "Priscila Cruz", coalition: "MDB", role: "Deputado Federal", number: "1533", partyNumber: "15" },
  { name: "Professor Ayslan", coalition: "MDB", role: "Deputado Federal", number: "1510", partyNumber: "15" },
  { name: "Professor Benizario", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Federal", number: "1390", partyNumber: "13" },
  { name: "Professor Eduardo Pitbull", coalition: "NOVO", role: "Deputado Federal", number: "3022", partyNumber: "30" },
  { name: "Professor Genilton G\xF3is", coalition: "NOVO", role: "Deputado Federal", number: "3011", partyNumber: "30" },
  { name: "Rita Da Sa\xFAde", coalition: "PODE", role: "Deputado Federal", number: "2011", partyNumber: "20" },
  { name: "Robson Viana", coalition: "PSB", role: "Deputado Federal", number: "4056", partyNumber: "40" },
  { name: "Rodrigo Santos", coalition: "MISS\xC3O", role: "Deputado Federal", number: "1400", partyNumber: "14" },
  { name: "Ronadson Alves", coalition: "NOVO", role: "Deputado Federal", number: "3013", partyNumber: "30" },
  { name: "Sargento Silvio", coalition: "PODE", role: "Deputado Federal", number: "2090", partyNumber: "20" },
  { name: "Sargento Vieira", coalition: "PL", role: "Deputado Federal", number: "2233", partyNumber: "22" },
  { name: "Serginho Mendon\xE7a", coalition: "FEDERA\xC7\xC3O RENOVA\xC7\xC3O SOLID\xC1RIA(25-PRD/77-SOLIDARIEDADE)", role: "Deputado Federal", number: "7755", partyNumber: "77" },
  { name: "S\xE9rgio Da Gra\xE7as", coalition: "PODE", role: "Deputado Federal", number: "2077", partyNumber: "20" },
  { name: "Sheyla Galba", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Federal", number: "4420", partyNumber: "44" },
  { name: "Sil Ribeiro", coalition: "MDB", role: "Deputado Federal", number: "1500", partyNumber: "15" },
  { name: "Soares Pinto", coalition: "FEDERA\xC7\xC3O RENOVA\xC7\xC3O SOLID\xC1RIA(25-PRD/77-SOLIDARIEDADE)", role: "Deputado Federal", number: "7700", partyNumber: "77" },
  { name: "Tadeu Taxista", coalition: "FEDERA\xC7\xC3O PSDB CIDADANIA(PSDB/CIDADANIA)", role: "Deputado Federal", number: "4588", partyNumber: "45" },
  { name: "Tamara Gardenia", coalition: "DC", role: "Deputado Federal", number: "2772", partyNumber: "27" },
  { name: "Tathiane Ara\xFAjo", coalition: "PSB", role: "Deputado Federal", number: "4013", partyNumber: "40" },
  { name: "Tati De Vav\xE1 Do Algod\xE3o", coalition: "PSB", role: "Deputado Federal", number: "4055", partyNumber: "40" },
  { name: "Taty Chaves", coalition: "MDB", role: "Deputado Federal", number: "1523", partyNumber: "15" },
  { name: "Thannata Da Equoterapia", coalition: "AVANTE", role: "Deputado Federal", number: "7010", partyNumber: "70" },
  { name: "Thiago De Joaldo", coalition: "REPUBLICANOS", role: "Deputado Federal", number: "1011", partyNumber: "10" },
  { name: "Tininho Estevez", coalition: "AVANTE", role: "Deputado Federal", number: "7077", partyNumber: "70" },
  { name: "Tit\xF3", coalition: "NOVO", role: "Deputado Federal", number: "3000", partyNumber: "30" },
  { name: "Toninho Arimatea", coalition: "AVANTE", role: "Deputado Federal", number: "7055", partyNumber: "70" },
  { name: "Tony Dos Ambulantes", coalition: "FEDERA\xC7\xC3O PSDB CIDADANIA(PSDB/CIDADANIA)", role: "Deputado Federal", number: "4500", partyNumber: "45" },
  { name: "Vagner Gast\xE3o", coalition: "PDT", role: "Deputado Federal", number: "1212", partyNumber: "12" },
  { name: "Vit\xF3ria Pauline", coalition: "PL", role: "Deputado Federal", number: "2255", partyNumber: "22" },
  { name: "Vitoria Sim\xF5es", coalition: "FEDERA\xC7\xC3O RENOVA\xC7\xC3O SOLID\xC1RIA(25-PRD/77-SOLIDARIEDADE)", role: "Deputado Federal", number: "7788", partyNumber: "77" },
  { name: "Waldir Rodrigues", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Federal", number: "6513", partyNumber: "65" },
  { name: "Welington Camargo", coalition: "PL", role: "Deputado Federal", number: "2211", partyNumber: "22" },
  { name: "Yandra Moura", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Federal", number: "4444", partyNumber: "44" },
  { name: "Zoya", coalition: "FEDERA\xC7\xC3O PSDB CIDADANIA(PSDB/CIDADANIA)", role: "Deputado Federal", number: "4522", partyNumber: "45" },
  // --- DEPUTADO ESTADUAL (168) ---
  { name: "Acacia Do Porto Dantas", coalition: "PSB", role: "Deputado Estadual", number: "40333", partyNumber: "40" },
  { name: "Adailton Martins", coalition: "PSD", role: "Deputado Estadual", number: "55123", partyNumber: "55" },
  { name: "Adalto Arag\xE3o", coalition: "PODE", role: "Deputado Estadual", number: "20200", partyNumber: "20" },
  { name: "Adroaldo Alves", coalition: "PSD", role: "Deputado Estadual", number: "55888", partyNumber: "55" },
  { name: "Alan De Mundinho", coalition: "PSB", role: "Deputado Estadual", number: "40123", partyNumber: "40" },
  { name: "Alex Dias Do Santos Dumont", coalition: "AVANTE", role: "Deputado Estadual", number: "70888", partyNumber: "70" },
  { name: "Alice Caroline", coalition: "PSD", role: "Deputado Estadual", number: "55000", partyNumber: "55" },
  { name: "Aline Rezende", coalition: "AVANTE", role: "Deputado Estadual", number: "70770", partyNumber: "70" },
  { name: "Allyson O Sonhador", coalition: "PODE", role: "Deputado Estadual", number: "20444", partyNumber: "20" },
  { name: "Ana Luiza", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10111", partyNumber: "10" },
  { name: "Ana Paula", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13003", partyNumber: "13" },
  { name: "Anderson De Tuca", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44123", partyNumber: "44" },
  { name: "Andre Lucas", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50079", partyNumber: "50" },
  { name: "Andr\xE9a Nascimento", coalition: "AVANTE", role: "Deputado Estadual", number: "70180", partyNumber: "70" },
  { name: "Andriely Souza", coalition: "AVANTE", role: "Deputado Estadual", number: "70231", partyNumber: "70" },
  { name: "Anita Silva", coalition: "PODE", role: "Deputado Estadual", number: "20333", partyNumber: "20" },
  { name: "Anne Couto", coalition: "AVANTE", role: "Deputado Estadual", number: "70444", partyNumber: "70" },
  { name: "Ant\xF4nio Bala", coalition: "MDB", role: "Deputado Estadual", number: "15555", partyNumber: "15" },
  { name: "Apostola Marileide", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13773", partyNumber: "13" },
  { name: "Apostolo Jorge", coalition: "MDB", role: "Deputado Estadual", number: "15101", partyNumber: "15" },
  { name: "Atenilson Jos\xE9", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50113", partyNumber: "50" },
  { name: "Augusto Cesar", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13130", partyNumber: "13" },
  { name: "Ben\xE1ria De Boc\xE3o", coalition: "PL", role: "Deputado Estadual", number: "22022", partyNumber: "22" },
  { name: "Beth Da Sa\xFAde", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10100", partyNumber: "10" },
  { name: "Bispa Waltercya", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "43123", partyNumber: "43" },
  { name: "Bolsonaro Sergipano", coalition: "PL", role: "Deputado Estadual", number: "22322", partyNumber: "22" },
  { name: "Breno Silveira", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10123", partyNumber: "10" },
  { name: "Bruno  Vasconcelos", coalition: "PSD", role: "Deputado Estadual", number: "55456", partyNumber: "55" },
  { name: "C\xE1cio Jeorge", coalition: "PODE", role: "Deputado Estadual", number: "20002", partyNumber: "20" },
  { name: "Camilo Daniel", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13000", partyNumber: "13" },
  { name: "Candisse Carvalho", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13131", partyNumber: "13" },
  { name: "Carlinhos De Brejo Grande", coalition: "PSD", role: "Deputado Estadual", number: "55255", partyNumber: "55" },
  { name: "Catia Modesto", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10789", partyNumber: "10" },
  { name: "Cecilia Marques", coalition: "PL", role: "Deputado Estadual", number: "22222", partyNumber: "22" },
  { name: "Cesar Prado", coalition: "PSB", role: "Deputado Estadual", number: "40444", partyNumber: "40" },
  { name: "Chico Do Correio", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13333", partyNumber: "13" },
  { name: "Clarissa Marques", coalition: "MDB", role: "Deputado Estadual", number: "15234", partyNumber: "15" },
  { name: "Cledson Lima", coalition: "PSB", role: "Deputado Estadual", number: "40888", partyNumber: "40" },
  { name: "Clevson Projeto Bike Roubada", coalition: "PL", role: "Deputado Estadual", number: "22888", partyNumber: "22" },
  { name: "Coronel Fabio", coalition: "PL", role: "Deputado Estadual", number: "22122", partyNumber: "22" },
  { name: "Coronel Lino", coalition: "AVANTE", role: "Deputado Estadual", number: "70888", partyNumber: "70" },
  { name: "Coronel Pontual", coalition: "PL", role: "Deputado Estadual", number: "22190", partyNumber: "22" },
  { name: "Coronel Ribeiro", coalition: "PSD", role: "Deputado Estadual", number: "55190", partyNumber: "55" },
  { name: "Cristiano Cavalcante", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44444", partyNumber: "44" },
  { name: "Cristina Brand\xE3o", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10001", partyNumber: "10" },
  { name: "Crys Moura", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "11555", partyNumber: "11" },
  { name: "Da Luz", coalition: "PSB", role: "Deputado Estadual", number: "40999", partyNumber: "40" },
  { name: "Daniel Do Esporte", coalition: "PSB", role: "Deputado Estadual", number: "40345", partyNumber: "40" },
  { name: "Delegada Danielle", coalition: "MDB", role: "Deputado Estadual", number: "15190", partyNumber: "15" },
  { name: "Delegado Clever Farias", coalition: "PSB", role: "Deputado Estadual", number: "40222", partyNumber: "40" },
  { name: "Delegado Marcelo Paes", coalition: "PL", role: "Deputado Estadual", number: "22111", partyNumber: "22" },
  { name: "Diego Seo Chico", coalition: "PSD", role: "Deputado Estadual", number: "55100", partyNumber: "55" },
  { name: "Dona Anna", coalition: "MDB", role: "Deputado Estadual", number: "15398", partyNumber: "15" },
  { name: "Doutor Wellington Do Tea", coalition: "AVANTE", role: "Deputado Estadual", number: "70079", partyNumber: "70" },
  { name: "Dr Emanuel Matias", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13189", partyNumber: "13" },
  { name: "Dr Sandro Andr\xE9", coalition: "PODE", role: "Deputado Estadual", number: "20777", partyNumber: "20" },
  { name: "Dr Sarmento", coalition: "PSB", role: "Deputado Estadual", number: "40040", partyNumber: "40" },
  { name: "Dr. Gilm\xE1rcio", coalition: "PODE", role: "Deputado Estadual", number: "20999", partyNumber: "20" },
  { name: "Dr. Gilson Andrade", coalition: "MDB", role: "Deputado Estadual", number: "15111", partyNumber: "15" },
  { name: "Dra C\xEDcera Renovatto", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10079", partyNumber: "10" },
  { name: "Dra Leyla Paix\xE3o", coalition: "PSB", role: "Deputado Estadual", number: "40777", partyNumber: "40" },
  { name: "Dra Lidiane Lucena", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44000", partyNumber: "44" },
  { name: "Dra Lylian", coalition: "PODE", role: "Deputado Estadual", number: "20100", partyNumber: "20" },
  { name: "Dra Rayza", coalition: "PL", role: "Deputado Estadual", number: "22777", partyNumber: "22" },
  { name: "Dra. Catarina", coalition: "PL", role: "Deputado Estadual", number: "22555", partyNumber: "22" },
  { name: "Dra. Teresa Neuma", coalition: "PODE", role: "Deputado Estadual", number: "20555", partyNumber: "20" },
  { name: "Eder Matos", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50631", partyNumber: "50" },
  { name: "Edson Junior", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13777", partyNumber: "13" },
  { name: "Eduardo Do T\xEAnis", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10222", partyNumber: "10" },
  { name: "Eli Aciole", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "11111", partyNumber: "11" },
  { name: "Elton Da Enfermagem", coalition: "PODE", role: "Deputado Estadual", number: "20199", partyNumber: "20" },
  { name: "Enfermeira Gabryella Garibalde", coalition: "PSD", role: "Deputado Estadual", number: "55444", partyNumber: "55" },
  { name: "Enfermeira V\xE2nia", coalition: "MDB", role: "Deputado Estadual", number: "15888", partyNumber: "15" },
  { name: "Enfermeiro M\xE1rcio", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "11123", partyNumber: "11" },
  { name: "Espa\xE7o Quilombola", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50100", partyNumber: "50" },
  { name: "Euquias Correia Pastorz\xE3o", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10300", partyNumber: "10" },
  { name: "Everaldo Vieira", coalition: "AVANTE", role: "Deputado Estadual", number: "70123", partyNumber: "70" },
  { name: "F\xE1bio Henrique", coalition: "MDB", role: "Deputado Estadual", number: "15500", partyNumber: "15" },
  { name: "F\xE1tima Bernardo", coalition: "PODE", role: "Deputado Estadual", number: "20345", partyNumber: "20" },
  { name: "Felipe Duarte", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "11079", partyNumber: "11" },
  { name: "Fernandinho Franco", coalition: "PL", role: "Deputado Estadual", number: "22200", partyNumber: "22" },
  { name: "Filipe De Dr. Jocelino", coalition: "MDB", role: "Deputado Estadual", number: "15600", partyNumber: "15" },
  { name: "Firmo", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "65123", partyNumber: "65" },
  { name: "Fl\xE1vio Da Direita Sergipana", coalition: "PL", role: "Deputado Estadual", number: "22100", partyNumber: "22" },
  { name: "Francisco Gualberto", coalition: "PSB", role: "Deputado Estadual", number: "40300", partyNumber: "40" },
  { name: "Frei Edson Luiz", coalition: "AVANTE", role: "Deputado Estadual", number: "70570", partyNumber: "70" },
  { name: "Gabriel D\xE9da", coalition: "PL", role: "Deputado Estadual", number: "22456", partyNumber: "22" },
  { name: "Gabriel Teles", coalition: "MDB", role: "Deputado Estadual", number: "15222", partyNumber: "15" },
  { name: "Gaguinha De Ilh\xE9us", coalition: "AVANTE", role: "Deputado Estadual", number: "70170", partyNumber: "70" },
  { name: "Garibalde", coalition: "MDB", role: "Deputado Estadual", number: "15000", partyNumber: "15" },
  { name: "Georgeo Passos", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10777", partyNumber: "10" },
  { name: "Gibran", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "11000", partyNumber: "11" },
  { name: "Gil Da Sa\xFAde", coalition: "PSD", role: "Deputado Estadual", number: "55192", partyNumber: "55" },
  { name: "Gildo De Boquim", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50333", partyNumber: "50" },
  { name: "Gilson Dos Anjos", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44333", partyNumber: "44" },
  { name: "Giovanni Oliveira", coalition: "UP", role: "Deputado Estadual", number: "80800", partyNumber: "80" },
  { name: "Givaldo Gar\xE7\xE3o", coalition: "MDB", role: "Deputado Estadual", number: "15192", partyNumber: "15" },
  { name: "Gleiton Medeiros", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10456", partyNumber: "10" },
  { name: "Gugu Liberato", coalition: "AVANTE", role: "Deputado Estadual", number: "70280", partyNumber: "70" },
  { name: "Halaerio Do Povo", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10144", partyNumber: "10" },
  { name: "Hilda Ribeiro", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "11777", partyNumber: "11" },
  { name: "Ibrain De Valmir", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "43000", partyNumber: "43" },
  { name: "Idalino", coalition: "MDB", role: "Deputado Estadual", number: "15300", partyNumber: "15" },
  { name: "Ira\xEDlton Matias", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44200", partyNumber: "44" },
  { name: "Itamar Alves", coalition: "PL", role: "Deputado Estadual", number: "22522", partyNumber: "22" },
  { name: "Jeferson Souza", coalition: "PODE", role: "Deputado Estadual", number: "20000", partyNumber: "20" },
  { name: "Jej\xEA Produ\xE7\xF5es", coalition: "MDB", role: "Deputado Estadual", number: "15333", partyNumber: "15" },
  { name: "Jessica De Dona Vera", coalition: "PL", role: "Deputado Estadual", number: "22822", partyNumber: "22" },
  { name: "J\xF4 Do Mosqueiro", coalition: "PODE", role: "Deputado Estadual", number: "20567", partyNumber: "20" },
  { name: "Joel Fernandes Cantor Camel\xF4", coalition: "PODE", role: "Deputado Estadual", number: "20120", partyNumber: "20" },
  { name: "Jorginho Araujo", coalition: "PSD", role: "Deputado Estadual", number: "55777", partyNumber: "55" },
  { name: "Josivaldo Da Equoterapia", coalition: "PL", role: "Deputado Estadual", number: "22789", partyNumber: "22" },
  { name: "Juarez Veterin\xE1rio", coalition: "AVANTE", role: "Deputado Estadual", number: "70000", partyNumber: "70" },
  { name: "J\xFAnior De Diogenes", coalition: "AVANTE", role: "Deputado Estadual", number: "70777", partyNumber: "70" },
  { name: "J\xFAnior Lima", coalition: "PODE", role: "Deputado Estadual", number: "20222", partyNumber: "20" },
  { name: "Kak\xE1 Santos", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44555", partyNumber: "44" },
  { name: "Keno Almeida", coalition: "AVANTE", role: "Deputado Estadual", number: "70500", partyNumber: "70" },
  { name: "Kitty Lima", coalition: "PSB", role: "Deputado Estadual", number: "40400", partyNumber: "40" },
  { name: "Larissa Trindade", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13600", partyNumber: "13" },
  { name: "Layse Santiago", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44044", partyNumber: "44" },
  { name: "L\xE9a Sobral", coalition: "PSB", role: "Deputado Estadual", number: "40789", partyNumber: "40" },
  { name: "Linda Brasil", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50180", partyNumber: "50" },
  { name: "Lucas Meneses", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "11333", partyNumber: "11" },
  { name: "Luciana D\xE9da", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10013", partyNumber: "10" },
  { name: "Luciano Bispo", coalition: "PSD", role: "Deputado Estadual", number: "55015", partyNumber: "55" },
  { name: "Luciano Pimentel", coalition: "PL", role: "Deputado Estadual", number: "22123", partyNumber: "22" },
  { name: "Luiz Santana", coalition: "PSB", role: "Deputado Estadual", number: "40800", partyNumber: "40" },
  { name: "Magna Moura", coalition: "PSB", role: "Deputado Estadual", number: "40192", partyNumber: "40" },
  { name: "Maisa Mitidieri", coalition: "PSD", role: "Deputado Estadual", number: "55555", partyNumber: "55" },
  { name: "Mara Siqueira", coalition: "PL", role: "Deputado Estadual", number: "22002", partyNumber: "22" },
  { name: "Marcel Da Enfermagem", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44321", partyNumber: "44" },
  { name: "Marcell De Maim", coalition: "PSD", role: "Deputado Estadual", number: "55111", partyNumber: "55" },
  { name: "Marcelo Sobral", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44111", partyNumber: "44" },
  { name: "Marcos Couto Rep\xF3rter", coalition: "AVANTE", role: "Deputado Estadual", number: "70999", partyNumber: "70" },
  { name: "Marcos Oliveira", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10000", partyNumber: "10" },
  { name: "Marcos Rocha Seguran\xE7a Privada", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10357", partyNumber: "10" },
  { name: "Maria M\xE1rcia", coalition: "PODE", role: "Deputado Estadual", number: "20019", partyNumber: "20" },
  { name: "Maria Pedrita", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "43333", partyNumber: "43" },
  { name: "Maria Salvador", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50777", partyNumber: "50" },
  { name: "Mariana Dantas", coalition: "MDB", role: "Deputado Estadual", number: "15123", partyNumber: "15" },
  { name: "Mariana Servente", coalition: "PODE", role: "Deputado Estadual", number: "20190", partyNumber: "20" },
  { name: "Marilu", coalition: "MDB", role: "Deputado Estadual", number: "15700", partyNumber: "15" },
  { name: "Matheus Corr\xEAa", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10333", partyNumber: "10" },
  { name: "Maura De Bibi", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13800", partyNumber: "13" },
  { name: "Messias Cavalcante", coalition: "AVANTE", role: "Deputado Estadual", number: "70022", partyNumber: "70" },
  { name: "Nego Do Matuto", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10888", partyNumber: "10" },
  { name: "Nelson Ara\xFAjo", coalition: "AVANTE", role: "Deputado Estadual", number: "70333", partyNumber: "70" },
  { name: "Netinho Guimar\xE3es", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44777", partyNumber: "44" },
  { name: "Nicinha Chagas", coalition: "PODE", role: "Deputado Estadual", number: "20180", partyNumber: "20" },
  { name: "Nina Gomes", coalition: "PSB", role: "Deputado Estadual", number: "40600", partyNumber: "40" },
  { name: "Nivalda Gon\xE7alves", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "11800", partyNumber: "11" },
  { name: "Nivaldo Da Bala", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10666", partyNumber: "10" },
  { name: "Norberto Pinto", coalition: "AVANTE", role: "Deputado Estadual", number: "70456", partyNumber: "70" },
  { name: "N\xFAbia Lopes", coalition: "PSB", role: "Deputado Estadual", number: "40555", partyNumber: "40" },
  { name: "Padre Inaldo", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13555", partyNumber: "13" },
  { name: "Pastor Diego", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44744", partyNumber: "44" },
  { name: "Pastor Jadson Alves", coalition: "AVANTE", role: "Deputado Estadual", number: "70370", partyNumber: "70" },
  { name: "Pastor Marcos", coalition: "MDB", role: "Deputado Estadual", number: "15200", partyNumber: "15" },
  { name: "Pastora F\xE1bia Valadares", coalition: "MDB", role: "Deputado Estadual", number: "15999", partyNumber: "15" },
  { name: "Pato Maravilha", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44222", partyNumber: "44" },
  { name: "Paulo Jr", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "43777", partyNumber: "43" },
  { name: "Peter Costa", coalition: "PL", role: "Deputado Estadual", number: "22007", partyNumber: "22" },
  { name: "Pinha Motos", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10122", partyNumber: "10" },
  { name: "Pr. Daniel Oliveira", coalition: "PODE", role: "Deputado Estadual", number: "20012", partyNumber: "20" },
  { name: "Pr. Z\xE9 Carlos Viera", coalition: "PODE", role: "Deputado Estadual", number: "20123", partyNumber: "20" },
  { name: "Pricila Carvalho", coalition: "AVANTE", role: "Deputado Estadual", number: "70555", partyNumber: "70" },
  { name: "Pripri Do Povo", coalition: "PL", role: "Deputado Estadual", number: "22300", partyNumber: "22" },
  { name: "Prof. David Soares", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10166", partyNumber: "10" },
  { name: "Professor Bispo", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13111", partyNumber: "13" },
  { name: "Professor Bonfim", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10010", partyNumber: "10" },
  { name: "Professor Chicao", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13123", partyNumber: "13" },
  { name: "Professor Dudu", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13900", partyNumber: "13" },
  { name: "Professor Luciano", coalition: "MDB", role: "Deputado Estadual", number: "15777", partyNumber: "15" },
  { name: "Professor Ot\xE1vio Sales", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50500", partyNumber: "50" },
  { name: "Professora Avilete", coalition: "PL", role: "Deputado Estadual", number: "22221", partyNumber: "22" },
  { name: "Professora Claudiceia", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "65555", partyNumber: "65" },
  { name: "Professora S\xF4nia Meire", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50123", partyNumber: "50" },
  { name: "Ricardo Ribeiro Da Energia", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50555", partyNumber: "50" },
  { name: "Rob\xE9rio Batista", coalition: "PODE", role: "Deputado Estadual", number: "20192", partyNumber: "20" },
  { name: "Rosa Carvalho", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44445", partyNumber: "44" },
  { name: "Rosa De Tei\xFA", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10223", partyNumber: "10" },
  { name: "Rosa Reis", coalition: "MDB", role: "Deputado Estadual", number: "15130", partyNumber: "15" },
  { name: "Ros\xE2ngela Da Barra", coalition: "PSB", role: "Deputado Estadual", number: "40446", partyNumber: "40" },
  { name: "Rose Do Mlb", coalition: "UP", role: "Deputado Estadual", number: "80123", partyNumber: "80" },
  { name: "Samira Daud", coalition: "PSD", role: "Deputado Estadual", number: "55200", partyNumber: "55" },
  { name: "Sandra Ciganinha", coalition: "PSD", role: "Deputado Estadual", number: "55713", partyNumber: "55" },
  { name: "Sargento M. Filho", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10190", partyNumber: "10" },
  { name: "Sergio Sampaio", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50000", partyNumber: "50" },
  { name: "S\xE9rgio Santana", coalition: "PODE", role: "Deputado Estadual", number: "20020", partyNumber: "20" },
  { name: "Sgt Alex Lima", coalition: "AVANTE", role: "Deputado Estadual", number: "70190", partyNumber: "70" },
  { name: "Sgt Naldinho", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "11190", partyNumber: "11" },
  { name: "Sheila Matos", coalition: "PL", role: "Deputado Estadual", number: "22333", partyNumber: "22" },
  { name: "Sidiclei Fonseca", coalition: "PSD", role: "Deputado Estadual", number: "55999", partyNumber: "55" },
  { name: "Sidney Rocha", coalition: "AVANTE", role: "Deputado Estadual", number: "70111", partyNumber: "70" },
  { name: "Simone Linhares", coalition: "PODE", role: "Deputado Estadual", number: "20456", partyNumber: "20" },
  { name: "Souza Da Enfermagem", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "43456", partyNumber: "43" },
  { name: "Tacy Queiroz", coalition: "AVANTE", role: "Deputado Estadual", number: "70700", partyNumber: "70" },
  { name: "Tarc\xEDsio Da Nct", coalition: "PL", role: "Deputado Estadual", number: "22000", partyNumber: "22" },
  { name: "Tatiane Da Seguran\xE7a", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10700", partyNumber: "10" },
  { name: "Tenente Coronel Manuela", coalition: "AVANTE", role: "Deputado Estadual", number: "70789", partyNumber: "70" },
  { name: "Tia Cl\xE9o", coalition: "MDB", role: "Deputado Estadual", number: "15100", partyNumber: "15" },
  { name: "Tia Gleide", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10200", partyNumber: "10" },
  { name: "Tiago Rangel", coalition: "PODE", role: "Deputado Estadual", number: "20111", partyNumber: "20" },
  { name: "Val Serra", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44789", partyNumber: "44" },
  { name: "Valdson", coalition: "PODE", role: "Deputado Estadual", number: "20888", partyNumber: "20" },
  { name: "Valdson Costa", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "11222", partyNumber: "11" },
  { name: "Val\xE9ria Da Cabana", coalition: "PSB", role: "Deputado Estadual", number: "40100", partyNumber: "40" },
  { name: "Vanessa Do Povo", coalition: "FEDERA\xC7\xC3O PSOL REDE(PSOL/REDE)", role: "Deputado Estadual", number: "50121", partyNumber: "50" },
  { name: "Vanuza Filha De Boca Rica", coalition: "AVANTE", role: "Deputado Estadual", number: "70270", partyNumber: "70" },
  { name: "Ven\xE2ncio Fonseca", coalition: "PSB", role: "Deputado Estadual", number: "40111", partyNumber: "40" },
  { name: "Vf - Vanilton Francisco", coalition: "PL", role: "Deputado Estadual", number: "22444", partyNumber: "22" },
  { name: "Vivi Docinho", coalition: "FEDERA\xC7\xC3O UNI\xC3O PROGRESSISTA(44-UNI\xC3O/11-PP)", role: "Deputado Estadual", number: "44177", partyNumber: "44" },
  { name: "Vovozinho", coalition: "AVANTE", role: "Deputado Estadual", number: "70870", partyNumber: "70" },
  { name: "Wendell Oliveira", coalition: "REPUBLICANOS", role: "Deputado Estadual", number: "10999", partyNumber: "10" },
  { name: "Z\xE9 Marques", coalition: "PODE", role: "Deputado Estadual", number: "20202", partyNumber: "20" },
  { name: "Ze Nelson", coalition: "FEDERA\xC7\xC3O BRASIL DA ESPERAN\xC7A - FE BRASIL(PT/PC do B/PV)", role: "Deputado Estadual", number: "13133", partyNumber: "13" },
  { name: "Zezinho Sobral", coalition: "PSB", role: "Deputado Estadual", number: "40000", partyNumber: "40" },
  { name: "Zominho", coalition: "AVANTE", role: "Deputado Estadual", number: "70222", partyNumber: "70" }
];

// src/data/sergipeData.ts
var SERGIPE_MUNICIPIOS_INFO = CANONICAL_MUNICIPALITIES_DATA.map((m) => ({
  nome: m.name,
  territorio: m.territory,
  poloRegional: !!m.isRegionalPole
}));
var PAST_WINNERS_2022 = {
  "Aracaju": "F\xE1bio Mitidieri",
  "Barra dos Coqueiros": "Rog\xE9rio Carvalho",
  "Itaporanga d'Ajuda": "F\xE1bio Mitidieri",
  "Laranjeiras": "F\xE1bio Mitidieri",
  "Maruim": "F\xE1bio Mitidieri",
  "Nossa Senhora do Socorro": "Rog\xE9rio Carvalho",
  "Riachuelo": "Rog\xE9rio Carvalho",
  "S\xE3o Crist\xF3v\xE3o": "F\xE1bio Mitidieri",
  "Itabaiana": "Valmir de Francisquinho",
  "Campo do Brito": "Valmir de Francisquinho",
  "Carira": "Valmir de Francisquinho",
  "Frei Paulo": "F\xE1bio Mitidieri",
  "Macambira": "Valmir de Francisquinho",
  "Moita Bonita": "Valmir de Francisquinho",
  "Pinh\xE3o": "Valmir de Francisquinho",
  "Ribeir\xF3polis": "Valmir de Francisquinho",
  "S\xE3o Domingos": "Valmir de Francisquinho",
  "Areia Branca": "F\xE1bio Mitidieri",
  "Malhador": "F\xE1bio Mitidieri",
  "Pedra Mole": "F\xE1bio Mitidieri",
  "S\xE3o Miguel do Aleixo": "F\xE1bio Mitidieri",
  "Nossa Senhora Aparecida": "F\xE1bio Mitidieri",
  "Lagarto": "F\xE1bio Mitidieri",
  "Sim\xE3o Dias": "F\xE1bio Mitidieri",
  "Tobias Barreto": "F\xE1bio Mitidieri",
  "Po\xE7o Verde": "Rog\xE9rio Carvalho",
  "Riach\xE3o do Dantas": "F\xE1bio Mitidieri",
  "Nossa Senhora da Gl\xF3ria": "F\xE1bio Mitidieri",
  "Porto da Folha": "Rog\xE9rio Carvalho",
  "Canind\xE9 de S\xE3o Francisco": "Rog\xE9rio Carvalho",
  "Po\xE7o Redondo": "Rog\xE9rio Carvalho",
  "Monte Alegre de Sergipe": "F\xE1bio Mitidieri",
  "Gararu": "Rog\xE9rio Carvalho",
  "Nossa Senhora de Lourdes": "F\xE1bio Mitidieri",
  "Est\xE2ncia": "F\xE1bio Mitidieri",
  "Itabaianinha": "F\xE1bio Mitidieri",
  "Umba\xFAba": "F\xE1bio Mitidieri",
  "Cristin\xE1polis": "F\xE1bio Mitidieri",
  "Indiaroba": "F\xE1bio Mitidieri",
  "Santa Luzia do Itanhy": "Rog\xE9rio Carvalho",
  "Arau\xE1": "F\xE1bio Mitidieri",
  "Boquim": "F\xE1bio Mitidieri",
  "Pedrinhas": "F\xE1bio Mitidieri",
  "Tomar do Geru": "F\xE1bio Mitidieri",
  "Salgado": "F\xE1bio Mitidieri",
  "Propri\xE1": "Rog\xE9rio Carvalho",
  "Ne\xF3polis": "F\xE1bio Mitidieri",
  "Pacatuba": "Rog\xE9rio Carvalho",
  "Japoat\xE3": "Rog\xE9rio Carvalho",
  "Brejo Grande": "Rog\xE9rio Carvalho",
  "Ilha das Flores": "Rog\xE9rio Carvalho",
  "Santana do S\xE3o Francisco": "Rog\xE9rio Carvalho",
  "Amparo de S\xE3o Francisco": "F\xE1bio Mitidieri",
  "Canhoba": "Rog\xE9rio Carvalho",
  "Cedro de S\xE3o Jo\xE3o": "F\xE1bio Mitidieri",
  "Muribeca": "Rog\xE9rio Carvalho",
  "S\xE3o Francisco": "F\xE1bio Mitidieri",
  "Telha": "Rog\xE9rio Carvalho",
  "Malhada dos Bois": "F\xE1bio Mitidieri",
  "Aquidab\xE3": "F\xE1bio Mitidieri",
  "Nossa Senhora das Dores": "F\xE1bio Mitidieri",
  "Feira Nova": "F\xE1bio Mitidieri",
  "Graccho Cardoso": "Rog\xE9rio Carvalho",
  "Itabi": "F\xE1bio Mitidieri",
  "Cumbe": "F\xE1bio Mitidieri",
  "Capela": "F\xE1bio Mitidieri",
  "Carm\xF3polis": "F\xE1bio Mitidieri",
  "Japaratuba": "F\xE1bio Mitidieri",
  "Pirambu": "Rog\xE9rio Carvalho",
  "Ros\xE1rio do Catete": "F\xE1bio Mitidieri",
  "General Maynard": "F\xE1bio Mitidieri",
  "Santa Rosa de Lima": "F\xE1bio Mitidieri",
  "Siriri": "F\xE1bio Mitidieri",
  "Divina Pastora": "F\xE1bio Mitidieri",
  "Santo Amaro das Brotas": "F\xE1bio Mitidieri"
};
var SERGIPE_MUNICIPALITIES = CANONICAL_MUNICIPALITIES_DATA.map((m) => ({
  name: m.name,
  territory: m.territory,
  voters: m.officialElectorate2024 || 1e4,
  pastWinner2022: PAST_WINNERS_2022[m.name] || "F\xE1bio Mitidieri"
}));

// src/utils/dateFormatter.ts
function formatDateBR(dateInput) {
  if (!dateInput) return "\u2014";
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return "\u2014";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }
    const isoDateMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoDateMatch) {
      const year = isoDateMatch[1];
      const month = isoDateMatch[2].padStart(2, "0");
      const day = isoDateMatch[3].padStart(2, "0");
      return `${day}/${month}/${year}`;
    }
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
    if (isNaN(d.getTime())) return typeof dateInput === "string" ? dateInput : "\u2014";
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    });
  } catch {
    return typeof dateInput === "string" ? dateInput : "\u2014";
  }
}

// src/utils/fileParser.ts
function normalizeStr(str) {
  if (!str) return "";
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}
var PT_MONTHS_MAP = {
  "janeiro": 1,
  "jan": 1,
  "fevereiro": 2,
  "fev": 2,
  "marco": 3,
  "mar\xE7o": 3,
  "mar": 3,
  "abril": 4,
  "abr": 4,
  "maio": 5,
  "mai": 5,
  "junho": 6,
  "jun": 6,
  "julho": 7,
  "jul": 7,
  "agosto": 8,
  "ago": 8,
  "setembro": 9,
  "set": 9,
  "outubro": 10,
  "out": 10,
  "novembro": 11,
  "nov": 11,
  "dezembro": 12,
  "dez": 12
};
function computeMedianDate(startStr, endStr) {
  try {
    const s = new Date(startStr.includes("T") ? startStr : startStr + "T12:00:00");
    const e = new Date(endStr.includes("T") ? endStr : endStr + "T12:00:00");
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const midTime = s.getTime() + (e.getTime() - s.getTime()) / 2;
      const mid = new Date(midTime);
      const y = mid.getFullYear();
      const m = String(mid.getMonth() + 1).padStart(2, "0");
      const d = String(mid.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  } catch {
  }
  return startStr || endStr;
}
function parseFlexibleDate(value) {
  if (value === null || value === void 0 || value === "") return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const y = value.getFullYear();
    if (y < 1990 || y > 2040) return null;
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof value === "number") {
    if (isNaN(value) || value <= 0) return null;
    if (value >= 25e3 && value <= 8e4) {
      const jsDate = new Date(Math.round((value - 25569) * 86400 * 1e3));
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getUTCFullYear();
        if (y >= 1990 && y <= 2040) {
          const m = String(jsDate.getUTCMonth() + 1).padStart(2, "0");
          const d = String(jsDate.getUTCDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
      }
    }
    if (value > 9466848e5 && value < 25e11) {
      const jsDate = new Date(value);
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getFullYear();
        if (y >= 1990 && y <= 2040) {
          const m = String(jsDate.getMonth() + 1).padStart(2, "0");
          const d = String(jsDate.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
      }
    }
    if (value > 946684800 && value < 25e8) {
      const jsDate = new Date(value * 1e3);
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getFullYear();
        if (y >= 1990 && y <= 2040) {
          const m = String(jsDate.getMonth() + 1).padStart(2, "0");
          const d = String(jsDate.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
      }
    }
    return null;
  }
  const str = String(value).trim();
  if (!str || str === "0" || str === "00:00:00" || str === "1970-01-01" || str.startsWith("1970")) {
    return null;
  }
  if (/^\d{5}(\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    if (num >= 25e3 && num <= 8e4) {
      const jsDate = new Date(Math.round((num - 25569) * 86400 * 1e3));
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getUTCFullYear();
        if (y >= 1990 && y <= 2040) {
          const m = String(jsDate.getUTCMonth() + 1).padStart(2, "0");
          const d = String(jsDate.getUTCDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
      }
    }
  }
  const isoMatch = str.match(/(\b\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (y >= 1990 && y <= 2040 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }
  const brMatch = str.match(/(\b\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/);
  if (brMatch) {
    const d = parseInt(brMatch[1], 10);
    const m = parseInt(brMatch[2], 10);
    let y = parseInt(brMatch[3], 10);
    if (y < 100) y += 2e3;
    if (y >= 1990 && y <= 2040 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }
  const normLower = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const ptTextMatch = normLower.match(/(\b\d{1,2})\s*(?:de|\-|\/|\s)\s*([a-z]{3,9})\s*(?:de|\-|\/|\s)?\s*(\d{2,4})\b/);
  if (ptTextMatch) {
    const d = parseInt(ptTextMatch[1], 10);
    const monthKey = ptTextMatch[2];
    let y = parseInt(ptTextMatch[3], 10);
    if (y < 100) y += 2e3;
    const m = PT_MONTHS_MAP[monthKey] || Object.entries(PT_MONTHS_MAP).find(([k]) => monthKey.startsWith(k))?.[1];
    if (m && y >= 1990 && y <= 2040 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }
  const ptMonthYearMatch = normLower.match(/([a-z]{3,9})\s*(?:de|\-|\/|\s)\s*(\d{4})\b/);
  if (ptMonthYearMatch) {
    const monthKey = ptMonthYearMatch[1];
    const y = parseInt(ptMonthYearMatch[2], 10);
    const m = PT_MONTHS_MAP[monthKey] || Object.entries(PT_MONTHS_MAP).find(([k]) => monthKey.startsWith(k))?.[1];
    if (m && y >= 1990 && y <= 2040) {
      return `${y}-${String(m).padStart(2, "0")}-15`;
    }
  }
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      if (y >= 1990 && y <= 2040) {
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    }
  } catch {
  }
  return null;
}
function parseDateRange(value) {
  if (!value) return { start: null, end: null, median: null };
  const str = String(value).trim();
  const normLower = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const rangePattern1 = normLower.match(/(\b\d{1,2})\s*(?:a|ate|-|\/)\s*(\d{1,2})\s*(?:de|\/|-|\s)\s*([a-z0-9]+)\s*(?:de|\/|-|\s)?\s*(\d{2,4})?/);
  if (rangePattern1) {
    const d1 = parseInt(rangePattern1[1], 10);
    const d2 = parseInt(rangePattern1[2], 10);
    const mStr = rangePattern1[3];
    let y = rangePattern1[4] ? parseInt(rangePattern1[4], 10) : 2026;
    if (y < 100) y += 2e3;
    const m = /^\d+$/.test(mStr) ? parseInt(mStr, 10) : PT_MONTHS_MAP[mStr];
    if (m && m >= 1 && m <= 12 && d1 >= 1 && d1 <= 31 && d2 >= 1 && d2 <= 31) {
      const start = `${y}-${String(m).padStart(2, "0")}-${String(d1).padStart(2, "0")}`;
      const end = `${y}-${String(m).padStart(2, "0")}-${String(d2).padStart(2, "0")}`;
      return { start, end, median: computeMedianDate(start, end) };
    }
  }
  const twoDatesMatch = str.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s*(?:a|ate|-|to)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if (twoDatesMatch) {
    const start = parseFlexibleDate(twoDatesMatch[1]);
    const end = parseFlexibleDate(twoDatesMatch[2]);
    if (start && end) {
      return { start, end, median: computeMedianDate(start, end) };
    }
  }
  const single = parseFlexibleDate(str);
  if (single) {
    return { start: single, end: single, median: single };
  }
  return { start: null, end: null, median: null };
}
function extractFieldworkPeriodFromRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { fieldworkStart: "", fieldworkEnd: "", formattedRange: "\u2014", hasValidDates: false };
  }
  const firstRow = rows[0] || {};
  const headerKeys = Object.keys(firstRow);
  let targetColKey = headerKeys.find((k) => {
    const norm = normalizeStr(k);
    return norm === "inicio da entrevista" || norm === "iniciodaentrevista" || norm === "inicio entrevista" || norm === "inicio da coleta" || norm === "iniciodacoleta" || norm === "data da entrevista" || norm === "datadacoleta" || norm === "data da coleta";
  });
  if (!targetColKey) {
    targetColKey = headerKeys.find((k) => {
      const norm = normalizeStr(k);
      return norm.includes("inicio") || norm.includes("entrevista") || norm.includes("coleta") || norm.includes("data");
    });
  }
  const validDates = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || typeof row !== "object") continue;
    let rawVal = targetColKey ? row[targetColKey] : void 0;
    if (rawVal === void 0 || rawVal === null || rawVal === "") {
      for (const [k, v] of Object.entries(row)) {
        const norm = normalizeStr(k);
        if (norm.includes("inicio") || norm.includes("entrevista") || norm.includes("coleta") || norm.includes("data")) {
          const parsed = parseFlexibleDate(v);
          if (parsed) {
            validDates.push(parsed);
            break;
          }
        }
      }
    } else {
      const parsed = parseFlexibleDate(rawVal);
      if (parsed) {
        validDates.push(parsed);
      }
    }
  }
  if (validDates.length === 0) {
    return { fieldworkStart: "", fieldworkEnd: "", formattedRange: "\u2014", hasValidDates: false };
  }
  validDates.sort();
  const minDate = validDates[0];
  const maxDate = validDates[validDates.length - 1];
  const formattedStart = formatDateBR(minDate);
  const formattedEnd = formatDateBR(maxDate);
  const formattedRange = minDate === maxDate ? formattedStart : `${formattedStart} a ${formattedEnd}`;
  return {
    fieldworkStart: minDate,
    fieldworkEnd: maxDate,
    formattedRange,
    hasValidDates: true
  };
}
var NORMALIZED_OFFICIAL_CANDIDATES = CANDIDATOS_OFICIAIS_2026.map((cand) => {
  const normName = normalizeStr(cand.name);
  const words = normName.split(" ").filter((w) => w.length > 2);
  const firstWord = words[0] || "";
  const lastWord = words[words.length - 1] || "";
  return {
    candidate: cand,
    normName,
    words,
    firstWord,
    lastWord,
    number: cand.number,
    role: cand.role
  };
});
var NORMALIZED_MUNICIPALITIES = SERGIPE_MUNICIPALITIES.map((m) => ({
  originalName: m.name,
  normName: normalizeStr(m.name),
  territory: m.territory,
  voters: m.voters
}));
function matchMunicipalityName(rawMuni) {
  if (!rawMuni) return null;
  const norm = normalizeStr(rawMuni);
  if (!norm) return null;
  const direct = NORMALIZED_MUNICIPALITIES.find((m) => m.normName === norm);
  if (direct) return direct.originalName;
  if (norm.includes("aracaju")) return "Aracaju";
  if (norm.includes("socorro") || norm.includes("ns socorro")) return "Nossa Senhora do Socorro";
  if (norm.includes("sao cristovao") || norm.includes("cristovao")) return "S\xE3o Crist\xF3v\xE3o";
  if (norm.includes("itabaiana") && !norm.includes("itabaianinha")) return "Itabaiana";
  if (norm.includes("itabaianinha")) return "Itabaianinha";
  if (norm.includes("itaporanga")) return "Itaporanga d'Ajuda";
  if (norm.includes("lagarto")) return "Lagarto";
  if (norm.includes("estancia")) return "Est\xE2ncia";
  if (norm.includes("tobias")) return "Tobias Barreto";
  if (norm.includes("simao dias")) return "Sim\xE3o Dias";
  if (norm.includes("barra") || norm.includes("coqueiros")) return "Barra dos Coqueiros";
  if (norm.includes("gloria") || norm.includes("ns gloria")) return "Nossa Senhora da Gl\xF3ria";
  if (norm.includes("dores") || norm.includes("ns dores")) return "Nossa Senhora das Dores";
  if (norm.includes("aparecida") || norm.includes("ns aparecida")) return "Nossa Senhora Aparecida";
  if (norm.includes("caninde")) return "Canind\xE9 de S\xE3o Francisco";
  if (norm.includes("propria")) return "Propri\xE1";
  if (norm.includes("neopolis")) return "Ne\xF3polis";
  if (norm.includes("poco redondo")) return "Po\xE7o Redondo";
  if (norm.includes("poco verde")) return "Po\xE7o Verde";
  if (norm.includes("porto da folha")) return "Porto da Folha";
  if (norm.includes("santo amaro")) return "Santo Amaro das Brotas";
  if (norm.includes("rosario")) return "Ros\xE1rio do Catete";
  if (norm.includes("maruim")) return "Maruim";
  if (norm.includes("laranjeiras")) return "Laranjeiras";
  if (norm.includes("japaratuba")) return "Japaratuba";
  if (norm.includes("pirambu")) return "Pirambu";
  if (norm.includes("aquidaba")) return "Aquidab\xE3";
  if (norm.includes("capela")) return "Capela";
  if (norm.includes("carmopolis")) return "Carm\xF3polis";
  if (norm.includes("boquim")) return "Boquim";
  if (norm.includes("umbauba")) return "Umba\xFAba";
  if (norm.includes("cristinapolis")) return "Cristin\xE1polis";
  if (norm.includes("tomar do geru") || norm.includes("geru")) return "Tomar do Geru";
  if (norm.includes("indiaroba")) return "Indiaroba";
  if (norm.includes("santa luzia")) return "Santa Luzia do Itanhy";
  if (norm.includes("campo do brito") || norm.includes("brito")) return "Campo do Brito";
  if (norm.includes("sao domingos")) return "S\xE3o Domingos";
  if (norm.includes("macambira")) return "Macambira";
  if (norm.includes("frei paulo")) return "Frei Paulo";
  if (norm.includes("pedra mole")) return "Pedra Mole";
  if (norm.includes("pinhao")) return "Pinh\xE3o";
  if (norm.includes("carira")) return "Carira";
  if (norm.includes("ribeiropolis")) return "Ribeir\xF3polis";
  if (norm.includes("moita bonita") || norm.includes("moita")) return "Moita Bonita";
  if (norm.includes("malhador")) return "Malhador";
  if (norm.includes("sao miguel")) return "S\xE3o Miguel do Aleixo";
  if (norm.includes("monte alegre")) return "Monte Alegre de Sergipe";
  const sub = NORMALIZED_MUNICIPALITIES.find((m) => norm.includes(m.normName) || m.normName.includes(norm));
  if (sub) return sub.originalName;
  return null;
}
function matchOfficialCandidate(rawName, roleFilter) {
  if (!rawName) return null;
  const rawStr = String(rawName).trim();
  if (!rawStr) return null;
  const norm = normalizeStr(rawStr);
  if (!norm) return null;
  if (norm === "branco" || norm === "nulo" || norm === "brancos" || norm === "nulos" || norm === "branco nulo" || norm === "brancos nulos" || norm === "brancos e nulos" || norm === "nenhum" || norm === "nenhum deles" || norm === "voto nulo" || norm === "voto em branco" || norm === "anularia") {
    return {
      candidateName: "Branco/Nulo",
      isInvalid: true
    };
  }
  if (norm === "ns nr" || norm === "ns" || norm === "nr" || norm === "nao sabe" || norm === "nao respondeu" || norm === "nao soube responder" || norm === "indeciso" || norm === "indecisos" || norm === "nao opinou" || norm === "sem resposta" || norm.includes("nao sabe") || norm.includes("nao respondeu")) {
    return {
      candidateName: "Ns/Nr",
      isUndecided: true
    };
  }
  const pool = roleFilter ? NORMALIZED_OFFICIAL_CANDIDATES.filter((c) => c.role === roleFilter) : NORMALIZED_OFFICIAL_CANDIDATES;
  const exact = pool.find((c) => c.normName === norm);
  if (exact) {
    return {
      candidateName: exact.candidate.name,
      role: exact.role,
      partyNumber: exact.candidate.partyNumber
    };
  }
  const numMatch = pool.find((c) => c.number === rawStr || c.number === norm);
  if (numMatch) {
    return {
      candidateName: numMatch.candidate.name,
      role: numMatch.role,
      partyNumber: numMatch.candidate.partyNumber
    };
  }
  if (norm.includes("fabio") || norm.includes("mitidieri")) {
    const cand = pool.find((c) => c.role === "Governador" && c.candidate.name.includes("F\xE1bio"));
    if (cand) return { candidateName: cand.candidate.name, role: "Governador", partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("valmir") || norm.includes("francisquinho")) {
    const cand = pool.find((c) => c.role === "Governador" && c.candidate.name.includes("Valmir"));
    if (cand) return { candidateName: cand.candidate.name, role: "Governador", partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("ricardo marques") || norm.includes("ricardo") && roleFilter === "Governador") {
    const cand = pool.find((c) => c.role === "Governador" && c.candidate.name.includes("Ricardo Marques"));
    if (cand) return { candidateName: cand.candidate.name, role: "Governador", partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("cacho") || norm.includes("emanuel cacho")) {
    const cand = pool.find((c) => c.candidate.name.includes("Emanuel Cacho"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("helton") || norm.includes("dr helton")) {
    const cand = pool.find((c) => c.candidate.name.includes("Dr. Helton"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("taty") || norm.includes("cristina de jesus") || norm.includes("taty cristina")) {
    const cand = pool.find((c) => c.candidate.name.includes("Taty Cristina"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
    return { candidateName: "Taty Cristina De Jesus", role: "Governador" };
  }
  if (norm.includes("lula") || norm.includes("luiz inacio")) {
    return { candidateName: "Lula", role: "Presidente", partyNumber: "13" };
  }
  if (norm.includes("flavio bolsonaro") || norm.includes("bolsonaro")) {
    return { candidateName: "Flavio Bolsonaro", role: "Presidente", partyNumber: "22" };
  }
  if (norm.includes("cury") || norm.includes("augusto cury")) {
    return { candidateName: "Escritor Augusto Cury", role: "Presidente" };
  }
  if (norm.includes("caiado") || norm.includes("ronaldo caiado")) {
    return { candidateName: "Ronaldo Caiado", role: "Presidente" };
  }
  if (norm.includes("renan santos")) {
    return { candidateName: "Renan Santos", role: "Presidente" };
  }
  if (norm.includes("marcal") || norm.includes("pablo marcal")) {
    return { candidateName: "Pablo Mar\xE7al", role: "Presidente" };
  }
  if (norm.includes("andre moura") || norm.includes("moura") && (norm.includes("andre") || roleFilter === "Senador")) {
    const cand = pool.find((c) => c.role === "Senador" && c.candidate.name.includes("Andr\xE9 Moura"));
    if (cand) return { candidateName: cand.candidate.name, role: "Senador", partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("rogerio") || norm.includes("carvalho")) {
    const cand = pool.find((c) => c.role === "Senador" && c.candidate.name.includes("Rogerio"));
    if (cand) return { candidateName: cand.candidate.name, role: "Senador", partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("alessandro") || norm.includes("delegado alessandro")) {
    const cand = pool.find((c) => c.candidate.name.includes("Alessandro"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("andre david") || norm.includes("delegado andre david")) {
    const cand = pool.find((c) => c.candidate.name.includes("Andr\xE9 David"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("edvaldo") || norm.includes("nogueira")) {
    const cand = pool.find((c) => c.candidate.name.includes("Edvaldo"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("amorim") || norm.includes("eduardo amorim")) {
    const cand = pool.find((c) => c.candidate.name.includes("Eduardo Amorim"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("valadares") || norm.includes("rodrigo valadares")) {
    const cand = pool.find((c) => c.candidate.name.includes("Rodrigo Valadares"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("coronel rocha") || norm.includes("rocha") && roleFilter === "Senador") {
    const cand = pool.find((c) => c.candidate.name.includes("Coronel Rocha"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("iran") || norm.includes("iran barbosa")) {
    const cand = pool.find((c) => c.candidate.name.includes("Iran Barbosa"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("yandra")) {
    const cand = pool.find((c) => c.candidate.name.includes("Yandra"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("anderson") && norm.includes("canas")) {
    const cand = pool.find((c) => c.candidate.name.includes("Anderson De Z\xE9"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("heleno") || norm.includes("pastor heleno")) {
    const cand = pool.find((c) => c.candidate.name.includes("Pastor Heleno"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("fabio reis")) {
    const cand = pool.find((c) => c.candidate.name.includes("F\xE1bio Reis"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("katarina")) {
    const cand = pool.find((c) => c.candidate.name.includes("Katarina"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("gustinho")) {
    const cand = pool.find((c) => c.candidate.name.includes("Gustinho"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("icaro")) {
    const cand = pool.find((c) => c.candidate.name.includes("Icaro"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("joao daniel")) {
    const cand = pool.find((c) => c.candidate.name.includes("Joao Daniel"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("marcio macedo")) {
    const cand = pool.find((c) => c.candidate.name.includes("Marcio Macedo"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("luciano bispo")) {
    const cand = pool.find((c) => c.candidate.name.includes("Luciano Bispo"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("cristiano cavalcante")) {
    const cand = pool.find((c) => c.candidate.name.includes("Cristiano Cavalcante"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("pato maravilha") || norm.includes("maravilha")) {
    const cand = pool.find((c) => c.candidate.name.includes("Pato Maravilha"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("ibrain") || norm.includes("ibrain de valmir")) {
    const cand = pool.find((c) => c.candidate.name.includes("Ibrain De Valmir"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("georgeo")) {
    const cand = pool.find((c) => c.candidate.name.includes("Georgeo Passos"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("maisa")) {
    const cand = pool.find((c) => c.candidate.name.includes("Maisa Mitidieri"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  if (norm.includes("linda brasil")) {
    const cand = pool.find((c) => c.candidate.name.includes("Linda Brasil"));
    if (cand) return { candidateName: cand.candidate.name, role: cand.role, partyNumber: cand.candidate.partyNumber };
  }
  const sub = pool.find((c) => norm.includes(c.normName) || c.normName.includes(norm));
  if (sub) {
    return {
      candidateName: sub.candidate.name,
      role: sub.role,
      partyNumber: sub.candidate.partyNumber
    };
  }
  const cleanFormatted = rawStr.split(" ").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return {
    candidateName: cleanFormatted,
    role: roleFilter
  };
}
function parseFlexibleNumber(val) {
  if (typeof val === "number") {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;
  let str = String(val).trim();
  str = str.replace(/[%\sR$]/g, "");
  if (str.includes(",") && !str.includes(".")) {
    str = str.replace(",", ".");
  } else if (str.includes(",") && str.includes(".")) {
    str = str.replace(/\./g, "").replace(",", ".");
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}
function processSurveyMicrodata(rawRows: any, fileName: string = "", fallbackReferenceDate: string = "", fallbackInstitute: string = ""): any {
  const warnings = [];
  let institute = fallbackInstitute || "CTAS";
  let registryNumber = "";
  let conre = "10801";
  let statistician = "Sidney Barreto Batista";
  let sampleSize = rawRows.length;
  let confidenceLevel = 95;
  let minRowDate = null;
  let maxRowDate = null;
  const rowFieldwork = extractFieldworkPeriodFromRows(rawRows);
  if (rowFieldwork.hasValidDates) {
    minRowDate = rowFieldwork.fieldworkStart;
    maxRowDate = rowFieldwork.fieldworkEnd;
  }
  const fallbackRange = parseDateRange(fallbackReferenceDate);
  const fileNameRange = parseDateRange(fileName);
  let detectedMetaStart = null;
  let detectedMetaEnd = null;
  let detectedMetaMedian = null;
  const candidateResults = {};
  const roleResults = {
    "Governador": {},
    "1\xBA Senador": {},
    "2\xBA Senador": {},
    "Senador": {},
    "Deputado Federal": {},
    "Deputado Estadual": {},
    "Presidente": {}
  };
  const roleValidResults = {
    "Governador": {},
    "1\xBA Senador": {},
    "2\xBA Senador": {},
    "Senador": {},
    "Deputado Federal": {},
    "Deputado Estadual": {},
    "Presidente": {}
  };
  const roleRawCounts = {
    "Governador": {},
    "1\xBA Senador": {},
    "2\xBA Senador": {},
    "Senador": {},
    "Deputado Federal": {},
    "Deputado Estadual": {},
    "Presidente": {}
  };
  const roleStats = {};
  const territorialBreakdown = {};
  const territorialRoleBreakdown = {
    "Governador": {},
    "1\xBA Senador": {},
    "2\xBA Senador": {},
    "Senador": {},
    "Deputado Federal": {},
    "Deputado Estadual": {},
    "Presidente": {}
  };
  const geoPoints = [];
  const firstRow = rawRows[0] || {};
  const headerKeys = Object.keys(firstRow);
  const govColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n === "governador" || n.startsWith("governador") || n.includes("voto governador") || n.includes("governo de sergipe") || n.includes("governo do estado") || n.includes("governo") && !n.includes("aprovacao") && !n.includes("gestao");
  });
  const sen1ColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n.includes("senador 01") || n.includes("senador 1") || n === "senador1" || n.includes("primeiro senador") || (n.includes("senador") || n.includes("senado")) && (n.includes("01") || n.includes("1") || n.includes("1o") || n.includes("1\xBA") || n.includes("primeiro")) || n === "senador";
  });
  const sen2ColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return (n.includes("senador 02") || n.includes("senador 2") || n === "senador2" || n.includes("segundo senador") || (n.includes("senador") || n.includes("senado")) && (n.includes("02") || n.includes("2") || n.includes("2o") || n.includes("2\xBA") || n.includes("segundo"))) && k !== sen1ColKey;
  });
  const depEstColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n.includes("deputado estadual") || n === "deputado estadual" || n.includes("estadual") && !n.includes("federal");
  });
  const depFedColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n.includes("deputado federal") || n === "deputado federal" || n.includes("federal") && !n.includes("estadual");
  });
  const presColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n.includes("presidente") || n.includes("presidencia") || n.includes("presidencial");
  });
  const muniColKey = headerKeys.find((k) => {
    const n = normalizeStr(k);
    return n.includes("municipio") || n.includes("cidade") || n.includes("regiao") || n.includes("territorio");
  });
  const latColKey = headerKeys.find((k) => normalizeStr(k).includes("lat"));
  const lngColKey = headerKeys.find((k) => normalizeStr(k).includes("long") || normalizeStr(k).includes("lng"));
  const cepColKey = headerKeys.find((k) => normalizeStr(k).includes("cep"));
  const dateColKey = headerKeys.find((k) => normalizeStr(k).includes("inicio") || normalizeStr(k).includes("data"));
  const isMicrodataSurvey = Boolean(govColKey || sen1ColKey || depEstColKey || depFedColKey || presColKey);
  if (isMicrodataSurvey) {
    const totalInterviews = rawRows.length;
    sampleSize = totalInterviews;
    const govCounts = {};
    const sen1Counts = {};
    const sen2Counts = {};
    const senCounts = {};
    const depEstCounts = {};
    const depFedCounts = {};
    const presCounts = {};
    const roleMuniData = {
      "Governador": {},
      "1\xBA Senador": {},
      "2\xBA Senador": {},
      "Senador": {},
      "Deputado Federal": {},
      "Deputado Estadual": {},
      "Presidente": {}
    };
    const getMuniTally = (role, muni) => {
      if (!roleMuniData[role][muni]) {
        roleMuniData[role][muni] = {
          counts: {},
          totalSample: 0,
          validTotal: 0,
          invalidTotal: 0,
          undecidedTotal: 0
        };
      }
      return roleMuniData[role][muni];
    };
    rawRows.forEach((row, rowIndex) => {
      if (rowIndex < 500) {
        let rDate = null;
        if (dateColKey && row[dateColKey]) {
          rDate = parseFlexibleDate(row[dateColKey]);
        }
        if (!rDate) {
          for (const [k, v] of Object.entries(row)) {
            const norm = normalizeStr(k);
            if (norm.includes("data") || norm.includes("coleta") || norm.includes("inicio") || norm.includes("entrevista")) {
              rDate = parseFlexibleDate(v);
              if (rDate) break;
            }
          }
        }
        if (rDate) {
          if (!minRowDate || rDate < minRowDate) minRowDate = rDate;
          if (!maxRowDate || rDate > maxRowDate) maxRowDate = rDate;
        }
      }
      if (latColKey && lngColKey && row[latColKey] && row[lngColKey]) {
        const lat = parseFlexibleNumber(row[latColKey]);
        const lng = parseFlexibleNumber(row[lngColKey]);
        if (lat !== 0 && lng !== 0) {
          geoPoints.push({
            label: String(row[muniColKey || "Munic\xEDpio"] || `Entrevista ${row["Id da Entrevista"] || rowIndex + 1}`),
            latitude: lat,
            longitude: lng,
            cep: cepColKey ? String(row[cepColKey] || "") : "",
            cidade: muniColKey ? String(row[muniColKey] || "") : "Sergipe",
            bairro: String(row["Bairro"] || "")
          });
        }
      }
      const rawMuni = muniColKey ? String(row[muniColKey] || "").trim() : "";
      const canonicalMuni = matchMunicipalityName(rawMuni) || rawMuni;
      if (govColKey) {
        const rawVal = row[govColKey];
        const match = matchOfficialCandidate(rawVal, "Governador");
        const cand = match ? match.candidateName : "Ns/Nr";
        const isInv = match?.isInvalid || false;
        const isUnd = match?.isUndecided || (!match || !rawVal);
        govCounts[cand] = (govCounts[cand] || 0) + 1;
        if (canonicalMuni) {
          const t = getMuniTally("Governador", canonicalMuni);
          t.totalSample += 1;
          t.counts[cand] = (t.counts[cand] || 0) + 1;
          if (isInv) t.invalidTotal += 1;
          else if (isUnd) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }
      if (sen1ColKey) {
        const rawVal1 = row[sen1ColKey];
        const match1 = matchOfficialCandidate(rawVal1, "Senador");
        const cand1 = match1 ? match1.candidateName : rawVal1 ? String(rawVal1).trim() : "Ns/Nr";
        const isInv1 = match1?.isInvalid || false;
        const isUnd1 = match1?.isUndecided || (!match1 || !rawVal1);
        sen1Counts[cand1] = (sen1Counts[cand1] || 0) + 1;
        senCounts[cand1] = (senCounts[cand1] || 0) + 1;
        if (canonicalMuni) {
          const t1 = getMuniTally("1\xBA Senador", canonicalMuni);
          t1.totalSample += 1;
          t1.counts[cand1] = (t1.counts[cand1] || 0) + 1;
          if (isInv1) t1.invalidTotal += 1;
          else if (isUnd1) t1.undecidedTotal += 1;
          else t1.validTotal += 1;
          const t = getMuniTally("Senador", canonicalMuni);
          t.totalSample += 1;
          t.counts[cand1] = (t.counts[cand1] || 0) + 1;
          if (isInv1) t.invalidTotal += 1;
          else if (isUnd1) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }
      if (sen2ColKey) {
        const rawVal2 = row[sen2ColKey];
        const match2 = matchOfficialCandidate(rawVal2, "Senador");
        const cand2 = match2 ? match2.candidateName : rawVal2 ? String(rawVal2).trim() : "Ns/Nr";
        const isInv2 = match2?.isInvalid || false;
        const isUnd2 = match2?.isUndecided || (!match2 || !rawVal2);
        sen2Counts[cand2] = (sen2Counts[cand2] || 0) + 1;
        senCounts[cand2] = (senCounts[cand2] || 0) + 1;
        if (canonicalMuni) {
          const t2 = getMuniTally("2\xBA Senador", canonicalMuni);
          t2.totalSample += 1;
          t2.counts[cand2] = (t2.counts[cand2] || 0) + 1;
          if (isInv2) t2.invalidTotal += 1;
          else if (isUnd2) t2.undecidedTotal += 1;
          else t2.validTotal += 1;
          const t = getMuniTally("Senador", canonicalMuni);
          t.totalSample += 1;
          t.counts[cand2] = (t.counts[cand2] || 0) + 1;
          if (isInv2) t.invalidTotal += 1;
          else if (isUnd2) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }
      if (depFedColKey) {
        const rawValFed = row[depFedColKey];
        const matchFed = matchOfficialCandidate(rawValFed, "Deputado Federal");
        const candFed = matchFed ? matchFed.candidateName : "Ns/Nr";
        const isInvFed = matchFed?.isInvalid || false;
        const isUndFed = matchFed?.isUndecided || (!matchFed || !rawValFed);
        depFedCounts[candFed] = (depFedCounts[candFed] || 0) + 1;
        if (canonicalMuni) {
          const t = getMuniTally("Deputado Federal", canonicalMuni);
          t.totalSample += 1;
          t.counts[candFed] = (t.counts[candFed] || 0) + 1;
          if (isInvFed) t.invalidTotal += 1;
          else if (isUndFed) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }
      if (depEstColKey) {
        const rawValEst = row[depEstColKey];
        const matchEst = matchOfficialCandidate(rawValEst, "Deputado Estadual");
        const candEst = matchEst ? matchEst.candidateName : "Ns/Nr";
        const isInvEst = matchEst?.isInvalid || false;
        const isUndEst = matchEst?.isUndecided || (!matchEst || !rawValEst);
        depEstCounts[candEst] = (depEstCounts[candEst] || 0) + 1;
        if (canonicalMuni) {
          const t = getMuniTally("Deputado Estadual", canonicalMuni);
          t.totalSample += 1;
          t.counts[candEst] = (t.counts[candEst] || 0) + 1;
          if (isInvEst) t.invalidTotal += 1;
          else if (isUndEst) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }
      if (presColKey) {
        const rawValPres = row[presColKey];
        const matchPres = matchOfficialCandidate(rawValPres, "Presidente");
        const candPres = matchPres ? matchPres.candidateName : rawValPres ? String(rawValPres).trim() : "Ns/Nr";
        const isInvPres = matchPres?.isInvalid || false;
        const isUndPres = matchPres?.isUndecided || (!matchPres || !rawValPres);
        presCounts[candPres] = (presCounts[candPres] || 0) + 1;
        if (canonicalMuni) {
          const t = getMuniTally("Presidente", canonicalMuni);
          t.totalSample += 1;
          t.counts[candPres] = (t.counts[candPres] || 0) + 1;
          if (isInvPres) t.invalidTotal += 1;
          else if (isUndPres) t.undecidedTotal += 1;
          else t.validTotal += 1;
        }
      }
    });
    const calcPercentages = (counts, divisor) => {
      const result = {};
      const validCounts = {};
      let totalValid = 0;
      Object.entries(counts).forEach(([cand, count]) => {
        result[cand] = divisor > 0 ? +(count / divisor * 100).toFixed(2) : 0;
        if (cand !== "Branco/Nulo" && cand !== "Ns/Nr" && cand !== "Brancos/Nulos" && cand !== "Indecisos" && cand !== "N\xE3o sei/N\xE3o respondeu") {
          validCounts[cand] = count;
          totalValid += count;
        }
      });
      const validResult = {};
      Object.entries(validCounts).forEach(([cand, count]) => {
        validResult[cand] = totalValid > 0 ? +(count / totalValid * 100).toFixed(2) : 0;
      });
      return { totalPct: result, validPct: validResult, validTotal: totalValid };
    };
    const govCalc = calcPercentages(govCounts, totalInterviews);
    roleResults["Governador"] = govCalc.totalPct;
    roleValidResults["Governador"] = govCalc.validPct;
    if (Object.keys(govCalc.totalPct).length > 0) {
      Object.assign(candidateResults, govCalc.totalPct);
    }
    if (Object.keys(sen1Counts).length > 0) {
      const sen1Calc = calcPercentages(sen1Counts, totalInterviews);
      roleResults["1\xBA Senador"] = sen1Calc.totalPct;
      roleValidResults["1\xBA Senador"] = sen1Calc.validPct;
    }
    if (Object.keys(sen2Counts).length > 0) {
      const sen2Calc = calcPercentages(sen2Counts, totalInterviews);
      roleResults["2\xBA Senador"] = sen2Calc.totalPct;
      roleValidResults["2\xBA Senador"] = sen2Calc.validPct;
    }
    const senValidTotal = Object.entries(senCounts).filter(([k]) => k !== "Branco/Nulo" && k !== "Ns/Nr" && k !== "Brancos/Nulos" && k !== "Indecisos" && k !== "N\xE3o sei/N\xE3o respondeu").reduce((sum, [, count]) => sum + count, 0);
    const senTotalPct = {};
    const senValidPct = {};
    Object.entries(senCounts).forEach(([cand, count]) => {
      senTotalPct[cand] = totalInterviews > 0 ? +(count / totalInterviews * 100).toFixed(2) : 0;
      if (cand !== "Branco/Nulo" && cand !== "Ns/Nr" && cand !== "Brancos/Nulos" && cand !== "Indecisos" && cand !== "N\xE3o sei/N\xE3o respondeu") {
        senValidPct[cand] = senValidTotal > 0 ? +(count / senValidTotal * 100).toFixed(2) : 0;
      }
    });
    roleResults["Senador"] = senTotalPct;
    roleValidResults["Senador"] = senValidPct;
    const fedCalc = calcPercentages(depFedCounts, totalInterviews);
    roleResults["Deputado Federal"] = fedCalc.totalPct;
    roleValidResults["Deputado Federal"] = fedCalc.validPct;
    const estCalc = calcPercentages(depEstCounts, totalInterviews);
    roleResults["Deputado Estadual"] = estCalc.totalPct;
    roleValidResults["Deputado Estadual"] = estCalc.validPct;
    if (presColKey && Object.keys(presCounts).length > 0) {
      const presCalc = calcPercentages(presCounts, totalInterviews);
      roleResults["Presidente"] = presCalc.totalPct;
      roleValidResults["Presidente"] = presCalc.validPct;
      if (Object.keys(candidateResults).length === 0) {
        Object.assign(candidateResults, presCalc.totalPct);
      }
    }
    const totalSenMentions = Object.values(senCounts).reduce((a, b) => a + b, 0);
    const senDivisor = totalSenMentions > 0 ? totalSenMentions : totalInterviews * 2;
    const buildRoleStats = (counts, sampleCount) => {
      let validTotal = 0;
      let invalidTotal = 0;
      let undecidedTotal = 0;
      Object.entries(counts).forEach(([k, v]) => {
        if (k === "Branco/Nulo" || k === "Brancos/Nulos") {
          invalidTotal += v;
        } else if (k === "Ns/Nr" || k === "Indecisos" || k === "N\xE3o sei/N\xE3o respondeu") {
          undecidedTotal += v;
        } else {
          validTotal += v;
        }
      });
      const totalSample = sampleCount > 0 ? sampleCount : validTotal + invalidTotal + undecidedTotal;
      return {
        totalSample,
        validTotal,
        invalidTotal,
        undecidedTotal,
        validPercent: totalSample > 0 ? +(validTotal / totalSample * 100).toFixed(2) : 0,
        invalidPercent: totalSample > 0 ? +(invalidTotal / totalSample * 100).toFixed(2) : 0,
        undecidedPercent: totalSample > 0 ? +(undecidedTotal / totalSample * 100).toFixed(2) : 0
      };
    };
    Object.assign(roleStats, {
      "Governador": buildRoleStats(govCounts, totalInterviews),
      "1\xBA Senador": buildRoleStats(sen1Counts, totalInterviews),
      "2\xBA Senador": buildRoleStats(sen2Counts, totalInterviews),
      "Senador": buildRoleStats(senCounts, senDivisor),
      "Deputado Federal": buildRoleStats(depFedCounts, totalInterviews),
      "Deputado Estadual": buildRoleStats(depEstCounts, totalInterviews)
    });
    if (presColKey && Object.keys(presCounts).length > 0) {
      roleStats["Presidente"] = buildRoleStats(presCounts, totalInterviews);
    }
    Object.assign(roleRawCounts, {
      "Governador": govCounts,
      "1\xBA Senador": sen1Counts,
      "2\xBA Senador": sen2Counts,
      "Senador": senCounts,
      "Deputado Federal": depFedCounts,
      "Deputado Estadual": depEstCounts
    });
    if (presColKey && Object.keys(presCounts).length > 0) {
      roleRawCounts["Presidente"] = presCounts;
    }
    ["Governador", "1\xBA Senador", "2\xBA Senador", "Senador", "Deputado Federal", "Deputado Estadual", "Presidente"].forEach((role) => {
      const muniMap = roleMuniData[role] || {};
      Object.entries(muniMap).forEach(([muni, t]) => {
        const percentages = {};
        const validPercentages = {};
        Object.entries(t.counts).forEach(([cand, count]) => {
          percentages[cand] = t.totalSample > 0 ? +(count / t.totalSample * 100).toFixed(1) : 0;
          if (cand !== "Branco/Nulo" && cand !== "Ns/Nr" && cand !== "Brancos/Nulos" && cand !== "Indecisos" && cand !== "N\xE3o sei/N\xE3o respondeu") {
            validPercentages[cand] = t.validTotal > 0 ? +(count / t.validTotal * 100).toFixed(1) : 0;
          }
        });
        if (!territorialRoleBreakdown[role]) {
          territorialRoleBreakdown[role] = {};
        }
        territorialRoleBreakdown[role][muni] = {
          counts: t.counts,
          totalSample: t.totalSample,
          validTotal: t.validTotal,
          invalidTotal: t.invalidTotal,
          undecidedTotal: t.undecidedTotal,
          percentages,
          validPercentages
        };
      });
    });
    Object.entries(territorialRoleBreakdown["Governador"] || {}).forEach(([muni, t]) => {
      territorialBreakdown[muni] = t.validPercentages;
    });
  } else {
    const candidateColKey = headerKeys.find((k) => {
      const n = normalizeStr(k);
      return n.includes("candidato") || n.includes("nome") || n.includes("opcao") || n.includes("chapa");
    });
    const valueColKey = headerKeys.find((k) => {
      const n = normalizeStr(k);
      return n.includes("voto") || n.includes("percent") || n.includes("intencao") || n.includes("%") || n.includes("total") || n.includes("taxa") || n.includes("valor");
    });
    if (candidateColKey && valueColKey) {
      rawRows.forEach((row) => {
        const rawCand = String(row[candidateColKey] || "").trim();
        const rawVal = row[valueColKey];
        if (!rawCand) return;
        const match = matchOfficialCandidate(rawCand);
        const parsedVal = parseFlexibleNumber(rawVal);
        if (match && parsedVal > 0) {
          candidateResults[match.candidateName] = parsedVal;
          const role = match.role || "Governador";
          roleResults[role][match.candidateName] = parsedVal;
        }
      });
    } else {
      rawRows.forEach((row) => {
        headerKeys.forEach((key) => {
          const match = matchOfficialCandidate(key);
          if (match) {
            const val = parseFlexibleNumber(row[key]);
            if (val > 0) {
              candidateResults[match.candidateName] = val;
              const role = match.role || "Governador";
              roleResults[role][match.candidateName] = val;
            }
          }
        });
      });
    }
  }
  const computedMargin = sampleSize > 0 ? +(1.96 * Math.sqrt(0.25 / sampleSize) * 100).toFixed(1) : 2.8;
  let marginOfError = computedMargin;
  rawRows.forEach((row) => {
    Object.entries(row).forEach(([k, v]) => {
      const normK = normalizeStr(k);
      if (normK.includes("instituto") && v) institute = String(v).trim();
      if (normK.includes("registro") && v) registryNumber = String(v).trim();
      if (normK.includes("conre") && v) conre = String(v).trim();
      if (normK.includes("estatistico") && v) statistician = String(v).trim();
      if (normK.includes("margem") && v) marginOfError = parseFlexibleNumber(v) || marginOfError;
      if (normK.includes("confianca") && v) confidenceLevel = parseFlexibleNumber(v) || confidenceLevel;
      if (normK.includes("inicio") || normK.includes("abertura") || normK.includes("start")) {
        const parsed = parseFlexibleDate(v);
        if (parsed) detectedMetaStart = parsed;
      }
      if (normK.includes("fim") || normK.includes("termino") || normK.includes("fechamento") || normK.includes("end")) {
        const parsed = parseFlexibleDate(v);
        if (parsed) detectedMetaEnd = parsed;
      }
      if (normK.includes("mediana") || normK.includes("median")) {
        const parsed = parseFlexibleDate(v);
        if (parsed) detectedMetaMedian = parsed;
      }
      if (!detectedMetaStart && (normK.includes("data") || normK.includes("periodo") || normK.includes("campo"))) {
        const range = parseDateRange(v);
        if (range.start) detectedMetaStart = range.start;
        if (range.end) detectedMetaEnd = range.end;
        if (range.median) detectedMetaMedian = range.median;
      }
    });
  });
  const resolvedStart = minRowDate || detectedMetaStart || fileNameRange.start || fallbackRange.start || "";
  const resolvedEnd = maxRowDate || detectedMetaEnd || fileNameRange.end || fallbackRange.end || resolvedStart || "";
  const resolvedMedian = (minRowDate && maxRowDate ? computeMedianDate(minRowDate, maxRowDate) : null) || detectedMetaMedian || fileNameRange.median || fallbackRange.median || (resolvedStart && resolvedEnd ? computeMedianDate(resolvedStart, resolvedEnd) : resolvedStart || "");
  return {
    institute,
    registryNumber,
    conre,
    statistician,
    sampleSize,
    marginOfError,
    confidenceLevel,
    fieldworkStart: resolvedStart,
    fieldworkEnd: resolvedEnd,
    medianDate: resolvedMedian,
    type: "Registrada",
    results: candidateResults,
    roleResults,
    roleValidResults,
    roleRawCounts,
    roleStats,
    territorialBreakdown,
    territorialRoleBreakdown,
    rawRows,
    geoPoints: geoPoints.length > 0 ? geoPoints : void 0,
    rawRowsCount: rawRows.length,
    warnings,
    fileName
  };
}
export {
  CANONICAL_MUNICIPALITIES_DATA,
  CANONICAL_MUNICIPALITY_LOOKUP,
  CANONICAL_MUNICIPIOS_POR_TERRITORIO,
  CANONICAL_REGIONAL_POLES,
  CANONICAL_SERGIPE_TERRITORIES,
  getCanonicalMunicipality,
  getCanonicalTerritoriesData,
  processSurveyMicrodata
};

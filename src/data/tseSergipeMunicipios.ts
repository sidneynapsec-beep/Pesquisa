// Lista Canônica Oficial dos 75 Municípios do Estado de Sergipe (TSE / IBGE)
// Utilizada para auditoria e validação de integridade de 100% da base eleitoral.

export interface SergipeMunicipioOficial {
  codigoTse: string;
  codigoIbge: string;
  nome: string;
  nomeNormalizado: string;
  territorio: string;
}

export const SERGIPE_75_MUNICIPIOS: SergipeMunicipioOficial[] = [
  { codigoTse: "31011", codigoIbge: "2800100", nome: "Amparo de São Francisco", nomeNormalizado: "AMPARO DE SAO FRANCISCO", territorio: "Baixo São Francisco" },
  { codigoTse: "31038", codigoIbge: "2800209", nome: "Aquidabã", nomeNormalizado: "AQUIDABA", territorio: "Médio Sertão" },
  { codigoTse: "31054", codigoIbge: "2800308", nome: "Aracaju", nomeNormalizado: "ARACAJU", territorio: "Grande Aracaju" },
  { codigoTse: "31070", codigoIbge: "2800407", nome: "Arauá", nomeNormalizado: "ARAUA", territorio: "Sul Sergipano" },
  { codigoTse: "31097", codigoIbge: "2800506", nome: "Areia Branca", nomeNormalizado: "AREIA BRANCA", territorio: "Agreste Central" },
  { codigoTse: "31119", codigoIbge: "2800605", nome: "Barra dos Coqueiros", nomeNormalizado: "BARRA DOS COQUEIROS", territorio: "Grande Aracaju" },
  { codigoTse: "31135", codigoIbge: "2800670", nome: "Boquim", nomeNormalizado: "BOQUIM", territorio: "Sul Sergipano" },
  { codigoTse: "31151", codigoIbge: "2800704", nome: "Brejo Grande", nomeNormalizado: "BREJO GRANDE", territorio: "Baixo São Francisco" },
  { codigoTse: "31178", codigoIbge: "2801009", nome: "Campo do Brito", nomeNormalizado: "CAMPO DO BRITO", territorio: "Agreste Central" },
  { codigoTse: "31194", codigoIbge: "2801108", nome: "Canhoba", nomeNormalizado: "CANHOBA", territorio: "Baixo São Francisco" },
  { codigoTse: "31216", codigoIbge: "2801207", nome: "Canindé de São Francisco", nomeNormalizado: "CANINDE DE SAO FRANCISCO", territorio: "Alto Sertão" },
  { codigoTse: "31232", codigoIbge: "2801306", nome: "Capela", nomeNormalizado: "CAPELA", territorio: "Leste Sergipano" },
  { codigoTse: "31259", codigoIbge: "2801405", nome: "Carira", nomeNormalizado: "CARIRA", territorio: "Agreste Central" },
  { codigoTse: "31275", codigoIbge: "2801504", nome: "Carmópolis", nomeNormalizado: "CARMOPOLIS", territorio: "Leste Sergipano" },
  { codigoTse: "31291", codigoIbge: "2801603", nome: "Cedro de São João", nomeNormalizado: "CEDRO DE SAO JOAO", territorio: "Baixo São Francisco" },
  { codigoTse: "31313", codigoIbge: "2801702", nome: "Cristinápolis", nomeNormalizado: "CRISTINAPOLIS", territorio: "Sul Sergipano" },
  { codigoTse: "31330", codigoIbge: "2801900", nome: "Cumbe", nomeNormalizado: "CUMBE", territorio: "Médio Sertão" },
  { codigoTse: "31356", codigoIbge: "2802007", nome: "Divina Pastora", nomeNormalizado: "DIVINA PASTORA", territorio: "Leste Sergipano" },
  { codigoTse: "31372", codigoIbge: "2802106", nome: "Estância", nomeNormalizado: "ESTANCIA", territorio: "Sul Sergipano" },
  { codigoTse: "31399", codigoIbge: "2802205", nome: "Feira Nova", nomeNormalizado: "FEIRA NOVA", territorio: "Médio Sertão" },
  { codigoTse: "31410", codigoIbge: "2802304", nome: "Frei Paulo", nomeNormalizado: "FREI PAULO", territorio: "Agreste Central" },
  { codigoTse: "31437", codigoIbge: "2802403", nome: "Gararu", nomeNormalizado: "GARARU", territorio: "Alto Sertão" },
  { codigoTse: "31453", codigoIbge: "2802502", nome: "General Maynard", nomeNormalizado: "GENERAL MAYNARD", territorio: "Leste Sergipano" },
  { codigoTse: "31470", codigoIbge: "2802601", nome: "Graccho Cardoso", nomeNormalizado: "GRACCHO CARDOSO", territorio: "Médio Sertão" },
  { codigoTse: "31496", codigoIbge: "2802700", nome: "Ilha das Flores", nomeNormalizado: "ILHA DAS FLORES", territorio: "Baixo São Francisco" },
  { codigoTse: "31518", codigoIbge: "2802809", nome: "Indiaroba", nomeNormalizado: "INDIAROBA", territorio: "Sul Sergipano" },
  { codigoTse: "31534", codigoIbge: "2802908", nome: "Itabaiana", nomeNormalizado: "ITABAIANA", territorio: "Agreste Central" },
  { codigoTse: "31550", codigoIbge: "2803005", nome: "Itabaianinha", nomeNormalizado: "ITABAIANINHA", territorio: "Sul Sergipano" },
  { codigoTse: "31577", codigoIbge: "2803104", nome: "Itabi", nomeNormalizado: "ITABI", territorio: "Médio Sertão" },
  { codigoTse: "31593", codigoIbge: "2803203", nome: "Itaporanga d'Ajuda", nomeNormalizado: "ITAPORANGA D AJUDA", territorio: "Grande Aracaju" },
  { codigoTse: "31615", codigoIbge: "2803302", nome: "Japaratuba", nomeNormalizado: "JAPARATUBA", territorio: "Leste Sergipano" },
  { codigoTse: "31631", codigoIbge: "2803401", nome: "Japoatã", nomeNormalizado: "JAPOATA", territorio: "Baixo São Francisco" },
  { codigoTse: "31658", codigoIbge: "2803500", nome: "Lagarto", nomeNormalizado: "LAGARTO", territorio: "Centro Sul" },
  { codigoTse: "31674", codigoIbge: "2803609", nome: "Laranjeiras", nomeNormalizado: "LARANJEIRAS", territorio: "Grande Aracaju" },
  { codigoTse: "31690", codigoIbge: "2803708", nome: "Macambira", nomeNormalizado: "MACAMBIRA", territorio: "Agreste Central" },
  { codigoTse: "31712", codigoIbge: "2803807", nome: "Malhada dos Bois", nomeNormalizado: "MALHADA DOS BOIS", territorio: "Baixo São Francisco" },
  { codigoTse: "31739", codigoIbge: "2803906", nome: "Malhador", nomeNormalizado: "MALHADOR", territorio: "Agreste Central" },
  { codigoTse: "31755", codigoIbge: "2804003", nome: "Maruim", nomeNormalizado: "MARUIM", territorio: "Grande Aracaju" },
  { codigoTse: "31771", codigoIbge: "2804102", nome: "Moita Bonita", nomeNormalizado: "MOITA BONITA", territorio: "Agreste Central" },
  { codigoTse: "31798", codigoIbge: "2804201", nome: "Monte Alegre de Sergipe", nomeNormalizado: "MONTE ALEGRE DE SERGIPE", territorio: "Alto Sertão" },
  { codigoTse: "31810", codigoIbge: "2804300", nome: "Muribeca", nomeNormalizado: "MURIBECA", territorio: "Baixo São Francisco" },
  { codigoTse: "31836", codigoIbge: "2804409", nome: "Neópolis", nomeNormalizado: "NEOPOLIS", territorio: "Baixo São Francisco" },
  { codigoTse: "31852", codigoIbge: "2804458", nome: "Nossa Senhora Aparecida", nomeNormalizado: "NOSSA SENHORA APARECIDA", territorio: "Agreste Central" },
  { codigoTse: "31879", codigoIbge: "2804508", nome: "Nossa Senhora da Glória", nomeNormalizado: "NOSSA SENHORA DA GLORIA", territorio: "Alto Sertão" },
  { codigoTse: "31895", codigoIbge: "2804607", nome: "Nossa Senhora das Dores", nomeNormalizado: "NOSSA SENHORA DAS DORES", territorio: "Médio Sertão" },
  { codigoTse: "31917", codigoIbge: "2804706", nome: "Nossa Senhora de Lourdes", nomeNormalizado: "NOSSA SENHORA DE LOURDES", territorio: "Alto Sertão" },
  { codigoTse: "31933", codigoIbge: "2804805", nome: "Nossa Senhora do Socorro", nomeNormalizado: "NOSSA SENHORA DO SOCORRO", territorio: "Grande Aracaju" },
  { codigoTse: "31950", codigoIbge: "2804904", nome: "Pacatuba", nomeNormalizado: "PACATUBA", territorio: "Baixo São Francisco" },
  { codigoTse: "31976", codigoIbge: "2805000", nome: "Pedra Mole", nomeNormalizado: "PEDRA MOLE", territorio: "Agreste Central" },
  { codigoTse: "31992", codigoIbge: "2805109", nome: "Pedrinhas", nomeNormalizado: "PEDRINHAS", territorio: "Sul Sergipano" },
  { codigoTse: "32018", codigoIbge: "2805208", nome: "Pinhão", nomeNormalizado: "PINHAO", territorio: "Agreste Central" },
  { codigoTse: "32034", codigoIbge: "2805307", nome: "Pirambu", nomeNormalizado: "PIRAMBU", territorio: "Leste Sergipano" },
  { codigoTse: "32050", codigoIbge: "2805406", nome: "Poço Redondo", nomeNormalizado: "POCO REDONDO", territorio: "Alto Sertão" },
  { codigoTse: "32077", codigoIbge: "2805505", nome: "Poço Verde", nomeNormalizado: "POCO VERDE", territorio: "Centro Sul" },
  { codigoTse: "32093", codigoIbge: "2805604", nome: "Porto da Folha", nomeNormalizado: "PORTO DA FOLHA", territorio: "Alto Sertão" },
  { codigoTse: "32115", codigoIbge: "2805703", nome: "Propriá", nomeNormalizado: "PROPRIA", territorio: "Baixo São Francisco" },
  { codigoTse: "32131", codigoIbge: "2805802", nome: "Riachão do Dantas", nomeNormalizado: "RIACHAO DO DANTAS", territorio: "Centro Sul" },
  { codigoTse: "32158", codigoIbge: "2805901", nome: "Riachuelo", nomeNormalizado: "RIACHUELO", territorio: "Grande Aracaju" },
  { codigoTse: "32174", codigoIbge: "2806008", nome: "Ribeirópolis", nomeNormalizado: "RIBEIROPOLIS", territorio: "Agreste Central" },
  { codigoTse: "32190", codigoIbge: "2806107", nome: "Rosário do Catete", nomeNormalizado: "ROSARIO DO CATETE", territorio: "Leste Sergipano" },
  { codigoTse: "32212", codigoIbge: "2806206", nome: "Salgado", nomeNormalizado: "SALGADO", territorio: "Sul Sergipano" },
  { codigoTse: "32239", codigoIbge: "2806305", nome: "Santa Luzia do Itanhy", nomeNormalizado: "SANTA LUZIA DO ITANHY", territorio: "Sul Sergipano" },
  { codigoTse: "32255", codigoIbge: "2806404", nome: "Santana do São Francisco", nomeNormalizado: "SANTANA DO SAO FRANCISCO", territorio: "Baixo São Francisco" },
  { codigoTse: "32271", codigoIbge: "2806503", nome: "Santa Rosa de Lima", nomeNormalizado: "SANTA ROSA DE LIMA", territorio: "Leste Sergipano" },
  { codigoTse: "32298", codigoIbge: "2806602", nome: "Santo Amaro das Brotas", nomeNormalizado: "SANTO AMARO DAS BROTAS", territorio: "Leste Sergipano" },
  { codigoTse: "32310", codigoIbge: "2806701", nome: "São Cristóvão", nomeNormalizado: "SAO CRISTOVAO", territorio: "Grande Aracaju" },
  { codigoTse: "32336", codigoIbge: "2806800", nome: "São Domingos", nomeNormalizado: "SAO DOMINGOS", territorio: "Agreste Central" },
  { codigoTse: "32352", codigoIbge: "2806909", nome: "São Francisco", nomeNormalizado: "SAO FRANCISCO", territorio: "Baixo São Francisco" },
  { codigoTse: "32379", codigoIbge: "2807006", nome: "São Miguel do Aleixo", nomeNormalizado: "SAO MIGUEL DO ALEIXO", territorio: "Agreste Central" },
  { codigoTse: "32395", codigoIbge: "2807105", nome: "Simão Dias", nomeNormalizado: "SIMAO DIAS", territorio: "Centro Sul" },
  { codigoTse: "32417", codigoIbge: "2807204", nome: "Siriri", nomeNormalizado: "SIRIRI", territorio: "Leste Sergipano" },
  { codigoTse: "32433", codigoIbge: "2807303", nome: "Telha", nomeNormalizado: "TELHA", territorio: "Baixo São Francisco" },
  { codigoTse: "32450", codigoIbge: "2807402", nome: "Tobias Barreto", nomeNormalizado: "TOBIAS BARRETO", territorio: "Centro Sul" },
  { codigoTse: "32476", codigoIbge: "2807501", nome: "Tomar do Geru", nomeNormalizado: "TOMAR DO GERU", territorio: "Sul Sergipano" },
  { codigoTse: "32492", codigoIbge: "2807600", nome: "Umbaúba", nomeNormalizado: "UMBAUBA", territorio: "Sul Sergipano" }
];

export const TOTAL_MUNICIPIOS_SERGIPE = 75;

// Mapeamentos rápidos
const MAP_BY_COD_TSE = new Map<string, SergipeMunicipioOficial>();
const MAP_BY_COD_IBGE = new Map<string, SergipeMunicipioOficial>();
const MAP_BY_NOME_NORM = new Map<string, SergipeMunicipioOficial>();
const MUNICIP_ALIASES = new Map<string, SergipeMunicipioOficial>();

SERGIPE_75_MUNICIPIOS.forEach((m) => {
  MAP_BY_COD_TSE.set(m.codigoTse, m);
  // Também mapear com padding/unpadding
  MAP_BY_COD_TSE.set(String(parseInt(m.codigoTse, 10)), m);
  MAP_BY_COD_IBGE.set(m.codigoIbge, m);
  MAP_BY_NOME_NORM.set(m.nomeNormalizado, m);
});

// Aliases e variações comuns encontradas em arquivos TSE e planilhas
const EXTRA_SERGIPE_ALIASES: Record<string, string> = {
  "SOCORRO": "Nossa Senhora do Socorro",
  "N S DO SOCORRO": "Nossa Senhora do Socorro",
  "NOSSA SRA DO SOCORRO": "Nossa Senhora do Socorro",
  "NS DO SOCORRO": "Nossa Senhora do Socorro",
  "GLORIA": "Nossa Senhora da Glória",
  "NS DA GLORIA": "Nossa Senhora da Glória",
  "N S DA GLORIA": "Nossa Senhora da Glória",
  "NOSSA SRA DA GLORIA": "Nossa Senhora da Glória",
  "DORES": "Nossa Senhora das Dores",
  "NS DAS DORES": "Nossa Senhora das Dores",
  "N S DAS DORES": "Nossa Senhora das Dores",
  "NOSSA SRA DAS DORES": "Nossa Senhora das Dores",
  "LOURDES": "Nossa Senhora de Lourdes",
  "NS DE LOURDES": "Nossa Senhora de Lourdes",
  "N S DE LOURDES": "Nossa Senhora de Lourdes",
  "NOSSA SRA DE LOURDES": "Nossa Senhora de Lourdes",
  "APARECIDA": "Nossa Senhora Aparecida",
  "NS APARECIDA": "Nossa Senhora Aparecida",
  "N S APARECIDA": "Nossa Senhora Aparecida",
  "NOSSA SRA APARECIDA": "Nossa Senhora Aparecida",
  "SANTA LUZIA DO ITANHI": "Santa Luzia do Itanhy",
  "STA LUZIA DO ITANHY": "Santa Luzia do Itanhy",
  "STA LUZIA DO ITANHI": "Santa Luzia do Itanhy",
  "MONTE ALEGRE": "Monte Alegre de Sergipe",
  "AMPARO DO SAO FRANCISCO": "Amparo de São Francisco",
  "CANINDE DO SAO FRANCISCO": "Canindé de São Francisco",
  "CANINDE DE SAO FRANCISCO": "Canindé de São Francisco",
  "CANINDE": "Canindé de São Francisco",
  "SANTANA DE SAO FRANCISCO": "Santana do São Francisco",
  "SANTANA DO SAO FRANCISCO": "Santana do São Francisco",
  "SAO CRISTOVAO": "São Cristóvão",
  "S CRISTOVAO": "São Cristóvão",
  "STO AMARO DAS BROTAS": "Santo Amaro das Brotas",
  "SANTO AMARO": "Santo Amaro das Brotas",
  "STA ROSA DE LIMA": "Santa Rosa de Lima",
  "S FRANCISCO": "São Francisco",
  "S DOMINGOS": "São Domingos",
  "S MIGUEL DO ALEIXO": "São Miguel do Aleixo",
  "ALEIXO": "São Miguel do Aleixo",
  "ITAPORANGA": "Itaporanga d'Ajuda",
  "ITAPORANGA D AJUDA": "Itaporanga d'Ajuda",
  "ITAPORANGA D'AJUDA": "Itaporanga d'Ajuda",
  "BARRA": "Barra dos Coqueiros",
  "BARRA DOS COQUEIROS": "Barra dos Coqueiros",
  "GRACHO CARDOSO": "Graccho Cardoso",
  "GRACCHO CARDOSO": "Graccho Cardoso",
  "MALHADA": "Malhada dos Bois",
  "MALHADA DOS BOIS": "Malhada dos Bois",
  "TOBIAS": "Tobias Barreto",
  "TOBIAS BARRETO": "Tobias Barreto",
  "SIMAO DIAS": "Simão Dias",
  "POCO VERDE": "Poço Verde",
  "POCO REDONDO": "Poço Redondo",
  "PEDRA MOLE": "Pedra Mole",
  "FEIRA NOVA": "Feira Nova",
  "AREIA BRANCA": "Areia Branca",
  "CAMPO DO BRITO": "Campo do Brito",
  "FREI PAULO": "Frei Paulo",
  "RIBEIROPOLIS": "Ribeirópolis",
  "SAO DOMINGOS": "São Domingos",
  "SAO MIGUEL DO ALEIXO": "São Miguel do Aleixo",
  "MACAMBIRA": "Macambira",
  "CARIRA": "Carira",
  "PINHAO": "Pinhão",
  "MOITA BONITA": "Moita Bonita",
  "MALHADOR": "Malhador",
  "BOQUIM": "Boquim",
  "BREJO GRANDE": "Brejo Grande",
  "ESTANCIA": "Estância",
  "ITABAIANA": "Itabaiana",
  "ITABAIANINHA": "Itabaianinha",
  "ITABI": "Itabi",
  "JAPARATUBA": "Japaratuba",
  "JAPOATA": "Japoatã",
  "LAGARTO": "Lagarto",
  "LARANJEIRAS": "Laranjeiras",
  "MARUIM": "Maruim",
  "MURIBECA": "Muribeca",
  "NEOPOLIS": "Neópolis",
  "PACATUBA": "Pacatuba",
  "PEDRINHAS": "Pedrinhas",
  "PIRAMBU": "Pirambu",
  "PROPRIA": "Propriá",
  "RIACHAO DO DANTAS": "Riachão do Dantas",
  "RIACHUELO": "Riachuelo",
  "ROSARIO DO CATETE": "Rosário do Catete",
  "SALGADO": "Salgado",
  "SIRIRI": "Siriri",
  "TELHA": "Telha",
  "TOMAR DO GERU": "Tomar do Geru",
  "TOMAR DO GERÚ": "Tomar do Geru",
  "TOMAR DE GERU": "Tomar do Geru",
  "UMBAUBA": "Umbaúba"
};

Object.entries(EXTRA_SERGIPE_ALIASES).forEach(([alias, targetName]) => {
  const normAlias = normalizeMunicipioStr(alias);
  const found = SERGIPE_75_MUNICIPIOS.find((m) => m.nome.toLowerCase() === targetName.toLowerCase());
  if (found) {
    MUNICIP_ALIASES.set(normAlias, found);
  }
});

export function normalizeMunicipioStr(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Localiza município oficial por Código TSE, Código IBGE ou Nome
 */
export function findSergipeMunicipio(keyOrCode: string | number): SergipeMunicipioOficial | undefined {
  if (!keyOrCode) return undefined;
  const str = String(keyOrCode).trim();
  
  // Tentar pelo Código TSE direto
  if (MAP_BY_COD_TSE.has(str)) return MAP_BY_COD_TSE.get(str);
  
  // Tentar pelo Código TSE numérico
  const num = parseInt(str, 10);
  if (!isNaN(num) && MAP_BY_COD_TSE.has(String(num))) {
    return MAP_BY_COD_TSE.get(String(num));
  }
  
  // Tentar pelo Código IBGE
  if (MAP_BY_COD_IBGE.has(str)) return MAP_BY_COD_IBGE.get(str);

  // Tentar pelo nome normalizado
  const norm = normalizeMunicipioStr(str);
  if (MAP_BY_NOME_NORM.has(norm)) return MAP_BY_NOME_NORM.get(norm);

  // Tentar aliases conhecidos
  if (MUNICIP_ALIASES.has(norm)) return MUNICIP_ALIASES.get(norm);

  // Busca aproximada caso contenha
  for (const m of SERGIPE_75_MUNICIPIOS) {
    if (norm.includes(m.nomeNormalizado) || m.nomeNormalizado.includes(norm)) {
      return m;
    }
  }

  return undefined;
}

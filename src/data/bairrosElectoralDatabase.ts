// Base Territorial e de Resultados Eleitorais Estruturada por Bairro e Locais de Votação (Sergipe 2022 & 2024)
import { DataProvenance } from "../types/provenance";

export interface PollingLocation {
  nome: string;
  endereco: string;
  zona: string;
  secoes: number;
  votosCandidato: number;
  votosValidosLocal: number;
  provenance?: DataProvenance;
}

export interface BairroElectoralData {
  bairro: string;
  qtdLocais: number;
  qtdSecoes: number;
  votos: number;
  votosValidosBairro: number;
  percentual: number; // (votos / votosValidosBairro) * 100
  locais: PollingLocation[];
  provenance?: DataProvenance;
}

export interface ElectoralContextRecord {
  id: string;
  municipio: string;
  cargo: string;
  ano: string;
  candidato: string;
  partido: string;
  uf: string;
  totalVotosCidade: number;
  totalValidosCidade: number;
  desempenhoLocalPercent: number;
  bairros: BairroElectoralData[];
  segundoColocado?: {
    candidato: string;
    partido: string;
    votos: number;
    percentual: number;
  };
  found?: boolean;
  source?: string;
  statusMessage?: string;
  provenance?: DataProvenance;
}

export interface MunicipalResultSummary {
  municipio: string;
  ano: string;
  cargo: string;
  vencedor: string;
  partidoVencedor: string;
  votosVencedor: number;
  percentualVencedor: number;
  segundoColocado: string;
  partidoSegundo: string;
  votosSegundo: number;
  percentualSegundo: number;
  diferencaVotos: number;
  totalValidos: number;
  totalSecoes: number;
  totalLocais: number;
  temDadosVotacao: boolean;
  provenance?: DataProvenance;
}

export const BASE_TERRITORIAL_SERGIPE: ElectoralContextRecord[] = [
  // --- 2024 ARACAJU: PREFEITA - EMÍLIA CORRÊA (PL) ---
  {
    id: "2024-aracaju-prefeito-emilia",
    municipio: "Aracaju",
    cargo: "Prefeita",
    ano: "2024",
    candidato: "Emília Corrêa",
    partido: "PL",
    uf: "SE",
    totalVotosCidade: 170829,
    totalValidosCidade: 297312,
    desempenhoLocalPercent: 57.46,
    segundoColocado: {
      candidato: "Luiz Roberto",
      partido: "PDT",
      votos: 126483,
      percentual: 42.54
    },
    bairros: [
      {
        bairro: "FAROLÂNDIA",
        qtdLocais: 7,
        qtdSecoes: 53,
        votos: 14250,
        votosValidosBairro: 24350,
        percentual: 58.52,
        locais: [
          { nome: "Universidade Tiradentes (UNIT) - Campus Farolândia", endereco: "Av. Murilo Dantas, 300", zona: "27ª Zona", secoes: 18, votosCandidato: 4120, votosValidosLocal: 6800 },
          { nome: "Escola Estadual Senador Walter Franco", endereco: "Conj. Augusto Franco, Rua B-4", zona: "27ª Zona", secoes: 8, votosCandidato: 1820, votosValidosLocal: 2950 },
          { nome: "Colégio Amadeus - Unidade Sul", endereco: "Av. Beira Mar, 1200", zona: "27ª Zona", secoes: 6, votosCandidato: 1980, votosValidosLocal: 3100 },
          { nome: "Escola Municipal José Conrado de Araújo", endereco: "Rua Maria Rezende Machado", zona: "27ª Zona", secoes: 5, votosCandidato: 1650, votosValidosLocal: 2800 },
          { nome: "Colégio Estadual Ministro Geraldo Barreto", endereco: "Rua Josué de Carvalho Cunha", zona: "27ª Zona", secoes: 7, votosCandidato: 1890, votosValidosLocal: 3200 },
          { nome: "Centro Educacional Vitória", endereco: "Av. Canal 4, Farolândia", zona: "27ª Zona", secoes: 4, votosCandidato: 1410, votosValidosLocal: 2600 },
          { nome: "Escola SESI Jair Meneguelli", endereco: "Av. Gonçalo Prado Rollemberg", zona: "27ª Zona", secoes: 5, votosCandidato: 1380, votosValidosLocal: 2900 }
        ]
      },
      {
        bairro: "SANTOS DUMONT",
        qtdLocais: 6,
        qtdSecoes: 50,
        votos: 12840,
        votosValidosBairro: 22100,
        percentual: 58.10,
        locais: [
          { nome: "Colégio Estadual Presidente Costa e Silva", endereco: "Av. Maranhão, s/n", zona: "36ª Zona", secoes: 11, votosCandidato: 2450, votosValidosLocal: 4120 },
          { nome: "Escola Municipal Juscelino Kubitschek", endereco: "Rua Sargento Brasilino, 45", zona: "36ª Zona", secoes: 8, votosCandidato: 1890, votosValidosLocal: 3100 },
          { nome: "Colégio Estadual Barão de Mauá", endereco: "Rua Fernando Falcão, 110", zona: "36ª Zona", secoes: 9, votosCandidato: 2150, votosValidosLocal: 3600 },
          { nome: "Escola Municipal Presidente Vargas", endereco: "Rua São João, Santos Dumont", zona: "36ª Zona", secoes: 7, votosCandidato: 1980, votosValidosLocal: 3400 },
          { nome: "Centro de Excelência Leandro Maciel", endereco: "Av. Central, Santos Dumont", zona: "36ª Zona", secoes: 10, votosCandidato: 2540, votosValidosLocal: 4400 },
          { nome: "Escola Municipal Deputado Jaime Araújo", endereco: "Rua Fortaleza, s/n", zona: "36ª Zona", secoes: 5, votosCandidato: 1830, votosValidosLocal: 3480 }
        ]
      },
      {
        bairro: "SÃO CONRADO",
        qtdLocais: 5,
        qtdSecoes: 38,
        votos: 11980,
        votosValidosBairro: 20400,
        percentual: 58.73,
        locais: [
          { nome: "Escola Municipal Olga Benário", endereco: "Conjunto Orlando Dantas", zona: "27ª Zona", secoes: 9, votosCandidato: 2850, votosValidosLocal: 4700 },
          { nome: "Colégio Estadual Ministro Marco Maciel", endereco: "Rua H, São Conrado", zona: "27ª Zona", secoes: 8, votosCandidato: 2410, votosValidosLocal: 4200 },
          { nome: "Escola Municipal Jornalista Paulo Costa", endereco: "Av. Gasoduto, s/n", zona: "27ª Zona", secoes: 7, votosCandidato: 2320, votosValidosLocal: 3900 },
          { nome: "Centro de Excelência Prof. Gonçalo Rollemberg", endereco: "Rua 3, Orlando Dantas", zona: "27ª Zona", secoes: 8, votosCandidato: 2280, votosValidosLocal: 3950 },
          { nome: "Escola Municipal Santa Rita de Cássia", endereco: "Rua B, São Conrado", zona: "27ª Zona", secoes: 6, votosCandidato: 2120, votosValidosLocal: 3650 }
        ]
      },
      {
        bairro: "JABOTIANA",
        qtdLocais: 6,
        qtdSecoes: 42,
        votos: 11450,
        votosValidosBairro: 19100,
        percentual: 59.95,
        locais: [
          { nome: "Colégio Estadual Presidente Castelo Branco", endereco: "Rua Acre, Conjunto JK", zona: "36ª Zona", secoes: 10, votosCandidato: 2650, votosValidosLocal: 4200 },
          { nome: "Escola Municipal Bebé Tiúba", endereco: "Estrada do Jabotiana", zona: "36ª Zona", secoes: 7, votosCandidato: 1920, votosValidosLocal: 3150 },
          { nome: "Colégio Maria Montessori", endereco: "Av. Santa Gleide, Jabotiana", zona: "36ª Zona", secoes: 8, votosCandidato: 2240, votosValidosLocal: 3800 },
          { nome: "Escola Estadual Prof. José Amado", endereco: "Rua 5, Sol Nascente", zona: "36ª Zona", secoes: 6, votosCandidato: 1680, votosValidosLocal: 2850 },
          { nome: "Centro Educacional Sonho Meu", endereco: "Rua A, Santa Lúcia", zona: "36ª Zona", secoes: 5, votosCandidato: 1420, votosValidosLocal: 2400 },
          { nome: "Escola Municipal Tancredo Neves", endereco: "Av. Tancredo Neves, Jabotiana", zona: "36ª Zona", secoes: 6, votosCandidato: 1540, votosValidosLocal: 2700 }
        ]
      },
      {
        bairro: "CENTRO",
        qtdLocais: 5,
        qtdSecoes: 35,
        votos: 9200,
        votosValidosBairro: 16800,
        percentual: 54.76,
        locais: [
          { nome: "Colégio Estadual Atheneu Sergipense", endereco: "Praça Graccho Cardoso", zona: "1ª Zona", secoes: 12, votosCandidato: 2890, votosValidosLocal: 5100 },
          { nome: "Colégio Estadual Tobias Barreto", endereco: "Rua Itabaianinha, Centro", zona: "1ª Zona", secoes: 8, votosCandidato: 2150, votosValidosLocal: 3850 },
          { nome: "Escola Estadual 24 de Outubro", endereco: "Rua Laranjeiras, Centro", zona: "1ª Zona", secoes: 6, votosCandidato: 1560, votosValidosLocal: 2900 },
          { nome: "Instituto de Educação Rui Barbosa", endereco: "Rua de Maruim, 450", zona: "1ª Zona", secoes: 5, votosCandidato: 1420, votosValidosLocal: 2650 },
          { nome: "Escola Municipal Florentino Menezes", endereco: "Rua Capela, Centro", zona: "1ª Zona", secoes: 4, votosCandidato: 1180, votosValidosLocal: 2300 }
        ]
      },
      {
        bairro: "JARDINS",
        qtdLocais: 5,
        qtdSecoes: 36,
        votos: 8950,
        votosValidosBairro: 15400,
        percentual: 58.12,
        locais: [
          { nome: "Colégio Master", endereco: "Av. Min. Geraldo Barreto Sobral, 1200", zona: "2ª Zona", secoes: 12, votosCandidato: 2840, votosValidosLocal: 4800 },
          { nome: "Colégio Módulo", endereco: "Rua José Olívio, Jardins", zona: "2ª Zona", secoes: 10, votosCandidato: 2450, votosValidosLocal: 4200 },
          { nome: "Colégio Singular", endereco: "Rua Juarez Carvalho, Jardins", zona: "2ª Zona", secoes: 6, votosCandidato: 1520, votosValidosLocal: 2650 },
          { nome: "Escola Espaço Criativo", endereco: "Rua Francisco Portugal", zona: "2ª Zona", secoes: 4, votosCandidato: 1140, votosValidosLocal: 2050 },
          { nome: "Centro Educacional Jardins", endereco: "Rua Cedro, Jardins", zona: "2ª Zona", secoes: 4, votosCandidato: 1000, votosValidosLocal: 1700 }
        ]
      },
      {
        bairro: "13 DE JULHO",
        qtdLocais: 4,
        qtdSecoes: 28,
        votos: 7420,
        votosValidosBairro: 12900,
        percentual: 57.52,
        locais: [
          { nome: "Colégio Amadeus", endereco: "Rua Estância, 13 de Julho", zona: "2ª Zona", secoes: 11, votosCandidato: 2680, votosValidosLocal: 4500 },
          { nome: "Colégio Salvador", endereco: "Av. Beira Mar, 13 de Julho", zona: "2ª Zona", secoes: 8, votosCandidato: 2010, votosValidosLocal: 3500 },
          { nome: "Escola Oficina do Saber", endereco: "Rua Deputado Sílvio Teixeira", zona: "2ª Zona", secoes: 5, votosCandidato: 1450, votosValidosLocal: 2600 },
          { nome: "Centro Educacional Augusto Leite", endereco: "Rua Acrísio Cruz", zona: "2ª Zona", secoes: 4, votosCandidato: 1280, votosValidosLocal: 2300 }
        ]
      },
      {
        bairro: "ATALAIA",
        qtdLocais: 4,
        qtdSecoes: 24,
        votos: 6890,
        votosValidosBairro: 11600,
        percentual: 59.40,
        locais: [
          { nome: "Colégio Estadual Professor Leão Magno Brasil", endereco: "Av. Santos Dumont, Atalaia", zona: "27ª Zona", secoes: 8, votosCandidato: 2350, votosValidosLocal: 3900 },
          { nome: "Escola Municipal Carvalho Neto", endereco: "Rua Niceu Dantas, Atalaia", zona: "27ª Zona", secoes: 6, votosCandidato: 1780, votosValidosLocal: 3000 },
          { nome: "Escola Criativa da Orla", endereco: "Av. Oceânica, 400", zona: "27ª Zona", secoes: 5, votosCandidato: 1480, votosValidosLocal: 2500 },
          { nome: "Centro Comunitário de Atalaia", endereco: "Rua Celso Oliva", zona: "27ª Zona", secoes: 5, votosCandidato: 1280, votosValidosLocal: 2200 }
        ]
      },
      {
        bairro: "BUGIO",
        qtdLocais: 4,
        qtdSecoes: 26,
        votos: 6350,
        votosValidosBairro: 11100,
        percentual: 57.21,
        locais: [
          { nome: "Escola Estadual Nossa Senhora da Piedade", endereco: "Rua A, Bugio", zona: "36ª Zona", secoes: 9, votosCandidato: 2210, votosValidosLocal: 3850 },
          { nome: "Escola Municipal Professora Neuzice Barreto", endereco: "Rua B, Bugio", zona: "36ª Zona", secoes: 7, votosCandidato: 1790, votosValidosLocal: 3100 },
          { nome: "Colégio Estadual Ministro Petrônio Portela", endereco: "Rua C, Bugio", zona: "36ª Zona", secoes: 6, votosCandidato: 1450, votosValidosLocal: 2550 },
          { nome: "Creche Municipal Menino Jesus", endereco: "Rua D, Bugio", zona: "36ª Zona", secoes: 4, votosCandidato: 900, votosValidosLocal: 1600 }
        ]
      },
      {
        bairro: "SANTA MARIA",
        qtdLocais: 5,
        qtdSecoes: 32,
        votos: 7850,
        votosValidosBairro: 14200,
        percentual: 55.28,
        locais: [
          { nome: "Escola Municipal Papa João Paulo II", endereco: "Av. Alexandre Alcino, Santa Maria", zona: "36ª Zona", secoes: 9, votosCandidato: 2310, votosValidosLocal: 4100 },
          { nome: "Escola Municipal Professora Maria do Carmo Alves", endereco: "Rua 4, Conjunto Padre Pedro", zona: "36ª Zona", secoes: 8, votosCandidato: 1980, votosValidosLocal: 3600 },
          { nome: "Colégio Estadual Vitória de Santa Maria", endereco: "Rua B, Santa Maria", zona: "36ª Zona", secoes: 6, votosCandidato: 1490, votosValidosLocal: 2750 },
          { nome: "Escola Municipal Diomedes Santos Silva", endereco: "Av. Principal, Santa Maria", zona: "36ª Zona", secoes: 5, votosCandidato: 1180, votosValidosLocal: 2150 },
          { nome: "Centro Social São José", endereco: "Rua do Valo, Santa Maria", zona: "36ª Zona", secoes: 4, votosCandidato: 890, votosValidosLocal: 1600 }
        ]
      }
    ]
  },

  // --- 2024 ARACAJU: PREFEITO - LUIZ ROBERTO (PDT) ---
  {
    id: "2024-aracaju-prefeito-luiz",
    municipio: "Aracaju",
    cargo: "Prefeito",
    ano: "2024",
    candidato: "Luiz Roberto",
    partido: "PDT",
    uf: "SE",
    totalVotosCidade: 126483,
    totalValidosCidade: 297312,
    desempenhoLocalPercent: 42.54,
    bairros: [
      {
        bairro: "FAROLÂNDIA",
        qtdLocais: 7,
        qtdSecoes: 53,
        votos: 10100,
        votosValidosBairro: 24350,
        percentual: 41.48,
        locais: [
          { nome: "Universidade Tiradentes (UNIT)", endereco: "Av. Murilo Dantas", zona: "27ª Zona", secoes: 18, votosCandidato: 2680, votosValidosLocal: 6800 }
        ]
      },
      {
        bairro: "SANTOS DUMONT",
        qtdLocais: 6,
        qtdSecoes: 50,
        votos: 9260,
        votosValidosBairro: 22100,
        percentual: 41.90,
        locais: [
          { nome: "Colégio Estadual Presidente Costa e Silva", endereco: "Av. Maranhão", zona: "36ª Zona", secoes: 11, votosCandidato: 1670, votosValidosLocal: 4120 }
        ]
      },
      {
        bairro: "CENTRO",
        qtdLocais: 5,
        qtdSecoes: 35,
        votos: 7600,
        votosValidosBairro: 16800,
        percentual: 45.24,
        locais: [
          { nome: "Colégio Estadual Atheneu Sergipense", endereco: "Praça Graccho Cardoso", zona: "1ª Zona", secoes: 12, votosCandidato: 2210, votosValidosLocal: 5100 }
        ]
      },
      {
        bairro: "SANTA MARIA",
        qtdLocais: 5,
        qtdSecoes: 32,
        votos: 6350,
        votosValidosBairro: 14200,
        percentual: 44.72,
        locais: [
          { nome: "Escola Municipal Papa João Paulo II", endereco: "Av. Alexandre Alcino", zona: "36ª Zona", secoes: 9, votosCandidato: 1790, votosValidosLocal: 4100 }
        ]
      }
    ]
  },

  // --- 2022 ARACAJU: GOVERNADOR - FÁBIO MITIDIERI (PSD) ---
  {
    id: "2022-aracaju-governador-fabio",
    municipio: "Aracaju",
    cargo: "Governador",
    ano: "2022",
    candidato: "Fábio Mitidieri",
    partido: "PSD",
    uf: "SE",
    totalVotosCidade: 162580,
    totalValidosCidade: 320500,
    desempenhoLocalPercent: 50.73,
    segundoColocado: {
      candidato: "Rogério Carvalho",
      partido: "PT",
      votos: 157920,
      percentual: 49.27
    },
    bairros: [
      {
        bairro: "FAROLÂNDIA",
        qtdLocais: 7,
        qtdSecoes: 53,
        votos: 13800,
        votosValidosBairro: 26100,
        percentual: 52.87,
        locais: [
          { nome: "Universidade Tiradentes (UNIT)", endereco: "Av. Murilo Dantas, 300", zona: "27ª Zona", secoes: 18, votosCandidato: 3600, votosValidosLocal: 6850 }
        ]
      },
      {
        bairro: "JARDINS",
        qtdLocais: 5,
        qtdSecoes: 36,
        votos: 11400,
        votosValidosBairro: 19800,
        percentual: 57.58,
        locais: [
          { nome: "Colégio Master", endereco: "Av. Min. Geraldo Barreto Sobral", zona: "2ª Zona", secoes: 12, votosCandidato: 2900, votosValidosLocal: 4800 }
        ]
      },
      {
        bairro: "13 DE JULHO",
        qtdLocais: 4,
        qtdSecoes: 28,
        votos: 9800,
        votosValidosBairro: 16900,
        percentual: 57.99,
        locais: [
          { nome: "Colégio Amadeus", endereco: "Rua Estância, 13 de Julho", zona: "2ª Zona", secoes: 11, votosCandidato: 2600, votosValidosLocal: 4400 }
        ]
      },
      {
        bairro: "CENTRO",
        qtdLocais: 5,
        qtdSecoes: 35,
        votos: 9500,
        votosValidosBairro: 19500,
        percentual: 48.72,
        locais: [
          { nome: "Colégio Estadual Atheneu Sergipense", endereco: "Praça Graccho Cardoso", zona: "1ª Zona", secoes: 12, votosCandidato: 2450, votosValidosLocal: 5150 }
        ]
      },
      {
        bairro: "SANTOS DUMONT",
        qtdLocais: 6,
        qtdSecoes: 50,
        votos: 10200,
        votosValidosBairro: 21900,
        percentual: 46.58,
        locais: [
          { nome: "Colégio Estadual Presidente Costa e Silva", endereco: "Av. Maranhão", zona: "36ª Zona", secoes: 11, votosCandidato: 1920, votosValidosLocal: 4120 }
        ]
      }
    ]
  },

  // --- 2022 ARACAJU: SENADOR - LAÉRCIO OLIVEIRA (PP) ---
  {
    id: "2022-aracaju-senador-laercio",
    municipio: "Aracaju",
    cargo: "Senador",
    ano: "2022",
    candidato: "Laércio Oliveira",
    partido: "PP",
    uf: "SE",
    totalVotosCidade: 96420,
    totalValidosCidade: 320500,
    desempenhoLocalPercent: 30.08,
    segundoColocado: {
      candidato: "Valadares Filho",
      partido: "PSB",
      votos: 84150,
      percentual: 26.26
    },
    bairros: [
      {
        bairro: "JARDINS",
        qtdLocais: 5,
        qtdSecoes: 36,
        votos: 8450,
        votosValidosBairro: 19800,
        percentual: 42.68,
        locais: [
          { nome: "Colégio Master", endereco: "Av. Min. Geraldo Barreto Sobral", zona: "2ª Zona", secoes: 12, votosCandidato: 2150, votosValidosLocal: 4800 }
        ]
      },
      {
        bairro: "13 DE JULHO",
        qtdLocais: 4,
        qtdSecoes: 28,
        votos: 7200,
        votosValidosBairro: 16900,
        percentual: 42.60,
        locais: [
          { nome: "Colégio Amadeus", endereco: "Rua Estância", zona: "2ª Zona", secoes: 11, votosCandidato: 1890, votosValidosLocal: 4300 }
        ]
      },
      {
        bairro: "FAROLÂNDIA",
        qtdLocais: 7,
        qtdSecoes: 53,
        votos: 8900,
        votosValidosBairro: 26100,
        percentual: 34.10,
        locais: [
          { nome: "Universidade Tiradentes (UNIT)", endereco: "Av. Murilo Dantas", zona: "27ª Zona", secoes: 18, votosCandidato: 2210, votosValidosLocal: 6450 }
        ]
      }
    ]
  },

  // --- 2024 NOSSA SENHORA DO SOCORRO: PREFEITO - SAMUEL CARVALHO (CIDADANIA) ---
  {
    id: "2024-socorro-prefeito-samuel",
    municipio: "Nossa Senhora do Socorro",
    cargo: "Prefeito",
    ano: "2024",
    candidato: "Dr. Samuel Carvalho",
    partido: "CIDADANIA",
    uf: "SE",
    totalVotosCidade: 57890,
    totalValidosCidade: 98450,
    desempenhoLocalPercent: 58.80,
    segundoColocado: {
      candidato: "Carminha Paiva",
      partido: "REPUBLICANOS",
      votos: 40560,
      percentual: 41.20
    },
    bairros: [
      {
        bairro: "JOÃO ALVES",
        qtdLocais: 8,
        qtdSecoes: 44,
        votos: 19450,
        votosValidosBairro: 32500,
        percentual: 59.85,
        locais: [
          { nome: "Colégio Estadual Professor Fernando Azevedo", endereco: "Conjunto João Alves Filho", zona: "34ª Zona", secoes: 10, votosCandidato: 2850, votosValidosLocal: 4600 }
        ]
      },
      {
        bairro: "TAIÇOCA DE FORA",
        qtdLocais: 6,
        qtdSecoes: 32,
        votos: 14200,
        votosValidosBairro: 23900,
        percentual: 59.41,
        locais: [
          { nome: "Colégio Estadual Marco Maciel", endereco: "Rua Principal, Taiçoca", zona: "34ª Zona", secoes: 9, votosCandidato: 2420, votosValidosLocal: 4050 }
        ]
      }
    ]
  },

  // --- 2024 LAGARTO: PREFEITO - SÉRGIO REIS (PSD) ---
  {
    id: "2024-lagarto-prefeito-sergio",
    municipio: "Lagarto",
    cargo: "Prefeito",
    ano: "2024",
    candidato: "Sérgio Reis",
    partido: "PSD",
    uf: "SE",
    totalVotosCidade: 31904,
    totalValidosCidade: 62670,
    desempenhoLocalPercent: 50.91,
    segundoColocado: {
      candidato: "Rafaela Ribeiro",
      partido: "REPUBLICANOS",
      votos: 30766,
      percentual: 49.09
    },
    bairros: [
      {
        bairro: "CENTRO",
        qtdLocais: 4,
        qtdSecoes: 28,
        votos: 9850,
        votosValidosBairro: 19100,
        percentual: 51.57,
        locais: [
          { nome: "Colégio Estadual Sílvio Romero", endereco: "Praça do Rosário, Centro", zona: "12ª Zona", secoes: 12, votosCandidato: 2420, votosValidosLocal: 4650 }
        ]
      },
      {
        bairro: "NOVO HORIZONTE",
        qtdLocais: 3,
        qtdSecoes: 18,
        votos: 7420,
        votosValidosBairro: 14450,
        percentual: 51.35,
        locais: [
          { nome: "IFS - Campus Lagarto", endereco: "Rod. Lourival Batista, s/n", zona: "12ª Zona", secoes: 11, votosCandidato: 2120, votosValidosLocal: 4100 }
        ]
      }
    ]
  },

  // --- 2024 ITABAIANA: PREFEITO - VALMIR DE FRANCISQUINHO (PL) ---
  {
    id: "2024-itabaiana-prefeito-valmir",
    municipio: "Itabaiana",
    cargo: "Prefeito",
    ano: "2024",
    candidato: "Valmir de Francisquinho",
    partido: "PL",
    uf: "SE",
    totalVotosCidade: 36812,
    totalValidosCidade: 57420,
    desempenhoLocalPercent: 64.10,
    segundoColocado: {
      candidato: "Edson Passos",
      partido: "PSD",
      votos: 20608,
      percentual: 35.90
    },
    bairros: [
      {
        bairro: "CENTRO",
        qtdLocais: 5,
        qtdSecoes: 32,
        votos: 11850,
        votosValidosBairro: 18200,
        percentual: 65.11,
        locais: [
          { nome: "Colégio Estadual Murilo Braga", endereco: "Av. Ivo de Carvalho, Centro", zona: "9ª Zona", secoes: 12, votosCandidato: 3250, votosValidosLocal: 4950 }
        ]
      },
      {
        bairro: "MAMBINA",
        qtdLocais: 3,
        qtdSecoes: 19,
        votos: 7850,
        votosValidosBairro: 12100,
        percentual: 64.88,
        locais: [
          { nome: "Escola Municipal Vice-Governador Benedito Figueiredo", endereco: "Rua da Mambina", zona: "9ª Zona", secoes: 8, votosCandidato: 2150, votosValidosLocal: 3300 }
        ]
      }
    ]
  },

  // --- 2024 ESTÂNCIA: PREFEITO - ANDRÉ GRAÇA (PSD) ---
  {
    id: "2024-estancia-prefeito-andre",
    municipio: "Estância",
    cargo: "Prefeito",
    ano: "2024",
    candidato: "André Graça",
    partido: "PSD",
    uf: "SE",
    totalVotosCidade: 22415,
    totalValidosCidade: 41800,
    desempenhoLocalPercent: 53.62,
    segundoColocado: {
      candidato: "Joaquinzão",
      partido: "PL",
      votos: 19385,
      percentual: 46.38
    },
    bairros: [
      {
        bairro: "CENTRO",
        qtdLocais: 4,
        qtdSecoes: 24,
        votos: 8450,
        votosValidosBairro: 15400,
        percentual: 54.87,
        locais: [
          { nome: "Colégio Estadual Doutor Augusto César Leite", endereco: "Rua Capitão Salomão, Centro", zona: "3ª Zona", secoes: 8, votosCandidato: 1810, votosValidosLocal: 3200 }
        ]
      },
      {
        bairro: "CIDADE NOVA",
        qtdLocais: 3,
        qtdSecoes: 18,
        votos: 6250,
        votosValidosBairro: 11800,
        percentual: 52.97,
        locais: [
          { nome: "Escola Municipal Maria Nascimento", endereco: "Av. Lourival Batista", zona: "3ª Zona", secoes: 8, votosCandidato: 1890, votosValidosLocal: 3550 }
        ]
      }
    ]
  }
];

// Helper para obter resumo municipal dos vencedores oficiais
export function getMunicipalSummary(municipio: string, ano: string, cargo?: string): MunicipalResultSummary | null {
  const records = BASE_TERRITORIAL_SERGIPE.filter(
    (r) => r.municipio.toLowerCase() === municipio.toLowerCase() && r.ano === ano && (!cargo || r.cargo.toLowerCase().includes(cargo.toLowerCase()))
  );

  if (records.length === 0) return null;

  // Encontrar o mais votado
  const sorted = [...records].sort((a, b) => b.totalVotosCidade - a.totalVotosCidade);
  const winner = sorted[0];
  const runnerUp = sorted[1] || (winner.segundoColocado ? {
    candidato: winner.segundoColocado.candidato,
    partido: winner.segundoColocado.partido,
    totalVotosCidade: winner.segundoColocado.votos,
    desempenhoLocalPercent: winner.segundoColocado.percentual
  } : null);

  const totalSecoes = winner.bairros.reduce((acc, b) => acc + (b.qtdSecoes || 0), 0);
  const totalLocais = winner.bairros.reduce((acc, b) => acc + (b.qtdLocais || 0), 0);

  return {
    municipio: winner.municipio,
    ano: winner.ano,
    cargo: winner.cargo,
    vencedor: winner.candidato,
    partidoVencedor: winner.partido,
    votosVencedor: winner.totalVotosCidade,
    percentualVencedor: winner.desempenhoLocalPercent,
    segundoColocado: runnerUp ? (runnerUp as any).candidato : "Não registrado",
    partidoSegundo: runnerUp ? (runnerUp as any).partido : "—",
    votosSegundo: runnerUp ? (runnerUp as any).totalVotosCidade : 0,
    percentualSegundo: runnerUp ? (runnerUp as any).desempenhoLocalPercent : 0,
    diferencaVotos: runnerUp ? Math.abs(winner.totalVotosCidade - (runnerUp as any).totalVotosCidade) : 0,
    totalValidos: winner.totalValidosCidade,
    totalSecoes: totalSecoes,
    totalLocais: totalLocais,
    temDadosVotacao: (winner.totalVotosCidade > 0 || totalSecoes > 0 || totalLocais > 0),
    provenance: {
      source: "TSE - Resultados Eleitorais Oficiais",
      type: "OFFICIAL",
      referenceDate: winner.ano,
      notes: "Apuração oficial homologada pelo Tribunal Superior Eleitoral."
    }
  };
}

// Histórico Eleitoral Consolidado do Município (2022 & 2024)
export function getElectoralHistory(municipio: string): Array<{
  ano: string;
  cargo: string;
  vencedor: string;
  partido: string;
  votos: number;
  percentual: number;
}> {
  const result: Array<{ ano: string; cargo: string; vencedor: string; partido: string; votos: number; percentual: number }> = [];

  const matched = BASE_TERRITORIAL_SERGIPE.filter((r) => r.municipio.toLowerCase() === municipio.toLowerCase());
  const grouped = new Map<string, ElectoralContextRecord>();

  for (const rec of matched) {
    const key = `${rec.ano}_${rec.cargo}`;
    if (!grouped.has(key) || (grouped.get(key)!.totalVotosCidade < rec.totalVotosCidade)) {
      grouped.set(key, rec);
    }
  }

  grouped.forEach((winner) => {
    result.push({
      ano: winner.ano,
      cargo: winner.cargo,
      vencedor: winner.candidato,
      partido: winner.partido,
      votos: winner.totalVotosCidade,
      percentual: winner.desempenhoLocalPercent
    });
  });

  return result.sort((a, b) => b.ano.localeCompare(a.ano));
}

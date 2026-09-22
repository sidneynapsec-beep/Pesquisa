import { Poll } from "../types";

/**
 * Pesquisas Históricas Oficiais Consolidadas de Sergipe (2022 e 2024)
 * Mantidas permanentemente no sistema para séries temporais, comparações e diagnósticos.
 */
export const HISTORICAL_POLLS: Poll[] = [
  {
    id: "hist-tse-2024-aracaju",
    institute: "Quaest / TSE",
    registryNumber: "SE-08912/2024",
    conre: "10801",
    sampleSize: 1000,
    marginOfError: 3.0,
    confidenceLevel: 95,
    fieldworkStart: "2024-10-23",
    fieldworkEnd: "2024-10-25",
    medianDate: "2024-10-24",
    statistician: "Felipe Nunes (CONRE 8742)",
    type: "Registrada",
    origin: "TSE",
    year: "2024",
    description: "Pesquisa Oficial de 2º Turno para a Prefeitura de Aracaju (TSE)",
    results: {
      "Emília Corrêa": 52.0,
      "Luiz Roberto": 37.0,
      "Brancos/Nulos": 7.0,
      "Indecisos": 4.0
    },
    roleResults: {
      "Prefeito de Aracaju": {
        "Emília Corrêa": 52.0,
        "Luiz Roberto": 37.0,
        "Brancos/Nulos": 7.0,
        "Indecisos": 4.0
      }
    },
    roleValidResults: {
      "Prefeito de Aracaju": {
        "Emília Corrêa": 58.4,
        "Luiz Roberto": 41.6
      }
    },
    roleStats: {
      "Prefeito de Aracaju": {
        totalSample: 1000,
        validTotal: 890,
        invalidTotal: 70,
        undecidedTotal: 40,
        validPercent: 89.0,
        invalidPercent: 7.0,
        undecidedPercent: 4.0
      }
    }
  },
  {
    id: "hist-tse-2022-governador",
    institute: "Ipec / TV Sergipe (TSE)",
    registryNumber: "SE-06584/2022",
    conre: "10801",
    sampleSize: 800,
    marginOfError: 3.0,
    confidenceLevel: 95,
    fieldworkStart: "2022-10-27",
    fieldworkEnd: "2022-10-29",
    medianDate: "2022-10-28",
    statistician: "Márcia Cavallari (CONRE 5321)",
    type: "Registrada",
    origin: "TSE",
    year: "2022",
    description: "Pesquisa de Reta Final 2º Turno para o Governo de Sergipe (TSE)",
    results: {
      "Fábio Mitidieri": 48.0,
      "Rogério Carvalho": 43.0,
      "Brancos/Nulos": 5.0,
      "Indecisos": 4.0
    },
    roleResults: {
      "Governador": {
        "Fábio Mitidieri": 48.0,
        "Rogério Carvalho": 43.0,
        "Brancos/Nulos": 5.0,
        "Indecisos": 4.0
      },
      "Senador": {
        "Laércio Oliveira": 34.0,
        "Valadares Filho": 26.0,
        "Rogério Carvalho": 24.0,
        "Brancos/Nulos": 9.0,
        "Indecisos": 7.0
      }
    },
    roleValidResults: {
      "Governador": {
        "Fábio Mitidieri": 52.7,
        "Rogério Carvalho": 47.3
      },
      "Senador": {
        "Laércio Oliveira": 40.5,
        "Valadares Filho": 31.0,
        "Rogério Carvalho": 28.5
      }
    },
    roleStats: {
      "Governador": {
        totalSample: 800,
        validTotal: 728,
        invalidTotal: 40,
        undecidedTotal: 32,
        validPercent: 91.0,
        invalidPercent: 5.0,
        undecidedPercent: 4.0
      }
    }
  }
];

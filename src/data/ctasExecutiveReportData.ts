// Base de Dados e Estrutura Completa do Relatório Executivo Oficial CTAS
// "Tracking Eleitoral Grande Aracaju - Onda 1" (Fidelidade Absoluta ao Documento)

export interface CtasCandidate {
  rank: number;
  name: string;
  votes?: number;
  totalPct: number;
  validPct?: number | null;
  electorPct?: number | null;
  color?: string;
  isInvalid?: boolean;
}

export interface CtasCrossTabRow {
  segment: string;
  cand1: number;
  cand2: number;
  cand3?: number;
  cand4?: number;
  base: number;
}

export const CTAS_TRACKING_ONDA1 = {
  meta: {
    title: "Tracking Eleitoral Grande Aracaju",
    subtitle: "Intenção de voto para Presidente, Governador, Senado, Deputado Estadual e Deputado Federal: leitura consolidada da Grande Aracaju, cenários por município, cruzamentos estratégicos e comparativo com a pesquisa estadual de setembro.",
    edition: "RELATÓRIO DE INTELIGÊNCIA ELEITORAL · TRACKING ONDA 1",
    institute: "CTAS Consultoria & Pesquisa",
    date: "15/09/2026",
    insertedDate: "15/09/2026",
    dataInsercao: "15/09/2026",
    monthYear: "Setembro / 2026",
    sampleSize: 1022,
    marginOfError: "±3,1 p.p.",
    confidenceLevel: "95%",
    municipalitiesCount: 4,
    electoralScenariosCount: 6,
    fieldworkHours: "08h04 — 17h18",
    stateComparisonBase: 492,
    methodologyNotes: "Metodologia AM (presencial, questionário estruturado) · Coleta em 15/09/2026 com geolocalização."
  },

  fichaTecnica: {
    contratante: "CTAS Consultoria & Pesquisa",
    ambito: "Grande Aracaju/SE — Aracaju, Nossa Senhora do Socorro, São Cristóvão e Barra dos Coqueiros",
    universo: "Eleitores(as) de 16 anos ou mais residentes nos municípios pesquisados",
    amostraDetalhe: "1022 entrevistas: Aracaju 625 (±3,9 p.p.), Socorro 216 (±6,7), São Cristóvão 108 (±9,4), Barra 73 (±11,5)",
    margemErro: "±3,1 pontos percentuais no consolidado, com 95% de confiança",
    periodoCampo: "15 de setembro de 2026, das 08h04 às 17h18",
    tecnica: "Questionário estruturado presencial, coleta em dispositivo móvel com geolocalização",
    baseComparacao: "Pesquisa estadual de setembro (14 e 15/09), recorte de 492 entrevistas nos mesmos 4 municípios",
    dataInsercao: "15/09/2026",
    trackingRegra: "Ondas diárias somadas; a partir da 4ª onda, a mais antiga é descartada",
    notaMetodologica: "Percentuais \"% total\" são calculados sobre todos os entrevistados; \"% válidos\" excluem branco/nulo e não sabe/não respondeu. Resultados não ponderados. Variações dentro da margem de erro devem ser lidas como empate técnico."
  },

  perfilAmostra: {
    sexo: [
      { label: "Masculino", pct: 51.5, count: 526 },
      { label: "Feminino", pct: 48.5, count: 496 }
    ],
    renda: [
      { label: "Até 1 Salário-Mínimo", pct: 61.5, count: 629 },
      { label: "Mais de 1 até 5 Salários-Mínimos", pct: 20.1, count: 205 },
      { label: "Mais de 5 até 10 Salários-Mínimos", pct: 0.9, count: 9 },
      { label: "Mais de 10 Salários-Mínimos", pct: 0.2, count: 2 },
      { label: "Não sei/Não respondeu", pct: 17.3, count: 177 }
    ],
    faixaEtaria: [
      { label: "16 anos", pct: 0.3, count: 3 },
      { label: "17 anos", pct: 1.0, count: 10 },
      { label: "Entre 18 a 20 anos", pct: 5.1, count: 52 },
      { label: "Entre 21 a 24 anos", pct: 6.5, count: 66 },
      { label: "Entre 25 a 34 anos", pct: 18.2, count: 186 },
      { label: "Entre 35 a 44 anos", pct: 17.1, count: 175 },
      { label: "Entre 45 a 59 anos", pct: 29.5, count: 301 },
      { label: "Entre 60 a 69 anos", pct: 14.7, count: 150 },
      { label: "Entre 70 a 79 anos", pct: 6.8, count: 70 },
      { label: "80 anos ou mais", pct: 0.6, count: 6 },
      { label: "Não sei/Não respondeu", pct: 0.3, count: 3 }
    ],
    escolaridade: [
      { label: "Analfabeto(a)", pct: 3.6, count: 37 },
      { label: "Lê e Escreve", pct: 1.2, count: 12 },
      { label: "Fundamental Incompleto", pct: 29.0, count: 296 },
      { label: "Fundamental Completo", pct: 7.9, count: 81 },
      { label: "Médio Incompleto", pct: 11.2, count: 114 },
      { label: "Médio Completo", pct: 37.8, count: 386 },
      { label: "Superior Incompleto", pct: 3.4, count: 35 },
      { label: "Superior Completo", pct: 5.4, count: 55 },
      { label: "Não sei/Não respondeu", pct: 0.6, count: 6 }
    ],
    leitura: "A amostra é equilibrada entre homens (51,5%) e mulheres (48,5%), concentrada entre 35 e 59 anos (46,6%), com predominância de renda de até 1 salário-mínimo (61,5%) e escolaridade de nível médio (48,9% entre completo e incompleto). Esse perfil deve ser considerado na leitura de todos os cenários a seguir."
  },

  presidencial: {
    kpis: {
      leader: { name: "Lula", totalPct: 49.0, validPct: 60.9, votes: 501 },
      runnerUp: { name: "Flavio Bolsonaro", totalPct: 22.1, validPct: 27.5, votes: 226 },
      diffValid: "33.5 p.p.",
      diffStatus: "Fora da margem de erro",
      undecidedInvalidPct: 19.6,
      validVotesCount: 822,
      totalVotesCount: 1022
    },
    ranking: [
      { rank: 1, name: "Lula", votes: 501, totalPct: 49.0, validPct: 60.9, color: "#dc2626" },
      { rank: 2, name: "Flavio Bolsonaro", votes: 226, totalPct: 22.1, validPct: 27.5, color: "#1e3a8a" },
      { rank: 3, name: "Escritor Augusto Cury", votes: 55, totalPct: 5.4, validPct: 6.7, color: "#7c3aed" },
      { rank: 4, name: "Ronaldo Caiado", votes: 14, totalPct: 1.4, validPct: 1.7, color: "#059669" },
      { rank: 5, name: "Renan Santos", votes: 14, totalPct: 1.4, validPct: 1.7, color: "#475569" },
      { rank: 6, name: "Pablo Marçal", votes: 7, totalPct: 0.7, validPct: 0.9, color: "#d97706" },
      { rank: 7, name: "Samara", votes: 2, totalPct: 0.2, validPct: 0.2, color: "#9333ea" },
      { rank: 8, name: "Zema", votes: 2, totalPct: 0.2, validPct: 0.2, color: "#ca8a04" },
      { rank: 9, name: "Veterinário Wilson Grassi", votes: 1, totalPct: 0.1, validPct: 0.1, color: "#0891b2" },
      { rank: 10, name: "Não sei/Não respondeu", votes: 109, totalPct: 10.7, validPct: null, isInvalid: true, color: "#94a3b8" },
      { rank: 11, name: "Branco/Nulo", votes: 91, totalPct: 8.9, validPct: null, isInvalid: true, color: "#cbd5e1" }
    ] as CtasCandidate[],
    leitura: "Lula lidera com 49,0% do total e 60,9% dos votos válidos, contra 22,1% (27,5% dos válidos) de Flavio Bolsonaro. Na Grande Aracaju, Lula superaria a metade dos válidos. Indecisos e branco/nulo somam 19,6%, contingente relevante até a definição do quadro."
  },

  governo: {
    kpis: {
      leader: { name: "Fábio", totalPct: 38.8, validPct: 53.2, votes: 397 },
      runnerUp: { name: "Valmir De Francisquinho", totalPct: 24.2, validPct: 33.1, votes: 247 },
      diffValid: "20.1 p.p.",
      diffStatus: "Fora da margem de erro",
      undecidedInvalidPct: 27.0,
      validVotesCount: 746,
      totalVotesCount: 1022
    },
    ranking: [
      { rank: 1, name: "Fábio", votes: 397, totalPct: 38.8, validPct: 53.2, color: "#0284c7" },
      { rank: 2, name: "Valmir De Francisquinho", votes: 247, totalPct: 24.2, validPct: 33.1, color: "#0d9488" },
      { rank: 3, name: "Ricardo Marques", votes: 86, totalPct: 8.4, validPct: 11.5, color: "#c2410c" },
      { rank: 4, name: "Dr. Helton", votes: 7, totalPct: 0.7, validPct: 0.9, color: "#64748b" },
      { rank: 5, name: "Taty Cristina De Jesus", votes: 5, totalPct: 0.5, validPct: 0.7, color: "#a855f7" },
      { rank: 6, name: "Emanuel Cacho", votes: 4, totalPct: 0.4, validPct: 0.5, color: "#059669" },
      { rank: 7, name: "Não sei/Não respondeu", votes: 168, totalPct: 16.4, validPct: null, isInvalid: true, color: "#94a3b8" },
      { rank: 8, name: "Branco/Nulo", votes: 108, totalPct: 10.6, validPct: null, isInvalid: true, color: "#cbd5e1" }
    ] as CtasCandidate[],
    leitura: "Sobre o total, Fábio soma 38,8% contra 24,2% de Valmir de Francisquinho. Em votos válidos, Fábio tem 53,2%, o que venceria no 1º turno neste recorte. O índice de indecisos (16,4%) e de branco/nulo (10,6%) mantém o cenário em formação."
  },

  senado1: {
    kpis: {
      leader: { name: "Delegado André David", totalPct: 16.6, validPct: 23.5, votes: 170 },
      runnerUp: { name: "Edvaldo", totalPct: 15.9, validPct: 22.4, votes: 162 },
      diffValid: "1.1 p.p.",
      diffStatus: "Empate técnico",
      undecidedInvalidPct: 29.4,
      validVotesCount: 722,
      totalVotesCount: 1022
    },
    ranking: [
      { rank: 1, name: "Delegado André David", votes: 170, totalPct: 16.6, validPct: 23.5, color: "#1e3a8a" },
      { rank: 2, name: "Edvaldo", votes: 162, totalPct: 15.9, validPct: 22.4, color: "#0284c7" },
      { rank: 3, name: "Delegado Alessandro", votes: 110, totalPct: 10.8, validPct: 15.2, color: "#b91c1c" },
      { rank: 4, name: "André Moura", votes: 101, totalPct: 9.9, validPct: 14.0, color: "#047857" },
      { rank: 5, name: "Rogerio Carvalho", votes: 93, totalPct: 9.1, validPct: 12.9, color: "#dc2626" },
      { rank: 6, name: "Rodrigo Valadares", votes: 36, totalPct: 3.5, validPct: 5.0, color: "#b45309" },
      { rank: 7, name: "Eduardo Amorim", votes: 30, totalPct: 2.9, validPct: 4.2, color: "#6d28d9" },
      { rank: 8, name: "Coronel Rocha", votes: 10, totalPct: 1.0, validPct: 1.4, color: "#475569" },
      { rank: 9, name: "Renatinha", votes: 5, totalPct: 0.5, validPct: 0.7, color: "#db2777" },
      { rank: 10, name: "Iran Barbosa", votes: 5, totalPct: 0.5, validPct: 0.7, color: "#e11d48" },
      { rank: 11, name: "Não sei/Não respondeu", votes: 218, totalPct: 21.3, validPct: null, isInvalid: true, color: "#94a3b8" },
      { rank: 12, name: "Branco/Nulo", votes: 82, totalPct: 8.0, validPct: null, isInvalid: true, color: "#cbd5e1" }
    ] as CtasCandidate[],
    leitura: "Delegado André David (16,6%; 23,5% dos válidos) e Edvaldo (15,9%; 22,4%) estão tecnicamente empatados na liderança do 1º voto. O pelotão seguinte, com Del. Alessandro, André Moura e Rogério Carvalho, vai de 9% a 11%. Não sabe/não respondeu (21,3%) supera qualquer candidato."
  },

  senado2: {
    kpis: {
      leader: { name: "Delegado André David", totalPct: 10.1, validPct: 22.2, votes: 103 },
      runnerUp: { name: "Delegado Alessandro", totalPct: 7.6, validPct: 16.8, votes: 78 },
      diffValid: "5.4 p.p.",
      diffStatus: "Empate técnico",
      undecidedInvalidPct: 54.6,
      validVotesCount: 464,
      totalVotesCount: 1022
    },
    ranking: [
      { rank: 1, name: "Branco/Nulo", votes: 305, totalPct: 29.8, validPct: null, isInvalid: true, color: "#cbd5e1" },
      { rank: 2, name: "Não sei/Não respondeu", votes: 253, totalPct: 24.8, validPct: null, isInvalid: true, color: "#94a3b8" },
      { rank: 3, name: "Delegado André David", votes: 103, totalPct: 10.1, validPct: 22.2, color: "#1e3a8a" },
      { rank: 4, name: "Delegado Alessandro", votes: 78, totalPct: 7.6, validPct: 16.8, color: "#b91c1c" },
      { rank: 5, name: "Edvaldo", votes: 77, totalPct: 7.5, validPct: 16.6, color: "#0284c7" },
      { rank: 6, name: "Rogerio Carvalho", votes: 65, totalPct: 6.4, validPct: 14.0, color: "#dc2626" },
      { rank: 7, name: "André Moura", votes: 47, totalPct: 4.6, validPct: 10.1, color: "#047857" },
      { rank: 8, name: "Eduardo Amorim", votes: 42, totalPct: 4.1, validPct: 9.1, color: "#6d28d9" },
      { rank: 9, name: "Rodrigo Valadares", votes: 30, totalPct: 2.9, validPct: 6.5, color: "#b45309" },
      { rank: 10, name: "Iran Barbosa", votes: 11, totalPct: 1.1, validPct: 2.4, color: "#e11d48" }
    ] as CtasCandidate[],
    leitura: "No 2º voto, branco/nulo (29,8%) e não sabe (24,8%) somam 54,6%: mais da metade do eleitorado ainda não tem segundo nome. Entre quem já definiu, Delegado André David lidera com 22,2% dos válidos, seguido de Del. Alessandro (16,8%) e Edvaldo (16,6%)."
  },

  senadoConsolidado: {
    kpis: {
      leader: "Del. André David",
      leaderValidPct: "23.0%",
      runnerUp: "Edvaldo",
      runnerUpValidPct: "20.2%",
      reachLeader: "26.7%",
      reachText: "dos eleitores citam o nome",
      validMentions: 1186,
      totalPossibleMentions: 2044
    },
    ranking: [
      { rank: 1, name: "Delegado André David", votes: 273, totalPct: 13.4, electorPct: 26.7, validPct: 23.0, color: "#1e3a8a" },
      { rank: 2, name: "Edvaldo", votes: 239, totalPct: 11.7, electorPct: 23.4, validPct: 20.2, color: "#0284c7" },
      { rank: 3, name: "Delegado Alessandro", votes: 188, totalPct: 9.2, electorPct: 18.4, validPct: 15.9, color: "#b91c1c" },
      { rank: 4, name: "Rogerio Carvalho", votes: 158, totalPct: 7.7, electorPct: 15.5, validPct: 13.3, color: "#dc2626" },
      { rank: 5, name: "André Moura", votes: 148, totalPct: 7.2, electorPct: 14.5, validPct: 12.5, color: "#047857" },
      { rank: 6, name: "Eduardo Amorim", votes: 72, totalPct: 3.5, electorPct: 7.0, validPct: 6.1, color: "#6d28d9" },
      { rank: 7, name: "Rodrigo Valadares", votes: 66, totalPct: 3.2, electorPct: 6.5, validPct: 5.6, color: "#b45309" },
      { rank: 8, name: "Coronel Rocha", votes: 17, totalPct: 0.8, electorPct: 1.7, validPct: 1.4, color: "#475569" },
      { rank: 9, name: "Iran Barbosa", votes: 16, totalPct: 0.8, electorPct: 1.6, validPct: 1.3, color: "#e11d48" },
      { rank: 10, name: "Renatinha", votes: 8, totalPct: 0.4, electorPct: 0.8, validPct: 0.7, color: "#db2777" },
      { rank: 11, name: "Paulinho Da União Tur", votes: 1, totalPct: 0.0, electorPct: 0.1, validPct: 0.1, color: "#0891b2" },
      { rank: 12, name: "Não sei/Não respondeu", votes: 471, totalPct: 23.0, electorPct: null, validPct: null, isInvalid: true, color: "#94a3b8" },
      { rank: 13, name: "Branco/Nulo", votes: 387, totalPct: 18.9, electorPct: null, validPct: null, isInvalid: true, color: "#cbd5e1" }
    ],
    leitura: "Somando os dois votos, Delegado André David é o nome de maior alcance: 26,7% dos eleitores o citam (23,0% das menções válidas), contra 23,4% de Edvaldo (20,2%). A disputa pela segunda vaga segue aberta entre Edvaldo, Del. Alessandro (15,9%), Rogério Carvalho (13,3%) e André Moura (12,5%)."
  },

  migracaoSenado: {
    headers: ["Del. André David", "Edvaldo", "Del. Alessandro", "Rogerio Carvalho", "André Moura", "Eduardo Amorim", "Rodrigo Valadares", "Outros", "Br./Nulo", "Não Sabe", "Base"],
    rows: [
      { name: "Del. André David", values: [null, 12.9, 18.2, 5.3, 5.9, 5.3, 8.2, 2.4, 18.8, 22.9], base: 170, primaryTarget: "Del. Alessandro (18.2%)", undefPct: 41.8 },
      { name: "Edvaldo", values: [9.3, null, 6.2, 17.9, 7.4, 4.9, 2.5, 3.1, 13.0, 35.8], base: 162, primaryTarget: "Rogerio Carvalho (17.9%)", undefPct: 48.8 },
      { name: "Del. Alessandro", values: [36.4, 6.4, null, 8.2, 10.0, 7.3, 7.3, 1.8, 3.6, 19.1], base: 110, primaryTarget: "Del. André David (36.4%)", undefPct: 22.7 },
      { name: "Rogerio Carvalho", values: [5.4, 21.5, 18.3, null, 6.5, 3.2, 1.1, 5.4, 12.9, 25.8], base: 93, primaryTarget: "Edvaldo (21.5%)", undefPct: 38.7 },
      { name: "André Moura", values: [15.8, 13.9, 13.9, 13.9, null, 10.9, 2.0, 0.0, 14.9, 14.9], base: 101, primaryTarget: "Del. André David (15.8%)", undefPct: 29.7 },
      { name: "Eduardo Amorim", values: [30.0, 13.3, 6.7, 6.7, 10.0, null, 0.0, 3.3, 16.7, 13.3], base: 30, primaryTarget: "Del. André David (30.0%)", undefPct: 30.0 },
      { name: "Rodrigo Valadares", values: [27.8, 19.4, 5.6, 0.0, 2.8, 5.6, null, 5.6, 11.1, 22.2], base: 36, primaryTarget: "Del. André David (27.8%)", undefPct: 33.3 }
    ],
    leitura: "Surgem duas dobradinhas espontâneas. A primeira é a dos delegados: 36,4% dos eleitores de Del. Alessandro dão o 2º voto a Del. André David, e 18,2% dos de André David devolvem para Alessandro. A segunda é Edvaldo e Rogério Carvalho: 21,5% dos eleitores de Rogério escolhem Edvaldo, e 17,9% dos de Edvaldo escolhem Rogério. O eleitor de Edvaldo é o que menos definiu o 2º voto (48,8%), espaço que pode ser trabalhado por alianças."
  },

  swotFabio: {
    forcas: [
      "53,2% dos válidos e 20,1 p.p. de vantagem sobre Valmir",
      "Forte efeito-coalizão com Lula: 52,1% entre eleitores de Lula",
      "Maior sobreposição com as bases de Rogério Carvalho (61,3%), André Moura (56,4%), Del. Alessandro (52,7%) e Edvaldo (51,9%)"
    ],
    fraquezas: [
      "Perde entre eleitores de Flavio Bolsonaro (27,0% contra 38,5%)",
      "Seu eleitor não tem candidato ao Senado definido: nenhum nome passa de 21,2%",
      "Minoritário na base de Del. André David, o mais citado no 1º voto (31,2% contra 42,4% de Valmir)"
    ],
    oportunidades: [
      "Organizar o voto ao Senado do próprio eleitorado, hoje disperso entre cinco nomes",
      "Converter os indecisos e branco/nulo entre eleitores de Lula"
    ],
    ameacas: [
      "Queda de 5,9 p.p. frente à estadual de setembro, concentrada em Aracaju",
      "Consolidação de Valmir e André David como eixo da centro-direita"
    ],
    recomendacao: "Fábio deve (1) coordenar agenda e comunicação com as candidaturas ao Senado que já compartilham sua base, dando direção ao voto disperso do seu eleitor; e (2) abrir diálogo com o eleitorado de centro e centro-direita, hoje polarizado a favor de Valmir, sobretudo em Aracaju, onde a vantagem encolheu."
  },

  municipios: [
    {
      nome: "Aracaju",
      codigo: "05.1",
      amostra: 625,
      margem: "±3.9 p.p.",
      presidente: {
        ranking: [
          { rank: 1, name: "Lula", totalPct: 52.0, validPct: 63.7 },
          { rank: 2, name: "Flavio Bolsonaro", totalPct: 19.8, validPct: 24.3 },
          { rank: 3, name: "Escritor Augusto Cury", totalPct: 5.9, validPct: 7.3 },
          { rank: 4, name: "Renan Santos", totalPct: 1.6, validPct: 2.0 },
          { rank: 5, name: "Outros (5)", totalPct: 2.2, validPct: 2.7 },
          { rank: 6, name: "Não sei/Não respondeu", totalPct: 8.6, validPct: null, isInvalid: true },
          { rank: 7, name: "Branco/Nulo", totalPct: 9.8, validPct: null, isInvalid: true }
        ],
        validos: 510
      },
      governo: {
        ranking: [
          { rank: 1, name: "Fábio", totalPct: 37.9, validPct: 50.7 },
          { rank: 2, name: "Valmir De Francisquinho", totalPct: 25.9, validPct: 34.7 },
          { rank: 3, name: "Ricardo Marques", totalPct: 9.6, validPct: 12.8 },
          { rank: 4, name: "Outros (3)", totalPct: 1.3, validPct: 1.7 },
          { rank: 5, name: "Não sei/Não respondeu", totalPct: 14.1, validPct: null, isInvalid: true },
          { rank: 6, name: "Branco/Nulo", totalPct: 11.2, validPct: null, isInvalid: true }
        ],
        validos: 467
      },
      senado1: [
        { rank: 1, name: "Edvaldo", totalPct: 21.4, validPct: 28.3 },
        { rank: 2, name: "Delegado André David", totalPct: 19.2, validPct: 25.4 },
        { rank: 3, name: "André Moura", totalPct: 11.2, validPct: 14.8 },
        { rank: 4, name: "Rogerio Carvalho", totalPct: 7.5, validPct: 9.9 },
        { rank: 5, name: "Delegado Alessandro", totalPct: 7.4, validPct: 9.7 },
        { rank: 6, name: "Eduardo Amorim", totalPct: 3.5, validPct: 4.7 },
        { rank: 7, name: "Rodrigo Valadares", totalPct: 3.5, validPct: 4.7 },
        { rank: 8, name: "Outros (3)", totalPct: 1.9, validPct: 2.5 }
      ],
      deputados: {
        estadual: [
          { name: "Delegada Danielle", votes: 17, totalPct: 2.7, validPct: 12.0 },
          { name: "Garibalde", votes: 11, totalPct: 1.8, validPct: 7.7 },
          { name: "Camilo Daniel", votes: 8, totalPct: 1.3, validPct: 5.6 },
          { name: "Candisse Carvalho", votes: 8, totalPct: 1.3, validPct: 5.6 },
          { name: "Kitty Lima", votes: 6, totalPct: 1.0, validPct: 4.2 },
          { name: "Adailton Martins", votes: 6, totalPct: 1.0, validPct: 4.2 },
          { name: "Maisa Mitidieri", votes: 6, totalPct: 1.0, validPct: 4.2 }
        ],
        federal: [
          { name: "Capitão Samuel", votes: 24, totalPct: 3.8, validPct: 14.4 },
          { name: "Yandra Moura", votes: 14, totalPct: 2.2, validPct: 8.4 },
          { name: "Breno Garibalde", votes: 13, totalPct: 2.1, validPct: 7.8 },
          { name: "Jornalista Susane Vidal", votes: 12, totalPct: 1.9, validPct: 7.2 },
          { name: "Nitinho", votes: 11, totalPct: 1.8, validPct: 6.6 },
          { name: "Delegada Katarina", votes: 9, totalPct: 1.4, validPct: 5.4 },
          { name: "Marcio Macedo", votes: 8, totalPct: 1.3, validPct: 4.8 }
        ]
      },
      leitura: "Fábio tem 50,7% dos válidos contra 34,7% de Valmir, disputa mais apertada que no consolidado. No Senado, Edvaldo (28,3% dos válidos) e Del. André David (25,4%) estão em empate técnico no 1º voto; no consolidado, Edvaldo é citado por 31,0% dos eleitores."
    },
    {
      nome: "Nossa Senhora do Socorro",
      codigo: "05.2",
      amostra: 216,
      margem: "±6.7 p.p.",
      presidente: {
        ranking: [
          { rank: 1, name: "Lula", totalPct: 41.7, validPct: 53.9 },
          { rank: 2, name: "Flavio Bolsonaro", totalPct: 26.9, validPct: 34.7 },
          { rank: 3, name: "Escritor Augusto Cury", totalPct: 4.6, validPct: 6.0 },
          { rank: 4, name: "Ronaldo Caiado", totalPct: 1.4, validPct: 1.8 }
        ],
        validos: 167
      },
      governo: {
        ranking: [
          { rank: 1, name: "Fábio", totalPct: 39.4, validPct: 56.7 },
          { rank: 2, name: "Valmir De Francisquinho", totalPct: 20.4, validPct: 29.3 },
          { rank: 3, name: "Ricardo Marques", totalPct: 7.9, validPct: 11.3 }
        ],
        validos: 150
      },
      senado1: [
        { rank: 1, name: "Delegado Alessandro", totalPct: 18.5, validPct: 30.5 },
        { rank: 2, name: "Rogerio Carvalho", totalPct: 11.6, validPct: 19.1 },
        { rank: 3, name: "Delegado André David", totalPct: 11.1, validPct: 18.3 },
        { rank: 4, name: "Edvaldo", totalPct: 6.5, validPct: 10.7 },
        { rank: 5, name: "André Moura", totalPct: 6.0, validPct: 9.9 }
      ],
      deputados: {
        estadual: [
          { name: "Fábio Henrique", votes: 28, totalPct: 13.0, validPct: 39.4 },
          { name: "Padre Inaldo", votes: 5, totalPct: 2.3, validPct: 7.0 },
          { name: "Jorginho Araujo", votes: 5, totalPct: 2.3, validPct: 7.0 }
        ],
        federal: [
          { name: "Dra. Clêcia", votes: 12, totalPct: 5.6, validPct: 18.2 },
          { name: "Capitão Samuel", votes: 6, totalPct: 2.8, validPct: 9.1 },
          { name: "Claudio Mitidieri", votes: 6, totalPct: 2.8, validPct: 9.1 }
        ]
      },
      leitura: "Fábio tem 56,7% dos válidos, mas 22,2% não sabem em quem votar para Governo, o maior índice entre os municípios. No Senado, Del. Alessandro lidera o 1º voto com 30,5% dos válidos, à frente de Rogério Carvalho (19,1%) e Del. André David (18,3%); 31,9% ainda não têm 1º voto."
    },
    {
      nome: "São Cristóvão",
      codigo: "05.3",
      amostra: 108,
      margem: "±9.4 p.p.",
      presidente: {
        ranking: [
          { rank: 1, name: "Lula", totalPct: 39.8, validPct: 50.0 },
          { rank: 2, name: "Flavio Bolsonaro", totalPct: 28.7, validPct: 36.0 },
          { rank: 3, name: "Escritor Augusto Cury", totalPct: 7.4, validPct: 9.3 }
        ],
        validos: 86
      },
      governo: {
        ranking: [
          { rank: 1, name: "Fábio", totalPct: 38.0, validPct: 53.2 },
          { rank: 2, name: "Valmir De Francisquinho", totalPct: 25.9, validPct: 36.4 },
          { rank: 3, name: "Ricardo Marques", totalPct: 6.5, validPct: 9.1 }
        ],
        validos: 77
      },
      senado1: [
        { rank: 1, name: "Delegado André David", totalPct: 18.5, validPct: 29.4 },
        { rank: 2, name: "Delegado Alessandro", totalPct: 11.1, validPct: 17.6 },
        { rank: 3, name: "Edvaldo", totalPct: 8.3, validPct: 13.2 },
        { rank: 4, name: "Rogerio Carvalho", totalPct: 7.4, validPct: 11.8 },
        { rank: 5, name: "André Moura", totalPct: 7.4, validPct: 11.8 }
      ],
      deputados: {
        estadual: [
          { name: "Paulo Jr", votes: 25, totalPct: 23.1, validPct: 48.1 },
          { name: "Fábio Henrique", votes: 5, totalPct: 4.6, validPct: 9.6 }
        ],
        federal: [
          { name: "Marcos Santana", votes: 24, totalPct: 22.2, validPct: 38.7 },
          { name: "Gedalva Umbaubá", votes: 9, totalPct: 8.3, validPct: 14.5 },
          { name: "Capitão Samuel", votes: 9, totalPct: 8.3, validPct: 14.5 }
        ]
      },
      leitura: "Fábio tem 53,2% dos válidos e Valmir 36,4%. No Senado, Del. André David lidera o 1º voto com 29,4% dos válidos e o consolidado com 28,2%, seguido de Del. Alessandro. Base de 108 entrevistas (±9,4 p.p.)."
    },
    {
      nome: "Barra dos Coqueiros",
      codigo: "05.4",
      amostra: 73,
      margem: "±11.5 p.p.",
      presidente: {
        ranking: [
          { rank: 1, name: "Lula", totalPct: 58.9, validPct: 72.9 },
          { rank: 2, name: "Flavio Bolsonaro", totalPct: 17.8, validPct: 22.0 }
        ],
        validos: 59
      },
      governo: {
        ranking: [
          { rank: 1, name: "Fábio", totalPct: 46.6, validPct: 65.4 },
          { rank: 2, name: "Valmir De Francisquinho", totalPct: 17.8, validPct: 25.0 },
          { rank: 3, name: "Ricardo Marques", totalPct: 2.7, validPct: 3.8 }
        ],
        validos: 52
      },
      senado1: [
        { rank: 1, name: "Rogerio Carvalho", totalPct: 17.8, validPct: 26.0 },
        { rank: 2, name: "Delegado Alessandro", totalPct: 16.4, validPct: 24.0 },
        { rank: 3, name: "André Moura", totalPct: 13.7, validPct: 20.0 },
        { rank: 4, name: "Delegado André David", totalPct: 8.2, validPct: 12.0 }
      ],
      deputados: {
        estadual: [
          { name: "Adailton Martins", votes: 25, totalPct: 34.2, validPct: 65.8 },
          { name: "Gilson Dos Anjos", votes: 6, totalPct: 8.2, validPct: 15.8 }
        ],
        federal: [
          { name: "Alberto Macedo", votes: 6, totalPct: 8.2, validPct: 28.6 },
          { name: "Claudio Mitidieri", votes: 4, totalPct: 5.5, validPct: 19.0 },
          { name: "Yandra Moura", votes: 3, totalPct: 4.1, validPct: 14.3 }
        ]
      },
      leitura: "Fábio tem 65,4% dos válidos, o melhor resultado entre os municípios, mas branco/nulo chega a 17,8% para Governo. No Senado, Rogério Carvalho (26,0%) e Del. Alessandro (24,0%) lideram o 1º voto. Base de 73 entrevistas (±11,5 p.p.): leitura indicativa."
    }
  ],

  comparativoConsolidado: {
    governo: [
      { name: "Fábio", setTotal: 44.7, onda1Total: 38.8, varTotal: -5.9, setValid: 59.6, onda1Valid: 53.2, varValid: -6.4, statusTotal: "Caiu", statusValid: "Caiu" },
      { name: "Valmir", setTotal: 22.4, onda1Total: 24.2, varTotal: 1.8, setValid: 29.8, onda1Valid: 33.1, varValid: 3.3, statusTotal: "Estável", statusValid: "Estável" },
      { name: "Ricardo M.", setTotal: 6.5, onda1Total: 8.4, varTotal: 1.9, setValid: 8.7, onda1Valid: 11.5, varValid: 2.9, statusTotal: "Estável", statusValid: "Estável" },
      { name: "Não sei/Não respondeu", setTotal: 16.3, onda1Total: 16.4, varTotal: 0.2, setValid: null, onda1Valid: null, varValid: null, statusTotal: "Estável", statusValid: "—" },
      { name: "Branco/Nulo", setTotal: 8.7, onda1Total: 10.6, varTotal: 1.8, setValid: null, onda1Valid: null, varValid: null, statusTotal: "Estável", statusValid: "—" }
    ],
    senado1: [
      { name: "Del. André David", setTotal: 20.9, onda1Total: 16.6, varTotal: -4.3, setValid: 30.2, onda1Valid: 23.5, varValid: -6.7, statusTotal: "Caiu", statusValid: "Caiu" },
      { name: "Edvaldo", setTotal: 10.2, onda1Total: 15.9, varTotal: 5.7, setValid: 14.7, onda1Valid: 22.4, varValid: 7.8, statusTotal: "Subiu", statusValid: "Subiu" },
      { name: "Del. Alessandro", setTotal: 12.6, onda1Total: 10.8, varTotal: -1.8, setValid: 18.2, onda1Valid: 15.2, varValid: -2.9, statusTotal: "Estável", statusValid: "Estável" },
      { name: "André Moura", setTotal: 11.4, onda1Total: 9.9, varTotal: -1.5, setValid: 16.4, onda1Valid: 14.0, varValid: -2.4, statusTotal: "Estável", statusValid: "Estável" },
      { name: "Rogerio Carvalho", setTotal: 5.1, onda1Total: 9.1, varTotal: 4.0, setValid: 7.3, onda1Valid: 12.9, varValid: 5.5, statusTotal: "Subiu", statusValid: "Subiu" },
      { name: "Eduardo Amorim", setTotal: 4.7, onda1Total: 2.9, varTotal: -1.7, setValid: 6.7, onda1Valid: 4.2, varValid: -2.6, statusTotal: "Estável", statusValid: "Estável" },
      { name: "Rodrigo Valadares", setTotal: 2.0, onda1Total: 3.5, varTotal: 1.5, setValid: 2.9, onda1Valid: 5.0, varValid: 2.1, statusTotal: "Estável", statusValid: "Estável" }
    ],
    leitura: "Fábio caiu 5,9 p.p. no Governo, variação acima da margem, enquanto Valmir (+1,8) e Ricardo Marques (+1,9) oscilaram positivamente dentro da margem. No Senado, Edvaldo e Rogério Carvalho cresceram acima da margem no 1º voto e no consolidado. Del. André David caiu no 1º voto (20,9% para 16,6%), mas manteve estabilidade no consolidado, sustentado pelo 2º voto. Parte das variações pode refletir a composição das amostras: Aracaju pesa 67% no recorte estadual e 61% na Onda 1."
  },

  projecaoHistorica: {
    governoMediaValidos: 79.1,
    governoMediaBrancoNulo: 20.9,
    senadoMediaValidos: 75.0,
    senadoMediaBrancoNulo: 25.0,
    governoProjecao: [
      { name: "Fábio", validosPesquisa: 53.2, projetadoHistorico: 42.1 },
      { name: "Valmir De Francisquinho", validosPesquisa: 33.1, projetadoHistorico: 26.2 },
      { name: "Ricardo Marques", validosPesquisa: 11.5, projetadoHistorico: 9.1 },
      { name: "Dr. Helton", validosPesquisa: 0.9, projetadoHistorico: 0.7 },
      { name: "Taty Cristina De Jesus", validosPesquisa: 0.7, projetadoHistorico: 0.5 },
      { name: "Emanuel Cacho", validosPesquisa: 0.5, projetadoHistorico: 0.4 }
    ],
    senadoProjecao: [
      { name: "Delegado André David", validosPesquisa: 23.0, projetadoHistorico: 17.3 },
      { name: "Edvaldo", validosPesquisa: 20.2, projetadoHistorico: 15.1 },
      { name: "Delegado Alessandro", validosPesquisa: 15.9, projetadoHistorico: 11.9 },
      { name: "Rogerio Carvalho", validosPesquisa: 13.3, projetadoHistorico: 10.0 },
      { name: "André Moura", validosPesquisa: 12.5, projetadoHistorico: 9.4 },
      { name: "Eduardo Amorim", validosPesquisa: 6.1, projetadoHistorico: 4.6 },
      { name: "Rodrigo Valadares", validosPesquisa: 5.6, projetadoHistorico: 4.2 }
    ],
    leitura: "A projeção preserva a ordem dos candidatos: Fábio segue à frente de Valmir de Francisquinho, e Del. André David à frente de Edvaldo no Senado. Como aplica o mesmo fator a todos, ela não resolve empates técnicos; apenas recalibra a base para o padrão de comparecimento válido das eleições passadas."
  },

  recomendacoesFinais: {
    presidencial: [
      "Lula tem 60,9% dos válidos, 26,9 p.p. à frente de Flavio Bolsonaro",
      "Mais forte entre mulheres, menor renda e menor escolaridade",
      "Flavio cresce entre homens e na faixa de 1 a 5 SM"
    ],
    governo: [
      "Fábio tem 53,2% dos válidos e lidera nos 4 municípios",
      "Caiu 5,9 p.p. frente à estadual, sobretudo em Aracaju",
      "Valmir é a opção do eleitor de Flavio Bolsonaro"
    ],
    senado: [
      "Empate técnico entre Del. André David e Edvaldo",
      "Edvaldo e Rogério subiram acima da margem",
      "54,6% ainda sem 2º voto válido"
    ],
    swotGeral: {
      forcas: [
        "Fábio lidera em quase todos os segmentos e nos quatro municípios",
        "Forte associação com o eleitor de Lula, maioria na Grande Aracaju"
      ],
      fraquezas: [
        "O eleitor de Fábio não tem candidato ao Senado definido",
        "16,4% de indecisos e 10,6% de branco/nulo para Governo"
      ],
      oportunidades: [
        "Organizar a dobradinha Edvaldo e Rogério Carvalho, que já aparece espontaneamente",
        "Converter os indecisos de Socorro (22,2%) e o branco/nulo da Barra (17,8%)"
      ],
      ameacas: [
        "Crescimento de Valmir em Aracaju, onde a vantagem de Fábio é menor",
        "Dobradinha dos delegados consolidando o voto da centro-direita no Senado"
      ]
    },
    recomendacaoCTAS: "Priorizar Aracaju, onde está a maior perda de Fábio e o crescimento de Valmir; dar direção ao voto para o Senado do eleitor governista, hoje disperso entre cinco nomes; e usar as próximas ondas da tracking para confirmar se as variações frente à estadual são tendência ou oscilação. Nos municípios menores, as leituras só devem orientar decisões quando se repetirem em ondas seguidas."
  }
};

export interface SampleGpsPoint {
  id: number;
  latitude: number;
  longitude: number;
  municipio?: string;
  candidato?: string;
}

export const SAMPLE_SERGIPE_GPS_POINTS: SampleGpsPoint[] = [
  // Aracaju
  { id: 101, latitude: -10.9320, longitude: -37.0510, municipio: "Aracaju", candidato: "Fábio Mitidieri" },
  { id: 102, latitude: -10.9395, longitude: -37.0620, municipio: "Aracaju", candidato: "Fábio Mitidieri" },
  { id: 103, latitude: -10.8920, longitude: -37.0720, municipio: "Aracaju", candidato: "Valmir de Franciscano" },
  { id: 104, latitude: -10.9650, longitude: -37.0550, municipio: "Aracaju", candidato: "Rogério Carvalho" },
  { id: 105, latitude: -11.0820, longitude: -37.1550, municipio: "Aracaju", candidato: "Fábio Mitidieri" },
  { id: 106, latitude: -10.9150, longitude: -37.0520, municipio: "Aracaju", candidato: "Fábio Mitidieri" },
  { id: 107, latitude: -10.9520, longitude: -37.0420, municipio: "Aracaju", candidato: "Alessandro Vieira" },
  { id: 108, latitude: -10.9850, longitude: -37.0820, municipio: "Aracaju", candidato: "Rogério Carvalho" },
  { id: 109, latitude: -10.9280, longitude: -37.0850, municipio: "Aracaju", candidato: "Fábio Mitidieri" },
  { id: 110, latitude: -10.8850, longitude: -37.0620, municipio: "Aracaju", candidato: "Valmir de Franciscano" },
  
  // Nossa Senhora do Socorro
  { id: 201, latitude: -10.8520, longitude: -37.0780, municipio: "Nossa Senhora do Socorro", candidato: "Fábio Mitidieri" },
  { id: 202, latitude: -10.8650, longitude: -37.0850, municipio: "Nossa Senhora do Socorro", candidato: "Valmir de Franciscano" },
  { id: 203, latitude: -10.8420, longitude: -37.0950, municipio: "Nossa Senhora do Socorro", candidato: "Fábio Mitidieri" },
  { id: 204, latitude: -10.8580, longitude: -37.1250, municipio: "Nossa Senhora do Socorro", candidato: "Rogério Carvalho" },
  
  // São Cristóvão
  { id: 301, latitude: -10.9520, longitude: -37.1420, municipio: "São Cristóvão", candidato: "Fábio Mitidieri" },
  { id: 302, latitude: -10.9410, longitude: -37.1350, municipio: "São Cristóvão", candidato: "Alessandro Vieira" },
  { id: 303, latitude: -11.0120, longitude: -37.2050, municipio: "São Cristóvão", candidato: "Fábio Mitidieri" },

  // Itabaiana
  { id: 401, latitude: -10.6860, longitude: -37.4260, municipio: "Itabaiana", candidato: "Valmir de Franciscano" },
  { id: 402, latitude: -10.6780, longitude: -37.4180, municipio: "Itabaiana", candidato: "Valmir de Franciscano" },
  { id: 403, latitude: -10.6920, longitude: -37.4350, municipio: "Itabaiana", candidato: "Valmir de Franciscano" },
  { id: 404, latitude: -10.7150, longitude: -37.4420, municipio: "Itabaiana", candidato: "Fábio Mitidieri" },

  // Lagarto
  { id: 501, latitude: -10.9170, longitude: -37.6500, municipio: "Lagarto", candidato: "Fábio Mitidieri" },
  { id: 502, latitude: -10.9250, longitude: -37.6620, municipio: "Lagarto", candidato: "Fábio Mitidieri" },
  { id: 503, latitude: -10.9080, longitude: -37.6380, municipio: "Lagarto", candidato: "Rogério Carvalho" },
  { id: 504, latitude: -10.8850, longitude: -37.6150, municipio: "Lagarto", candidato: "Valmir de Franciscano" },

  // Estância
  { id: 601, latitude: -11.2680, longitude: -37.4380, municipio: "Estância", candidato: "Fábio Mitidieri" },
  { id: 602, latitude: -11.2580, longitude: -37.4250, municipio: "Estância", candidato: "Alessandro Vieira" },
  { id: 603, latitude: -11.3520, longitude: -37.3850, municipio: "Estância", candidato: "Fábio Mitidieri" },

  // Barra dos Coqueiros
  { id: 701, latitude: -10.9085, longitude: -37.0385, municipio: "Barra dos Coqueiros", candidato: "Fábio Mitidieri" },
  { id: 702, latitude: -10.8920, longitude: -37.0250, municipio: "Barra dos Coqueiros", candidato: "Fábio Mitidieri" },

  // Tobias Barreto
  { id: 801, latitude: -11.1820, longitude: -37.9980, municipio: "Tobias Barreto", candidato: "Valmir de Franciscano" },
  { id: 802, latitude: -11.1950, longitude: -37.9850, municipio: "Tobias Barreto", candidato: "Fábio Mitidieri" },

  // N. Sra. da Glória
  { id: 901, latitude: -10.2180, longitude: -37.4220, municipio: "Nossa Senhora da Glória", candidato: "Fábio Mitidieri" },
  { id: 902, latitude: -10.2290, longitude: -37.4350, municipio: "Nossa Senhora da Glória", candidato: "Rogério Carvalho" },

  // Propriá
  { id: 1001, latitude: -10.2120, longitude: -36.8380, municipio: "Propriá", candidato: "Fábio Mitidieri" },

  // Simão Dias
  { id: 1101, latitude: -10.7380, longitude: -37.8120, municipio: "Simão Dias", candidato: "Valmir de Franciscano" },

  // Test Outliers (Fora do município / Fora de Sergipe para demonstrar segurança)
  { id: 9901, latitude: -10.0000, longitude: -35.0000, municipio: "Oceano", candidato: "Indeciso" },
  { id: 9902, latitude: -12.9714, longitude: -38.5014, municipio: "Salvador - BA", candidato: "Indeciso" }
];

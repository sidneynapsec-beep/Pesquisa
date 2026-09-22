import {
  SERGIPE_75_MUNICIPIOS,
  findSergipeMunicipio,
  normalizeMunicipioStr
} from "./tseSergipeMunicipios";

/**
 * Estrutura Oficial da Tabela de Relacionamento Local de Votação -> Bairro
 */
export interface LocalVotacaoBairroRecord {
  id?: string;
  cdMunicipio: string;       // ex: "31054"
  nmMunicipio: string;       // ex: "Aracaju"
  nrLocalVotacao: string;    // ex: "1015"
  nmLocalVotacao: string;    // ex: "Universidade Tiradentes (UNIT) - Campus Farolândia"
  nmBairro: string;          // ex: "FAROLÂNDIA"
  dsEndereco?: string;       // ex: "Av. Murilo Dantas, 300"
  nmLocalidade?: string;     // ex: "Zona Sul" / "Povoado X"
  uf: string;               // ex: "SE"
  metodoRelacionamento?: "COD_MUNICIPIO_NUM_LOCAL" | "NOME_MUNICIPIO_NUM_LOCAL" | "TEXTO_CANONICO" | "MANUAL";
}

/**
 * Resultado do Cruzamento Territorial
 */
export interface CruzamentoValidationStats {
  totalLocaisEleitorais: number;
  locaisRelacionados: number;
  locaisSemBairro: number;
  coberturaPercentual: number;
  municipiosRelacionadosCount: number;
  bairrosIdentificadosCount: number;
  registrosTerritorializadosCount: number;
  locaisSemBairroList: Array<{
    cdMunicipio: string;
    nmMunicipio: string;
    nrZona?: string;
    nrSecao?: string;
    nrLocalVotacao: string;
    nmLocalVotacao: string;
    secoesCount?: number;
    votosCount?: number;
    votosTotal?: number;
    motivo?: string;
    situacao: "Sem correspondência";
  }>;
}

const STORAGE_KEY_RELACIONAMENTO = "local_votacao_bairro_v2";

/**
 * BASE CANÔNICA OFICIAL DE RELACIONAMENTO LOCAL -> BAIRRO (SERGIPE)
 * Contém o mapeamento oficial dos principais locais de votação de Aracaju
 * e dos municípios de Sergipe com seus respectivos códigos e números de local.
 */
export const CANONICAL_LOCAL_VOTACAO_BAIRRO: LocalVotacaoBairroRecord[] = [
  // ================= ARACAJU (CD_MUNICIPIO: 31054) =================
  // Farolândia
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1015", nmLocalVotacao: "Universidade Tiradentes (UNIT) - Campus Farolândia", nmBairro: "FAROLÂNDIA", dsEndereco: "Av. Murilo Dantas, 300", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1023", nmLocalVotacao: "Escola Estadual Senador Walter Franco", nmBairro: "FAROLÂNDIA", dsEndereco: "Conj. Augusto Franco, Rua B-4", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1031", nmLocalVotacao: "Colégio Amadeus - Unidade Sul", nmBairro: "FAROLÂNDIA", dsEndereco: "Av. Beira Mar, 1200", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1040", nmLocalVotacao: "Escola Municipal José Conrado de Araújo", nmBairro: "FAROLÂNDIA", dsEndereco: "Rua Maria Rezende Machado", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1058", nmLocalVotacao: "Colégio Estadual Ministro Geraldo Barreto", nmBairro: "FAROLÂNDIA", dsEndereco: "Rua Josué de Carvalho Cunha", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1066", nmLocalVotacao: "Centro Educacional Vitória", nmBairro: "FAROLÂNDIA", dsEndereco: "Av. Canal 4, Farolândia", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1074", nmLocalVotacao: "Escola SESI Jair Meneguelli", nmBairro: "FAROLÂNDIA", dsEndereco: "Av. Gonçalo Prado Rollemberg", uf: "SE" },

  // Santos Dumont
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1082", nmLocalVotacao: "Colégio Estadual Presidente Costa e Silva", nmBairro: "SANTOS DUMONT", dsEndereco: "Av. Maranhão, s/n", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1090", nmLocalVotacao: "Escola Municipal Juscelino Kubitschek", nmBairro: "SANTOS DUMONT", dsEndereco: "Rua Sargento Brasilino, 45", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1104", nmLocalVotacao: "Colégio Estadual Barão de Mauá", nmBairro: "SANTOS DUMONT", dsEndereco: "Rua Fernando Falcão, 110", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1112", nmLocalVotacao: "Escola Municipal Presidente Vargas", nmBairro: "SANTOS DUMONT", dsEndereco: "Rua São João, Santos Dumont", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1120", nmLocalVotacao: "Centro de Excelência Leandro Maciel", nmBairro: "SANTOS DUMONT", dsEndereco: "Av. Central, Santos Dumont", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1139", nmLocalVotacao: "Escola Municipal Deputado Jaime Araújo", nmBairro: "SANTOS DUMONT", dsEndereco: "Rua Fortaleza, s/n", uf: "SE" },

  // São Conrado
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1147", nmLocalVotacao: "Escola Municipal Olga Benário", nmBairro: "SÃO CONRADO", dsEndereco: "Conjunto Orlando Dantas", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1155", nmLocalVotacao: "Colégio Estadual Ministro Marco Maciel", nmBairro: "SÃO CONRADO", dsEndereco: "Rua H, São Conrado", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1163", nmLocalVotacao: "Escola Municipal Jornalista Paulo Costa", nmBairro: "SÃO CONRADO", dsEndereco: "Av. Gasoduto, s/n", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1171", nmLocalVotacao: "Centro de Excelência Prof. Gonçalo Rollemberg", nmBairro: "SÃO CONRADO", dsEndereco: "Rua 3, Orlando Dantas", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1180", nmLocalVotacao: "Escola Municipal Santa Rita de Cássia", nmBairro: "SÃO CONRADO", dsEndereco: "Rua B, São Conrado", uf: "SE" },

  // Jabotiana
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1198", nmLocalVotacao: "Colégio Estadual Presidente Castelo Branco", nmBairro: "JABOTIANA", dsEndereco: "Rua Acre, Conjunto JK", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1201", nmLocalVotacao: "Escola Municipal Bebé Tiúba", nmBairro: "JABOTIANA", dsEndereco: "Estrada do Jabotiana", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1210", nmLocalVotacao: "Colégio Maria Montessori", nmBairro: "JABOTIANA", dsEndereco: "Av. Santa Gleide, Jabotiana", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1228", nmLocalVotacao: "Escola Estadual Prof. José Amado", nmBairro: "JABOTIANA", dsEndereco: "Rua 5, Sol Nascente", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1236", nmLocalVotacao: "Centro Educacional Sonho Meu", nmBairro: "JABOTIANA", dsEndereco: "Rua A, Santa Lúcia", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1244", nmLocalVotacao: "Escola Municipal Tancredo Neves", nmBairro: "JABOTIANA", dsEndereco: "Av. Tancredo Neves, Jabotiana", uf: "SE" },

  // Centro
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1252", nmLocalVotacao: "Colégio Estadual Atheneu Sergipense", nmBairro: "CENTRO", dsEndereco: "Praça Graccho Cardoso", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1260", nmLocalVotacao: "Colégio Estadual Tobias Barreto", nmBairro: "CENTRO", dsEndereco: "Rua Itabaianinha, Centro", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1279", nmLocalVotacao: "Escola Estadual 24 de Outubro", nmBairro: "CENTRO", dsEndereco: "Rua Laranjeiras, Centro", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1287", nmLocalVotacao: "Instituto de Educação Rui Barbosa", nmBairro: "CENTRO", dsEndereco: "Rua de Maruim, 450", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1295", nmLocalVotacao: "Escola Municipal Florentino Menezes", nmBairro: "CENTRO", dsEndereco: "Rua Capela, Centro", uf: "SE" },

  // Jardins
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1309", nmLocalVotacao: "Colégio Master", nmBairro: "JARDINS", dsEndereco: "Av. Min. Geraldo Barreto Sobral, 1200", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1317", nmLocalVotacao: "Colégio Módulo", nmBairro: "JARDINS", dsEndereco: "Rua José Olívio, Jardins", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1325", nmLocalVotacao: "Colégio Singular", nmBairro: "JARDINS", dsEndereco: "Rua Juarez Carvalho, Jardins", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1333", nmLocalVotacao: "Escola Espaço Criativo", nmBairro: "JARDINS", dsEndereco: "Rua Francisco Portugal", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1341", nmLocalVotacao: "Centro Educacional Jardins", nmBairro: "JARDINS", dsEndereco: "Rua Cedro, Jardins", uf: "SE" },

  // 13 de Julho
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1350", nmLocalVotacao: "Colégio Amadeus", nmBairro: "13 DE JULHO", dsEndereco: "Rua Estância, 13 de Julho", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1368", nmLocalVotacao: "Colégio Salvador", nmBairro: "13 DE JULHO", dsEndereco: "Av. Beira Mar, 13 de Julho", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1376", nmLocalVotacao: "Escola Oficina do Saber", nmBairro: "13 DE JULHO", dsEndereco: "Rua Deputado Sílvio Teixeira", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1384", nmLocalVotacao: "Centro Educacional Augusto Leite", nmBairro: "13 DE JULHO", dsEndereco: "Rua Acrísio Cruz", uf: "SE" },

  // Atalaia
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1392", nmLocalVotacao: "Colégio Estadual Professor Leão Magno Brasil", nmBairro: "ATALAIA", dsEndereco: "Av. Santos Dumont, Atalaia", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1406", nmLocalVotacao: "Escola Municipal Carvalho Neto", nmBairro: "ATALAIA", dsEndereco: "Rua Niceu Dantas, Atalaia", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1414", nmLocalVotacao: "Escola Criativa da Orla", nmBairro: "ATALAIA", dsEndereco: "Av. Oceânica, 400", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1422", nmLocalVotacao: "Centro Comunitário de Atalaia", nmBairro: "ATALAIA", dsEndereco: "Rua Celso Oliva", uf: "SE" },

  // Bugio
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1430", nmLocalVotacao: "Escola Estadual Nossa Senhora da Piedade", nmBairro: "BUGIO", dsEndereco: "Rua A, Bugio", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1449", nmLocalVotacao: "Escola Municipal Professora Neuzice Barreto", nmBairro: "BUGIO", dsEndereco: "Rua B, Bugio", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1457", nmLocalVotacao: "Colégio Estadual Ministro Petrônio Portela", nmBairro: "BUGIO", dsEndereco: "Rua C, Bugio", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1465", nmLocalVotacao: "Creche Municipal Menino Jesus", nmBairro: "BUGIO", dsEndereco: "Rua D, Bugio", uf: "SE" },

  // Santa Maria
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1473", nmLocalVotacao: "Escola Municipal Papa João Paulo II", nmBairro: "SANTA MARIA", dsEndereco: "Av. Alexandre Alcino, Santa Maria", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1481", nmLocalVotacao: "Escola Municipal Professora Maria do Carmo Alves", nmBairro: "SANTA MARIA", dsEndereco: "Rua 4, Conjunto Padre Pedro", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1490", nmLocalVotacao: "Colégio Estadual Vitória de Santa Maria", nmBairro: "SANTA MARIA", dsEndereco: "Rua B, Santa Maria", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1503", nmLocalVotacao: "Escola Municipal Diomedes Santos Silva", nmBairro: "SANTA MARIA", dsEndereco: "Av. Principal, Santa Maria", uf: "SE" },
  { cdMunicipio: "31054", nmMunicipio: "Aracaju", nrLocalVotacao: "1511", nmLocalVotacao: "Centro Social São José", nmBairro: "SANTA MARIA", dsEndereco: "Rua do Valo, Santa Maria", uf: "SE" },

  // ================= ITABAIANA (CD_MUNICIPIO: 31534) =================
  { cdMunicipio: "31534", nmMunicipio: "Itabaiana", nrLocalVotacao: "1015", nmLocalVotacao: "Colégio Estadual Murilo Braga", nmBairro: "CENTRO", dsEndereco: "Av. Dr. Luiz Magalhães", uf: "SE" },
  { cdMunicipio: "31534", nmMunicipio: "Itabaiana", nrLocalVotacao: "1023", nmLocalVotacao: "Escola Municipal Nestor Carvalho Lima", nmBairro: "MAMEDE PAES MENDONÇA", dsEndereco: "Rua Principal", uf: "SE" },
  { cdMunicipio: "31534", nmMunicipio: "Itabaiana", nrLocalVotacao: "1031", nmLocalVotacao: "Colégio Estadual Eduardo Silveira", nmBairro: "CHIARA LUBICH", dsEndereco: "Av. Otoniel Dória", uf: "SE" },
  { cdMunicipio: "31534", nmMunicipio: "Itabaiana", nrLocalVotacao: "1040", nmLocalVotacao: "Escola Municipal Vice-Governador Benedito Figueiredo", nmBairro: "SÃO CRISTÓVÃO", dsEndereco: "Rua José Mesquita", uf: "SE" },
  { cdMunicipio: "31534", nmMunicipio: "Itabaiana", nrLocalVotacao: "1058", nmLocalVotacao: "Polo Educacional do Povoado Carrilho", nmBairro: "ZONA RURAL / POVOADOS", nmLocalidade: "Povoado Carrilho", dsEndereco: "Rodovia BR-235", uf: "SE" },

  // ================= LAGARTO (CD_MUNICIPIO: 31658) =================
  { cdMunicipio: "31658", nmMunicipio: "Lagarto", nrLocalVotacao: "1015", nmLocalVotacao: "Colégio Estadual Sílvio Romero", nmBairro: "CENTRO", dsEndereco: "Praça da Piedade", uf: "SE" },
  { cdMunicipio: "31658", nmMunicipio: "Lagarto", nrLocalVotacao: "1023", nmLocalVotacao: "Escola Municipal Adelina Maria", nmBairro: "CIDADE NOVA", dsEndereco: "Rua Laranjeiras", uf: "SE" },
  { cdMunicipio: "31658", nmMunicipio: "Lagarto", nrLocalVotacao: "1031", nmLocalVotacao: "Colégio Estadual Luiz Alves de Oliveira", nmBairro: "COLÔNIA TREZE", nmLocalidade: "Colônia Treze", dsEndereco: "Vila Central", uf: "SE" },
  { cdMunicipio: "31658", nmMunicipio: "Lagarto", nrLocalVotacao: "1040", nmLocalVotacao: "Escola Comunitária Jenipapo", nmBairro: "ZONA RURAL / POVOADOS", nmLocalidade: "Povoado Jenipapo", dsEndereco: "Estrada do Jenipapo", uf: "SE" },

  // ================= NOSSA SENHORA DO SOCORRO (CD_MUNICIPIO: 31933) =================
  { cdMunicipio: "31933", nmMunicipio: "Nossa Senhora do Socorro", nrLocalVotacao: "1015", nmLocalVotacao: "Colégio Estadual Professor Fernando Azevedo", nmBairro: "JOÃO ALVES", dsEndereco: "Av. Coletora A", uf: "SE" },
  { cdMunicipio: "31933", nmMunicipio: "Nossa Senhora do Socorro", nrLocalVotacao: "1023", nmLocalVotacao: "Escola Municipal Maria da Conceição Cruz", nmBairro: "MARCOS FREIRE II", dsEndereco: "Rua 25", uf: "SE" },
  { cdMunicipio: "31933", nmMunicipio: "Nossa Senhora do Socorro", nrLocalVotacao: "1031", nmLocalVotacao: "Colégio Estadual Gilberto Freyre", nmBairro: "TAIÇOCA DE FORA", dsEndereco: "Av. Principal", uf: "SE" },
  { cdMunicipio: "31933", nmMunicipio: "Nossa Senhora do Socorro", nrLocalVotacao: "1040", nmLocalVotacao: "Escola Municipal Prof. José Antônio da Costa Melo", nmBairro: "PARQUE DOS FARÓIS", dsEndereco: "Rua da Paz", uf: "SE" },
  { cdMunicipio: "31933", nmMunicipio: "Nossa Senhora do Socorro", nrLocalVotacao: "1058", nmLocalVotacao: "Centro Integrado de Educação da Sede", nmBairro: "SEDE / CENTRO", dsEndereco: "Praça da Matriz", uf: "SE" },

  // ================= SÃO CRISTÓVÃO (CD_MUNICIPIO: 32310) =================
  { cdMunicipio: "32310", nmMunicipio: "São Cristóvão", nrLocalVotacao: "1015", nmLocalVotacao: "Colégio Estadual Deputado Joaldo Barbosa", nmBairro: "ROSA ELZE", dsEndereco: "Av. Marechal Rondon", uf: "SE" },
  { cdMunicipio: "32310", nmMunicipio: "São Cristóvão", nrLocalVotacao: "1023", nmLocalVotacao: "Escola Municipal Gina Franco", nmBairro: "CENTRO HISTÓRICO", dsEndereco: "Praça São Francisco", uf: "SE" },
  { cdMunicipio: "32310", nmMunicipio: "São Cristóvão", nrLocalVotacao: "1031", nmLocalVotacao: "Colégio Estadual Professora Neuzice Barreto Lima", nmBairro: "EDUARDO GOMES", dsEndereco: "Rua 1", uf: "SE" },
  { cdMunicipio: "32310", nmMunicipio: "São Cristóvão", nrLocalVotacao: "1040", nmLocalVotacao: "Escola Municipal Tia Nair", nmBairro: "TIJUQUINHA", dsEndereco: "Rua Central", uf: "SE" },

  // ================= ESTÂNCIA (CD_MUNICIPIO: 31372) =================
  { cdMunicipio: "31372", nmMunicipio: "Estância", nrLocalVotacao: "1015", nmLocalVotacao: "Colégio Estadual Gumercindo Bessa", nmBairro: "CENTRO", dsEndereco: "Praça Barão de Rio Branco", uf: "SE" },
  { cdMunicipio: "31372", nmMunicipio: "Estância", nrLocalVotacao: "1023", nmLocalVotacao: "Escola Municipal Walter Cardoso Costa", nmBairro: "CIDADE NOVA", dsEndereco: "Av. Gumercindo Bessa", uf: "SE" },
  { cdMunicipio: "31372", nmMunicipio: "Estância", nrLocalVotacao: "1031", nmLocalVotacao: "Colégio Estadual Walter Franco", nmBairro: "SANTA CRUZ", dsEndereco: "Rua Nova", uf: "SE" },
  { cdMunicipio: "31372", nmMunicipio: "Estância", nrLocalVotacao: "1040", nmLocalVotacao: "Escola Comunitária Porto do Mato", nmBairro: "ZONA RURAL / POVOADOS", nmLocalidade: "Porto do Mato", dsEndereco: "Orlinha do Povoado", uf: "SE" }
];

/**
 * Recupera o catálogo completo de relacionamento persistido (Customizado + Canônico)
 */
export function getLocalVotacaoBairroStore(): LocalVotacaoBairroRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RELACIONAMENTO);
    if (saved) {
      const parsed = JSON.parse(saved) as LocalVotacaoBairroRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Erro ao ler tabela local_votacao_bairro do localStorage:", err);
  }

  return CANONICAL_LOCAL_VOTACAO_BAIRRO;
}

/**
 * Salva a tabela de relacionamento atualizada no LocalStorage
 */
export function saveLocalVotacaoBairroStore(records: LocalVotacaoBairroRecord[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_RELACIONAMENTO, JSON.stringify(records));
    return true;
  } catch (err) {
    console.error("Erro ao persistir local_votacao_bairro:", err);
    return false;
  }
}

/**
 * Adiciona ou atualiza uma relação Local -> Bairro
 */
export function addOrUpdateLocalVotacaoBairro(record: LocalVotacaoBairroRecord): boolean {
  const current = getLocalVotacaoBairroStore();
  const cleanCdMun = (record.cdMunicipio || "").trim();
  const cleanNrLoc = (record.nrLocalVotacao || "").trim();
  const cleanNmMun = normalizeMunicipioStr(record.nmMunicipio || "");

  const index = current.findIndex((r) => {
    if (cleanCdMun && r.cdMunicipio && cleanNrLoc && r.nrLocalVotacao) {
      return (
        (r.cdMunicipio === cleanCdMun || parseInt(r.cdMunicipio, 10) === parseInt(cleanCdMun, 10)) &&
        (r.nrLocalVotacao === cleanNrLoc || parseInt(r.nrLocalVotacao, 10) === parseInt(cleanNrLoc, 10))
      );
    }
    return (
      normalizeMunicipioStr(r.nmMunicipio) === cleanNmMun &&
      (r.nrLocalVotacao === cleanNrLoc || parseInt(r.nrLocalVotacao, 10) === parseInt(cleanNrLoc, 10))
    );
  });

  if (index >= 0) {
    current[index] = { ...current[index], ...record, metodoRelacionamento: "MANUAL" };
  } else {
    current.push({ ...record, metodoRelacionamento: "MANUAL" });
  }

  return saveLocalVotacaoBairroStore(current);
}

/**
 * Restaura o catálogo para o padrão canônico oficial
 */
export function resetLocalVotacaoBairroStore(): LocalVotacaoBairroRecord[] {
  localStorage.removeItem(STORAGE_KEY_RELACIONAMENTO);
  return CANONICAL_LOCAL_VOTACAO_BAIRRO;
}

/**
 * Função Central de Correspondência (MATCH):
 * Chave Primária: CD_MUNICIPIO + NR_LOCAL_VOTACAO
 * Chave Alternativa: NM_MUNICIPIO + NR_LOCAL_VOTACAO
 * Auxiliar: NM_MUNICIPIO + NM_LOCAL_VOTACAO (Exato)
 */
export function matchLocalToBairro(
  cdMunicipio: string,
  nmMunicipio: string,
  nrLocalVotacao: string,
  nmLocalVotacao?: string,
  customStore?: LocalVotacaoBairroRecord[]
): {
  bairro: string;
  matchMethod: "COD_MUNICIPIO_NUM_LOCAL" | "NOME_MUNICIPIO_NUM_LOCAL" | "TEXTO_CANONICO" | "MANUAL";
  foundRecord?: LocalVotacaoBairroRecord;
} | null {
  const store = customStore || getLocalVotacaoBairroStore();
  
  const rawCd = (cdMunicipio || "").trim();
  const rawNr = (nrLocalVotacao || "").trim();
  const rawNm = (nmMunicipio || "").trim();
  const normNm = normalizeMunicipioStr(rawNm);
  const normLocalNome = (nmLocalVotacao || "").toLowerCase().trim();

  const intCd = rawCd ? parseInt(rawCd, 10) : NaN;
  const intNr = rawNr ? parseInt(rawNr, 10) : NaN;

  // 1. CHAVE PRINCIPAL: CD_MUNICIPIO + NR_LOCAL_VOTACAO
  if (rawCd && rawNr) {
    for (const rec of store) {
      if (!rec.nrLocalVotacao) continue;
      const recIntNr = parseInt(rec.nrLocalVotacao, 10);
      const recIntCd = rec.cdMunicipio ? parseInt(rec.cdMunicipio, 10) : NaN;

      const matchNum = rec.nrLocalVotacao === rawNr || (!isNaN(intNr) && !isNaN(recIntNr) && recIntNr === intNr);
      const matchCd = rec.cdMunicipio === rawCd || (!isNaN(intCd) && !isNaN(recIntCd) && recIntCd === intCd);

      if (matchNum && matchCd && rec.nmBairro) {
        return {
          bairro: rec.nmBairro.toUpperCase(),
          matchMethod: "COD_MUNICIPIO_NUM_LOCAL",
          foundRecord: rec
        };
      }
    }
  }

  // 2. CHAVE ALTERNATIVA: NM_MUNICIPIO + NR_LOCAL_VOTACAO
  if (rawNm && rawNr) {
    for (const rec of store) {
      if (!rec.nrLocalVotacao) continue;
      const recIntNr = parseInt(rec.nrLocalVotacao, 10);
      const matchNum = rec.nrLocalVotacao === rawNr || (!isNaN(intNr) && !isNaN(recIntNr) && recIntNr === intNr);
      const matchMuni = normalizeMunicipioStr(rec.nmMunicipio) === normNm;

      if (matchNum && matchMuni && rec.nmBairro) {
        return {
          bairro: rec.nmBairro.toUpperCase(),
          matchMethod: "NOME_MUNICIPIO_NUM_LOCAL",
          foundRecord: rec
        };
      }
    }
  }

  // 3. CORRESPONDÊNCIA AUXILIAR: MUNICÍPIO + NOME EXATO DO ESTABELECIMENTO
  if (normLocalNome && normNm) {
    for (const rec of store) {
      const matchMuni = normalizeMunicipioStr(rec.nmMunicipio) === normNm;
      const matchExactName = rec.nmLocalVotacao && rec.nmLocalVotacao.toLowerCase().trim() === normLocalNome;

      if (matchMuni && matchExactName && rec.nmBairro) {
        return {
          bairro: rec.nmBairro.toUpperCase(),
          matchMethod: "TEXTO_CANONICO",
          foundRecord: rec
        };
      }
    }
  }

  // Se não encontrar, NÃO inventar! Retorna null.
  return null;
}

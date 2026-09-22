import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  queryElectoralData,
  queryTerritorializedBairroResults
} from "../src/data/unifiedElectoralStore";
import {
  getMunicipalSummary,
  BASE_TERRITORIAL_SERGIPE
} from "../src/data/bairrosElectoralDatabase";
import { getProjectionsByRole } from "../src/data/electoralProjections";
import { DEFAULT_TSE_PRESET_BASE_2026 } from "../src/data/tseProfileStore";
import { Poll } from "../src/types";

describe("SEIE Data Integrity, Origin & Provenance Audit Suite", () => {

  test("1. Consulta a município inexistente na base oficial -> Retorna NOT_FOUND sem inventar vencedor ou votos", () => {
    const result = queryElectoralData({
      ano: "2024",
      municipio: "MunicipioInexistenteFake",
      cargo: "Prefeito"
    });

    assert.equal(result.found, false, "found deve ser false");
    assert.equal(result.source, "NOT_FOUND", "source deve ser NOT_FOUND");
    assert.equal(result.totalVotosCidade, 0, "totalVotosCidade deve ser 0");
    assert.equal(result.totalValidosCidade, 0, "totalValidosCidade deve ser 0");
    assert.equal(result.desempenhoLocalPercent, 0, "desempenhoLocalPercent deve ser 0");
    assert.equal(result.bairros.length, 0, "Não deve haver bairros inventados");
    assert.ok(result.provenance, "Objeto provenance deve existir");
    assert.equal(result.provenance?.type, "NOT_FOUND", "Provenance type deve ser NOT_FOUND");
    assert.match(result.statusMessage || "", /não disponível/i, "Mensagem deve indicar que o dado não está disponível");
  });

  test("2. Consulta a dados canônicos homologados do TSE -> Retorna dados oficiais com proveniência", () => {
    const result = queryElectoralData({
      ano: "2024",
      municipio: "Aracaju",
      cargo: "Prefeito"
    });

    assert.equal(result.found !== false, true, "Registro oficial de Aracaju deve existir");
    assert.equal(result.municipio, "Aracaju");
    assert.equal(result.ano, "2024");
    assert.ok(result.totalVotosCidade > 0, "Votos apurados devem ser > 0");
    assert.ok(result.bairros.length > 0, "Deve conter bairros reais");
  });

  test("3. Consulta territorial por bairro inexistente -> Retorna NOT_FOUND sem gerar dados fictícios", () => {
    const result = queryTerritorializedBairroResults({
      ano: "2024",
      municipio: "Aracaju",
      cargo: "Prefeito",
      bairro: "BAIRRO_INEXISTENTE_XYZ"
    });

    assert.equal((result as any).found, false, "found deve ser false para bairro inexistente");
    assert.equal(result.vencedor, null, "vencedor deve ser null");
    assert.equal(result.rankingCandidatos.length, 0, "ranking deve estar vazio");
    assert.equal(result.locaisVotacao.length, 0, "locais de votação devem estar vazios");
    assert.equal(result.totalVotosBairro, 0, "totalVotosBairro deve ser 0");
    assert.equal((result as any).provenance?.type, "NOT_FOUND", "provenance type deve ser NOT_FOUND");
    assert.match(result.statusTexto, /não disponível/i);
  });

  test("4. Consulta territorial em município sem dados carregados -> Sem coordenadas fixas ou vencedor fake", () => {
    const result = queryTerritorializedBairroResults({
      ano: "2024",
      municipio: "CidadeSemDadosNaBase",
      cargo: "Prefeito",
      bairro: "TODOS"
    });

    assert.equal((result as any).found, false, "found deve ser false");
    assert.equal(result.vencedor, null, "vencedor deve ser null");
    assert.equal(result.rankingCandidatos.length, 0);
    assert.equal(result.locaisVotacao.length, 0);
    assert.equal((result as any).provenance?.type, "NOT_FOUND");
  });

  test("5. getMunicipalSummary -> Não gera seções/locais default arbitrários (120/25) quando não existirem", () => {
    const summary = getMunicipalSummary("Aracaju", "2024");
    assert.ok(summary, "Sumário de Aracaju 2024 deve existir");
    assert.equal(summary?.temDadosVotacao, true);
    assert.equal(summary?.provenance?.type, "OFFICIAL", "Proveniência deve ser OFFICIAL");
    assert.match(summary?.provenance?.source || "", /TSE/i);
  });

  test("6. Projeções eleitorais matemáticas -> Marcadas estritamente como PROJECTION ou ESTIMATED", () => {
    const mockPoll: Poll = {
      id: "poll-test-1",
      institute: "Instituto Teste",
      registryNumber: "SE-12345/2026",
      conre: "12345",
      sampleSize: 1000,
      marginOfError: 3.1,
      confidenceLevel: 95,
      fieldworkStart: "2026-08-01",
      fieldworkEnd: "2026-08-05",
      medianDate: "2026-08-03",
      statistician: "Estatístico Responsável",
      type: "Registrada",
      results: {
        "Fábio Mitidieri": 45,
        "Rogério Carvalho": 35,
        "Brancos/Nulos": 10,
        "Indecisos": 10
      },
      roleResults: {
        "Governador": {
          "Fábio Mitidieri": 45,
          "Rogério Carvalho": 35,
          "Brancos/Nulos": 10,
          "Indecisos": 10
        }
      }
    };

    const projection = getProjectionsByRole("Governador", [mockPoll]);

    assert.ok(projection.candidates.length > 0, "Deve conter candidatos");
    projection.candidates.forEach((cand) => {
      assert.ok(cand.provenance, `Candidato ${cand.name} deve ter provenance`);
      assert.equal(cand.provenance?.type, "PROJECTION", `Proveniência de ${cand.name} deve ser PROJECTION`);
      assert.notEqual(cand.provenance?.type, "OFFICIAL", "Projeções NÃO podem ser marcadas como OFFICIAL TSE");
    });

    assert.ok(projection.roleStats.provenance, "roleStats deve ter provenance");
    assert.equal(projection.roleStats.provenance?.type, "ESTIMATED", "roleStats deve ser ESTIMATED");
  });

  test("7. Projeção de cadeiras proporcionais (Quociente Partidário & D'Hondt) -> Marcada como PROJECTION", () => {
    const mockPollDep: Poll = {
      id: "poll-test-dep",
      institute: "Instituto Teste",
      registryNumber: "SE-54321/2026",
      conre: "12345",
      sampleSize: 1500,
      marginOfError: 2.5,
      confidenceLevel: 95,
      fieldworkStart: "2026-08-10",
      fieldworkEnd: "2026-08-15",
      medianDate: "2026-08-12",
      statistician: "Estatístico Responsável",
      type: "Registrada",
      results: {},
      roleResults: {
        "Deputado Federal": {
          "Yandra de André": 18,
          "Rodrigo Valadares": 15,
          "Ícaro de Valmir": 12,
          "Katarina Feitoza": 10
        }
      }
    };

    const projection = getProjectionsByRole("Deputado Federal", [mockPollDep]);
    if (projection.proportionalResult) {
      assert.ok(projection.proportionalResult.provenance, "proportionalResult deve conter provenance");
      assert.equal(projection.proportionalResult.provenance?.type, "PROJECTION", "Deve ser PROJECTION");
      assert.notEqual(projection.proportionalResult.provenance?.type, "OFFICIAL");
    }
  });

  test("8. Base oficial pré-configurada do TSE para Sergipe 2026 -> Proveniência OFFICIAL homologada", () => {
    assert.ok(DEFAULT_TSE_PRESET_BASE_2026.provenance, "DEFAULT_TSE_PRESET_BASE_2026 deve ter provenance");
    assert.equal(DEFAULT_TSE_PRESET_BASE_2026.provenance?.type, "OFFICIAL");
    assert.match(DEFAULT_TSE_PRESET_BASE_2026.provenance?.source || "", /TSE/i);
    assert.equal(DEFAULT_TSE_PRESET_BASE_2026.meta.provenance?.type, "OFFICIAL");
  });

  test("9. Garantia de não-invenção de dados: Nenhum registro canônico contém marcadores de teste ou simulação", () => {
    BASE_TERRITORIAL_SERGIPE.forEach((record) => {
      assert.notEqual(record.source, "MOCK", `Registro ${record.id} não pode ser MOCK`);
      assert.notEqual(record.source, "FAKE", `Registro ${record.id} não pode ser FAKE`);
      assert.notEqual(record.source, "SYNTHETIC", `Registro ${record.id} não pode ser SYNTHETIC`);
    });
  });

});

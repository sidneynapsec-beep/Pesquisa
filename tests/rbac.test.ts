import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";

// Set test environment
process.env.NODE_ENV = "test";
delete process.env.ALLOW_DEV_AUTH_BYPASS;

describe("SEIE RBAC Security & Authentication Audit Suite", () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    const { app } = await import("../server.ts");
    // Desativar o bypass carregado pelo dotenv de .env para os testes de controle de acesso
    process.env.ALLOW_DEV_AUTH_BYPASS = "false";
    delete process.env.ALLOW_DEV_AUTH_BYPASS;

    await new Promise<void>((resolve) => {
      server = http.createServer(app);
      server.listen(0, "127.0.0.1", () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      (server as any).closeAllConnections?.();
      server.close(() => resolve());
    });
    setTimeout(() => {
      process.exit(0);
    }, 50);
  });

  // 1. Sem autenticação
  test("1. Sem autenticação: endpoint protegido de leitura (/api/polls) deve retornar 401", async () => {
    const res = await fetch(`${baseUrl}/api/polls`);
    assert.strictEqual(res.status, 401, "Endpoint de leitura protegido sem auth deve retornar 401");
    const body = await res.json();
    assert.strictEqual(body.code, "AUTH_TOKEN_MISSING");
  });

  test("1b. Sem autenticação: endpoint administrativo (/api/polls POST) deve retornar 401", async () => {
    const res = await fetch(`${baseUrl}/api/polls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ institute: "Datafolha", results: { "Candidato": 45 } })
    });
    assert.strictEqual(res.status, 401, "Endpoint administrativo sem auth deve retornar 401");
  });

  // 2. Viewer autenticado: leitura permitida
  test("2. Viewer autenticado: GET /api/polls deve retornar 200", async () => {
    const res = await fetch(`${baseUrl}/api/polls`, {
      headers: { Authorization: "Bearer test-viewer-token" }
    });
    assert.strictEqual(res.status, 200, "Viewer autenticado deve conseguir ler /api/polls");
    const body = await res.json();
    assert.strictEqual(body.status, "success");
  });

  test("2b. Viewer autenticado: GET /api/datasets deve retornar 200", async () => {
    const res = await fetch(`${baseUrl}/api/datasets`, {
      headers: { Authorization: "Bearer test-viewer-token" }
    });
    assert.strictEqual(res.status, 200, "Viewer autenticado deve conseguir ler /api/datasets");
    const body = await res.json();
    assert.strictEqual(body.status, "success");
  });

  // 3. Viewer autenticado: mutação administrativa bloqueada (403)
  test("3. Viewer autenticado: POST /api/polls deve retornar 403 Forbidden", async () => {
    const res = await fetch(`${baseUrl}/api/polls`, {
      method: "POST",
      headers: {
        Authorization: "Bearer test-viewer-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ institute: "Ipec", results: { "Candidato A": 40 } })
    });
    assert.strictEqual(res.status, 403, "Viewer tentando mutação deve receber 403");
    const body = await res.json();
    assert.strictEqual(body.code, "FORBIDDEN");
  });

  test("3b. Viewer autenticado: POST /api/radar/collect deve retornar 403 Forbidden", async () => {
    const res = await fetch(`${baseUrl}/api/radar/collect`, {
      method: "POST",
      headers: {
        Authorization: "Bearer test-viewer-token",
        "Content-Type": "application/json"
      }
    });
    assert.strictEqual(res.status, 403, "Viewer tentando coletar radar deve receber 403");
    const body = await res.json();
    assert.strictEqual(body.code, "FORBIDDEN");
  });

  // 4. Administrator autenticado: operações administrativas permitidas
  test("4. Administrator autenticado: POST /api/polls deve ser autorizado (não 401/403)", async () => {
    const res = await fetch(`${baseUrl}/api/polls`, {
      method: "POST",
      headers: {
        Authorization: "Bearer test-admin-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pollData: {
          id: `poll-test-${Date.now()}`,
          institute: "CTAS Test Institute",
          results: { "Valadares": 35 }
        }
      })
    });
    // Deve permitir a execução administrativa (status 200)
    assert.strictEqual(res.status, 200, "Administrator autenticado deve conseguir criar/sincronizar pesquisas");
    const body = await res.json();
    assert.strictEqual(body.status, "success");
  });

  // 5. Tentativa de escalação via x-user-role: Administrator
  test("5. Tentativa de escalação via x-user-role: Administrator deve retornar 403 para Viewer", async () => {
    const res = await fetch(`${baseUrl}/api/polls`, {
      method: "POST",
      headers: {
        Authorization: "Bearer test-viewer-token",
        "Content-Type": "application/json",
        "x-user-role": "Administrator"
      },
      body: JSON.stringify({ institute: "HackInstitute", results: { "Attacker": 99 } })
    });
    assert.strictEqual(res.status, 403, "x-user-role não deve escalar privilégio de Viewer para Administrator");
    const body = await res.json();
    assert.strictEqual(body.code, "FORBIDDEN");
  });

  test("5b. Tentativa de escalação via x-user-role sem token deve retornar 401", async () => {
    const res = await fetch(`${baseUrl}/api/polls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": "Administrator"
      },
      body: JSON.stringify({ institute: "HackInstitute", results: { "Attacker": 99 } })
    });
    assert.strictEqual(res.status, 401, "x-user-role sem token deve retornar 401");
  });

  // 6. Tentativa de escalação via body.role = Administrator
  test("6. Tentativa de escalação via body.role='Administrator' deve retornar 403 para Viewer", async () => {
    const res = await fetch(`${baseUrl}/api/polls`, {
      method: "POST",
      headers: {
        Authorization: "Bearer test-viewer-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "Administrator",
        institute: "HackInstitute",
        results: { "Attacker": 99 }
      })
    });
    assert.strictEqual(res.status, 403, "body.role não deve conceder privilégios administrativos");
    const body = await res.json();
    assert.strictEqual(body.code, "FORBIDDEN");
  });

  // 7. Token inválido/expirado
  test("7. Token inválido/expirado deve retornar 401 Unauthorized", async () => {
    const res = await fetch(`${baseUrl}/api/polls`, {
      headers: { Authorization: "Bearer malformed.token.xyz" }
    });
    assert.strictEqual(res.status, 401, "Token inválido deve retornar 401");
    const body = await res.json();
    assert.strictEqual(body.code, "AUTH_TOKEN_INVALID");
  });

  // 8. Dev bypass: funciona em development/test quando ALLOW_DEV_AUTH_BYPASS=true
  test("8. Dev bypass ativo: permite acesso administrativo sem token quando habilitado", async () => {
    const originalBypass = process.env.ALLOW_DEV_AUTH_BYPASS;
    try {
      process.env.ALLOW_DEV_AUTH_BYPASS = "true";
      const res = await fetch(`${baseUrl}/api/polls`);
      assert.strictEqual(res.status, 200, "Dev bypass habilitado deve responder 200");
    } finally {
      if (originalBypass !== undefined) {
        process.env.ALLOW_DEV_AUTH_BYPASS = originalBypass;
      } else {
        delete process.env.ALLOW_DEV_AUTH_BYPASS;
      }
    }
  });

  // 9. Proteção de Produção: Fail Closed se NODE_ENV=production e ALLOW_DEV_AUTH_BYPASS=true
  test("9. Produção: servidor deve falhar imediatamente (FAIL CLOSED) se ALLOW_DEV_AUTH_BYPASS=true", async () => {
    const proc = spawn("npx", ["tsx", "-e", "import './server.ts'"], {
      env: {
        ...process.env,
        NODE_ENV: "production",
        ALLOW_DEV_AUTH_BYPASS: "true"
      }
    });

    let stderrData = "";
    proc.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    const exitCode = await new Promise<number | null>((resolve) => {
      proc.on("close", (code) => resolve(code));
    });

    assert.notStrictEqual(exitCode, 0, "Processo com NODE_ENV=production e ALLOW_DEV_AUTH_BYPASS=true deve encerrar com erro");
    assert.match(
      stderrData,
      /ALLOW_DEV_AUTH_BYPASS n[ãa]o pode ser habilitado em produ[çc][ãa]o/,
      "Deve emitir mensagem de erro explícita sobre proibição de bypass em produção"
    );
  });
});

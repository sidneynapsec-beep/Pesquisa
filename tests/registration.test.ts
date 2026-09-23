import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

process.env.NODE_ENV = "test";
delete process.env.ALLOW_DEV_AUTH_BYPASS;

describe("SEIE Registration & Access Request Endpoint Tests", () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    const { app } = await import("../api/index.ts");
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
  });

  test("1. Erro de validação: Cadastro sem nome retorna 400 e JSON com success: false e mensagem de erro", async () => {
    const res = await fetch(`${baseUrl}/api/auth/request-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "teste@example.com", password: "senha123teste" })
    });
    assert.strictEqual(res.status, 400);
    const contentType = res.headers.get("content-type") || "";
    assert.ok(contentType.includes("application/json"), "Deve retornar Content-Type application/json");
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error && data.error.length > 0);
  });

  test("2. Erro de validação: Cadastro com e-mail inválido retorna 400 e JSON com success: false", async () => {
    const res = await fetch(`${baseUrl}/api/auth/request-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Usuario Teste", email: "email-invalido", password: "senha123teste" })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error && data.error.includes("E-mail"));
  });

  test("3. Sucesso: Cadastro com dados válidos retorna 200 e JSON com success: true e mensagem apropriada", async () => {
    const testEmail = `novo.usuario.${Date.now()}@instituto.se.gov.br`;
    const res = await fetch(`${baseUrl}/api/auth/request-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Pesquisador João Silva",
        email: testEmail,
        password: "senhaSegura123",
        organization: "Instituto de Pesquisa"
      })
    });
    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get("content-type") || "";
    assert.ok(contentType.includes("application/json"), "Content-Type deve ser application/json");
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.message && data.message.includes("sucesso"));
  });

  test("4. Rota reescrita /auth/request-access (Vercel rewrite) responde idêntica e em JSON", async () => {
    const testEmail = `novo.rewrite.${Date.now()}@seie.gov.br`;
    const res = await fetch(`${baseUrl}/auth/request-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Maria Santos",
        email: testEmail,
        password: "senhaSegura123"
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  test("5. Rota de API inexistente (/api/rota-que-nao-existe) retorna 404 em JSON e nunca texto puro ou HTML", async () => {
    const res = await fetch(`${baseUrl}/api/rota-que-nao-existe`, {
      headers: { Authorization: "Bearer test-admin-token" }
    });
    assert.strictEqual(res.status, 404);
    const contentType = res.headers.get("content-type") || "";
    assert.ok(contentType.includes("application/json"), "Content-Type deve ser application/json");
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error && data.error.includes("não encontrada"));
  });
});

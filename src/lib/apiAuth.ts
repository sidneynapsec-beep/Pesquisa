import { auth } from "./firebase";

/**
 * Utilitário centralizado para cabeçalhos e requisições autenticadas no SEIE.
 * Garante que tokens JWT do Firebase sejam anexados via Authorization Bearer,
 * eliminando vulnerabilidades de bypass via x-user-role ou body.role.
 */

export async function getAuthHeaders(extraHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders
  };

  // 1. Token de sessão administrativa direta do SEIE tem prioridade máxima
  if (typeof window !== "undefined") {
    const adminToken = localStorage.getItem("seie_admin_token");
    if (adminToken) {
      headers["Authorization"] = `Bearer ${adminToken}`;
    }

    const adminSecret = localStorage.getItem("seie_admin_secret");
    if (adminSecret && !headers["x-admin-secret"]) {
      headers["x-admin-secret"] = adminSecret;
    }
  }

  // 2. Se não houver token administrativo direto, recuperar token JWT do Firebase
  if (!headers["Authorization"]) {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.warn("[apiAuth] Não foi possível recuperar token JWT do Firebase:", err);
    }
  }

  return headers;
}

let onUnauthorizedCallback: (() => void) | null = null;

export function setUnauthorizedHandler(callback: () => void) {
  onUnauthorizedCallback = callback;
}

export function triggerUnauthorized() {
  if (onUnauthorizedCallback) {
    onUnauthorizedCallback();
  }
}

export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const initialHeaders = (init?.headers as Record<string, string>) || {};
  let authHeaders = await getAuthHeaders(initialHeaders);

  let response = await fetch(input, {
    ...init,
    headers: authHeaders
  });

  // Se receber 401, limpar credenciais e redirecionar para tela de autenticação
  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("seie_admin_token");
    localStorage.removeItem("seie_admin_user");
    triggerUnauthorized();
  }

  return response;
}

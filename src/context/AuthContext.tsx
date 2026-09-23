import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserRole } from "../types";
import { setUnauthorizedHandler } from "../lib/apiAuth";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "../lib/firebase";

export type AuthStatus = "INITIALIZING" | "AUTHENTICATED" | "UNAUTHENTICATED" | "PENDING_APPROVAL" | "REJECTED";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: UserRole;
  getIdToken?: () => Promise<string>;
}

export interface PendingAccessInfo {
  email: string;
  name?: string;
  organization?: string;
  requestedAt?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  code?: string;
  isPending?: boolean;
  notFound?: boolean;
}

export interface RequestAccessResult {
  success?: boolean;
  status: string;
  message: string;
  code?: string;
  error?: string;
}

export interface AuthContextType {
  status: AuthStatus;
  user: AppUser | null;
  role: UserRole;
  pendingInfo: PendingAccessInfo | null;
  setRole: (role: UserRole) => void;
  signOut: () => Promise<void>;
  handleUnauthorized: () => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  loginWithGoogle: () => Promise<LoginResult>;
  loginAsAdmin: (email?: string, password?: string) => Promise<LoginResult>;
  checkAccessStatus: (email: string) => Promise<{ status: string; role?: UserRole; name?: string; error?: string }>;
  requestAccess: (data: { email: string; name: string; password?: string; organization?: string; notes?: string }) => Promise<RequestAccessResult>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  status: "INITIALIZING",
  user: null,
  role: "Viewer",
  pendingInfo: null,
  setRole: () => {},
  signOut: async () => {},
  handleUnauthorized: () => {},
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  loginAsAdmin: async () => ({ success: false }),
  checkAccessStatus: async () => ({ status: "error" }),
  requestAccess: async () => ({ success: false, status: "error", message: "" }),
  refreshSession: async () => {}
});

export const useAuth = () => useContext(AuthContext);

/**
 * Utilitário de requisição segura para APIs de autenticação.
 * Valida response.ok e o Content-Type antes de chamar response.json(),
 * prevenindo erros de "Unexpected token 'A', 'A server e'... is not valid JSON".
 * Mantém o diagnóstico técnico completo no console sem expor segredos na UI.
 */
interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  rawText?: string;
}

async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const isJson = contentType.includes("application/json");

    if (isJson) {
      try {
        const json = await res.json();
        return {
          ok: res.ok,
          status: res.status,
          data: json,
          error: res.ok ? undefined : (json?.error || json?.message || `Erro do servidor (${res.status})`)
        };
      } catch (parseErr: any) {
        console.error("[SEIE Auth] Falha ao processar payload JSON do servidor:", parseErr);
        return {
          ok: false,
          status: res.status,
          data: null,
          error: "O servidor enviou uma resposta fora do padrão esperado. Tente novamente em instantes."
        };
      }
    }

    // O servidor retornou texto puro ou HTML (ex.: erro 500 do Node/Vercel)
    const rawText = await res.text().catch(() => "");
    console.error(
      `[SEIE Auth] Resposta não-JSON retornada pelo servidor (Status ${res.status} ${res.statusText}):`,
      rawText.slice(0, 500)
    );

    let friendlyMessage = "Não foi possível concluir a operação. O serviço está temporariamente indisponível.";
    if (res.status === 404) {
      friendlyMessage = "Serviço de autenticação não localizado no servidor.";
    } else if (res.status >= 500) {
      friendlyMessage = "Instabilidade temporária no servidor ao processar o cadastro. Tente novamente em alguns instantes.";
    }

    return {
      ok: false,
      status: res.status,
      data: null,
      error: friendlyMessage,
      rawText
    };
  } catch (networkErr: any) {
    console.error("[SEIE Auth] Erro de rede na requisição de autenticação:", networkErr);
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Falha de conexão com o servidor. Verifique sua conexão com a internet."
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("INITIALIZING");
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<UserRole>("Viewer");
  const [pendingInfo, setPendingInfo] = useState<PendingAccessInfo | null>(null);

  const checkAccessStatus = useCallback(async (email: string) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const result = await safeFetchJson(`/api/auth/check-access?email=${encodeURIComponent(cleanEmail)}`);
    if (result.ok && result.data) {
      return result.data;
    }
    return { status: "error", error: result.error };
  }, []);

  const login = useCallback(async (targetEmail: string, password?: string): Promise<LoginResult> => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("seie_explicit_logout");
    }
    const cleanEmail = (targetEmail || "").trim().toLowerCase();
    const cleanPassword = String(password || "").trim();

    const result = await safeFetchJson<any>("/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
    });

    if (result.ok && result.data && (result.data.status === "success" || result.data.success) && result.data.token) {
      const data = result.data;
      localStorage.setItem("seie_admin_token", data.token);
      localStorage.setItem("seie_admin_user", JSON.stringify(data.user));
      setUser(data.user);
      const resolvedRole: UserRole = data.user?.role || (cleanEmail === "sidneynapsec@gmail.com" ? "Administrator" : "Viewer");
      setRole(resolvedRole);
      setStatus("AUTHENTICATED");
      setPendingInfo(null);
      return { success: true };
    }

    const data = result.data;
    if (data?.code === "USER_NOT_FOUND" || result.status === 404) {
      return {
        success: false,
        notFound: true,
        code: "USER_NOT_FOUND",
        error: "Usuário não encontrado. Deseja solicitar acesso?"
      };
    }

    if (data?.code === "ACCESS_PENDING_APPROVAL" || data?.accessStatus === "pending") {
      setPendingInfo({ email: cleanEmail, name: cleanEmail.split("@")[0] });
      return {
        success: false,
        isPending: true,
        code: "ACCESS_PENDING_APPROVAL",
        error: data.message || "Seu acesso ainda está em análise pelo administrador."
      };
    }

    return {
      success: false,
      code: data?.code || "INVALID_CREDENTIALS",
      error: data?.error || data?.message || result.error || "E-mail ou senha incorretos."
    };
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<LoginResult> => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("seie_explicit_logout");
    }
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const cleanEmail = (fbUser.email || "").toLowerCase();
      const token = await fbUser.getIdToken();

      const isSidney = cleanEmail === "sidneynapsec@gmail.com";
      const resolvedRole: UserRole = isSidney ? "Administrator" : "Viewer";

      const appUser: AppUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || (isSidney ? "Sidney (Administrador SEIE)" : fbUser.email?.split("@")[0] || "Usuário"),
        photoURL: fbUser.photoURL,
        role: resolvedRole,
        getIdToken: () => fbUser.getIdToken()
      };

      localStorage.setItem("seie_admin_token", token);
      localStorage.setItem("seie_admin_user", JSON.stringify(appUser));
      setUser(appUser);
      setRole(resolvedRole);
      setStatus("AUTHENTICATED");
      setPendingInfo(null);
      return { success: true };
    } catch (err: any) {
      console.error("[SEIE Auth] Erro ao autenticar com Google:", err);
      let errorMsg = "Não foi possível autenticar com o Google. Tente novamente.";
      if (err?.code === "auth/popup-closed-by-user") {
        errorMsg = "A janela de login com o Google foi fechada antes de concluir.";
      } else if (err?.code === "auth/popup-blocked") {
        errorMsg = "O pop-up de login foi bloqueado pelo seu navegador. Permita pop-ups para este site.";
      } else if (err?.message) {
        errorMsg = err.message;
      }
      return {
        success: false,
        error: errorMsg
      };
    }
  }, []);

  // Backward compatibility alias for any existing caller
  const loginAsAdmin = useCallback((email?: string, password?: string) => {
    return login(email || "sidneynapsec@gmail.com", password);
  }, [login]);

  const requestAccess = useCallback(
    async (info: { email: string; name: string; password?: string; organization?: string; notes?: string }): Promise<RequestAccessResult> => {
      // Limpeza de campos antes de submeter
      const payload = {
        name: (info.name || "").trim(),
        email: (info.email || "").trim().toLowerCase(),
        password: String(info.password || "").trim(),
        organization: (info.organization || "").trim(),
        notes: (info.notes || "").trim()
      };

      const result = await safeFetchJson<{
        success?: boolean;
        status?: string;
        message?: string;
        error?: string;
        code?: string;
        role?: string;
      }>("/api/auth/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (result.ok && result.data) {
        const data = result.data;
        if (data.status === "approved" || data.role === "Administrator") {
          return {
            success: true,
            status: "approved",
            message: data.message || "Acesso aprovado com sucesso!"
          };
        }
        return {
          success: true,
          status: "pending",
          message: data.message || "Cadastro realizado com sucesso! Aguarde a liberação do administrador."
        };
      }

      // Em caso de erro
      const data = result.data;
      const errorMessage = data?.error || data?.message || result.error || "Erro ao processar solicitação de cadastro.";
      return {
        success: false,
        status: "error",
        code: data?.code,
        error: errorMessage,
        message: errorMessage
      };
    },
    []
  );

  const refreshSession = useCallback(async () => {
    const savedToken = localStorage.getItem("seie_admin_token");
    if (!savedToken) return;

    const result = await safeFetchJson<any>("/api/auth/session", {
      headers: { Authorization: `Bearer ${savedToken}` }
    });

    if (result.ok && result.data && (result.data.status === "authenticated" || result.data.success)) {
      const data = result.data;
      setUser(data.user);
      setRole(data.user?.role || "Viewer");
      setStatus("AUTHENTICATED");
      setPendingInfo(null);
      return;
    } else if (result.status === 403) {
      if (result.data?.accessStatus === "pending") {
        setStatus("PENDING_APPROVAL");
      }
    }
  }, []);

  const handleUnauthorized = useCallback(() => {
    console.warn("[AuthContext] Sessão não autorizada ou expirada (401).");
    try {
      localStorage.removeItem("seie_admin_token");
      localStorage.removeItem("seie_admin_user");
    } catch {}
    setUser(null);
    setRole("Viewer");
    setStatus("UNAUTHENTICATED");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
  }, [handleUnauthorized]);

  // Inicialização e restauração da sessão salva
  useEffect(() => {
    let isMounted = true;

    async function checkExistingSession() {
      try {
        const savedToken = localStorage.getItem("seie_admin_token");
        const savedUser = localStorage.getItem("seie_admin_user");

        if (savedToken) {
          const result = await safeFetchJson<any>("/api/auth/session", {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (result.ok && result.data && (result.data.status === "authenticated" || result.data.success) && isMounted) {
            const data = result.data;
            const parsed = savedUser ? JSON.parse(savedUser) : null;
            setUser(data.user || parsed);
            setRole(data.user?.role || "Viewer");
            setStatus("AUTHENTICATED");
            setPendingInfo(null);
            return;
          } else if (result.status === 403 && isMounted) {
            if (result.data?.accessStatus === "pending") {
              const parsed = savedUser ? JSON.parse(savedUser) : null;
              setPendingInfo({ email: parsed?.email || "usuario" });
              setStatus("PENDING_APPROVAL");
              return;
            }
          }
        }
      } catch (err) {
        console.warn("[AuthContext] Erro ao restaurar sessão:", err);
      }

      if (isMounted) {
        setUser(null);
        setRole("Viewer");
        setStatus("UNAUTHENTICATED");
      }
    }

    checkExistingSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Monitorar alterações de autenticação diretamente do Firebase (Google Auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        if (typeof window !== "undefined" && sessionStorage.getItem("seie_explicit_logout") === "true") {
          return;
        }
        try {
          const cleanEmail = (fbUser.email || "").toLowerCase();
          const token = await fbUser.getIdToken();
          const isSidney = cleanEmail === "sidneynapsec@gmail.com";
          const resolvedRole: UserRole = isSidney ? "Administrator" : "Viewer";

          const appUser: AppUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || (isSidney ? "Sidney (Administrador SEIE)" : fbUser.email?.split("@")[0] || "Usuário"),
            photoURL: fbUser.photoURL,
            role: resolvedRole,
            getIdToken: () => fbUser.getIdToken()
          };

          localStorage.setItem("seie_admin_token", token);
          localStorage.setItem("seie_admin_user", JSON.stringify(appUser));
          setUser(appUser);
          setRole(resolvedRole);
          setStatus("AUTHENTICATED");
          setPendingInfo(null);
        } catch (err) {
          console.warn("[AuthContext] Erro ao sincronizar sessão Firebase:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("seie_explicit_logout", "true");
      }
      localStorage.removeItem("seie_admin_token");
      localStorage.removeItem("seie_admin_user");
      await firebaseSignOut(auth).catch(() => {});
    } catch (err) {
      console.warn("Erro ao deslogar:", err);
    } finally {
      setUser(null);
      setRole("Viewer");
      setPendingInfo(null);
      setStatus("UNAUTHENTICATED");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        role,
        pendingInfo,
        setRole,
        signOut,
        handleUnauthorized,
        login,
        loginWithGoogle,
        loginAsAdmin,
        checkAccessStatus,
        requestAccess,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

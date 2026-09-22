import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserRole } from "../types";
import { setUnauthorizedHandler } from "../lib/apiAuth";

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

export interface AuthContextType {
  status: AuthStatus;
  user: AppUser | null;
  role: UserRole;
  pendingInfo: PendingAccessInfo | null;
  setRole: (role: UserRole) => void;
  signOut: () => Promise<void>;
  handleUnauthorized: () => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  loginAsAdmin: (email?: string, password?: string) => Promise<LoginResult>;
  checkAccessStatus: (email: string) => Promise<{ status: string; role?: UserRole; name?: string }>;
  requestAccess: (data: { email: string; name: string; password?: string; organization?: string; notes?: string }) => Promise<{ status: string; message: string; code?: string }>;
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
  loginAsAdmin: async () => ({ success: false }),
  checkAccessStatus: async () => ({ status: "error" }),
  requestAccess: async () => ({ status: "error", message: "" }),
  refreshSession: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("INITIALIZING");
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<UserRole>("Viewer");
  const [pendingInfo, setPendingInfo] = useState<PendingAccessInfo | null>(null);

  const checkAccessStatus = useCallback(async (email: string) => {
    try {
      const res = await fetch(`/api/auth/check-access?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      const data = await res.json();
      return data;
    } catch {
      return { status: "error" };
    }
  }, []);

  const login = useCallback(async (targetEmail: string, password?: string): Promise<LoginResult> => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("seie_explicit_logout");
    }
    const cleanEmail = (targetEmail || "").trim().toLowerCase();
    const cleanPassword = String(password || "").trim();

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json();

      if (res.ok && data.status === "success" && data.token) {
        localStorage.setItem("seie_admin_token", data.token);
        localStorage.setItem("seie_admin_user", JSON.stringify(data.user));
        setUser(data.user);
        const resolvedRole: UserRole = data.user.role || (cleanEmail === "sidneynapsec@gmail.com" ? "Administrator" : "Viewer");
        setRole(resolvedRole);
        setStatus("AUTHENTICATED");
        setPendingInfo(null);
        return { success: true };
      }

      if (data.code === "USER_NOT_FOUND" || res.status === 404) {
        return {
          success: false,
          notFound: true,
          code: "USER_NOT_FOUND",
          error: "Usuário não encontrado. Deseja solicitar acesso?"
        };
      }

      if (data.code === "ACCESS_PENDING_APPROVAL" || data.accessStatus === "pending") {
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
        code: data.code || "INVALID_CREDENTIALS",
        error: data.message || "E-mail ou senha incorretos."
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Falha na conexão com o servidor de autenticação."
      };
    }
  }, []);

  // Backward compatibility alias for any existing caller
  const loginAsAdmin = useCallback((email?: string, password?: string) => {
    return login(email || "sidneynapsec@gmail.com", password);
  }, [login]);

  const requestAccess = useCallback(
    async (info: { email: string; name: string; password?: string; organization?: string; notes?: string }) => {
      try {
        const res = await fetch("/api/auth/request-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(info)
        });
        const data = await res.json();
        if (data.status === "approved") {
          return { status: "approved", message: data.message };
        }
        if (data.status === "pending") {
          return {
            status: "pending",
            message: data.message || "Solicitação enviada com sucesso! Aguarde a liberação do administrador."
          };
        }
        return {
          status: data.status || "error",
          code: data.code,
          message: data.message || "Erro ao processar solicitação."
        };
      } catch (err: any) {
        return { status: "error", message: err?.message || "Erro de conexão com o servidor." };
      }
    },
    []
  );

  const refreshSession = useCallback(async () => {
    const savedToken = localStorage.getItem("seie_admin_token");
    if (!savedToken) return;
    try {
      const res = await fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "authenticated") {
          setUser(data.user);
          setRole(data.user.role || "Viewer");
          setStatus("AUTHENTICATED");
          setPendingInfo(null);
          return;
        }
      } else if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        if (data.accessStatus === "pending") {
          setStatus("PENDING_APPROVAL");
        }
      }
    } catch (err) {
      console.warn("[AuthContext] Falha ao renovar sessão:", err);
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
          const res = await fetch("/api/auth/session", {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.status === "authenticated" && isMounted) {
              const parsed = savedUser ? JSON.parse(savedUser) : null;
              setUser(data.user || parsed);
              setRole(data.user?.role || "Viewer");
              setStatus("AUTHENTICATED");
              setPendingInfo(null);
              return;
            }
          } else if (res.status === 403) {
            const data = await res.json().catch(() => ({}));
            if (data.accessStatus === "pending" && isMounted) {
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

  const signOut = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("seie_explicit_logout", "true");
      }
      localStorage.removeItem("seie_admin_token");
      localStorage.removeItem("seie_admin_user");
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

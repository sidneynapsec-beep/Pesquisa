import React, { useState, useEffect, useCallback } from "react";
import { AccessRequest, UserRole } from "../types";
import { useAuth } from "../context/AuthContext";
import { authenticatedFetch } from "../lib/apiAuth";
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  Trash2,
  Building,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Crown,
  Eye,
  Shield,
  FileText,
  KeyRound,
  Lock,
  EyeOff
} from "lucide-react";

export default function GestaoAcessos() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "viewer" | "admin" | "rejected">("all");

  // Manual Grant Modal / Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("Viewer");
  const [newNotes, setNewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProfiles, setSelectedProfiles] = useState<Record<string, UserRole>>({});

  // Password Management State (For Sidney)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const res = await authenticatedFetch("/api/auth/access-requests");
      if (!res.ok) {
        throw new Error("Não foi possível carregar as solicitações de acesso.");
      }
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch (err: any) {
      console.error("Erro ao buscar solicitações:", err);
      setError(err?.message || "Erro de conexão ao carregar solicitações.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleManageAccess = async (
    email: string,
    action: "approve" | "approve_viewer" | "approve_admin" | "reject" | "pending" | "delete",
    extra?: { role?: UserRole; name?: string; organization?: string; notes?: string }
  ) => {
    try {
      setActionLoading(`${email}-${action}`);
      setError(null);
      setSuccessMsg(null);

      const res = await authenticatedFetch("/api/auth/manage-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          action,
          role: extra?.role,
          name: extra?.name,
          organization: extra?.organization,
          notes: extra?.notes
        })
      });

      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Falha ao atualizar acesso.");
      }

      setSuccessMsg(data.message || "Acesso atualizado com sucesso!");
      if (data.requests) {
        setRequests(data.requests);
      } else {
        await fetchRequests();
      }

      // Limpar formulário se foi uma adição manual
      if (action.startsWith("approve") && showAddForm) {
        setShowAddForm(false);
        setNewName("");
        setNewEmail("");
        setNewOrg("");
        setNewNotes("");
      }

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err?.message || "Erro ao processar ação.");
      setTimeout(() => setError(null), 6000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      setError("Informe um e-mail válido para liberação.");
      return;
    }

    const action = newRole === "Administrator" ? "approve_admin" : "approve_viewer";
    await handleManageAccess(newEmail, action, {
      name: newName,
      organization: newOrg,
      notes: newNotes || "Concedido diretamente pelo Administrador Sidney"
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newAdminPassword.length < 6) {
      setPasswordError("A nova senha deve possuir no mínimo 6 caracteres.");
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordError("A confirmação da nova senha não confere.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authenticatedFetch("/api/auth/change-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newAdminPassword.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Erro ao atualizar senha.");
      }

      setPasswordSuccess("Senha do Administrador Total atualizada com sucesso!");
      setCurrentPassword("");
      setNewAdminPassword("");
      setConfirmAdminPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(null);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err?.message || "Erro ao trocar a senha.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Metrics
  const totalUsers = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedViewers = requests.filter((r) => r.status === "approved" && r.grantedRole === "Viewer");
  const approvedAdmins = requests.filter(
    (r) => r.status === "approved" && (r.grantedRole === "Administrator" || r.email.toLowerCase() === "sidneynapsec@gmail.com")
  );
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  // Filtered requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.organization && req.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "pending") return req.status === "pending";
    if (statusFilter === "viewer") return req.status === "approved" && req.grantedRole === "Viewer";
    if (statusFilter === "admin")
      return req.status === "approved" && (req.grantedRole === "Administrator" || req.email.toLowerCase() === "sidneynapsec@gmail.com");
    if (statusFilter === "rejected") return req.status === "rejected";

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Explanatory Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Painel do Administrador Central (Sidney)
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/20 text-blue-200 border border-blue-400/30">
                Controle de Acessos
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Liberação e Controle de Usuários do SEIE
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Você tem controle total sobre quem pode visualizar ou administrar a plataforma. Os usuários que solicitarem acesso aguardarão sua aprovação como <strong>Visualizador (apenas leitura)</strong> ou <strong>Administrador (acesso total)</strong> antes de poderem entrar.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-blue-200 hover:text-white rounded-xl border border-blue-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
              title="Atualizar lista de solicitações"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-400" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={() => {
                setShowPasswordModal(!showPasswordModal);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-400/40 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm active:scale-95"
              title="Gerenciar senha de Administrador Total (Sidney)"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>{showPasswordModal ? "Fechar Senha" : "Senha do Admin"}</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer border border-blue-400/30 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? "Fechar Cadastro" : "Liberar Usuário Antecipadamente"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password Management Card for Sidney */}
      {showPasswordModal && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl animate-in fade-in space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Segurança do Administrador Total (Sidney)
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    sidneynapsec@gmail.com
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Atualize a senha necessária para o seu acesso como Administrador Total.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              Fechar
            </button>
          </div>

          {passwordError && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Senha Atual
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Senha atual (se houver)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Nova Senha (mínimo 6 dígitos)
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Nova senha segura"
                  className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type={showPass ? "text" : "password"}
                required
                value={confirmAdminPassword}
                onChange={(e) => setConfirmAdminPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Salvar Nova Senha do Administrador</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-xl flex items-center gap-3 text-xs text-rose-200 shadow-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-xs text-emerald-200 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Pending Requests Alert Card */}
        <div
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "pending"
              ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-md"
              : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-amber-400/60"
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-semibold">
            <span>Aguardando Liberação</span>
            <div className={`p-2 rounded-lg ${pendingRequests.length > 0 ? "bg-amber-500/20 text-amber-400 animate-pulse" : "bg-gray-100 dark:bg-slate-800"}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${pendingRequests.length > 0 ? "text-amber-500" : "text-gray-900 dark:text-white"}`}>
              {pendingRequests.length}
            </span>
            {pendingRequests.length > 0 && (
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                Requer sua atenção
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            Novos pedidos aguardando aprovação
          </p>
        </div>

        {/* Viewers Card */}
        <div
          onClick={() => setStatusFilter("viewer")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "viewer"
              ? "bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-md"
              : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-blue-400/60"
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-semibold">
            <span>Visualizadores Liberados</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
              {approvedViewers.length}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            Acesso exclusivo para visualização
          </p>
        </div>

        {/* Administrators Card */}
        <div
          onClick={() => setStatusFilter("admin")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "admin"
              ? "bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30 shadow-md"
              : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-purple-400/60"
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-semibold">
            <span>Administradores</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
              {approvedAdmins.length}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            Privilégio pleno de gestão e edição
          </p>
        </div>

        {/* Total Users / History */}
        <div
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 shadow-md"
              : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-400"
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total de Registros</span>
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
              {totalUsers}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            {rejectedCount} solicitação(ões) bloqueada(s)
          </p>
        </div>
      </div>

      {/* Manual User Pre-Grant Modal / Inline Form */}
      {showAddForm && (
        <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-5 border border-blue-500/40 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                Liberar Acesso Antecipadamente para um Usuário
              </h2>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleManualAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  E-mail do Usuário <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="exemplo@ctasconsultoria.com.br"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome do colaborador ou cliente"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Instituição / Organização / Cargo
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    placeholder="Ex: CTAS Consultoria / Analista"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Nível de Acesso a Conceder <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole("Viewer")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      newRole === "Viewer"
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30"
                        : "bg-white dark:bg-slate-950 text-gray-600 dark:text-slate-400 border-gray-300 dark:border-slate-800 hover:border-blue-400"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizador</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole("Administrator")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      newRole === "Administrator"
                        ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30"
                        : "bg-white dark:bg-slate-950 text-gray-600 dark:text-slate-400 border-gray-300 dark:border-slate-800 hover:border-purple-400"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Administrador</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Observações Internas (Opcional)
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Ex: Acesso autorizado para a equipe de campanha"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={actionLoading !== null}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/40 cursor-pointer disabled:opacity-50"
              >
                Conceder Acesso Imediato
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail ou órgão..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filtro:
          </span>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "all"
                ? "bg-slate-800 text-white font-bold"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Todos ({totalUsers})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white font-bold"
                : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
            }`}
          >
            <span>Pendentes</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-700 text-white">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter("viewer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "viewer"
                ? "bg-blue-600 text-white font-bold"
                : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
            }`}
          >
            Visualizadores ({approvedViewers.length})
          </button>
          <button
            onClick={() => setStatusFilter("admin")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "admin"
                ? "bg-purple-600 text-white font-bold"
                : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
            }`}
          >
            Admins ({approvedAdmins.length})
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "rejected"
                ? "bg-rose-700 text-white font-bold"
                : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
            }`}
          >
            Bloqueados ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Main Request / User List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Solicitações de Acesso / Usuários ({filteredRequests.length})
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Atualizado em tempo real
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            <p className="text-xs">Carregando permissões do sistema...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <UserX className="w-8 h-8 mx-auto text-gray-400 opacity-60" />
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Nenhuma solicitação encontrada com os filtros atuais.
            </p>
            <p className="text-xs text-gray-500">
              Tente redefinir os filtros ou clique em "Liberar Usuário Antecipadamente".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800/80">
            {filteredRequests.map((req) => {
              const isSidney = req.email.toLowerCase() === "sidneynapsec@gmail.com";
              const isPending = req.status === "pending";
              const isApproved = req.status === "approved";
              const isRejected = req.status === "rejected";
              const currentEffectiveRole: UserRole =
                selectedProfiles[req.email] || req.grantedRole || "Viewer";
              const isRoleAdmin = (req.grantedRole === "Administrator" && isApproved) || isSidney;
              const isRoleViewer = req.grantedRole === "Viewer" && isApproved && !isSidney;

              return (
                <div
                  key={req.id || req.email}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-colors ${
                    isPending
                      ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                      : isSidney
                      ? "bg-gradient-to-r from-blue-950/20 to-indigo-950/20"
                      : "hover:bg-gray-50/80 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {/* Left: User Avatar & Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border shadow-sm ${
                        isSidney
                          ? "bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 border-amber-300 shadow-amber-500/20"
                          : isPending
                          ? "bg-amber-500/20 text-amber-500 border-amber-400/30"
                          : isRoleAdmin
                          ? "bg-purple-600 text-white border-purple-400/40"
                          : isRejected
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          : "bg-blue-600 text-white border-blue-400/40"
                      }`}
                    >
                      {isSidney ? (
                        <Crown className="w-5 h-5 text-slate-950" />
                      ) : (
                        (req.name || req.email).substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {req.name || req.email.split("@")[0]}
                        </span>

                        {isSidney && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                            <Crown className="w-3 h-3" />
                            Administrador Total (Proprietário)
                          </span>
                        )}

                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            Pendente
                          </span>
                        )}

                        {isApproved && !isSidney && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Ativo • {req.grantedRole === "Administrator" ? "Administrador" : "Visualizador"}
                          </span>
                        )}

                        {isRejected && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-400/40 flex items-center gap-1">
                            <UserX className="w-3 h-3" />
                            Recusado
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-gray-700 dark:text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {req.email}
                        </span>

                        {req.organization && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-gray-400" />
                            {req.organization}
                          </span>
                        )}

                        {req.requestedAt && (
                          <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Pedido em: {new Date(req.requestedAt).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>

                      {req.notes && (
                        <p className="text-xs text-gray-600 dark:text-slate-400 italic bg-gray-50 dark:bg-slate-950/60 p-2 rounded-lg border border-gray-200 dark:border-slate-800 flex items-start gap-1.5 mt-1">
                          <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <span>{req.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions for Administrator */}
                  <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center shrink-0">
                    {isSidney ? (
                      <span className="text-xs font-mono font-bold text-amber-500 dark:text-amber-400 px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        Conta Permanente e Protegida
                      </span>
                    ) : (
                      <>
                        {/* 1. Selecionar Perfil: [Visualizador | Administrador] */}
                        <div className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-slate-950 p-1 rounded-xl border border-gray-200 dark:border-slate-800">
                          <span className="text-[11px] text-gray-500 dark:text-slate-400 pl-1 font-semibold hidden sm:inline">
                            Perfil:
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProfiles((prev) => ({ ...prev, [req.email]: "Viewer" }))
                            }
                            className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                              currentEffectiveRole === "Viewer"
                                ? "bg-blue-600 text-white font-bold shadow-sm"
                                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                          >
                            Visualizador
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProfiles((prev) => ({ ...prev, [req.email]: "Administrator" }))
                            }
                            className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                              currentEffectiveRole === "Administrator"
                                ? "bg-purple-600 text-white font-bold shadow-sm"
                                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                          >
                            Administrador
                          </button>
                        </div>

                        {/* 2. Botão: [Aprovar] */}
                        <button
                          type="button"
                          onClick={() => {
                            handleManageAccess(req.email, "approve", { role: currentEffectiveRole });
                          }}
                          disabled={actionLoading !== null}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
                          title="Aprovar com o perfil selecionado (passa para Ativo)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprovar</span>
                        </button>

                        {/* 3. Botão: [Recusar] */}
                        <button
                          type="button"
                          onClick={() => handleManageAccess(req.email, "reject")}
                          disabled={actionLoading !== null || isRejected}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                            isRejected
                              ? "bg-rose-950/40 text-rose-400 border-rose-800 opacity-60 cursor-default"
                              : "bg-white dark:bg-slate-950 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          } disabled:opacity-50`}
                          title="Recusar ou Bloquear acesso"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Recusar</span>
                        </button>

                        {/* Excluir Registro */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Deseja realmente remover o registro de ${req.email}?`)) {
                              handleManageAccess(req.email, "delete");
                            }
                          }}
                          disabled={actionLoading !== null}
                          className="p-1.5 rounded-xl text-xs text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                          title="Excluir registro da lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

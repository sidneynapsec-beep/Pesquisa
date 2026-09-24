import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  LogIn,
  CheckCircle2,
  User,
  Building2,
  X,
  UserPlus
} from "lucide-react";

export default function AuthScreen() {
  const { login } = useAuth();

  // Email and Password Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Request Access Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqPassword, setReqPassword] = useState("");
  const [reqShowPassword, setReqShowPassword] = useState(false);
  const [reqOrganization, setReqOrganization] = useState("");
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Autenticação Tradicional (E-mail e Senha)
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setManualError("Por favor, informe seu e-mail.");
      return;
    }

    if (!cleanPassword) {
      setManualError("Por favor, informe sua senha.");
      return;
    }

    setIsManualLoading(true);
    try {
      const result = await login(cleanEmail, cleanPassword);
      if (!result.success) {
        setManualError(result.error || "E-mail ou senha incorretos.");
      }
    } catch {
      setManualError("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setIsManualLoading(false);
    }
  };

  // 3. Solicitação de Acesso para Novos Usuários Externos
  const handleRequestAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);

    const cleanName = reqName.trim();
    const cleanEmail = reqEmail.trim().toLowerCase();
    const cleanPassword = reqPassword.trim();
    const cleanOrg = reqOrganization.trim();

    if (!cleanName) {
      setRequestError("Por favor, informe seu Nome Completo.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setRequestError("Por favor, informe um endereço de e-mail válido.");
      return;
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      setRequestError("A senha desejada deve possuir no mínimo 4 caracteres.");
      return;
    }

    setIsRequestLoading(true);
    try {
      const res = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          organization: cleanOrg
        })
      });

      const data = await res.json();
      if (!res.ok || data.status === "error" || data.success === false) {
        throw new Error(data.message || data.error || "Falha ao registrar solicitação de cadastro.");
      }

      setRequestSuccess(true);
      // Preenche o formulário de login para conveniência
      setEmail(cleanEmail);
    } catch (err: any) {
      setRequestError(err?.message || "Erro de conexão ao enviar solicitação. Tente novamente.");
    } finally {
      setIsRequestLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowRequestModal(false);
    setRequestSuccess(false);
    setRequestError(null);
    if (!requestSuccess) {
      setReqPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-radial from-[#0c183a] via-slate-950 to-black text-slate-100 flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Background Ambience Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-900/30">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-wider font-mono text-white flex items-center gap-1.5">
              SEIE <span className="text-blue-400 text-xs font-normal">| Sergipe 2026</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-800/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Acesso Restrito
          </span>
        </div>
      </header>

      {/* Main Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        
        {/* Brand Hero */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-900/40 border border-blue-400/30 mb-3.5">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Acesso ao SEIE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-sm mx-auto">
            Sistema Especialista em Inteligência Eleitoral de Sergipe
          </p>
        </div>

        {/* Central Auth Container */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-5">
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label
                htmlFor="manual-email"
                className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="manual-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@exemplo.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="manual-password"
                className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="manual-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {manualError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{manualError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isManualLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl border border-blue-500/40 shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isManualLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>

            {/* Link: Solicitar Cadastro */}
            <div className="pt-2 text-center border-t border-slate-800/80 mt-2">
              <button
                type="button"
                onClick={() => {
                  setRequestError(null);
                  setRequestSuccess(false);
                  if (email && !reqEmail) {
                    setReqEmail(email);
                  }
                  setShowRequestModal(true);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer inline-flex items-center gap-1 font-medium"
              >
                Não possui acesso? Solicitar cadastro
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal de Solicitação de Acesso para Novos Usuários */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-6 sm:p-7 text-left my-8"
            >
              {/* Botão Fechar */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              {!requestSuccess ? (
                <>
                  {/* Cabeçalho do Modal */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white tracking-tight">
                        Solicitar Cadastro no SEIE
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Preencha seus dados para liberação de acesso externo.
                      </p>
                    </div>
                  </div>

                  {/* Formulário de Coleta */}
                  <form onSubmit={handleRequestAccessSubmit} className="space-y-4">
                    {/* Nome Completo */}
                    <div>
                      <label
                        htmlFor="req-name"
                        className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1"
                      >
                        Nome Completo <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                          id="req-name"
                          type="text"
                          required
                          value={reqName}
                          onChange={(e) => setReqName(e.target.value)}
                          placeholder="Seu nome completo"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* E-mail */}
                    <div>
                      <label
                        htmlFor="req-email"
                        className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1"
                      >
                        E-mail <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <input
                          id="req-email"
                          type="email"
                          required
                          value={reqEmail}
                          onChange={(e) => setReqEmail(e.target.value)}
                          placeholder="seu.email@exemplo.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Senha Desejada */}
                    <div>
                      <label
                        htmlFor="req-password"
                        className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1"
                      >
                        Senha desejada <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          id="req-password"
                          type={reqShowPassword ? "text" : "password"}
                          required
                          value={reqPassword}
                          onChange={(e) => setReqPassword(e.target.value)}
                          placeholder="Mínimo 4 caracteres"
                          className="w-full pl-9 pr-9 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setReqShowPassword(!reqShowPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                          tabIndex={-1}
                        >
                          {reqShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Organização/Órgão (Opcional) */}
                    <div>
                      <label
                        htmlFor="req-org"
                        className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1"
                      >
                        Organização / Órgão <span className="text-slate-500 normal-case font-normal">(opcional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <input
                          id="req-org"
                          type="text"
                          value={reqOrganization}
                          onChange={(e) => setReqOrganization(e.target.value)}
                          placeholder="Ex: ALESE, SECOM, Gabinete, Consultoria..."
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Aviso de Erro */}
                    {requestError && (
                      <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-600/40 text-rose-200 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{requestError}</span>
                      </div>
                    )}

                    {/* Ações do Modal */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        disabled={isRequestLoading}
                        className="px-4 py-2.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isRequestLoading}
                        className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isRequestLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <span>Enviar Solicitação</span>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* Tela de Confirmação de Sucesso */
                <div className="text-center py-3 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white">
                      Solicitação Registrada!
                    </h3>
                    <p className="text-xs text-emerald-300/90 font-medium leading-relaxed max-w-sm mx-auto bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
                      Solicitação enviada com sucesso! Aguarde a aprovação do Administrador Sidney para liberar o seu acesso.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-left text-xs space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nome:</span>
                      <span className="font-medium text-slate-200">{reqName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">E-mail:</span>
                      <span className="font-medium text-slate-200">{reqEmail}</span>
                    </div>
                    {reqOrganization && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Organização:</span>
                        <span className="font-medium text-slate-200">{reqOrganization}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-mono text-amber-400 text-[11px] font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        Aguardando Aprovação
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    Entendido / Voltar ao Login
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto text-center py-2 text-[11px] text-slate-500 font-mono">
        SEIE • Sistema de Inteligência Territorial & Eleitoral • Sergipe 2026
      </footer>
    </div>
  );
}

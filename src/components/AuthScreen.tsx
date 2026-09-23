import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  X,
  LogIn
} from "lucide-react";

export default function AuthScreen() {
  const { login, requestAccess, pendingInfo } = useAuth();

  // Unified Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Status & Feedback State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUserNotFoundShortcut, setShowUserNotFoundShortcut] = useState(false);
  const [isPendingNotice, setIsPendingNotice] = useState(false);

  // "Solicitar Acesso" Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqPassword, setReqPassword] = useState("");
  const [reqConfirmPassword, setReqConfirmPassword] = useState("");
  const [showReqPassword, setShowReqPassword] = useState(false);
  const [showReqConfirmPassword, setShowReqConfirmPassword] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // 1. Unified Login Action
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setShowUserNotFoundShortcut(false);
    setIsPendingNotice(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMessage("Por favor, digite seu e-mail.");
      return;
    }

    if (!cleanPassword) {
      setErrorMessage("Por favor, digite sua senha.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(cleanEmail, cleanPassword);

      if (!result.success) {
        if (result.notFound || result.code === "USER_NOT_FOUND") {
          setErrorMessage("Usuário não encontrado. Deseja solicitar acesso?");
          setShowUserNotFoundShortcut(true);
        } else if (result.isPending || result.code === "ACCESS_PENDING_APPROVAL") {
          setErrorMessage("Seu acesso ainda está em análise pelo administrador.");
          setIsPendingNotice(true);
        } else {
          setErrorMessage("E-mail ou senha incorretos.");
        }
      }
    } catch {
      setErrorMessage("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Request Modal with optional pre-filled email from login attempt
  const openRequestModal = () => {
    setReqName("");
    setReqEmail(email.trim().toLowerCase());
    setReqPassword("");
    setReqConfirmPassword("");
    setRequestError(null);
    setRequestSuccess(null);
    setIsRequestModalOpen(true);
  };

  // 2. Request Access Action
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);
    setRequestSuccess(null);

    const cleanName = reqName.trim();
    const cleanEmail = reqEmail.trim().toLowerCase();
    const pass = reqPassword.trim();
    const confirm = reqConfirmPassword.trim();

    if (!cleanName) {
      setRequestError("Informe seu Nome Completo.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setRequestError("Informe um e-mail válido.");
      return;
    }

    if (!pass || pass.length < 4) {
      setRequestError("A senha desejada deve ter no mínimo 4 caracteres.");
      return;
    }

    if (pass !== confirm) {
      setRequestError("As senhas digitadas não coincidem.");
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const res = await requestAccess({
        name: cleanName,
        email: cleanEmail,
        password: pass
      });

      if (res.status === "pending" || res.status === "approved" || res.success) {
        setRequestSuccess(res.message || "Cadastro realizado com sucesso! Aguarde a liberação do administrador.");
        // Clear fields
        setReqPassword("");
        setReqConfirmPassword("");
      } else {
        setRequestError(res.error || res.message || "Não foi possível registrar a solicitação.");
      }
    } catch {
      setRequestError("Erro ao comunicar com o servidor. Tente novamente.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-radial from-[#0d1838] via-slate-950 to-black text-slate-100 flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
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
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
            Acesso Restrito
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        
        {/* Brand Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-900/40 border border-blue-400/30 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Acesso ao Sistema SEIE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-sm mx-auto">
            Sistema Especialista em Inteligência Eleitoral de Sergipe
          </p>
        </div>

        {/* Unified Login Card */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Campo: E-mail */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Campo: Senha com Toggle */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                    isPendingNotice
                      ? "bg-amber-950/40 border-amber-600/40 text-amber-200"
                      : showUserNotFoundShortcut
                      ? "bg-blue-950/50 border-blue-600/50 text-blue-200"
                      : "bg-rose-950/40 border-rose-600/40 text-rose-200"
                  }`}
                >
                  {isPendingNotice ? (
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{errorMessage}</p>
                    {showUserNotFoundShortcut && (
                      <button
                        type="button"
                        onClick={openRequestModal}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2 cursor-pointer mt-1"
                      >
                        Clique aqui para solicitar acesso agora <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão de Ação: Entrar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-900/40 hover:shadow-blue-800/60 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/20"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Link secundário discreto abaixo: "Não tem acesso? Solicitar cadastro" */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={openRequestModal}
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer inline-flex items-center gap-1 group"
            >
              <span>Não tem acesso?</span>
              <span className="font-semibold text-slate-300 group-hover:text-blue-400 underline underline-offset-2">
                Solicitar cadastro
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto text-center py-2 text-[11px] text-slate-500 font-mono">
        SEIE • Sistema de Inteligência Eleitoral • Sergipe 2026
      </footer>

      {/* MODAL / FLUXO DE "SOLICITAR ACESSO" */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black text-slate-100 z-10 overflow-hidden"
            >
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="mb-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 inline-block mb-1.5">
                  Novo Cadastro
                </span>
                <h2 className="text-xl font-bold text-white">
                  Solicitar Acesso ao SEIE
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Preencha os dados abaixo. Sua solicitação será analisada pelo administrador.
                </p>
              </div>

              {/* Success Feedback View */}
              {requestSuccess ? (
                <div className="space-y-4 py-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Solicitação enviada com sucesso!
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                      Aguarde a liberação do administrador. Assim que liberado, seu acesso estará disponível com o e-mail e a senha cadastrados.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRequestModalOpen(false);
                      setRequestSuccess(null);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    Voltar para o Login
                  </button>
                </div>
              ) : (
                /* Modal Form: Nome Completo, E-mail, Senha desejada e Confirmação */
                <form onSubmit={handleRequestAccess} className="space-y-3.5">
                  
                  {/* Nome Completo */}
                  <div>
                    <label
                      htmlFor="req-name"
                      className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Nome Completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="req-name"
                        type="text"
                        required
                        value={reqName}
                        onChange={(e) => setReqName(e.target.value)}
                        placeholder="Seu nome e sobrenome"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* E-mail */}
                  <div>
                    <label
                      htmlFor="req-email"
                      className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1"
                    >
                      E-mail
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="req-email"
                        type="email"
                        required
                        value={reqEmail}
                        onChange={(e) => setReqEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Senha desejada */}
                  <div>
                    <label
                      htmlFor="req-password"
                      className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Senha desejada
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="req-password"
                        type={showReqPassword ? "text" : "password"}
                        required
                        value={reqPassword}
                        onChange={(e) => setReqPassword(e.target.value)}
                        placeholder="Mínimo 4 caracteres"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowReqPassword(!showReqPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showReqPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmação de senha */}
                  <div>
                    <label
                      htmlFor="req-confirm-password"
                      className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Confirmação de senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="req-confirm-password"
                        type={showReqConfirmPassword ? "text" : "password"}
                        required
                        value={reqConfirmPassword}
                        onChange={(e) => setReqConfirmPassword(e.target.value)}
                        placeholder="Repita a senha desejada"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowReqConfirmPassword(!showReqConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showReqConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error in modal */}
                  {requestError && (
                    <div className="p-3 bg-rose-950/40 border border-rose-600/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{requestError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingRequest}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingRequest ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Enviando Solicitação...</span>
                        </>
                      ) : (
                        <span>Enviar Solicitação</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function AuthScreen() {
  const { loginWithGoogle, login } = useAuth();

  // Google Login State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Traditional Password Form State (Secundário/Opcional)
  const [showTraditionalLogin, setShowTraditionalLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // 1. Acesso Direto via Google / Gmail (Canal Principal)
  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success && result.error) {
        setGoogleError(result.error);
      }
    } catch (err: any) {
      setGoogleError(err?.message || "Falha ao iniciar autenticação com o Google. Tente novamente.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 2. Acesso Tradicional Opcional (E-mail e Senha)
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
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Acesso Direto Gmail
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
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          
          {/* Box de Instrução Direta */}
          <div className="p-3.5 bg-blue-950/40 border border-blue-600/30 rounded-xl text-xs text-blue-200 flex items-start gap-2.5 leading-relaxed">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Acesso simplificado:</span> Entre diretamente com a sua Conta Google (Gmail). Sem necessidade de cadastro prévio ou espera de aprovação.
            </div>
          </div>

          {/* Botão Principal: Entrar com Google (Gmail) */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-3.5 px-5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 font-semibold text-sm rounded-xl shadow-lg shadow-black/30 flex items-center justify-center gap-3 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-slate-200 group"
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-slate-700">Conectando à Conta Google...</span>
                </>
              ) : (
                <>
                  {/* Google SVG Official Multi-color Icon */}
                  <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="tracking-tight">Entrar com Google / Gmail</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback de Erro do Google */}
          <AnimatePresence>
            {googleError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-xl border border-rose-600/40 bg-rose-950/40 text-rose-200 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{googleError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divisor Discreto */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative px-3 bg-slate-900 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
              Opção Alternativa
            </div>
          </div>

          {/* Accordion / Toggle para Login com Senha */}
          <div>
            <button
              type="button"
              onClick={() => setShowTraditionalLogin(!showTraditionalLogin)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
            >
              <span>Entrar com e-mail e senha</span>
              {showTraditionalLogin ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <AnimatePresence>
              {showTraditionalLogin && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleManualLogin}
                  className="space-y-3.5 pt-3 overflow-hidden"
                >
                  <div>
                    <label
                      htmlFor="manual-email"
                      className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >
                      E-mail
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="manual-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu-email@exemplo.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="manual-password"
                      className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >
                      Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="manual-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                        className="w-full pl-9 pr-9 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {manualError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-600/40 text-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{manualError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isManualLoading}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isManualLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Entrar com Senha</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto text-center py-2 text-[11px] text-slate-500 font-mono">
        SEIE • Sistema de Inteligência Territorial & Eleitoral • Sergipe 2026
      </footer>
    </div>
  );
}

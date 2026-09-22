import React from "react";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[SEIE ErrorBoundary] Erro capturado:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleClearCacheAndReload = () => {
    try {
      localStorage.removeItem("seie_global_polls");
      localStorage.removeItem("seie_uploaded_datasets");
      localStorage.removeItem("seie_cached_projections");
      localStorage.removeItem("seie_cached_territories");
      localStorage.removeItem("seie_selected_research_id");
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || "Ocorreu um erro inesperado na inicialização.";
      const errorStack = this.state.error?.stack || "";
      const componentStack = this.state.errorInfo?.componentStack || "";

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold font-serif text-white">
                  {this.props.fallbackTitle || "Falha na Inicialização do SEIE"}
                </h1>
                <p className="text-sm text-slate-400">
                  Um erro impediu a renderização da interface. As informações detalhadas foram capturadas para diagnóstico:
                </p>
              </div>
            </div>

            {/* Error Message Display */}
            <div className="bg-slate-950/80 border border-red-900/40 rounded-xl p-4 font-mono text-xs text-red-300 overflow-x-auto">
              <p className="font-semibold text-red-400 mb-1">Mensagem de Erro:</p>
              <pre className="whitespace-pre-wrap break-words">{errorMessage}</pre>
            </div>

            {/* Diagnostic Details */}
            {(errorStack || componentStack) && (
              <details className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                <summary className="cursor-pointer font-medium text-slate-300 select-none hover:text-white">
                  Ver detalhes técnicos (Stack Trace)
                </summary>
                <div className="mt-3 space-y-2 overflow-x-auto max-h-60 overflow-y-auto">
                  {errorStack && (
                    <div>
                      <p className="text-[11px] font-mono text-slate-500 font-bold">Error Stack:</p>
                      <pre className="font-mono text-[11px] text-slate-400 whitespace-pre-wrap">{errorStack}</pre>
                    </div>
                  )}
                  {componentStack && (
                    <div className="mt-2">
                      <p className="text-[11px] font-mono text-slate-500 font-bold">Component Stack:</p>
                      <pre className="font-mono text-[11px] text-slate-500 whitespace-pre-wrap">{componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Recovery Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Sistema
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                Tentar Novamente
              </button>

              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 rounded-xl text-xs font-semibold border border-red-800/40 transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Cache Local e Reiniciar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DashboardOverview from "./components/DashboardOverview";
import CandidatosList from "./components/CandidatosList";
import DiagnosticoPesquisas from "./components/DiagnosticoPesquisas";
import MapaEleitoral from "./components/MapaEleitoral";
import AnaliseTerritorial from "./components/AnaliseTerritorial";
import RelatorioEstrategico from "./components/RelatorioEstrategico";
import GpsVotosBairros from "./components/GpsVotosBairros";
import SimuladorGuerra from "./components/SimuladorGuerra";
import TrackingTendencias from "./components/TrackingTendencias";
import CardsExecutivos from "./components/CardsExecutivos";
import CalibracaoAmostral from "./components/CalibracaoAmostral";
import ChatAI from "./components/ChatAI";
import RadarDigital from "./components/RadarDigital";
import CaminhoDaVitoria from "./components/CaminhoDaVitoria";
import OutrosModulos from "./components/OutrosModulos";
import SidneyAgent from "./components/SidneyAgent";
import SidneyAvatar from "./components/SidneyAvatar";
import AuthScreen from "./components/AuthScreen";
import GestaoAcessos from "./components/GestaoAcessos";
import { authenticatedFetch } from "./lib/apiAuth";
import { useAuth } from "./context/AuthContext";
import { Poll, Territory, ActiveTab } from "./types";
import { isValidPoll } from "./utils/pollValidation";
import { AlertCircle, RefreshCw, Bot } from "lucide-react";

export default function App() {
  const { status, user: currentUser, role: currentRole, setRole: setCurrentRole, signOut: authSignOut, handleUnauthorized } = useAuth();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("visao-geral");
  const [visitedTabs, setVisitedTabs] = useState<Set<ActiveTab>>(() => new Set(["visao-geral"]));
  const [isTabPending, startTransition] = useTransition();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidneyOpen, setSidneyOpen] = useState(false);

  // Fast Non-blocking Tab Switcher with DOM Keep-Alive Cache
  const handleTabChange = useCallback((newTab: ActiveTab) => {
    setVisitedTabs((prev) => {
      if (prev.has(newTab)) return prev;
      const next = new Set(prev);
      next.add(newTab);
      return next;
    });

    startTransition(() => {
      setActiveTab(newTab);
    });
    setSidebarOpen(false);
  }, []);

  // Dark Mode / Modo Noturno State
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("seie-theme");
      if (saved === "dark" || saved === "light") return saved;
    }
    return "light";
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("seie-theme", theme);
  }, [theme]);

  const userEmail = currentUser?.email || "anonimo@seie.com.br";

  // Fetch initial dataset from Express Backend (Polls & territories)
  const fetchBases = useCallback(async () => {
    if (status !== "AUTHENTICATED") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [resPolls, resTerritories] = await Promise.all([
        authenticatedFetch("/api/polls"),
        authenticatedFetch("/api/territories")
      ]);

      if (resPolls.status === 401 || resTerritories.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!resPolls.ok) {
        throw new Error(`HTTP ${resPolls.status}: Resposta não esperada do servidor.`);
      }

      if (!resTerritories.ok) {
        throw new Error(`HTTP ${resTerritories.status}: Resposta não esperada do servidor.`);
      }

      const dataPolls = await resPolls.json();
      const dataTerritories = await resTerritories.json();
      const rawPolls = Array.isArray(dataPolls) ? dataPolls : (dataPolls.data || []);
      setPolls(rawPolls.filter(isValidPoll));
      setTerritories(Array.isArray(dataTerritories) ? dataTerritories : (dataTerritories.data || []));
      setError(null);
    } catch (err: any) {
      console.error("Error loading data from Express API:", err);
      if (err?.message?.includes("401") || err?.message?.includes("não autenticada")) {
        handleUnauthorized();
        return;
      }
      setError("Não foi possível carregar os dados eleitorais. Verifique a conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [status, handleUnauthorized]);

  useEffect(() => {
    if (status === "AUTHENTICATED") {
      fetchBases();
    } else {
      setIsLoading(false);
    }
  }, [status, fetchBases]);

  // Helper to obtain authorization headers
  const getAuthHeaders = useCallback(async () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (currentUser) {
      try {
        if ("getIdToken" in currentUser && typeof currentUser.getIdToken === "function") {
          const token = await currentUser.getIdToken();
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
        }
      } catch (e) {
        console.warn("Erro ao obter token do Firebase:", e);
      }
    }
    if (typeof window !== "undefined") {
      const adminToken = localStorage.getItem("seie_admin_token");
      if (adminToken && !headers["Authorization"]) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }
      const adminSecret = localStorage.getItem("seie_admin_secret");
      if (adminSecret && !headers["x-admin-secret"]) {
        headers["x-admin-secret"] = adminSecret;
      }
    }
    return headers;
  }, [currentUser]);

  // CRUD Poll Actions calling Express API
  const handleAddPoll = useCallback(async (pollData: Omit<Poll, "id">) => {
    if (currentRole === "Viewer") {
      throw new Error("Acesso negado: Perfil 'Viewer' não possui permissão para cadastrar pesquisas.");
    }
    const headers = await getAuthHeaders();
    const response = await fetch("/api/polls", {
      method: "POST",
      headers,
      body: JSON.stringify(pollData)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Erro de permissão ou de validação.");
    }
    await fetchBases();
  }, [currentRole, getAuthHeaders, fetchBases]);

  const handleUpdatePoll = useCallback(async (id: string, pollData: Partial<Poll>) => {
    if (currentRole === "Viewer") {
      throw new Error("Acesso negado: Perfil 'Viewer' não possui permissão para editar pesquisas.");
    }
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/polls/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(pollData)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Erro ao atualizar.");
    }
    await fetchBases();
  }, [currentRole, getAuthHeaders, fetchBases]);

  const handleDeletePoll = useCallback(async (id: string) => {
    if (currentRole === "Viewer") {
      throw new Error("Acesso negado: Perfil 'Viewer' não possui permissão para excluir pesquisas.");
    }
    const headers = await getAuthHeaders();
    setPolls((prev) => prev.filter((p) => p.id !== id));
    try {
      const response = await fetch(`/api/polls/${id}`, {
        method: "DELETE",
        headers
      });
      const result = await response.json();
      if (!response.ok) {
        await fetchBases();
        throw new Error(result.message || "Erro ao excluir pesquisa.");
      }
      await fetchBases();
    } catch (err) {
      await fetchBases();
      throw err;
    }
  }, [currentRole, getAuthHeaders, fetchBases]);

  // Render workspace content for a given tab
  const renderTabContent = (tab: ActiveTab) => {
    switch (tab) {
      case "visao-geral":
        return <DashboardOverview polls={polls} onNavigate={handleTabChange} />;
      case "candidatos":
        return <CandidatosList />;
      case "diagnostico":
        return (
          <DiagnosticoPesquisas
            polls={polls}
            currentRole={currentRole}
            onAddPoll={handleAddPoll}
            onUpdatePoll={handleUpdatePoll}
            onDeletePoll={handleDeletePoll}
          />
        );
      case "mapa-eleitoral":
        return <MapaEleitoral territories={territories} />;
      case "analise-territorial":
        return <AnaliseTerritorial territories={territories} />;
      case "relatorio-estrategico":
        return <RelatorioEstrategico />;
      case "gps-votos":
        return <GpsVotosBairros polls={polls} />;
      case "simulador-guerra":
        return <SimuladorGuerra polls={polls} />;
      case "tracking-tendencias":
        return <TrackingTendencias polls={polls} />;
      case "cards-executivos":
        return <CardsExecutivos polls={polls} />;
      case "calibracao-amostral":
        return <CalibracaoAmostral polls={polls} />;
      case "chat-ai":
        return <ChatAI currentRole={currentRole} />;
      case "radar":
        return <RadarDigital currentRole={currentRole} userEmail={userEmail} />;
      case "caminho-vitoria":
        return <CaminhoDaVitoria polls={polls} />;
      case "gestao-acessos":
        return <GestaoAcessos />;
      default:
        // Handle all other modules inside OutrosModulos
        return (
          <OutrosModulos
            activeTab={tab}
            currentRole={currentRole}
            userEmail={userEmail}
            polls={polls}
          />
        );
    }
  };

  if (status === "INITIALIZING") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-center px-4">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-base font-semibold text-slate-100">
          Carregando SEIE...
        </p>
        <p className="text-xs font-mono text-slate-400">
          Iniciando sistema de autenticação e contextos eleitorais...
        </p>
      </div>
    );
  }

  if (status === "UNAUTHENTICATED" || status === "PENDING_APPROVAL" || status === "REJECTED" || !currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-slate-950 flex text-slate-800 dark:text-slate-100 antialiased font-sans transition-colors duration-200">
      
      {/* Navigation Sidebar Drawer */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />

      {/* Overlay Backdrop for Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-20 lg:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        
        {/* Header Bar */}
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          userEmail={userEmail}
          onLogout={authSignOut}
          theme={theme}
          onToggleTheme={toggleTheme}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        {/* Dynamic Workspace Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Read-Only Notice Banner for Viewer role */}
          {currentRole === "Viewer" && !isLoading && (
            <div className="mb-4 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  <strong>Modo Somente Leitura (Viewer):</strong> Visualização e auditoria liberadas. Mutação de pesquisas e datasets exigem credencial de <strong>Administrator</strong>.
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-200/60 dark:bg-amber-800/60 rounded text-amber-900 dark:text-amber-100">
                Auditoria Ativa
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
              <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Carregando SEIE...
              </p>
              <p className="text-xs font-mono text-slate-500">
                Iniciando e sincronizando dados geopolíticos de Sergipe...
              </p>
            </div>
          ) : error ? (
            <div className="bg-slate-900/60 border border-slate-700/60 p-6 rounded-2xl max-w-lg mx-auto mt-20 flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500" />
              <div>
                <h3 className="font-serif font-bold text-slate-100 text-base">Conexão Pendente</h3>
                <p className="text-xs text-slate-400 mt-2">{error}</p>
              </div>
              <button
                onClick={fetchBases}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <div className="w-full relative">
              {Array.from(visitedTabs).map((tabKey: ActiveTab) => {
                const isCurrent = activeTab === tabKey;
                return (
                  <div
                    key={tabKey}
                    id={`tab-panel-${tabKey}`}
                    role="tabpanel"
                    className={isCurrent ? "block w-full" : "hidden"}
                    style={{ display: isCurrent ? "block" : "none" }}
                  >
                    {renderTabContent(tabKey)}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Footer Bar matching the Professional Polish specification */}
        <footer className="h-8 bg-[#374151] flex items-center justify-between px-6 shrink-0 text-[10px] text-gray-400">
          <div className="flex items-center gap-4">
            <span>v2.4.0-PRO</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Cloud Engine Connected
            </span>
            <span>TSE DB Sync: 04m ago</span>
          </div>
          <div>
            © 2026 SEIE - Inteligência Territorial & Eleitoral • Sergipe
          </div>
        </footer>
      </div>

      {/* Floating Sidney AI button */}
      <button
        onClick={() => setSidneyOpen(!sidneyOpen)}
        className="fixed bottom-12 right-6 bg-[#1E40AF] hover:bg-blue-800 text-white p-3 rounded-full shadow-2xl flex items-center justify-center gap-2 group z-40 transition-all duration-300 border border-blue-400 hover:scale-105 h-12 w-12 hover:w-36"
        title="Consultar Sidney"
        id="sidney-floating-button"
      >
        <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-25"></span>
        <SidneyAvatar size={24} className="w-6 h-6 shrink-0 border-none shadow-none" />
        <span className="hidden group-hover:inline text-[10px] font-bold font-mono tracking-wider whitespace-nowrap">
          SIDNEY (IA)
        </span>
      </button>

      {/* Slide-out Lateral Sidney Drawer */}
      <SidneyAgent
        currentRole={currentRole}
        isOpen={sidneyOpen}
        onClose={() => setSidneyOpen(false)}
      />
    </div>
  );
}

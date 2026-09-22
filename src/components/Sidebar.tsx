import React from "react";
import { ActiveTab, UserRole } from "../types";
import {
  LayoutDashboard,
  Users,
  Activity,
  Map,
  BarChart3,
  Building,
  Radio,
  TrendingUp,
  LineChart,
  BookOpen,
  Sparkles,
  Settings,
  FlameKindling,
  Award,
  Landmark,
  Layers,
  FileText,
  Crosshair,
  Sliders,
  Share2,
  Scale,
  ShieldCheck,
  Zap,
  Eye
} from "lucide-react";

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isOpen: boolean;
  onToggle: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onToggle: _onToggle,
  currentRole,
  onRoleChange: _onRoleChange,
}) => {
  const isAdmin = currentRole === "Administrator";

  const menuItems = [
    { id: "visao-geral" as ActiveTab, label: "Visão Geral", icon: LayoutDashboard, category: "Geral" },
    { id: "candidatos" as ActiveTab, label: "Meus Candidatos", icon: Users, category: "Geral" },
    
    { id: "governador" as ActiveTab, label: "Governador", icon: Layers, category: "Cargos Legislativos & Majoritários" },
    { id: "senadores" as ActiveTab, label: "Senadores", icon: Award, category: "Cargos Legislativos & Majoritários" },
    { id: "deputados-federais" as ActiveTab, label: "Deputados Federais", icon: Landmark, category: "Cargos Legislativos & Majoritários" },
    { id: "deputados-estaduais" as ActiveTab, label: "Deputados Estaduais", icon: Building, category: "Cargos Legislativos & Majoritários" },

    { id: "diagnostico" as ActiveTab, label: "Diagnóstico (Pesquisas)", icon: Activity, category: "Análise de Votos" },
    { id: "relatorio-estrategico" as ActiveTab, label: "Relatório Oficial CTAS", icon: FileText, category: "Análise de Votos" },
    { id: "gps-votos" as ActiveTab, label: "GPS de Votos (Bairros)", icon: Crosshair, category: "Análise de Votos" },
    { id: "simulador-guerra" as ActiveTab, label: "Simular Desistência (E se?)", icon: Sliders, category: "Análise de Votos" },
    { id: "tracking-tendencias" as ActiveTab, label: "Tracking & Tendências", icon: TrendingUp, category: "Análise de Votos" },
    { id: "cards-executivos" as ActiveTab, label: "Cards & One-Pager", icon: Share2, category: "Análise de Votos" },
    { id: "calibracao-amostral" as ActiveTab, label: "Calibração Amostral (TSE)", icon: Scale, category: "Análise de Votos" },
    { id: "mapa-eleitoral" as ActiveTab, label: "Mapa Eleitoral (75 Mun.)", icon: Map, category: "Análise de Votos" },
    { id: "analise-territorial" as ActiveTab, label: "Análise Territorial", icon: BarChart3, category: "Análise de Votos" },
    
    { id: "radar" as ActiveTab, label: "Radar Digital", icon: Radio, category: "Inteligência Estratégica" },
    { id: "caminho-vitoria" as ActiveTab, label: "Caminho da Vitória", icon: Zap, category: "Inteligência Estratégica" },
    { id: "projecao" as ActiveTab, label: "Projeção", icon: LineChart, category: "Inteligência Estratégica" },
    { id: "narrativas" as ActiveTab, label: "Narrativas", icon: BookOpen, category: "Inteligência Estratégica" },
    
    { id: "chat-ai" as ActiveTab, label: "Especialista SEIE (IA)", icon: Sparkles, category: "Inteligência Artificial", highlight: true },
    ...(isAdmin
      ? [{ id: "gestao-acessos" as ActiveTab, label: "Liberação de Acessos", icon: ShieldCheck, category: "Administração", highlight: true }]
      : []),
    { id: "configuracoes" as ActiveTab, label: "Configurações", icon: Settings, category: "Suporte" }
  ];

  // Group by category
  const categories = [
    "Geral",
    "Cargos Legislativos & Majoritários",
    "Análise de Votos",
    "Inteligência Estratégica",
    "Inteligência Artificial",
    ...(isAdmin ? ["Administração"] : []),
    "Suporte"
  ];

  return (
    <aside
      className={`${
        isOpen ? "translate-x-0 w-72" : "-translate-x-full w-0 lg:translate-x-0 lg:w-72"
      } fixed lg:relative z-30 h-full bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 flex flex-col border-r border-gray-200 dark:border-slate-800 transition-all duration-300 flex-shrink-0 overflow-hidden`}
    >
      {/* Brand area inside sidebar */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-2">
          <FlameKindling className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400">
            ELEIÇÃO 2026
          </span>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
          SERGIPE
        </div>
      </div>

      {/* Access Profile badge card */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 dark:text-slate-500 uppercase block">
            Perfil Autorizado
          </span>
          <span className="text-[9px] font-mono text-gray-400 dark:text-slate-500">
            Acesso Controlado
          </span>
        </div>
        
        {isAdmin ? (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200">
            <div className="p-1.5 rounded-lg bg-purple-600 text-white shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate leading-tight">
                Administrador
              </span>
              <span className="text-[10px] text-purple-700/80 dark:text-purple-300/80 block leading-tight">
                Acesso e Gestão Total
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 shadow-sm">
              <Eye className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate leading-tight">
                Visualizador
              </span>
              <span className="text-[10px] text-blue-700/80 dark:text-blue-300/80 block leading-tight">
                Visualização Liberada
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation menu grouped by category */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {categories.map((category) => {
          const items = menuItems.filter((item) => item.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 dark:text-slate-500 uppercase px-3 block">
                {category}
              </span>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isHighlight = (item as any).highlight;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#1E40AF] text-white shadow-md shadow-blue-900/20 font-bold"
                          : isHighlight
                          ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : isHighlight ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isHighlight && !isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default React.memo(Sidebar);

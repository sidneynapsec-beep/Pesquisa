import React from "react";
import { UserRole } from "../types";
import { LogOut, Sun, Moon, Menu, ShieldCheck, Eye, Crown } from "lucide-react";

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  userEmail: string;
  onLogout?: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentRole = "Viewer",
  userEmail,
  onLogout,
  theme,
  onToggleTheme,
  sidebarOpen: _sidebarOpen,
  onToggleSidebar,
}) => {
  const isSidney = userEmail.toLowerCase() === "sidneynapsec@gmail.com";
  const isAdmin = currentRole === "Administrator" || isSidney;

  return (
    <header className="bg-[#1E40AF] dark:bg-slate-900 sticky top-0 z-40 px-4 sm:px-6 py-3 flex flex-row justify-between items-center shadow-md shrink-0 transition-colors duration-200">
      
      {/* Left side: hamburger, logo, info */}
      <div className="flex items-center gap-3">
        {/* Hamburger button for mobile/tablet */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-white hover:bg-blue-800 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand logo */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white dark:bg-slate-800 rounded flex items-center justify-center font-bold text-[#1E40AF] dark:text-blue-400 border-2 border-blue-200 dark:border-slate-700 shadow-sm shrink-0">
          SEIE
        </div>

        <div className="flex flex-col">
          <span className="text-white font-bold leading-tight tracking-tight text-xs sm:text-sm uppercase block lg:hidden">
            SEIE
          </span>
          <span className="text-white font-bold leading-tight tracking-tight text-xs sm:text-xs uppercase hidden lg:block">
            SISTEMA ESPECIALISTA EM INTELIGÊNCIA ELEITORAL
          </span>
          <span className="text-blue-200 dark:text-slate-400 text-[9px] uppercase tracking-wider font-mono font-medium hidden sm:block">
            ctas consultoria • Sergipe
          </span>
          <span className="text-blue-200 dark:text-slate-400 text-[8px] uppercase tracking-wider font-mono font-medium block sm:hidden">
            Sergipe
          </span>
        </div>
      </div>

      {/* Right side: role badge, user initials, theme, logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Role badge */}
        {isSidney ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 text-[11px] font-mono font-bold shadow-sm">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Sidney • Administrador</span>
          </div>
        ) : isAdmin ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40 text-[11px] font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
            <span>Administrador</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-400/20 text-blue-200 border border-blue-300/40 text-[11px] font-mono font-medium">
            <Eye className="w-3.5 h-3.5 text-blue-300" />
            <span>Visualizador</span>
          </div>
        )}

        {/* User initials bubble (desktop only) */}
        <div className="hidden sm:flex w-8 h-8 rounded-full bg-blue-200 dark:bg-slate-700 border border-white dark:border-slate-600 items-center justify-center text-xs font-bold text-blue-800 dark:text-blue-200 uppercase shrink-0" title={userEmail}>
          {userEmail.substring(0, 2).toUpperCase()}
        </div>

        {/* Theme toggle (visible everywhere, compact) */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-blue-900/40 dark:bg-slate-800 hover:bg-blue-800 dark:hover:bg-slate-700 text-blue-200 dark:text-slate-300 border border-blue-400/30 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center h-9 w-9"
          title={theme === "light" ? "Ativar Modo Noturno" : "Ativar Modo Claro"}
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-blue-900/40 dark:bg-slate-800 hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white text-blue-200 dark:text-slate-300 border border-blue-400/30 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center h-9 w-9"
            title="Sair do Sistema (Logout)"
            id="logout-button"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

export default React.memo(Header);


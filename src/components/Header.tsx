import React from 'react';
import { ArrowLeft, ArrowRight, Home, Database, Trophy } from 'lucide-react';
import { NavigationView } from '../types/pcbasket';

interface HeaderProps {
  currentView: NavigationView;
  onNavigate: (view: NavigationView) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  teamCount: number;
  playerCount: number;
}

const VIEW_TITLES: Record<NavigationView, string> = {
  MainMenuView: 'Menú Principal',
  TeamsView: 'Gestión de Equipos',
  PlayersView: 'Buscador de Jugadores',
  ManagerView: 'Herramientas MANAGER.EXE',
  SettingsView: 'Ajustes y Configuración',
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  teamCount,
  playerCount,
}) => {
  return (
    <header className="bg-[#1e3462] border-b-4 border-[#ffce42] text-white shadow-xl sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onGoBack}
              disabled={!canGoBack}
              title="Atrás"
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                canGoBack
                  ? 'text-white hover:bg-white/10 hover:text-[#ffce42]'
                  : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onGoForward}
              disabled={!canGoForward}
              title="Siguiente"
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                canGoForward
                  ? 'text-white hover:bg-white/10 hover:text-[#ffce42]'
                  : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('MainMenuView')}
              title="Inicio"
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                currentView === 'MainMenuView'
                  ? 'bg-white/20 text-[#ffce42]'
                  : 'text-white hover:bg-white/10 hover:text-[#ffce42]'
              }`}
            >
              <Home className="w-5 h-5" />
            </button>
          </div>

          {/* App Branding & Current Title */}
          <div className="flex items-center space-x-3 text-center">
            <div className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center border border-[#ffce42]/60 overflow-hidden shadow">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" onError={(e) => {
                // Fallback to trophy if image not rendered
                e.currentTarget.style.display = 'none';
              }} />
              <Trophy className="w-5 h-5 text-[#ffce42] hidden" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-wide text-white drop-shadow-sm flex items-center gap-2">
                <span>Editor PC Basket</span>
                <span className="text-xs bg-[#ffce42] text-black font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Mou
                </span>
              </div>
              <div className="text-xs text-[#ffce42]/90 font-medium tracking-wide">
                {VIEW_TITLES[currentView]}
              </div>
            </div>
          </div>

          {/* Database Counter Badge */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="bg-[#122244] border border-white/10 rounded-lg px-3 py-1.5 flex items-center space-x-3 text-xs text-slate-200 shadow-inner">
              <div className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-[#ffce42]" />
                <span className="font-semibold text-white">{teamCount}</span>
                <span className="text-slate-400">equipos</span>
              </div>
              <span className="text-slate-600">|</span>
              <div>
                <span className="font-semibold text-white">{playerCount}</span>
                <span className="text-slate-400 ml-1">jugadores</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

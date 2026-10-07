import React from 'react';
import { Settings, Shield, Users, Terminal, Database, Sparkles, FolderSync, Info, BarChart3 } from 'lucide-react';
import { NavigationView, Equipo } from '../types/pcbasket';
import { calculateTeamMedias } from '../utils/ratingsUtils';

interface MainMenuViewProps {
  onNavigate: (view: NavigationView) => void;
  teams: Equipo[];
  onOpenImportModal: () => void;
}

export const MainMenuView: React.FC<MainMenuViewProps> = ({
  onNavigate,
  teams,
  onOpenImportModal,
}) => {
  const totalPlayers = teams.reduce((acc, t) => acc + (t.plantilla?.length || 0), 0);
  const avgTeamRating =
    teams.length > 0
      ? Math.round(
          (teams.reduce((acc, t) => acc + calculateTeamMedias(t.plantilla).mediaQuinteto, 0) /
            teams.length) *
            10
        ) / 10
      : 0;

  const menuItems = [
    {
      id: 'SettingsView' as NavigationView,
      title: 'Ajustes',
      subtitle: 'Configuración y BBDD',
      desc: 'Rutas de instalación, verificación de archivos del juego y estado de la base de datos.',
      icon: Settings,
      accentColor: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400 group-hover:border-amber-400',
      badge: 'Config',
    },
    {
      id: 'TeamsView' as NavigationView,
      title: 'Equipos',
      subtitle: `${teams.length} Equipos registrados`,
      desc: 'Plantillas, datos del club, aforos, presupuestos y exportación de archivos .DBC.',
      icon: Shield,
      accentColor: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400 group-hover:border-blue-400',
      badge: `${teams.length} Equipos`,
    },
    {
      id: 'PlayersView' as NavigationView,
      title: 'Jugadores',
      subtitle: `${totalPlayers} Jugadores totales`,
      desc: 'Editor completo de medias, atributos físicos, tácticas, demarcaciones y generador de ratings.',
      icon: Users,
      accentColor: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400',
      badge: `${totalPlayers} Jugadores`,
    },
    {
      id: 'StatsDashboardView' as NavigationView,
      title: 'Estadísticas & Balance',
      subtitle: 'Distribución y Métricas',
      desc: 'Histogramas de atributos, rankings comparativos por equipo y detección de anomalías.',
      icon: BarChart3,
      accentColor: 'from-yellow-500/20 to-amber-600/10 border-amber-400/40 text-[#ffce42] group-hover:border-[#ffce42]',
      badge: 'Analítica',
    },
    {
      id: 'ManagerView' as NavigationView,
      title: 'MANAGER.EXE',
      subtitle: 'Parches y Competiciones',
      desc: 'Cambio de temporada inicial, eliminación del Efecto 2000 y edición de Euroliga/Eurocup.',
      icon: Terminal,
      accentColor: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400 group-hover:border-purple-400',
      badge: 'Parches',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Brand Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#182848] via-[#1e3462] to-[#294277] border-2 border-[#ffce42]/40 shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#ffce42]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-black/40 rounded-2xl border-2 border-[#ffce42] p-2 flex items-center justify-center shadow-xl shrink-0">
              <img
                src="/logo.png"
                alt="PC Basket Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs uppercase tracking-widest text-[#ffce42] font-bold">
                  Dinamic Multimedia Companion
                </span>
                <span className="bg-[#ffce42]/20 border border-[#ffce42]/40 text-[#ffce42] text-[10px] px-2 py-0.5 rounded-full font-mono">
                  v6.0 / v6.5
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Editor PC Basket
              </h1>
              <p className="text-sm text-slate-300 font-light max-w-xl">
                Editor oficial de bases de datos, equipos, jugadores y ejecutables para PC Basket
                creado por <span className="text-[#ffce42] font-semibold">Mou</span>.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl p-3 shrink-0">
            <div className="text-center px-3 py-1">
              <div className="text-2xl font-black text-[#ffce42]">{teams.length}</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Equipos</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center px-3 py-1">
              <div className="text-2xl font-black text-emerald-400">{totalPlayers}</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Jugadores</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center px-3 py-1">
              <div className="text-2xl font-black text-blue-400">{avgTeamRating}</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Media Media</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Main Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group relative text-left p-6 rounded-2xl bg-slate-900/80 border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between h-72 ${item.accentColor}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#ffce42] transition-colors">
                  {item.title}
                </h3>
                <h4 className="text-xs font-medium text-slate-400 mb-3">
                  {item.subtitle}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-[#ffce42]">
                <span>Acceder a la sección</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Operations Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-slate-300 text-sm">
          <Sparkles className="w-5 h-5 text-[#ffce42]" />
          <span>
            ¿Quieres importar una plantilla real de la ACB o Euroliga desde la web?
          </span>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onOpenImportModal}
            className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-[#ffce42] to-amber-500 text-black font-bold rounded-lg text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FolderSync className="w-4 h-4" />
            Importar desde Proballers
          </button>
          <button
            onClick={() => onNavigate('TeamsView')}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors"
          >
            Ver lista de equipos
          </button>
        </div>
      </div>
    </div>
  );
};

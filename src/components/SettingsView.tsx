import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  CheckCircle2,
  FolderOpen,
  FileCheck,
  AlertCircle,
  RotateCcw,
  Trash2,
  Save,
  Check,
  Archive,
} from 'lucide-react';
import { Settings, Equipo } from '../types/pcbasket';

interface SettingsViewProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  teams: Equipo[];
  onResetDatabase: () => void;
  onClearDatabase: () => void;
  onNavigateHome: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: initialSettings,
  onSaveSettings,
  teams,
  onResetDatabase,
  onClearDatabase,
  onNavigateHome,
}) => {
  const [settings, setSettings] = useState<Settings>({ ...initialSettings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const totalPlayers = teams.reduce((acc, t) => acc + (t.plantilla?.length || 0), 0);

  const handleSave = () => {
    onSaveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-500/20 text-[#ffce42] rounded-xl flex items-center justify-center border border-amber-500/40">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">
              Ajustes y Configuración
            </h2>
            <p className="text-xs text-slate-400">
              Gestión de rutas de PC Basket, base de datos y parámetros de exportación.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#ffce42] hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4" /> Guardado
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Guardar Ajustes
            </>
          )}
        </button>
      </div>

      {/* GroupBox 1: Instalación PC Basket */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center space-x-2 text-[#ffce42] font-bold text-sm tracking-wide border-b border-slate-800 pb-3">
          <FolderOpen className="w-5 h-5" />
          <span>Instalación PC Basket</span>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Ruta de instalación de PC Basket:
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={settings.path}
              onChange={(e) => setSettings({ ...settings, path: e.target.value })}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#ffce42]"
            />
          </div>
        </div>

        {/* Verification Status List matching SettingsView.xaml */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">MANAGER.EXE</div>
              <div className="text-[11px] text-slate-400">Encontrado y activo</div>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">EQ022022.PKF</div>
              <div className="text-[11px] text-slate-400">Base de datos lista</div>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3">
            <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Archivos .DBC</div>
              <div className="text-[11px] text-slate-400">{teams.length} equipos sincronizados</div>
            </div>
          </div>
        </div>
      </div>

      {/* GroupBox 2: Base de Datos */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm tracking-wide border-b border-slate-800 pb-3">
          <Database className="w-5 h-5" />
          <span>Base de Datos del Editor</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-black text-white">{teams.length}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Equipos en BBDD</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-black text-emerald-400">{totalPlayers}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Jugadores registrados</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-black text-[#ffce42]">Activa</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Estado de sincronización</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => {
              if (
                window.confirm(
                  '¿Deseas restaurar la base de datos con los equipos ACB clásicos (Real Madrid, Barcelona, Manresa, Joventut, Baskonia, Estudiantes, Unicaja, Valencia)?'
                )
              ) {
                onResetDatabase();
              }
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#ffce42]" /> Restaurar Equipos ACB Clásicos
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  '¿Estás seguro de vaciar toda la base de datos? Se borrarán todos los equipos.'
                )
              ) {
                onClearDatabase();
              }
            }}
            className="px-4 py-2 bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Vaciar Base de Datos
          </button>
        </div>
      </div>

      {/* GroupBox 3: Importación / Exportación */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm tracking-wide border-b border-slate-800 pb-3">
          <Archive className="w-5 h-5" />
          <span>Reglas de Importación / Exportación</span>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={settings.useEurNationality}
              onChange={(e) =>
                setSettings({ ...settings, useEurNationality: e.target.checked })
              }
              className="w-4 h-4 rounded accent-[#ffce42]"
            />
            <div className="text-xs">
              <span className="font-bold text-white block">
                Exportar países comunitarios como no extranjeros
              </span>
              <span className="text-slate-400 text-[11px]">
                Asigna nacionalidad comunitaria (Luxemburgo) a jugadores europeos para no ocupar plaza de extranjero.
              </span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={settings.useCotNationality}
              onChange={(e) =>
                setSettings({ ...settings, useCotNationality: e.target.checked })
              }
              className="w-4 h-4 rounded accent-[#ffce42]"
            />
            <div className="text-xs">
              <span className="font-bold text-white block">
                Exportar países con ficha Cotonou como no extranjeros
              </span>
              <span className="text-slate-400 text-[11px]">
                Aplica la regla Cotonou (África, Caribe y Pacífico) asignando país exento.
              </span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={settings.adjustBirthDates}
              onChange={(e) =>
                setSettings({ ...settings, adjustBirthDates: e.target.checked })
              }
              className="w-4 h-4 rounded accent-[#ffce42]"
            />
            <div className="text-xs">
              <span className="font-bold text-white block">
                Ajustar fechas de nacimiento a la temporada del MANAGER.EXE
              </span>
              <span className="text-slate-400 text-[11px]">
                Adapta las edades de jugadores modernos al año configurado en el juego.
              </span>
            </div>
          </label>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-white block">
                Número máximo de jugadores por plantilla:
              </span>
              <span className="text-slate-400 text-[11px]">
                El motor de PC Basket admite hasta 15 jugadores por equipo.
              </span>
            </div>
            <input
              type="number"
              min={10}
              max={15}
              value={settings.maxPlayers}
              onChange={(e) =>
                setSettings({ ...settings, maxPlayers: parseInt(e.target.value) || 15 })
              }
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-400 text-xs focus:outline-none focus:border-[#ffce42]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

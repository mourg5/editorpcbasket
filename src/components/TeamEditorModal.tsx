import React, { useState } from 'react';
import {
  X,
  Save,
  Download,
  Plus,
  UserMinus,
  ArrowUp,
  ArrowDown,
  Shield,
  Trophy,
  Users,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Equipo, Jugador, Demarcacion } from '../types/pcbasket';
import { getAllCountries, getCountry } from '../utils/paises';
import {
  calculateTeamMedias,
  calculateMediaQuinteto,
  calculateMediaPlantilla,
  addRatingDelta,
} from '../utils/ratingsUtils';
import { downloadDbcFile } from '../utils/hexUtils';

interface TeamEditorModalProps {
  team: Equipo;
  onSave: (updatedTeam: Equipo) => void;
  onClose: () => void;
  onEditPlayer: (player: Jugador, onPlayerSave: (updatedPlayer: Jugador) => void) => void;
  startingYear: number;
  useCotNationality: boolean;
  useEurNationality: boolean;
}

const POS_NAMES: Record<Demarcacion, string> = {
  0: 'Base',
  1: 'Escolta',
  2: 'Alero',
  3: 'Ala-Pívot',
  4: 'Pívot',
};

const POS_LABELS = ['B', 'E', 'A', 'AP', 'P'];

export const TeamEditorModal: React.FC<TeamEditorModalProps> = ({
  team: initialTeam,
  onSave,
  onClose,
  onEditPlayer,
  startingYear,
  useCotNationality,
  useEurNationality,
}) => {
  const [team, setTeam] = useState<Equipo>(JSON.parse(JSON.stringify(initialTeam)));
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);

  const countries = getAllCountries();
  const teamMedias = calculateTeamMedias(team.plantilla);

  const handleFieldChange = (field: keyof Equipo, value: any) => {
    setTeam((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubirMedia = () => {
    setTeam((prev) => {
      const updated = { ...prev };
      updated.plantilla = updated.plantilla.map((j) => {
        const copy = JSON.parse(JSON.stringify(j));
        addRatingDelta(copy.medias, 1);
        return copy;
      });
      return updated;
    });
  };

  const handleBajarMedia = () => {
    setTeam((prev) => {
      const updated = { ...prev };
      updated.plantilla = updated.plantilla.map((j) => {
        const copy = JSON.parse(JSON.stringify(j));
        addRatingDelta(copy.medias, -1);
        return copy;
      });
      return updated;
    });
  };

  const handleMovePlayer = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === team.plantilla.length - 1)
    ) {
      return;
    }
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newPlantilla = [...team.plantilla];
    const temp = newPlantilla[index];
    newPlantilla[index] = newPlantilla[newIndex];
    newPlantilla[newIndex] = temp;
    setTeam((prev) => ({ ...prev, plantilla: newPlantilla }));
    setSelectedPlayerIndex(newIndex);
  };

  const handleRemovePlayer = (index: number) => {
    const player = team.plantilla[index];
    if (
      window.confirm(
        `¿Eliminar al jugador ${player.nombreLargo} de la plantilla del equipo?`
      )
    ) {
      const newPlantilla = team.plantilla.filter((_, i) => i !== index);
      setTeam((prev) => ({ ...prev, plantilla: newPlantilla }));
      setSelectedPlayerIndex(null);
    }
  };

  const handleAddNewPlayer = () => {
    const nextPuntero =
      team.plantilla.length > 0
        ? Math.max(...team.plantilla.map((j) => j.puntero)) + 1
        : team.puntero * 10 + 1;

    const newJugador: Jugador = {
      jugadorId: nextPuntero,
      puntero: nextPuntero,
      dorsal: 10 + (team.plantilla.length % 20),
      nombreCorto: 'NUEVO',
      nombreLargo: 'Nuevo JUGADOR',
      demarcacion: (team.plantilla.length % 5) as Demarcacion,
      anoNacimiento: startingYear - 24,
      nacionalidad: team.pais || 22,
      altura: 198,
      peso: 95,
      colorPiel: false,
      medias: {
        velocidad: 60,
        resistencia: 60,
        agresividad: 60,
        salto: 60,
        oculto: 60,
        defensa: 60,
        tiro2: 60,
        tiro3: 60,
        tiroL: 60,
        rebotes: 60,
        asistencias: 60,
      },
      equipoPuntero: team.puntero,
    };

    setTeam((prev) => ({
      ...prev,
      plantilla: [...prev.plantilla, newJugador],
    }));
  };

  const handleSave = () => {
    onSave(team);
  };

  const handleExportDbc = () => {
    downloadDbcFile(team, {
      startingYear,
      useCotNationality,
      useEurNationality,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-[#1e3462] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Modal Top Header */}
        <div className="bg-[#1e3462] border-b-2 border-[#ffce42]/40 px-6 py-3 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-[#ffce42]" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Editar Equipo:</span>
                <span className="text-[#ffce42] font-black">{team.nombreCorto}</span>
                <span className="text-xs bg-black/40 text-slate-300 font-mono px-2 py-0.5 rounded border border-white/10">
                  ID: {team.puntero}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split into Team Data & Roster Data */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Team Data (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#ffce42] uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Trophy className="w-4 h-4" />
                Datos del Club
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Puntero
                  </label>
                  <input
                    type="number"
                    value={team.puntero}
                    onChange={(e) => handleFieldChange('puntero', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-[#ffce42] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Nombre Corto
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={team.nombreCorto}
                    onChange={(e) => handleFieldChange('nombreCorto', e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold tracking-wide focus:border-[#ffce42] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Nombre Largo
                </label>
                <input
                  type="text"
                  value={team.nombreLargo}
                  onChange={(e) => handleFieldChange('nombreLargo', e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  País
                </label>
                <select
                  value={team.pais}
                  onChange={(e) => handleFieldChange('pais', parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.banderaEmoji} {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Entrenador
                </label>
                <input
                  type="text"
                  value={team.entrenador}
                  onChange={(e) => handleFieldChange('entrenador', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Pabellón
                </label>
                <input
                  type="text"
                  value={team.pabellon}
                  onChange={(e) => handleFieldChange('pabellon', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Aforo
                  </label>
                  <input
                    type="number"
                    value={team.aforo}
                    onChange={(e) => handleFieldChange('aforo', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#ffce42] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Presupuesto (M)
                  </label>
                  <input
                    type="number"
                    value={team.presupuesto}
                    onChange={(e) => handleFieldChange('presupuesto', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#ffce42] focus:outline-none"
                  />
                </div>
              </div>

              {/* Escudos Section matching WPF */}
              <div className="border-t border-slate-800 pt-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Gráficos de Escudo (PC Basket)
                </label>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-400 font-mono">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-black/60 rounded flex items-center justify-center text-[#ffce42] font-black border border-white/5">
                      3D
                    </div>
                    <span className="mt-1">3DESC</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex flex-col items-center justify-center">
                    <div className="w-8 h-10 bg-black/60 rounded flex items-center justify-center text-[#ffce42] font-bold border border-white/5 text-xs">
                      MINI
                    </div>
                    <span className="mt-1">MINI</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex flex-col items-center justify-center">
                    <div className="w-6 h-6 bg-black/60 rounded flex items-center justify-center text-[#ffce42] font-bold border border-white/5 text-[9px]">
                      N
                    </div>
                    <span className="mt-1">NANO</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex flex-col items-center justify-center">
                    <div className="w-4 h-4 bg-black/60 rounded flex items-center justify-center text-[#ffce42] font-bold border border-white/5 text-[8px]">
                      R
                    </div>
                    <span className="mt-1">RIDI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Plantilla (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-[#ffce42] uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Plantilla de Jugadores ({team.plantilla.length})
                </h3>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-400 font-medium">
                    Media Q:{' '}
                    <strong className="text-[#ffce42] font-black ml-1">
                      {teamMedias.mediaQuinteto}
                    </strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400 font-medium">
                    Media P:{' '}
                    <strong className="text-slate-200 font-black ml-1">
                      {teamMedias.mediaPlantilla}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Roster Table with Starters indicator matching EquipoWindow.xaml */}
              <div className="overflow-x-auto max-h-[380px] border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#121c33] text-slate-300 font-semibold uppercase tracking-wider sticky top-0 z-10">
                    <tr className="border-b border-slate-800">
                      <th className="py-2 px-2 text-center w-10">Rol</th>
                      <th className="py-2 px-2 text-center w-12">#</th>
                      <th className="py-2 px-3">Nombre Corto</th>
                      <th className="py-2 px-3">Nombre Largo</th>
                      <th className="py-2 px-2 text-center">Pos.</th>
                      <th className="py-2 px-2 text-center">M.Q</th>
                      <th className="py-2 px-2 text-center">M.P</th>
                      <th className="py-2 px-2 text-center">Alt</th>
                      <th className="py-2 px-3">País</th>
                      <th className="py-2 px-2 text-center">Nac</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {team.plantilla.map((player, index) => {
                      const isStarter = index < 5;
                      const roleLabel = isStarter ? POS_LABELS[index] : String(index + 1);
                      const country = getCountry(player.nacionalidad);
                      const isSelected = selectedPlayerIndex === index;

                      return (
                        <tr
                          key={player.puntero || index}
                          onClick={() => setSelectedPlayerIndex(index)}
                          onDoubleClick={() =>
                            onEditPlayer(player, (updatedPlayer) => {
                              const copy = [...team.plantilla];
                              copy[index] = updatedPlayer;
                              setTeam((prev) => ({ ...prev, plantilla: copy }));
                            })
                          }
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-600/30 text-white'
                              : isStarter
                              ? 'bg-amber-500/5 hover:bg-amber-500/10 text-slate-200'
                              : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          {/* Role Indicator (B, E, A, AP, P) */}
                          <td className="py-2 px-2 text-center font-bold">
                            <span
                              className={`inline-block w-6 h-6 rounded text-center leading-6 text-[10px] font-black ${
                                isStarter
                                  ? 'bg-[#ffce42] text-black shadow'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {roleLabel}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-amber-400">
                            {player.dorsal}
                          </td>
                          <td className="py-2 px-3 font-bold text-white tracking-wide">
                            {player.nombreCorto}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {player.nombreLargo}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="text-[11px] font-semibold text-slate-300">
                              {POS_NAMES[player.demarcacion]}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-black text-amber-400">
                            {calculateMediaQuinteto(player.medias)}
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-slate-300">
                            {calculateMediaPlantilla(player.medias)}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-slate-400">
                            {player.altura}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="mr-1">{country.banderaEmoji}</span>
                            <span className="text-slate-400 text-[11px]">{country.nombre}</span>
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-slate-400">
                            {player.anoNacimiento}
                          </td>
                        </tr>
                      );
                    })}
                    {team.plantilla.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500">
                          La plantilla no tiene jugadores. Añade uno con el botón inferior.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Roster Controls matching WPF */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-semibold mr-1">
                    Ajustar Medias:
                  </span>
                  <button
                    onClick={handleSubirMedia}
                    title="Subir +1 a todas las medias"
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> +1 Todos
                  </button>
                  <button
                    onClick={handleBajarMedia}
                    title="Bajar -1 a todas las medias"
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <TrendingDown className="w-3.5 h-3.5" /> -1 Todos
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedPlayerIndex !== null && (
                    <>
                      <button
                        onClick={() => handleMovePlayer(selectedPlayerIndex, 'up')}
                        disabled={selectedPlayerIndex === 0}
                        title="Mover jugador arriba en plantilla"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMovePlayer(selectedPlayerIndex, 'down')}
                        disabled={selectedPlayerIndex === team.plantilla.length - 1}
                        title="Mover jugador abajo en plantilla"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemovePlayer(selectedPlayerIndex)}
                        title="Quitar jugador de plantilla"
                        className="px-2.5 py-1.5 bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <UserMinus className="w-4 h-4" /> Quitar
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleAddNewPlayer}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                  >
                    <Plus className="w-4 h-4" /> Añadir Jugador
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 select-none">
          <div className="text-xs text-slate-400">
            Doble clic sobre cualquier jugador para editar sus atributos en profundidad.
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportDbc}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-[#ffce42]" /> Generar DBC
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#ffce42] hover:bg-amber-400 text-black font-extrabold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors"
            >
              <Save className="w-4 h-4" /> Guardar Equipo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

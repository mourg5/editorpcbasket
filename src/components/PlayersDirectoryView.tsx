import React, { useState } from 'react';
import { Users, Search, Filter, Edit3, Shield, Trophy } from 'lucide-react';
import { Equipo, Jugador, Demarcacion } from '../types/pcbasket';
import { getCountry } from '../utils/paises';
import { calculateMediaQuinteto, calculateMediaPlantilla } from '../utils/ratingsUtils';

interface PlayersDirectoryViewProps {
  teams: Equipo[];
  onEditPlayer: (player: Jugador, onPlayerSave: (updatedPlayer: Jugador) => void) => void;
  onSelectTeam: (team: Equipo) => void;
}

const POS_NAMES: Record<Demarcacion, string> = {
  0: 'Base',
  1: 'Escolta',
  2: 'Alero',
  3: 'Ala-Pívot',
  4: 'Pívot',
};

export const PlayersDirectoryView: React.FC<PlayersDirectoryViewProps> = ({
  teams,
  onEditPlayer,
  onSelectTeam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [selectedTeamPuntero, setSelectedTeamPuntero] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ratingQ' | 'ratingP' | 'nombre' | 'altura'>('ratingQ');

  // Flatten all players with team reference
  const allPlayersWithTeam = teams.flatMap((team) =>
    team.plantilla.map((player) => ({
      player,
      team,
    }))
  );

  const filtered = allPlayersWithTeam.filter(({ player, team }) => {
    const q = searchTerm.toLowerCase();
    const matchName =
      player.nombreCorto.toLowerCase().includes(q) ||
      player.nombreLargo.toLowerCase().includes(q) ||
      team.nombreCorto.toLowerCase().includes(q) ||
      String(player.puntero).includes(q);

    const matchPos = selectedPos === 'all' || String(player.demarcacion) === selectedPos;
    const matchTeam =
      selectedTeamPuntero === 'all' || String(team.puntero) === selectedTeamPuntero;

    return matchName && matchPos && matchTeam;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'ratingQ') {
      return (
        calculateMediaQuinteto(b.player.medias) -
        calculateMediaQuinteto(a.player.medias)
      );
    }
    if (sortBy === 'ratingP') {
      return (
        calculateMediaPlantilla(b.player.medias) -
        calculateMediaPlantilla(a.player.medias)
      );
    }
    if (sortBy === 'altura') {
      return b.player.altura - a.player.altura;
    }
    return a.player.nombreLargo.localeCompare(b.player.nombreLargo);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Directorio Global de Jugadores
              </h2>
              <p className="text-xs text-slate-400">
                {filtered.length} de {allPlayersWithTeam.length} jugadores en la base de datos
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, equipo, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#ffce42]"
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Filtrar por Posición:
            </label>
            <select
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-[#ffce42] focus:outline-none"
            >
              <option value="all">Todas las posiciones</option>
              <option value="0">Bases (PG)</option>
              <option value="1">Escoltas (SG)</option>
              <option value="2">Aleros (SF)</option>
              <option value="3">Ala-Pívots (PF)</option>
              <option value="4">Pívots (C)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Filtrar por Equipo:
            </label>
            <select
              value={selectedTeamPuntero}
              onChange={(e) => setSelectedTeamPuntero(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-[#ffce42] focus:outline-none"
            >
              <option value="all">Todos los equipos</option>
              {teams.map((t) => (
                <option key={t.puntero} value={String(t.puntero)}>
                  {t.nombreCorto} ({t.puntero})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Ordenar por:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-[#ffce42] focus:outline-none"
            >
              <option value="ratingQ">Media Quinteto (Mayor a menor)</option>
              <option value="ratingP">Media Plantilla (Mayor a menor)</option>
              <option value="altura">Altura (Mayor a menor)</option>
              <option value="nombre">Nombre alfabético</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121c33] text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3 text-center w-14">ID</th>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-4">Jugador</th>
                <th className="py-3 px-4">Equipo</th>
                <th className="py-3 px-3 text-center">Pos.</th>
                <th className="py-3 px-3 text-center">Med.Q</th>
                <th className="py-3 px-3 text-center">Med.P</th>
                <th className="py-3 px-3 text-center">Alt (cm)</th>
                <th className="py-3 px-3 text-center">Peso</th>
                <th className="py-3 px-4">Nacionalidad</th>
                <th className="py-3 px-3 text-center">Nac</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map(({ player, team }) => {
                const country = getCountry(player.nacionalidad);
                const q = calculateMediaQuinteto(player.medias);
                const p = calculateMediaPlantilla(player.medias);

                return (
                  <tr
                    key={`${team.puntero}-${player.puntero}`}
                    className="hover:bg-slate-800/50 text-slate-300 transition-colors"
                  >
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                      {player.puntero}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-white">
                      {player.dorsal}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white tracking-wide">
                        {player.nombreLargo}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {player.nombreCorto}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectTeam(team)}
                        className="hover:underline flex items-center space-x-1.5 text-blue-400 font-semibold"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{team.nombreCorto}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-semibold text-xs bg-slate-800 text-slate-200 border border-slate-700">
                        {POS_NAMES[player.demarcacion]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded font-black text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {q}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-300">
                      {p}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {player.altura}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {player.peso}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="mr-1.5 text-base">{country.banderaEmoji}</span>
                      <span className="text-slate-300">{country.nombre}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {player.anoNacimiento}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          onEditPlayer(player, (updatedPlayer) => {
                            const playerIndex = team.plantilla.findIndex(
                              (j) => j.puntero === player.puntero
                            );
                            if (playerIndex >= 0) {
                              team.plantilla[playerIndex] = updatedPlayer;
                            }
                          })
                        }
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    No se encontraron jugadores con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

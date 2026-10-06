import React, { useState } from 'react';
import {
  X,
  Save,
  Wand2,
  User,
  Sliders,
  ChevronDown,
  ChevronUp,
  Activity,
  Check,
} from 'lucide-react';
import { Jugador, Demarcacion, Medias, IAbilities } from '../types/pcbasket';
import { getAllCountries, getCountry } from '../utils/paises';
import {
  calculateMediaQuinteto,
  calculateMediaPlantilla,
  generatePlayerRating,
} from '../utils/ratingsUtils';

interface PlayerEditorModalProps {
  player: Jugador;
  onSave: (updatedPlayer: Jugador) => void;
  onClose: () => void;
}

const POSITIONS: { value: Demarcacion; label: string }[] = [
  { value: 0, label: 'Base (PG)' },
  { value: 1, label: 'Escolta (SG)' },
  { value: 2, label: 'Alero (SF)' },
  { value: 3, label: 'Ala-Pívot (PF)' },
  { value: 4, label: 'Pívot (C)' },
];

export const PlayerEditorModal: React.FC<PlayerEditorModalProps> = ({
  player: initialPlayer,
  onSave,
  onClose,
}) => {
  const [player, setPlayer] = useState<Jugador>(
    JSON.parse(JSON.stringify(initialPlayer))
  );

  // Abilities generator state
  const [desiredRating, setDesiredRating] = useState<number>(75);
  const [showGenerator, setShowGenerator] = useState<boolean>(true);
  const [abilities, setAbilities] = useState<IAbilities>({
    isVeloz: false,
    isAtletico: false,
    isIntimidador: false,
    isTirador: true,
    isCreador: false,
    isDefensor: false,
  });

  const countries = getAllCountries();

  const handleMediaChange = (attr: keyof Medias, val: number) => {
    const clamped = Math.max(0, Math.min(99, val || 0));
    setPlayer((prev) => ({
      ...prev,
      medias: {
        ...prev.medias,
        [attr]: clamped,
      },
    }));
  };

  const handleFieldChange = (field: keyof Jugador, val: any) => {
    setPlayer((prev) => ({ ...prev, [field]: val }));
  };

  const handleGenerateRating = () => {
    const updatedMedias = { ...player.medias };
    generatePlayerRating(
      updatedMedias,
      abilities,
      desiredRating,
      player.demarcacion
    );
    setPlayer((prev) => ({
      ...prev,
      medias: updatedMedias,
    }));
  };

  const mediaQ = calculateMediaQuinteto(player.medias);
  const mediaP = calculateMediaPlantilla(player.medias);

  const physicalAttrs: { key: keyof Medias; label: string }[] = [
    { key: 'velocidad', label: 'Velocidad' },
    { key: 'salto', label: 'Salto' },
    { key: 'resistencia', label: 'Resistencia' },
    { key: 'agresividad', label: 'Agresividad' },
    { key: 'defensa', label: 'Defensa' },
  ];

  const skillAttrs: { key: keyof Medias; label: string }[] = [
    { key: 'tiro2', label: 'Tiro 2' },
    { key: 'tiro3', label: 'Tiro 3' },
    { key: 'tiroL', label: 'Tiro Libre' },
    { key: 'rebotes', label: 'Rebotes' },
    { key: 'asistencias', label: 'Asistencias' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-[#1e3462] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden text-slate-100">
        {/* Top Header matching JugadorWindow.xaml */}
        <div className="bg-[#1e3462] px-6 py-4 flex items-center justify-between border-b-2 border-[#ffce42]/40 select-none shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-14 bg-slate-800 rounded-lg border-2 border-[#ffce42] flex items-center justify-center text-slate-400 font-bold overflow-hidden shadow">
              <User className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-black/40 text-[#ffce42] font-mono px-2 py-0.5 rounded font-bold">
                  ID: {player.puntero}
                </span>
                <span className="text-xs bg-black/40 text-slate-300 font-mono px-2 py-0.5 rounded font-bold">
                  #{player.dorsal}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {POSITIONS.find((p) => p.value === player.demarcacion)?.label}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-wide">
                {player.nombreLargo}
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

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic & Demographic Info */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ffce42]" />
              Datos Personales y Demarcación
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Nombre Corto
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={player.nombreCorto}
                  onChange={(e) =>
                    handleFieldChange('nombreCorto', e.target.value.toUpperCase())
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold tracking-wide focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Nombre Largo
                </label>
                <input
                  type="text"
                  value={player.nombreLargo}
                  onChange={(e) => handleFieldChange('nombreLargo', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Dorsal (#)
                </label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={player.dorsal}
                  onChange={(e) =>
                    handleFieldChange('dorsal', parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-mono font-bold text-center focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Año Nac.
                </label>
                <input
                  type="number"
                  value={player.anoNacimiento}
                  onChange={(e) =>
                    handleFieldChange('anoNacimiento', parseInt(e.target.value) || 1975)
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-center focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Posición
                </label>
                <select
                  value={player.demarcacion}
                  onChange={(e) =>
                    handleFieldChange('demarcacion', parseInt(e.target.value) as Demarcacion)
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={player.altura}
                  onChange={(e) =>
                    handleFieldChange('altura', parseInt(e.target.value) || 195)
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={player.peso}
                  onChange={(e) =>
                    handleFieldChange('peso', parseInt(e.target.value) || 90)
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Nacionalidad
                </label>
                <select
                  value={player.nacionalidad}
                  onChange={(e) =>
                    handleFieldChange('nacionalidad', parseInt(e.target.value))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.banderaEmoji} {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-3">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Color de Piel (Sprite)
                </label>
                <div className="flex items-center space-x-4 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="colorPiel"
                      checked={!player.colorPiel}
                      onChange={() => handleFieldChange('colorPiel', false)}
                      className="text-amber-400"
                    />
                    <span>Blanco</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="colorPiel"
                      checked={player.colorPiel}
                      onChange={() => handleFieldChange('colorPiel', true)}
                      className="text-amber-400"
                    />
                    <span>Negro</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Medias Grid & Generator Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 11 Attributes with Sliders (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#ffce42]" />
                  Atributos y Habilidades
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-lg text-xs font-black text-amber-300">
                    Quinteto: {mediaQ}
                  </div>
                  <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-300">
                    Plantilla: {mediaP}
                  </div>
                </div>
              </div>

              {/* Physical Attributes (Yellow theme #ffce42) */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                  Condición Física y Defensiva
                </div>
                {physicalAttrs.map(({ key, label }) => {
                  const val = player.medias[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5"
                    >
                      <div className="w-24 text-xs font-bold text-slate-200">
                        {label}
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={99}
                        value={val}
                        onChange={(e) =>
                          handleMediaChange(key, parseInt(e.target.value) || 0)
                        }
                        className="flex-1 accent-[#ffce42] cursor-pointer"
                      />
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={val}
                        onChange={(e) =>
                          handleMediaChange(key, parseInt(e.target.value) || 0)
                        }
                        className="w-12 bg-black/60 border border-amber-400/40 rounded text-center text-xs font-mono font-black text-amber-400 py-1"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Skill Attributes (Gray theme) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Tiro, Rebotes y Pases
                </div>
                {skillAttrs.map(({ key, label }) => {
                  const val = player.medias[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5"
                    >
                      <div className="w-24 text-xs font-bold text-slate-200">
                        {label}
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={99}
                        value={val}
                        onChange={(e) =>
                          handleMediaChange(key, parseInt(e.target.value) || 0)
                        }
                        className="flex-1 accent-slate-300 cursor-pointer"
                      />
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={val}
                        onChange={(e) =>
                          handleMediaChange(key, parseInt(e.target.value) || 0)
                        }
                        className="w-12 bg-black/60 border border-slate-600 rounded text-center text-xs font-mono font-black text-white py-1"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Hidden Rating (Blue theme #7593bb) */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5">
                  <div className="w-24 text-xs font-bold text-blue-300">
                    Oculto
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={99}
                    value={player.medias.oculto}
                    onChange={(e) =>
                      handleMediaChange('oculto', parseInt(e.target.value) || 0)
                    }
                    className="flex-1 accent-blue-400 cursor-pointer"
                  />
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={player.medias.oculto}
                    onChange={(e) =>
                      handleMediaChange('oculto', parseInt(e.target.value) || 0)
                    }
                    className="w-12 bg-black/60 border border-blue-400/40 rounded text-center text-xs font-mono font-black text-blue-300 py-1"
                  />
                </div>
              </div>
            </div>

            {/* Generador de Medias Accordion / Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gradient-to-b from-[#182848] to-[#121c33] border-2 border-amber-500/40 rounded-xl p-5 space-y-4 shadow-xl">
                <div
                  onClick={() => setShowGenerator(!showGenerator)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <h3 className="text-xs font-extrabold text-[#ffce42] uppercase tracking-wider flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Generador de Medias
                  </h3>
                  {showGenerator ? (
                    <ChevronUp className="w-4 h-4 text-[#ffce42]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#ffce42]" />
                  )}
                </div>

                {showGenerator && (
                  <div className="space-y-4 pt-2 border-t border-white/10 text-xs">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">
                        Media Deseada (Quinteto):
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min={20}
                          max={95}
                          value={desiredRating}
                          onChange={(e) =>
                            setDesiredRating(parseInt(e.target.value) || 70)
                          }
                          className="flex-1 accent-[#ffce42] cursor-pointer"
                        />
                        <span className="w-12 text-center py-1 bg-black/60 border border-[#ffce42] rounded font-black text-amber-300 text-sm font-mono">
                          {desiredRating}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Especialidades / Rasgos:
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                          <input
                            type="checkbox"
                            checked={abilities.isVeloz}
                            onChange={(e) =>
                              setAbilities((prev) => ({
                                ...prev,
                                isVeloz: e.target.checked,
                              }))
                            }
                            className="rounded accent-[#ffce42]"
                          />
                          <span>Veloz</span>
                        </label>

                        <label className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                          <input
                            type="checkbox"
                            checked={abilities.isAtletico}
                            onChange={(e) =>
                              setAbilities((prev) => ({
                                ...prev,
                                isAtletico: e.target.checked,
                              }))
                            }
                            className="rounded accent-[#ffce42]"
                          />
                          <span>Atlético</span>
                        </label>

                        <label className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                          <input
                            type="checkbox"
                            checked={abilities.isIntimidador}
                            onChange={(e) =>
                              setAbilities((prev) => ({
                                ...prev,
                                isIntimidador: e.target.checked,
                              }))
                            }
                            className="rounded accent-[#ffce42]"
                          />
                          <span>Intimidador</span>
                        </label>

                        <label className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                          <input
                            type="checkbox"
                            checked={abilities.isTirador}
                            onChange={(e) =>
                              setAbilities((prev) => ({
                                ...prev,
                                isTirador: e.target.checked,
                              }))
                            }
                            className="rounded accent-[#ffce42]"
                          />
                          <span>Tirador</span>
                        </label>

                        <label className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                          <input
                            type="checkbox"
                            checked={abilities.isCreador}
                            onChange={(e) =>
                              setAbilities((prev) => ({
                                ...prev,
                                isCreador: e.target.checked,
                              }))
                            }
                            className="rounded accent-[#ffce42]"
                          />
                          <span>Creador de juego</span>
                        </label>

                        <label className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                          <input
                            type="checkbox"
                            checked={abilities.isDefensor}
                            onChange={(e) =>
                              setAbilities((prev) => ({
                                ...prev,
                                isDefensor: e.target.checked,
                              }))
                            }
                            className="rounded accent-[#ffce42]"
                          />
                          <span>Defensor</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateRating}
                      className="w-full py-2.5 bg-[#ffce42] hover:bg-amber-400 text-black font-black rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                      <Wand2 className="w-4 h-4" /> Generar Atributos
                    </button>
                    <p className="text-[10px] text-slate-400 text-center font-light leading-tight">
                      Calcula las estadísticas según la demarcación (
                      {POSITIONS.find((p) => p.value === player.demarcacion)?.label}
                      ) y los rasgos elegidos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-end space-x-3 select-none shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(player)}
            className="px-6 py-2 bg-[#ffce42] hover:bg-amber-400 text-black font-extrabold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors"
          >
            <Save className="w-4 h-4" /> Guardar Jugador
          </button>
        </div>
      </div>
    </div>
  );
};

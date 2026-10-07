import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Users,
  Award,
  ChevronDown,
  ArrowUpDown,
  Filter,
  Eye,
  SlidersHorizontal,
  Info,
  Scale,
  Sparkles,
  Zap,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react';
import { Equipo, Jugador, Demarcacion, NavigationView } from '../types/pcbasket';
import { calculateMediaQuinteto, calculateMediaPlantilla, calculateTeamMedias } from '../utils/ratingsUtils';

interface StatsDashboardViewProps {
  teams: Equipo[];
  onSelectTeam?: (team: Equipo) => void;
  onEditPlayer?: (player: Jugador, onSaveCallback: (p: Jugador) => void) => void;
  onNavigate?: (view: NavigationView) => void;
  startingYear?: number;
}

export type AttributeKey =
  | 'mediaQuinteto'
  | 'mediaPlantilla'
  | 'tiro2'
  | 'tiro3'
  | 'tiroL'
  | 'defensa'
  | 'rebotes'
  | 'asistencias'
  | 'velocidad'
  | 'salto'
  | 'resistencia'
  | 'agresividad'
  | 'altura'
  | 'peso'
  | 'edad';

interface AttributeMeta {
  key: AttributeKey;
  label: string;
  category: 'Global' | 'Tiro' | 'Físico' | 'Táctica' | 'Creación';
  unit: string;
  min: number;
  max: number;
  description: string;
  idealRange: [number, number]; // Balanced league average range
}

const ATTRIBUTES: AttributeMeta[] = [
  {
    key: 'mediaQuinteto',
    label: 'Media Quinteto (Global)',
    category: 'Global',
    unit: 'pts',
    min: 0,
    max: 99,
    description: 'Valoración general global del jugador para el quinteto inicial en PC Basket',
    idealRange: [60, 78],
  },
  {
    key: 'mediaPlantilla',
    label: 'Media Plantilla',
    category: 'Global',
    unit: 'pts',
    min: 0,
    max: 99,
    description: 'Valoración media ponderada de profundidad de banquillo',
    idealRange: [55, 75],
  },
  {
    key: 'tiro2',
    label: 'Tiro de 2',
    category: 'Tiro',
    unit: '',
    min: 0,
    max: 99,
    description: 'Eficacia en lanzamientos de media distancia y bandejas',
    idealRange: [50, 75],
  },
  {
    key: 'tiro3',
    label: 'Tiro de 3 (Triples)',
    category: 'Tiro',
    unit: '',
    min: 0,
    max: 99,
    description: 'Eficacia desde más allá de la línea de 6,25m',
    idealRange: [45, 72],
  },
  {
    key: 'tiroL',
    label: 'Tiro Libre',
    category: 'Tiro',
    unit: '',
    min: 0,
    max: 99,
    description: 'Porcentaje y temple desde la línea de personal',
    idealRange: [55, 78],
  },
  {
    key: 'defensa',
    label: 'Defensa',
    category: 'Táctica',
    unit: '',
    min: 0,
    max: 99,
    description: 'Intensidad defensiva, robos de balón y colocación',
    idealRange: [50, 75],
  },
  {
    key: 'rebotes',
    label: 'Rebotes',
    category: 'Táctica',
    unit: '',
    min: 0,
    max: 99,
    description: 'Capacidad reboteadora ofensiva y defensiva',
    idealRange: [48, 74],
  },
  {
    key: 'asistencias',
    label: 'Asistencias / Pase',
    category: 'Creación',
    unit: '',
    min: 0,
    max: 99,
    description: 'Visión de juego y precisión en el pase',
    idealRange: [45, 72],
  },
  {
    key: 'velocidad',
    label: 'Velocidad',
    category: 'Físico',
    unit: '',
    min: 0,
    max: 99,
    description: 'Ritmo en contraataques y desplazamientos laterales',
    idealRange: [52, 75],
  },
  {
    key: 'salto',
    label: 'Salto / Potencia',
    category: 'Físico',
    unit: '',
    min: 0,
    max: 99,
    description: 'Elevación vertical para mates y tapones',
    idealRange: [50, 75],
  },
  {
    key: 'resistencia',
    label: 'Resistencia',
    category: 'Físico',
    unit: '',
    min: 0,
    max: 99,
    description: 'Mantenimiento de energía durante los 40 minutos',
    idealRange: [55, 80],
  },
  {
    key: 'agresividad',
    label: 'Agresividad',
    category: 'Táctica',
    unit: '',
    min: 0,
    max: 99,
    description: 'Dureza en el contacto y predisposición a cometer faltas',
    idealRange: [45, 70],
  },
  {
    key: 'altura',
    label: 'Altura',
    category: 'Físico',
    unit: 'cm',
    min: 170,
    max: 225,
    description: 'Estatura física del jugador en centímetros',
    idealRange: [195, 202],
  },
  {
    key: 'peso',
    label: 'Peso',
    category: 'Físico',
    unit: 'kg',
    min: 70,
    max: 140,
    description: 'Masa corporal del jugador en kilogramos',
    idealRange: [90, 105],
  },
  {
    key: 'edad',
    label: 'Edad Estimada',
    category: 'Físico',
    unit: 'años',
    min: 17,
    max: 42,
    description: 'Edad calculada a partir del año de nacimiento',
    idealRange: [24, 29],
  },
];

const POSITION_NAMES: Record<Demarcacion, string> = {
  0: 'Bases (PG)',
  1: 'Escoltas (SG)',
  2: 'Aleros (SF)',
  3: 'Ala-Pívots (PF)',
  4: 'Pívots (C)',
};

const POSITION_SHORT: Record<Demarcacion, string> = {
  0: 'Base',
  1: 'Escolta',
  2: 'Alero',
  3: 'Ala-Pívot',
  4: 'Pívot',
};

export const StatsDashboardView: React.FC<StatsDashboardViewProps> = ({
  teams,
  onSelectTeam,
  onEditPlayer,
  onNavigate,
  startingYear = 1998,
}) => {
  const [selectedAttrKey, setSelectedAttrKey] = useState<AttributeKey>('mediaQuinteto');
  const [positionFilter, setPositionFilter] = useState<'ALL' | Demarcacion>('ALL');
  const [teamSortOrder, setTeamSortOrder] = useState<'DESC' | 'ASC' | 'ALPHA' | 'DISPARITY'>('DESC');
  const [activeTab, setActiveTab] = useState<'distribution' | 'teams' | 'positions' | 'diagnostics'>('distribution');
  const [hoveredBin, setHoveredBin] = useState<number | null>(null);
  const [selectedTeamDrilldown, setSelectedTeamDrilldown] = useState<Equipo | null>(null);

  // Active attribute metadata
  const currentAttr = useMemo(
    () => ATTRIBUTES.find((a) => a.key === selectedAttrKey) || ATTRIBUTES[0],
    [selectedAttrKey]
  );

  // Helper to extract numeric attribute value for a player
  const getPlayerAttrValue = (player: Jugador): number => {
    switch (selectedAttrKey) {
      case 'mediaQuinteto':
        return calculateMediaQuinteto(player.medias);
      case 'mediaPlantilla':
        return calculateMediaPlantilla(player.medias);
      case 'altura':
        return player.altura || 195;
      case 'peso':
        return player.peso || 95;
      case 'edad':
        return player.anoNacimiento ? startingYear - player.anoNacimiento : 26;
      default:
        return (player.medias as any)[selectedAttrKey] ?? 50;
    }
  };

  // Flattened all players with their team info
  const allPlayersWithTeam = useMemo(() => {
    const list: Array<{ player: Jugador; team: Equipo; value: number }> = [];
    teams.forEach((team) => {
      (team.plantilla || []).forEach((player) => {
        if (positionFilter !== 'ALL' && player.demarcacion !== positionFilter) return;
        list.push({
          player,
          team,
          value: getPlayerAttrValue(player),
        });
      });
    });
    return list;
  }, [teams, selectedAttrKey, positionFilter, startingYear]);

  // Overall league statistics for this attribute
  const leagueStats = useMemo(() => {
    if (allPlayersWithTeam.length === 0) {
      return { count: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
    }
    const values = allPlayersWithTeam.map((p) => p.value).sort((a, b) => a - b);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = Math.round((sum / values.length) * 10) / 10;
    const median = values[Math.floor(values.length / 2)];
    const min = values[0];
    const max = values[values.length - 1];

    const variance =
      values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

    return { count: values.length, mean, median, min, max, stdDev };
  }, [allPlayersWithTeam]);

  // Team averages for the selected attribute
  const teamAverages = useMemo(() => {
    return teams.map((team) => {
      let players = team.plantilla || [];
      if (positionFilter !== 'ALL') {
        players = players.filter((p) => p.demarcacion === positionFilter);
      }
      if (players.length === 0) {
        return {
          team,
          avg: 0,
          count: 0,
          min: 0,
          max: 0,
          diffFromLeague: 0,
        };
      }
      const vals = players.map((p) => getPlayerAttrValue(p));
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = Math.round((sum / players.length) * 10) / 10;
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const diffFromLeague = Math.round((avg - leagueStats.mean) * 10) / 10;

      return {
        team,
        avg,
        count: players.length,
        min,
        max,
        diffFromLeague,
      };
    });
  }, [teams, selectedAttrKey, positionFilter, leagueStats.mean, startingYear]);

  // Sorted team averages
  const sortedTeamAverages = useMemo(() => {
    return [...teamAverages].sort((a, b) => {
      if (teamSortOrder === 'DESC') return b.avg - a.avg;
      if (teamSortOrder === 'ASC') return a.avg - b.avg;
      if (teamSortOrder === 'ALPHA') return a.team.nombreCorto.localeCompare(b.team.nombreCorto);
      if (teamSortOrder === 'DISPARITY') return Math.abs(b.diffFromLeague) - Math.abs(a.diffFromLeague);
      return 0;
    });
  }, [teamAverages, teamSortOrder]);

  // League Competitive Balance Rating
  const leagueBalanceReport = useMemo(() => {
    // Team quinteto averages
    const teamQuintetos = teams.map((t) => calculateTeamMedias(t.plantilla).mediaQuinteto);
    if (teamQuintetos.length === 0) {
      return { index: 0, status: 'Sin Datos', badgeColor: 'text-slate-400', desc: 'No hay equipos cargados.' };
    }
    const qMean = teamQuintetos.reduce((a, b) => a + b, 0) / teamQuintetos.length;
    const qVar = teamQuintetos.reduce((a, b) => a + Math.pow(b - qMean, 2), 0) / teamQuintetos.length;
    const qStd = Math.round(Math.sqrt(qVar) * 10) / 10;

    if (qStd <= 3.8) {
      return {
        index: qStd,
        status: 'Liga Muy Equilibrada',
        badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
        desc: 'Los equipos tienen plantillas muy parejas y competitivas. No hay distorsiones significativas.',
      };
    } else if (qStd <= 6.5) {
      return {
        index: qStd,
        status: 'Equilibrio Estándar (ACB Real)',
        badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-500/30',
        desc: 'Existe una jerarquía natural entre clubes grandes y modestos, similar a la competición real.',
      };
    } else if (qStd <= 10.0) {
      return {
        index: qStd,
        status: 'Desbalance Moderado',
        badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
        desc: 'Hay diferencias notables entre los equipos dominantes y los colistas que podrían desvirtuar partidas.',
      };
    } else {
      return {
        index: qStd,
        status: 'Fuerte Descompensación',
        badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
        desc: 'Brecha extrema entre franquicias. Algunos clubes tienen medias infladas o plantillas debilitadas.',
      };
    }
  }, [teams]);

  // Distribution Histogram Bins
  const histogramBins = useMemo(() => {
    // Generate buckets depending on attribute type
    let buckets: Array<{
      id: number;
      label: string;
      range: [number, number];
      count: number;
      percentage: number;
      players: Array<{ player: Jugador; team: Equipo; value: number }>;
    }> = [];

    if (selectedAttrKey === 'altura') {
      const ranges: Array<[number, number, string]> = [
        [0, 185, '< 185 cm'],
        [186, 193, '186 - 193 cm'],
        [194, 200, '194 - 200 cm'],
        [201, 207, '201 - 207 cm'],
        [208, 214, '208 - 214 cm'],
        [215, 300, '≥ 215 cm'],
      ];
      buckets = ranges.map(([min, max, label], idx) => ({
        id: idx,
        label,
        range: [min, max],
        count: 0,
        percentage: 0,
        players: [],
      }));
    } else if (selectedAttrKey === 'peso') {
      const ranges: Array<[number, number, string]> = [
        [0, 80, '< 80 kg'],
        [81, 90, '81 - 90 kg'],
        [91, 100, '91 - 100 kg'],
        [101, 110, '101 - 110 kg'],
        [111, 120, '111 - 120 kg'],
        [121, 300, '≥ 121 kg'],
      ];
      buckets = ranges.map(([min, max, label], idx) => ({
        id: idx,
        label,
        range: [min, max],
        count: 0,
        percentage: 0,
        players: [],
      }));
    } else if (selectedAttrKey === 'edad') {
      const ranges: Array<[number, number, string]> = [
        [0, 20, '< 21 años'],
        [21, 24, '21 - 24 años'],
        [25, 28, '25 - 28 años'],
        [29, 32, '29 - 32 años'],
        [33, 36, '33 - 36 años'],
        [37, 100, '≥ 37 años'],
      ];
      buckets = ranges.map(([min, max, label], idx) => ({
        id: idx,
        label,
        range: [min, max],
        count: 0,
        percentage: 0,
        players: [],
      }));
    } else {
      // 0-99 ratings bins: <30, 30-39, 40-49, 50-59, 60-69, 70-79, 80-89, 90-99
      const ranges: Array<[number, number, string]> = [
        [0, 29, '< 30'],
        [30, 39, '30 - 39'],
        [40, 49, '40 - 49'],
        [50, 59, '50 - 59'],
        [60, 69, '60 - 69'],
        [70, 79, '70 - 79'],
        [80, 89, '80 - 89'],
        [90, 99, '90 - 99'],
      ];
      buckets = ranges.map(([min, max, label], idx) => ({
        id: idx,
        label,
        range: [min, max],
        count: 0,
        percentage: 0,
        players: [],
      }));
    }

    // Populate counts and players
    allPlayersWithTeam.forEach((item) => {
      const b = buckets.find((b) => item.value >= b.range[0] && item.value <= b.range[1]);
      if (b) {
        b.count += 1;
        b.players.push(item);
      }
    });

    const total = allPlayersWithTeam.length || 1;
    buckets.forEach((b) => {
      b.percentage = Math.round((b.count / total) * 1000) / 10;
    });

    return buckets;
  }, [allPlayersWithTeam, selectedAttrKey]);

  const maxHistogramCount = useMemo(() => {
    return Math.max(1, ...histogramBins.map((b) => b.count));
  }, [histogramBins]);

  // Position-by-position comparison averages
  const positionAverages = useMemo(() => {
    const positions: Demarcacion[] = [0, 1, 2, 3, 4];
    return positions.map((pos) => {
      const players = allPlayersWithTeam.filter((p) => p.player.demarcacion === pos);
      if (players.length === 0) {
        return { pos, name: POSITION_NAMES[pos], short: POSITION_SHORT[pos], avg: 0, count: 0 };
      }
      const sum = players.reduce((a, b) => a + b.value, 0);
      const avg = Math.round((sum / players.length) * 10) / 10;
      return { pos, name: POSITION_NAMES[pos], short: POSITION_SHORT[pos], avg, count: players.length };
    });
  }, [allPlayersWithTeam]);

  // League Anomaly & Imbalance Detection Engine
  const anomalies = useMemo(() => {
    const list: Array<{
      id: string;
      level: 'CRITICAL' | 'WARNING' | 'INFO';
      title: string;
      description: string;
      affectedTeam?: Equipo;
      affectedPlayer?: Jugador;
      metric?: string;
    }> = [];

    // 1. Roster Size Anomalies
    teams.forEach((t) => {
      const rosterCount = t.plantilla?.length || 0;
      if (rosterCount < 8) {
        list.push({
          id: `roster-short-${t.puntero}`,
          level: 'CRITICAL',
          title: `Plantilla incompleta: ${t.nombreCorto}`,
          description: `Tiene solo ${rosterCount} jugadores registrados. Se requiere un mínimo de 8 jugadores para competir en PC Basket sin provocar cierres inesperados.`,
          affectedTeam: t,
          metric: `${rosterCount} jugadores`,
        });
      } else if (rosterCount > 15) {
        list.push({
          id: `roster-long-${t.puntero}`,
          level: 'WARNING',
          title: `Exceso de fichas: ${t.nombreCorto}`,
          description: `Tiene ${rosterCount} jugadores. El formato oficial de PC Basket admite un máximo de 15 fichas por equipo.`,
          affectedTeam: t,
          metric: `${rosterCount} jugadores`,
        });
      }
    });

    // 2. Positional Gaps
    teams.forEach((t) => {
      const positionsCount: Record<Demarcacion, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
      (t.plantilla || []).forEach((p) => {
        if (p.demarcacion in positionsCount) {
          positionsCount[p.demarcacion] += 1;
        }
      });

      if (positionsCount[0] === 0) {
        list.push({
          id: `no-pg-${t.puntero}`,
          level: 'WARNING',
          title: `Sin Bases: ${t.nombreCorto}`,
          description: `No cuenta con ningún Base natural en la plantilla, lo que obligará al simulador de partidos a forzar descolocaciones tácticas.`,
          affectedTeam: t,
        });
      }
      if (positionsCount[4] === 0) {
        list.push({
          id: `no-c-${t.puntero}`,
          level: 'WARNING',
          title: `Sin Pívots: ${t.nombreCorto}`,
          description: `No cuenta con ningún Pívot registrado en el roster, dejando la pintura desprotegida.`,
          affectedTeam: t,
        });
      }
    });

    // 3. Team Rating Outliers (Super teams or Severely deflated teams)
    if (teams.length >= 4) {
      const qAvgs = teams.map((t) => ({
        team: t,
        avg: calculateTeamMedias(t.plantilla).mediaQuinteto,
      }));
      const avgSum = qAvgs.reduce((a, b) => a + b.avg, 0);
      const leagueMean = avgSum / qAvgs.length;
      const std = Math.sqrt(
        qAvgs.reduce((a, b) => a + Math.pow(b.avg - leagueMean, 2), 0) / qAvgs.length
      );

      qAvgs.forEach(({ team, avg }) => {
        if (avg > leagueMean + 1.8 * std && avg >= 84) {
          list.push({
            id: `super-team-${team.puntero}`,
            level: 'INFO',
            title: `Super-Equipo Dominante: ${team.nombreCorto} (${avg})`,
            description: `Su media de quinteto (${avg}) supera ampliamente el promedio de la liga (${Math.round(leagueMean)}). Puede restar competitividad a la simulación.`,
            affectedTeam: team,
            metric: `Media ${avg}`,
          });
        } else if (avg < leagueMean - 1.8 * std && avg <= 50) {
          list.push({
            id: `deflated-team-${team.puntero}`,
            level: 'WARNING',
            title: `Equipo Descolgado: ${team.nombreCorto} (${avg})`,
            description: `Su media está muy por debajo de la media liguera (${Math.round(leagueMean)}). Corre riesgo de perder la mayoría de partidos por tanteos irreales.`,
            affectedTeam: team,
            metric: `Media ${avg}`,
          });
        }
      });
    }

    // 4. Player Attribute Extremes / Anomalies
    teams.forEach((t) => {
      (t.plantilla || []).forEach((p) => {
        const rating = calculateMediaQuinteto(p.medias);
        if (rating >= 96) {
          list.push({
            id: `god-player-${p.puntero}`,
            level: 'INFO',
            title: `Jugador Estrella Extrema: ${p.nombreCorto} (${t.nombreCorto})`,
            description: `Tiene una media de quinteto de ${rating}/99. En PC Basket 6.0 valores superiores a 95 pueden generar estadísticas de juego anormales.`,
            affectedTeam: t,
            affectedPlayer: p,
            metric: `Media ${rating}`,
          });
        }
        if (p.medias.tiro3 === 0 && (p.demarcacion === 0 || p.demarcacion === 1)) {
          list.push({
            id: `zero-3pt-${p.puntero}`,
            level: 'INFO',
            title: `Exterior con 0 en Triples: ${p.nombreCorto} (${t.nombreCorto})`,
            description: `Jugador de perímetro (${POSITION_SHORT[p.demarcacion]}) con valor 0 en tiro de tres puntos.`,
            affectedTeam: t,
            affectedPlayer: p,
          });
        }
      });
    });

    return list;
  }, [teams]);

  // Top 5 and Bottom 5 outliers for selected attribute
  const extremeOutliers = useMemo(() => {
    if (allPlayersWithTeam.length === 0) return { top: [], bottom: [] };
    const sorted = [...allPlayersWithTeam].sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, 6);
    const bottom = [...sorted].reverse().slice(0, 6);
    return { top, bottom };
  }, [allPlayersWithTeam]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#142343] via-[#1a2e56] to-[#223b6e] border-2 border-[#ffce42]/40 shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-[#ffce42]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#ffce42] font-bold flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Auditoría & Análisis de Liga
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-300 font-mono">
                {teams.length} Equipos · {leagueStats.count} Jugadores
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Dashboard de Estadísticas y Balance
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-light">
              Visualiza mediante gráficos de barras la distribución de medias y atributos en toda la competición.
              Detecta equipos descompensados, plantillas desequilibradas y anomalías estadísticas antes de jugar.
            </p>
          </div>

          {/* League Balance Indicator Card */}
          <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 shrink-0 shadow-lg min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#ffce42]" />
                Índice de Balance
              </span>
              <span className="font-mono text-xs font-bold text-[#ffce42]">
                σ = {leagueBalanceReport.index}
              </span>
            </div>
            <div className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                leagueBalanceReport.index <= 4.0 ? 'bg-emerald-400' :
                leagueBalanceReport.index <= 7.0 ? 'bg-blue-400' :
                leagueBalanceReport.index <= 10.0 ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              {leagueBalanceReport.status}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {leagueBalanceReport.desc}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: League Mean */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Promedio de Liga</span>
            <Target className="w-4 h-4 text-[#ffce42]" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">
              {leagueStats.mean} <span className="text-xs font-normal text-slate-400">{currentAttr.unit}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Mediana: <strong className="text-slate-200">{leagueStats.median}</strong></span>
              <span>·</span>
              <span>σ = <strong className="text-slate-200">{leagueStats.stdDev}</strong></span>
            </div>
          </div>
        </div>

        {/* Metric 2: Range Min / Max */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rango Registrado</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400">
              {leagueStats.min} - {leagueStats.max} <span className="text-xs font-normal text-slate-400">{currentAttr.unit}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Amplitud: <strong className="text-slate-200">{leagueStats.max - leagueStats.min} {currentAttr.unit}</strong>
            </div>
          </div>
        </div>

        {/* Metric 3: Best Team in Attr */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Líder en Atributo</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            {sortedTeamAverages.length > 0 ? (
              <>
                <div className="text-xl font-black text-[#ffce42] truncate">
                  {sortedTeamAverages[0].team.nombreCorto}
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                  <span className="font-bold text-white">{sortedTeamAverages[0].avg} {currentAttr.unit}</span>
                  <span className="text-emerald-400 text-[11px]">(+{Math.round((sortedTeamAverages[0].avg - leagueStats.mean) * 10) / 10})</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">Sin datos</div>
            )}
          </div>
        </div>

        {/* Metric 4: Anomalies Found */}
        <div 
          onClick={() => setActiveTab('diagnostics')}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-amber-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Desbalances & Avisos</span>
            <AlertTriangle className={`w-4 h-4 ${anomalies.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
          </div>
          <div>
            <div className="text-3xl font-black text-amber-400 group-hover:scale-105 transition-transform origin-left">
              {anomalies.length}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>{anomalies.filter((a) => a.level === 'CRITICAL').length} críticos</span>
              <span className="text-[#ffce42] text-[11px] font-medium group-hover:underline">Ver alertas →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Control Panel: Attribute Selector & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Atributo o Métrica a Analizar
            </label>
            <div className="flex items-center gap-3">
              <select
                value={selectedAttrKey}
                onChange={(e) => setSelectedAttrKey(e.target.value as AttributeKey)}
                className="bg-slate-800 border-2 border-slate-700 text-white font-bold rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#ffce42] transition-colors cursor-pointer shadow-inner min-w-[240px]"
              >
                <optgroup label="Valoraciones Generales">
                  <option value="mediaQuinteto">Media Quinteto (General)</option>
                  <option value="mediaPlantilla">Media Plantilla</option>
                </optgroup>
                <optgroup label="Tiro y Anotación">
                  <option value="tiro2">Tiro de 2</option>
                  <option value="tiro3">Tiro de 3 (Triples)</option>
                  <option value="tiroL">Tiro Libre</option>
                </optgroup>
                <optgroup label="Defensa y Rebote">
                  <option value="defensa">Defensa</option>
                  <option value="rebotes">Rebotes</option>
                  <option value="agresividad">Agresividad</option>
                </optgroup>
                <optgroup label="Juego y Físico">
                  <option value="asistencias">Asistencias</option>
                  <option value="velocidad">Velocidad</option>
                  <option value="salto">Salto</option>
                  <option value="resistencia">Resistencia</option>
                </optgroup>
                <optgroup label="Métricas Físicas y Demográficas">
                  <option value="altura">Altura (cm)</option>
                  <option value="peso">Peso (kg)</option>
                  <option value="edad">Edad Estimada</option>
                </optgroup>
              </select>
              <span className="text-xs text-slate-400 hidden sm:inline">
                {currentAttr.description}
              </span>
            </div>
          </div>

          {/* Positional Filter */}
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Filtrar por Demarcación
            </label>
            <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setPositionFilter('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  positionFilter === 'ALL'
                    ? 'bg-[#ffce42] text-black font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Todas
              </button>
              {[0, 1, 2, 3, 4].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos as Demarcacion)}
                  className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                    positionFilter === pos
                      ? 'bg-[#ffce42] text-black font-bold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {POSITION_SHORT[pos as Demarcacion]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'distribution'
                  ? 'bg-gradient-to-r from-[#ffce42] to-amber-500 text-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              1. Distribución Global (Histograma)
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'teams'
                  ? 'bg-gradient-to-r from-[#ffce42] to-amber-500 text-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              2. Comparativa por Equipos ({teams.length})
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'positions'
                  ? 'bg-gradient-to-r from-[#ffce42] to-amber-500 text-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              3. Por Posición
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'diagnostics'
                  ? 'bg-gradient-to-r from-[#ffce42] to-amber-500 text-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              4. Detector de Desbalances ({anomalies.length})
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Mostrando datos de <strong className="text-white">{allPlayersWithTeam.length}</strong> jugadores
          </div>
        </div>
      </div>

      {/* TAB 1: Global Distribution Histogram */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Histograma de Distribución Liguera: {currentAttr.label}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Frecuencia de jugadores agrupados por rangos de valor. Una campana equilibrada concentra la mayoría en valores medios (50-70).
                </p>
              </div>

              {/* Reference Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-400" />
                  <span className="text-slate-300">Rango Ideal ({currentAttr.idealRange[0]}-{currentAttr.idealRange[1]})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-slate-300">Promedio de Liga ({leagueStats.mean})</span>
                </div>
              </div>
            </div>

            {/* Vertical Bar Chart Container */}
            <div className="pt-8 pb-4">
              <div className="h-64 sm:h-72 flex items-end gap-3 sm:gap-6 border-b-2 border-slate-700 px-2 sm:px-6 relative">
                {/* Visual horizontal guide lines */}
                <div className="absolute inset-x-0 top-0 border-t border-slate-800/80 text-[10px] text-slate-600 pl-1 pointer-events-none">
                  {maxHistogramCount} jug.
                </div>
                <div className="absolute inset-x-0 top-1/2 border-t border-slate-800/60 text-[10px] text-slate-600 pl-1 pointer-events-none">
                  {Math.round(maxHistogramCount / 2)} jug.
                </div>

                {/* Bars */}
                {histogramBins.map((bin) => {
                  const heightPercent = Math.max(4, Math.round((bin.count / maxHistogramCount) * 100));
                  const isHovered = hoveredBin === bin.id;
                  const isMeanBin =
                    leagueStats.mean >= bin.range[0] && leagueStats.mean <= bin.range[1];

                  // Bar color styling
                  let barGradient = 'from-blue-600 to-blue-500';
                  if (bin.range[0] >= 90) {
                    barGradient = 'from-amber-500 to-yellow-400';
                  } else if (bin.range[1] < 35) {
                    barGradient = 'from-rose-600 to-red-500';
                  } else if (isMeanBin) {
                    barGradient = 'from-emerald-500 to-teal-400';
                  }

                  return (
                    <div
                      key={bin.id}
                      onMouseEnter={() => setHoveredBin(bin.id)}
                      onMouseLeave={() => setHoveredBin(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute bottom-full mb-2 z-30 bg-slate-950 border border-[#ffce42] rounded-lg p-3 shadow-2xl text-center min-w-[160px] pointer-events-none animate-in fade-in zoom-in-95">
                          <div className="text-xs font-bold text-[#ffce42] mb-1">
                            Rango: {bin.label}
                          </div>
                          <div className="text-lg font-black text-white">
                            {bin.count} jugadores
                          </div>
                          <div className="text-[11px] text-slate-300">
                            {bin.percentage}% de la liga
                          </div>
                          {bin.players.length > 0 && (
                            <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-800 pt-1.5 truncate max-w-[200px]">
                              Ej: {bin.players.slice(0, 3).map((p) => p.player.nombreCorto).join(', ')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Count label above bar */}
                      <span className={`text-[11px] font-bold mb-1.5 transition-all ${
                        isHovered ? 'text-[#ffce42] scale-110' : 'text-slate-300'
                      }`}>
                        {bin.count}
                      </span>

                      {/* The Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[56px] rounded-t-lg bg-gradient-to-t ${barGradient} transition-all duration-300 shadow-md ${
                          isHovered
                            ? 'brightness-125 ring-2 ring-[#ffce42]'
                            : 'hover:brightness-110'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X Axis Labels */}
              <div className="flex gap-3 sm:gap-6 px-2 sm:px-6 pt-3 text-center">
                {histogramBins.map((bin) => {
                  const isMeanBin =
                    leagueStats.mean >= bin.range[0] && leagueStats.mean <= bin.range[1];
                  return (
                    <div key={bin.id} className="flex-1 text-center">
                      <div className={`text-[11px] font-semibold tracking-tight ${
                        isMeanBin ? 'text-[#ffce42] font-black' : 'text-slate-400'
                      }`}>
                        {bin.label}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {bin.percentage}%
                      </div>
                      {isMeanBin && (
                        <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-tighter mt-0.5">
                          Media
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Analysis interpretation callout */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#ffce42] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Interpretación de Balance:</strong> El promedio general se sitúa en{' '}
                <strong className="text-[#ffce42]">{leagueStats.mean} {currentAttr.unit}</strong> con una desviación estándar de{' '}
                <strong className="text-white">{leagueStats.stdDev}</strong>. Un valor de desviación entre 5.0 y 8.5 indica una distribución
                saludable y realista según el motor de cálculo de Dinamic Multimedia para PC Basket 6.0 / 6.5.
              </div>
            </div>
          </div>

          {/* Drilldown: Top & Bottom Outliers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top 6 Leaders */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Máximos Valores ({currentAttr.label})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Top 6</span>
              </div>

              <div className="space-y-2">
                {extremeOutliers.top.map(({ player, team, value }, idx) => (
                  <div
                    key={player.puntero}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center text-xs font-bold text-[#ffce42]">
                        #{idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {player.nombreLargo}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{team.nombreCorto}</span>
                          <span>·</span>
                          <span>{POSITION_SHORT[player.demarcacion]}</span>
                          <span>·</span>
                          <span>Dorsal {player.dorsal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black text-amber-400">
                          {value} <span className="text-[10px] font-normal text-slate-400">{currentAttr.unit}</span>
                        </div>
                      </div>
                      {onEditPlayer && (
                        <button
                          onClick={() => onEditPlayer(player, () => {})}
                          title="Editar atributos de este jugador"
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 6 Lagging */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Mínimos Valores ({currentAttr.label})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Últimos 6</span>
              </div>

              <div className="space-y-2">
                {extremeOutliers.bottom.map(({ player, team, value }, idx) => (
                  <div
                    key={player.puntero}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center text-xs font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {player.nombreLargo}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{team.nombreCorto}</span>
                          <span>·</span>
                          <span>{POSITION_SHORT[player.demarcacion]}</span>
                          <span>·</span>
                          <span>Dorsal {player.dorsal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-300">
                          {value} <span className="text-[10px] font-normal text-slate-400">{currentAttr.unit}</span>
                        </div>
                      </div>
                      {onEditPlayer && (
                        <button
                          onClick={() => onEditPlayer(player, () => {})}
                          title="Editar atributos de este jugador"
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Team-by-Team Bar Chart Comparison */}
      {activeTab === 'teams' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Ranking Comparativo por Equipos: {currentAttr.label}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gráfico de barras horizontales comparando el valor medio de cada franquicia frente al promedio de la liga ({leagueStats.mean}).
              </p>
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Ordenar:</span>
              <select
                value={teamSortOrder}
                onChange={(e) => setTeamSortOrder(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#ffce42]"
              >
                <option value="DESC">Mayor a Menor (Líderes)</option>
                <option value="ASC">Menor a Mayor (Colistas)</option>
                <option value="DISPARITY">Mayor Desviación (Desbalance)</option>
                <option value="ALPHA">Alfabético</option>
              </select>
            </div>
          </div>

          {/* Horizontal Bar Chart List */}
          <div className="space-y-3 pt-2">
            {sortedTeamAverages.map(({ team, avg, count, min, max, diffFromLeague }, index) => {
              // Percentage calculation for the bar width (0 to 100)
              const maxRef = Math.max(100, currentAttr.max);
              const barWidthPercent = Math.min(100, Math.max(8, Math.round((avg / maxRef) * 100)));
              
              // Color coding based on relation to league average
              const isHigh = diffFromLeague >= 4.0;
              const isLow = diffFromLeague <= -4.0;
              const isCriticalLow = diffFromLeague <= -8.0;

              let barColor = 'from-blue-600 to-blue-500';
              if (isHigh) barColor = 'from-amber-500 to-yellow-400';
              if (isLow) barColor = 'from-indigo-600 to-blue-500';
              if (isCriticalLow) barColor = 'from-rose-600 to-amber-600';

              return (
                <div
                  key={team.puntero}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-center text-xs font-mono font-bold text-slate-400 group-hover:text-[#ffce42]">
                        #{index + 1}
                      </span>
                      <div className="truncate">
                        <span className="text-sm font-bold text-white group-hover:text-[#ffce42] transition-colors cursor-pointer"
                          onClick={() => onSelectTeam && onSelectTeam(team)}
                        >
                          {team.nombreLargo}
                        </span>
                        <span className="text-xs text-slate-400 ml-2 font-mono">
                          ({team.nombreCorto})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div className="text-xs text-slate-400 hidden sm:block">
                        Rango: <span className="text-slate-300 font-mono">{min} - {max}</span> ({count} jug.)
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white font-mono">
                          {avg} <span className="text-xs font-normal text-slate-400">{currentAttr.unit}</span>
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                            diffFromLeague > 0
                              ? 'text-emerald-400 bg-emerald-950/60'
                              : diffFromLeague < 0
                              ? 'text-rose-400 bg-rose-950/60'
                              : 'text-slate-400 bg-slate-800'
                          }`}
                        >
                          {diffFromLeague > 0 ? `+${diffFromLeague}` : diffFromLeague}
                        </span>
                      </div>

                      {onSelectTeam && (
                        <button
                          onClick={() => onSelectTeam(team)}
                          title="Inspeccionar equipo"
                          className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                        >
                          Abrir
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Bar with League Average Marker */}
                  <div className="relative h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    {/* The Team Value Bar */}
                    <div
                      style={{ width: `${barWidthPercent}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                    />
                    
                    {/* Visual League Mean Marker Line */}
                    <div
                      style={{ left: `${Math.round((leagueStats.mean / maxRef) * 100)}%` }}
                      title={`Media de la Liga (${leagueStats.mean})`}
                      className="absolute inset-y-0 w-0.5 bg-white/70 z-10 shadow"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Distribution by Demarcation / Position */}
      {activeTab === 'positions' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Comparativa por Posición: {currentAttr.label}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Promedio de cada demarcación sobre todos los equipos registrados. Permite verificar que las posiciones cumplan con su perfil táctico esperado en PC Basket.
            </p>
          </div>

          {/* Bar Cards for each position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {positionAverages.map(({ pos, name, short, avg, count }) => {
              const diffFromMean = Math.round((avg - leagueStats.mean) * 10) / 10;
              const barHeight = Math.max(10, Math.min(100, Math.round((avg / (currentAttr.max || 100)) * 100)));

              return (
                <div
                  key={pos}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between text-center relative overflow-hidden"
                >
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#ffce42] mb-1">
                      {short}
                    </div>
                    <div className="text-[11px] text-slate-400 mb-3">
                      {count} jugadores evaluados
                    </div>

                    <div className="text-3xl font-black text-white mb-1">
                      {avg} <span className="text-xs font-normal text-slate-400">{currentAttr.unit}</span>
                    </div>

                    <div className="text-xs font-mono font-medium mb-4">
                      {diffFromMean > 0 ? (
                        <span className="text-emerald-400">+{diffFromMean} sobre media</span>
                      ) : diffFromMean < 0 ? (
                        <span className="text-rose-400">{diffFromMean} bajo media</span>
                      ) : (
                        <span className="text-slate-400">= Promedio</span>
                      )}
                    </div>
                  </div>

                  {/* Vertical mini bar preview */}
                  <div className="h-24 bg-slate-900 rounded-lg p-1.5 flex flex-col justify-end items-center border border-slate-800/80">
                    <div
                      style={{ height: `${barHeight}%` }}
                      className="w-full max-w-[40px] rounded bg-gradient-to-t from-blue-600 to-[#ffce42] transition-all duration-500 shadow"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setPositionFilter(pos);
                      setActiveTab('teams');
                    }}
                    className="mt-4 text-[11px] text-[#ffce42] hover:underline font-semibold"
                  >
                    Filtrar solo {short}s →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: League Diagnostics & Unbalance Detector */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Detector de Desbalances y Reglas de Competición</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Análisis automático de toda la base de datos para prevenir cierres involuntarios, ligas ficticias y diferencias deportivas desproporcionadas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-md bg-rose-950/60 text-rose-300 border border-rose-500/30 font-medium">
                  {anomalies.filter((a) => a.level === 'CRITICAL').length} Críticos
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/30 font-medium">
                  {anomalies.filter((a) => a.level === 'WARNING').length} Advertencias
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-blue-950/60 text-blue-300 border border-blue-500/30 font-medium">
                  {anomalies.filter((a) => a.level === 'INFO').length} Info
                </span>
              </div>
            </div>

            {/* Anomalies List */}
            {anomalies.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/40 rounded-xl border border-dashed border-emerald-500/30 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">
                  ¡Base de Datos de Liga Perfectamente Equilibrada!
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No se detectaron plantillas incompletas, posiciones ausentes ni valores extremos fuera de los límites de PC Basket.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.map((item) => {
                  let badgeBg = 'bg-blue-500/10 border-blue-500/30 text-blue-400';
                  let icon = <Info className="w-4 h-4 text-blue-400 shrink-0" />;

                  if (item.level === 'CRITICAL') {
                    badgeBg = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
                    icon = <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
                  } else if (item.level === 'WARNING') {
                    badgeBg = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
                    icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
                  }

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${badgeBg} bg-slate-950/60`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{icon}</div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.metric && (
                              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-black/40 text-slate-200 border border-white/10">
                                {item.metric}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {item.affectedTeam && onSelectTeam && (
                          <button
                            onClick={() => onSelectTeam(item.affectedTeam!)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium border border-slate-700 transition-colors"
                          >
                            Editar Plantilla
                          </button>
                        )}
                        {item.affectedPlayer && onEditPlayer && (
                          <button
                            onClick={() => onEditPlayer(item.affectedPlayer!, () => {})}
                            className="px-3 py-1.5 rounded-lg bg-[#ffce42] hover:brightness-110 text-xs text-black font-bold transition-all"
                          >
                            Ajustar Jugador
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

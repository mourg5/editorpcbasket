import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MainMenuView } from './components/MainMenuView';
import { TeamsView } from './components/TeamsView';
import { PlayersDirectoryView } from './components/PlayersDirectoryView';
import { StatsDashboardView } from './components/StatsDashboardView';
import { ManagerView } from './components/ManagerView';
import { SettingsView } from './components/SettingsView';
import { TeamEditorModal } from './components/TeamEditorModal';
import { PlayerEditorModal } from './components/PlayerEditorModal';
import { ProballersImportModal } from './components/ProballersImportModal';
import { StorageService } from './services/storageService';
import { Equipo, Jugador, Settings, NavigationView } from './types/pcbasket';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavigationView>('MainMenuView');
  const [history, setHistory] = useState<NavigationView[]>(['MainMenuView']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [teams, setTeams] = useState<Equipo[]>([]);
  const [settings, setSettings] = useState<Settings>(StorageService.getSettings());

  // Active Modals
  const [editingTeam, setEditingTeam] = useState<Equipo | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<{
    player: Jugador;
    onSaveCallback: (p: Jugador) => void;
  } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadedTeams = StorageService.getTeams();
    setTeams(loadedTeams);
    const loadedSettings = StorageService.getSettings();
    setSettings(loadedSettings);
  }, []);

  const navigateTo = (view: NavigationView) => {
    if (view === currentView) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(view);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentView(history[newIndex]);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentView(history[newIndex]);
    }
  };

  const handleSaveTeam = (updatedTeam: Equipo) => {
    const newTeams = StorageService.saveTeam(updatedTeam);
    setTeams(newTeams);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (puntero: number) => {
    const newTeams = StorageService.deleteTeam(puntero);
    setTeams(newTeams);
    if (editingTeam?.puntero === puntero) {
      setEditingTeam(null);
    }
  };

  const handleCreateTeam = () => {
    const maxPuntero =
      teams.length > 0 ? Math.max(...teams.map((t) => t.puntero)) : 100;
    const newPuntero = maxPuntero + 1;

    const newTeam: Equipo = {
      equipoId: newPuntero,
      puntero: newPuntero,
      nombreCorto: 'NUEVO EQ',
      nombreLargo: 'NUEVO EQUIPO',
      pabellon: 'Pabellón Municipal',
      aforo: 4000,
      presupuesto: 600,
      entrenador: 'Entrenador',
      pais: 22,
      plantilla: [],
    };

    setEditingTeam(newTeam);
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleResetDatabase = () => {
    const initial = StorageService.resetDatabase();
    setTeams(initial);
  };

  const handleClearDatabase = () => {
    const empty = StorageService.clearDatabase();
    setTeams(empty);
  };

  const handleBatchMovePlayers = (
    playerPunteros: number[],
    targetTeamPuntero: number
  ) => {
    setTeams((prevTeams) => {
      const targetTeam = prevTeams.find((t) => t.puntero === targetTeamPuntero);
      if (!targetTeam) return prevTeams;

      const playersToMove: Jugador[] = [];
      const updatedTeams = prevTeams.map((team) => {
        if (team.puntero === targetTeamPuntero) return team;
        const remaining = team.plantilla.filter((p) => {
          if (playerPunteros.includes(p.puntero)) {
            playersToMove.push({ ...p, equipoPuntero: targetTeamPuntero });
            return false;
          }
          return true;
        });
        return { ...team, plantilla: remaining };
      });

      // Target team used dorsals
      const usedDorsals = new Set(
        updatedTeams
          .find((t) => t.puntero === targetTeamPuntero)!
          .plantilla.map((p) => p.dorsal)
      );

      const adjustedPlayersToMove = playersToMove.map((player) => {
        let dorsal = player.dorsal;
        if (usedDorsals.has(dorsal)) {
          for (let d = 4; d <= 99; d++) {
            if (!usedDorsals.has(d)) {
              dorsal = d;
              break;
            }
          }
        }
        usedDorsals.add(dorsal);
        return { ...player, dorsal, equipoPuntero: targetTeamPuntero };
      });

      const finalTeams = updatedTeams.map((team) => {
        if (team.puntero === targetTeamPuntero) {
          return {
            ...team,
            plantilla: [...team.plantilla, ...adjustedPlayersToMove],
          };
        }
        return team;
      });

      StorageService.saveTeams(finalTeams);

      // Keep editingTeam in sync if open
      if (editingTeam) {
        const refreshed = finalTeams.find((t) => t.puntero === editingTeam.puntero);
        if (refreshed) {
          setEditingTeam(refreshed);
        }
      }

      return finalTeams;
    });
  };

  const totalPlayers = teams.reduce(
    (acc, t) => acc + (t.plantilla?.length || 0),
    0
  );

  const nextTeamPointer =
    teams.length > 0 ? Math.max(...teams.map((t) => t.puntero)) + 1 : 101;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col selection:bg-[#ffce42] selection:text-black">
      {/* Header Bar */}
      <Header
        currentView={currentView}
        onNavigate={navigateTo}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        teamCount={teams.length}
        playerCount={totalPlayers}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'MainMenuView' && (
          <MainMenuView
            onNavigate={navigateTo}
            teams={teams}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}

        {currentView === 'TeamsView' && (
          <TeamsView
            teams={teams}
            onSelectTeam={(t) => setEditingTeam(t)}
            onCreateTeam={handleCreateTeam}
            onDeleteTeam={handleDeleteTeam}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onTeamImportedFromDbc={(importedTeam) => {
              const updated = StorageService.saveTeam(importedTeam);
              setTeams(updated);
              setEditingTeam(importedTeam);
            }}
            startingYear={settings.startingYear}
            useCotNationality={settings.useCotNationality}
            useEurNationality={settings.useEurNationality}
          />
        )}

        {currentView === 'PlayersView' && (
          <PlayersDirectoryView
            teams={teams}
            onEditPlayer={(player, onSaveCallback) =>
              setEditingPlayer({ player, onSaveCallback })
            }
            onSelectTeam={(team) => {
              setEditingTeam(team);
              navigateTo('TeamsView');
            }}
            onBatchMovePlayers={handleBatchMovePlayers}
            startingYear={settings.startingYear}
            useCotNationality={settings.useCotNationality}
            useEurNationality={settings.useEurNationality}
          />
        )}

        {currentView === 'StatsDashboardView' && (
          <StatsDashboardView
            teams={teams}
            onSelectTeam={(team) => {
              setEditingTeam(team);
            }}
            onEditPlayer={(player, onSaveCallback) =>
              setEditingPlayer({ player, onSaveCallback })
            }
            onNavigate={navigateTo}
            startingYear={settings.startingYear}
          />
        )}

        {currentView === 'ManagerView' && (
          <ManagerView
            teams={teams}
            startingYear={settings.startingYear}
            onUpdateStartingYear={(year) => {
              const updated = { ...settings, startingYear: year };
              handleSaveSettings(updated);
            }}
          />
        )}

        {currentView === 'SettingsView' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            teams={teams}
            onResetDatabase={handleResetDatabase}
            onClearDatabase={handleClearDatabase}
            onNavigateHome={() => navigateTo('MainMenuView')}
          />
        )}
      </main>

      {/* Team Editor Modal */}
      {editingTeam && (
        <TeamEditorModal
          team={editingTeam}
          onSave={handleSaveTeam}
          onClose={() => setEditingTeam(null)}
          onDelete={handleDeleteTeam}
          onEditPlayer={(player, onPlayerSave) => {
            setEditingPlayer({
              player,
              onSaveCallback: (updatedP) => {
                onPlayerSave(updatedP);
              },
            });
          }}
          startingYear={settings.startingYear}
          useCotNationality={settings.useCotNationality}
          useEurNationality={settings.useEurNationality}
        />
      )}

      {/* Player Editor Modal */}
      {editingPlayer && (
        <PlayerEditorModal
          player={editingPlayer.player}
          onSave={(updatedPlayer) => {
            editingPlayer.onSaveCallback(updatedPlayer);

            // Also synchronize in the main teams state if needed
            setTeams((prevTeams) => {
              const copy = prevTeams.map((t) => ({
                ...t,
                plantilla: t.plantilla.map((j) =>
                  j.puntero === updatedPlayer.puntero ? updatedPlayer : j
                ),
              }));
              StorageService.saveTeams(copy);
              return copy;
            });

            setEditingPlayer(null);
          }}
          onClose={() => setEditingPlayer(null)}
        />
      )}

      {/* Proballers Import Modal */}
      {isImportModalOpen && (
        <ProballersImportModal
          nextTeamPointer={nextTeamPointer}
          onClose={() => setIsImportModalOpen(false)}
          onImportTeam={(newTeam) => {
            const updated = StorageService.saveTeam(newTeam);
            setTeams(updated);
            setEditingTeam(newTeam);
          }}
        />
      )}

      {/* Footer bar */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div>
          <span>Editor PC Basket &copy; {new Date().getFullYear()}</span> &bull;{' '}
          <span className="text-slate-400">Creado originalmente por Mou</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <span>Formato .DBC Dinamic Multimedia</span>
          <span>&bull;</span>
          <span>Tablas de atributos 0-99</span>
        </div>
      </footer>
    </div>
  );
};

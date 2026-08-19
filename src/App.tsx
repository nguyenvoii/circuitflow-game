/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Zap, AlertTriangle, Battery, TrendingUp, Home, RefreshCw, Shield } from 'lucide-react';

// Game types and interfaces
interface GameState {
  energy: number;
  maxEnergy: number;
  energyPerClick: number;
  stability: number;
  maxStability: number;
  cityBrightness: number;
  generators: number;
  batteries: number;
  gridSize: number;
  isPlaying: boolean;
  gameOver: boolean;
  score: number;
  time: number;
  lastEventTime: number;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  effect: () => void;
  purchased: boolean;
}

interface GameEvent {
  id: string;
  name: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  effect: () => void;
}

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    energy: 50,
    maxEnergy: 100,
    energyPerClick: 5,
    stability: 100,
    maxStability: 100,
    cityBrightness: 100,
    generators: 1,
    batteries: 0,
    gridSize: 1,
    isPlaying: true,
    gameOver: false,
    score: 0,
    time: 0,
    lastEventTime: 0,
  });

  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [energyHistory, setEnergyHistory] = useState<number[]>([]);
  const [showEffects, setShowEffects] = useState<boolean[]>([]);

  // Available upgrades
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: 'generator2',
      name: 'Máy Phát 2.0',
      description: 'Tăng năng lượng mỗi lần nhấn (+3)',
      cost: 100,
      icon: <Zap className="w-5 h-5" />,
      effect: () => {
        setGameState(prev => ({ ...prev, energyPerClick: prev.energyPerClick + 3 }));
      },
      purchased: false,
    },
    {
      id: 'battery1',
      name: 'Ắc Quy Dự Phòng',
      description: 'Tăng dung lượng tối đa (+50)',
      cost: 150,
      icon: <Battery className="w-5 h-5" />,
      effect: () => {
        setGameState(prev => ({ ...prev, maxEnergy: prev.maxEnergy + 50 }));
      },
      purchased: false,
    },
    {
      id: 'grid1',
      name: 'Lưới Điện Cao Thế',
      description: 'Tăng độ ổn định tối đa (+20)',
      cost: 200,
      icon: <TrendingUp className="w-5 h-5" />,
      effect: () => {
        setGameState(prev => ({ ...prev, maxStability: prev.maxStability + 20 }));
      },
      purchased: false,
    },
    {
      id: 'generator3',
      name: 'Máy Phát 3.0',
      description: 'Tăng năng lượng mỗi lần nhấn (+5)',
      cost: 250,
      icon: <Zap className="w-5 h-5" />,
      effect: () => {
        setGameState(prev => ({ ...prev, energyPerClick: prev.energyPerClick + 5 }));
      },
      purchased: false,
    },
    {
      id: 'battery2',
      name: 'Hệ Thống Ắc Quy',
      description: 'Tăng dung lượng tối đa (+100)',
      cost: 300,
      icon: <Battery className="w-5 h-5" />,
      effect: () => {
        setGameState(prev => ({ ...prev, maxEnergy: prev.maxEnergy + 100 }));
      },
      purchased: false,
    },
    {
      id: 'grid2',
      name: 'Lưới Điện Thông Minh',
      description: 'Tăng độ ổn định tối đa (+30)',
      cost: 350,
      icon: <Shield className="w-5 h-5" />,
      effect: () => {
        setGameState(prev => ({ ...prev, maxStability: prev.maxStability + 30 }));
      },
      purchased: false,
    },
  ]);

  // Random events
  const randomEvents: GameEvent[] = [
    {
      id: 'storm',
      name: 'Bão Điện',
      description: 'Mất 15 năng lượng và 10 độ ổn định',
      severity: 'mild',
      effect: () => {
        setGameState(prev => ({
          ...prev,
          energy: Math.max(0, prev.energy - 15),
          stability: Math.max(0, prev.stability - 10),
        }));
      },
    },
    {
      id: 'overload',
      name: 'Quá Tải',
      description: 'Mất 20 năng lượng và 15 độ ổn định',
      severity: 'moderate',
      effect: () => {
        setGameState(prev => ({
          ...prev,
          energy: Math.max(0, prev.energy - 20),
          stability: Math.max(0, prev.stability - 15),
        }));
      },
    },
    {
      id: 'breaker',
      name: 'Cầu Dao Nhảy',
      description: 'Mất 25 năng lượng và 20 độ ổn định',
      severity: 'severe',
      effect: () => {
        setGameState(prev => ({
          ...prev,
          energy: Math.max(0, prev.energy - 25),
          stability: Math.max(0, prev.stability - 20),
        }));
      },
    },
    {
      id: 'powerSurge',
      name: 'Đột Quên Năng Lượng',
      description: 'Nhận +30 năng lượng',
      severity: 'mild',
      effect: () => {
        setGameState(prev => ({
          ...prev,
          energy: Math.min(prev.maxEnergy, prev.energy + 30),
        }));
      },
    },
  ];

  // Click handler for generating power
  const handlePowerClick = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    setGameState(prev => {
      const newEnergy = Math.min(prev.maxEnergy, prev.energy + prev.energyPerClick);
      const newScore = prev.score + 1;
      return {
        ...prev,
        energy: newEnergy,
        score: newScore,
      };
    });

    // Show visual effect
    setShowEffects(prev => [...prev, true]);
    setTimeout(() => {
      setShowEffects(prev => prev.slice(1));
    }, 500);
  }, [gameState.isPlaying, gameState.gameOver]);

  // Purchase upgrade
  const purchaseUpgrade = useCallback((upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.purchased || gameState.score < upgrade.cost) return;

    upgrade.effect();
    setUpgrades(prev =>
      prev.map(u => (u.id === upgradeId ? { ...u, purchased: true } : u))
    );
    setGameState(prev => ({ ...prev, score: prev.score - upgrade.cost }));
  }, [upgrades, gameState.score]);

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        // Energy decay over time
        const energyDecay = 0.5 + (prev.generators * 0.2);
        const stabilityDecay = 0.3;

        let newEnergy = Math.max(0, prev.energy - energyDecay);
        let newStability = Math.max(0, prev.stability - stabilityDecay);
        let newCityBrightness = Math.min(100, (newEnergy / prev.maxEnergy) * 100);

        // Check for random events
        let shouldTriggerEvent = false;
        let selectedEvent: GameEvent | null = null;

        if (prev.time - prev.lastEventTime > 10 && Math.random() < 0.1) {
          shouldTriggerEvent = true;
          selectedEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        }

        // Check game over conditions
        const isGameOver = newStability <= 0 || newEnergy <= 0;

        return {
          ...prev,
          energy: newEnergy,
          stability: newStability,
          cityBrightness: newCityBrightness,
          time: prev.time + 1,
          lastEventTime: shouldTriggerEvent ? prev.time : prev.lastEventTime,
          gameOver: isGameOver,
          isPlaying: !isGameOver,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.gameOver]);

  // Update energy history for chart
  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    const interval = setInterval(() => {
      setEnergyHistory(prev => {
        const newHistory = [...prev, gameState.energy];
        return newHistory.slice(-20); // Keep last 20 readings
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.energy, gameState.isPlaying, gameState.gameOver]);

  // Trigger random events
  useEffect(() => {
    if (gameState.lastEventTime === gameState.time && gameState.time > 0) {
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      setActiveEvent(event);
      event.effect();

      setTimeout(() => setActiveEvent(null), 3000);
    }
  }, [gameState.lastEventTime, gameState.time]);

  // Restart game
  const restartGame = () => {
    setGameState({
      energy: 50,
      maxEnergy: 100,
      energyPerClick: 5,
      stability: 100,
      maxStability: 100,
      cityBrightness: 100,
      generators: 1,
      batteries: 0,
      gridSize: 1,
      isPlaying: true,
      gameOver: false,
      score: 0,
      time: 0,
      lastEventTime: 0,
    });
    setUpgrades(upgrades.map(u => ({ ...u, purchased: false })));
    setEnergyHistory([]);
    setActiveEvent(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 circuit-grid-dark text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              CircuitFlow
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="text-slate-400">Thời gian:</span>
              <span className="ml-2 font-mono text-cyan-400">{Math.floor(gameState.time / 10)}s</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-400">Điểm:</span>
              <span className="ml-2 font-mono text-yellow-400">{gameState.score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Stats Display */}
        <div className="grid grid-cols-2 gap-4">
          {/* Energy Bar */}
          <div className="bg-slate-900/60 rounded-lg p-4 border border-cyan-500/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Năng Lượng</span>
              <span className="text-sm font-mono text-cyan-400">
                {Math.round(gameState.energy)}/{gameState.maxEnergy}
              </span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${(gameState.energy / gameState.maxEnergy) * 100}%` }}
              />
            </div>
          </div>

          {/* Stability Bar */}
          <div className="bg-slate-900/60 rounded-lg p-4 border border-green-500/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Độ Ổn Định</span>
              <span className="text-sm font-mono text-green-400">
                {Math.round(gameState.stability)}/{gameState.maxStability}
              </span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  gameState.stability > 60
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : gameState.stability > 30
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                }`}
                style={{ width: `${(gameState.stability / gameState.maxStability) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Energy Chart */}
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/30">
          <h3 className="text-sm text-slate-400 mb-3">Biểu Đồ Năng Lượng</h3>
          <div className="flex items-end gap-1 h-20">
            {energyHistory.map((energy, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all duration-300"
                style={{
                  height: `${(energy / gameState.maxEnergy) * 100}%`,
                  opacity: 0.3 + (index / energyHistory.length) * 0.7,
                }}
              />
            ))}
            {energyHistory.length === 0 && (
              <div className="flex-1 text-center text-slate-500 text-sm py-8">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* Power Generation Control */}
        <div className="bg-slate-900/60 rounded-lg p-6 border border-yellow-500/30">
          <div className="text-center">
            <button
              onClick={handlePowerClick}
              disabled={!gameState.isPlaying || gameState.gameOver}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-yellow-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-full border-2 border-cyan-500/50 group-hover:border-cyan-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                <Zap className="w-16 h-16 text-cyan-400 group-hover:text-yellow-400 transition-colors" />
                <div className="text-xs text-slate-400 mt-2">
                  +{gameState.energyPerClick} năng lượng
                </div>
              </div>
              {showEffects.map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-spark"
                />
              ))}
            </button>
            <p className="text-sm text-slate-400 mt-4">
              Nhấn để tạo năng lượng
            </p>
          </div>
        </div>

        {/* Upgrades Panel */}
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            Nâng Cấp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upgrades.map((upgrade) => (
              <button
                key={upgrade.id}
                onClick={() => purchaseUpgrade(upgrade.id)}
                disabled={upgrade.purchased || gameState.score < upgrade.cost || !gameState.isPlaying}
                className={`p-4 rounded-lg border transition-all text-left ${
                  upgrade.purchased
                    ? 'bg-green-900/20 border-green-500/30 opacity-60'
                    : gameState.score >= upgrade.cost
                    ? 'bg-slate-800/60 border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-800/80'
                    : 'bg-slate-800/30 border-slate-700/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    upgrade.purchased ? 'bg-green-500/20' : 'bg-cyan-500/20'
                  }`}>
                    {upgrade.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{upgrade.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{upgrade.description}</div>
                    <div className="mt-2 text-xs font-mono">
                      {upgrade.purchased ? (
                        <span className="text-green-400">Đã mua</span>
                      ) : (
                        <span className={gameState.score >= upgrade.cost ? 'text-yellow-400' : 'text-slate-500'}>
                          {upgrade.cost} điểm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* City View */}
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/30">
          <h3 className="text-sm text-slate-400 mb-3 flex items-center gap-2">
            <Home className="w-4 h-4" />
            Thành Phố
          </h3>
          <div
            className="relative h-32 rounded-lg overflow-hidden transition-all duration-500"
            style={{
              backgroundColor: `rgba(15, 23, 42, ${1 - gameState.cityBrightness / 100})`,
            }}
          >
            {/* City Buildings */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around p-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((building) => (
                <div
                  key={building}
                  className="relative"
                  style={{
                    width: `${20 + Math.random() * 30}px`,
                    height: `${40 + Math.random() * 60}px`,
                  }}
                >
                  {/* Building structure */}
                  <div
                    className="absolute inset-0 bg-slate-700 rounded-t transition-all duration-300"
                    style={{
                      opacity: 0.3 + (gameState.cityBrightness / 100) * 0.7,
                    }}
                  />
                  {/* Windows */}
                  <div className="absolute inset-2 grid grid-cols-2 gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-sm transition-all duration-300"
                        style={{
                          backgroundColor: Math.random() > 0.3 ? '#ffd700' : '#1e293b',
                          opacity: gameState.cityBrightness / 100,
                          boxShadow: Math.random() > 0.3
                            ? `0 0 ${gameState.cityBrightness / 10}px rgba(255, 215, 0, 0.5)`
                            : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* City brightness indicator */}
            <div className="absolute top-2 right-2 text-xs text-slate-400">
              Độ sáng: {Math.round(gameState.cityBrightness)}%
            </div>
          </div>
        </div>

        {/* Active Event Alert */}
        {activeEvent && (
          <div
            className={`bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 border-2 ${
              activeEvent.severity === 'mild'
                ? 'border-yellow-500/50'
                : activeEvent.severity === 'moderate'
                ? 'border-orange-500/50'
                : 'border-red-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle
                className={`w-6 h-6 ${
                  activeEvent.severity === 'mild'
                    ? 'text-yellow-400'
                    : activeEvent.severity === 'moderate'
                    ? 'text-orange-400'
                    : 'text-red-400'
                }`}
              />
              <div>
                <div className="font-semibold">{activeEvent.name}</div>
                <div className="text-sm text-slate-400">{activeEvent.description}</div>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState.gameOver && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-lg p-8 max-w-md w-full mx-4 border border-red-500/30">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-400 mb-2">Hết Điện!</h2>
                <p className="text-slate-400 mb-6">
                  {gameState.stability <= 0 ? 'Hệ thống mất ổn định!' : 'Năng lượng đã cạn kiệt!'}
                </p>
                <div className="bg-slate-800 rounded-lg p-4 mb-6">
                  <div className="text-sm text-slate-400 mb-1">Thời gian tồn tại</div>
                  <div className="text-3xl font-mono text-cyan-400">{Math.floor(gameState.time / 10)}s</div>
                  <div className="text-sm text-slate-400 mt-3 mb-1">Điểm tối đa</div>
                  <div className="text-3xl font-mono text-yellow-400">{gameState.score}</div>
                </div>
                <button
                  onClick={restartGame}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Chơi Lại
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!gameState.gameOver && gameState.time === 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/30 text-sm">
          <h3 className="font-semibold text-cyan-400 mb-2">Cách Chơi</h3>
          <ul className="space-y-1 text-slate-300">
            <li>⚡ Nhấn nút để tạo năng lượng</li>
            <li>📈 Mua nâng cấp để cải thiện hệ thống</li>
            <li>🏠 Giữ thành phố sáng đèn</li>
            <li>⚠️ Tránh sự kiện và mất ổn định</li>
          </ul>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Trophy, Target, MapPin, Clock, Zap, Route, Plus, Filter, Medal, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

// Tipos para o sistema de rastreamento
interface RunningSession {
  id: string;
  type: 'running' | 'walking';
  date: string;
  duration: number; // em segundos
  distance: number; // em metros
  averagePace: number; // em minutos por km
  calories: number;
  route: { lat: number; lng: number; timestamp: number }[];
  notes?: string;
  completed: boolean;
}

interface Goal {
  id: string;
  type: 'distance' | 'time' | 'frequency';
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  completed: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
}

const RunningTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState('track');
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activityType, setActivityType] = useState<'running' | 'walking'>('running');
  const [currentSession, setCurrentSession] = useState<Partial<RunningSession>>({
    duration: 0,
    distance: 0,
    averagePace: 0,
    calories: 0,
    route: []
  });
  const [sessions, setSessions] = useState<RunningSession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showNewGoal, setShowNewGoal] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Inicializar dados do localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('playfit-running-sessions');
    const savedGoals = localStorage.getItem('playfit-running-goals');
    const savedAchievements = localStorage.getItem('playfit-running-achievements');
    
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
    
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Metas padrão
      setGoals([
        {
          id: '1',
          type: 'distance',
          title: 'Correr 5 km',
          target: 5000,
          current: 0,
          unit: 'm',
          completed: false
        },
        {
          id: '2',
          type: 'frequency',
          title: 'Correr 3 vezes por semana',
          target: 3,
          current: 0,
          unit: 'vezes',
          completed: false
        }
      ]);
    }
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      // Conquistas padrão
      setAchievements([
        {
          id: '1',
          title: 'Primeiro Passo',
          description: 'Complete sua primeira corrida',
          icon: '🏃‍♂️',
          unlocked: false,
          progress: 0,
          target: 1
        },
        {
          id: '2',
          title: 'Maratonista',
          description: 'Corra 10 km em uma única sessão',
          icon: '🏅',
          unlocked: false,
          progress: 0,
          target: 10000
        },
        {
          id: '3',
          title: 'Consistência',
          description: 'Corra 5 dias seguidos',
          icon: '🔥',
          unlocked: false,
          progress: 0,
          target: 5
        }
      ]);
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('playfit-running-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('playfit-running-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('playfit-running-achievements', JSON.stringify(achievements));
  }, [achievements]);

  // Função para iniciar o rastreamento
  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada pelo navegador');
      return;
    }

    setIsTracking(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    
    // Resetar sessão atual
    setCurrentSession({
      duration: 0,
      distance: 0,
      averagePace: 0,
      calories: 0,
      route: []
    });

    // Iniciar rastreamento de localização
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now()
        };
        
        setCurrentSession(prev => ({
          ...prev,
          route: [...(prev.route || []), newPoint]
        }));
      },
      (error) => {
        console.error('Erro de geolocalização:', error);
        toast.error('Erro ao acessar localização');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    // Iniciar cronômetro
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        const now = Date.now();
        const elapsed = (now - (startTimeRef.current || 0) - pausedTimeRef.current) / 1000;
        
        setCurrentSession(prev => {
          const distance = calculateDistance(prev.route || []);
          const pace = distance > 0 ? (elapsed / 60) / (distance / 1000) : 0;
          const calories = calculateCalories(distance, elapsed, activityType);
          
          return {
            ...prev,
            duration: elapsed,
            distance,
            averagePace: pace,
            calories
          };
        });
      }
    }, 1000);

    toast.success(`${activityType === 'running' ? 'Corrida' : 'Caminhada'} iniciada!`);
  };

  // Função para pausar/retomar
  const togglePause = () => {
    if (isPaused) {
      // Retomar
      setIsPaused(false);
      startTimeRef.current = Date.now() - (currentSession.duration || 0) * 1000;
      toast.success('Atividade retomada!');
    } else {
      // Pausar
      setIsPaused(true);
      pausedTimeRef.current += Date.now() - (startTimeRef.current || 0);
      toast.info('Atividade pausada');
    }
  };

  // Função para finalizar
  const finishTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const newSession: RunningSession = {
      id: Date.now().toString(),
      type: activityType,
      date: new Date().toISOString(),
      duration: currentSession.duration || 0,
      distance: currentSession.distance || 0,
      averagePace: currentSession.averagePace || 0,
      calories: currentSession.calories || 0,
      route: currentSession.route || [],
      completed: true
    };

    setSessions(prev => [newSession, ...prev]);
    checkAchievements(newSession);
    updateGoals(newSession);
    
    setIsTracking(false);
    setIsPaused(false);
    
    toast.success('Sessão finalizada com sucesso!');
  };

  // Calcular distância baseada na rota
  const calculateDistance = (route: { lat: number; lng: number; timestamp: number }[]) => {
    if (route.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < route.length; i++) {
      const prev = route[i - 1];
      const curr = route[i];
      
      // Fórmula de Haversine para calcular distância
      const R = 6371000; // Raio da Terra em metros
      const dLat = (curr.lat - prev.lat) * Math.PI / 180;
      const dLng = (curr.lng - prev.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(prev.lat * Math.PI / 180) * Math.cos(curr.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      totalDistance += distance;
    }
    
    return totalDistance;
  };

  // Calcular calorias estimadas
  const calculateCalories = (distance: number, duration: number, type: 'running' | 'walking') => {
    const distanceKm = distance / 1000;
    const durationHours = duration / 3600;
    const weight = 70; // Peso médio em kg
    
    let met = type === 'running' ? 8.0 : 3.8; // METs para corrida e caminhada
    return Math.round(met * weight * durationHours);
  };

  // Verificar conquistas
  const checkAchievements = (session: RunningSession) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let progress = achievement.progress;
      
      switch (achievement.id) {
        case '1': // Primeiro Passo
          progress = sessions.length + 1;
          break;
        case '2': // Maratonista
          progress = Math.max(progress, session.distance);
          break;
        case '3': // Consistência
          // Verificar dias consecutivos
          const sortedSessions = [...sessions, session].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          let consecutive = 1;
          for (let i = 1; i < sortedSessions.length; i++) {
            const curr = new Date(sortedSessions[i-1].date);
            const prev = new Date(sortedSessions[i].date);
            const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays <= 1) consecutive++;
            else break;
          }
          progress = consecutive;
          break;
      }
      
      const unlocked = progress >= achievement.target;
      if (unlocked && !achievement.unlocked) {
        toast.success(`🏆 Conquista desbloqueada: ${achievement.title}!`);
      }
      
      return {
        ...achievement,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date().toISOString() : undefined
      };
    }));
  };

  // Atualizar progresso das metas
  const updateGoals = (session: RunningSession) => {
    setGoals(prev => prev.map(goal => {
      if (goal.completed) return goal;
      
      let current = goal.current;
      
      switch (goal.type) {
        case 'distance':
          current += session.distance;
          break;
        case 'time':
          current += session.duration;
          break;
        case 'frequency':
          current += 1;
          break;
      }
      
      const completed = current >= goal.target;
      if (completed && !goal.completed) {
        toast.success(`🎯 Meta alcançada: ${goal.title}!`);
      }
      
      return { ...goal, current, completed };
    }));
  };

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatar distância
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  // Formatar ritmo
  const formatPace = (pace: number) => {
    if (pace === 0 || !isFinite(pace)) return '0:00';
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🏃‍♂️ Rastreamento de Corrida
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="track">Rastrear</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="track" className="mt-6">
            <div className="space-y-6">
              {/* Seletor de atividade */}
              {!isTracking && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Escolha sua atividade</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={activityType === 'running' ? 'default' : 'outline'}
                      onClick={() => setActivityType('running')}
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <span className="text-2xl mb-2">🏃‍♂️</span>
                      Corrida
                    </Button>
                    <Button
                      variant={activityType === 'walking' ? 'default' : 'outline'}
                      onClick={() => setActivityType('walking')}
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <span className="text-2xl mb-2">🚶‍♂️</span>
                      Caminhada
                    </Button>
                  </div>
                </Card>
              )}

              {/* Métricas em tempo real */}
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatTime(currentSession.duration || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Tempo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatDistance(currentSession.distance || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Distância</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatPace(currentSession.averagePace || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Ritmo/km</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {currentSession.calories || 0}
                    </div>
                    <div className="text-sm text-gray-600">Calorias</div>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex justify-center gap-4">
                  {!isTracking ? (
                    <Button
                      onClick={startTracking}
                      className="px-8 py-3 text-lg"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Iniciar {activityType === 'running' ? 'Corrida' : 'Caminhada'}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={togglePause}
                        variant="outline"
                        size="lg"
                        className="px-6"
                      >
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      </Button>
                      <Button
                        onClick={finishTracking}
                        variant="destructive"
                        size="lg"
                        className="px-6"
                      >
                        <Square className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                </div>

                {isTracking && (
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-600">
                      {isPaused ? 'Pausado' : 'Rastreando...'}
                    </div>
                  </div>
                )}
              </Card>

              {/* Mapa simulado */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Trajeto</h3>
                <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p>Mapa aparecerá aqui</p>
                    <p className="text-sm">
                      Pontos registrados: {currentSession.route?.length || 0}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Histórico de Sessões</h2>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
              </div>

              {sessions.length === 0 ? (
                <Card className="p-8 text-center">
                  <Route className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhuma sessão registrada ainda</p>
                  <p className="text-sm text-gray-500">Inicie sua primeira corrida na aba "Rastrear"</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <Card key={session.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {session.type === 'running' ? '🏃‍♂️' : '🚶‍♂️'}
                          </span>
                          <div>
                            <div className="font-semibold">
                              {session.type === 'running' ? 'Corrida' : 'Caminhada'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(session.date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {formatDistance(session.distance)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                          <div className="font-semibold">{formatTime(session.duration)}</div>
                          <div className="text-xs text-gray-600">Tempo</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{formatPace(session.averagePace)}</div>
                          <div className="text-xs text-gray-600">Ritmo</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{session.calories}</div>
                          <div className="text-xs text-gray-600">Calorias</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Metas</h2>
                <Button onClick={() => setShowNewGoal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Meta
                </Button>
              </div>

              {goals.length === 0 ? (
                <Card className="p-8 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhuma meta definida</p>
                  <p className="text-sm text-gray-500">Crie suas primeiras metas para se motivar</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <Card key={goal.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold">{goal.title}</div>
                          <div className="text-sm text-gray-600">
                            {goal.current.toFixed(goal.type === 'distance' ? 0 : 1)} / {goal.target} {goal.unit}
                          </div>
                        </div>
                        {goal.completed && (
                          <Badge className="bg-green-100 text-green-800">
                            Concluída
                          </Badge>
                        )}
                      </div>
                      
                      <Progress 
                        value={(goal.current / goal.target) * 100} 
                        className="mb-2"
                      />
                      
                      <div className="text-sm text-gray-600">
                        {((goal.current / goal.target) * 100).toFixed(1)}% concluído
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Conquistas</h2>
              
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`p-4 ${achievement.unlocked ? 'bg-yellow-50 border-yellow-200' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className="text-3xl opacity-70">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{achievement.title}</div>
                            <div className="text-sm text-gray-600">{achievement.description}</div>
                          </div>
                          {achievement.unlocked && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Trophy className="w-3 h-3 mr-1" />
                              Desbloqueada
                            </Badge>
                          )}
                        </div>
                        
                        <Progress 
                          value={(achievement.progress / achievement.target) * 100} 
                          className="mb-2"
                        />
                        
                        <div className="text-sm text-gray-600">
                          {achievement.progress} / {achievement.target}
                        </div>
                        
                        {achievement.unlocked && achievement.unlockedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Button
            variant={activeTab === 'track' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('track')}
            className="flex-1 flex flex-col items-center py-2"
          >
            <Play className="w-5 h-5 mb-1" />
            <span className="text-xs">Rastrear</span>
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className="flex-1 flex flex-col items-center py-2"
          >
            <Clock className="w-5 h-5 mb-1" />
            <span className="text-xs">Histórico</span>
          </Button>
          <Button
            variant={activeTab === 'goals' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('goals')}
            className="flex-1 flex flex-col items-center py-2"
          >
            <Target className="w-5 h-5 mb-1" />
            <span className="text-xs">Metas</span>
          </Button>
          <Button
            variant={activeTab === 'achievements' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('achievements')}
            className="flex-1 flex flex-col items-center py-2"
          >
            <Trophy className="w-5 h-5 mb-1" />
            <span className="text-xs">Conquistas</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RunningTracker; 
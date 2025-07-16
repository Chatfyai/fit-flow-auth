import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, TrendingUp, LogOut, Dumbbell, Clock, Plus, User, Edit2, Trophy, Award, Footprints, CalendarCheck, Flame, Target } from 'lucide-react';
import { Exercise, WorkoutDay, WeeklySchedule, Workout } from '@/types/workout';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { ProgressIndicator, LoadingSpinner } from '@/components/ui/progress-indicator';
import { Typewriter } from '@/components/ui/typewriter';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { getCurrentLocalDate, dateToLocalDateString } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface WorkoutSession {
  id: string;
  date: string;
  duration: number | null;
  workout_id: string | null;
  notes?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [todaysWorkout, setTodaysWorkout] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentlyCompletedDate, setRecentlyCompletedDate] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);


  // Usar dados reais apenas se logado, caso contrário usar arrays vazios
  const finalWorkoutSessions = user ? workoutSessions : [];
  const finalTodaysWorkout = user ? todaysWorkout : [];

  const fetchData = async () => {
    if (!user) {
      // Se não estiver logado, apenas define loading como false
      setLoading(false);
      return;
    }
    
    try {
      // Calcular início da semana atual para garantir que incluímos todas as sessões relevantes
      const today = new Date();
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(today.getDate() - daysToSubtract);
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Buscar sessões das últimas 4 semanas para garantir que temos dados suficientes
      const fourWeeksAgo = new Date(startOfWeek);
      fourWeeksAgo.setDate(startOfWeek.getDate() - 28);
      
      // Fetch workout sessions das últimas 4 semanas (formato YYYY-MM-DD)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .gte('date', dateToLocalDateString(fourWeeksAgo))
        .lte('date', getCurrentLocalDate())
        .order('date', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching workout sessions:', sessionsError);
      } else {
        setWorkoutSessions(sessionsData || []);
        if (user) {
          console.log('📅 Sessões das últimas 4 semanas carregadas:', sessionsData?.length || 0);
          console.log('🗓️ Período buscado:', dateToLocalDateString(fourWeeksAgo), 'até', getCurrentLocalDate());
        }
      }

      // Fetch workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (workoutsError) {
        console.error('Error fetching workouts:', workoutsError);
      } else {
        if (user) {
          console.log('Fetched workouts:', workoutsData);
        }
        // Convert the Json types to our frontend types
        const typedWorkouts: Workout[] = (workoutsData || []).map(workout => ({
          ...workout,
          workout_days: (workout.workout_days as any) || [],
          weekly_schedule: (workout.weekly_schedule as any) || {}
        }));
        setWorkouts(typedWorkouts);
        
        // Calculate today's workout
        calculateTodaysWorkout(typedWorkouts);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Atualizar dados automaticamente quando voltar para o dashboard
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        console.log('🔄 Atualizando dados ao retornar para a página...');
        fetchData();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('🔄 Página ficou visível, atualizando dados...');
        fetchData();
      }
    };

    // Verificar se o usuário acabou de completar um treino
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'workout_completed' && user) {
        console.log('🏆 Treino completado detectado, atualizando dados...');
        
        // Marcar a data de hoje como recém-completada
        const todayString = getCurrentLocalDate();
        setRecentlyCompletedDate(todayString);
        
        // Remover o destaque após 5 segundos
        setTimeout(() => {
          setRecentlyCompletedDate(null);
        }, 5000);
        
        setTimeout(() => {
          fetchData();
          localStorage.removeItem('workout_completed');
        }, 1000);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const calculateTodaysWorkout = (workouts: Workout[]) => {
    const today = new Date();
    const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const todayName = dayNames[today.getDay()];

    // Find active workouts (not expired)
    const activeWorkouts = workouts.filter(workout => {
      if (!workout.expiration_date) return true;
      return new Date(workout.expiration_date) >= today;
    });

    if (activeWorkouts.length === 0) {
      setTodaysWorkout([]);
      return;
    }

    // Get the most recent active workout
    const currentWorkout = activeWorkouts[0];
    const todayLetters = currentWorkout.weekly_schedule[todayName] || [];
    
    if (todayLetters.length === 0) {
      setTodaysWorkout([]);
      return;
    }

    // Find the workout days for today
    const todayWorkoutDays = todayLetters.map(letter => 
      currentWorkout.workout_days.find(day => day.letter === letter)
    ).filter(Boolean) as WorkoutDay[];

    setTodaysWorkout(todayWorkoutDays);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Helper function to get exercise display text
  const getExerciseDisplay = (exercise: Exercise | any) => {
    if (exercise.series && exercise.repetitions) {
      return `${exercise.series} séries de ${exercise.repetitions}`;
    }
    // Fallback for old format
    if (exercise.sets) {
      return exercise.sets;
    }
    return 'Séries não definidas';
  };

  const thisWeekSessions = user ? finalWorkoutSessions.filter(session => {
    // Normalizar a data da sessão para comparação
    const sessionDateString = session.date.split('T')[0]; // Pegar apenas YYYY-MM-DD
    const sessionDate = new Date(sessionDateString + 'T12:00:00'); // Meio-dia para evitar problemas de fuso horário
    
    const today = new Date();
    
    // Calcular início da semana (segunda-feira)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Se for domingo, volta 6 dias; senão volta (dia - 1)
    startOfWeek.setDate(today.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calcular fim da semana (domingo)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Segunda + 6 dias = domingo
    endOfWeek.setHours(23, 59, 59, 999);
    
    const isInThisWeek = sessionDate >= startOfWeek && sessionDate <= endOfWeek;
    
    // Debug: Log das sessões para verificar se estão sendo contadas corretamente
    if (isInThisWeek && user) {
      console.log('📊 Sessão desta semana encontrada:', {
        originalDate: session.date,
        sessionDateString: sessionDateString,
        sessionDate: sessionDate.toLocaleDateString('pt-BR'),
        startOfWeek: `Segunda ${startOfWeek.toLocaleDateString('pt-BR')}`,
        endOfWeek: `Domingo ${endOfWeek.toLocaleDateString('pt-BR')}`,
        workout_id: session.workout_id
      });
    }
    
    return isInThisWeek;
  }) : [];

  // Calcular quantos dias da semana estão programados para treinar
  const getWeeklyGoal = () => {
    if (!user) return 5; // Para usuários não logados, mostrar meta padrão
    
    const activeWorkouts = workouts.filter(workout => {
      if (!workout.expiration_date) return true;
      return new Date(workout.expiration_date) >= new Date();
    });

    if (activeWorkouts.length === 0) return 5; // Meta padrão se não houver workouts

    const currentWorkout = activeWorkouts[0];
    if (!currentWorkout.weekly_schedule) return 5; // Fallback padrão

    // Contar quantos dias da semana têm treinos programados
    const daysWithWorkouts = Object.values(currentWorkout.weekly_schedule)
      .filter((dayLetters: any) => Array.isArray(dayLetters) && dayLetters.length > 0).length;
    
    return daysWithWorkouts || 5; // Fallback se não houver dias programados
  };

  // Função para buscar a última meta alcançada
  const getLastCompletedGoal = () => {
    try {
      // Buscar da chave correta que inclui o ID do usuário
      const savedGoals = localStorage.getItem(`user_goals_${user?.id || 'anonymous'}`);
      if (!savedGoals) return null;
      
      const goals = JSON.parse(savedGoals);
      const completedGoals = goals.filter((goal: any) => goal.completed);
      
      if (completedGoals.length === 0) return null;
      
      // Ordenar por data de conclusão (mais recente primeiro)
      const lastCompleted = completedGoals.sort((a: any, b: any) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.id).getTime();
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.id).getTime();
        return dateB - dateA;
      })[0];
      
      return lastCompleted;
    } catch (error) {
      console.error('Erro ao buscar última meta alcançada:', error);
      return null;
    }
  };

  // Função para obter os últimos emblemas conquistados
  const getRecentBadges = () => {
    const badges = [];
    const today = new Date();

    // Só processar badges se o usuário estiver logado
    if (!user) return [];

    // Primeiro Passo - Completou pelo menos 1 treino
    if (totalWorkouts >= 1) {
      const firstWorkout = workoutSessions.length > 0 ? workoutSessions[0] : null;
      badges.push({
        id: 'primeiro-passo',
        title: 'Primeiro Passo',
        icon: <Footprints />,
        achieved: true,
        date: firstWorkout?.date || today.toISOString().split('T')[0]
      });
    }

    // Início Forte - Completou pelo menos 3 treinos
    if (totalWorkouts >= 3) {
      const thirdWorkout = workoutSessions.length >= 3 ? workoutSessions[2] : null;
      badges.push({
        id: 'inicio-forte',
        title: 'Início Forte',
        icon: <Flame />,
        achieved: true,
        date: thirdWorkout?.date || today.toISOString().split('T')[0]
      });
    }

    // Semana Perfeita - Atingiu a meta semanal
    if (thisWeekSessions.length >= weeklyGoal && weeklyGoal > 0) {
      const lastSessionThisWeek = thisWeekSessions.length > 0 ? thisWeekSessions[thisWeekSessions.length - 1] : null;
      badges.push({
        id: 'semana-perfeita',
        title: 'Semana Perfeita',
        icon: <CalendarCheck />,
        achieved: true,
        date: lastSessionThisWeek?.date || today.toISOString().split('T')[0]
      });
    }

    // Compromisso Dourado - Completou pelo menos 10 treinos
    if (totalWorkouts >= 10) {
      const tenthWorkout = workoutSessions.length >= 10 ? workoutSessions[9] : null;
      badges.push({
        id: 'compromisso-dourado',
        title: 'Compromisso Dourado',
        icon: <Trophy />,
        achieved: true,
        date: tenthWorkout?.date || today.toISOString().split('T')[0]
      });
    }

    // Hábito Criado - Completou pelo menos 21 treinos (formar hábito)
    if (totalWorkouts >= 21) {
      const twentyFirstWorkout = workoutSessions.length >= 21 ? workoutSessions[20] : null;
      badges.push({
        id: 'habito-criado',
        title: 'Hábito Criado',
        icon: <Target />,
        achieved: true,
        date: twentyFirstWorkout?.date || today.toISOString().split('T')[0]
      });
    }

    // Filtrar apenas emblemas conquistados, ordenar por data e retornar os 3 mais recentes
    return badges
      .filter(badge => badge.achieved)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  };

  // Mensagens motivacionais aleatórias
  const getMotivationalMessage = () => {
    const messages = [
      "Parabéns! Continue assim! 🔥",
      "Você está arrasando! 💪",
      "Meta conquistada com sucesso! 🎯",
      "Seu esforço está valendo a pena! ⭐",
      "Conquista desbloqueada! 🏆",
      "Você é imparável! 🚀",
      "Objetivo alcançado! Continue focado! 👏"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const totalWorkouts = user ? workoutSessions.length : 0;
  const weeklyGoal = getWeeklyGoal();
  const progressPercentage = user && weeklyGoal > 0 ? Math.min((thisWeekSessions.length / weeklyGoal) * 100, 100) : 0;

  // Debug: Log do progresso semanal (apenas se logado)
  if (user) {
    console.log('📈 Progresso Semanal:', {
      thisWeekSessions: thisWeekSessions.length,
      weeklyGoal,
      progressPercentage: Math.round(progressPercentage),
      totalSessions: totalWorkouts,
      allSessions: workoutSessions.map(s => ({ date: s.date, workout_id: s.workout_id })),
      filteredThisWeek: thisWeekSessions.map(s => ({ date: s.date, workout_id: s.workout_id }))
    });

    // Debug adicional: Log das sessões da semana atual
    console.log('🗓️ Sessões desta semana:', thisWeekSessions.length);
    console.log('🎯 Meta semanal:', weeklyGoal);
    console.log('📊 Porcentagem:', Math.round(progressPercentage), '%');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 pb-20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mr-3">
                <PlayFitLogo size="md" className="text-yellow-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PlayFit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                {user ? `Olá, ${user?.user_metadata?.full_name || user?.email}!` : 'Visitante - Faça login para salvar seu progresso'}
              </span>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* Vamos treinar + nome do usuário */}
          <div className="mb-6 text-center">
            <p className="text-lg md:text-xl lg:text-2xl text-gray-700 font-medium flex items-center justify-center flex-wrap">
              <span>Vamos dar um play no treino</span>
              <Typewriter
                text={user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Visitante'}
                speed={100}
                loop={false}
                showCursor={true}
                cursorChar={"💪"}
                className="text-yellow-500 font-bold ml-2"
                waitTime={3000}
              />
            </p>
            {!user && (
              <p className="text-sm text-gray-500 mt-2">
                Esta é uma demonstração. Faça login para salvar seu progresso real!
              </p>
            )}
          </div>
          
          {/* Removido título Painel e subtítulo de progresso */}

        </div>

        {/* Botão Play no treino - agora acima do progresso */}
        <div className="flex justify-center my-8">
          <div className="relative w-full max-w-xl flex items-center justify-center">
            {/* Linha animada ao redor do botão */}
            <span className="pointer-events-none absolute inset-0 z-10 rounded-2xl" aria-hidden="true">
              <span className="block w-full h-full rounded-2xl border-2 border-yellow-400 animate-border-move" style={{ borderColor: '#FFD65A', borderStyle: 'solid', borderWidth: '2px' }}></span>
            </span>
            <button
              className="w-full text-black font-bold px-8 py-4 rounded-2xl shadow-lg text-lg uppercase focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-300 relative z-20"
              style={{ backgroundColor: '#FFD65A', fontWeight: 700 }}
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                const currentWorkout = workouts.find(workout => {
                  if (!workout.expiration_date) return true;
                  return new Date(workout.expiration_date) >= new Date();
                });
                navigate('/treino-do-dia', {
                  state: {
                    workoutDays: finalTodaysWorkout,
                    date: new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    workoutId: currentWorkout?.id
                  }
                });
              }}
            >
              <span className="flex items-center justify-center gap-3">
                PLAY NO TREINO
              </span>
            </button>
          </div>
        </div>

        {/* Tailwind custom animation (adicione no tailwind.config.js):
        'border-move': {
          '0%': { borderImageSource: 'linear-gradient(90deg, #FFD65A 0%, transparent 100%)', borderImageSlice: 1 },
          '25%': { borderImageSource: 'linear-gradient(180deg, #FFD65A 0%, transparent 100%)', borderImageSlice: 1 },
          '50%': { borderImageSource: 'linear-gradient(270deg, #FFD65A 0%, transparent 100%)', borderImageSlice: 1 },
          '75%': { borderImageSource: 'linear-gradient(360deg, #FFD65A 0%, transparent 100%)', borderImageSlice: 1 },
          '100%': { borderImageSource: 'linear-gradient(90deg, #FFD65A 0%, transparent 100%)', borderImageSlice: 1 },
        }
        Duração sugerida: 4s linear infinite
        */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-xl transition-all duration-300 ease-out">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Progresso Semanal</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-3">{Math.round(progressPercentage)}%</div>
              <ProgressIndicator 
                value={thisWeekSessions.length} 
                max={weeklyGoal} 
                size="md"
                className="mb-2"
              />
              <p className="text-xs text-gray-500">
                {thisWeekSessions.length} de {weeklyGoal} treinos semanais
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 ease-out">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Últimos Emblemas</CardTitle>
              <Award className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {(() => {
                if (!user) {
                  return (
                    <>
                      <div className="text-lg font-bold text-gray-900 mb-2">Nenhum emblema conquistado</div>
                      <p className="text-xs text-gray-500">
                        Faça login e comece a treinar para conquistar emblemas! 🏆
                      </p>
                    </>
                  );
                }

                const recentBadges = getRecentBadges();
                if (recentBadges.length === 0) {
                  return (
                    <>
                      <div className="text-lg font-bold text-gray-900 mb-2">Nenhum emblema conquistado</div>
                      <p className="text-xs text-gray-500">
                        Comece a treinar para conquistar emblemas! 🏆
                      </p>
                    </>
                  );
                }
                
                // Garantir que sempre temos 3 slots, preenchendo com "Em Processo" se necessário
                const badgeSlots = [...recentBadges];
                while (badgeSlots.length < 3) {
                  badgeSlots.push({
                    id: `placeholder-${badgeSlots.length}`,
                    title: 'Em Processo',
                    icon: <Trophy />,
                    achieved: false,
                    date: ''
                  });
                }
                
                // Descrições dos emblemas
                const badgeDescriptions: Record<string, string> = {
                  'primeiro-passo': 'Conquiste ao completar seu primeiro treino!',
                  'inicio-forte': 'Conquiste ao completar 3 treinos.',
                  'semana-perfeita': 'Conquiste ao atingir sua meta semanal de treinos.',
                  'compromisso-dourado': 'Conquiste ao completar 10 treinos.',
                  'habito-criado': 'Conquiste ao completar 21 treinos e criar o hábito!',
                };

                return (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      {badgeSlots.map((badge, index) => (
                        <div key={badge.id} className="flex flex-col items-center text-center flex-1">
                          <button
                            type="button"
                            disabled={!badge.achieved}
                            onClick={() => badge.achieved && setSelectedBadge(badge)}
                            className="focus:outline-none"
                            style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
                          >
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center mb-2" 
                              style={{ backgroundColor: badge.achieved ? '#FFD65A' : '#D1D5DB' }}
                            >
                              {React.cloneElement(badge.icon as React.ReactElement, { 
                                className: "w-6 h-6",
                                style: { color: badge.achieved ? '#8B4513' : '#9CA3AF' }
                              })}
                            </div>
                          </button>
                          <div className={`text-xs font-medium ${badge.achieved ? 'text-gray-900' : 'text-gray-500'}`}>
                            {badge.title}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{selectedBadge?.title}</DialogTitle>
                          <DialogDescription>
                            {selectedBadge?.achieved && selectedBadge?.date && (
                              <div className="mb-2">Conquistado em: {selectedBadge.date}</div>
                            )}
                            {badgeDescriptions[selectedBadge?.id as string] || 'Continue treinando para desbloquear este emblema!'}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 ease-out">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Frequência do Mês</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {(() => {
                const [tooltip, setTooltip] = React.useState<{show: boolean, x: number, y: number, content: string}>({
                  show: false, x: 0, y: 0, content: ''
                });

                const today = new Date();
                const month = today.getMonth();
                const year = today.getFullYear();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                // Função para verificar se há treino registrado em uma data específica
                const hasWorkoutOnDate = (dateString: string) => {
                  if (!user || finalWorkoutSessions.length === 0) {
                    // Para usuários não autenticados ou sem sessões, não mostrar dados fictícios
                    return false;
                  }

                  const hasSession = finalWorkoutSessions.some(session => {
                    const sessionDateString = session.date.split('T')[0]; // Pega apenas a data (YYYY-MM-DD)
                    return sessionDateString === dateString;
                  });
                  
                  // Debug log para acompanhar quais dias têm treino
                  if (hasSession && user) {
                    console.log(`✅ Treino encontrado para ${dateString}`);
                  }
                  
                  return hasSession;
                };

                const showTooltip = (e: React.MouseEvent, day: number) => {
                  const dayDate = new Date(year, month, day);
                  const dateString = dateToLocalDateString(dayDate);
                  const hasTrained = hasWorkoutOnDate(dateString);
                  const status = hasTrained ? 'Treino concluído ✅' : 'Nenhum treino ⭕';
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    show: true,
                    x: rect.left + window.scrollX,
                    y: rect.bottom + window.scrollY + 5,
                    content: `${dayDate.toLocaleDateString('pt-BR')}<br/>${status}`
                  });
                };

                const hideTooltip = () => setTooltip(prev => ({ ...prev, show: false }));

                // Debug: Mostrar todas as sessões do mês (apenas se logado)
                if (user) {
                  console.log('📅 Todas as sessões do mês:', finalWorkoutSessions.map(s => ({
                    date: s.date.split('T')[0],
                    workout_id: s.workout_id
                  })));
                }

                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayDate = new Date(year, month, day);
                        const dateString = dateToLocalDateString(dayDate);
                        const hasTrained = hasWorkoutOnDate(dateString);
                        const isToday = day === today.getDate();
                        
                        // Só mostrar dias do passado e hoje (não dias futuros)
                        const dayTimestamp = dayDate.getTime();
                        const todayTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
                        const isFutureDay = dayTimestamp > todayTimestamp;
                        
                        // Verificar se esta data é a recém-completada
                        const isRecentlyCompleted = recentlyCompletedDate === dateString;
                        
                        return (
                          <div
                            key={day}
                            className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-semibold ${
                              isFutureDay 
                                ? 'bg-gray-100 border border-gray-200 text-gray-400' // Dias futuros
                                : hasTrained 
                                  ? isRecentlyCompleted 
                                    ? 'bg-yellow-400 text-white shadow-lg animate-pulse border-2 border-yellow-300' // Recém-completado - amarelo brilhante pulsante
                                    : 'bg-yellow-500 text-white' // Treinou - amarelo normal
                                  : 'bg-gray-300 text-gray-600'   // Não treinou - cinza
                            } ${isToday ? 'border-2 border-yellow-600' : ''} transition-all duration-300`}
                            onMouseEnter={(e) => showTooltip(e, day)}
                            onMouseLeave={hideTooltip}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-sm bg-yellow-500"></div>
                          <span>Treinou</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-sm bg-gray-300"></div>
                          <span>Não Treinou</span>
                        </div>
                      </div>
                      <div className="text-center text-xs text-gray-400">
                        Total de treinos este mês: {finalWorkoutSessions.length}
                      </div>
                    </div>

                    {tooltip.show && (
                      <div 
                        className="fixed bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg pointer-events-none z-50"
                        style={{ left: tooltip.x, top: tooltip.y }}
                        dangerouslySetInnerHTML={{ __html: tooltip.content }}
                      />
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* My Workouts - agora ocupando largura total */}
        <Card className="mb-8 hover:shadow-xl transition-all duration-300 ease-out">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-primary" />
              Meus Planos de Treino
            </CardTitle>
            <CardDescription>
              Planos que você criou
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="md" variant="primary" className="mx-auto mb-3" />
                <p className="text-gray-500">Carregando planos...</p>
              </div>
            ) : !user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 ease-out">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Treino Full Body</p>
                    <p className="text-sm text-gray-600 mt-1">3 treinos</p>
                    <p className="text-xs text-gray-500 mt-1">Exemplo de plano</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 ease-out">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Treino ABC</p>
                    <p className="text-sm text-gray-600 mt-1">6 treinos</p>
                    <p className="text-xs text-gray-500 mt-1">Exemplo de plano</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 ease-out">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Treino Funcional</p>
                    <p className="text-sm text-gray-600 mt-1">4 treinos</p>
                    <p className="text-xs text-gray-500 mt-1">Exemplo de plano</p>
                  </div>
                </div>
              </div>
            ) : workouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workouts.map((workout) => (
                  <div key={workout.id} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 ease-out">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{workout.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {workout.workout_days?.length || 0} treinos
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Criado em {new Date(workout.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        {workout.expiration_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Expira em {new Date(workout.expiration_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        className="ml-3 hover:shadow-md"
                        title="Editar plano"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/create-workout', { state: { workout } });
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Nenhum plano criado ainda</p>
                <p className="text-sm text-gray-400 mt-1">
                  Crie seu primeiro plano de treino!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button - agora apenas um botão centralizado */}
        <div className="flex justify-center">
          <Button 
            size="lg"
            className="gradient-bg text-primary-foreground font-semibold shadow-lg hover:shadow-xl w-full max-w-md"
            onClick={() => user ? navigate('/create-workout') : navigate('/login')}
          >
            <Plus className="h-5 w-5 mr-2" />
            {user ? 'Criar Novo Treino' : 'Fazer Login para Criar Treino'}
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;

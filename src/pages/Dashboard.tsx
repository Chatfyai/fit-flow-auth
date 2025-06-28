import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, TrendingUp, LogOut, Dumbbell, Clock, Plus, User, Edit2 } from 'lucide-react';
import { Exercise, WorkoutDay, WeeklySchedule, Workout } from '@/types/workout';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { ProgressIndicator, LoadingSpinner } from '@/components/ui/progress-indicator';
import { Typewriter } from '@/components/ui/typewriter';
import { PlayFitLogo } from '@/components/ui/playfit-logo';

interface WorkoutSession {
  id: string;
  date: string;
  duration: number;
  workout_id: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [todaysWorkout, setTodaysWorkout] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch workout sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .order('date', { ascending: false })
        .limit(7);

      if (sessionsError) {
        console.error('Error fetching workout sessions:', sessionsError);
      } else {
        setWorkoutSessions(sessionsData || []);
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
        console.log('Fetched workouts:', workoutsData);
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

  const thisWeekSessions = workoutSessions.filter(session => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return sessionDate >= weekAgo && sessionDate <= today;
  });

  const totalWorkouts = workoutSessions.length;
  const weeklyGoal = 3; // Example goal
  const progressPercentage = Math.min((thisWeekSessions.length / weeklyGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 pb-20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 gradient-bg rounded-2xl flex items-center justify-center mr-3 shadow-md">
                <PlayFitLogo size="md" className="text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PlayFit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                Olá, {user?.user_metadata?.full_name || user?.email}!
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-full p-0 hover:bg-gray-100"
                title="Meu Perfil"
              >
                <User className="h-8 w-8 text-gray-600" />
              </Button>
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
                text={user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Atleta'}
                speed={100}
                loop={false}
                showCursor={true}
                cursorChar={"💪"}
                className="text-yellow-500 font-bold ml-2"
                waitTime={3000}
              />
            </p>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Acompanhe seu progresso fitness</p>
        </div>

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
              <CardTitle className="text-sm font-medium text-gray-700">Treinos Esta Semana</CardTitle>
              <Activity className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{thisWeekSessions.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                de {weeklyGoal} treinos planejados
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 ease-out">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Planos Criados</CardTitle>
              <Dumbbell className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{workouts.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                planos de treino
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Workout */}
        <Card className="mb-8 cursor-pointer hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1" 
              onClick={() => navigate('/treino-do-dia', { state: { workoutDays: todaysWorkout, date: new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) } })}>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calendar className="h-6 w-6 mr-3 text-primary" />
              Treino de Hoje
            </CardTitle>
            <CardDescription className="text-base">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" variant="primary" className="mx-auto mb-4" />
                <p className="text-gray-500">Carregando treino de hoje...</p>
              </div>
            ) : todaysWorkout.length > 0 ? (
              <div className="space-y-4">
                {todaysWorkout.map((workoutDay) => (
                  <div key={workoutDay.letter} className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/20 hover:shadow-md transition-all duration-300 ease-out">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mr-4 shadow-md">
                          <span className="text-lg font-bold text-primary-foreground">{workoutDay.letter}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Treino {workoutDay.letter}</h3>
                          <p className="text-sm text-gray-600">{workoutDay.exercises.length} exercícios programados</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-lg">
                          Toque para ver detalhes
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">Nenhum treino programado para hoje</p>
                <p className="text-sm text-gray-400 mt-2">
                  Aproveite para descansar ou criar um novo plano!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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
            onClick={() => navigate('/create-workout')}
          >
            <Plus className="h-5 w-5 mr-2" />
            Criar Novo Treino
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;

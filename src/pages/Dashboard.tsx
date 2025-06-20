
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, TrendingUp, LogOut, Dumbbell, Clock } from 'lucide-react';

interface WorkoutSession {
  id: string;
  date: string;
  duration: number;
  workout_id: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: string;
  variation?: string;
  rest_time?: number;
}

interface WorkoutDay {
  letter: string;
  name: string;
  exercises: Exercise[];
}

interface WeeklySchedule {
  [key: string]: string[];
}

interface Workout {
  id: string;
  name: string;
  created_at: string;
  expiration_date: string;
  workout_days: WorkoutDay[];
  weekly_schedule: WeeklySchedule;
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
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-primary-foreground">💪</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">PlayFit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.user_metadata?.full_name || user?.email}!
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Acompanhe seu progresso fitness</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Semanal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="gradient-bg h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treinos Esta Semana</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisWeekSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                de {weeklyGoal} treinos planejados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planos Criados</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workouts.length}</div>
              <p className="text-xs text-muted-foreground">
                planos de treino
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Workout */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Treino de Hoje
            </CardTitle>
            <CardDescription>
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
              <div className="text-center py-4">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : todaysWorkout.length > 0 ? (
              <div className="space-y-6">
                {todaysWorkout.map((workoutDay) => (
                  <div key={workoutDay.letter} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4">Treino {workoutDay.letter}</h3>
                    <div className="space-y-3">
                      {workoutDay.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{exercise.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {exercise.sets}
                              {exercise.variation && ` • ${exercise.variation}`}
                            </p>
                          </div>
                          {exercise.rest_time && (
                            <div className="text-right">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1" />
                                {exercise.rest_time}s
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum treino programado para hoje</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Aproveite para descansar ou criar um novo plano!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Seus últimos treinos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : workoutSessions.length > 0 ? (
                <div className="space-y-3">
                  {workoutSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Treino realizado</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.duration} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum treino registrado ainda</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comece registrando seu primeiro treino!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Workouts */}
          <Card>
            <CardHeader>
              <CardTitle>Meus Planos de Treino</CardTitle>
              <CardDescription>
                Planos que você criou
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : workouts.length > 0 ? (
                <div className="space-y-3">
                  {workouts.map((workout) => (
                    <div key={workout.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{workout.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {workout.workout_days?.length || 0} treinos
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Criado em {new Date(workout.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        {workout.expiration_date && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              Expira em {new Date(workout.expiration_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum plano criado ainda</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Crie seu primeiro plano de treino!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              className="gradient-bg text-primary-foreground font-semibold"
              onClick={() => navigate('/create-workout')}
            >
              Criar Novo Treino
            </Button>
            <Button variant="outline">
              Registrar Treino
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

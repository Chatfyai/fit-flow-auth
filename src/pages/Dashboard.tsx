
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, TrendingUp, LogOut } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWorkoutSessions();
    }
  }, [user]);

  const fetchWorkoutSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .order('date', { ascending: false })
        .limit(7);

      if (error) {
        console.error('Error fetching workout sessions:', error);
      } else {
        setWorkoutSessions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="flex justify-center mb-8">
          <Card className="w-full max-w-md">
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
        </div>

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
              Meus Treinos
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

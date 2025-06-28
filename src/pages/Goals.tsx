import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Dumbbell, 
  Heart, 
  Zap, 
  Trophy,
  Plus,
  ArrowLeft,
  CheckCircle,
  Clock
} from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'strength' | 'cardio' | 'weight' | 'habit' | 'endurance';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Perder 5kg',
      description: 'Reduzir peso corporal através de exercícios e dieta balanceada',
      category: 'weight',
      target: 5,
      current: 2.3,
      unit: 'kg',
      deadline: '2024-03-15',
      priority: 'high',
      completed: false
    },
    {
      id: '2',
      title: 'Treinar 4x por semana',
      description: 'Manter consistência nos treinos semanais',
      category: 'habit',
      target: 16,
      current: 12,
      unit: 'treinos',
      deadline: '2024-02-29',
      priority: 'high',
      completed: false
    },
    {
      id: '3',
      title: 'Supino 80kg',
      description: 'Aumentar carga máxima no supino reto',
      category: 'strength',
      target: 80,
      current: 65,
      unit: 'kg',
      deadline: '2024-04-01',
      priority: 'medium',
      completed: false
    },
    {
      id: '4',
      title: 'Correr 5km em 25min',
      description: 'Melhorar tempo na corrida de 5 quilômetros',
      category: 'cardio',
      target: 25,
      current: 28,
      unit: 'min',
      deadline: '2024-03-30',
      priority: 'medium',
      completed: false
    },
    {
      id: '5',
      title: '10.000 passos diários',
      description: 'Manter atividade física diária através de caminhadas',
      category: 'habit',
      target: 10000,
      current: 8500,
      unit: 'passos',
      deadline: '2024-12-31',
      priority: 'low',
      completed: false
    },
    {
      id: '6',
      title: 'Flexões consecutivas',
      description: 'Conseguir fazer 50 flexões sem parar',
      category: 'endurance',
      target: 50,
      current: 50,
      unit: 'repetições',
      deadline: '2024-02-15',
      priority: 'medium',
      completed: true
    }
  ]);

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'strength': return <Dumbbell className="h-4 w-4" />;
      case 'cardio': return <Heart className="h-4 w-4" />;
      case 'weight': return <TrendingUp className="h-4 w-4" />;
      case 'habit': return <Calendar className="h-4 w-4" />;
      case 'endurance': return <Zap className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'strength': return 'bg-red-100 text-red-800';
      case 'cardio': return 'bg-pink-100 text-pink-800';
      case 'weight': return 'bg-green-100 text-green-800';
      case 'habit': return 'bg-blue-100 text-blue-800';
      case 'endurance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getProgress = (goal: Goal) => {
    if (goal.category === 'cardio' && goal.unit === 'min') {
      // Para tempo, quanto menor melhor
      return Math.max(0, Math.min(100, ((goal.target - goal.current + goal.target) / goal.target) * 100));
    }
    return Math.min(100, (goal.current / goal.target) * 100);
  };

  const activeGoals = goals.filter(goal => !goal.completed);
  const completedGoals = goals.filter(goal => goal.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 pb-20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="mr-3 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center mr-3 shadow-md">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Minhas Metas</h1>
                <p className="text-xs text-gray-500">{activeGoals.length} metas ativas</p>
              </div>
            </div>
            <Button
              size="sm"
              className="gradient-bg text-white"
              onClick={() => {/* TODO: Implementar criação de meta */}}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Metas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{activeGoals.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Concluídas</p>
                  <p className="text-2xl font-bold text-gray-900">{completedGoals.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((completedGoals.length / goals.length) * 100)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Metas Ativas
          </h2>
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <Card key={goal.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${getPriorityColor(goal.priority)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}>
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <CardDescription className="text-sm">{goal.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                      {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-medium">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <Progress value={getProgress(goal)} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                      </span>
                      <span>{Math.round(getProgress(goal))}% concluído</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-green-600" />
              Metas Concluídas
            </h2>
            <div className="space-y-4">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="hover:shadow-lg transition-all duration-300 bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-green-800">{goal.title}</CardTitle>
                          <CardDescription className="text-sm text-green-600">{goal.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Concluída
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-green-700">
                      <span>✅ Meta alcançada!</span>
                      <span className="font-medium">
                        {goal.current} {goal.unit}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Continue Focado! 💪</h3>
            <p className="text-gray-600 mb-4">
              Você está no caminho certo. Cada treino te aproxima dos seus objetivos.
            </p>
            <Button className="gradient-bg text-white">
              Ver Estatísticas Detalhadas
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Goals; 
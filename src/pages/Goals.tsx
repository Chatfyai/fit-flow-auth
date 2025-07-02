import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Dumbbell, 
  Heart, 
  Zap, 
  Trophy,
  Plus,
  CheckCircle,
  Clock,
  Edit,
  Save,
  X,
  FlameKindling,
  Apple,
  Activity,
  Trash2
} from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { PlayFitLogo } from '@/components/ui/playfit-logo';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'strength' | 'cardio' | 'weight' | 'habit' | 'endurance' | 'flexibility' | 'nutrition' | 'other';
  goalType: 'numeric' | 'time' | 'boolean' | 'frequency';
  target: number;
  current: number;
  unit: string;
  frequencyTarget?: number;
  frequencyPeriod?: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completedAt?: string;
  metadata?: Record<string, any>;
}

interface GoalProgress {
  id: string;
  goalId: string;
  value: number;
  date: string;
  notes?: string;
}

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [goals, setGoals] = useState<Goal[]>([]);

  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<{[key: string]: number}>({});

  // Templates de metas predefinidas
  const goalTemplates = [
    {
      title: 'Perder peso',
      description: 'Reduzir peso corporal através de exercícios e dieta',
      category: 'weight' as Goal['category'],
      goalType: 'numeric' as Goal['goalType'],
      unit: 'kg',
      priority: 'high' as Goal['priority']
    },
    {
      title: 'Treinar regularmente',
      description: 'Manter consistência nos treinos',
      category: 'habit' as Goal['category'],
      goalType: 'frequency' as Goal['goalType'],
      unit: 'treinos',
      frequencyTarget: 3,
      frequencyPeriod: 'weekly' as 'weekly',
      priority: 'high' as Goal['priority']
    },
    {
      title: 'Aumentar carga no supino',
      description: 'Melhorar força no supino reto',
      category: 'strength' as Goal['category'],
      goalType: 'numeric' as Goal['goalType'],
      unit: 'kg',
      priority: 'medium' as Goal['priority']
    },
    {
      title: 'Melhorar tempo de corrida',
      description: 'Reduzir tempo na corrida de 5km',
      category: 'cardio' as Goal['category'],
      goalType: 'time' as Goal['goalType'],
      unit: 'min',
      priority: 'medium' as Goal['priority']
    },
    {
      title: 'Beber mais água',
      description: 'Consumir quantidade adequada de água diariamente',
      category: 'nutrition' as Goal['category'],
      goalType: 'frequency' as Goal['goalType'],
      unit: 'litros',
      frequencyTarget: 2,
      frequencyPeriod: 'daily' as 'daily',
      priority: 'medium' as Goal['priority']
    },
    {
      title: 'Dormir melhor',
      description: 'Manter horário regular de sono',
      category: 'habit' as Goal['category'],
      goalType: 'frequency' as Goal['goalType'],
      unit: 'horas',
      frequencyTarget: 8,
      frequencyPeriod: 'daily' as 'daily',
      priority: 'high' as Goal['priority']
    }
  ];

  // Formulário para nova meta
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'other' as Goal['category'],
    goalType: 'numeric' as Goal['goalType'],
    target: 0,
    unit: '',
    frequencyTarget: 1,
    frequencyPeriod: 'weekly' as 'daily' | 'weekly' | 'monthly',
    deadline: '',
    priority: 'medium' as Goal['priority']
  });

  const [showTemplates, setShowTemplates] = useState(false);

  const [loading, setLoading] = useState(true);

  // Carregar metas do usuário quando o componente montar
  React.useEffect(() => {
    const loadGoals = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Buscar metas do usuário no Supabase
        const { data: goalsData, error } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Mapear dados do banco para o formato local
        const mappedGoals: Goal[] = (goalsData || []).map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description || '',
          category: goal.category,
          goalType: goal.goal_type,
          target: goal.target_value,
          current: goal.current_value,
          unit: goal.unit,
          frequencyTarget: goal.frequency_target || undefined,
          frequencyPeriod: goal.frequency_period as 'daily' | 'weekly' | 'monthly' || undefined,
          startDate: goal.start_date,
          deadline: goal.deadline || '',
          priority: goal.priority,
          completed: goal.completed,
          completedAt: goal.completed_at || undefined,
          metadata: goal.metadata || {}
        }));

        setGoals(mappedGoals);
      } catch (error) {
        console.error('Erro ao carregar metas:', error);
        toast({
          title: "Erro ao carregar metas",
          description: "Não foi possível carregar suas metas salvas.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [user, toast]);

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'strength': return <Dumbbell className="h-4 w-4" />;
      case 'cardio': return <Heart className="h-4 w-4" />;
      case 'weight': return <TrendingUp className="h-4 w-4" />;
      case 'habit': return <Calendar className="h-4 w-4" />;
      case 'endurance': return <Zap className="h-4 w-4" />;
      case 'flexibility': return <Activity className="h-4 w-4" />;
      case 'nutrition': return <Apple className="h-4 w-4" />;
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
      case 'flexibility': return 'bg-orange-100 text-orange-800';
      case 'nutrition': return 'bg-emerald-100 text-emerald-800';
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
    if (goal.goalType === 'time' && goal.category === 'cardio') {
      // Para tempo, quanto menor melhor
      return Math.max(0, Math.min(100, ((goal.target - goal.current + goal.target) / goal.target) * 100));
    }
    if (goal.goalType === 'frequency') {
      return Math.min(100, (goal.current / goal.target) * 100);
    }
    return Math.min(100, (goal.current / goal.target) * 100);
  };

  const createGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      goalType: newGoal.goalType,
      target: newGoal.target,
      current: 0,
      unit: newGoal.unit,
      frequencyTarget: newGoal.goalType === 'frequency' ? newGoal.frequencyTarget : undefined,
      frequencyPeriod: newGoal.goalType === 'frequency' ? newGoal.frequencyPeriod : undefined,
      startDate: new Date().toISOString().split('T')[0],
      deadline: newGoal.deadline,
      priority: newGoal.priority,
      completed: false
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    
    // Salvar no localStorage (futuramente será Supabase)
    localStorage.setItem(`user_goals_${user?.id || 'anonymous'}`, JSON.stringify(updatedGoals));
    
    setShowCreateModal(false);
    setNewGoal({
      title: '',
      description: '',
      category: 'other',
      goalType: 'numeric',
      target: 0,
      unit: '',
      frequencyTarget: 1,
      frequencyPeriod: 'weekly',
      deadline: '',
      priority: 'medium'
    });

    toast({
      title: "Meta criada com sucesso! 🎯",
      description: `${goal.title} foi adicionada às suas metas ativas.`,
    });
  };

  const updateGoalProgress = (goalId: string) => {
    const newValue = editingProgress[goalId];
    if (newValue === undefined) return;

    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const isCompleted = goal.goalType === 'time' 
          ? newValue <= goal.target 
          : newValue >= goal.target;
        
        return {
          ...goal, 
          current: newValue,
          completed: isCompleted,
          completedAt: isCompleted && !goal.completed ? new Date().toISOString() : goal.completedAt
        };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    
    // Salvar no localStorage (futuramente será Supabase)
    localStorage.setItem(`user_goals_${user?.id || 'anonymous'}`, JSON.stringify(updatedGoals));

    // Adicionar ao histórico de progresso
    const progress: GoalProgress = {
      id: Date.now().toString(),
      goalId,
      value: newValue,
      date: new Date().toISOString().split('T')[0],
      notes: `Progresso atualizado para ${newValue}`
    };
    setGoalProgress([...goalProgress, progress]);

    setEditingGoal(null);
    setEditingProgress({});

    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const isCompleted = goal.goalType === 'time' ? newValue <= goal.target : newValue >= goal.target;
      
      if (isCompleted) {
        toast({
          title: "🏆 Meta concluída!",
          description: `Parabéns! Você alcançou a meta "${goal.title}".`,
        });
      } else {
        toast({
          title: "Progresso atualizado! 📈",
          description: `${goal.title}: ${newValue} ${goal.unit}`,
        });
      }
    }
  };

  const markGoalAsCompleted = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const completedDate = new Date().toISOString();

    // Atualizar no estado local
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, completed: true, current: g.target, completedAt: completedDate }
        : g
    ));

    // Salvar no localStorage para persistência local (futuramente será Supabase)
    const updatedGoals = goals.map(g => 
      g.id === goalId 
        ? { ...g, completed: true, current: g.target, completedAt: completedDate }
        : g
    );
    localStorage.setItem(`user_goals_${user?.id || 'anonymous'}`, JSON.stringify(updatedGoals));

    toast({
      title: "🎉 Meta Concluída!",
      description: `Parabéns! Você concluiu a meta "${goal.title}".`,
      className: 'bg-green-500 border-green-600 text-white shadow-lg',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
        color: '#ffffff'
      }
    });
  };

  const deleteCompletedGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedGoals = goals.filter(g => g.id !== goalId);
    setGoals(updatedGoals);
    
    // Salvar no localStorage (futuramente será Supabase)
    localStorage.setItem(`user_goals_${user?.id || 'anonymous'}`, JSON.stringify(updatedGoals));

    toast({
      title: "Meta removida",
      description: `A meta "${goal.title}" foi removida da lista.`,
      className: 'bg-red-500 border-red-600 text-white shadow-lg',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        color: '#ffffff'
      }
    });
  };

  const activeGoals = goals.filter(goal => !goal.completed);
  const completedGoals = goals.filter(goal => goal.completed);

  const applyTemplate = (template: typeof goalTemplates[0]) => {
    setNewGoal({
      title: template.title,
      description: template.description,
      category: template.category,
      goalType: template.goalType,
      target: 0,
      unit: template.unit,
      frequencyTarget: template.frequencyTarget || 1,
      frequencyPeriod: template.frequencyPeriod || 'weekly',
      deadline: '',
      priority: template.priority
    });
    setShowTemplates(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 pb-20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mr-3">
                <PlayFitLogo size="md" className="text-yellow-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PlayFit</h1>
            </div>
            <div></div>
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20" style={{ alignItems: 'center' }}>
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col my-auto">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Criar Nova Meta</h2>
                        <p className="text-gray-600 mt-1">Defina uma nova meta para acompanhar seu progresso</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCreateModal(false)}
                        className="rounded-xl"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Conteúdo com scroll */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                      {/* Templates Section */}
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label>Templates de Metas</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="rounded-xl text-yellow-600 hover:bg-yellow-50"
                          >
                            {showTemplates ? 'Ocultar' : 'Ver Templates'}
                          </Button>
                        </div>
                        {showTemplates && (
                          <div className="grid grid-cols-1 gap-3">
                            {goalTemplates.map((template, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => applyTemplate(template)}
                                className="text-left justify-start h-auto p-4 bg-white border-gray-200 rounded-xl hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300 whitespace-normal"
                              >
                                <div className="flex items-start gap-3 w-full">
                                  <div className={`p-2 rounded-lg flex-shrink-0 ${getCategoryColor(template.category)}`}>
                                    {getCategoryIcon(template.category)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 mb-1">{template.title}</div>
                                    <div className="text-sm text-gray-500 leading-relaxed">{template.description}</div>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="title">Título da Meta</Label>
                        <Input
                          id="title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                          placeholder="Ex: Correr 5km"
                          className="bg-white border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-yellow-200"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                          placeholder="Descreva sua meta em detalhes..."
                          className="bg-white border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-yellow-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="category">Categoria</Label>
                          <Select value={newGoal.category} onValueChange={(value: Goal['category']) => setNewGoal({...newGoal, category: value})}>
                            <SelectTrigger className="bg-white border-gray-200 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
                              <SelectItem value="strength" className="hover:bg-yellow-50">Força</SelectItem>
                              <SelectItem value="cardio" className="hover:bg-yellow-50">Cardio</SelectItem>
                              <SelectItem value="weight" className="hover:bg-yellow-50">Peso</SelectItem>
                              <SelectItem value="endurance" className="hover:bg-yellow-50">Resistência</SelectItem>
                              <SelectItem value="flexibility" className="hover:bg-yellow-50">Flexibilidade</SelectItem>
                              <SelectItem value="nutrition" className="hover:bg-yellow-50">Nutrição</SelectItem>
                              <SelectItem value="habit" className="hover:bg-yellow-50">Hábito</SelectItem>
                              <SelectItem value="other" className="hover:bg-yellow-50">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="goalType">Tipo de Meta</Label>
                          <Select value={newGoal.goalType} onValueChange={(value: Goal['goalType']) => setNewGoal({...newGoal, goalType: value})}>
                            <SelectTrigger className="bg-white border-gray-200 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
                              <SelectItem value="numeric" className="hover:bg-yellow-50">Numérica</SelectItem>
                              <SelectItem value="time" className="hover:bg-yellow-50">Tempo</SelectItem>
                              <SelectItem value="frequency" className="hover:bg-yellow-50">Frequência</SelectItem>
                              <SelectItem value="boolean" className="hover:bg-yellow-50">Sim/Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {newGoal.goalType === 'frequency' ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="frequencyTarget">Quantas vezes</Label>
                            <Input
                              id="frequencyTarget"
                              type="number"
                              value={newGoal.frequencyTarget}
                              onChange={(e) => setNewGoal({...newGoal, frequencyTarget: parseInt(e.target.value)})}
                              className="bg-white border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-yellow-200"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="frequencyPeriod">Período</Label>
                            <Select value={newGoal.frequencyPeriod} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setNewGoal({...newGoal, frequencyPeriod: value})}>
                              <SelectTrigger className="bg-white border-gray-200 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
                                <SelectItem value="daily" className="hover:bg-yellow-50">Por dia</SelectItem>
                                <SelectItem value="weekly" className="hover:bg-yellow-50">Por semana</SelectItem>
                                <SelectItem value="monthly" className="hover:bg-yellow-50">Por mês</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="target">Meta</Label>
                            <Input
                              id="target"
                              type="number"
                              value={newGoal.target}
                              onChange={(e) => setNewGoal({...newGoal, target: parseFloat(e.target.value)})}
                              className="bg-white border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-yellow-200"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="unit">Unidade</Label>
                            <Input
                              id="unit"
                              value={newGoal.unit}
                              onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                              placeholder="kg, min, reps..."
                              className="bg-white border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-yellow-200"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="deadline">Prazo</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={newGoal.deadline}
                            onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                            className="bg-white border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-yellow-200"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="priority">Prioridade</Label>
                          <Select value={newGoal.priority} onValueChange={(value: Goal['priority']) => setNewGoal({...newGoal, priority: value})}>
                            <SelectTrigger className="bg-white border-gray-200 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
                              <SelectItem value="high" className="hover:bg-yellow-50">Alta</SelectItem>
                              <SelectItem value="medium" className="hover:bg-yellow-50">Média</SelectItem>
                              <SelectItem value="low" className="hover:bg-yellow-50">Baixa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer com botões */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl">
                        Cancelar
                      </Button>
                      <Button onClick={createGoal} disabled={!newGoal.title} className="gradient-bg text-white font-semibold rounded-xl">
                        Criar Meta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-yellow-600" />
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
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setShowCreateModal(true)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nova Meta</p>
                  <p className="text-sm font-bold text-gray-900">Criar meta</p>
                </div>
                <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Metas Ativas
            </h2>

          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta ativa</h3>
              <p className="text-gray-500 mb-6">Crie sua primeira meta para começar a acompanhar seu progresso!</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </div>
          ) : (
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
                    <div className="flex items-center gap-2">
                      <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                        {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGoal(editingGoal === goal.id ? null : goal.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progresso</span>
                      {editingGoal === goal.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 h-8"
                            value={editingProgress[goal.id] ?? goal.current}
                            onChange={(e) => setEditingProgress({
                              ...editingProgress,
                              [goal.id]: parseFloat(e.target.value)
                            })}
                          />
                          <span className="text-xs">/ {goal.target} {goal.unit}</span>
                          <Button
                            size="sm"
                            onClick={() => updateGoalProgress(goal.id)}
                            className="h-8 px-2"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingGoal(null)}
                            className="h-8 px-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-medium">
                          {goal.current} / {goal.target} {goal.unit}
                          {goal.goalType === 'frequency' && goal.frequencyPeriod && (
                            <span className="text-xs text-gray-500 ml-1">
                              por {goal.frequencyPeriod === 'weekly' ? 'semana' : 
                                   goal.frequencyPeriod === 'daily' ? 'dia' : 'mês'}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <Progress value={getProgress(goal)} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                      </span>
                      <span>{Math.round(getProgress(goal))}% concluído</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <Button
                        onClick={() => markGoalAsCompleted(goal.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Concluída
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
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
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          Concluída
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCompletedGoal(goal.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Remover meta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex items-center justify-between">
                        <span>✅ Meta alcançada!</span>
                        <span className="font-medium">
                          {goal.current} {goal.unit}
                        </span>
                      </div>
                      {goal.completedAt && (
                        <div className="text-xs text-green-600">
                          Concluída em {new Date(goal.completedAt).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Goal Suggestions */}
        {!loading && activeGoals.length === 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FlameKindling className="h-5 w-5 mr-2 text-orange-600" />
              Sugestões de Metas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalTemplates.slice(0, 4).map((template, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed"
                      onClick={() => {
                        applyTemplate(template);
                        setShowCreateModal(true);
                      }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                        {getCategoryIcon(template.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{template.title}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                      <Plus className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}


      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Goals; 
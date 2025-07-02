import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Goal } from '@/types/goals';
import { NewGoalData } from '@/components/goals/CreateGoalModal';

export const useGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar metas do usuário
  const loadGoals = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar metas do usuário no Supabase usando query direta
      const { data: directData, error: directError } = await supabase
        .from('user_goals' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (directError) {
        throw directError;
      }

      // Mapear dados do banco para o formato local
      const mappedGoals: Goal[] = (directData || []).map((goal: any) => ({
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
  }, [user, toast]);

  // Criar nova meta
  const createGoal = useCallback(async (newGoalData: NewGoalData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar metas.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Criar meta no Supabase
      const goalData = {
        user_id: user.id,
        title: newGoalData.title,
        description: newGoalData.description,
        category: newGoalData.category,
        goal_type: newGoalData.goalType,
        target_value: newGoalData.target,
        current_value: 0,
        unit: newGoalData.unit,
        frequency_target: newGoalData.goalType === 'frequency' ? newGoalData.frequencyTarget : null,
        frequency_period: newGoalData.goalType === 'frequency' ? newGoalData.frequencyPeriod : null,
        start_date: new Date().toISOString().split('T')[0],
        deadline: newGoalData.deadline || null,
        priority: newGoalData.priority,
        completed: false,
        metadata: {}
      };

      const { data: createdGoal, error } = await supabase
        .from('user_goals' as any)
        .insert([goalData])
        .select('*');

      if (error) {
        throw error;
      }

      if (!createdGoal || createdGoal.length === 0) {
        throw new Error('Nenhum dado retornado após criação da meta');
      }

      const goalFromDb = createdGoal[0] as any;

      // Mapear dados do banco para o formato local
      const mappedGoal: Goal = {
        id: goalFromDb.id,
        title: goalFromDb.title,
        description: goalFromDb.description || '',
        category: goalFromDb.category,
        goalType: goalFromDb.goal_type,
        target: goalFromDb.target_value,
        current: goalFromDb.current_value,
        unit: goalFromDb.unit,
        frequencyTarget: goalFromDb.frequency_target || undefined,
        frequencyPeriod: goalFromDb.frequency_period as 'daily' | 'weekly' | 'monthly' || undefined,
        startDate: goalFromDb.start_date,
        deadline: goalFromDb.deadline || '',
        priority: goalFromDb.priority,
        completed: goalFromDb.completed,
        completedAt: goalFromDb.completed_at || undefined,
        metadata: goalFromDb.metadata || {}
      };

      // Atualizar estado local
      setGoals(prev => [mappedGoal, ...prev]);

      toast({
        title: "Meta criada com sucesso! 🎯",
        description: `${mappedGoal.title} foi adicionada às suas metas ativas.`,
      });
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast({
        title: "Erro ao criar meta",
        description: "Não foi possível criar a meta. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Atualizar progresso da meta
  const updateGoalProgress = useCallback(async (goalId: string, newValue: number) => {
    if (!user) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const isCompleted = goal.goalType === 'time' 
        ? newValue <= goal.target 
        : newValue >= goal.target;

      // Atualizar meta no Supabase
      const { error } = await supabase
        .from('user_goals' as any)
        .update({
          current_value: newValue,
          completed: isCompleted,
          completed_at: isCompleted && !goal.completed ? new Date().toISOString() : goal.completedAt
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g, 
            current: newValue,
            completed: isCompleted,
            completedAt: isCompleted && !g.completed ? new Date().toISOString() : g.completedAt
          };
        }
        return g;
      }));

      // Adicionar ao histórico de progresso no Supabase
      const { error: progressError } = await supabase
        .from('goal_progress' as any)
        .insert([{
          goal_id: goalId,
          value: newValue,
          date: new Date().toISOString().split('T')[0],
          notes: `Progresso atualizado para ${newValue}`
        }]);

      if (progressError) {
        console.error('Erro ao salvar progresso:', progressError);
      }
      
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
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro ao atualizar progresso",
        description: "Não foi possível salvar o progresso. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [user, goals, toast]);

  // Marcar meta como concluída
  const markGoalAsCompleted = useCallback(async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !user) return;

    const completedDate = new Date().toISOString();

    try {
      // Atualizar meta no Supabase
      const { error } = await supabase
        .from('user_goals' as any)
        .update({
          completed: true,
          current_value: goal.target,
          completed_at: completedDate
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { ...g, completed: true, current: g.target, completedAt: completedDate }
          : g
      ));

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
    } catch (error) {
      console.error('Erro ao marcar meta como concluída:', error);
      toast({
        title: "Erro ao concluir meta",
        description: "Não foi possível marcar a meta como concluída. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [goals, user, toast]);

  // Deletar meta concluída
  const deleteCompletedGoal = useCallback(async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !user) return;

    try {
      // Deletar meta do Supabase
      const { error } = await supabase
        .from('user_goals' as any)
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setGoals(prev => prev.filter(g => g.id !== goalId));

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
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      toast({
        title: "Erro ao remover meta",
        description: "Não foi possível remover a meta. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [goals, user, toast]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const activeGoals = goals.filter(goal => !goal.completed);
  const completedGoals = goals.filter(goal => goal.completed);

  return {
    goals,
    activeGoals,
    completedGoals,
    loading,
    createGoal,
    updateGoalProgress,
    markGoalAsCompleted,
    deleteCompletedGoal,
    loadGoals
  };
};
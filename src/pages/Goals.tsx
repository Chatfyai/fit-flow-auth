import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Target, Trophy, Plus, AlertTriangle } from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { GoalStats } from '@/components/goals/GoalStats';
import { GoalCard } from '@/components/goals/GoalCard';
import { CreateGoalModal } from '@/components/goals/CreateGoalModal';
import { GoalSuggestions } from '@/components/goals/GoalSuggestions';
import { useGoals } from '@/hooks/useGoals';
import { goalTemplates } from '@/data/goalTemplates';

// Metas de demonstração para usuários não logados
const demoGoals = [
  {
    id: 'demo-1',
    title: 'Perder 5kg',
    description: 'Meta de emagrecimento saudável',
    category: 'Perda de Peso',
    target_value: 5,
    current_value: 3,
    unit: 'kg',
    target_date: '2024-03-15',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    status: 'active',
    user_id: 'demo'
  },
  {
    id: 'demo-2',
    title: 'Correr 10km',
    description: 'Conseguir correr 10km sem parar',
    category: 'Resistência',
    target_value: 10,
    current_value: 7,
    unit: 'km',
    target_date: '2024-04-01',
    created_at: '2024-01-05',
    updated_at: '2024-01-20',
    status: 'active',
    user_id: 'demo'
  }
];

const demoCompletedGoals = [
  {
    id: 'demo-completed-1',
    title: '30 dias de treino',
    description: 'Treinar por 30 dias consecutivos',
    category: 'Consistência',
    target_value: 30,
    current_value: 30,
    unit: 'dias',
    target_date: '2024-01-31',
    created_at: '2024-01-01',
    updated_at: '2024-01-31',
    status: 'completed',
    user_id: 'demo'
  }
];

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    activeGoals: userActiveGoals,
    completedGoals: userCompletedGoals,
    loading,
    createGoal,
    updateGoalProgress,
    markGoalAsCompleted,
    deleteCompletedGoal
  } = useGoals();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<{[key: string]: number}>({});

  // Usar dados reais se logado, demo se não logado
  const activeGoals = user ? userActiveGoals : demoGoals;
  const completedGoals = user ? userCompletedGoals : demoCompletedGoals;

  const handleCreateGoal = (goalData: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    createGoal(goalData);
    setShowCreateModal(false);
  };

  const handleUpdateProgress = (goalId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const newValue = editingProgress[goalId];
    if (newValue !== undefined) {
      updateGoalProgress(goalId, newValue);
      setEditingGoal(null);
      setEditingProgress({});
    }
  };

  const handleProgressChange = (goalId: string, value: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEditingProgress(prev => ({ ...prev, [goalId]: value }));
  };

  const handleTemplateSelect = (template: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Apply template and open modal
    setShowCreateModal(true);
  };

  const handleCreateGoalClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowCreateModal(true);
  };

  const handleGoalAction = (action: () => void) => {
    if (!user) {
      navigate('/login');
      return;
    }
    action();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 pb-20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-10">
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

      {/* Aviso para visitantes */}
      {!user && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
              <div className="text-sm text-amber-800">
                <strong>Você está navegando como visitante.</strong> Para criar e salvar suas metas, 
                <button 
                  onClick={() => navigate('/login')}
                  className="text-amber-600 hover:text-amber-800 underline ml-1"
                >
                  faça login aqui
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <GoalStats
          activeGoalsCount={activeGoals.length}
          completedGoalsCount={completedGoals.length}
          onCreateGoal={handleCreateGoalClick}
        />

        {/* Active Goals */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Metas Ativas {!user && <span className="text-sm text-gray-500 ml-2">(Demonstração)</span>}
            </h2>
          </div>
          
          {loading && user ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta ativa</h3>
              <p className="text-gray-500 mb-6">Crie sua primeira meta para começar a acompanhar seu progresso!</p>
              <Button onClick={handleCreateGoalClick} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  isEditing={editingGoal === goal.id}
                  editingProgress={editingProgress}
                  onEdit={(goalId) => handleGoalAction(() => setEditingGoal(editingGoal === goalId ? null : goalId))}
                  onUpdateProgress={handleUpdateProgress}
                  onMarkCompleted={(goalId) => handleGoalAction(() => markGoalAsCompleted(goalId))}
                  onProgressChange={handleProgressChange}
                  onCancelEdit={() => setEditingGoal(null)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-green-600" />
              Metas Concluídas {!user && <span className="text-sm text-gray-500 ml-2">(Demonstração)</span>}
            </h2>
            <div className="space-y-4">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  isEditing={false}
                  editingProgress={{}}
                  onEdit={() => {}}
                  onUpdateProgress={() => {}}
                  onMarkCompleted={() => {}}
                  onDelete={user ? deleteCompletedGoal : () => handleGoalAction(() => deleteCompletedGoal(goal.id))}
                  onProgressChange={() => {}}
                  onCancelEdit={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Goal Suggestions */}
        {!loading && activeGoals.length === 0 && (
          <GoalSuggestions onSelectTemplate={handleTemplateSelect} />
        )}
      </main>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateGoal={handleCreateGoal}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Goals;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Target, Trophy, Plus } from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { GoalStats } from '@/components/goals/GoalStats';
import { GoalCard } from '@/components/goals/GoalCard';
import { CreateGoalModal } from '@/components/goals/CreateGoalModal';
import { GoalSuggestions } from '@/components/goals/GoalSuggestions';
import { useGoals } from '@/hooks/useGoals';
import { goalTemplates } from '@/data/goalTemplates';

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    activeGoals,
    completedGoals,
    loading,
    createGoal,
    updateGoalProgress,
    markGoalAsCompleted,
    deleteCompletedGoal
  } = useGoals();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<{[key: string]: number}>({});

  const handleCreateGoal = (goalData: any) => {
    createGoal(goalData);
    setShowCreateModal(false);
  };

  const handleUpdateProgress = (goalId: string) => {
    const newValue = editingProgress[goalId];
    if (newValue !== undefined) {
      updateGoalProgress(goalId, newValue);
      setEditingGoal(null);
      setEditingProgress({});
    }
  };

  const handleProgressChange = (goalId: string, value: number) => {
    setEditingProgress(prev => ({ ...prev, [goalId]: value }));
  };

  const handleTemplateSelect = (template: any) => {
    // Apply template and open modal
    setShowCreateModal(true);
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <GoalStats
          activeGoalsCount={activeGoals.length}
          completedGoalsCount={completedGoals.length}
          onCreateGoal={() => setShowCreateModal(true)}
        />

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
                <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta ativa</h3>
              <p className="text-gray-500 mb-6">Crie sua primeira meta para começar a acompanhar seu progresso!</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
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
                  onEdit={(goalId) => setEditingGoal(editingGoal === goalId ? null : goalId)}
                  onUpdateProgress={handleUpdateProgress}
                  onMarkCompleted={markGoalAsCompleted}
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
              Metas Concluídas
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
                  onDelete={deleteCompletedGoal}
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
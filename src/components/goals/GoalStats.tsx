import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Trophy, Plus } from 'lucide-react';

interface GoalStatsProps {
  activeGoalsCount: number;
  completedGoalsCount: number;
  onCreateGoal: () => void;
}

export const GoalStats: React.FC<GoalStatsProps> = ({
  activeGoalsCount,
  completedGoalsCount,
  onCreateGoal
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Metas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{activeGoalsCount}</p>
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
              <p className="text-2xl font-bold text-gray-900">{completedGoalsCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={onCreateGoal}>
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
  );
};
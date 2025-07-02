import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  Edit, 
  Save, 
  X, 
  Trash2,
  Dumbbell, 
  Heart, 
  TrendingUp, 
  Calendar, 
  Zap, 
  Apple, 
  Activity, 
  Target 
} from 'lucide-react';
import { Goal } from '@/types/goals';

interface GoalCardProps {
  goal: Goal;
  isEditing: boolean;
  editingProgress: { [key: string]: number };
  onEdit: (goalId: string) => void;
  onUpdateProgress: (goalId: string) => void;
  onMarkCompleted: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
  onProgressChange: (goalId: string, value: number) => void;
  onCancelEdit: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  isEditing,
  editingProgress,
  onEdit,
  onUpdateProgress,
  onMarkCompleted,
  onDelete,
  onProgressChange,
  onCancelEdit
}) => {
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

  if (goal.completed) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 bg-green-50 border-green-200">
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
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(goal.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Remover meta"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
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
    );
  }

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${getPriorityColor(goal.priority)}`}>
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
              onClick={() => onEdit(goal.id)}
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
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-20 h-8"
                  value={editingProgress[goal.id] ?? goal.current}
                  onChange={(e) => onProgressChange(goal.id, parseFloat(e.target.value))}
                />
                <span className="text-xs">/ {goal.target} {goal.unit}</span>
                <Button
                  size="sm"
                  onClick={() => onUpdateProgress(goal.id)}
                  className="h-8 px-2"
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelEdit}
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
              onClick={() => onMarkCompleted(goal.id)}
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
  );
};
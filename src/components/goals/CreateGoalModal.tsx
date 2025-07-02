import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Dumbbell, Heart, TrendingUp, Calendar, Zap, Apple, Activity, Target } from 'lucide-react';
import { Goal } from '@/types/goals';
import { goalTemplates } from '@/data/goalTemplates';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goalData: NewGoalData) => void;
}

export interface NewGoalData {
  title: string;
  description: string;
  category: Goal['category'];
  goalType: Goal['goalType'];
  target: number;
  unit: string;
  frequencyTarget: number;
  frequencyPeriod: 'daily' | 'weekly' | 'monthly';
  deadline: string;
  priority: Goal['priority'];
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onCreateGoal
}) => {
  const [newGoal, setNewGoal] = useState<NewGoalData>({
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

  const [showTemplates, setShowTemplates] = useState(false);

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

  const handleSubmit = () => {
    onCreateGoal(newGoal);
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
    onClose();
  };

  if (!isOpen) return null;

  return (
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
              onClick={onClose}
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
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!newGoal.title} className="gradient-bg text-white font-semibold rounded-xl">
              Criar Meta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FlameKindling, Plus, Dumbbell, Heart, TrendingUp, Calendar, Zap, Apple, Activity, Target } from 'lucide-react';
import { goalTemplates } from '@/data/goalTemplates';
import { Goal } from '@/types/goals';

interface GoalSuggestionsProps {
  onSelectTemplate: (template: any) => void;
}

export const GoalSuggestions: React.FC<GoalSuggestionsProps> = ({ onSelectTemplate }) => {
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

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <FlameKindling className="h-5 w-5 mr-2 text-orange-600" />
        Sugestões de Metas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goalTemplates.slice(0, 4).map((template, index) => (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed"
            onClick={() => onSelectTemplate(template)}
          >
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
  );
};
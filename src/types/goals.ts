export interface Goal {
  id: string;
  user_id?: string;
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
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  user_id?: string;
  value: number;
  date: string;
  notes?: string;
  session_data?: Record<string, any>;
  created_at?: string;
}

export interface GoalTemplate {
  title: string;
  description: string;
  category: Goal['category'];
  goalType: Goal['goalType'];
  unit: string;
  priority: Goal['priority'];
  frequencyTarget?: number;
  frequencyPeriod?: 'daily' | 'weekly' | 'monthly';
  suggestedTarget?: number;
}

export interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  successRate: number;
  averageProgress: number;
  goalsByCategory: Record<string, number>;
  goalsByPriority: Record<string, number>;
}

export interface GoalFilters {
  category?: Goal['category'];
  priority?: Goal['priority'];
  goalType?: Goal['goalType'];
  completed?: boolean;
  search?: string;
} 
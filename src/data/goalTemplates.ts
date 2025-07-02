import { GoalTemplate } from '@/types/goals';

export const goalTemplates: GoalTemplate[] = [
  {
    title: 'Perder peso',
    description: 'Reduzir peso corporal através de exercícios e dieta',
    category: 'weight',
    goalType: 'numeric',
    unit: 'kg',
    priority: 'high'
  },
  {
    title: 'Treinar regularmente',
    description: 'Manter consistência nos treinos',
    category: 'habit',
    goalType: 'frequency',
    unit: 'treinos',
    frequencyTarget: 3,
    frequencyPeriod: 'weekly',
    priority: 'high'
  },
  {
    title: 'Aumentar carga no supino',
    description: 'Melhorar força no supino reto',
    category: 'strength',
    goalType: 'numeric',
    unit: 'kg',
    priority: 'medium'
  },
  {
    title: 'Melhorar tempo de corrida',
    description: 'Reduzir tempo na corrida de 5km',
    category: 'cardio',
    goalType: 'time',
    unit: 'min',
    priority: 'medium'
  },
  {
    title: 'Beber mais água',
    description: 'Consumir quantidade adequada de água diariamente',
    category: 'nutrition',
    goalType: 'frequency',
    unit: 'litros',
    frequencyTarget: 2,
    frequencyPeriod: 'daily',
    priority: 'medium'
  },
  {
    title: 'Dormir melhor',
    description: 'Manter horário regular de sono',
    category: 'habit',
    goalType: 'frequency',
    unit: 'horas',
    frequencyTarget: 8,
    frequencyPeriod: 'daily',
    priority: 'high'
  }
];
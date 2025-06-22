
export interface Exercise {
  id: string;
  name: string;
  series: number;
  repetitions: string;
  variation?: string;
  rest_time?: number;
}

export interface WorkoutDay {
  letter: string;
  name: string;
  exercises: Exercise[];
}

export interface WeeklySchedule {
  [key: string]: string[];
}

export interface Workout {
  id: string;
  name: string;
  created_at: string;
  expiration_date: string;
  workout_days: WorkoutDay[];
  weekly_schedule: WeeklySchedule;
}

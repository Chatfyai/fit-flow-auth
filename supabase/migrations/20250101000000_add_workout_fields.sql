-- Adicionar novos campos na tabela workouts
ALTER TABLE public.workouts 
ADD COLUMN workout_days JSONB,
ADD COLUMN weekly_schedule JSONB,
ADD COLUMN expiration_date DATE;

-- Atualizar registros existentes para compatibilidade
UPDATE public.workouts 
SET workout_days = '[]'::jsonb,
    weekly_schedule = '{}'::jsonb
WHERE workout_days IS NULL; 
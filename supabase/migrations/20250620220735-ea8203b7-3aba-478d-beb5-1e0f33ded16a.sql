
-- Adicionar novos campos na tabela workouts para suportar a nova estrutura
ALTER TABLE public.workouts 
ADD COLUMN IF NOT EXISTS workout_days JSONB,
ADD COLUMN IF NOT EXISTS weekly_schedule JSONB,
ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- Atualizar registros existentes para compatibilidade
UPDATE public.workouts 
SET workout_days = COALESCE(workout_days, '[]'::jsonb),
    weekly_schedule = COALESCE(weekly_schedule, '{}'::jsonb)
WHERE workout_days IS NULL OR weekly_schedule IS NULL;

-- Adicionar RLS (Row Level Security) se ainda não existir
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela workouts
DO $$ 
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workouts' AND policyname = 'Users can view their own workouts'
    ) THEN
        CREATE POLICY "Users can view their own workouts" 
        ON public.workouts 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workouts' AND policyname = 'Users can create their own workouts'
    ) THEN
        CREATE POLICY "Users can create their own workouts" 
        ON public.workouts 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workouts' AND policyname = 'Users can update their own workouts'
    ) THEN
        CREATE POLICY "Users can update their own workouts" 
        ON public.workouts 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    -- Política para DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workouts' AND policyname = 'Users can delete their own workouts'
    ) THEN
        CREATE POLICY "Users can delete their own workouts" 
        ON public.workouts 
        FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

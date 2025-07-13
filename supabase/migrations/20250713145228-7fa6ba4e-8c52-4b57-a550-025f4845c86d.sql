-- Adicionar coluna completion_percentage à tabela workout_sessions
ALTER TABLE public.workout_sessions 
ADD COLUMN completion_percentage numeric(5,2) DEFAULT 0.00 NOT NULL;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.workout_sessions.completion_percentage IS 'Porcentagem de conclusão do treino (0.00 a 100.00)';
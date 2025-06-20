
-- Adicionar campo de tempo de descanso aos exercícios
-- Como os exercícios estão armazenados como JSONB, não precisamos alterar a estrutura da tabela
-- Mas vou criar uma função para validar a estrutura dos exercícios
CREATE OR REPLACE FUNCTION validate_exercise_structure(exercise_data JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verifica se o exercício tem os campos obrigatórios
  IF NOT (exercise_data ? 'id' AND exercise_data ? 'name' AND exercise_data ? 'sets') THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se rest_time é um número quando presente
  IF exercise_data ? 'rest_time' AND NOT (exercise_data->>'rest_time' ~ '^[0-9]+$') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

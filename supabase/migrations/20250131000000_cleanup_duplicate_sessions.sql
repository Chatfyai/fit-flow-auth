-- Migração para limpar sessões duplicadas de treino
-- Remove sessões duplicadas mantendo apenas a mais recente para cada usuário/data

-- Primeiro, vamos identificar e remover sessões duplicadas
WITH duplicate_sessions AS (
  SELECT 
    id,
    user_id,
    date,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, date 
      ORDER BY created_at DESC
    ) as rn
  FROM workout_sessions
)
DELETE FROM workout_sessions
WHERE id IN (
  SELECT id 
  FROM duplicate_sessions 
  WHERE rn > 1
);

-- Adicionar índice único para evitar duplicatas futuras
-- Cuidado: isso pode falhar se ainda houver duplicatas
DO $$ 
BEGIN
  -- Tentar criar índice único, se falhar, significa que ainda há duplicatas
  BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_date_session 
    ON workout_sessions(user_id, date);
  EXCEPTION
    WHEN unique_violation THEN
      -- Se falhar, significa que ainda há duplicatas
      RAISE NOTICE 'Ainda existem sessões duplicadas. Executando limpeza adicional...';
      
      -- Remover duplicatas restantes de forma mais agressiva
      DELETE FROM workout_sessions 
      WHERE id NOT IN (
        SELECT DISTINCT ON (user_id, date) id
        FROM workout_sessions
        ORDER BY user_id, date, created_at DESC
      );
      
      -- Tentar criar o índice novamente
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_date_session 
      ON workout_sessions(user_id, date);
  END;
END $$;

-- Comentário explicativo
COMMENT ON INDEX idx_unique_user_date_session IS 'Garante que cada usuário tenha apenas uma sessão por data'; 
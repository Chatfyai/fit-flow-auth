-- Criar tabela para medidas corporais
CREATE TABLE public.body_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hip DECIMAL(5,2),
  right_bicep DECIMAL(5,2),
  left_bicep DECIMAL(5,2),
  right_forearm DECIMAL(5,2),
  left_forearm DECIMAL(5,2),
  right_thigh DECIMAL(5,2),
  left_thigh DECIMAL(5,2),
  right_calf DECIMAL(5,2),
  left_calf DECIMAL(5,2),
  body_fat DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuários vejam apenas suas próprias medidas
CREATE POLICY "Users can view their own measurements" 
ON public.body_measurements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements" 
ON public.body_measurements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements" 
ON public.body_measurements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurements" 
ON public.body_measurements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_body_measurements_updated_at
BEFORE UPDATE ON public.body_measurements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para melhor performance nas consultas por usuário e data
CREATE INDEX idx_body_measurements_user_date ON public.body_measurements(user_id, measurement_date DESC);
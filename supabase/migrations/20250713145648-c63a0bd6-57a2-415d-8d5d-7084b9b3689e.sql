-- Criar tabela de grupos de amigos
CREATE TABLE public.friend_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text UNIQUE NOT NULL,
  max_members integer DEFAULT 20,
  scoring_type text NOT NULL DEFAULT 'percentage',
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de membros dos grupos
CREATE TABLE public.group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  is_admin boolean NOT NULL DEFAULT false,
  total_score numeric(10,2) NOT NULL DEFAULT 0.00,
  workout_count integer NOT NULL DEFAULT 0,
  UNIQUE(group_id, user_id)
);

-- Criar tabela de convites pendentes
CREATE TABLE public.group_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text NOT NULL,
  email text,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de atividades/scores do grupo
CREATE TABLE public.group_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_session_id uuid REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  score numeric(5,2) NOT NULL DEFAULT 0.00,
  activity_type text NOT NULL DEFAULT 'workout',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.friend_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_activities ENABLE ROW LEVEL SECURITY;

-- Políticas para friend_groups
CREATE POLICY "Users can view groups they belong to" 
ON public.friend_groups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = friend_groups.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups" 
ON public.friend_groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" 
ON public.friend_groups 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = friend_groups.id AND user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Group creators can delete groups" 
ON public.friend_groups 
FOR DELETE 
USING (auth.uid() = created_by);

-- Políticas para group_members
CREATE POLICY "Users can view members of their groups" 
ON public.group_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join groups" 
ON public.group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership" 
ON public.group_members 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" 
ON public.group_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para group_invites
CREATE POLICY "Users can view invites for their groups" 
ON public.group_invites 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_invites.group_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Group members can create invites" 
ON public.group_invites 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_invites.group_id AND user_id = auth.uid()
  )
);

-- Políticas para group_activities
CREATE POLICY "Users can view activities of their groups" 
ON public.group_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_activities.group_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own activities" 
ON public.group_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" 
ON public.group_activities 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar função para gerar código de convite
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_friend_groups_updated_at
  BEFORE UPDATE ON public.friend_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar função para atualizar score do grupo quando sessão de treino é salva
CREATE OR REPLACE FUNCTION public.update_group_scores_on_workout()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir atividade para todos os grupos que o usuário participa
  INSERT INTO public.group_activities (group_id, user_id, workout_session_id, activity_date, score, activity_type)
  SELECT 
    gm.group_id,
    NEW.user_id,
    NEW.id,
    NEW.date,
    NEW.completion_percentage,
    'workout'
  FROM public.group_members gm
  JOIN public.friend_groups fg ON fg.id = gm.group_id
  WHERE gm.user_id = NEW.user_id AND fg.is_active = true;
  
  -- Atualizar score total dos membros
  UPDATE public.group_members 
  SET 
    total_score = (
      SELECT COALESCE(SUM(ga.score), 0) 
      FROM public.group_activities ga 
      WHERE ga.group_id = group_members.group_id 
      AND ga.user_id = group_members.user_id
    ),
    workout_count = (
      SELECT COUNT(*) 
      FROM public.group_activities ga 
      WHERE ga.group_id = group_members.group_id 
      AND ga.user_id = group_members.user_id 
      AND ga.activity_type = 'workout'
    )
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar scores quando workout session é inserida/atualizada
CREATE TRIGGER update_group_scores_trigger
  AFTER INSERT OR UPDATE ON public.workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_scores_on_workout();
-- Create enum types for category, priority and goal type
CREATE TYPE goal_category AS ENUM ('strength', 'cardio', 'weight', 'habit', 'endurance', 'flexibility', 'nutrition', 'other');
CREATE TYPE goal_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE goal_type AS ENUM ('numeric', 'time', 'boolean', 'frequency');

-- Create the user_goals table
CREATE TABLE public.user_goals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    category goal_category NOT NULL,
    goal_type goal_type NOT NULL DEFAULT 'numeric',
    target_value numeric NOT NULL,
    current_value numeric NOT NULL DEFAULT 0,
    unit character varying NOT NULL,
    frequency_target numeric,
    frequency_period character varying CHECK (frequency_period IN ('daily', 'weekly', 'monthly')),
    start_date date NOT NULL DEFAULT CURRENT_DATE,
    deadline date,
    priority goal_priority NOT NULL DEFAULT 'medium',
    completed boolean NOT NULL DEFAULT false,
    completed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_goals_pkey PRIMARY KEY (id),
    CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create table for goal progress tracking
CREATE TABLE public.goal_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    goal_id uuid NOT NULL,
    value numeric NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT goal_progress_pkey PRIMARY KEY (id),
    CONSTRAINT goal_progress_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.user_goals(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user_goals
CREATE POLICY "Allow users to see their own goals" ON public.user_goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own goals" ON public.user_goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own goals" ON public.user_goals
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own goals" ON public.user_goals
FOR DELETE USING (auth.uid() = user_id);

-- Create policies for goal_progress
CREATE POLICY "Allow users to see progress of their own goals" ON public.goal_progress
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_goals 
        WHERE user_goals.id = goal_progress.goal_id 
        AND user_goals.user_id = auth.uid()
    )
);

CREATE POLICY "Allow users to insert progress for their own goals" ON public.goal_progress
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_goals 
        WHERE user_goals.id = goal_progress.goal_id 
        AND user_goals.user_id = auth.uid()
    )
);

CREATE POLICY "Allow users to update progress of their own goals" ON public.goal_progress
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.user_goals 
        WHERE user_goals.id = goal_progress.goal_id 
        AND user_goals.user_id = auth.uid()
    )
);

CREATE POLICY "Allow users to delete progress of their own goals" ON public.goal_progress
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.user_goals 
        WHERE user_goals.id = goal_progress.goal_id 
        AND user_goals.user_id = auth.uid()
    )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_goals_updated_at 
    BEFORE UPDATE ON public.user_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_user_goals_completed ON public.user_goals(completed);
CREATE INDEX idx_user_goals_category ON public.user_goals(category);
CREATE INDEX idx_user_goals_priority ON public.user_goals(priority);
CREATE INDEX idx_goal_progress_goal_id ON public.goal_progress(goal_id);
CREATE INDEX idx_goal_progress_date ON public.goal_progress(date); 
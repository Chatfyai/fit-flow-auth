-- Create enum types for category and priority
CREATE TYPE goal_category AS ENUM ('strength', 'cardio', 'weight', 'habit', 'endurance');
CREATE TYPE goal_priority AS ENUM ('high', 'medium', 'low');

-- Create the user_goals table
CREATE TABLE public.user_goals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    category goal_category NOT NULL,
    target_value numeric NOT NULL,
    current_value numeric NOT NULL DEFAULT 0,
    unit character varying NOT NULL,
    deadline date,
    priority goal_priority NOT NULL DEFAULT 'medium',
    completed boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_goals_pkey PRIMARY KEY (id),
    CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for user_goals
CREATE POLICY "Allow users to see their own goals" ON public.user_goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own goals" ON public.user_goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own goals" ON public.user_goals
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own goals" ON public.user_goals
FOR DELETE USING (auth.uid() = user_id);

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
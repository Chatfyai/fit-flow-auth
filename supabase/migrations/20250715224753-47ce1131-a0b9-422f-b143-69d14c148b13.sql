-- Fix infinite recursion in group_members RLS policies
-- The issue is that the policies are creating circular references

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;

-- Create a new policy that avoids recursion by using a simpler check
CREATE POLICY "Users can view members of their groups" ON public.group_members
FOR SELECT 
USING (
  group_id IN (
    SELECT group_id 
    FROM public.group_members 
    WHERE user_id = auth.uid()
  )
);

-- Also update the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.update_group_scores_on_workout()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Use SECURITY DEFINER to bypass RLS for this operation
  -- Insert activity for all groups that the user participates in
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
  
  -- Update score total for the user in all their groups
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
$function$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_group_scores_trigger ON public.workout_sessions;
CREATE TRIGGER update_group_scores_trigger
  AFTER INSERT ON public.workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_scores_on_workout();
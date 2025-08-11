-- Add Islamic settings to families table
ALTER TABLE public.families 
ADD COLUMN IF NOT EXISTS islamic_settings JSONB DEFAULT '{
  "prayer_calculation_method": "umm_al_qura",
  "madhab": "hanafi",
  "islamic_holidays": true,
  "halal_rewards_only": true,
  "arabic_interface": false,
  "strict_content_filtering": true
}'::jsonb;

-- Add Islamic profile and learning schedule to children table
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS islamic_profile JSONB DEFAULT '{
  "arabic_reading_level": "beginner",
  "islamic_knowledge_level": "beginner",
  "quran_memorization_goal": "short_surahs",
  "prayer_independence_level": "needs_help",
  "islamic_personality_type": "curious_learner"
}'::jsonb,
ADD COLUMN IF NOT EXISTS learning_schedule JSONB DEFAULT '{
  "daily_quran_minutes": 15,
  "weekly_hadith_stories": 2,
  "islamic_story_frequency": "daily",
  "prayer_reminder_method": "gentle",
  "preferred_learning_time": "after_maghrib"
}'::jsonb;

-- Create prayer calculation methods table
CREATE TABLE IF NOT EXISTS public.prayer_calculation_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fajr_angle NUMERIC(4,2),
  isha_angle NUMERIC(4,2),
  maghrib_angle NUMERIC(4,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert common prayer calculation methods
INSERT INTO public.prayer_calculation_methods (name, description, fajr_angle, isha_angle, maghrib_angle) VALUES
('Umm al-Qura', 'Used in Saudi Arabia', 18.5, 90, 90),
('Egyptian General Authority', 'Used in Egypt', 19.5, 17.5, 90),
('University of Islamic Sciences, Karachi', 'Used in Pakistan', 18, 18, 90),
('Islamic Society of North America (ISNA)', 'Used in North America', 15, 15, 90),
('Muslim World League', 'Conservative calculation', 18, 17, 90),
('Shia Ithna-Ashari', 'Used by Shia communities', 16, 14, 90)
ON CONFLICT DO NOTHING;

-- Create Islamic personality types table
CREATE TABLE IF NOT EXISTS public.islamic_personality_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  companion_type TEXT,
  learning_style TEXT,
  motivation_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert Islamic personality types
INSERT INTO public.islamic_personality_types (name, description, companion_type, learning_style, motivation_method) VALUES
('Curious Learner', 'Loves asking questions about Islamic teachings', 'wise_scholar', 'interactive_questions', 'knowledge_rewards'),
('Gentle Soul', 'Responds well to kind and patient guidance', 'caring_teacher', 'story_based', 'encouragement'),
('Active Explorer', 'Learns best through activities and games', 'adventurous_guide', 'hands_on_activities', 'achievement_badges'),
('Thoughtful Contemplator', 'Enjoys deep thinking about Islamic values', 'reflective_mentor', 'discussion_based', 'wisdom_points'),
('Social Helper', 'Motivated by helping others and community service', 'community_leader', 'group_activities', 'good_deed_tracking')
ON CONFLICT DO NOTHING;

-- Create Islamic learning goals table
CREATE TABLE IF NOT EXISTS public.islamic_learning_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('quran', 'hadith', 'prayer', 'arabic', 'islamic_values', 'good_deeds')),
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER,
  current_progress INTEGER DEFAULT 0,
  target_date DATE,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  points_reward INTEGER DEFAULT 10,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family Islamic preferences table
CREATE TABLE IF NOT EXISTS public.family_islamic_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  preference_type TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prayer_calculation_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_personality_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_islamic_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prayer calculation methods (public read)
CREATE POLICY "Prayer calculation methods are viewable by everyone" 
ON public.prayer_calculation_methods 
FOR SELECT 
USING (true);

-- Create RLS policies for Islamic personality types (public read)
CREATE POLICY "Islamic personality types are viewable by everyone" 
ON public.islamic_personality_types 
FOR SELECT 
USING (true);

-- Create RLS policies for Islamic learning goals
CREATE POLICY "Users can view their family's learning goals" 
ON public.islamic_learning_goals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM children c 
    JOIN users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid()
  )
);

CREATE POLICY "Parents can create learning goals for their children" 
ON public.islamic_learning_goals 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM children c 
    JOIN users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid() AND u.role = 'parent'
  )
);

CREATE POLICY "Parents can update learning goals for their children" 
ON public.islamic_learning_goals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM children c 
    JOIN users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid() AND u.role = 'parent'
  )
);

-- Create RLS policies for family Islamic preferences
CREATE POLICY "Users can view their family's Islamic preferences" 
ON public.family_islamic_preferences 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.family_id = family_id AND u.id = auth.uid()
  )
);

CREATE POLICY "Parents can manage their family's Islamic preferences" 
ON public.family_islamic_preferences 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.family_id = family_id AND u.id = auth.uid() AND u.role = 'parent'
  )
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_islamic_learning_goals_updated_at
BEFORE UPDATE ON public.islamic_learning_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_islamic_preferences_updated_at
BEFORE UPDATE ON public.family_islamic_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get child's Islamic analytics
CREATE OR REPLACE FUNCTION public.get_child_islamic_analytics(child_uuid uuid)
RETURNS json
LANGUAGE plpgsql
AS $function$
DECLARE
  result JSON;
  quran_goals INTEGER;
  prayer_goals INTEGER;
  arabic_goals INTEGER;
  completed_goals INTEGER;
  total_islamic_points INTEGER;
BEGIN
  -- Count goals by type
  SELECT 
    COUNT(*) FILTER (WHERE goal_type = 'quran') INTO quran_goals,
    COUNT(*) FILTER (WHERE goal_type = 'prayer') INTO prayer_goals,
    COUNT(*) FILTER (WHERE goal_type = 'arabic') INTO arabic_goals,
    COUNT(*) FILTER (WHERE is_completed = true) INTO completed_goals
  FROM islamic_learning_goals 
  WHERE child_id = child_uuid;

  -- Calculate total Islamic points
  SELECT COALESCE(SUM(points_reward), 0) INTO total_islamic_points
  FROM islamic_learning_goals 
  WHERE child_id = child_uuid AND is_completed = true;

  SELECT json_build_object(
    'child_id', child_uuid,
    'quran_goals', quran_goals,
    'prayer_goals', prayer_goals,
    'arabic_goals', arabic_goals,
    'completed_goals', completed_goals,
    'total_islamic_points', total_islamic_points,
    'goal_completion_rate', 
      CASE 
        WHEN (quran_goals + prayer_goals + arabic_goals) > 0 
        THEN ROUND((completed_goals::FLOAT / (quran_goals + prayer_goals + arabic_goals)) * 100, 2)
        ELSE 0 
      END
  ) INTO result;
  
  RETURN result;
END;
$function$;
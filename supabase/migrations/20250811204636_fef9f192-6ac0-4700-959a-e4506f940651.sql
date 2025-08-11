-- Add Islamic settings to families table
ALTER TABLE public.families 
ADD COLUMN IF NOT EXISTS islamic_settings JSONB
DEFAULT '{}';

-- Add Islamic profile and learning schedule to children table
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS islamic_profile JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS learning_schedule JSONB DEFAULT '{}';

-- Create prayer calculation methods table
CREATE TABLE IF NOT EXISTS public.prayer_calculation_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parameters JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Islamic personality types table
CREATE TABLE IF NOT EXISTS public.islamic_personality_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  companion_type VARCHAR(50),
  learning_style JSONB DEFAULT '{}',
  preferred_activities JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Islamic learning goals table
CREATE TABLE IF NOT EXISTS public.islamic_learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_value INTEGER DEFAULT 1,
  current_value INTEGER DEFAULT 0,
  deadline DATE,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create family Islamic preferences table
CREATE TABLE IF NOT EXISTS public.family_islamic_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  prayer_method_id UUID,
  preferred_language VARCHAR(10) DEFAULT 'en',
  qibla_direction NUMERIC(5,2),
  hijri_calendar_preference JSONB DEFAULT '{}',
  learning_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.prayer_calculation_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_personality_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_islamic_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for prayer_calculation_methods
CREATE POLICY "Everyone can view prayer methods" ON public.prayer_calculation_methods
FOR SELECT USING (true);

-- RLS policies for islamic_personality_types
CREATE POLICY "Everyone can view personality types" ON public.islamic_personality_types
FOR SELECT USING (true);

-- RLS policies for islamic_learning_goals
CREATE POLICY "Family members can manage learning goals" ON public.islamic_learning_goals
FOR ALL USING (
  child_id IN (
    SELECT c.id FROM children c
    JOIN users u ON u.family_id = c.family_id
    WHERE u.id = auth.uid()
  )
);

-- RLS policies for family_islamic_preferences
CREATE POLICY "Family members can manage islamic preferences" ON public.family_islamic_preferences
FOR ALL USING (
  family_id IN (
    SELECT u.family_id FROM users u
    WHERE u.id = auth.uid() AND u.family_id IS NOT NULL
  )
);

-- Insert default prayer calculation methods
INSERT INTO public.prayer_calculation_methods (name, description, parameters, is_default) VALUES
('Umm al-Qura University', 'Used in Saudi Arabia', '{"fajr_angle": 18.5, "maghrib_method": "sunset", "isha_angle": null, "isha_minutes": 90}', true),
('Islamic Society of North America (ISNA)', 'Commonly used in North America', '{"fajr_angle": 15, "maghrib_method": "sunset", "isha_angle": 15}', false),
('Muslim World League (MWL)', 'Global standard method', '{"fajr_angle": 18, "maghrib_method": "sunset", "isha_angle": 17}', false),
('Egyptian General Authority', 'Used in Egypt', '{"fajr_angle": 19.5, "maghrib_method": "sunset", "isha_angle": 17.5}', false);

-- Insert default Islamic personality types
INSERT INTO public.islamic_personality_types (name, description, companion_type, learning_style, preferred_activities) VALUES
('Contemplative Scholar', 'Reflective and thoughtful, loves deep learning', 'wise_owl', '{"style": "analytical", "pace": "slow", "depth": "deep"}', '["quran_study", "hadith_reflection", "islamic_history"]'),
('Cheerful Helper', 'Energetic and helpful, learns through action', 'friendly_cat', '{"style": "kinesthetic", "pace": "fast", "depth": "practical"}', '["good_deeds", "community_service", "interactive_games"]'),
('Gentle Listener', 'Calm and attentive, learns through stories', 'peaceful_dove', '{"style": "auditory", "pace": "moderate", "depth": "moderate"}', '["story_listening", "nasheed", "group_discussions"]'),
('Creative Explorer', 'Imaginative and curious, learns through discovery', 'playful_dolphin', '{"style": "visual", "pace": "variable", "depth": "broad"}', '["art_crafts", "nature_exploration", "creative_expression"]');

-- Create trigger to update timestamps
CREATE TRIGGER update_islamic_learning_goals_updated_at
  BEFORE UPDATE ON public.islamic_learning_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_islamic_preferences_updated_at
  BEFORE UPDATE ON public.family_islamic_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get child Islamic analytics
CREATE OR REPLACE FUNCTION public.get_child_islamic_analytics(child_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  prayer_streak INTEGER;
  quran_progress INTEGER;
  learning_goals_completed INTEGER;
  personality_match JSON;
BEGIN
  -- Get current prayer streak
  SELECT calculate_prayer_streak(child_uuid) INTO prayer_streak;
  
  -- Get Quran progress
  SELECT COALESCE(SUM(verses_memorized), 0) INTO quran_progress
  FROM quran_progress WHERE child_id = child_uuid;
  
  -- Get completed learning goals count
  SELECT COUNT(*) INTO learning_goals_completed
  FROM islamic_learning_goals 
  WHERE child_id = child_uuid AND status = 'completed';
  
  -- Get personality type info
  SELECT to_json(ipt.*) INTO personality_match
  FROM islamic_personality_types ipt
  JOIN children c ON c.islamic_profile->>'personality_type' = ipt.name
  WHERE c.id = child_uuid;
  
  -- Build result
  SELECT json_build_object(
    'child_id', child_uuid,
    'prayer_streak', prayer_streak,
    'quran_verses_memorized', quran_progress,
    'learning_goals_completed', learning_goals_completed,
    'personality_match', personality_match,
    'islamic_level', (SELECT islamic_level FROM children WHERE id = child_uuid),
    'companion_type', (SELECT companion_type FROM children WHERE id = child_uuid)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
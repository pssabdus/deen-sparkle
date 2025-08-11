-- Create Islamic motivation system tables

-- Islamic motivational content database
CREATE TABLE public.islamic_motivational_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'verse', 'hadith', 'dua', 'story', 'wisdom'
  arabic_text TEXT,
  transliteration TEXT,
  english_translation TEXT NOT NULL,
  source_reference TEXT NOT NULL, -- Quran chapter:verse or Hadith reference
  theme TEXT NOT NULL, -- 'perseverance', 'patience', 'gratitude', 'effort', etc.
  age_group TEXT NOT NULL, -- 'child', 'teen', 'adult', 'all'
  occasion TEXT, -- 'prayer_completion', 'difficulty', 'achievement', 'daily_reminder'
  authenticity_level TEXT DEFAULT 'verified', -- 'verified', 'authentic', 'good'
  emotional_tone TEXT, -- 'encouraging', 'comforting', 'inspiring', 'gentle'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Child spiritual engagement patterns
CREATE TABLE public.child_spiritual_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'prayer_timing', 'consistency', 'engagement_level', 'motivation_level'
  pattern_data JSONB NOT NULL DEFAULT '{}',
  observed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confidence_score DECIMAL(3,2) DEFAULT 0.7, -- How confident we are in this pattern
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Personalized Islamic encouragement log
CREATE TABLE public.islamic_encouragements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.islamic_motivational_content(id),
  trigger_reason TEXT NOT NULL, -- 'low_motivation', 'achievement', 'consistency', 'difficulty'
  personalization_data JSONB DEFAULT '{}',
  delivered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  child_response TEXT, -- 'positive', 'neutral', 'needs_support'
  effectiveness_score DECIMAL(3,2), -- Track how well this worked
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Islamic special days and themed activities
CREATE TABLE public.islamic_special_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_arabic TEXT,
  name_english TEXT NOT NULL,
  description TEXT NOT NULL,
  date_type TEXT NOT NULL, -- 'fixed', 'lunar', 'calculated'
  date_value TEXT, -- ISO date or lunar date calculation
  activities JSONB DEFAULT '[]',
  educational_content JSONB DEFAULT '{}',
  age_recommendations TEXT DEFAULT 'all',
  family_activities JSONB DEFAULT '[]',
  significance TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Islamic companion personalities
CREATE TABLE public.islamic_companion_personalities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  personality_traits JSONB NOT NULL DEFAULT '{}',
  motivation_style TEXT NOT NULL, -- 'gentle', 'enthusiastic', 'wise', 'playful'
  preferred_content_types TEXT[] DEFAULT ARRAY['verse', 'hadith', 'story'],
  interaction_patterns JSONB DEFAULT '{}',
  islamic_characteristics JSONB DEFAULT '{}', -- Patience, wisdom, kindness levels
  age_suitability TEXT DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Child's current companion configuration
CREATE TABLE public.child_companion_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  personality_id UUID NOT NULL REFERENCES public.islamic_companion_personalities(id),
  customizations JSONB DEFAULT '{}',
  effectiveness_metrics JSONB DEFAULT '{}',
  last_adapted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id)
);

-- Family Islamic insights and analytics
CREATE TABLE public.family_islamic_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'optimal_prayer_time', 'learning_pattern', 'motivation_trend'
  insight_data JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confidence_level DECIMAL(3,2) DEFAULT 0.8,
  actionable_recommendations TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Islamic surprise rewards system
CREATE TABLE public.islamic_surprise_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL, -- 'bonus_points', 'special_content', 'achievement_unlock'
  reward_data JSONB NOT NULL DEFAULT '{}',
  trigger_reason TEXT NOT NULL, -- 'consistency', 'improvement', 'special_day'
  islamic_significance TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  child_reaction TEXT, -- 'delighted', 'surprised', 'motivated'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.islamic_motivational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_spiritual_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_encouragements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_special_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_companion_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_companion_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_islamic_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_surprise_rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Everyone can view motivational content" 
ON public.islamic_motivational_content FOR SELECT USING (true);

CREATE POLICY "Family can view child patterns" 
ON public.child_spiritual_patterns FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children c 
    JOIN public.users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid()
  )
);

CREATE POLICY "System can manage child patterns" 
ON public.child_spiritual_patterns FOR ALL 
USING (true);

CREATE POLICY "Family can view encouragements" 
ON public.islamic_encouragements FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children c 
    JOIN public.users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid()
  )
);

CREATE POLICY "System can manage encouragements" 
ON public.islamic_encouragements FOR ALL 
USING (true);

CREATE POLICY "Everyone can view special days" 
ON public.islamic_special_days FOR SELECT USING (true);

CREATE POLICY "Everyone can view companion personalities" 
ON public.islamic_companion_personalities FOR SELECT USING (true);

CREATE POLICY "Family can manage companion config" 
ON public.child_companion_config FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.children c 
    JOIN public.users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid()
  )
);

CREATE POLICY "Family can view insights" 
ON public.family_islamic_insights FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.family_id = family_id AND u.id = auth.uid()
  )
);

CREATE POLICY "System can manage insights" 
ON public.family_islamic_insights FOR ALL 
USING (true);

CREATE POLICY "Family can view surprise rewards" 
ON public.islamic_surprise_rewards FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children c 
    JOIN public.users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid()
  )
);

CREATE POLICY "System can manage surprise rewards" 
ON public.islamic_surprise_rewards FOR ALL 
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_islamic_motivational_content_updated_at
BEFORE UPDATE ON public.islamic_motivational_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_child_companion_config_updated_at
BEFORE UPDATE ON public.child_companion_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
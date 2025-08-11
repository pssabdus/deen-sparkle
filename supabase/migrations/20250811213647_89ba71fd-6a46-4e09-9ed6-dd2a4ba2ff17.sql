-- Create Islamic motivation system tables

-- Islamic motivational content (verses, hadith, stories)
CREATE TABLE public.islamic_motivational_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'quran_verse', 'hadith', 'story', 'dua'
  arabic_text TEXT,
  transliteration TEXT,
  english_translation TEXT NOT NULL,
  reference_source TEXT, -- Book, chapter, verse number
  authenticity_level TEXT DEFAULT 'authentic', -- 'authentic', 'good', 'verified'
  themes JSONB DEFAULT '[]', -- ['perseverance', 'patience', 'prayer', etc.]
  age_groups JSONB DEFAULT '["all"]', -- ['5-8', '9-12', '13-18', 'all']
  motivation_context TEXT NOT NULL, -- 'encouragement', 'guidance', 'celebration'
  spiritual_benefit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Child spiritual patterns and engagement tracking
CREATE TABLE public.child_spiritual_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  pattern_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prayer_consistency_score INTEGER DEFAULT 0, -- 0-100
  quran_engagement_level INTEGER DEFAULT 0, -- 0-100
  learning_enthusiasm INTEGER DEFAULT 0, -- 0-100
  spiritual_reflection_time INTEGER DEFAULT 0, -- minutes
  positive_behavior_instances INTEGER DEFAULT 0,
  motivation_level TEXT DEFAULT 'moderate', -- 'low', 'moderate', 'high'
  preferred_motivation_type TEXT DEFAULT 'encouragement', -- 'encouragement', 'challenge', 'story'
  optimal_learning_times JSONB DEFAULT '[]', -- ['fajr', 'maghrib', etc.]
  pattern_insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id, pattern_date)
);

-- Islamic encouragements sent to children
CREATE TABLE public.islamic_encouragements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.islamic_motivational_content(id),
  trigger_reason TEXT NOT NULL, -- 'consistent_prayer', 'low_motivation', 'celebration'
  delivery_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  was_delivered BOOLEAN DEFAULT false,
  child_response TEXT, -- 'positive', 'neutral', 'no_response'
  effectiveness_score INTEGER, -- 1-10
  companion_personality TEXT NOT NULL,
  personalization_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Islamic special days and themed activities
CREATE TABLE public.islamic_special_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_arabic TEXT,
  name_english TEXT NOT NULL,
  description TEXT NOT NULL,
  date_type TEXT NOT NULL, -- 'hijri_fixed', 'gregorian_weekly', 'custom'
  date_value TEXT NOT NULL, -- '1-muharram', 'friday', '2024-03-15'
  themes JSONB DEFAULT '[]',
  special_activities JSONB DEFAULT '[]',
  educational_content JSONB DEFAULT '{}',
  family_activities JSONB DEFAULT '[]',
  special_rewards JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Islamic companion personalities
CREATE TABLE public.islamic_companion_personalities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  personality_type TEXT NOT NULL, -- 'encouraging', 'wise', 'playful', 'scholarly'
  description TEXT NOT NULL,
  communication_style JSONB NOT NULL, -- voice tone, message style
  motivation_approaches JSONB NOT NULL, -- preferred methods
  islamic_characteristics JSONB NOT NULL, -- values emphasized
  age_suitability JSONB DEFAULT '["all"]',
  example_phrases JSONB DEFAULT '[]',
  avatar_style TEXT,
  voice_characteristics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Child companion configuration
CREATE TABLE public.child_companion_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  personality_id UUID NOT NULL REFERENCES public.islamic_companion_personalities(id),
  adaptation_data JSONB DEFAULT '{}', -- learned preferences
  effectiveness_metrics JSONB DEFAULT '{}',
  last_personality_change TIMESTAMP WITH TIME ZONE,
  change_reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id)
);

-- Family Islamic insights and analytics
CREATE TABLE public.family_islamic_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  insight_date DATE NOT NULL DEFAULT CURRENT_DATE,
  insight_type TEXT NOT NULL, -- 'optimal_times', 'motivation_patterns', 'spiritual_growth'
  insights_data JSONB NOT NULL,
  recommendations JSONB DEFAULT '[]',
  confidence_score INTEGER DEFAULT 50, -- 0-100
  affected_children JSONB DEFAULT '[]', -- child IDs
  parent_actions_suggested JSONB DEFAULT '[]',
  implementation_status TEXT DEFAULT 'pending', -- 'pending', 'implemented', 'ignored'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Islamic surprise rewards
CREATE TABLE public.islamic_surprise_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL, -- 'bonus_points', 'special_story', 'dua_collection'
  trigger_achievement TEXT NOT NULL,
  reward_content JSONB NOT NULL,
  points_awarded INTEGER DEFAULT 0,
  was_delivered BOOLEAN DEFAULT false,
  delivery_time TIMESTAMP WITH TIME ZONE,
  child_reaction TEXT, -- 'delighted', 'pleased', 'neutral'
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

CREATE POLICY "Family members can view child patterns" 
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

CREATE POLICY "Family members can view encouragements" 
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

CREATE POLICY "Family members can view companion config" 
ON public.child_companion_config FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children c 
    JOIN public.users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid()
  )
);

CREATE POLICY "Family members can update companion config" 
ON public.child_companion_config FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.children c 
    JOIN public.users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid()
  )
);

CREATE POLICY "Parents can view family insights" 
ON public.family_islamic_insights FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.family_id = family_id AND u.id = auth.uid() AND u.role = 'parent'
  )
);

CREATE POLICY "System can manage family insights" 
ON public.family_islamic_insights FOR ALL 
USING (true);

CREATE POLICY "Family members can view surprise rewards" 
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

CREATE TRIGGER update_child_spiritual_patterns_updated_at
BEFORE UPDATE ON public.child_spiritual_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_islamic_special_days_updated_at
BEFORE UPDATE ON public.islamic_special_days
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_islamic_companion_personalities_updated_at
BEFORE UPDATE ON public.islamic_companion_personalities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_child_companion_config_updated_at
BEFORE UPDATE ON public.child_companion_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_islamic_insights_updated_at
BEFORE UPDATE ON public.family_islamic_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial motivational content
INSERT INTO public.islamic_motivational_content (content_type, arabic_text, transliteration, english_translation, reference_source, themes, motivation_context, spiritual_benefit) VALUES
('quran_verse', 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', 'Wa man yattaqi Allah yaj''al lahu makhrajan', 'And whoever fears Allah - He will make for him a way out', 'Quran 65:2', '["perseverance", "trust", "guidance"]', 'encouragement', 'Builds trust in Allah during difficulties'),

('hadith', 'إن الله يحب إذا عمل أحدكم عملا أن يتقنه', 'Inna Allah yuhibbu idha amila ahadukum amalan an yutqinahu', 'Verily, Allah loves when one of you does a job, he does it with excellence', 'Sahih - Shuab al-Iman 4928', '["excellence", "effort", "worship"]', 'encouragement', 'Motivates excellence in all actions'),

('dua', 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhab an-nar', 'Our Lord, give us good in this world and good in the next world, and save us from the punishment of the Fire', 'Quran 2:201', '["balance", "dua", "guidance"]', 'guidance', 'Teaches balanced approach to life'),

('story', '', '', 'Prophet Muhammad (PBUH) said: Make things easy and do not make them difficult, give glad tidings and do not repel people.', 'Sahih al-Bukhari 69', '["gentleness", "encouragement", "teaching"]', 'guidance', 'Shows the prophetic way of motivation'),

('quran_verse', 'وَلاَ تَيْأَسُواْ مِن رَّوْحِ اللّهِ', 'Wa la tayasu min rawhi Allah', 'And do not despair of the mercy of Allah', 'Quran 12:87', '["hope", "perseverance", "mercy"]', 'encouragement', 'Instills hope during challenging times');

-- Insert companion personalities
INSERT INTO public.islamic_companion_personalities (name, personality_type, description, communication_style, motivation_approaches, islamic_characteristics, example_phrases) VALUES
('Nuriya the Gentle Guide', 'encouraging', 'A warm and nurturing companion who emphasizes Allah mercy and gradual improvement', 
'{"tone": "warm", "pace": "calm", "approach": "supportive"}',
'["gentle_reminders", "celebration_of_small_wins", "mercy_focused"]',
'{"emphasizes": ["Allah_mercy", "gradual_progress", "self_compassion"], "values": ["patience", "kindness", "growth"]}',
'["MashaAllah, you are growing so beautifully in your Islam!", "Allah loves your sincere efforts", "Every small step counts with Allah"]'),

('Hakim the Wise Scholar', 'scholarly', 'A knowledgeable companion who shares Islamic wisdom and connects actions to deeper meanings',
'{"tone": "wise", "pace": "thoughtful", "approach": "educational"}',
'["story_telling", "wisdom_sharing", "meaning_connection"]',
'{"emphasizes": ["islamic_knowledge", "wisdom", "understanding"], "values": ["learning", "reflection", "depth"]}',
'["Let me share a beautiful story from our Islamic heritage", "Do you know why this practice is so blessed?", "Our Prophet (PBUH) taught us..."]'),

('Saeed the Joyful Friend', 'playful', 'An enthusiastic companion who makes Islamic practice fun and celebrates achievements',
'{"tone": "enthusiastic", "pace": "energetic", "approach": "celebratory"}',
'["gamification", "celebration", "energy_building"]',
'{"emphasizes": ["joy_in_worship", "celebration", "community"], "values": ["happiness", "gratitude", "sharing"]}',
'["Allahu Akbar! What an amazing accomplishment!", "Let us celebrate this blessed moment!", "Your Islamic journey is so inspiring!"]);

-- Insert special Islamic days
INSERT INTO public.islamic_special_days (name_english, description, date_type, date_value, themes, special_activities, educational_content) VALUES
('Jumuah Friday Blessings', 'Weekly celebration of the blessed day of Friday', 'gregorian_weekly', 'friday',
'["community", "prayer", "reflection"]',
'["special_friday_prayers", "family_dua_time", "charity_activities"]',
'{"focus": "Friday_virtues", "stories": ["Prophet_Friday_teachings"], "duas": ["friday_specific_supplications"]}'),

('Night of Power Preparation', 'Special preparation activities for Laylat al-Qadr', 'hijri_fixed', '27-ramadan',
'["spiritual_peak", "quran", "dua"]',
'["extra_quran_reading", "special_night_prayers", "family_dua_circle"]',
'{"focus": "Laylat_al_Qadr_significance", "stories": ["revelation_stories"], "duas": ["night_of_power_supplications"]}'),

('Monthly Islamic Reflection Day', 'Monthly family Islamic reflection and planning', 'custom_monthly', 'first_friday',
'["reflection", "planning", "family_bonding"]',
'["family_islamic_goals_review", "gratitude_sharing", "next_month_planning"]',
'{"focus": "spiritual_growth_tracking", "activities": ["family_discussion"], "reflection": ["monthly_islamic_progress"]}');
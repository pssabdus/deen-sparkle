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

-- Insert initial Islamic motivational content
INSERT INTO public.islamic_motivational_content (content_type, arabic_text, transliteration, english_translation, source_reference, theme, age_group, occasion, emotional_tone) VALUES

-- Quranic verses for motivation
('verse', 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', 'Wa man yattaqi Allaha yaj''al lahu makhrajan', 'And whoever fears Allah - He will make for him a way out', 'Quran 65:2', 'perseverance', 'all', 'difficulty', 'comforting'),

('verse', 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', 'Fa inna ma''al ''usri yusra', 'Indeed, with hardship comes ease', 'Quran 94:6', 'hope', 'all', 'difficulty', 'encouraging'),

('verse', 'وَاللَّهُ خَيْرٌ حَافِظًا ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ', 'WaAllahu khayrun hafidhan wa huwa arham ar-rahimeen', 'But Allah is the best protector, and He is the most merciful of the merciful', 'Quran 12:64', 'trust', 'all', 'daily_reminder', 'comforting'),

('verse', 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', 'Rabbana atina fi\'d-dunya hasanatan wa fi\'l-akhirati hasanatan', 'Our Lord, give us good in this world and good in the next world', 'Quran 2:201', 'dua', 'all', 'daily_reminder', 'inspiring'),

-- Hadith for motivation
('hadith', 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ', 'Innama''l-a''malu bi''n-niyyat', 'Actions are but by intention', 'Bukhari & Muslim', 'effort', 'all', 'achievement', 'inspiring'),

('hadith', 'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ', 'Ahabbu''l-a''mali ila Allahi adwamuha wa in qall', 'The most beloved of deeds to Allah are those that are most consistent, even if they are few', 'Bukhari & Muslim', 'consistency', 'all', 'prayer_completion', 'encouraging'),

('hadith', 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ', 'Al-mu''minu''l-qawiyyu khayrun wa ahabbu ila Allahi min al-mu''mini''d-da''eef', 'The strong believer is better and more beloved to Allah than the weak believer', 'Muslim', 'strength', 'teen', 'achievement', 'inspiring'),

-- Duas for children
('dua', 'رَبِّ اشْرَحْ لِي صَدْرِي', 'Rabbi ishrah li sadri', 'My Lord, expand for me my chest [grant me confidence]', 'Quran 20:25', 'confidence', 'child', 'difficulty', 'encouraging'),

('dua', 'رَبِّ زِدْنِي عِلْمًا', 'Rabbi zidni ''ilma', 'My Lord, increase me in knowledge', 'Quran 20:114', 'learning', 'all', 'daily_reminder', 'inspiring'),

('dua', 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', 'Allahumma a''inni ''ala dhikrika wa shukrika wa husni ''ibadatik', 'O Allah, help me to remember You, thank You, and worship You excellently', 'Abu Dawud', 'worship', 'all', 'prayer_completion', 'gentle'),

-- Stories and wisdom
('story', '', '', 'Prophet Muhammad (peace be upon him) said: A person is not a believer who fills his stomach while his neighbor goes hungry.', 'Various sources', 'kindness', 'child', 'daily_reminder', 'gentle'),

('wisdom', '', '', 'Every small step towards Allah is a victory. Even the intention to do good is rewarded.', 'Islamic teaching', 'encouragement', 'child', 'difficulty', 'encouraging'),

('wisdom', '', '', 'Allah does not burden a soul beyond what it can bear. You are stronger than you think.', 'Based on Quran 2:286', 'strength', 'all', 'difficulty', 'comforting');

-- Insert Islamic companion personalities
INSERT INTO public.islamic_companion_personalities (name, description, motivation_style, personality_traits, islamic_characteristics, age_suitability) VALUES

('Gentle Wisdom Angel', 'A patient and wise companion who offers gentle guidance following the prophetic example of kindness', 'gentle', '{"patience": 9, "wisdom": 9, "playfulness": 4, "enthusiasm": 6}', '{"follows_prophetic_example": true, "emphasizes_mercy": true, "patient_teaching": true}', 'all'),

('Encouraging Star', 'An enthusiastic companion who celebrates every small achievement and motivates with positive Islamic teachings', 'enthusiastic', '{"patience": 7, "wisdom": 7, "playfulness": 8, "enthusiasm": 9}', '{"celebrates_effort": true, "positive_reinforcement": true, "growth_mindset": true}', 'child'),

('Wise Mentor', 'A knowledgeable companion who provides deeper Islamic insights and helps with complex spiritual questions', 'wise', '{"patience": 8, "wisdom": 10, "playfulness": 3, "enthusiasm": 6}', '{"scholarly_approach": true, "deep_understanding": true, "contextual_teaching": true}', 'teen'),

('Playful Friend', 'A joyful companion who makes Islamic learning fun while maintaining respect for sacred teachings', 'playful', '{"patience": 6, "wisdom": 6, "playfulness": 9, "enthusiasm": 8}', '{"makes_learning_fun": true, "age_appropriate": true, "respectful_joy": true}', 'child');

-- Insert Islamic special days
INSERT INTO public.islamic_special_days (name_arabic, name_english, description, date_type, activities, educational_content, significance) VALUES

('الجمعة المباركة', 'Blessed Friday', 'Weekly day of congregation and increased spiritual focus', 'weekly', 
'[{"name": "Family Quran Reading", "duration": "30 minutes"}, {"name": "Gratitude Circle", "duration": "15 minutes"}]',
'{"significance": "Day of gathering, increased prayers and remembrance", "prophetic_guidance": "Make abundant dua between Asr and Maghrib"}',
'Weekly spiritual renewal and family bonding'),

('العشر الأواخر من رمضان', 'Last Ten Nights of Ramadan', 'Most blessed nights including Laylat al-Qadr', 'lunar',
'[{"name": "Night Prayer", "duration": "variable"}, {"name": "Dua Competition", "duration": "20 minutes"}, {"name": "Charity Planning", "duration": "30 minutes"}]',
'{"significance": "Night of Power worth more than 1000 months", "activities": "Increased worship, seeking forgiveness, charity"}',
'Peak spiritual opportunity of the year'),

('عيد الفطر', 'Eid al-Fitr', 'Celebration marking the end of Ramadan fasting', 'lunar',
'[{"name": "Morning Eid Prayer", "duration": "60 minutes"}, {"name": "Family Gratitude Session", "duration": "30 minutes"}, {"name": "Sharing with Neighbors", "duration": "variable"}]',
'{"significance": "Celebration of completing Ramadan, joy and gratitude", "obligations": "Eid prayer, Zakat al-Fitr, visiting family"}',
'Celebration of spiritual achievement and community bonding'),

('العشر من ذي الحجة', 'First Ten Days of Dhul-Hijjah', 'Most blessed days of the year according to Prophet Muhammad', 'lunar',
'[{"name": "Daily Dhikr Challenge", "duration": "20 minutes"}, {"name": "Charity Drive", "duration": "variable"}, {"name": "Story of Ibrahim", "duration": "30 minutes"}]',
'{"significance": "Most beloved days to Allah according to hadith", "recommended_acts": "Increased dhikr, charity, good deeds"}',
'Peak opportunity for worship and good deeds');
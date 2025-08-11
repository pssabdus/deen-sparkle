-- Create Islamic achievement system tables

-- Islamic terminology lookup table
CREATE TABLE public.islamic_terminology (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  arabic_term TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  explanation TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Islamic achievement categories
CREATE TABLE public.islamic_achievement_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_arabic TEXT NOT NULL,
  name_english TEXT NOT NULL,
  name_transliteration TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Islamic achievements/milestones
CREATE TABLE public.islamic_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_arabic TEXT NOT NULL,
  name_english TEXT NOT NULL,
  name_transliteration TEXT NOT NULL,
  description_arabic TEXT,
  description_english TEXT NOT NULL,
  celebration_dua TEXT,
  celebration_dua_translation TEXT,
  category_id UUID NOT NULL REFERENCES public.islamic_achievement_categories(id),
  required_actions JSONB DEFAULT '[]',
  difficulty_level INTEGER DEFAULT 1,
  points_reward INTEGER DEFAULT 50,
  age_minimum INTEGER DEFAULT 5,
  age_maximum INTEGER DEFAULT 18,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Child progress on Islamic milestones
CREATE TABLE public.child_islamic_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.islamic_achievements(id),
  progress_percentage INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE,
  celebration_viewed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id, achievement_id)
);

-- Family Islamic challenges
CREATE TABLE public.family_islamic_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name_arabic TEXT,
  name_english TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  goals JSONB DEFAULT '[]',
  educational_content JSONB,
  success_celebration JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Islamic celebrations and animations
CREATE TABLE public.islamic_celebrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dua_arabic TEXT NOT NULL,
  dua_translation TEXT NOT NULL,
  animation_type TEXT DEFAULT 'sparkle',
  sound_effect TEXT,
  occasion_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Islamic achievement criteria for automated checking
CREATE TABLE public.islamic_achievement_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id UUID NOT NULL REFERENCES public.islamic_achievements(id),
  criterion_type TEXT NOT NULL, -- 'prayer_count', 'streak_days', 'story_read', etc.
  target_value INTEGER NOT NULL,
  comparison_operator TEXT DEFAULT 'gte', -- 'gte', 'eq', 'lte'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI achievement suggestions log
CREATE TABLE public.ai_achievement_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id),
  family_id UUID NOT NULL REFERENCES public.families(id),
  suggestion_data JSONB NOT NULL,
  implemented BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.islamic_terminology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_achievement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_islamic_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_islamic_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_achievement_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_achievement_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Everyone can view terminology" 
ON public.islamic_terminology FOR SELECT USING (true);

CREATE POLICY "Everyone can view categories" 
ON public.islamic_achievement_categories FOR SELECT USING (true);

CREATE POLICY "Everyone can view achievements" 
ON public.islamic_achievements FOR SELECT USING (true);

CREATE POLICY "Users can view family child milestones" 
ON public.child_islamic_milestones FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children c 
    JOIN public.users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid()
  )
);

CREATE POLICY "Users can update family child milestones" 
ON public.child_islamic_milestones FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.children c 
    JOIN public.users u ON u.family_id = c.family_id 
    WHERE c.id = child_id AND u.id = auth.uid()
  )
);

CREATE POLICY "Family can view their challenges" 
ON public.family_islamic_challenges FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.family_id = family_id AND u.id = auth.uid()
  )
);

CREATE POLICY "Parents can manage family challenges" 
ON public.family_islamic_challenges FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.family_id = family_id AND u.id = auth.uid() AND u.role = 'parent'
  )
);

CREATE POLICY "Everyone can view celebrations" 
ON public.islamic_celebrations FOR SELECT USING (true);

CREATE POLICY "Everyone can view criteria" 
ON public.islamic_achievement_criteria FOR SELECT USING (true);

CREATE POLICY "Family can view AI suggestions" 
ON public.ai_achievement_suggestions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.family_id = family_id AND u.id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_islamic_terminology_updated_at
BEFORE UPDATE ON public.islamic_terminology
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_islamic_achievement_categories_updated_at
BEFORE UPDATE ON public.islamic_achievement_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_islamic_achievements_updated_at
BEFORE UPDATE ON public.islamic_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_child_islamic_milestones_updated_at
BEFORE UPDATE ON public.child_islamic_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_islamic_challenges_updated_at
BEFORE UPDATE ON public.family_islamic_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.islamic_achievement_categories (name_arabic, name_english, name_transliteration, description, icon, sort_order) VALUES
('الصلاة', 'Prayer', 'As-Salah', 'Achievements related to daily prayers and worship', '🕌', 1),
('القرآن', 'Quran', 'Al-Quran', 'Achievements for Quran recitation and memorization', '📖', 2),
('الصبر', 'Patience', 'As-Sabr', 'Achievements for demonstrating patience and perseverance', '🤲', 3),
('التقوى', 'God-consciousness', 'At-Taqwa', 'Achievements for mindfulness of Allah', '✨', 4),
('الإحسان', 'Excellence', 'Al-Ihsan', 'Achievements for excellence in worship and character', '⭐', 5),
('الكرم', 'Generosity', 'Al-Karam', 'Achievements for acts of charity and kindness', '💝', 6),
('العلم', 'Knowledge', 'Al-Ilm', 'Achievements for Islamic learning and education', '📚', 7),
('الأخلاق', 'Character', 'Al-Akhlaq', 'Achievements for good character and morals', '❤️', 8);

INSERT INTO public.islamic_terminology (arabic_term, transliteration, english_translation, explanation, category) VALUES
('الحمد لله', 'Alhamdulillah', 'Praise be to Allah', 'Expression of gratitude and praise to Allah for all blessings', 'praise'),
('سبحان الله', 'SubhanAllah', 'Glory be to Allah', 'Expression of Allah''s perfect glory and transcendence', 'praise'),
('الله أكبر', 'Allahu Akbar', 'Allah is the Greatest', 'Declaration of Allah''s supreme greatness over all things', 'praise'),
('لا إله إلا الله', 'La ilaha illa Allah', 'There is no god but Allah', 'Declaration of monotheism, the core of Islamic faith', 'faith'),
('أستغفر الله', 'Astaghfirullah', 'I seek Allah''s forgiveness', 'Seeking forgiveness from Allah for sins and mistakes', 'repentance'),
('إن شاء الله', 'Insha Allah', 'If Allah wills', 'Acknowledging that all plans depend on Allah''s will', 'faith'),
('بارك الله فيك', 'Barakallahu feek', 'May Allah bless you', 'Prayer for Allah''s blessings upon someone', 'blessing'),
('جزاك الله خيراً', 'Jazakallahu khayran', 'May Allah reward you with good', 'Expression of gratitude with prayer for divine reward', 'gratitude'),
('السلام عليكم', 'As-salamu alaykum', 'Peace be upon you', 'Islamic greeting wishing peace and blessings', 'greeting'),
('وعليكم السلام', 'Wa alaykumu as-salam', 'And upon you peace', 'Response to the Islamic greeting', 'greeting'),
('توكلت على الله', 'Tawakkaltu ala Allah', 'I put my trust in Allah', 'Expression of complete reliance on Allah', 'trust'),
('حسبي الله ونعم الوكيل', 'Hasbiyallahu wa ni''mal wakeel', 'Allah is sufficient for me and He is the best disposer of affairs', 'Declaration of complete trust in Allah during difficulties', 'trust');

INSERT INTO public.islamic_achievements (name_arabic, name_english, name_transliteration, description_english, celebration_dua, celebration_dua_translation, category_id, required_actions, difficulty_level, points_reward, age_minimum, age_maximum) 
SELECT 
  'الصلاة الأولى', 
  'First Prayer', 
  'As-Salah al-Ula',
  'Completed your very first prayer',
  'الحمد لله رب العالمين',
  'Praise be to Allah, Lord of the worlds',
  id,
  '[{"type": "prayer_count", "value": 1}]'::jsonb,
  1,
  25,
  5,
  18
FROM public.islamic_achievement_categories WHERE name_english = 'Prayer'

UNION ALL

SELECT 
  'محافظ الصلاة', 
  'Prayer Guardian', 
  'Muhafidh as-Salah',
  'Maintained prayer consistency for a full week',
  'اللهم أعني على ذكرك وشكرك وحسن عبادتك',
  'O Allah, help me to remember You, thank You, and worship You excellently',
  id,
  '[{"type": "prayer_streak", "value": 7}]'::jsonb,
  2,
  75,
  6,
  18
FROM public.islamic_achievement_categories WHERE name_english = 'Prayer'

UNION ALL

SELECT 
  'قارئ القرآن', 
  'Quran Reader', 
  'Qari al-Quran',
  'Read from the Quran for the first time',
  'اللهم اجعل القرآن العظيم ربيع قلبي',
  'O Allah, make the Quran the spring of my heart',
  id,
  '[{"type": "quran_reading", "value": 1}]'::jsonb,
  1,
  30,
  5,
  18
FROM public.islamic_achievement_categories WHERE name_english = 'Quran'

UNION ALL

SELECT 
  'الصابر الصغير', 
  'Little Patient One', 
  'As-Sabir as-Saghir',
  'Showed patience during a difficult moment',
  'رب اجعلني من الصابرين',
  'My Lord, make me among the patient ones',
  id,
  '[{"type": "patience_display", "value": 1}]'::jsonb,
  2,
  40,
  5,
  18
FROM public.islamic_achievement_categories WHERE name_english = 'Patience'

UNION ALL

SELECT 
  'المحسن الصغير', 
  'Little Excellent One', 
  'Al-Muhsin as-Saghir',
  'Performed an act of excellence in worship or character',
  'اللهم أعني على الإحسان في كل شيء',
  'O Allah, help me to be excellent in everything',
  id,
  '[{"type": "excellent_deed", "value": 1}]'::jsonb,
  3,
  60,
  6,
  18
FROM public.islamic_achievement_categories WHERE name_english = 'Excellence';

INSERT INTO public.islamic_celebrations (name, dua_arabic, dua_translation, animation_type, occasion_type) VALUES
('Achievement Earned', 'بارك الله فيك وجزاك الله خيراً', 'May Allah bless you and reward you with good', 'sparkle', 'achievement'),
('Level Up', 'اللهم زدني علماً وإيماناً', 'O Allah, increase me in knowledge and faith', 'star_burst', 'progress'),
('Streak Complete', 'الحمد لله على التوفيق', 'Praise be to Allah for His guidance', 'golden_rain', 'consistency'),
('First Time', 'اللهم بارك لي فيما أعطيت', 'O Allah, bless me in what You have given', 'gentle_glow', 'milestone');
-- Enhanced Islamic Story System with Scholar Review and Parent Approval

-- Update stories table for enhanced Islamic content management
ALTER TABLE stories ADD COLUMN IF NOT EXISTS islamic_source TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS characters JSONB DEFAULT '[]'::jsonb;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS islamic_lessons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS target_age_min INTEGER DEFAULT 5;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS target_age_max INTEGER DEFAULT 12;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'beginner';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS islamic_terminology JSONB DEFAULT '{}'::jsonb;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS scholar_notes TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS illustration_guidelines TEXT;

-- Create story review system
CREATE TABLE IF NOT EXISTS story_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewer_type VARCHAR(50) NOT NULL CHECK (reviewer_type IN ('scholar', 'educator', 'parent')),
  review_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  review_notes TEXT,
  islamic_authenticity_score INTEGER CHECK (islamic_authenticity_score >= 1 AND islamic_authenticity_score <= 10),
  age_appropriateness_score INTEGER CHECK (age_appropriateness_score >= 1 AND age_appropriateness_score <= 10),
  educational_value_score INTEGER CHECK (educational_value_score >= 1 AND educational_value_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family story approvals
CREATE TABLE IF NOT EXISTS family_story_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  family_id UUID NOT NULL,
  approved_by UUID NOT NULL,
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approval_notes TEXT,
  child_restrictions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, family_id)
);

-- Create Islamic story prompts for AI generation
CREATE TABLE IF NOT EXISTS islamic_story_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  prompt_text TEXT NOT NULL,
  islamic_source VARCHAR(100),
  main_characters JSONB DEFAULT '[]'::jsonb,
  moral_lessons JSONB DEFAULT '[]'::jsonb,
  target_age_group VARCHAR(20) NOT NULL,
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  islamic_concepts JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_review')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Islamic educators/scholars table
CREATE TABLE IF NOT EXISTS islamic_educators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  credentials TEXT NOT NULL,
  specialization JSONB DEFAULT '[]'::jsonb,
  approval_level VARCHAR(20) DEFAULT 'educator' CHECK (approval_level IN ('educator', 'scholar', 'senior_scholar')),
  contact_email VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create story generation requests
CREATE TABLE IF NOT EXISTS story_generation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID NOT NULL,
  family_id UUID NOT NULL,
  child_id UUID,
  story_theme TEXT NOT NULL,
  age_range VARCHAR(20) NOT NULL,
  specific_requests TEXT,
  islamic_focus JSONB DEFAULT '[]'::jsonb,
  request_status VARCHAR(20) DEFAULT 'pending' CHECK (request_status IN ('pending', 'generating', 'review', 'approved', 'rejected')),
  generated_story_id UUID REFERENCES stories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE story_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_story_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE islamic_story_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE islamic_educators ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_generation_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_reviews
CREATE POLICY "Educators and scholars can manage reviews" 
ON story_reviews 
FOR ALL 
USING (
  reviewer_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM islamic_educators 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Everyone can view published story reviews" 
ON story_reviews 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM stories 
    WHERE id = story_reviews.story_id AND status = 'published'
  )
);

-- RLS Policies for family_story_approvals
CREATE POLICY "Family members can manage story approvals" 
ON family_story_approvals 
FOR ALL 
USING (
  family_id IN (
    SELECT family_id FROM users 
    WHERE id = auth.uid() AND family_id IS NOT NULL
  )
);

-- RLS Policies for islamic_story_prompts
CREATE POLICY "Educators can manage story prompts" 
ON islamic_story_prompts 
FOR ALL 
USING (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM islamic_educators 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Everyone can view active prompts" 
ON islamic_story_prompts 
FOR SELECT 
USING (status = 'active');

-- RLS Policies for islamic_educators
CREATE POLICY "Educators can view other educators" 
ON islamic_educators 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Educators can update own profile" 
ON islamic_educators 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- RLS Policies for story_generation_requests
CREATE POLICY "Family members can manage story requests" 
ON story_generation_requests 
FOR ALL 
USING (
  family_id IN (
    SELECT family_id FROM users 
    WHERE id = auth.uid() AND family_id IS NOT NULL
  )
);

-- Insert sample Islamic story prompts
INSERT INTO islamic_story_prompts (title, prompt_text, islamic_source, main_characters, moral_lessons, target_age_group, difficulty_level, islamic_concepts) VALUES

('The Kind Merchant of Madinah', 
'Generate a story about a young Muslim merchant in Madinah during the time of Prophet Muhammad (PBUH) who learns about honesty and fairness in business through the teachings and example of the Prophet. The story should show how Islamic business ethics lead to both worldly success and spiritual reward.',
'Hadith and Seerah',
'["Young merchant Khalid", "Prophet Muhammad (PBUH)", "Fellow traders", "Customers"]'::jsonb,
'["Honesty in business", "Following Islamic ethics", "Trust in Allah", "Helping others"]'::jsonb,
'5-10 years',
'beginner',
'["Halal business practices", "Sunnah of the Prophet", "Trust (Amanah)", "Islamic values"]'::jsonb),

('The Story of Prophet Yusuf and His Dreams',
'Create an age-appropriate retelling of Prophet Yusuf (AS) and his interpretation of dreams, focusing on patience during hardships, forgiveness, and trusting in Allah''s plan. Emphasize how Allah tests those He loves and how patience and faith lead to reward.',
'Quran - Surah Yusuf',
'["Prophet Yusuf (AS)", "Prophet Yaqub (AS)", "Yusuf''s brothers", "The King of Egypt"]'::jsonb,
'["Patience in hardship", "Forgiveness", "Trust in Allah", "Interpreting dreams as a gift from Allah"]'::jsonb,
'7-12 years',
'intermediate',
'["Prophets and their qualities", "Divine wisdom", "Patience (Sabr)", "Forgiveness"]'::jsonb),

('The Cave of Seven Sleepers',
'Tell the story of Ashab al-Kahf (People of the Cave) in a way that teaches children about standing firm in their faith, even when others around them don''t believe. Show how Allah protects those who believe in Him.',
'Quran - Surah Al-Kahf',
'["The young believers", "The dog Qitmir", "The people of their city"]'::jsonb,
'["Standing firm in faith", "Trust in Allah''s protection", "Courage to do right", "Allah''s miracles"]'::jsonb,
'8-14 years',
'intermediate',
'["Faith (Iman)", "Divine protection", "Miracles", "Staying true to beliefs"]'::jsonb),

('The Generous Date Seller',
'A story about a poor date seller in Madinah who always gives the best dates to others and keeps the less perfect ones for himself, following the example of the Sahaba. Show how his generosity brings unexpected blessings from Allah.',
'Inspired by Sahaba stories',
'["Abu Bakr the date seller", "Poor families", "Fellow merchants", "Children of Madinah"]'::jsonb,
'["Generosity", "Putting others first", "Trust in Allah''s provision", "Following the Sahaba''s example"]'::jsonb,
'5-9 years',
'beginner',
'["Generosity (Karam)", "Following the Sahaba", "Trust in Rizq", "Helping the poor"]'::jsonb);

-- Create triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_story_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_story_reviews_updated_at
  BEFORE UPDATE ON story_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_story_review_timestamp();

CREATE TRIGGER update_family_story_approvals_updated_at
  BEFORE UPDATE ON family_story_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_story_review_timestamp();

CREATE TRIGGER update_islamic_educators_updated_at
  BEFORE UPDATE ON islamic_educators
  FOR EACH ROW
  EXECUTE FUNCTION update_story_review_timestamp();

CREATE TRIGGER update_story_generation_requests_updated_at
  BEFORE UPDATE ON story_generation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_story_review_timestamp();

-- Function to check if story is approved for family
CREATE OR REPLACE FUNCTION is_story_approved_for_family(story_uuid UUID, family_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM family_story_approvals 
    WHERE story_id = story_uuid 
    AND family_id = family_uuid 
    AND approval_status = 'approved'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get story review summary
CREATE OR REPLACE FUNCTION get_story_review_summary(story_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  avg_islamic_score NUMERIC;
  avg_age_score NUMERIC;
  avg_educational_score NUMERIC;
  total_reviews INTEGER;
  approval_count INTEGER;
BEGIN
  SELECT 
    AVG(islamic_authenticity_score)::NUMERIC(3,2),
    AVG(age_appropriateness_score)::NUMERIC(3,2),
    AVG(educational_value_score)::NUMERIC(3,2),
    COUNT(*),
    COUNT(*) FILTER (WHERE review_status = 'approved')
  INTO avg_islamic_score, avg_age_score, avg_educational_score, total_reviews, approval_count
  FROM story_reviews 
  WHERE story_id = story_uuid;
  
  SELECT json_build_object(
    'story_id', story_uuid,
    'total_reviews', COALESCE(total_reviews, 0),
    'approved_reviews', COALESCE(approval_count, 0),
    'average_islamic_authenticity', COALESCE(avg_islamic_score, 0),
    'average_age_appropriateness', COALESCE(avg_age_score, 0),
    'average_educational_value', COALESCE(avg_educational_score, 0),
    'overall_approved', CASE WHEN COALESCE(approval_count, 0) >= 2 AND COALESCE(avg_islamic_score, 0) >= 7 THEN true ELSE false END
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
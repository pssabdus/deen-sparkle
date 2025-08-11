-- Enhance stories table with Islamic content fields
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS islamic_source TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS authentic_reference TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS scholarly_reviewed BOOLEAN DEFAULT false;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS cultural_context JSONB DEFAULT '{}';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS islamic_terminology JSONB DEFAULT '{}';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS prophet_mentioned TEXT[];
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS sahaba_mentioned TEXT[];
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS quranic_verses TEXT[];
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS hadith_references TEXT[];
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS islamic_values TEXT[];
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS complexity_level INTEGER DEFAULT 1;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS illustration_approved BOOLEAN DEFAULT false;

-- Create story_reviews table for Islamic scholar oversight
CREATE TABLE public.story_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  review_type VARCHAR NOT NULL CHECK (review_type IN ('islamic_content', 'cultural_sensitivity', 'age_appropriateness', 'illustration')),
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  comments TEXT,
  islamic_compliance_score INTEGER CHECK (islamic_compliance_score >= 1 AND islamic_compliance_score <= 10),
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family_story_approvals table for parent approval workflow
CREATE TABLE public.family_story_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  family_id UUID NOT NULL,
  approved_by UUID NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  parent_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create islamic_story_prompts table for AI generation guidelines
CREATE TABLE public.islamic_story_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR NOT NULL,
  age_group VARCHAR NOT NULL,
  prompt_template TEXT NOT NULL,
  islamic_guidelines JSONB NOT NULL DEFAULT '{}',
  required_elements JSONB NOT NULL DEFAULT '{}',
  forbidden_elements JSONB NOT NULL DEFAULT '{}',
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create islamic_educators table for reviewer management
CREATE TABLE public.islamic_educators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}',
  specializations TEXT[] NOT NULL DEFAULT '{}',
  review_permissions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create story_generation_requests table for AI story requests
CREATE TABLE public.story_generation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID NOT NULL,
  child_id UUID NOT NULL,
  story_theme VARCHAR NOT NULL,
  age_group VARCHAR NOT NULL,
  islamic_focus TEXT[],
  custom_requirements TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'reviewing', 'completed', 'failed')),
  generated_story_id UUID,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all new tables
ALTER TABLE public.story_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_story_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_story_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_educators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_generation_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_reviews
CREATE POLICY "Islamic educators can manage reviews" ON public.story_reviews
FOR ALL USING (
  reviewer_id IN (
    SELECT user_id FROM islamic_educators 
    WHERE is_active = true AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all reviews" ON public.story_reviews
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for family_story_approvals
CREATE POLICY "Family members can manage story approvals" ON public.family_story_approvals
FOR ALL USING (
  family_id IN (
    SELECT family_id FROM users 
    WHERE id = auth.uid() AND family_id IS NOT NULL
  )
);

-- RLS Policies for islamic_story_prompts
CREATE POLICY "Educators and admins can manage prompts" ON public.islamic_story_prompts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin')
  ) OR
  EXISTS (
    SELECT 1 FROM islamic_educators 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Everyone can view active prompts" ON public.islamic_story_prompts
FOR SELECT USING (is_active = true);

-- RLS Policies for islamic_educators
CREATE POLICY "Admins can manage educators" ON public.islamic_educators
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Educators can view their profile" ON public.islamic_educators
FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for story_generation_requests
CREATE POLICY "Family members can manage story requests" ON public.story_generation_requests
FOR ALL USING (
  requested_by = auth.uid() OR
  child_id IN (
    SELECT c.id FROM children c
    JOIN users u ON u.family_id = c.family_id
    WHERE u.id = auth.uid()
  )
);

-- Insert sample Islamic story prompts
INSERT INTO public.islamic_story_prompts (category, age_group, prompt_template, islamic_guidelines, required_elements, forbidden_elements) VALUES
('prophets', '3-6', 'Create a gentle story about Prophet {prophet} that teaches {moral_lesson}. Use simple language and focus on {character_trait}. Include how this lesson applies to a child''s daily life.', 
'{"source_requirement": "Authentic Quran and Hadith only", "tone": "gentle and age-appropriate", "cultural_sensitivity": "Include diverse Muslim backgrounds"}',
'{"prophet_mention": true, "moral_lesson": true, "daily_application": true, "islamic_greeting": true}',
'{"inappropriate_imagery": true, "non_islamic_elements": true, "fear_inducing_content": true}'),

('sahaba', '7-10', 'Tell the inspiring story of {sahaba_name} and how they showed {islamic_value}. Explain the historical context and the lessons we can learn for today. Include authentic details from Islamic history.', 
'{"historical_accuracy": "Must be based on authentic Islamic sources", "educational_value": "Clear moral and practical lessons"}',
'{"historical_context": true, "authentic_details": true, "modern_application": true, "islamic_values": true}',
'{"fictional_elements": true, "inappropriate_role_models": true, "non_islamic_customs": true}'),

('islamic_values', '11-15', 'Create a story that demonstrates {islamic_value} through the example of {historical_figure}. Show how this value is practiced in modern Muslim life. Include Quranic verses or Hadith that support this teaching.', 
'{"scholarly_review": "Required before publication", "age_appropriateness": "Complex concepts explained simply"}',
'{"quranic_reference": true, "hadith_reference": true, "modern_relevance": true, "character_development": true}',
'{"controversial_topics": true, "sectarian_bias": true, "cultural_stereotypes": true}');

-- Insert sample Islamic educator
INSERT INTO public.islamic_educators (user_id, credentials, specializations, review_permissions) VALUES
(gen_random_uuid(), 
'{"degree": "PhD Islamic Studies", "institution": "Al-Azhar University", "years_experience": 15}',
ARRAY['Quran', 'Hadith', 'Islamic History', 'Children Education'],
ARRAY['islamic_content', 'cultural_sensitivity', 'age_appropriateness']);

-- Create trigger for automatic story review assignment
CREATE OR REPLACE FUNCTION assign_story_for_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign to available Islamic educators for review
  INSERT INTO story_reviews (story_id, reviewer_id, review_type)
  SELECT NEW.id, ie.user_id, 'islamic_content'
  FROM islamic_educators ie
  WHERE ie.is_active = true
  AND 'islamic_content' = ANY(ie.review_permissions)
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_story_review
  AFTER INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION assign_story_for_review();

-- Create function to check story approval status
CREATE OR REPLACE FUNCTION get_story_approval_status(story_uuid UUID, family_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  islamic_approved BOOLEAN := false;
  family_approved BOOLEAN := false;
  pending_reviews INTEGER := 0;
BEGIN
  -- Check Islamic scholar approval
  SELECT COUNT(*) = 0 INTO islamic_approved
  FROM story_reviews 
  WHERE story_id = story_uuid 
  AND status IN ('pending', 'needs_revision');
  
  -- Check family approval
  SELECT status = 'approved' INTO family_approved
  FROM family_story_approvals 
  WHERE story_id = story_uuid AND family_id = family_uuid;
  
  -- Count pending reviews
  SELECT COUNT(*) INTO pending_reviews
  FROM story_reviews 
  WHERE story_id = story_uuid AND status = 'pending';
  
  SELECT json_build_object(
    'islamic_approved', islamic_approved,
    'family_approved', family_approved,
    'pending_reviews', pending_reviews,
    'ready_for_child', (islamic_approved AND family_approved)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
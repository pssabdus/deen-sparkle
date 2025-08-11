-- Create companion_conversations table to store chat history
CREATE TABLE public.companion_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  message_type VARCHAR NOT NULL CHECK (message_type IN ('child', 'companion')),
  message_content TEXT NOT NULL,
  companion_personality VARCHAR NOT NULL DEFAULT 'encouraging',
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create companion_daily_content table for daily challenges and facts
CREATE TABLE public.companion_daily_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  content_type VARCHAR NOT NULL CHECK (content_type IN ('daily_challenge', 'islamic_fact', 'achievement_celebration', 'milestone_message')),
  content_title VARCHAR,
  content_text TEXT NOT NULL,
  content_data JSONB DEFAULT '{}',
  date_created DATE NOT NULL DEFAULT CURRENT_DATE,
  is_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.companion_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_daily_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companion_conversations
CREATE POLICY "Family members can view companion conversations" 
ON public.companion_conversations 
FOR SELECT 
USING (
  child_id IN (
    SELECT c.id FROM children c 
    JOIN users u ON u.family_id = c.family_id 
    WHERE u.id = auth.uid()
  )
  OR 
  child_id IN (
    SELECT c.id FROM children c 
    WHERE c.user_id = auth.uid()
  )
);

CREATE POLICY "Family members can insert companion conversations" 
ON public.companion_conversations 
FOR INSERT 
WITH CHECK (
  child_id IN (
    SELECT c.id FROM children c 
    JOIN users u ON u.family_id = c.family_id 
    WHERE u.id = auth.uid()
  )
  OR 
  child_id IN (
    SELECT c.id FROM children c 
    WHERE c.user_id = auth.uid()
  )
);

-- Create RLS policies for companion_daily_content
CREATE POLICY "Family members can view companion daily content" 
ON public.companion_daily_content 
FOR SELECT 
USING (
  child_id IN (
    SELECT c.id FROM children c 
    JOIN users u ON u.family_id = c.family_id 
    WHERE u.id = auth.uid()
  )
  OR 
  child_id IN (
    SELECT c.id FROM children c 
    WHERE c.user_id = auth.uid()
  )
);

CREATE POLICY "System can manage companion daily content" 
ON public.companion_daily_content 
FOR ALL 
USING (true);

-- Create function to update updated_at timestamp
CREATE TRIGGER update_companion_conversations_updated_at
BEFORE UPDATE ON public.companion_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create Islamic family social features tables

-- Family prayer synchronization table
CREATE TABLE public.family_prayer_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  prayer_name TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL,
  participants JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'scheduled',
  islamic_reminders JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sibling challenges table
CREATE TABLE public.islamic_sibling_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL,
  islamic_values JSONB DEFAULT '[]'::jsonb,
  participants JSONB DEFAULT '[]'::jsonb,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  rewards JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_by UUID NOT NULL,
  winner_announcement JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Extended family sharing table
CREATE TABLE public.extended_family_sharing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  child_id UUID NOT NULL,
  extended_member_email TEXT NOT NULL,
  extended_member_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  permission_level TEXT DEFAULT 'view_only',
  shared_content_types JSONB DEFAULT '["milestones", "achievements", "progress"]'::jsonb,
  islamic_content_filter JSONB DEFAULT '{}'::jsonb,
  invite_status TEXT DEFAULT 'pending',
  invited_by UUID NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Family story recordings table
CREATE TABLE public.family_story_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  recorded_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  duration_seconds INTEGER,
  islamic_theme TEXT,
  target_children JSONB DEFAULT '[]'::jsonb,
  islamic_lessons JSONB DEFAULT '[]'::jsonb,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID DEFAULT NULL,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  privacy_level TEXT DEFAULT 'family_only',
  listen_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Collaborative Islamic goals table
CREATE TABLE public.collaborative_islamic_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL,
  islamic_significance TEXT,
  target_participants JSONB NOT NULL,
  progress_tracking JSONB DEFAULT '{}'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  rewards JSONB DEFAULT '{}'::jsonb,
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_by UUID NOT NULL,
  parent_guidance JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Family Islamic calendar events table
CREATE TABLE public.family_islamic_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  islamic_significance TEXT,
  event_date DATE NOT NULL,
  event_time TIME DEFAULT NULL,
  recurrence_pattern TEXT DEFAULT 'none',
  participants JSONB DEFAULT '[]'::jsonb,
  preparation_tasks JSONB DEFAULT '[]'::jsonb,
  educational_content JSONB DEFAULT '{}'::jsonb,
  celebration_activities JSONB DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL,
  is_family_wide BOOLEAN DEFAULT true,
  privacy_level TEXT DEFAULT 'family_only',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Islamic family communication table
CREATE TABLE public.islamic_family_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  recipient_ids JSONB NOT NULL,
  message_content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  islamic_expressions JSONB DEFAULT '[]'::jsonb,
  islamic_emoji_used JSONB DEFAULT '[]'::jsonb,
  is_family_wide BOOLEAN DEFAULT false,
  parent_approved BOOLEAN DEFAULT true,
  islamic_etiquette_score INTEGER DEFAULT 10,
  reply_to UUID DEFAULT NULL,
  read_by JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.family_prayer_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_sibling_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extended_family_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_story_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_islamic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_islamic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_family_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family prayer sync
CREATE POLICY "Family members can manage prayer sync" 
ON public.family_prayer_sync 
FOR ALL 
USING (
  family_id IN (
    SELECT u.family_id FROM users u WHERE u.id = auth.uid() AND u.family_id IS NOT NULL
  )
);

-- RLS Policies for sibling challenges
CREATE POLICY "Family members can manage sibling challenges" 
ON public.islamic_sibling_challenges 
FOR ALL 
USING (
  family_id IN (
    SELECT u.family_id FROM users u WHERE u.id = auth.uid() AND u.family_id IS NOT NULL
  )
);

-- RLS Policies for extended family sharing
CREATE POLICY "Family members can manage extended family sharing" 
ON public.extended_family_sharing 
FOR ALL 
USING (
  family_id IN (
    SELECT u.family_id FROM users u WHERE u.id = auth.uid() AND u.family_id IS NOT NULL
  )
);

-- RLS Policies for family story recordings
CREATE POLICY "Family members can manage story recordings" 
ON public.family_story_recordings 
FOR ALL 
USING (
  family_id IN (
    SELECT u.family_id FROM users u WHERE u.id = auth.uid() AND u.family_id IS NOT NULL
  )
);

-- RLS Policies for collaborative Islamic goals
CREATE POLICY "Family members can manage collaborative goals" 
ON public.collaborative_islamic_goals 
FOR ALL 
USING (
  family_id IN (
    SELECT u.family_id FROM users u WHERE u.id = auth.uid() AND u.family_id IS NOT NULL
  )
);

-- RLS Policies for family Islamic calendar
CREATE POLICY "Family members can manage Islamic calendar" 
ON public.family_islamic_calendar 
FOR ALL 
USING (
  family_id IN (
    SELECT u.family_id FROM users u WHERE u.id = auth.uid() AND u.family_id IS NOT NULL
  )
);

-- RLS Policies for Islamic family messages
CREATE POLICY "Family members can manage family messages" 
ON public.islamic_family_messages 
FOR ALL 
USING (
  family_id IN (
    SELECT u.family_id FROM users u WHERE u.id = auth.uid() AND u.family_id IS NOT NULL
  )
);

-- Create indexes for performance
CREATE INDEX idx_family_prayer_sync_family_id ON public.family_prayer_sync(family_id);
CREATE INDEX idx_islamic_sibling_challenges_family_id ON public.islamic_sibling_challenges(family_id);
CREATE INDEX idx_extended_family_sharing_family_id ON public.extended_family_sharing(family_id);
CREATE INDEX idx_family_story_recordings_family_id ON public.family_story_recordings(family_id);
CREATE INDEX idx_collaborative_islamic_goals_family_id ON public.collaborative_islamic_goals(family_id);
CREATE INDEX idx_family_islamic_calendar_family_id ON public.family_islamic_calendar(family_id);
CREATE INDEX idx_islamic_family_messages_family_id ON public.islamic_family_messages(family_id);

-- Add updated_at triggers
CREATE TRIGGER update_family_prayer_sync_updated_at
  BEFORE UPDATE ON public.family_prayer_sync
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_islamic_sibling_challenges_updated_at
  BEFORE UPDATE ON public.islamic_sibling_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_story_recordings_updated_at
  BEFORE UPDATE ON public.family_story_recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaborative_islamic_goals_updated_at
  BEFORE UPDATE ON public.collaborative_islamic_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_islamic_calendar_updated_at
  BEFORE UPDATE ON public.family_islamic_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_islamic_family_messages_updated_at
  BEFORE UPDATE ON public.islamic_family_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
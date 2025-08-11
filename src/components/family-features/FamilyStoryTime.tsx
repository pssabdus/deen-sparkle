import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mic, Play, Pause, Heart, Star, Clock, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FamilyStoryTimeProps {
  familyId: string;
  userRole: 'parent' | 'child';
  userId: string;
  childrenData: any[];
}

interface StoryRecording {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  duration_seconds: number;
  islamic_theme: string;
  target_children: any;
  islamic_lessons: any;
  is_approved: boolean;
  recorded_by: string;
  privacy_level: string;
  listen_count: number;
  created_at: string;
}

const islamicThemes = [
  { value: 'prophets', label: 'Stories of Prophets', emoji: '👑', description: 'Tales of the noble messengers' },
  { value: 'companions', label: 'Companions Stories', emoji: '⚔️', description: 'Stories of the righteous companions' },
  { value: 'virtues', label: 'Islamic Virtues', emoji: '💎', description: 'Stories teaching Islamic values' },
  { value: 'quran', label: 'Quranic Stories', emoji: '📖', description: 'Stories mentioned in the Quran' },
  { value: 'daily_life', label: 'Islamic Daily Life', emoji: '🏠', description: 'Applying Islam in everyday situations' },
  { value: 'kindness', label: 'Acts of Kindness', emoji: '🤝', description: 'Stories of compassion and mercy' }
];

const islamicLessons = [
  'Trust in Allah (Tawakkul)',
  'Patience (Sabr)',
  'Gratitude (Shukr)',
  'Honesty (Sidq)',
  'Kindness (Rahma)',
  'Respect for Parents',
  'Brotherhood/Sisterhood',
  'Helping Others',
  'Forgiveness',
  'Prayer & Worship'
];

const FamilyStoryTime = ({ familyId, userRole, userId, childrenData }: FamilyStoryTimeProps) => {
  const [storyRecordings, setStoryRecordings] = useState<StoryRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [playingStory, setPlayingStory] = useState<string | null>(null);
  const [newStory, setNewStory] = useState({
    title: '',
    description: '',
    islamic_theme: '',
    target_children: [],
    islamic_lessons: [],
    privacy_level: 'family_only'
  });

  useEffect(() => {
    fetchStoryRecordings();
  }, [familyId]);

  const fetchStoryRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('family_story_recordings')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching story recordings:', error);
        return;
      }

      setStoryRecordings((data || []).map(item => ({
        ...item,
        target_children: Array.isArray(item.target_children) ? item.target_children : [],
        islamic_lessons: Array.isArray(item.islamic_lessons) ? item.islamic_lessons : []
      })));
    } catch (error) {
      console.error('Error in fetchStoryRecordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStoryPlaceholder = async () => {
    if (!newStory.title || !newStory.islamic_theme) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and theme.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('family_story_recordings')
        .insert({
          family_id: familyId,
          recorded_by: userId,
          title: newStory.title,
          description: newStory.description,
          islamic_theme: newStory.islamic_theme,
          target_children: newStory.target_children,
          islamic_lessons: newStory.islamic_lessons,
          privacy_level: newStory.privacy_level,
          audio_url: '', // Placeholder - would be uploaded separately
          duration_seconds: 0,
          is_approved: userRole === 'parent' // Auto-approve parent recordings
        });

      if (error) {
        console.error('Error creating story:', error);
        toast({
          title: "Error",
          description: "Failed to create story recording.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Story Created! 📚",
        description: "Your Islamic story has been prepared. You can now record the audio.",
      });

      setShowCreateDialog(false);
      setNewStory({
        title: '',
        description: '',
        islamic_theme: '',
        target_children: [],
        islamic_lessons: [],
        privacy_level: 'family_only'
      });
      fetchStoryRecordings();
    } catch (error) {
      console.error('Error in createStoryPlaceholder:', error);
    }
  };

  const togglePlayStory = (storyId: string) => {
    if (playingStory === storyId) {
      setPlayingStory(null);
    } else {
      setPlayingStory(storyId);
      // In a real implementation, this would control audio playback
      toast({
        title: "Audio Playback",
        description: "Story audio playback would start here (demo mode)",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getThemeEmoji = (theme: string) => {
    return islamicThemes.find(t => t.value === theme)?.emoji || '📖';
  };

  const getApprovalStatus = (story: StoryRecording) => {
    if (story.is_approved) {
      return { color: 'bg-green-100 text-green-800', text: 'Approved' };
    }
    return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Approval' };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mic className="w-5 h-5 text-islamic-blue" />
            Family Islamic Story Time
          </h3>
          <p className="text-sm text-muted-foreground">
            Record personalized Islamic messages and stories for your children
          </p>
        </div>
        {userRole === 'parent' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-islamic-blue hover:bg-islamic-blue/90">
                <Mic className="w-4 h-4 mr-2" />
                Record Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Islamic Story Recording</DialogTitle>
                <DialogDescription>
                  Create a personalized Islamic story or message for your children
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Story Title</Label>
                  <Input
                    id="title"
                    value={newStory.title}
                    onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., The Story of Prophet Yusuf for Bedtime"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newStory.description}
                    onChange={(e) => setNewStory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the story and its message..."
                  />
                </div>
                <div>
                  <Label htmlFor="islamic_theme">Islamic Theme</Label>
                  <Select 
                    value={newStory.islamic_theme} 
                    onValueChange={(value) => setNewStory(prev => ({ ...prev, islamic_theme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Islamic theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {islamicThemes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          <div className="flex items-center gap-2">
                            <span>{theme.emoji}</span>
                            <div>
                              <div>{theme.label}</div>
                              <div className="text-xs text-muted-foreground">{theme.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createStoryPlaceholder} className="w-full">
                  Create Story & Start Recording
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Islamic Storytelling Guidelines */}
      <Card className="border-islamic-blue/30 bg-islamic-cream/20">
        <CardHeader>
          <CardTitle className="text-islamic-blue text-sm">📚 Islamic Storytelling Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Story Elements:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Begin with Bismillah</li>
                <li>• Include Islamic values and lessons</li>
                <li>• Use age-appropriate language</li>
                <li>• End with a meaningful reflection</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Recording Tips:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Speak clearly and warmly</li>
                <li>• Use different voices for characters</li>
                <li>• Pause for dramatic effect</li>
                <li>• Include personal touches</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Story Recordings */}
      <div className="space-y-4">
        <h4 className="font-medium text-islamic-blue">Family Story Library</h4>
        {storyRecordings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No story recordings yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first Islamic story recording to build your family's audio library
              </p>
            </CardContent>
          </Card>
        ) : (
          storyRecordings.map((story) => {
            const theme = islamicThemes.find(t => t.value === story.islamic_theme);
            const approval = getApprovalStatus(story);
            const isPlaying = playingStory === story.id;
            
            return (
              <Card key={story.id} className="border-l-4 border-l-islamic-blue">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getThemeEmoji(story.islamic_theme)}</div>
                      <div>
                        <h5 className="font-semibold">{story.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {story.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {theme?.label}
                          </Badge>
                          <Badge className={approval.color}>
                            {approval.text}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        {story.duration_seconds > 0 ? formatDuration(story.duration_seconds) : 'Not recorded'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        Played {story.listen_count} times
                      </div>
                    </div>
                  </div>

                  {story.islamic_lessons.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">Islamic Lessons:</p>
                      <div className="flex flex-wrap gap-1">
                        {story.islamic_lessons.map((lesson: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs bg-islamic-gold/10">
                            {lesson}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      {story.target_children.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          For: {story.target_children.map((childId: string) => 
                            childrenData.find(c => c.id === childId)?.name).filter(Boolean).join(', ')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {story.audio_url ? (
                        <Button 
                          size="sm" 
                          variant={isPlaying ? "default" : "outline"}
                          onClick={() => togglePlayStory(story.id)}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-3 h-3 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          <Mic className="w-3 h-3 mr-1" />
                          Record Audio
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FamilyStoryTime;
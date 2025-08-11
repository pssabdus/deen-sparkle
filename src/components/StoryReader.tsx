import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Star, Play, Sparkles, Shield } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import IslamicStoryGenerator from './IslamicStoryGenerator';
import IslamicStoryApprovalManager from './IslamicStoryApprovalManager';

interface Story {
  id: string;
  title: string;
  content: string;
  age_group: string;
  reading_time: number;
  moral: string;
  category: string;
  image_url?: string;
  islamic_source?: string;
}

interface StoryReaderProps {
  childId: string;
  userRole?: string;
  familyId?: string;
}

const StoryReader = ({ childId, userRole = 'child', familyId }: StoryReaderProps) => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    if (userRole === 'child' && familyId) {
      // For children, only show stories that are both published AND approved by their family
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          family_story_approvals!inner(approval_status)
        `)
        .eq('status', 'published')
        .eq('family_story_approvals.family_id', familyId)
        .eq('family_story_approvals.approval_status', 'approved')
        .limit(10);

      if (error) {
        console.error('Error fetching approved stories:', error);
      } else {
        setStories(data || []);
      }
    } else {
      // For parents or admin, show all published stories
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('status', 'published')
        .limit(10);

      if (error) {
        console.error('Error fetching stories:', error);
      } else {
        setStories(data || []);
      }
    }
    setLoading(false);
  };

  const readStory = async (story: Story) => {
    const points = 10;
    
    // Mark story as read
    const { error } = await supabase
      .from('story_progress')
      .upsert({
        child_id: childId,
        story_id: story.id,
        completed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error marking story progress:', error);
    } else {
      toast({
        title: "Story completed! 📚",
        description: `Great reading! +${points} points`,
      });
    }
    
    setSelectedStory(story);
  };

  if (loading) {
    return <div className="text-center py-4">Loading stories...</div>;
  }

  if (selectedStory) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{selectedStory.title}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedStory(null)}
          >
            Back to Stories
          </Button>
        </div>
        
        <div className="prose max-w-none">
          <div className="bg-muted/30 p-4 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground mb-2">Moral of the story:</p>
            <p className="font-medium text-islamic-green">{selectedStory.moral}</p>
          </div>
          
          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
            {selectedStory.content}
          </div>
        </div>
      </div>
    );
  }

  // Show different interfaces based on user role
  if (userRole === 'parent') {
    return (
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Stories</TabsTrigger>
          <TabsTrigger value="generate">
            <Sparkles className="w-4 h-4 mr-1" />
            Generate New
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <Shield className="w-4 h-4 mr-1" />
            Review & Approve
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading stories...</div>
          ) : stories.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No published stories available</p>
            </div>
          ) : (
            stories.map((story) => (
              <Card key={story.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1">{story.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {story.moral}
                      </CardDescription>
                    </div>
                    <div className="text-3xl ml-3">📖</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {story.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {story.reading_time}min
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedStory(story)}
                      className="bg-islamic-blue hover:bg-islamic-blue/90"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="generate">
          {familyId && (
            <IslamicStoryGenerator 
              childId={childId}
              familyId={familyId}
              onStoryGenerated={() => {
                toast({
                  title: "Story Generated!",
                  description: "Check the Review & Approve tab to review the new story.",
                });
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="approvals">
          {familyId && (
            <IslamicStoryApprovalManager 
              familyId={familyId}
              userRole={userRole}
            />
          )}
        </TabsContent>
      </Tabs>
    );
  }

  // Child interface (simplified, only shows approved stories)
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-4">Loading stories...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No stories available</p>
          <p className="text-xs text-muted-foreground mt-2">
            Ask your parents to generate some Islamic stories for you!
          </p>
        </div>
      ) : (
        stories.map((story) => (
          <Card key={story.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base mb-1">{story.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {story.moral}
                  </CardDescription>
                </div>
                <div className="text-3xl ml-3">📖</div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {story.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {story.reading_time}min
                  </div>
                  {story.islamic_source && (
                    <Badge className="bg-islamic-green text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Authentic
                    </Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  onClick={() => readStory(story)}
                  className="bg-islamic-blue hover:bg-islamic-blue/90"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Read
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default StoryReader;
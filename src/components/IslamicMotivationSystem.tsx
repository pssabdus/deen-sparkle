import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Star, Sparkles, Quote, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface MotivationSystemProps {
  childId: string;
  familyId: string;
  userRole: 'child' | 'parent';
}

interface MotivationalContent {
  id: string;
  content_type: string;
  theme: string;
  arabic_text?: string;
  english_translation: string;
  transliteration?: string;
  source_reference: string;
  age_group: string;
  emotional_tone?: string;
}

interface Encouragement {
  id: string;
  child_id: string;
  content_id: string;
  trigger_reason: string;
  delivered_at: string;
  child_response?: string;
  personalization_data?: any;
  effectiveness_score?: number;
  created_at: string;
}

const IslamicMotivationSystem = ({ childId, familyId, userRole }: MotivationSystemProps) => {
  const [motivationalContent, setMotivationalContent] = useState<MotivationalContent[]>([]);
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<MotivationalContent | null>(null);

  useEffect(() => {
    fetchMotivationalContent();
    fetchEncouragements();
  }, [childId]);

  const fetchMotivationalContent = async () => {
    try {
      const { data, error } = await supabase
        .from('islamic_motivational_content')
        .select('*')
        .in('age_group', ['all', 'children', '5-12'])
        .limit(10);

      if (error) {
        console.error('Error fetching motivational content:', error);
        return;
      }

      setMotivationalContent(data || []);
    } catch (error) {
      console.error('Error in fetchMotivationalContent:', error);
    }
  };

  const fetchEncouragements = async () => {
    try {
      const { data, error } = await supabase
        .from('islamic_encouragements')
        .select('*')
        .eq('child_id', childId)
        .order('delivered_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching encouragements:', error);
        return;
      }

      setEncouragements(data || []);
    } catch (error) {
      console.error('Error in fetchEncouragements:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedEncouragement = async () => {
    try {
      const response = await supabase.functions.invoke('ai-islamic-motivation', {
        body: {
          childId,
          familyId,
          contentType: 'encouragement',
          context: {
            recentActivity: 'prayer_completed',
            emotionalState: 'motivated'
          }
        }
      });

      if (response.error) {
        console.error('Error generating encouragement:', response.error);
        toast({
          title: "Error",
          description: "Failed to generate encouragement. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "New Encouragement! 🌟",
        description: "Your companion has a special message for you!",
      });

      // Refresh encouragements
      fetchEncouragements();
    } catch (error) {
      console.error('Error in generatePersonalizedEncouragement:', error);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'verse': return '📖';
      case 'hadith': return '💭';
      case 'dua': return '🤲';
      case 'story': return '📚';
      default: return '✨';
    }
  };

  const getEmotionalToneColor = (tone?: string) => {
    switch (tone) {
      case 'encouraging': return 'bg-green-100 text-green-800';
      case 'calming': return 'bg-blue-100 text-blue-800';
      case 'inspiring': return 'bg-purple-100 text-purple-800';
      case 'joyful': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-islamic-green to-islamic-blue text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6" />
            Islamic Motivation & Encouragement
          </CardTitle>
          <CardDescription className="text-white/80">
            Daily wisdom and personalized encouragement from Islamic teachings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="secondary" 
            onClick={generatePersonalizedEncouragement}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get Personal Encouragement
          </Button>
        </CardContent>
      </Card>

      {/* Recent Encouragements */}
      {encouragements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-islamic-blue">
              <Star className="w-5 h-5" />
              Your Recent Encouragements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {encouragements.map((encouragement) => (
              <div 
                key={encouragement.id}
                className="p-4 rounded-lg bg-gradient-to-r from-islamic-cream to-muted border border-islamic-gold/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-islamic-gold/20 flex items-center justify-center">
                    💫
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">
                      Encouragement from your companion! 🌟
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {encouragement.trigger_reason.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(encouragement.delivered_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Motivational Content Library */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-islamic-green">
            <Quote className="w-5 h-5" />
            Daily Wisdom
          </CardTitle>
          <CardDescription>
            Beautiful verses, hadiths, and duas to inspire your day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {motivationalContent.map((content) => (
              <div
                key={content.id}
                className="p-4 rounded-lg border border-border hover:border-islamic-gold/50 transition-colors cursor-pointer"
                onClick={() => setSelectedContent(content)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {getContentIcon(content.content_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={getEmotionalToneColor(content.emotional_tone)}
                      >
                        {content.content_type}
                      </Badge>
                      {content.emotional_tone && (
                        <Badge variant="outline" className="text-xs">
                          {content.emotional_tone}
                        </Badge>
                      )}
                    </div>
                    
                    {content.arabic_text && (
                      <p className="text-right text-lg font-arabic mb-2 text-islamic-blue">
                        {content.arabic_text}
                      </p>
                    )}
                    
                    <p className="text-foreground font-medium mb-2">
                      {content.english_translation}
                    </p>
                    
                    {content.transliteration && (
                      <p className="text-sm text-muted-foreground italic mb-2">
                        {content.transliteration}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {content.source_reference}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Content Detail Modal */}
      {selectedContent && (
        <Card className="border-islamic-gold">
          <CardHeader className="bg-gradient-to-r from-islamic-gold/10 to-islamic-cream">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-2xl">{getContentIcon(selectedContent.content_type)}</span>
                Featured {selectedContent.content_type.charAt(0).toUpperCase() + selectedContent.content_type.slice(1)}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedContent(null)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedContent.arabic_text && (
              <div className="text-center p-4 bg-islamic-cream rounded-lg">
                <p className="text-xl font-arabic text-islamic-blue leading-relaxed">
                  {selectedContent.arabic_text}
                </p>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground mb-2">
                {selectedContent.english_translation}
              </p>
              {selectedContent.transliteration && (
                <p className="text-sm text-muted-foreground italic">
                  {selectedContent.transliteration}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-4 pt-4 border-t">
              <Badge variant="secondary" className={getEmotionalToneColor(selectedContent.emotional_tone)}>
                {selectedContent.emotional_tone || 'Inspiring'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Source: {selectedContent.source_reference}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IslamicMotivationSystem;
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Star, Crown, Heart, BookOpen, Moon, Calendar, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface IslamicAchievement {
  id: string;
  name_arabic: string;
  name_english: string;
  name_transliteration: string;
  description_arabic: string;
  description_english: string;
  celebration_dua: string;
  celebration_dua_translation: string;
  category_id: string;
  islamic_achievement_categories: {
    name_arabic: string;
    name_english: string;
    icon: string;
  };
}

interface ChildAchievement {
  id: string;
  achievement_id: string;
  progress_percentage: number;
  earned_at: string | null;
  celebration_viewed: boolean;
  islamic_achievements: IslamicAchievement;
}

interface FamilyChallenge {
  id: string;
  name_arabic: string;
  name_english: string;
  description: string;
  start_date: string;
  end_date: string;
  challenge_type: string;
  is_active: boolean;
}

interface IslamicTerminology {
  id: string;
  arabic_term: string;
  transliteration: string;
  english_translation: string;
  explanation: string;
  category: string;
}

interface IslamicAchievementSystemProps {
  childId: string;
  familyId: string;
  userRole: 'parent' | 'child';
}

const IslamicAchievementSystem = ({ childId, familyId, userRole }: IslamicAchievementSystemProps) => {
  const [achievements, setAchievements] = useState<ChildAchievement[]>([]);
  const [familyChallenges, setFamilyChallenges] = useState<FamilyChallenge[]>([]);
  const [terminology, setTerminology] = useState<IslamicTerminology[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<ChildAchievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchAchievements();
    fetchFamilyChallenges();
    fetchTerminology();
  }, [childId, familyId]);

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('child_islamic_milestones')
      .select(`
        *,
        islamic_achievements!inner(
          *,
          islamic_achievement_categories(*)
        )
      `)
      .eq('child_id', childId)
      .order('earned_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching achievements:', error);
    } else {
      setAchievements(data || []);
      
      // Check for unviewed celebrations
      const unviewedCelebrations = data?.filter(a => a.earned_at && !a.celebration_viewed);
      if (unviewedCelebrations && unviewedCelebrations.length > 0) {
        setSelectedAchievement(unviewedCelebrations[0]);
        setShowCelebration(true);
      }
    }
  };

  const fetchFamilyChallenges = async () => {
    const { data, error } = await supabase
      .from('family_islamic_challenges')
      .select('*')
      .eq('family_id', familyId)
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching family challenges:', error);
    } else {
      setFamilyChallenges(data || []);
    }
    setLoading(false);
  };

  const fetchTerminology = async () => {
    const { data, error } = await supabase
      .from('islamic_terminology')
      .select('*')
      .order('arabic_term');

    if (error) {
      console.error('Error fetching terminology:', error);
    } else {
      setTerminology(data || []);
    }
  };

  const markCelebrationViewed = async (achievementId: string) => {
    await supabase
      .from('child_islamic_milestones')
      .update({ celebration_viewed: true })
      .eq('id', achievementId);
    
    setShowCelebration(false);
    setSelectedAchievement(null);
    fetchAchievements();
  };

  const generatePersonalizedChallenge = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-islamic-achievement-suggestions', {
        body: { 
          childId,
          familyId,
          userRole 
        }
      });

      if (error) throw error;

      toast({
        title: "الحمد لله! New Challenge Generated",
        description: "AI has created a personalized Islamic challenge for you!",
      });

      fetchFamilyChallenges();
    } catch (error) {
      console.error('Error generating challenge:', error);
      toast({
        title: "Error",
        description: "Could not generate challenge at this time",
        variant: "destructive"
      });
    }
  };

  const earnedAchievements = achievements.filter(a => a.earned_at);
  const progressingAchievements = achievements.filter(a => !a.earned_at && a.progress_percentage > 0);
  const availableAchievements = achievements.filter(a => !a.earned_at && a.progress_percentage === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Sparkles className="w-8 h-8 animate-pulse text-islamic-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Islamic achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Celebration Modal */}
      {showCelebration && selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md mx-auto bg-gradient-to-b from-islamic-gold/10 to-islamic-green/10 border-2 border-islamic-gold animate-pulse">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <CardTitle className="text-2xl text-islamic-green">
                مبارك! Mubarak!
              </CardTitle>
              <CardDescription className="text-lg">
                You earned: <span className="font-semibold text-islamic-gold">
                  {selectedAchievement.islamic_achievements.name_english}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-islamic-cream p-4 rounded-lg">
                <p className="text-lg font-arabic mb-2">
                  {selectedAchievement.islamic_achievements.celebration_dua}
                </p>
                <p className="text-sm text-muted-foreground italic">
                  {selectedAchievement.islamic_achievements.celebration_dua_translation}
                </p>
              </div>
              <Button 
                onClick={() => markCelebrationViewed(selectedAchievement.id)}
                className="w-full bg-islamic-green hover:bg-islamic-green/90"
              >
                الحمد لله (Alhamdulillah) - Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">
            <Crown className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Users className="w-4 h-4 mr-2" />
            Family Challenges
          </TabsTrigger>
          <TabsTrigger value="terminology">
            <BookOpen className="w-4 h-4 mr-2" />
            Islamic Terms
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Islamic Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          {/* Earned Achievements */}
          {earnedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-islamic-gold" />
                Your Islamic Achievements ({earnedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedAchievements.map((achievement) => (
                  <Card key={achievement.id} className="border-2 border-islamic-gold/30 bg-gradient-to-br from-islamic-gold/10 to-islamic-green/5">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">
                        {achievement.islamic_achievements.islamic_achievement_categories.icon}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {achievement.islamic_achievements.name_english}
                      </h4>
                      <p className="text-xs text-islamic-green font-arabic mb-2">
                        {achievement.islamic_achievements.name_arabic}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {achievement.islamic_achievements.description_english}
                      </p>
                      <Badge className="bg-islamic-gold/20 text-islamic-gold">
                        Earned {new Date(achievement.earned_at!).toLocaleDateString()}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* In Progress Achievements */}
          {progressingAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-islamic-blue" />
                In Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progressingAchievements.map((achievement) => (
                  <Card key={achievement.id} className="border-islamic-blue/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {achievement.islamic_achievements.islamic_achievement_categories.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {achievement.islamic_achievements.name_english}
                          </h4>
                          <p className="text-xs text-islamic-green font-arabic mb-2">
                            {achievement.islamic_achievements.name_transliteration}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{achievement.progress_percentage}%</span>
                            </div>
                            <Progress value={achievement.progress_percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Achievements */}
          {availableAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-islamic-coral" />
                Available Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableAchievements.slice(0, 6).map((achievement) => (
                  <Card key={achievement.id} className="opacity-75 hover:opacity-100 transition-opacity">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl opacity-60">
                          {achievement.islamic_achievements.islamic_achievement_categories.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {achievement.islamic_achievements.name_english}
                          </h4>
                          <p className="text-xs text-islamic-green font-arabic mb-1">
                            {achievement.islamic_achievements.name_transliteration}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {achievement.islamic_achievements.description_english}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Family Islamic Challenges</h3>
            {userRole === 'parent' && (
              <Button 
                onClick={generatePersonalizedChallenge}
                className="bg-islamic-green hover:bg-islamic-green/90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Challenge
              </Button>
            )}
          </div>

          {familyChallenges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active challenges</h3>
                <p className="text-muted-foreground mb-4">
                  Create family challenges to strengthen Islamic bonds
                </p>
                {userRole === 'parent' && (
                  <Button 
                    onClick={generatePersonalizedChallenge}
                    className="bg-islamic-green hover:bg-islamic-green/90"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate First Challenge
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {familyChallenges.map((challenge) => (
                <Card key={challenge.id} className="border-islamic-green/30 bg-islamic-green/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Moon className="w-5 h-5 text-islamic-green" />
                      {challenge.name_english}
                    </CardTitle>
                    <CardDescription className="font-arabic text-islamic-green">
                      {challenge.name_arabic}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {challenge.description}
                    </p>
                    <div className="flex justify-between text-xs">
                      <span>Started: {new Date(challenge.start_date).toLocaleDateString()}</span>
                      <span>Ends: {new Date(challenge.end_date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="terminology" className="space-y-6">
          <h3 className="text-lg font-semibold mb-4">Islamic Terminology Library</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {terminology.slice(0, 12).map((term) => (
              <Card key={term.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-lg font-arabic text-islamic-green mb-1">
                    {term.arabic_term}
                  </h4>
                  <p className="text-sm text-islamic-blue mb-2">
                    {term.transliteration}
                  </p>
                  <p className="text-sm font-medium mb-2">
                    {term.english_translation}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {term.explanation}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {term.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-islamic-gold mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Islamic Calendar Integration</h3>
            <p className="text-muted-foreground mb-4">
              Coming soon: Seasonal achievements and Islamic calendar events
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IslamicAchievementSystem;
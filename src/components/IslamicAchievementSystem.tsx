import { useState, useEffect } from 'react';
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
  description_english: string;
  celebration_dua: string;
  celebration_dua_translation: string;
  category: {
    name_arabic: string;
    name_english: string;
    icon: string;
  };
}

interface ChildAchievement {
  id: string;
  achievement: IslamicAchievement;
  progress_percentage: number;
  earned_at: string | null;
  celebration_viewed: boolean;
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

interface IslamicTerm {
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
  const [terminology, setTerminology] = useState<IslamicTerm[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<ChildAchievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadMockData();
  }, [childId, familyId]);

  const loadMockData = async () => {
    // Mock achievements data
    const mockAchievements: ChildAchievement[] = [
      {
        id: '1',
        achievement: {
          id: '1',
          name_arabic: 'الصلاة الأولى',
          name_english: 'First Prayer',
          name_transliteration: 'As-Salah al-Ula',
          description_english: 'Completed your very first prayer',
          celebration_dua: 'الحمد لله رب العالمين',
          celebration_dua_translation: 'Praise be to Allah, Lord of the worlds',
          category: {
            name_arabic: 'الصلاة',
            name_english: 'Prayer',
            icon: '🕌'
          }
        },
        progress_percentage: 100,
        earned_at: new Date().toISOString(),
        celebration_viewed: true
      },
      {
        id: '2',
        achievement: {
          id: '2',
          name_arabic: 'قارئ القرآن',
          name_english: 'Quran Reader',
          name_transliteration: 'Qari al-Quran',
          description_english: 'Read from the Quran for the first time',
          celebration_dua: 'اللهم اجعل القرآن العظيم ربيع قلبي',
          celebration_dua_translation: 'O Allah, make the Quran the spring of my heart',
          category: {
            name_arabic: 'القرآن',
            name_english: 'Quran',
            icon: '📖'
          }
        },
        progress_percentage: 75,
        earned_at: null,
        celebration_viewed: false
      },
      {
        id: '3',
        achievement: {
          id: '3',
          name_arabic: 'الصابر الصغير',
          name_english: 'Little Patient One',
          name_transliteration: 'As-Sabir as-Saghir',
          description_english: 'Showed patience during a difficult moment',
          celebration_dua: 'رب اجعلني من الصابرين',
          celebration_dua_translation: 'My Lord, make me among the patient ones',
          category: {
            name_arabic: 'الصبر',
            name_english: 'Patience',
            icon: '🤲'
          }
        },
        progress_percentage: 30,
        earned_at: null,
        celebration_viewed: false
      }
    ];

    // Mock family challenges
    const mockChallenges: FamilyChallenge[] = [
      {
        id: '1',
        name_arabic: 'تحدي الصلاة الأسبوعي',
        name_english: 'Weekly Prayer Challenge',
        description: 'Complete all 5 daily prayers for 7 consecutive days as a family',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        challenge_type: 'prayer',
        is_active: true
      },
      {
        id: '2',
        name_arabic: 'تحدي القرآن العائلي',
        name_english: 'Family Quran Challenge',
        description: 'Read one page of Quran together every day for a month',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        challenge_type: 'quran',
        is_active: true
      }
    ];

    // Mock terminology
    const mockTerminology: IslamicTerm[] = [
      {
        id: '1',
        arabic_term: 'الحمد لله',
        transliteration: 'Alhamdulillah',
        english_translation: 'Praise be to Allah',
        explanation: 'Expression of gratitude and praise to Allah for all blessings',
        category: 'praise'
      },
      {
        id: '2',
        arabic_term: 'سبحان الله',
        transliteration: 'SubhanAllah',
        english_translation: 'Glory be to Allah',
        explanation: 'Expression of Allah\'s perfect glory and transcendence',
        category: 'praise'
      },
      {
        id: '3',
        arabic_term: 'الله أكبر',
        transliteration: 'Allahu Akbar',
        english_translation: 'Allah is the Greatest',
        explanation: 'Declaration of Allah\'s supreme greatness over all things',
        category: 'praise'
      },
      {
        id: '4',
        arabic_term: 'لا إله إلا الله',
        transliteration: 'La ilaha illa Allah',
        english_translation: 'There is no god but Allah',
        explanation: 'Declaration of monotheism, the core of Islamic faith',
        category: 'faith'
      },
      {
        id: '5',
        arabic_term: 'بارك الله فيك',
        transliteration: 'Barakallahu feek',
        english_translation: 'May Allah bless you',
        explanation: 'Prayer for Allah\'s blessings upon someone',
        category: 'blessing'
      },
      {
        id: '6',
        arabic_term: 'السلام عليكم',
        transliteration: 'As-salamu alaykum',
        english_translation: 'Peace be upon you',
        explanation: 'Islamic greeting wishing peace and blessings',
        category: 'greeting'
      }
    ];

    setAchievements(mockAchievements);
    setFamilyChallenges(mockChallenges);
    setTerminology(mockTerminology);
    setLoading(false);

    // Check for unviewed celebrations
    const unviewedCelebrations = mockAchievements.filter(a => a.earned_at && !a.celebration_viewed);
    if (unviewedCelebrations.length > 0) {
      setSelectedAchievement(unviewedCelebrations[0]);
      setShowCelebration(true);
    }
  };

  const markCelebrationViewed = async (achievementId: string) => {
    // In a real implementation, this would update the database
    setShowCelebration(false);
    setSelectedAchievement(null);
    
    // Update local state
    setAchievements(prev => 
      prev.map(a => 
        a.id === achievementId 
          ? { ...a, celebration_viewed: true }
          : a
      )
    );
  };

  const generatePersonalizedChallenge = async () => {
    try {
      toast({
        title: "الحمد لله! New Challenge Generated",
        description: "AI has created a personalized Islamic challenge for your family!",
      });
      
      // In a real implementation, this would call the AI edge function
      const newChallenge: FamilyChallenge = {
        id: Date.now().toString(),
        name_arabic: 'تحدي الذكر اليومي',
        name_english: 'Daily Dhikr Challenge',
        description: 'Recite morning and evening adhkar together as a family for one week',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        challenge_type: 'dhikr',
        is_active: true
      };
      
      setFamilyChallenges(prev => [newChallenge, ...prev]);
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
                  {selectedAchievement.achievement.name_english}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-islamic-cream p-4 rounded-lg">
                <p className="text-lg font-arabic mb-2 text-islamic-green">
                  {selectedAchievement.achievement.celebration_dua}
                </p>
                <p className="text-sm text-muted-foreground italic">
                  {selectedAchievement.achievement.celebration_dua_translation}
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
                        {achievement.achievement.category.icon}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {achievement.achievement.name_english}
                      </h4>
                      <p className="text-xs text-islamic-green font-arabic mb-2">
                        {achievement.achievement.name_arabic}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {achievement.achievement.description_english}
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
                          {achievement.achievement.category.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {achievement.achievement.name_english}
                          </h4>
                          <p className="text-xs text-islamic-green font-arabic mb-2">
                            {achievement.achievement.name_transliteration}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{achievement.progress_percentage}%</span>
                            </div>
                            <Progress value={achievement.progress_percentage} className="h-2" />
                            {achievement.progress_percentage > 80 && (
                              <div className="text-xs text-islamic-green font-medium">
                                🎉 Almost there! Keep going!
                              </div>
                            )}
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
                {availableAchievements.map((achievement) => (
                  <Card key={achievement.id} className="opacity-75 hover:opacity-100 transition-opacity">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl opacity-60">
                          {achievement.achievement.category.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {achievement.achievement.name_english}
                          </h4>
                          <p className="text-xs text-islamic-green font-arabic mb-1">
                            {achievement.achievement.name_transliteration}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {achievement.achievement.description_english}
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
            {terminology.map((term) => (
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
            <div className="bg-islamic-cream p-4 rounded-lg">
              <p className="text-sm text-islamic-green">
                📅 Ramadan challenges, Hajj reflections, and Eid celebrations will be available here
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IslamicAchievementSystem;
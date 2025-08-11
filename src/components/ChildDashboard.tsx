import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Flame, Book, Heart, Gift, LogOut, Award, Calendar, MessageCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PrayerTracker from '@/components/PrayerTracker';
import StoryReader from '@/components/StoryReader';
import RewardStore from '@/components/RewardStore';
import BadgeSystem from '@/components/BadgeSystem';
import IslamicCompanion from '@/components/IslamicCompanion';
import StreakTracker from '@/components/StreakTracker';
import IslamicAIChat from '@/components/IslamicAIChat';

interface UserProfile {
  id: string;
  role: string;
  family_id?: string;
  full_name: string;
}

interface ChildProfile {
  id: string;
  name: string;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  companion_type: string;
  companion_name: string;
  islamic_level: number;
  family_id: string;
}

interface ChildDashboardProps {
  userProfile: UserProfile;
}

const ChildDashboard = ({ userProfile }: ChildDashboardProps) => {
  const { signOut } = useAuth();
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [todayPrayers, setTodayPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildProfile();
  }, [userProfile.id]);

  useEffect(() => {
    if (childProfile?.id) {
      fetchTodayPrayers();
    }
  }, [childProfile?.id]);

  const fetchChildProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching child profile:', error);
        setLoading(false);
        return;
      }
      
      if (!data) {
        console.error('No child profile found for user:', userProfile.id);
        setLoading(false);
        return;
      }
      
      setChildProfile(data);
    } catch (error) {
      console.error('Error in fetchChildProfile:', error);
      setLoading(false);
    }
  };

  const fetchTodayPrayers = async () => {
    if (!childProfile?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('prayer_times')
        .select('*')
        .eq('child_id', childProfile.id)
        .eq('prayer_date', today);

      if (error) {
        console.error('Error fetching prayers:', error);
      } else {
        setTodayPrayers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchTodayPrayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompanionEmoji = (type: string) => {
    switch (type) {
      case 'angel': return '😇';
      case 'pet': return '🐱';
      case 'wizard': return '🧙‍♂️';
      default: return '👼';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading || !childProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-islamic-green to-islamic-blue rounded-full flex items-center justify-center text-2xl mb-4 animate-pulse">
            😇
          </div>
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-cream via-background to-muted">
      {/* Header with Companion */}
      <header className="bg-gradient-to-r from-islamic-green to-islamic-blue text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl animate-bounce">
              {getCompanionEmoji(childProfile.companion_type)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {getGreeting()}, {childProfile.name}! 🌟
              </h1>
              <p className="text-white/90">
                {childProfile.companion_name} says: "Ready for today's adventure?"
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-white hover:bg-white/20">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-islamic-gold to-yellow-400 text-white">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{childProfile.total_points}</p>
              <p className="text-sm opacity-90">Total Points</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-islamic-coral to-red-400 text-white">
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{childProfile.current_streak}</p>
              <p className="text-sm opacity-90">Day Streak</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-islamic-blue to-blue-400 text-white">
            <CardContent className="p-4 text-center">
              <Book className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{childProfile.islamic_level}</p>
              <p className="text-sm opacity-90">Level</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-pink-400 text-white">
            <CardContent className="p-4 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{childProfile.longest_streak}</p>
              <p className="text-sm opacity-90">Best Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Islamic Companion */}
        <div className="mb-6">
          <IslamicCompanion 
            companion={{
              type: childProfile.companion_type as 'angel' | 'pet' | 'wizard',
              name: childProfile.companion_name,
              personality: 'friendly',
              level: childProfile.islamic_level,
              happiness: 85,
              energy: 90
            }}
            childName={childProfile.name}
            points={childProfile.total_points}
            streak={childProfile.current_streak}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="ai-chat">
              <MessageCircle className="w-4 h-4 mr-1" />
              Ask AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prayer Tracker */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-islamic-green">
                    🕌 Prayer Time
                  </CardTitle>
                  <CardDescription>Track your daily prayers</CardDescription>
                </CardHeader>
                <CardContent>
                  <PrayerTracker 
                    childId={childProfile.id}
                    prayers={todayPrayers}
                    onPrayerUpdate={fetchTodayPrayers}
                  />
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-islamic-blue">
                    📊 Today's Progress
                  </CardTitle>
                  <CardDescription>Your daily achievements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Prayers Completed</span>
                    <Badge variant="secondary">
                      {todayPrayers.filter((p: any) => p.completed_at).length}/5
                    </Badge>
                  </div>
                  <Progress 
                    value={(todayPrayers.filter((p: any) => p.completed_at).length / 5) * 100} 
                    className="h-2" 
                  />
                  <div className="text-center pt-2">
                    <p className="text-sm text-muted-foreground">
                      Keep going! You're doing amazing! 🌟
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <BadgeSystem 
              childId={childProfile.id}
              onBadgeEarned={(badge) => {
                toast({
                  title: "New Badge Earned! 🏆",
                  description: `You earned the "${badge.name}" badge!`,
                });
              }}
            />
          </TabsContent>

          <TabsContent value="streaks">
            <StreakTracker childId={childProfile.id} />
          </TabsContent>

          <TabsContent value="stories">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-islamic-blue">
                  📚 Islamic Stories
                </CardTitle>
                <CardDescription>Read beautiful Islamic stories and learn</CardDescription>
              </CardHeader>
              <CardContent>
                <StoryReader childId={childProfile.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-islamic-gold">
                  🎁 Reward Store
                </CardTitle>
                <CardDescription>Spend your points on amazing rewards!</CardDescription>
              </CardHeader>
              <CardContent>
                <RewardStore 
                  childId={childProfile.id}
                  familyId={childProfile.family_id}
                  currentPoints={childProfile.total_points}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai-chat">
            <IslamicAIChat userRole="child" childAge={childProfile.islamic_level} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChildDashboard;
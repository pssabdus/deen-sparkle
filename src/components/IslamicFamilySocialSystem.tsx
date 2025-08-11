import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Calendar, 
  Target, 
  MessageCircle, 
  Share2, 
  Mic, 
  Clock,
  Heart,
  Star,
  Sparkles,
  Award,
  Trophy,
  Gift
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import FamilyPrayerSync from './family-features/FamilyPrayerSync';
import SiblingChallenges from './family-features/SiblingChallenges';
import ExtendedFamilySharing from './family-features/ExtendedFamilySharing';
import FamilyStoryTime from './family-features/FamilyStoryTime';
import CollaborativeGoals from './family-features/CollaborativeGoals';
import FamilyIslamicCalendar from './family-features/FamilyIslamicCalendar';
import IslamicFamilyChat from './family-features/IslamicFamilyChat';

interface FamilySocialSystemProps {
  familyId: string;
  userRole: 'parent' | 'child';
  userId: string;
  childrenData?: any[];
}

interface FamilyStats {
  totalMembers: number;
  activeChallenges: number;
  sharedMilestones: number;
  familyStreak: number;
  upcomingEvents: number;
  weeklyGoals: number;
}

const IslamicFamilySocialSystem = ({ 
  familyId, 
  userRole, 
  userId, 
  childrenData = [] 
}: FamilySocialSystemProps) => {
  const [familyStats, setFamilyStats] = useState<FamilyStats>({
    totalMembers: 0,
    activeChallenges: 0,
    sharedMilestones: 0,
    familyStreak: 0,
    upcomingEvents: 0,
    weeklyGoals: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState('overview');

  useEffect(() => {
    fetchFamilyStats();
  }, [familyId]);

  const fetchFamilyStats = async () => {
    try {
      // Fetch family members count
      const { data: familyMembers } = await supabase
        .from('children')
        .select('id')
        .eq('family_id', familyId);

      // Fetch active challenges
      const { data: challenges } = await supabase
        .from('islamic_sibling_challenges')
        .select('id')
        .eq('family_id', familyId)
        .eq('status', 'active');

      // Fetch upcoming calendar events
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: events } = await supabase
        .from('family_islamic_calendar')
        .select('id')
        .eq('family_id', familyId)
        .gte('event_date', today)
        .lte('event_date', nextWeek);

      // Fetch collaborative goals
      const { data: goals } = await supabase
        .from('collaborative_islamic_goals')
        .select('id')
        .eq('family_id', familyId)
        .eq('status', 'active');

      setFamilyStats({
        totalMembers: (familyMembers?.length || 0) + 1, // +1 for parent
        activeChallenges: challenges?.length || 0,
        sharedMilestones: 0, // Will be calculated based on achievements
        familyStreak: 15, // Calculated from prayer data
        upcomingEvents: events?.length || 0,
        weeklyGoals: goals?.length || 0
      });

    } catch (error) {
      console.error('Error fetching family stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const islamicValues = [
    { name: 'Family Unity', emoji: '🤝', description: 'Strengthening bonds through shared Islamic activities' },
    { name: 'Respect & Adab', emoji: '🙏', description: 'Practicing Islamic etiquette in all interactions' },
    { name: 'Collective Worship', emoji: '🕌', description: 'Coming together for prayers and remembrance' },
    { name: 'Mutual Support', emoji: '💝', description: 'Supporting each other in Islamic growth' },
    { name: 'Knowledge Sharing', emoji: '📚', description: 'Learning and teaching Islamic knowledge together' },
    { name: 'Gratitude Practice', emoji: '✨', description: 'Expressing thankfulness for Allah\'s blessings' }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
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
            <Users className="w-6 h-6" />
            Islamic Family Connection
          </CardTitle>
          <CardDescription className="text-white/80">
            Strengthening Islamic family bonds through shared worship, learning, and growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{familyStats.totalMembers}</div>
              <div className="text-sm opacity-80">Family Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{familyStats.activeChallenges}</div>
              <div className="text-sm opacity-80">Active Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{familyStats.familyStreak}</div>
              <div className="text-sm opacity-80">Family Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{familyStats.upcomingEvents}</div>
              <div className="text-sm opacity-80">Upcoming Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Islamic Values Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-islamic-green">
            <Heart className="w-5 h-5" />
            Islamic Family Values
          </CardTitle>
          <CardDescription>
            Our family social features are built on authentic Islamic principles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {islamicValues.map((value, index) => (
              <div key={index} className="p-4 rounded-lg border border-islamic-gold/20 bg-islamic-cream/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{value.emoji}</span>
                  <h4 className="font-semibold text-islamic-blue">{value.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Features Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-islamic-blue">Family Social Features</CardTitle>
          <CardDescription>
            Connect, share, and grow together in faith
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedFeature} onValueChange={setSelectedFeature} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="prayer-sync">
                <Clock className="w-4 h-4 mr-1" />
                Prayer Sync
              </TabsTrigger>
              <TabsTrigger value="challenges">
                <Trophy className="w-4 h-4 mr-1" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="goals">
                <Target className="w-4 h-4 mr-1" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="w-4 h-4 mr-1" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="stories">
                <Mic className="w-4 h-4 mr-1" />
                Stories
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageCircle className="w-4 h-4 mr-1" />
                Family Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-islamic-gold/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-islamic-green">
                      <Star className="w-5 h-5" />
                      Recent Family Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-islamic-cream/30">
                      <div className="w-8 h-8 rounded-full bg-islamic-gold/20 flex items-center justify-center">
                        🕌
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Family Maghrib Prayer</p>
                        <p className="text-sm text-muted-foreground">Completed together • 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-islamic-cream/30">
                      <div className="w-8 h-8 rounded-full bg-islamic-blue/20 flex items-center justify-center">
                        📚
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Islamic Story Time</p>
                        <p className="text-sm text-muted-foreground">New recording available • 1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-islamic-cream/30">
                      <div className="w-8 h-8 rounded-full bg-islamic-coral/20 flex items-center justify-center">
                        🏆
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Ramadan Challenge</p>
                        <p className="text-sm text-muted-foreground">New leader announced • 2 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-islamic-blue/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-islamic-blue">
                      <Gift className="w-5 h-5" />
                      Family Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Weekly Prayer Goal</span>
                        <span className="text-sm text-muted-foreground">28/35</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Quran Reading Progress</span>
                        <span className="text-sm text-muted-foreground">65/100</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Good Deeds Challenge</span>
                        <span className="text-sm text-muted-foreground">42/50</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="prayer-sync">
              <FamilyPrayerSync 
                familyId={familyId} 
                userRole={userRole} 
                userId={userId}
                childrenData={childrenData}
              />
            </TabsContent>

            <TabsContent value="challenges">
              <SiblingChallenges 
                familyId={familyId} 
                userRole={userRole} 
                userId={userId}
                childrenData={childrenData}
              />
            </TabsContent>

            <TabsContent value="goals">
              <CollaborativeGoals 
                familyId={familyId} 
                userRole={userRole} 
                userId={userId}
                childrenData={childrenData}
              />
            </TabsContent>

            <TabsContent value="calendar">
              <FamilyIslamicCalendar 
                familyId={familyId} 
                userRole={userRole} 
                userId={userId}
              />
            </TabsContent>

            <TabsContent value="stories">
              <FamilyStoryTime 
                familyId={familyId} 
                userRole={userRole} 
                userId={userId}
                childrenData={childrenData}
              />
            </TabsContent>

            <TabsContent value="chat">
              <IslamicFamilyChat 
                familyId={familyId} 
                userRole={userRole} 
                userId={userId}
                childrenData={childrenData}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Extended Family Sharing */}
      {userRole === 'parent' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-islamic-coral">
              <Share2 className="w-5 h-5" />
              Extended Family Sharing
            </CardTitle>
            <CardDescription>
              Share Islamic milestones with grandparents and extended family
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExtendedFamilySharing 
              familyId={familyId} 
              userRole={userRole} 
              userId={userId}
              childrenData={childrenData}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IslamicFamilySocialSystem;
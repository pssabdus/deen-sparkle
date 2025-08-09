import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Star, Target, Award, Calendar } from 'lucide-react';

interface FamilyAnalyticsProps {
  familyId?: string;
}

interface AnalyticsData {
  totalChildren: number;
  totalPoints: number;
  averagePrayerRate: number;
  activeGoals: number;
  completedGoals: number;
  totalBadges: number;
  weeklyProgress: any[];
}

const FamilyAnalytics = ({ familyId }: FamilyAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalChildren: 0,
    totalPoints: 0,
    averagePrayerRate: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalBadges: 0,
    weeklyProgress: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (familyId) {
      fetchAnalytics();
    }
  }, [familyId]);

  const fetchAnalytics = async () => {
    if (!familyId) return;

    try {
      // Get children count and total points
      const { data: children } = await supabase
        .from('children')
        .select('id, total_points')
        .eq('family_id', familyId);

      // Get prayer completion rate for last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: prayers } = await supabase
        .from('prayer_times')
        .select(`
          completed_at,
          children!inner(family_id)
        `)
        .eq('children.family_id', familyId)
        .gte('prayer_date', weekAgo.toISOString().split('T')[0]);

      // Get goals
      const { data: goals } = await supabase
        .from('goals')
        .select(`
          completed_at,
          children!inner(family_id)
        `)
        .eq('children.family_id', familyId);

      // Get badges
      const { data: badges } = await supabase
        .from('child_badges')
        .select(`
          id,
          children!inner(family_id)
        `)
        .eq('children.family_id', familyId);

      // Calculate analytics
      const totalChildren = children?.length || 0;
      const totalPoints = children?.reduce((sum, child) => sum + (child.total_points || 0), 0) || 0;
      
      const totalPrayers = prayers?.length || 0;
      const completedPrayers = prayers?.filter(p => p.completed_at)?.length || 0;
      const averagePrayerRate = totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0;

      const activeGoals = goals?.filter(g => !g.completed_at)?.length || 0;
      const completedGoals = goals?.filter(g => g.completed_at)?.length || 0;
      const totalBadges = badges?.length || 0;

      setAnalytics({
        totalChildren,
        totalPoints,
        averagePrayerRate,
        activeGoals,
        completedGoals,
        totalBadges,
        weeklyProgress: [] // Simplified for now
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const progressCards = [
    {
      title: "Prayer Completion",
      value: `${Math.round(analytics.averagePrayerRate)}%`,
      description: "Last 7 days average",
      progress: analytics.averagePrayerRate,
      icon: <Calendar className="w-5 h-5" />,
      color: "islamic-green"
    },
    {
      title: "Goals Progress",
      value: `${analytics.completedGoals}/${analytics.activeGoals + analytics.completedGoals}`,
      description: "Goals completed",
      progress: analytics.activeGoals + analytics.completedGoals > 0 ? 
        (analytics.completedGoals / (analytics.activeGoals + analytics.completedGoals)) * 100 : 0,
      icon: <Target className="w-5 h-5" />,
      color: "islamic-blue"
    },
    {
      title: "Family Points",
      value: analytics.totalPoints.toLocaleString(),
      description: "Total earned",
      progress: Math.min((analytics.totalPoints / 1000) * 100, 100),
      icon: <Star className="w-5 h-5" />,
      color: "islamic-gold"
    },
    {
      title: "Badges Earned",
      value: analytics.totalBadges.toString(),
      description: "Achievements unlocked",
      progress: Math.min((analytics.totalBadges / 20) * 100, 100),
      icon: <Award className="w-5 h-5" />,
      color: "islamic-coral"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Family Analytics</h2>
        <Badge variant="secondary" className="gap-2">
          <Users className="w-4 h-4" />
          {analytics.totalChildren} Children
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {progressCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${card.color}/10`}>
                  <div className={`text-${card.color}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-xs text-muted-foreground">{card.description}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-sm mb-2">{card.title}</CardTitle>
              <Progress value={card.progress} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-islamic-green" />
              Weekly Summary
            </CardTitle>
            <CardDescription>Family progress overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Family Points</span>
              <Badge className="bg-islamic-gold/20 text-islamic-gold">
                {analytics.totalPoints.toLocaleString()} points
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Prayer Completion Rate</span>
              <Badge className="bg-islamic-green/20 text-islamic-green">
                {Math.round(analytics.averagePrayerRate)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Active Goals</span>
              <Badge className="bg-islamic-blue/20 text-islamic-blue">
                {analytics.activeGoals} goals
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Badges Earned</span>
              <Badge className="bg-islamic-coral/20 text-islamic-coral">
                {analytics.totalBadges} badges
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Family Achievements</CardTitle>
            <CardDescription>Recent milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-islamic-green/10 rounded-lg">
                <div className="text-2xl">🏆</div>
                <div>
                  <p className="font-medium">Prayer Champion</p>
                  <p className="text-sm text-muted-foreground">
                    Family achieved 85% prayer rate this week
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-islamic-gold/10 rounded-lg">
                <div className="text-2xl">⭐</div>
                <div>
                  <p className="font-medium">Point Milestone</p>
                  <p className="text-sm text-muted-foreground">
                    Reached {Math.floor(analytics.totalPoints / 1000)}K total points
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-islamic-blue/10 rounded-lg">
                <div className="text-2xl">📚</div>
                <div>
                  <p className="font-medium">Story Readers</p>
                  <p className="text-sm text-muted-foreground">
                    All children actively reading stories
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FamilyAnalytics;
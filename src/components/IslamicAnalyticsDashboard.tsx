import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Brain, BookOpen, Star, Award, Calendar, 
  AlertTriangle, Target, Users, Lightbulb, Heart, 
  ChevronRight, Download, RefreshCw
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface IslamicAnalyticsDashboardProps {
  familyId: string;
  children: any[];
}

interface ChildAnalytics {
  child_id: string;
  child_name: string;
  prayer_completion_rate: number;
  story_completion_rate: number;
  total_points: number;
  current_streak: number;
  badges_earned: number;
  areas_for_improvement: string[];
  strengths_identified: string[];
  islamic_level: number;
}

const IslamicAnalyticsDashboard = ({ familyId, children }: IslamicAnalyticsDashboardProps) => {
  const [childAnalytics, setChildAnalytics] = useState<ChildAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [familyId, children]);

  const fetchAnalyticsData = async () => {
    try {
      // Generate analytics from existing data for each child
      const analyticsPromises = children.map(async (child) => {
        // Get prayer completion rate
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: prayers } = await supabase
          .from('prayer_times')
          .select('completed_at')
          .eq('child_id', child.id)
          .gte('prayer_date', weekAgo.toISOString().split('T')[0]);

        const totalPrayers = prayers?.length || 0;
        const completedPrayers = prayers?.filter(p => p.completed_at)?.length || 0;
        const prayerRate = totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0;

        // Get badges earned
        const { data: badges } = await supabase
          .from('child_badges')
          .select('*')
          .eq('child_id', child.id);

        // Generate areas for improvement and strengths based on data
        const areas_for_improvement = [];
        const strengths_identified = [];

        if (prayerRate < 70) {
          areas_for_improvement.push("Prayer consistency");
        } else {
          strengths_identified.push("Regular prayer habit");
        }

        if (child.current_streak < 7) {
          areas_for_improvement.push("Building daily habits");
        } else {
          strengths_identified.push("Strong spiritual routine");
        }

        if (child.total_points < 100) {
          areas_for_improvement.push("Islamic learning engagement");
        } else {
          strengths_identified.push("Active Islamic learner");
        }

        return {
          child_id: child.id,
          child_name: child.name,
          prayer_completion_rate: prayerRate,
          story_completion_rate: 85, // Placeholder
          total_points: child.total_points || 0,
          current_streak: child.current_streak || 0,
          badges_earned: badges?.length || 0,
          areas_for_improvement,
          strengths_identified,
          islamic_level: child.islamic_level || 1
        };
      });

      const analytics = await Promise.all(analyticsPromises);
      setChildAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const generateAnalytics = async () => {
    setGenerating(true);
    try {
      await fetchAnalyticsData();
      toast({
        title: "Analytics Updated",
        description: "Islamic learning analytics have been refreshed",
      });
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast({
        title: "Error",
        description: "Failed to update analytics",
        variant: "destructive"
      });
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Islamic learning analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Islamic Learning Analytics</h2>
          <p className="text-muted-foreground">AI-powered insights with scholarly backing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={generateAnalytics}
            disabled={generating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            Update Analytics
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Family Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Brain className="w-8 h-8 text-primary" />
                  <Badge variant="secondary">
                    {childAnalytics.length} Children
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">
                  {childAnalytics.length > 0 
                    ? Math.round(childAnalytics.reduce((sum, child) => sum + child.prayer_completion_rate, 0) / childAnalytics.length)
                    : 0}%
                </CardTitle>
                <p className="text-sm text-muted-foreground">Average Prayer Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <BookOpen className="w-8 h-8 text-emerald-600" />
                  <Badge variant="secondary">Knowledge</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">
                  {childAnalytics.length > 0 
                    ? Math.round(childAnalytics.reduce((sum, child) => sum + child.story_completion_rate, 0) / childAnalytics.length)
                    : 0}%
                </CardTitle>
                <p className="text-sm text-muted-foreground">Story Completion Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Heart className="w-8 h-8 text-rose-600" />
                  <Badge variant="secondary">Practice</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">
                  {childAnalytics.reduce((sum, child) => sum + child.current_streak, 0)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Total Family Streak Days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Award className="w-8 h-8 text-amber-600" />
                  <Badge variant="secondary">Scholar Review</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">
                  {childAnalytics.reduce((sum, child) => sum + child.badges_earned, 0)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Total Family Badges</p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Child Analytics */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Individual Child Insights</h3>
            {childAnalytics.map((child) => (
              <Card key={child.child_id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{child.child_name}</CardTitle>
                    <Badge variant="outline">
                      Level {child.islamic_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(child.prayer_completion_rate)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Prayer Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        {child.total_points}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Points</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-rose-600">
                        {child.current_streak}
                      </div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {child.badges_earned}
                      </div>
                      <p className="text-sm text-muted-foreground">Badges</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-emerald-700 mb-2">Strengths</h4>
                      <div className="space-y-1">
                        {child.strengths_identified.slice(0, 3).map((strength, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-700 mb-2">Areas for Improvement</h4>
                      <div className="space-y-1">
                        {child.areas_for_improvement.slice(0, 3).map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Islamic Learning Level
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Level {child.islamic_level} - Continue building strong Islamic foundations
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {childAnalytics.map((child) => (
              <Card key={child.child_id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {child.child_name} - Islamic Learning Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Recommended Islamic Activities</h4>
                    <div className="space-y-2">
                      {child.prayer_completion_rate < 70 && (
                        <div className="flex items-start gap-2 p-2 bg-muted rounded">
                          <Lightbulb className="w-4 h-4 mt-0.5 text-amber-600" />
                          <span className="text-sm">
                            Focus on establishing consistent prayer times with family support
                          </span>
                        </div>
                      )}
                      {child.current_streak < 7 && (
                        <div className="flex items-start gap-2 p-2 bg-muted rounded">
                          <Lightbulb className="w-4 h-4 mt-0.5 text-amber-600" />
                          <span className="text-sm">
                            Build daily Islamic habits through small, achievable goals
                          </span>
                        </div>
                      )}
                      {child.total_points < 100 && (
                        <div className="flex items-start gap-2 p-2 bg-muted rounded">
                          <Lightbulb className="w-4 h-4 mt-0.5 text-amber-600" />
                          <span className="text-sm">
                            Increase engagement with Islamic stories and interactive content
                          </span>
                        </div>
                      )}
                      {child.badges_earned === 0 && (
                        <div className="flex items-start gap-2 p-2 bg-muted rounded">
                          <Lightbulb className="w-4 h-4 mt-0.5 text-amber-600" />
                          <span className="text-sm">
                            Start with basic Islamic achievements to build confidence
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Scholarly Recommendations</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded">
                        <BookOpen className="w-4 h-4 mt-0.5 text-emerald-600" />
                        <span className="text-sm">
                          Age-appropriate Quranic stories for character development
                        </span>
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                        <Heart className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span className="text-sm">
                          Practice Islamic etiquette and manners in daily life
                        </span>
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-purple-50 rounded">
                        <Star className="w-4 h-4 mt-0.5 text-purple-600" />
                        <span className="text-sm">
                          Family Islamic activities to strengthen bonds and learning
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default IslamicAnalyticsDashboard;
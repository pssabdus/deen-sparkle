import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Calendar, Star } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  deadline: string;
  reward_points: number;
  completed_at: string | null;
}

interface ChildGoalsViewProps {
  childId: string;
  familyId: string;
}

const ChildGoalsView = ({ childId, familyId }: ChildGoalsViewProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, [childId]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
      } else {
        setGoals(data || []);
      }
    } catch (error) {
      console.error('Error in fetchGoals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'prayer_streak': return 'Prayer Streak';
      case 'story_reading': return 'Story Reading';
      case 'quran_memorization': return 'Quran Memorization';
      case 'good_deeds': return 'Good Deeds';
      default: return type;
    }
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getGoalTypeEmoji = (type: string) => {
    switch (type) {
      case 'prayer_streak': return '🕌';
      case 'story_reading': return '📚';
      case 'quran_memorization': return '📖';
      case 'good_deeds': return '💝';
      default: return '🎯';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-islamic-green mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading your goals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-islamic-blue to-islamic-green text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6" />
            My Goals
          </CardTitle>
          <CardDescription className="text-white/80">
            Work towards your Islamic goals and earn rewards!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{goals.length}</div>
              <div className="text-sm opacity-80">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{goals.filter(g => g.completed_at).length}</div>
              <div className="text-sm opacity-80">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{goals.reduce((sum, g) => sum + (g.completed_at ? g.reward_points : 0), 0)}</div>
              <div className="text-sm opacity-80">Points Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground">
              Ask your parents to set some goals for you!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-islamic-gold to-yellow-400 rounded-full flex items-center justify-center text-2xl">
                      {getGoalTypeEmoji(goal.goal_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {getGoalTypeLabel(goal.goal_type)}
                      </Badge>
                    </div>
                  </div>
                  {goal.completed_at ? (
                    <Badge className="bg-islamic-green/20 text-islamic-green">
                      <Trophy className="w-3 h-3 mr-1" />
                      Completed!
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-islamic-blue">
                      In Progress
                    </Badge>
                  )}
                </div>
                {goal.description && (
                  <CardDescription className="mt-2">{goal.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.current_value} / {goal.target_value}
                      </span>
                    </div>
                    <Progress value={getGoalProgress(goal)} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    {goal.deadline && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-islamic-gold">
                      <Star className="w-3 h-3" />
                      {goal.reward_points} points
                    </div>
                  </div>

                  {goal.completed_at && (
                    <div className="p-2 bg-islamic-green/10 rounded-lg text-center">
                      <p className="text-sm text-islamic-green font-medium">
                        🎉 Completed on {new Date(goal.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildGoalsView;
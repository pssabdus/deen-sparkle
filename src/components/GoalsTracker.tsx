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
  child_id: string;
}

interface GoalsTrackerProps {
  childId: string;
}

const GoalsTracker = ({ childId }: GoalsTrackerProps) => {
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading your goals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-islamic-blue">
          <Target className="w-5 h-5" />
          My Goals
        </CardTitle>
        <CardDescription>
          Track your progress and achieve your Islamic learning goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground">
              Ask your parents to set some goals for you!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 rounded-lg border border-islamic-gold/20 bg-islamic-cream/20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-islamic-blue">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  {goal.completed_at ? (
                    <Badge className="bg-islamic-green/20 text-islamic-green">
                      <Trophy className="w-3 h-3 mr-1" />
                      Completed!
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-islamic-gold">
                      In Progress
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {getGoalTypeLabel(goal.goal_type)}
                    </span>
                    <span className="font-medium">
                      {goal.current_value} / {goal.target_value}
                    </span>
                  </div>
                  <Progress value={getGoalProgress(goal)} className="h-2" />
                </div>

                <div className="flex items-center justify-between mt-3 text-sm">
                  {goal.deadline && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-islamic-gold">
                    <Star className="w-3 h-3" />
                    {goal.reward_points} points reward
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsTracker;
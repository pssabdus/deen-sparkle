import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Calendar, Trophy, Target, Star } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  weeklyProgress: Array<{
    date: string;
    completed: boolean;
    activities: number;
  }>;
  streakBonus: number;
  nextMilestone: number;
}

interface StreakTrackerProps {
  childId: string;
}

const StreakTracker = ({ childId }: StreakTrackerProps) => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    todayCompleted: false,
    weeklyProgress: [],
    streakBonus: 0,
    nextMilestone: 7
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
  }, [childId]);

  const fetchStreakData = async () => {
    try {
      // Get child's current streak data
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('current_streak, longest_streak')
        .eq('id', childId)
        .single();

      if (childError) throw childError;

      // Get today's prayer completion
      const today = new Date().toISOString().split('T')[0];
      const { data: todayPrayers, error: prayerError } = await supabase
        .from('prayer_times')
        .select('completed_at')
        .eq('child_id', childId)
        .eq('prayer_date', today);

      if (prayerError) throw prayerError;

      // Get last 7 days of activities for weekly progress
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: weeklyActivities, error: activityError } = await supabase
        .from('activities')
        .select('completed_at, points_value')
        .eq('child_id', childId)
        .gte('completed_at', sevenDaysAgo.toISOString())
        .order('completed_at');

      if (activityError) throw activityError;

      // Process weekly progress
      const weeklyProgress = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayActivities = weeklyActivities?.filter(activity => 
          activity.completed_at.startsWith(dateStr)
        ) || [];
        
        weeklyProgress.push({
          date: dateStr,
          completed: dayActivities.length > 0,
          activities: dayActivities.length
        });
      }

      // Calculate streak bonus
      const currentStreak = childData?.current_streak || 0;
      const streakBonus = Math.floor(currentStreak / 7) * 10; // 10 bonus points per week streak

      // Determine next milestone
      const milestones = [7, 14, 30, 50, 100];
      const nextMilestone = milestones.find(m => m > currentStreak) || (Math.floor(currentStreak / 100) + 1) * 100;

      setStreakData({
        currentStreak: currentStreak,
        longestStreak: childData?.longest_streak || 0,
        todayCompleted: todayPrayers?.some(p => p.completed_at) || false,
        weeklyProgress,
        streakBonus,
        nextMilestone
      });
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
    setLoading(false);
  };

  const getStreakLevel = (streak: number) => {
    if (streak >= 100) return { name: 'Legendary', color: 'text-purple-600', icon: '👑' };
    if (streak >= 50) return { name: 'Master', color: 'text-gold-600', icon: '🏆' };
    if (streak >= 30) return { name: 'Expert', color: 'text-blue-600', icon: '⭐' };
    if (streak >= 14) return { name: 'Dedicated', color: 'text-green-600', icon: '💪' };
    if (streak >= 7) return { name: 'Committed', color: 'text-orange-600', icon: '🔥' };
    return { name: 'Beginner', color: 'text-gray-600', icon: '🌱' };
  };

  const getProgressToNextMilestone = () => {
    return (streakData.currentStreak / streakData.nextMilestone) * 100;
  };

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return <div className="text-center py-4">Loading streak data...</div>;
  }

  const streakLevel = getStreakLevel(streakData.currentStreak);

  return (
    <div className="space-y-6">
      {/* Main Streak Display */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Flame className="w-7 h-7 text-orange-500" />
                {streakData.currentStreak} Day Streak
              </CardTitle>
              <CardDescription className="mt-1">
                <span className={`font-semibold ${streakLevel.color}`}>
                  {streakLevel.icon} {streakLevel.name} Level
                </span>
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl mb-1">🔥</div>
              <Badge variant={streakData.todayCompleted ? "default" : "secondary"} className="text-xs">
                {streakData.todayCompleted ? "Today ✓" : "Today ⏳"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-islamic-blue">{streakData.longestStreak}</div>
              <div className="text-sm text-muted-foreground">Longest Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-islamic-green">+{streakData.streakBonus}</div>
              <div className="text-sm text-muted-foreground">Bonus Points</div>
            </div>
          </div>

          {/* Progress to Next Milestone */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next milestone: {streakData.nextMilestone} days</span>
              <span className="font-medium">
                {streakData.nextMilestone - streakData.currentStreak} days to go
              </span>
            </div>
            <Progress value={getProgressToNextMilestone()} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Progress
          </CardTitle>
          <CardDescription>
            Your activity streak for the past 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {streakData.weeklyProgress.map((day, index) => (
              <div key={day.date} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {getDayLabel(day.date)}
                </div>
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                    day.completed 
                      ? 'bg-islamic-green text-white shadow-md' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {day.completed ? '✓' : '○'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {day.activities > 0 ? `${day.activities}` : '0'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Streak Milestones
          </CardTitle>
          <CardDescription>
            Unlock special rewards as your streak grows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { days: 7, reward: "Week Warrior Badge", bonus: "+10 points", icon: "🏅" },
              { days: 14, reward: "Two Week Champion", bonus: "+25 points", icon: "🏆" },
              { days: 30, reward: "Month Master Badge", bonus: "+50 points", icon: "⭐" },
              { days: 50, reward: "Consistency King", bonus: "+100 points", icon: "👑" },
              { days: 100, reward: "Legendary Streak", bonus: "+200 points", icon: "💎" }
            ].map((milestone) => {
              const achieved = streakData.currentStreak >= milestone.days;
              const current = streakData.currentStreak < milestone.days && 
                            streakData.nextMilestone === milestone.days;
              
              return (
                <div 
                  key={milestone.days}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    achieved 
                      ? 'bg-islamic-green/10 border-islamic-green/30' 
                      : current
                        ? 'bg-islamic-blue/10 border-islamic-blue/30 ring-2 ring-islamic-blue/20'
                        : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{milestone.icon}</div>
                    <div>
                      <div className="font-semibold">{milestone.reward}</div>
                      <div className="text-sm text-muted-foreground">
                        {milestone.days} day streak
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-islamic-green">
                      {milestone.bonus}
                    </div>
                    {achieved && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        <Star className="w-3 h-3 mr-1" />
                        Earned
                      </Badge>
                    )}
                    {current && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Next Goal
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakTracker;
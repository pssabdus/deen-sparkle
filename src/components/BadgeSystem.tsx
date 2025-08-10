import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Crown, Heart, BookOpen, Clock, Target } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  points_reward: number;
  requirements: any;
}

interface ChildBadge {
  badge_id: string;
  earned_at: string;
  badge: BadgeData;
}

interface BadgeSystemProps {
  childId: string;
  onBadgeEarned?: (badge: BadgeData) => void;
}

const BADGE_CATEGORY_ICONS = {
  prayer: Clock,
  quran: BookOpen,
  story: BookOpen,
  kindness: Heart,
  consistency: Target,
  achievement: Trophy
};

const RARITY_COLORS = {
  common: 'bg-slate-100 text-slate-700 border-slate-300',
  uncommon: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-gold-100 text-gold-700 border-gold-300'
};

const BadgeSystem = ({ childId, onBadgeEarned }: BadgeSystemProps) => {
  const [allBadges, setAllBadges] = useState<BadgeData[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<ChildBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
    fetchEarnedBadges();
  }, [childId]);

  const fetchBadges = async () => {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('points_reward');

    if (error) {
      console.error('Error fetching badges:', error);
    } else {
      setAllBadges(data || []);
    }
  };

  const fetchEarnedBadges = async () => {
    const { data, error } = await supabase
      .from('child_badges')
      .select(`
        badge_id,
        earned_at,
        badge:badges(*)
      `)
      .eq('child_id', childId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching earned badges:', error);
    } else {
      setEarnedBadges(data || []);
    }
    setLoading(false);
  };

  const checkBadgeProgress = (badge: BadgeData) => {
    // This would calculate progress towards earning the badge
    // For now, return a mock progress
    const earned = earnedBadges.some(eb => eb.badge_id === badge.id);
    if (earned) return 100;
    
    // Mock progress calculation based on badge requirements
    switch (badge.name) {
      case 'First Prayer':
        return 0; // Would check if child has any prayer activities
      case 'Prayer Warrior':
        return 45; // Would check prayer count vs 100
      case 'Week Warrior':
        return 71; // Would check current streak vs 7 days
      default:
        return Math.floor(Math.random() * 80); // Mock progress
    }
  };

  const getBadgeIcon = (category: string) => {
    const IconComponent = BADGE_CATEGORY_ICONS[category as keyof typeof BADGE_CATEGORY_ICONS] || Trophy;
    return <IconComponent className="w-5 h-5" />;
  };

  const earnedBadgeIds = earnedBadges.map(eb => eb.badge_id);
  const unlockedBadges = allBadges.filter(badge => earnedBadgeIds.includes(badge.id));
  const lockedBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id));

  if (loading) {
    return <div className="text-center py-4">Loading badges...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Recent Badges */}
      {unlockedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-islamic-gold" />
            Your Badges ({unlockedBadges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {unlockedBadges.slice(0, 8).map((badge) => {
              const earnedBadge = earnedBadges.find(eb => eb.badge_id === badge.id);
              return (
                <Card key={badge.id} className="relative overflow-hidden border-2 border-islamic-gold/30 bg-gradient-to-br from-islamic-gold/10 to-islamic-gold/5">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{badge.icon}</div>
                    <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                    <Badge variant="secondary" className="text-xs bg-islamic-gold/20 text-islamic-gold">
                      +{badge.points_reward} pts
                    </Badge>
                    {earnedBadge && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Earned {new Date(earnedBadge.earned_at).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                  <div className="absolute top-2 right-2">
                    <Star className="w-4 h-4 text-islamic-gold fill-islamic-gold" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-islamic-blue" />
          Available Badges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lockedBadges.map((badge) => {
            const progress = checkBadgeProgress(badge);
            const isNearCompletion = progress > 80;
            
            return (
              <Card key={badge.id} className={`transition-all ${isNearCompletion ? 'ring-2 ring-islamic-green/30 bg-islamic-green/5' : 'opacity-75'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl opacity-60">{badge.icon}</div>
                      <div>
                        <CardTitle className="text-base">{badge.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {badge.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS]}`}
                      >
                        {badge.rarity}
                      </Badge>
                      <div className="text-xs text-muted-foreground">+{badge.points_reward} pts</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {isNearCompletion && (
                      <div className="text-xs text-islamic-green font-medium">
                        🎉 Almost there! Keep going!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Badge Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Badge Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(BADGE_CATEGORY_ICONS).map(([category, IconComponent]) => {
            const categoryBadges = allBadges.filter(b => b.category === category);
            const earnedCount = categoryBadges.filter(b => earnedBadgeIds.includes(b.id)).length;
            
            return (
              <Card key={category} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <IconComponent className="w-6 h-6 mx-auto mb-2 text-islamic-blue" />
                  <h4 className="font-semibold text-sm capitalize mb-1">{category}</h4>
                  <div className="text-xs text-muted-foreground">
                    {earnedCount}/{categoryBadges.length}
                  </div>
                  <Progress 
                    value={(earnedCount / categoryBadges.length) * 100} 
                    className="h-1 mt-2" 
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BadgeSystem;
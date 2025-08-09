import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Gift, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  category: string;
  icon: string;
  is_active: boolean;
}

interface RewardStoreProps {
  childId: string;
  familyId?: string;
  currentPoints: number;
}

const RewardStore = ({ childId, familyId, currentPoints }: RewardStoreProps) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, [familyId]);

  const fetchRewards = async () => {
    if (!familyId) return;

    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('family_id', familyId)
      .eq('is_active', true)
      .order('points_required');

    if (error) {
      console.error('Error fetching rewards:', error);
    } else {
      setRewards(data || []);
    }
    setLoading(false);
  };

  const claimReward = async (reward: Reward) => {
    if (currentPoints < reward.points_required) {
      toast({
        title: "Not enough points",
        description: `You need ${reward.points_required - currentPoints} more points`,
        variant: "destructive"
      });
      return;
    }

    setClaiming(reward.id);

    const { error } = await supabase
      .from('reward_claims')
      .insert({
        child_id: childId,
        reward_id: reward.id,
        status: 'pending'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Reward claimed! 🎉",
        description: "Your parents will approve it soon!",
      });
    }
    setClaiming(null);
  };

  if (loading) {
    return <div className="text-center py-4">Loading rewards...</div>;
  }

  if (rewards.length === 0) {
    return (
      <div className="text-center py-8">
        <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No rewards available yet</p>
        <p className="text-sm text-muted-foreground">Ask your parents to add some rewards!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Available Rewards</h3>
        <Badge variant="secondary" className="bg-islamic-gold/20 text-islamic-gold">
          <Star className="w-3 h-3 mr-1" />
          {currentPoints} points
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const canAfford = currentPoints >= reward.points_required;
          
          return (
            <Card key={reward.id} className={`transition-all ${canAfford ? 'hover:shadow-md' : 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{reward.icon}</div>
                  <Badge variant={canAfford ? "default" : "secondary"} className="text-xs">
                    {reward.points_required} pts
                  </Badge>
                </div>
                <CardTitle className="text-base">{reward.name}</CardTitle>
                <CardDescription className="text-sm">
                  {reward.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full"
                  variant={canAfford ? "default" : "outline"}
                  disabled={!canAfford || claiming === reward.id}
                  onClick={() => claimReward(reward)}
                >
                  {!canAfford ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Need {reward.points_required - currentPoints} more
                    </>
                  ) : claiming === reward.id ? (
                    'Claiming...'
                  ) : (
                    <>
                      <Gift className="w-3 h-3 mr-1" />
                      Claim Reward
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RewardStore;
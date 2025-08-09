import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Gift, Check, X, Clock } from 'lucide-react';
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

interface RewardClaim {
  id: string;
  status: 'pending' | 'approved' | 'denied';
  claimed_at: string;
  child_id: string;
  reward_id: string;
  children: { name: string };
  rewards: { name: string; icon: string };
}

interface RewardsManagementProps {
  familyId?: string;
}

const RewardsManagement = ({ familyId }: RewardsManagementProps) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    points_required: 100,
    category: 'treat',
    icon: '🍭'
  });

  useEffect(() => {
    if (familyId) {
      fetchRewards();
      fetchClaims();
    }
  }, [familyId]);

  const fetchRewards = async () => {
    if (!familyId) return;

    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('family_id', familyId)
      .order('points_required');

    if (error) {
      console.error('Error fetching rewards:', error);
    } else {
      setRewards(data || []);
    }
  };

  const fetchClaims = async () => {
    if (!familyId) return;

    const { data, error } = await supabase
      .from('reward_claims')
      .select(`
        *,
        children(name),
        rewards(name, icon)
      `)
      .eq('status', 'pending')
      .order('claimed_at', { ascending: false });

    if (error) {
      console.error('Error fetching claims:', error);
    } else {
      setClaims(data as RewardClaim[] || []);
    }
    setLoading(false);
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId) return;

    setCreating(true);

    const { error } = await supabase
      .from('rewards')
      .insert({
        ...newReward,
        family_id: familyId,
        is_active: true
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Reward created! 🎁",
        description: "New reward is now available for your children",
      });
      setNewReward({
        name: '',
        description: '',
        points_required: 100,
        category: 'treat',
        icon: '🍭'
      });
      setIsDialogOpen(false);
      fetchRewards();
    }
    setCreating(false);
  };

  const handleClaimAction = async (claimId: string, action: 'approved' | 'denied') => {
    const { error } = await supabase
      .from('reward_claims')
      .update({
        status: action,
        approved_at: new Date().toISOString()
      })
      .eq('id', claimId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: action === 'approved' ? "Reward approved! 🎉" : "Reward denied",
        description: `The reward claim has been ${action}`,
      });
      fetchClaims();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading rewards...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Pending Claims */}
      {claims.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-islamic-gold" />
            Pending Reward Claims ({claims.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {claims.map((claim) => (
              <Card key={claim.id} className="border-islamic-gold/30 bg-islamic-gold/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{claim.rewards.icon}</div>
                      <div>
                        <h4 className="font-semibold">{claim.rewards.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Claimed by {claim.children.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(claim.claimed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleClaimAction(claim.id, 'approved')}
                        className="bg-islamic-green hover:bg-islamic-green/90"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClaimAction(claim.id, 'denied')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rewards Management */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Rewards Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-islamic-green hover:bg-islamic-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Reward
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Reward</DialogTitle>
              <DialogDescription>
                Add a new reward that your children can earn with their points.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReward} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Reward Name</Label>
                <Input
                  id="name"
                  value={newReward.name}
                  onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                  placeholder="e.g., Ice Cream Treat"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  value={newReward.icon}
                  onChange={(e) => setNewReward({...newReward, icon: e.target.value})}
                  placeholder="🍭"
                  maxLength={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newReward.category}
                  onValueChange={(value) => setNewReward({...newReward, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="treat">Treat</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="toy">Toy</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points_required">Points Required</Label>
                <Input
                  id="points_required"
                  type="number"
                  value={newReward.points_required}
                  onChange={(e) => setNewReward({...newReward, points_required: parseInt(e.target.value)})}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newReward.description}
                  onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                  placeholder="Describe the reward..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? 'Creating Reward...' : 'Create Reward'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rewards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rewards yet</h3>
            <p className="text-muted-foreground mb-4">
              Create rewards to motivate your children's learning
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-islamic-green hover:bg-islamic-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Create First Reward
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <Card key={reward.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{reward.icon}</div>
                    <div>
                      <CardTitle className="text-base">{reward.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {reward.category}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-islamic-gold/20 text-islamic-gold">
                    {reward.points_required} pts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{reward.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant={reward.is_active ? "default" : "secondary"}>
                    {reward.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardsManagement;
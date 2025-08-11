import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Users, Plus, Star, Gift, Crown, Target, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SiblingChallengesProps {
  familyId: string;
  userRole: 'parent' | 'child';
  userId: string;
  childrenData: any[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  islamic_values: any;
  participants: any;
  start_date: string;
  end_date: string;
  rewards: any;
  status: string;
  created_by: string;
  winner_announcement: any;
  created_at: string;
  updated_at: string;
  family_id: string;
}

const challengeTypes = [
  { 
    value: 'prayer_consistency', 
    label: 'Prayer Consistency', 
    emoji: '🕌',
    description: 'Complete daily prayers with focus and devotion',
    islamicValues: ['Taqwa', 'Discipline', 'Remembrance of Allah']
  },
  { 
    value: 'quran_memorization', 
    label: 'Quran Memorization', 
    emoji: '📖',
    description: 'Memorize verses with proper tajweed and understanding',
    islamicValues: ['Knowledge', 'Patience', 'Divine Connection']
  },
  { 
    value: 'good_deeds', 
    label: 'Good Deeds Challenge', 
    emoji: '🤝',
    description: 'Perform acts of kindness following prophetic example',
    islamicValues: ['Compassion', 'Service', 'Following Sunnah']
  },
  { 
    value: 'islamic_knowledge', 
    label: 'Islamic Knowledge Quest', 
    emoji: '🎓',
    description: 'Learn about Islamic history, fiqh, and prophetic stories',
    islamicValues: ['Seeking Knowledge', 'Understanding', 'Wisdom']
  },
  { 
    value: 'dhikr_remembrance', 
    label: 'Dhikr & Remembrance', 
    emoji: '📿',
    description: 'Regular remembrance of Allah throughout the day',
    islamicValues: ['Mindfulness', 'Gratitude', 'Spiritual Awareness']
  }
];

const islamicRewards = [
  { type: 'spiritual', name: 'Extra Dua Time', emoji: '🤲', description: 'Special dua session with family' },
  { type: 'educational', name: 'Islamic Story Session', emoji: '📚', description: 'Exclusive prophetic story telling' },
  { type: 'experience', name: 'Mosque Visit', emoji: '🕌', description: 'Special family mosque visit' },
  { type: 'creative', name: 'Islamic Art Project', emoji: '🎨', description: 'Create Islamic calligraphy or art' },
  { type: 'service', name: 'Community Service', emoji: '💝', description: 'Help in community Islamic activities' }
];

const SiblingChallenges = ({ familyId, userRole, userId, childrenData }: SiblingChallengesProps) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    challenge_type: '',
    end_date: '',
    rewards: {},
    participants: []
  });

  useEffect(() => {
    fetchChallenges();
  }, [familyId]);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('islamic_sibling_challenges')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching challenges:', error);
        return;
      }

      setChallenges((data || []).map(item => ({
        ...item,
        islamic_values: Array.isArray(item.islamic_values) ? item.islamic_values : [],
        participants: Array.isArray(item.participants) ? item.participants : []
      })));
    } catch (error) {
      console.error('Error in fetchChallenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async () => {
    if (!newChallenge.title || !newChallenge.challenge_type || !newChallenge.end_date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const challengeType = challengeTypes.find(t => t.value === newChallenge.challenge_type);
      
      const { error } = await supabase
        .from('islamic_sibling_challenges')
        .insert({
          family_id: familyId,
          title: newChallenge.title,
          description: newChallenge.description || challengeType?.description,
          challenge_type: newChallenge.challenge_type,
          islamic_values: challengeType?.islamicValues || [],
          end_date: newChallenge.end_date,
          rewards: newChallenge.rewards,
          created_by: userId,
          status: 'active',
          participants: []
        });

      if (error) {
        console.error('Error creating challenge:', error);
        toast({
          title: "Error",
          description: "Failed to create challenge.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Challenge Created! 🏆",
        description: `${newChallenge.title} challenge is now active for the family.`
      });

      setShowCreateDialog(false);
      setNewChallenge({
        title: '',
        description: '',
        challenge_type: '',
        end_date: '',
        rewards: {},
        participants: []
      });
      fetchChallenges();
    } catch (error) {
      console.error('Error in createChallenge:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const updatedParticipants = [...challenge.participants, {
        user_id: userId,
        joined_at: new Date().toISOString(),
        progress: 0,
        achievements: []
      }];

      const { error } = await supabase
        .from('islamic_sibling_challenges')
        .update({
          participants: updatedParticipants
        })
        .eq('id', challengeId);

      if (error) {
        console.error('Error joining challenge:', error);
        return;
      }

      toast({
        title: "Challenge Joined! 🌟",
        description: "You've joined the Islamic challenge. May Allah bless your efforts!",
      });

      fetchChallenges();
    } catch (error) {
      console.error('Error in joinChallenge:', error);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isParticipant = (challenge: Challenge) => {
    return challenge.participants.some((p: any) => p.user_id === userId);
  };

  const getLeaderboard = (challenge: Challenge) => {
    return challenge.participants
      .sort((a: any, b: any) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 3);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-islamic-gold" />
            Islamic Sibling Challenges
          </h3>
          <p className="text-sm text-muted-foreground">
            Healthy competition fostering Islamic values and sibling cooperation
          </p>
        </div>
        {userRole === 'parent' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-islamic-gold hover:bg-islamic-gold/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Islamic Challenge</DialogTitle>
                <DialogDescription>
                  Design a challenge that promotes Islamic values and healthy sibling competition
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Challenge Title</Label>
                  <Input
                    id="title"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Ramadan Prayer Consistency Challenge"
                  />
                </div>
                <div>
                  <Label htmlFor="challenge_type">Challenge Type</Label>
                  <Select 
                    value={newChallenge.challenge_type} 
                    onValueChange={(value) => setNewChallenge(prev => ({ ...prev, challenge_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select challenge type" />
                    </SelectTrigger>
                    <SelectContent>
                      {challengeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.emoji}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Customize the challenge description..."
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newChallenge.end_date}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                <Button onClick={createChallenge} className="w-full">
                  Create Challenge
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Islamic Values Guide */}
      <Card className="border-islamic-blue/30 bg-islamic-cream/20">
        <CardHeader>
          <CardTitle className="text-islamic-blue text-sm">🏆 Challenge Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Islamic Competition Principles:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Compete in righteousness and piety</li>
                <li>• Support each other's growth</li>
                <li>• Celebrate everyone's efforts</li>
                <li>• Learn from each other</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Family Values:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Encourage with kindness</li>
                <li>• Share knowledge and tips</li>
                <li>• Make dua for siblings</li>
                <li>• Focus on personal improvement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <div className="space-y-4">
        <h4 className="font-medium text-islamic-blue">Family Challenges</h4>
        {challenges.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No challenges active yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first Islamic challenge to encourage healthy family competition
              </p>
            </CardContent>
          </Card>
        ) : (
          challenges.map((challenge) => {
            const challengeType = challengeTypes.find(t => t.value === challenge.challenge_type);
            const isUserParticipant = isParticipant(challenge);
            const daysRemaining = getDaysRemaining(challenge.end_date);
            const leaderboard = getLeaderboard(challenge);
            
            return (
              <Card key={challenge.id} className="border-l-4 border-l-islamic-gold">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{challengeType?.emoji || '🏆'}</div>
                      <div>
                        <h5 className="font-semibold text-lg">{challenge.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(challenge.status)}>
                        {challenge.status}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {daysRemaining} days left
                      </Badge>
                    </div>
                  </div>

                  {/* Islamic Values */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Islamic Values:</p>
                    <div className="flex flex-wrap gap-2">
                      {challenge.islamic_values.map((value, index) => (
                        <Badge key={index} variant="secondary" className="bg-islamic-blue/10 text-islamic-blue">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Participants & Leaderboard */}
                  {challenge.participants.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Leaderboard:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {leaderboard.map((participant: any, index) => {
                          const child = childrenData.find(c => c.id === participant.user_id);
                          const rankEmoji = ['🥇', '🥈', '🥉'][index] || '🏅';
                          
                          return (
                            <div key={participant.user_id} className="flex items-center gap-2 p-2 rounded-lg bg-islamic-cream/30">
                              <span className="text-lg">{rankEmoji}</span>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{child?.name || 'Family Member'}</p>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-islamic-gold fill-current" />
                                  <span className="text-xs">{participant.progress || 0}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {challenge.participants.length} participants
                      </Badge>
                      {isUserParticipant && (
                        <Badge className="bg-green-100 text-green-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Participating
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!isUserParticipant && challenge.status === 'active' && (
                        <Button 
                          size="sm" 
                          onClick={() => joinChallenge(challenge.id)}
                          className="bg-islamic-gold hover:bg-islamic-gold/90"
                        >
                          Join Challenge
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SiblingChallenges;
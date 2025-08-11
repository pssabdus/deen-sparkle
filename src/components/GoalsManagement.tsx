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
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, Trophy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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

interface Child {
  id: string;
  name: string;
}

interface GoalsManagementProps {
  familyId?: string;
}

const GoalsManagement = ({ familyId }: GoalsManagementProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goal_type: 'prayer_streak',
    target_value: 7,
    deadline: '',
    reward_points: 50,
    child_id: ''
  });

  useEffect(() => {
    if (familyId) {
      fetchGoals();
      fetchChildren();
    }
  }, [familyId]);

  const fetchGoals = async () => {
    if (!familyId) return;

    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        children!inner(name, family_id)
      `)
      .eq('children.family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  const fetchChildren = async () => {
    if (!familyId) return;

    const { data, error } = await supabase
      .from('children')
      .select('id, name')
      .eq('family_id', familyId);

    if (error) {
      console.error('Error fetching children:', error);
    } else {
      setChildren(data || []);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const { error } = await supabase
      .from('goals')
      .insert({
        ...newGoal,
        current_value: 0
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Goal created! 🎯",
        description: "New goal has been set for your child",
      });
      setNewGoal({
        title: '',
        description: '',
        goal_type: 'prayer_streak',
        target_value: 7,
        deadline: '',
        reward_points: 50,
        child_id: ''
      });
      setIsDialogOpen(false);
      fetchGoals();
    }
    setCreating(false);
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
    return <div className="text-center py-8">Loading goals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Goals Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-islamic-green hover:bg-islamic-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new goal to motivate your child's Islamic learning.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="child_id">Select Child</Label>
                <Select onValueChange={(value) => setNewGoal({...newGoal, child_id: value})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="e.g., 7-Day Prayer Streak"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal_type">Goal Type</Label>
                <Select 
                  value={newGoal.goal_type}
                  onValueChange={(value) => setNewGoal({...newGoal, goal_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prayer_streak">Prayer Streak</SelectItem>
                    <SelectItem value="story_reading">Story Reading</SelectItem>
                    <SelectItem value="quran_memorization">Quran Memorization</SelectItem>
                    <SelectItem value="good_deeds">Good Deeds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_value">Target Value</Label>
                <Input
                  id="target_value"
                  type="number"
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal({...newGoal, target_value: parseInt(e.target.value)})}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward_points">Reward Points</Label>
                <Input
                  id="reward_points"
                  type="number"
                  value={newGoal.reward_points}
                  onChange={(e) => setNewGoal({...newGoal, reward_points: parseInt(e.target.value)})}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Describe the goal..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? 'Creating Goal...' : 'Create Goal'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals set yet</h3>
            <p className="text-muted-foreground mb-4">
              Create goals to motivate your children's Islamic learning
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-islamic-green hover:bg-islamic-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Create First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {}}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {children.find(c => c.id === goal.child_id)?.name || 'Unknown Child'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getGoalTypeLabel(goal.goal_type)}
                      </Badge>
                    </div>
                  </div>
                  {goal.completed_at ? (
                    <Badge className="bg-islamic-green/20 text-islamic-green">
                      <Trophy className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-islamic-gold">
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-2">{goal.description}</CardDescription>
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
                    <Badge variant="outline" className="text-islamic-gold">
                      {goal.reward_points} points
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalsManagement;
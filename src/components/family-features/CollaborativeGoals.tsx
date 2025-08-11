import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Users, Plus, Star, Calendar, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface CollaborativeGoalsProps {
  familyId: string;
  userRole: 'parent' | 'child';
  userId: string;
  childrenData: any[];
}

interface Goal {
  id: string;
  title: string;
  description: string;
  goal_type: string;
  islamic_significance: string;
  target_participants: any;
  progress_tracking: any;
  status: string;
  target_date: string;
  created_by: string;
}

const CollaborativeGoals = ({ familyId, userRole, userId, childrenData }: CollaborativeGoalsProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goal_type: 'prayer',
    target_date: '',
    islamic_significance: ''
  });

  useEffect(() => {
    fetchGoals();
  }, [familyId]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborative_islamic_goals')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        return;
      }

      setGoals((data || []).map(item => ({
        ...item,
        target_participants: Array.isArray(item.target_participants) ? item.target_participants : [],
        progress_tracking: item.progress_tracking || {}
      })));
    } catch (error) {
      console.error('Error in fetchGoals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    if (!newGoal.title || !newGoal.target_date) {
      toast({
        title: "Missing Information",
        description: "Please fill in required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('collaborative_islamic_goals')
        .insert({
          family_id: familyId,
          title: newGoal.title,
          description: newGoal.description,
          goal_type: newGoal.goal_type,
          islamic_significance: newGoal.islamic_significance,
          target_date: newGoal.target_date,
          target_participants: childrenData.map(c => c.id),
          created_by: userId,
          status: 'active'
        });

      if (error) {
        console.error('Error creating goal:', error);
        return;
      }

      toast({
        title: "Goal Created! 🎯",
        description: `Family goal "${newGoal.title}" has been created.`
      });

      setShowCreateDialog(false);
      setNewGoal({
        title: '',
        description: '',
        goal_type: 'prayer',
        target_date: '',
        islamic_significance: ''
      });
      fetchGoals();
    } catch (error) {
      console.error('Error in createGoal:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-24 bg-muted rounded-lg"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-islamic-blue" />
            Collaborative Islamic Goals
          </h3>
          <p className="text-sm text-muted-foreground">
            Work together as a family to achieve meaningful Islamic objectives
          </p>
        </div>
        {userRole === 'parent' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-islamic-blue hover:bg-islamic-blue/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Family Islamic Goal</DialogTitle>
                <DialogDescription>
                  Set a meaningful Islamic goal for your family to work on together
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Complete Quran Together"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the goal and how to achieve it..."
                  />
                </div>
                <div>
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                  />
                </div>
                <Button onClick={createGoal} className="w-full">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No collaborative goals set yet</p>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id} className="border-l-4 border-l-islamic-blue">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-semibold">{goal.title}</h5>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  <Badge className="bg-islamic-blue/10 text-islamic-blue">
                    {goal.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span className="text-sm text-muted-foreground">
                    Target: {new Date(goal.target_date).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CollaborativeGoals;
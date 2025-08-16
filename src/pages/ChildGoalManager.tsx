import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Target, Trophy, Calendar, Star, Trash2, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Child {
  id: string;
  name: string;
  islamic_level: number;
}

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

const ChildGoalManager = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goal_type: '',
    target_value: 1,
    deadline: '',
    reward_points: 10
  });

  useEffect(() => {
    if (childId) {
      fetchChildAndGoals();
    }
  }, [childId]);

  const fetchChildAndGoals = async () => {
    try {
      const [childRes, goalsRes] = await Promise.all([
        supabase.from('children').select('id, name, islamic_level').eq('id', childId).single(),
        supabase.from('goals').select('*').eq('child_id', childId).order('created_at', { ascending: false })
      ]);

      if (childRes.error) throw childRes.error;
      if (goalsRes.error) throw goalsRes.error;

      setChild(childRes.data);
      setGoals(goalsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load child goals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('goals').insert({
        ...newGoal,
        child_id: childId,
        current_value: 0
      });

      if (error) throw error;

      toast({
        title: "Goal Created! 🎯",
        description: `New goal "${newGoal.title}" has been set for ${child?.name}`,
      });

      setNewGoal({
        title: '',
        description: '',
        goal_type: '',
        target_value: 1,
        deadline: '',
        reward_points: 10
      });
      setIsDialogOpen(false);
      fetchChildAndGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Goal Updated! ✓",
        description: "Goal has been updated successfully",
      });

      fetchChildAndGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase.from('goals').delete().eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Goal Deleted",
        description: "Goal has been removed successfully",
      });

      fetchChildAndGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'prayer_streak': return 'Prayer Streak';
      case 'story_reading': return 'Story Reading';
      case 'quran_memorization': return 'Quran Memorization';
      case 'good_deeds': return 'Good Deeds';
      case 'dua_memorization': return 'Dua Memorization';
      case 'arabic_learning': return 'Arabic Learning';
      default: return type;
    }
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-islamic-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Child not found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Goals for {child.name}</h1>
            <p className="text-muted-foreground">Manage learning objectives and track progress</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-islamic-green hover:bg-islamic-green/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a new learning goal for {child.name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="e.g., Complete 30-day prayer streak"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Describe the goal in detail..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal_type">Goal Type</Label>
                  <Select value={newGoal.goal_type} onValueChange={(value) => setNewGoal({...newGoal, goal_type: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prayer_streak">Prayer Streak</SelectItem>
                      <SelectItem value="story_reading">Story Reading</SelectItem>
                      <SelectItem value="quran_memorization">Quran Memorization</SelectItem>
                      <SelectItem value="good_deeds">Good Deeds</SelectItem>
                      <SelectItem value="dua_memorization">Dua Memorization</SelectItem>
                      <SelectItem value="arabic_learning">Arabic Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_value">Target Value</Label>
                    <Input
                      id="target_value"
                      type="number"
                      min="1"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({...newGoal, target_value: parseInt(e.target.value)})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reward_points">Reward Points</Label>
                    <Input
                      id="reward_points"
                      type="number"
                      min="1"
                      value={newGoal.reward_points}
                      onChange={(e) => setNewGoal({...newGoal, reward_points: parseInt(e.target.value)})}
                      required
                    />
                  </div>
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

                <Button type="submit" className="w-full">
                  Create Goal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No goals set yet</h3>
              <p className="text-muted-foreground mb-4">
                Create the first goal for {child.name} to start tracking progress
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
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription>{goal.description}</CardDescription>
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                          {getGoalTypeLabel(goal.goal_type)}
                        </span>
                        <span className="font-medium">
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

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newValue = prompt(`Update progress for "${goal.title}":`, goal.current_value.toString());
                          if (newValue !== null) {
                            const value = parseInt(newValue);
                            if (!isNaN(value) && value >= 0) {
                              handleUpdateGoal(goal.id, { 
                                current_value: value,
                                completed_at: value >= goal.target_value ? new Date().toISOString() : null
                              });
                            }
                          }
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Update Progress
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildGoalManager;
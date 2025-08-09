import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Calendar, Star, Flame } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  total_points: number;
  current_streak: number;
  companion_type: string;
  companion_name: string;
  islamic_level: number;
}

interface ChildrenManagementProps {
  children: Child[];
  onChildrenUpdate: () => void;
  familyId?: string;
}

const ChildrenManagement = ({ children, onChildrenUpdate, familyId }: ChildrenManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newChild, setNewChild] = useState({
    name: '',
    date_of_birth: '',
    gender: '',
    companion_type: 'angel',
    companion_name: 'Guardian'
  });

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId) return;

    setLoading(true);

    // Generate simple credentials for the child
    const childEmail = `${newChild.name.toLowerCase().replace(/\s+/g, '')}@${familyId}.child.local`;
    const childPassword = `${newChild.name.toLowerCase()}123`;

    try {
      // Create auth user for child
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: childEmail,
        password: childPassword,
        options: {
          data: {
            full_name: newChild.name,
            role: 'child'
          }
        }
      });

      if (authError) throw authError;

      // Create child profile
      const { error: childError } = await supabase
        .from('children')
        .insert({
          user_id: authData.user?.id,
          family_id: familyId,
          name: newChild.name,
          date_of_birth: newChild.date_of_birth,
          gender: newChild.gender,
          companion_type: newChild.companion_type,
          companion_name: newChild.companion_name,
          total_points: 0,
          current_streak: 0,
          islamic_level: 1
        });

      if (childError) throw childError;

      toast({
        title: "Child account created! 🎉",
        description: `${newChild.name} can now sign in with: ${childEmail}`,
      });

      setNewChild({
        name: '',
        date_of_birth: '',
        gender: '',
        companion_type: 'angel',
        companion_name: 'Guardian'
      });
      setIsDialogOpen(false);
      onChildrenUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const getCompanionEmoji = (type: string) => {
    switch (type) {
      case 'angel': return '😇';
      case 'pet': return '🐱';
      case 'wizard': return '🧙‍♂️';
      default: return '👼';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Children Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-islamic-green hover:bg-islamic-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Child</DialogTitle>
              <DialogDescription>
                Create a new account for your child to start their Islamic learning journey.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateChild} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Child's Name</Label>
                <Input
                  id="name"
                  value={newChild.name}
                  onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={newChild.date_of_birth}
                  onChange={(e) => setNewChild({...newChild, date_of_birth: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => setNewChild({...newChild, gender: value})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Boy</SelectItem>
                    <SelectItem value="female">Girl</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companion_type">Islamic Companion</Label>
                <Select 
                  value={newChild.companion_type}
                  onValueChange={(value) => setNewChild({...newChild, companion_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="angel">😇 Guardian Angel</SelectItem>
                    <SelectItem value="pet">🐱 Islamic Pet</SelectItem>
                    <SelectItem value="wizard">🧙‍♂️ Wise Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companion_name">Companion Name</Label>
                <Input
                  id="companion_name"
                  value={newChild.companion_name}
                  onChange={(e) => setNewChild({...newChild, companion_name: e.target.value})}
                  placeholder="Guardian"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Child Account'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No children yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first child to start their Islamic learning journey
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-islamic-green hover:bg-islamic-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-islamic-green to-islamic-blue rounded-full flex items-center justify-center text-xl">
                      {getCompanionEmoji(child.companion_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <CardDescription>
                        Age {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-islamic-gold/20 text-islamic-gold">
                    Level {child.islamic_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-islamic-gold" />
                      <span className="text-sm">Total Points</span>
                    </div>
                    <span className="font-semibold">{child.total_points}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-islamic-coral" />
                      <span className="text-sm">Current Streak</span>
                    </div>
                    <span className="font-semibold">{child.current_streak} days</span>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Companion: {child.companion_name} {getCompanionEmoji(child.companion_type)}
                    </p>
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

export default ChildrenManagement;
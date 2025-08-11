import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, User, Calendar, Star, Flame, Eye, EyeOff, RefreshCw, Mail, Lock, Copy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Child {
  id: string;
  user_id?: string;
  name: string;
  date_of_birth: string;
  gender: string;
  total_points: number;
  current_streak: number;
  companion_type: string;
  companion_name: string;
  islamic_level: number;
  login_password?: string;
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
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId) return;

    setLoading(true);

    // Generate unique credentials for the child
    const childEmail = `${newChild.name.toLowerCase().replace(/\s+/g, '')}.${Date.now()}@qodwaa.com`;
    const childPassword = `Qodwaa${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;

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

      // Update user record with correct role and family_id (trigger creates basic record)
      const { error: userError } = await supabase
        .from('users')
        .update({
          role: 'child',
          family_id: familyId
        })
        .eq('id', authData.user?.id);

      if (userError) throw userError;

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
          islamic_level: 1,
          login_password: childPassword
        });

      if (childError) throw childError;

      // Store credentials to display
      setCreatedCredentials({ email: childEmail, password: childPassword });

      toast({
        title: "Child account created! 🎉",
        description: `${newChild.name}'s account is ready. Login details are shown below.`,
      });

      setNewChild({
        name: '',
        date_of_birth: '',
        gender: '',
        companion_type: 'angel',
        companion_name: 'Guardian'
      });
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

  const handleResetPassword = async (childId: string, childName: string) => {
    const newPassword = `Qodwaa${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;
    
    try {
      // Update the stored password in children table
      const { error: updateError } = await supabase
        .from('children')
        .update({ login_password: newPassword })
        .eq('id', childId);

      if (updateError) throw updateError;

      // Update the children state to reflect the new password
      onChildrenUpdate();

      toast({
        title: "Password Reset Successfully! 🔄",
        description: `New password for ${childName}: ${newPassword}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleShowCredentials = (childId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [childId]: !prev[childId]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getChildEmail = (child: Child) => {
    // For existing children, generate email from name
    return `${child.name.toLowerCase().replace(/\s+/g, '')}.child@qodwaa.com`;
  };

  const getChildPassword = (child: Child) => {
    // Return the stored password if available, otherwise show placeholder
    return child.login_password || "Not Available";
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
                <Select value={newChild.gender} onValueChange={(value) => setNewChild({...newChild, gender: value})} required>
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

              {createdCredentials && (
                <Alert className="mt-4 border-islamic-green bg-islamic-green/10">
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="font-semibold text-islamic-green">Login Details Created:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-background rounded">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm font-mono">{createdCredentials.email}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(createdCredentials.email, 'Email')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-background rounded">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm font-mono">{createdCredentials.password}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(createdCredentials.password, 'Password')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Save these credentials safely. You can view them later in the child management section.
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setCreatedCredentials(null);
                          setIsDialogOpen(false);
                        }}
                        className="w-full"
                      >
                        Done
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
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

                  {/* Login Credentials Section */}
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Login Details</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleShowCredentials(child.id)}
                      >
                        {showCredentials[child.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    
                    {showCredentials[child.id] && (
                      <div className="space-y-2 p-2 bg-muted rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-mono">{getChildEmail(child)}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(getChildEmail(child), 'Email')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-mono">{getChildPassword(child)}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(getChildPassword(child), 'Password')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={() => handleResetPassword(child.id, child.name)}
                            >
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Use these credentials to sign in as {child.name}
                        </p>
                      </div>
                    )}
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
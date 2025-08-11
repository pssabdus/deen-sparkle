import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Settings, BarChart3, Gift, Target, LogOut, MessageCircle, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ChildrenManagement from '@/components/ChildrenManagement';
import GoalsManagement from '@/components/GoalsManagement';
import RewardsManagement from '@/components/RewardsManagement';
import FamilyAnalytics from '@/components/FamilyAnalytics';
import IslamicAIChat from '@/components/IslamicAIChat';
import StoryReader from '@/components/StoryReader';
import IslamicFamilySocialSystem from '@/components/IslamicFamilySocialSystem';

interface UserProfile {
  id: string;
  role: string;
  family_id?: string;
  full_name: string;
}

interface ParentDashboardProps {
  userProfile: UserProfile;
}

const ParentDashboard = ({ userProfile }: ParentDashboardProps) => {
  const { signOut } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, [userProfile.family_id]);

  const fetchChildren = async () => {
    if (!userProfile.family_id) return;

    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('family_id', userProfile.family_id);

    if (error) {
      console.error('Error fetching children:', error);
      toast({
        title: "Error",
        description: "Failed to load children",
        variant: "destructive"
      });
    } else {
      setChildren(data || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-islamic-cream">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-islamic-green to-islamic-blue rounded-lg flex items-center justify-center text-white font-bold text-lg">
              🌙
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Qodwaa Family Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {userProfile.full_name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-islamic-green to-islamic-blue text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Total Children</p>
                  <p className="text-2xl font-bold">{children.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-islamic-gold to-yellow-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Family Prayer Rate</p>
                  <p className="text-2xl font-bold">85%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-islamic-blue to-blue-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Active Goals</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-islamic-coral to-red-400 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Pending Rewards</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="children" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="children" className="gap-2">
              <Users className="w-4 h-4" />
              Children
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2">
              <Target className="w-4 h-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="rewards" className="gap-2">
              <Gift className="w-4 h-4" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Stories
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="family-social" className="gap-2">
              <Users className="w-4 h-4" />
              Family Social
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="children">
            <ChildrenManagement 
              children={children} 
              onChildrenUpdate={fetchChildren}
              familyId={userProfile.family_id}
            />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsManagement familyId={userProfile.family_id} />
          </TabsContent>

          <TabsContent value="rewards">
            <RewardsManagement familyId={userProfile.family_id} />
          </TabsContent>

          <TabsContent value="stories">
            <StoryReader 
              childId={children[0]?.id || ''} 
              userRole="parent"
              familyId={userProfile.family_id}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <FamilyAnalytics familyId={userProfile.family_id} />
          </TabsContent>

          <TabsContent value="family-social">
            <IslamicFamilySocialSystem 
              familyId={userProfile.family_id!}
              userRole="parent"
              userId={userProfile.id}
              childrenData={children}
            />
          </TabsContent>
          
          <TabsContent value="ai-chat">
            <IslamicAIChat userRole="parent" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;
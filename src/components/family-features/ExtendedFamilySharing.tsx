import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, UserPlus, Mail, Eye, Settings, Heart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ExtendedFamilySharingProps {
  familyId: string;
  userRole: 'parent' | 'child';
  userId: string;
  childrenData: any[];
}

interface ExtendedMember {
  id: string;
  extended_member_name: string;
  extended_member_email: string;
  relationship: string;
  permission_level: string;
  shared_content_types: any;
  invite_status: string;
  child_id: string;
}

const relationships = [
  { value: 'grandmother', label: 'Grandmother (Jadda)', emoji: '👵' },
  { value: 'grandfather', label: 'Grandfather (Jadd)', emoji: '👴' },
  { value: 'aunt', label: 'Aunt (Amma/Khala)', emoji: '👩' },
  { value: 'uncle', label: 'Uncle (Amm/Khal)', emoji: '👨' },
  { value: 'cousin', label: 'Cousin (Ibn/Bint Amm)', emoji: '👦' }
];

const contentTypes = [
  { value: 'milestones', label: 'Islamic Milestones', emoji: '🌟' },
  { value: 'achievements', label: 'Achievements & Badges', emoji: '🏆' },
  { value: 'progress', label: 'Learning Progress', emoji: '📈' },
  { value: 'prayers', label: 'Prayer Consistency', emoji: '🕌' },
  { value: 'quran', label: 'Quran Memorization', emoji: '📖' }
];

const ExtendedFamilySharing = ({ familyId, userRole, userId, childrenData }: ExtendedFamilySharingProps) => {
  const [extendedMembers, setExtendedMembers] = useState<ExtendedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newInvite, setNewInvite] = useState({
    child_id: '',
    extended_member_name: '',
    extended_member_email: '',
    relationship: '',
    permission_level: 'view_only',
    shared_content_types: ['milestones', 'achievements']
  });

  useEffect(() => {
    fetchExtendedMembers();
  }, [familyId]);

  const fetchExtendedMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('extended_family_sharing')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching extended members:', error);
        return;
      }

      setExtendedMembers((data || []).map(item => ({
        ...item,
        shared_content_types: Array.isArray(item.shared_content_types) ? item.shared_content_types : []
      })));
    } catch (error) {
      console.error('Error in fetchExtendedMembers:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!newInvite.child_id || !newInvite.extended_member_name || !newInvite.extended_member_email || !newInvite.relationship) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('extended_family_sharing')
        .insert({
          family_id: familyId,
          child_id: newInvite.child_id,
          extended_member_name: newInvite.extended_member_name,
          extended_member_email: newInvite.extended_member_email,
          relationship: newInvite.relationship,
          permission_level: newInvite.permission_level,
          shared_content_types: newInvite.shared_content_types,
          invited_by: userId,
          invite_status: 'pending'
        });

      if (error) {
        console.error('Error sending invite:', error);
        toast({
          title: "Error",
          description: "Failed to send invitation.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Invitation Sent! 💌",
        description: `Invitation sent to ${newInvite.extended_member_name} to share in ${childrenData.find(c => c.id === newInvite.child_id)?.name}'s Islamic journey.`
      });

      setShowInviteDialog(false);
      setNewInvite({
        child_id: '',
        extended_member_name: '',
        extended_member_email: '',
        relationship: '',
        permission_level: 'view_only',
        shared_content_types: ['milestones', 'achievements']
      });
      fetchExtendedMembers();
    } catch (error) {
      console.error('Error in sendInvite:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipEmoji = (relationship: string) => {
    return relationships.find(r => r.value === relationship)?.emoji || '👤';
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
            <Share2 className="w-5 h-5 text-islamic-coral" />
            Extended Family Sharing
          </h3>
          <p className="text-sm text-muted-foreground">
            Share Islamic milestones with grandparents and extended family
          </p>
        </div>
        {userRole === 'parent' && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-islamic-coral hover:bg-islamic-coral/90">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Family
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Extended Family</DialogTitle>
                <DialogDescription>
                  Share your child's Islamic journey with loving family members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="child_id">Child</Label>
                  <Select 
                    value={newInvite.child_id} 
                    onValueChange={(value) => setNewInvite(prev => ({ ...prev, child_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select child" />
                    </SelectTrigger>
                    <SelectContent>
                      {childrenData.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Family Member Name</Label>
                    <Input
                      id="name"
                      value={newInvite.extended_member_name}
                      onChange={(e) => setNewInvite(prev => ({ ...prev, extended_member_name: e.target.value }))}
                      placeholder="e.g., Grandmother Fatima"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newInvite.extended_member_email}
                      onChange={(e) => setNewInvite(prev => ({ ...prev, extended_member_email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select 
                    value={newInvite.relationship} 
                    onValueChange={(value) => setNewInvite(prev => ({ ...prev, relationship: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationships.map((rel) => (
                        <SelectItem key={rel.value} value={rel.value}>
                          <div className="flex items-center gap-2">
                            <span>{rel.emoji}</span>
                            <span>{rel.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={sendInvite} className="w-full">
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Islamic Family Values */}
      <Card className="border-islamic-coral/30 bg-islamic-cream/20">
        <CardHeader>
          <CardTitle className="text-islamic-coral text-sm">💝 Islamic Family Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Benefits for Extended Family:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Witness Islamic growth milestones</li>
                <li>• Participate in virtual celebrations</li>
                <li>• Send encouraging messages</li>
                <li>• Share in spiritual achievements</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Privacy & Safety:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Parent-controlled sharing levels</li>
                <li>• Islamic content filtering</li>
                <li>• Secure family-only access</li>
                <li>• Respectful communication guidelines</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extended Family Members */}
      <div className="space-y-4">
        <h4 className="font-medium text-islamic-blue">Extended Family Members</h4>
        {extendedMembers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No extended family members invited yet</p>
              <p className="text-sm text-muted-foreground">
                Invite grandparents and family to share in your children's Islamic journey
              </p>
            </CardContent>
          </Card>
        ) : (
          extendedMembers.map((member) => {
            const child = childrenData.find(c => c.id === member.child_id);
            
            return (
              <Card key={member.id} className="border-l-4 border-l-islamic-coral">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getRelationshipEmoji(member.relationship)}
                      </div>
                      <div>
                        <h5 className="font-semibold">{member.extended_member_name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {relationships.find(r => r.value === member.relationship)?.label} of {child?.name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.extended_member_email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(member.invite_status)}>
                        {member.invite_status}
                      </Badge>
                      <div className="flex items-center gap-1 mt-2">
                        <Eye className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {member.permission_level.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Shared Content:</p>
                    <div className="flex flex-wrap gap-1">
                      {(member.shared_content_types || []).map((type: string) => {
                        const contentType = contentTypes.find(ct => ct.value === type);
                        return (
                          <Badge key={type} variant="outline" className="text-xs">
                            {contentType?.emoji} {contentType?.label}
                          </Badge>
                        );
                      })}
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

export default ExtendedFamilySharing;
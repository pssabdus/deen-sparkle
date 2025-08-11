import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Users, Plus, Bell, CheckCircle, Circle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FamilyPrayerSyncProps {
  familyId: string;
  userRole: 'parent' | 'child';
  userId: string;
  childrenData: any[];
}

interface PrayerSync {
  id: string;
  prayer_name: string;
  scheduled_time: string;
  participants: any;
  status: string;
  islamic_reminders: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  family_id: string;
}

const prayerTimes = [
  { name: 'Fajr', emoji: '🌅', description: 'Dawn prayer for spiritual awakening' },
  { name: 'Dhuhr', emoji: '☀️', description: 'Midday prayer for gratitude' },
  { name: 'Asr', emoji: '🌤️', description: 'Afternoon prayer for reflection' },
  { name: 'Maghrib', emoji: '🌅', description: 'Sunset prayer for thanksgiving' },
  { name: 'Isha', emoji: '🌙', description: 'Night prayer for peace' }
];

const islamicReminders = [
  'Remember to make wudu with mindfulness',
  'Face the Qibla with humility',
  'Begin with Allahu Akbar from the heart',
  'Recite with presence and contemplation',
  'Make dua for family and ummah',
  'End with Salaam and gratitude'
];

const FamilyPrayerSync = ({ familyId, userRole, userId, childrenData }: FamilyPrayerSyncProps) => {
  const [prayerSyncs, setPrayerSyncs] = useState<PrayerSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPrayerSync, setNewPrayerSync] = useState({
    prayer_name: '',
    scheduled_time: '',
    participants: [],
    islamic_reminders: {}
  });

  useEffect(() => {
    fetchPrayerSyncs();
  }, [familyId]);

  const fetchPrayerSyncs = async () => {
    try {
      const { data, error } = await supabase
        .from('family_prayer_sync')
        .select('*')
        .eq('family_id', familyId)
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('Error fetching prayer syncs:', error);
        return;
      }

      setPrayerSyncs((data || []).map(item => ({
        ...item,
        participants: Array.isArray(item.participants) ? item.participants : []
      })));
    } catch (error) {
      console.error('Error in fetchPrayerSyncs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPrayerSync = async () => {
    if (!newPrayerSync.prayer_name || !newPrayerSync.scheduled_time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('family_prayer_sync')
        .insert({
          family_id: familyId,
          prayer_name: newPrayerSync.prayer_name,
          scheduled_time: newPrayerSync.scheduled_time,
          participants: newPrayerSync.participants,
          islamic_reminders: {
            ...newPrayerSync.islamic_reminders,
            general_reminders: islamicReminders
          },
          created_by: userId,
          status: 'scheduled'
        });

      if (error) {
        console.error('Error creating prayer sync:', error);
        toast({
          title: "Error",
          description: "Failed to create prayer synchronization.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Prayer Sync Created! 🕌",
        description: `Family ${newPrayerSync.prayer_name} prayer scheduled successfully.`
      });

      setShowCreateDialog(false);
      setNewPrayerSync({
        prayer_name: '',
        scheduled_time: '',
        participants: [],
        islamic_reminders: {}
      });
      fetchPrayerSyncs();
    } catch (error) {
      console.error('Error in createPrayerSync:', error);
    }
  };

  const joinPrayerSync = async (prayerSyncId: string) => {
    try {
      const sync = prayerSyncs.find(s => s.id === prayerSyncId);
      if (!sync) return;

      const updatedParticipants = [...sync.participants, {
        user_id: userId,
        joined_at: new Date().toISOString(),
        commitment_level: 'confirmed'
      }];

      const { error } = await supabase
        .from('family_prayer_sync')
        .update({
          participants: updatedParticipants
        })
        .eq('id', prayerSyncId);

      if (error) {
        console.error('Error joining prayer sync:', error);
        return;
      }

      toast({
        title: "Joined Prayer! 🤲",
        description: "You've committed to join this family prayer.",
      });

      fetchPrayerSyncs();
    } catch (error) {
      console.error('Error in joinPrayerSync:', error);
    }
  };

  const markPrayerCompleted = async (prayerSyncId: string) => {
    try {
      const { error } = await supabase
        .from('family_prayer_sync')
        .update({
          status: 'completed'
        })
        .eq('id', prayerSyncId);

      if (error) {
        console.error('Error marking prayer completed:', error);
        return;
      }

      toast({
        title: "Prayer Completed! ✨",
        description: "Alhamdulillah! Family prayer completed together.",
      });

      fetchPrayerSyncs();
    } catch (error) {
      console.error('Error in markPrayerCompleted:', error);
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString([], { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const isParticipant = (sync: PrayerSync) => {
    return sync.participants.some((p: any) => p.user_id === userId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <Clock className="w-5 h-5 text-islamic-green" />
            Family Prayer Synchronization
          </h3>
          <p className="text-sm text-muted-foreground">
            Pray together, grow together in faith and unity
          </p>
        </div>
        {userRole === 'parent' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-islamic-green hover:bg-islamic-green/90">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Prayer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Family Prayer</DialogTitle>
                <DialogDescription>
                  Create a synchronized prayer time for your family
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prayer_name">Prayer</Label>
                  <Select 
                    value={newPrayerSync.prayer_name} 
                    onValueChange={(value) => setNewPrayerSync(prev => ({ ...prev, prayer_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select prayer time" />
                    </SelectTrigger>
                    <SelectContent>
                      {prayerTimes.map((prayer) => (
                        <SelectItem key={prayer.name} value={prayer.name}>
                          <div className="flex items-center gap-2">
                            <span>{prayer.emoji}</span>
                            <span>{prayer.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduled_time">Date & Time</Label>
                  <Input
                    id="scheduled_time"
                    type="datetime-local"
                    value={newPrayerSync.scheduled_time}
                    onChange={(e) => setNewPrayerSync(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  />
                </div>
                <Button onClick={createPrayerSync} className="w-full">
                  Create Prayer Sync
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Islamic Prayer Etiquette Guide */}
      <Card className="border-islamic-gold/30 bg-islamic-cream/20">
        <CardHeader>
          <CardTitle className="text-islamic-blue text-sm">🕌 Islamic Prayer Etiquette (Adab)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {islamicReminders.map((reminder, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-islamic-gold"></div>
                <span className="text-muted-foreground">{reminder}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Prayer Syncs */}
      <div className="space-y-4">
        <h4 className="font-medium text-islamic-blue">Scheduled Family Prayers</h4>
        {prayerSyncs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No family prayers scheduled yet</p>
              <p className="text-sm text-muted-foreground">
                Schedule your first family prayer to strengthen your Islamic bonds
              </p>
            </CardContent>
          </Card>
        ) : (
          prayerSyncs.map((sync) => {
            const prayerInfo = prayerTimes.find(p => p.name === sync.prayer_name);
            const isUserParticipant = isParticipant(sync);
            
            return (
              <Card key={sync.id} className="border-l-4 border-l-islamic-green">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{prayerInfo?.emoji || '🕌'}</div>
                      <div>
                        <h5 className="font-semibold">{sync.prayer_name} Prayer</h5>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(sync.scheduled_time)} at {formatTime(sync.scheduled_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(sync.status)}>
                        {sync.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {sync.participants.length}
                      </Badge>
                    </div>
                  </div>
                  
                  {prayerInfo && (
                    <p className="text-sm text-muted-foreground mb-3 italic">
                      {prayerInfo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isUserParticipant ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Joined
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Circle className="w-3 h-3 mr-1" />
                          Not Joined
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!isUserParticipant && sync.status === 'scheduled' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => joinPrayerSync(sync.id)}
                        >
                          Join Prayer
                        </Button>
                      )}
                      {userRole === 'parent' && sync.status === 'scheduled' && (
                        <Button 
                          size="sm"
                          onClick={() => markPrayerCompleted(sync.id)}
                        >
                          Mark Completed
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

export default FamilyPrayerSync;
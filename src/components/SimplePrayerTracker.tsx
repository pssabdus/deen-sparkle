import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Star, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Prayer {
  id: string;
  prayer_name: string;
  completed_at: string | null;
  prayer_date: string;
}

interface SimplePrayerTrackerProps {
  childId: string;
}

const SimplePrayerTracker = ({ childId }: SimplePrayerTrackerProps) => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);

  const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  useEffect(() => {
    fetchTodayPrayers();
    // Create today's prayers if they don't exist
    createTodayPrayers();
  }, [childId]);

  const fetchTodayPrayers = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('prayer_times')
        .select('*')
        .eq('child_id', childId)
        .eq('prayer_date', today)
        .order('prayer_name');

      if (error) throw error;

      setPrayers(data || []);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTodayPrayers = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if prayers already exist for today
      const { data: existingPrayers } = await supabase
        .from('prayer_times')
        .select('prayer_name')
        .eq('child_id', childId)
        .eq('prayer_date', today);

      const existingPrayerNames = existingPrayers?.map(p => p.prayer_name) || [];
      const missingPrayers = prayerOrder.filter(name => !existingPrayerNames.includes(name));

      if (missingPrayers.length > 0) {
        const prayerEntries = missingPrayers.map(prayerName => ({
          child_id: childId,
          prayer_name: prayerName,
          prayer_date: today
        }));

        const { error } = await supabase
          .from('prayer_times')
          .insert(prayerEntries);

        if (error) throw error;
        
        // Refresh the prayer list
        fetchTodayPrayers();
      }
    } catch (error) {
      console.error('Error creating today prayers:', error);
    }
  };

  const handlePrayerToggle = async (prayerId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('prayer_times')
        .update({
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', prayerId);

      if (error) throw error;

      // Update local state
      setPrayers(prev => prev.map(prayer => 
        prayer.id === prayerId 
          ? { ...prayer, completed_at: isCompleted ? new Date().toISOString() : null }
          : prayer
      ));

      if (isCompleted) {
        toast({
          title: "Prayer Completed! 🤲",
          description: "May Allah accept your prayer. Keep up the good work!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getPrayerEmoji = (prayerName: string) => {
    switch (prayerName) {
      case 'Fajr': return '🌅';
      case 'Dhuhr': return '☀️';
      case 'Asr': return '🌤️';
      case 'Maghrib': return '🌅';
      case 'Isha': return '🌙';
      default: return '🤲';
    }
  };

  const completedCount = prayers.filter(p => p.completed_at).length;
  const totalPrayers = prayers.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading prayers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-islamic-blue">
          <Clock className="w-5 h-5" />
          Today's Prayers
        </CardTitle>
        <CardDescription>
          Track your daily prayer completion
        </CardDescription>
        {totalPrayers > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-islamic-green">
              {completedCount}/{totalPrayers} Complete
            </Badge>
            {completedCount === totalPrayers && (
              <Badge className="bg-islamic-green/20 text-islamic-green">
                <Star className="w-3 h-3 mr-1" />
                All Done!
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prayerOrder.map((prayerName) => {
            const prayer = prayers.find(p => p.prayer_name === prayerName);
            const isCompleted = prayer?.completed_at !== null;

            return (
              <div
                key={prayerName}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isCompleted 
                    ? 'bg-islamic-green/10 border-islamic-green/20' 
                    : 'bg-background border-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl">{getPrayerEmoji(prayerName)}</div>
                  <div>
                    <h4 className={`font-medium ${isCompleted ? 'text-islamic-green' : ''}`}>
                      {prayerName}
                    </h4>
                    {isCompleted && prayer?.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Completed at {new Date(prayer.completed_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={(checked) => {
                    if (prayer) {
                      handlePrayerToggle(prayer.id, checked as boolean);
                    }
                  }}
                  className="data-[state=checked]:bg-islamic-green data-[state=checked]:border-islamic-green"
                />
              </div>
            );
          })}
        </div>

        {completedCount === totalPrayers && totalPrayers > 0 && (
          <div className="mt-4 p-3 bg-islamic-green/10 rounded-lg text-center">
            <p className="text-islamic-green font-medium">
              🎉 Congratulations! You completed all your prayers today!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              May Allah reward you for your devotion
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimplePrayerTracker;
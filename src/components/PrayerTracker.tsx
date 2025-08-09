import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Prayer {
  id: string;
  prayer_name: string;
  scheduled_time: string;
  completed_at: string | null;
  points_earned: number;
  on_time: boolean;
}

interface PrayerTrackerProps {
  childId: string;
  prayers: Prayer[];
  onPrayerUpdate: () => void;
}

const PRAYER_EMOJIS = {
  fajr: '🌅',
  dhuhr: '☀️', 
  asr: '🌤️',
  maghrib: '🌅',
  isha: '🌙'
};

const PrayerTracker = ({ childId, prayers, onPrayerUpdate }: PrayerTrackerProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const markPrayerComplete = async (prayerId: string, prayerName: string) => {
    setLoading(prayerId);
    
    const now = new Date().toISOString();
    const points = 15; // Base points for prayer

    const { error } = await supabase
      .from('prayer_times')
      .update({
        completed_at: now,
        points_earned: points,
        on_time: true // Simplified for now
      })
      .eq('id', prayerId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark prayer complete",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Great job! 🎉",
        description: `${prayerName} prayer completed! +${points} points`,
      });
      onPrayerUpdate();
    }
    setLoading(null);
  };

  if (prayers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No prayers scheduled for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prayers.map((prayer) => (
        <Card key={prayer.id} className={`transition-all ${prayer.completed_at ? 'bg-islamic-green/10 border-islamic-green/30' : 'bg-muted/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {PRAYER_EMOJIS[prayer.prayer_name as keyof typeof PRAYER_EMOJIS]}
                </div>
                <div>
                  <h4 className="font-semibold capitalize">{prayer.prayer_name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {prayer.scheduled_time}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {prayer.completed_at ? (
                  <>
                    <Badge variant="secondary" className="bg-islamic-green/20 text-islamic-green">
                      +{prayer.points_earned} points
                    </Badge>
                    <CheckCircle className="w-6 h-6 text-islamic-green" />
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => markPrayerComplete(prayer.id, prayer.prayer_name)}
                    disabled={loading === prayer.id}
                    className="bg-islamic-green hover:bg-islamic-green/90"
                  >
                    {loading === prayer.id ? (
                      <Circle className="w-4 h-4 animate-spin" />
                    ) : (
                      'Complete'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrayerTracker;
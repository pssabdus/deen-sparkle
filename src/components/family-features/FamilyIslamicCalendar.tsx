import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Star } from 'lucide-react';

interface FamilyIslamicCalendarProps {
  familyId: string;
  userRole: 'parent' | 'child';
  userId: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  islamic_significance: string;
}

const FamilyIslamicCalendar = ({ familyId, userRole, userId }: FamilyIslamicCalendarProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [familyId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('family_islamic_calendar')
        .select('*')
        .eq('family_id', familyId)
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error in fetchEvents:', error);
    } finally {
      setLoading(false);
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
            <Calendar className="w-5 h-5 text-islamic-green" />
            Family Islamic Calendar
          </h3>
          <p className="text-sm text-muted-foreground">
            Track Islamic holidays, family events, and special occasions
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No events scheduled yet</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="border-l-4 border-l-islamic-green">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold">{event.title}</h5>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <p className="text-sm text-islamic-green mt-1">{event.islamic_significance}</p>
                  </div>
                  <Badge variant="outline">
                    {new Date(event.event_date).toLocaleDateString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FamilyIslamicCalendar;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  Compass, 
  MapPin, 
  CheckCircle2, 
  Circle, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon,
  Calendar,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PrayerTime {
  name: string;
  time: string;
  completed: boolean;
  onTime?: boolean;
  icon: React.ReactNode;
  isNext?: boolean;
  isPassed?: boolean;
}

interface PrayerData {
  prayerTimes: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    qibla: number;
  };
  islamicDate: {
    formatted: string;
  } | null;
  calculationMethod: {
    name: string;
  };
}

interface PrayerTimeDisplayProps {
  childId?: string;
  isParentView?: boolean;
}

const CALCULATION_METHODS = [
  { id: 1, name: "Umm al-Qura University (Makkah)" },
  { id: 2, name: "Islamic Society of North America" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Egyptian General Authority" },
  { id: 5, name: "University of Islamic Sciences, Karachi" },
  { id: 7, name: "Institute of Geophysics, Tehran" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 10, name: "Qatar" },
  { id: 11, name: "Singapore" },
  { id: 12, name: "France" },
  { id: 13, name: "Turkey" },
  { id: 14, name: "Russia" }
];

const PRAYER_NAMES = [
  { key: 'fajr', arabic: 'الفجر', transliteration: 'Fajr', meaning: 'Dawn' },
  { key: 'dhuhr', arabic: 'الظهر', transliteration: 'Dhuhr', meaning: 'Noon' },
  { key: 'asr', arabic: 'العصر', transliteration: 'Asr', meaning: 'Afternoon' },
  { key: 'maghrib', arabic: 'المغرب', transliteration: 'Maghrib', meaning: 'Sunset' },
  { key: 'isha', arabic: 'العشاء', transliteration: 'Isha', meaning: 'Night' }
];

const PrayerTimeDisplay: React.FC<PrayerTimeDisplayProps> = ({ childId, isParentView = false }) => {
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calculationMethod, setCalculationMethod] = useState(1);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prayerStatus, setPrayerStatus] = useState<Record<string, boolean>>({});

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get user location and fetch prayer times
  useEffect(() => {
    const getLocationAndPrayerTimes = async () => {
      try {
        // Get user location
        if (!location) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(coords);
        }

        // Fetch prayer times
        if (location) {
          const { data, error } = await supabase.functions.invoke('islamic-prayer-times', {
            body: {
              latitude: location.latitude,
              longitude: location.longitude,
              calculationMethod,
              date: new Date().toISOString().split('T')[0]
            }
          });

          if (error) throw error;

          if (data.success) {
            setPrayerData(data.data);
          } else {
            throw new Error(data.error);
          }
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        toast.error('Failed to load prayer times');
      } finally {
        setLoading(false);
      }
    };

    getLocationAndPrayerTimes();
  }, [location, calculationMethod]);

  // Load prayer status for child if provided
  useEffect(() => {
    const loadPrayerStatus = async () => {
      if (!childId) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('prayer_times')
          .select('prayer_name, completed_at')
          .eq('child_id', childId)
          .eq('prayer_date', today);

        if (error) throw error;

        const status: Record<string, boolean> = {};
        data.forEach(prayer => {
          status[prayer.prayer_name.toLowerCase()] = !!prayer.completed_at;
        });
        setPrayerStatus(status);
      } catch (error) {
        console.error('Error loading prayer status:', error);
      }
    };

    loadPrayerStatus();
  }, [childId]);

  const markPrayerComplete = async (prayerName: string) => {
    if (!childId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('prayer_times')
        .update({ completed_at: now })
        .eq('child_id', childId)
        .eq('prayer_name', prayerName)
        .eq('prayer_date', today);

      if (error) throw error;

      setPrayerStatus(prev => ({
        ...prev,
        [prayerName.toLowerCase()]: true
      }));

      toast.success(`${prayerName} prayer marked as completed! 🤲`);
    } catch (error) {
      console.error('Error marking prayer complete:', error);
      toast.error('Failed to update prayer status');
    }
  };

  const getCurrentPrayer = () => {
    if (!prayerData) return null;

    const now = currentTime;
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const prayers = [
      { name: 'Fajr', time: prayerData.prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerData.prayerTimes.dhuhr },
      { name: 'Asr', time: prayerData.prayerTimes.asr },
      { name: 'Maghrib', time: prayerData.prayerTimes.maghrib },
      { name: 'Isha', time: prayerData.prayerTimes.isha }
    ];

    for (let i = 0; i < prayers.length; i++) {
      if (currentTimeStr < prayers[i].time) {
        return prayers[i];
      }
    }

    // If after Isha, next is Fajr
    return prayers[0];
  };

  const formatTimeUntilNext = (nextPrayerTime: string) => {
    const now = currentTime;
    const [hours, minutes] = nextPrayerTime.split(':').map(Number);
    const nextPrayer = new Date(now);
    nextPrayer.setHours(hours, minutes, 0, 0);

    if (nextPrayer <= now) {
      nextPrayer.setDate(nextPrayer.getDate() + 1);
    }

    const diff = nextPrayer.getTime() - now.getTime();
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hoursUntil}h ${minutesUntil}m`;
  };

  const getPrayerIcon = (prayerName: string) => {
    switch (prayerName.toLowerCase()) {
      case 'fajr': return <Sunrise className="w-4 h-4" />;
      case 'dhuhr': return <Sun className="w-4 h-4" />;
      case 'asr': return <Sun className="w-4 h-4" />;
      case 'maghrib': return <Sunset className="w-4 h-4" />;
      case 'isha': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getQiblaCompass = () => {
    if (!prayerData) return null;

    return (
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-islamic-green/20">
          <div className="absolute inset-2 rounded-full border-2 border-islamic-green/40">
            <div 
              className="absolute top-0 left-1/2 w-1 h-6 bg-islamic-green transform -translate-x-1/2"
              style={{ transformOrigin: 'bottom', transform: `translateX(-50%) rotate(${prayerData.prayerTimes.qibla}deg)` }}
            />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-islamic-green rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">N</div>
        <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 text-xs font-medium">E</div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">S</div>
        <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 text-xs font-medium">W</div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="w-6 h-6 animate-spin mr-2" />
            Loading prayer times...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prayerData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Failed to load prayer times. Please check your location settings.
          </div>
        </CardContent>
      </Card>
    );
  }

  const nextPrayer = getCurrentPrayer();
  const completedPrayers = Object.values(prayerStatus).filter(Boolean).length;
  const totalPrayers = 5;
  const completionPercentage = (completedPrayers / totalPrayers) * 100;

  return (
    <div className="space-y-6">
      {/* Current Time and Islamic Date */}
      <Card className="bg-gradient-to-r from-islamic-green/10 to-islamic-blue/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </h3>
              <p className="text-muted-foreground">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              {prayerData.islamicDate && (
                <p className="text-sm text-islamic-green font-medium mt-1">
                  📅 {prayerData.islamicDate.formatted}
                </p>
              )}
            </div>
            <div className="text-right">
              {nextPrayer && (
                <div>
                  <Badge variant="outline" className="mb-2">
                    Next: {nextPrayer.name} in {formatTimeUntilNext(nextPrayer.time)}
                  </Badge>
                  <div className="text-lg font-semibold text-islamic-green">
                    {nextPrayer.time}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prayer Progress */}
      {childId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-islamic-green" />
              Today's Prayer Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Completed Prayers</span>
                  <span>{completedPrayers}/{totalPrayers}</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              {completionPercentage === 100 && (
                <div className="text-center p-4 bg-islamic-green/10 rounded-lg">
                  <p className="text-islamic-green font-medium">🎉 MashaAllah! All prayers completed today!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prayer Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Prayer Times
            </div>
            <Button variant="ghost" size="sm">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PRAYER_NAMES.map((prayer) => {
              const timeKey = prayer.key as keyof typeof prayerData.prayerTimes;
              const time = prayerData.prayerTimes[timeKey];
              const isCompleted = prayerStatus[prayer.key] || false;
              const isNext = nextPrayer?.name.toLowerCase() === prayer.key;
              
              return (
                <div 
                  key={prayer.key}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isNext ? 'bg-islamic-green/10 border border-islamic-green/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getPrayerIcon(prayer.key)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{prayer.transliteration}</span>
                        <span className="text-lg font-arabic">{prayer.arabic}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{prayer.meaning}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg">{time}</span>
                    
                    {childId && (
                      <Button
                        size="sm"
                        variant={isCompleted ? "default" : "outline"}
                        onClick={() => !isCompleted && markPrayerComplete(prayer.transliteration)}
                        disabled={isCompleted}
                        className={isCompleted ? "bg-islamic-green hover:bg-islamic-green/90" : ""}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Qibla Direction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5" />
            Qibla Direction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            {getQiblaCompass()}
            <div>
              <p className="text-lg font-semibold">{Math.round(prayerData.prayerTimes.qibla)}°</p>
              <p className="text-sm text-muted-foreground">from North towards the Kaaba</p>
              <p className="text-xs text-muted-foreground mt-2">
                🕋 Direction to the Sacred Mosque in Makkah
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Method Settings */}
      {isParentView && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Prayer Time Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Calculation Method</label>
                <Select value={calculationMethod.toString()} onValueChange={(value) => setCalculationMethod(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CALCULATION_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently using: {prayerData.calculationMethod.name}
                </p>
              </div>
              
              {location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrayerTimeDisplay;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  BookOpen, 
  Compass, 
  TrendingUp, 
  Bell, 
  Settings,
  Play,
  Calendar,
  Award
} from 'lucide-react';
import PrayerTimeDisplay from './PrayerTimeDisplay';
import PrayerGuidance from './PrayerGuidance';
import { useAuth } from '@/hooks/useAuth';

interface IslamicPrayerManagerProps {
  childId?: string;
  userProfile?: any;
}

const IslamicPrayerManager: React.FC<IslamicPrayerManagerProps> = ({ 
  childId, 
  userProfile 
}) => {
  const { user } = useAuth();
  const [selectedPrayer, setSelectedPrayer] = useState('fajr');
  const [showGuidance, setShowGuidance] = useState(false);

  const isParentView = userProfile?.role === 'parent';
  const isChildView = userProfile?.role === 'child' || !userProfile;

  const prayerOptions = [
    { value: 'fajr', label: 'Fajr', icon: '🌅', time: 'Dawn' },
    { value: 'dhuhr', label: 'Dhuhr', icon: '☀️', time: 'Noon' },
    { value: 'asr', label: 'Asr', icon: '🌤️', time: 'Afternoon' },
    { value: 'maghrib', label: 'Maghrib', icon: '🌅', time: 'Sunset' },
    { value: 'isha', label: 'Isha', icon: '🌙', time: 'Night' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green/5 via-white to-islamic-blue/5">
      <div className="container mx-auto p-4 space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-islamic-green to-islamic-blue text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Islamic Prayer Times</h1>
                <p className="text-islamic-green-light">
                  {isChildView ? "Your daily connection with Allah 🤲" : "Family Prayer Management"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-6xl">🕌</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="times" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="times" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Prayer Times
            </TabsTrigger>
            <TabsTrigger value="guidance" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Prayer Guide
            </TabsTrigger>
            <TabsTrigger value="qibla" className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Qibla Finder
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          {/* Prayer Times Tab */}
          <TabsContent value="times" className="space-y-6">
            <PrayerTimeDisplay 
              childId={childId} 
              isParentView={isParentView}
            />
            
            {isChildView && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Quick Prayer Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {prayerOptions.map((prayer) => (
                      <Button
                        key={prayer.value}
                        variant="outline"
                        className="h-20 flex flex-col items-center gap-2"
                        onClick={() => {
                          setSelectedPrayer(prayer.value);
                          setShowGuidance(true);
                        }}
                      >
                        <span className="text-2xl">{prayer.icon}</span>
                        <div className="text-center">
                          <div className="font-medium">{prayer.label}</div>
                          <div className="text-xs text-muted-foreground">{prayer.time}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Prayer Guidance Tab */}
          <TabsContent value="guidance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Prayer for Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {prayerOptions.map((prayer) => (
                    <Button
                      key={prayer.value}
                      variant={selectedPrayer === prayer.value ? "default" : "outline"}
                      className="h-16 flex flex-col items-center gap-1"
                      onClick={() => setSelectedPrayer(prayer.value)}
                    >
                      <span className="text-xl">{prayer.icon}</span>
                      <span className="text-sm">{prayer.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <PrayerGuidance 
              prayerName={selectedPrayer} 
              childAge={userProfile?.age || 8}
              islamicLevel={userProfile?.islamic_level || 1}
            />
          </TabsContent>

          {/* Qibla Finder Tab */}
          <TabsContent value="qibla" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  Qibla Direction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  <div className="relative w-48 h-48 mx-auto">
                    <div className="absolute inset-0 rounded-full border-8 border-islamic-green/20">
                      <div className="absolute inset-4 rounded-full border-4 border-islamic-green/40">
                        <div className="absolute inset-6 rounded-full border-2 border-islamic-green/60 flex items-center justify-center">
                          <div className="text-2xl">🕋</div>
                        </div>
                        <div className="absolute top-0 left-1/2 w-2 h-8 bg-islamic-green transform -translate-x-1/2" />
                      </div>
                    </div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold">N</div>
                    <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 font-bold">E</div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 font-bold">S</div>
                    <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 font-bold">W</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-islamic-green">245°</p>
                      <p className="text-muted-foreground">from North towards the Kaaba</p>
                    </div>
                    
                    <Card className="bg-islamic-green/5">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">🕋 Direction to the Sacred Mosque</h4>
                        <p className="text-sm text-muted-foreground">
                          Face this direction when praying. The green arrow points towards the Kaaba in Makkah, Saudi Arabia.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Button className="bg-islamic-green hover:bg-islamic-green/90">
                      <Compass className="w-4 h-4 mr-2" />
                      Use Device Compass
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6">
              
              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    This Week's Prayer Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="text-center">
                          <div className="text-sm font-medium mb-2">{day}</div>
                          <div className="space-y-1">
                            {prayerOptions.map((prayer) => (
                              <div
                                key={prayer.value}
                                className={`w-4 h-4 rounded mx-auto ${
                                  Math.random() > 0.3 ? 'bg-islamic-green' : 'bg-gray-200'
                                }`}
                                title={`${prayer.label} - ${day}`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <Card className="bg-green-50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">85%</div>
                          <div className="text-sm text-muted-foreground">This Week</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-blue-50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">23</div>
                          <div className="text-sm text-muted-foreground">Day Streak</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-purple-50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">92%</div>
                          <div className="text-sm text-muted-foreground">On Time</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Prayer Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-3xl mb-2">🏆</div>
                      <div className="font-medium">First Prayer</div>
                      <div className="text-sm text-muted-foreground">Completed first prayer</div>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl mb-2">🔥</div>
                      <div className="font-medium">Weekly Warrior</div>
                      <div className="text-sm text-muted-foreground">7 day prayer streak</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl mb-2">⭐</div>
                      <div className="font-medium">On Time</div>
                      <div className="text-sm text-muted-foreground">100 on-time prayers</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg opacity-50">
                      <div className="text-3xl mb-2">💎</div>
                      <div className="font-medium">Diamond</div>
                      <div className="text-sm text-muted-foreground">30 day streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prayer Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Prayer Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prayerOptions.map((prayer) => (
                      <div key={prayer.value} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{prayer.icon}</span>
                          <span className="font-medium">{prayer.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-islamic-green h-2 rounded-full"
                              style={{ width: `${Math.random() * 40 + 60}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {Math.floor(Math.random() * 40 + 60)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IslamicPrayerManager;
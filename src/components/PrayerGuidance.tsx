import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Book, 
  Play, 
  Pause, 
  RotateCcw, 
  Heart, 
  Star, 
  ArrowRight,
  ArrowLeft,
  Volume2,
  BookOpen
} from 'lucide-react';

interface PrayerStep {
  id: number;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  instructions: string;
  repetitions?: number;
}

interface PrayerGuidanceProps {
  prayerName: string;
  childAge?: number;
  islamicLevel?: number;
}

const PRAYER_STEPS: Record<string, PrayerStep[]> = {
  fajr: [
    {
      id: 1,
      title: "Standing (Qiyam)",
      arabic: "اللَّهُ أَكْبَرُ",
      transliteration: "Allahu Akbar",
      translation: "Allah is the Greatest",
      instructions: "Raise your hands to shoulder level and say the opening Takbir."
    },
    {
      id: 2,
      title: "Opening Supplication",
      arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ",
      transliteration: "Subhanakal-lahumma wa bihamdika wa tabarakas-muka wa ta'ala jadduka wa la ilaha ghairuk",
      translation: "Glory is to You, O Allah, and praise is to You. Blessed is Your Name and exalted is Your Majesty. There is no god but You.",
      instructions: "Place your right hand over your left hand on your chest and recite quietly."
    },
    {
      id: 3,
      title: "Al-Fatiha",
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ‎﴿١﴾‏ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      transliteration: "Bismillahir-Rahmanir-Rahim. Alhamdu lillahi rabbil-'alamin",
      translation: "In the name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, Lord of all the worlds.",
      instructions: "Recite the opening chapter of the Quran."
    },
    {
      id: 4,
      title: "Ruku (Bowing)",
      arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
      transliteration: "Subhana Rabbi al-Azeem",
      translation: "Glory is to my Lord, the Magnificent",
      instructions: "Bow down placing hands on knees, keep back straight.",
      repetitions: 3
    },
    {
      id: 5,
      title: "Standing from Ruku",
      arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ رَبَّنَا وَلَكَ الْحَمْدُ",
      transliteration: "Sami'a Allahu liman hamidah, Rabbana wa lakal hamd",
      translation: "Allah hears those who praise Him. Our Lord, praise is to You.",
      instructions: "Stand up straight from bowing position."
    },
    {
      id: 6,
      title: "Sujud (Prostration)",
      arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
      transliteration: "Subhana Rabbi al-A'la",
      translation: "Glory is to my Lord, the Most High",
      instructions: "Prostrate with forehead, nose, hands, knees, and toes touching the ground.",
      repetitions: 3
    }
  ]
};

const DUAS = {
  before_prayer: {
    arabic: "اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ",
    transliteration: "Allahumma ba'id baini wa baina khatayaya kama ba'adta bainal-mashriqi wal-maghrib",
    translation: "O Allah, distance me from my sins as You have distanced the East from the West."
  },
  after_prayer: {
    arabic: "أَسْتَغْفِرُ اللَّهَ أَسْتَغْفِرُ اللَّهَ أَسْتَغْفِرُ اللَّهَ اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration: "Astaghfirullah, Astaghfirullah, Astaghfirullah. Allahumma antas-salamu wa minkas-salamu tabarakta ya dhal-jalali wal-ikram",
    translation: "I seek Allah's forgiveness (3x). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of Majesty and Honor."
  }
};

const WUDU_STEPS = [
  {
    step: 1,
    title: "Intention (Niyyah)",
    instruction: "Make the intention in your heart to perform Wudu for the sake of Allah."
  },
  {
    step: 2,
    title: "Say Bismillah",
    instruction: "Begin by saying 'Bismillah' (In the name of Allah)."
  },
  {
    step: 3,
    title: "Wash Hands",
    instruction: "Wash both hands up to the wrists three times."
  },
  {
    step: 4,
    title: "Rinse Mouth",
    instruction: "Rinse your mouth three times, swirling water around."
  },
  {
    step: 5,
    title: "Cleanse Nose",
    instruction: "Sniff water into your nostrils and blow it out three times."
  },
  {
    step: 6,
    title: "Wash Face",
    instruction: "Wash your entire face three times from ear to ear and forehead to chin."
  },
  {
    step: 7,
    title: "Wash Arms",
    instruction: "Wash your arms up to the elbows three times, starting with the right arm."
  },
  {
    step: 8,
    title: "Wipe Head",
    instruction: "Wet your hands and wipe over your head once."
  },
  {
    step: 9,
    title: "Wipe Ears",
    instruction: "Wipe the inside and outside of both ears once."
  },
  {
    step: 10,
    title: "Wash Feet",
    instruction: "Wash both feet up to the ankles three times, starting with the right foot."
  }
];

const PrayerGuidance: React.FC<PrayerGuidanceProps> = ({ 
  prayerName, 
  childAge = 8, 
  islamicLevel = 1 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  const prayerSteps = PRAYER_STEPS[prayerName.toLowerCase()] || PRAYER_STEPS.fajr;

  const nextStep = () => {
    if (currentStep < prayerSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetGuide = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const getAgeAppropriateContent = (content: string) => {
    if (childAge < 10) {
      return content + " 🤲"; // Add emoji for younger children
    }
    return content;
  };

  return (
    <div className="space-y-6">
      {/* Prayer Preparation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Prayer Preparation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wudu" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wudu">Wudu (Ablution)</TabsTrigger>
              <TabsTrigger value="before">Before Prayer</TabsTrigger>
              <TabsTrigger value="mindset">Prayer Mindset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wudu" className="space-y-4">
              <div className="space-y-3">
                {WUDU_STEPS.map((step) => (
                  <div key={step.step} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Badge variant="outline" className="min-w-8 h-8 flex items-center justify-center">
                      {step.step}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {getAgeAppropriateContent(step.instruction)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="before" className="space-y-4">
              <Card className="bg-islamic-green/5">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Dua Before Prayer</h4>
                  <div className="space-y-2">
                    <p className="text-lg font-arabic">{DUAS.before_prayer.arabic}</p>
                    <p className="text-sm italic">{DUAS.before_prayer.transliteration}</p>
                    {showTranslation && (
                      <p className="text-sm text-muted-foreground">{DUAS.before_prayer.translation}</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="mt-2"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {showTranslation ? 'Hide' : 'Show'} Translation
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mindset" className="space-y-4">
              <div className="grid gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">🧘‍♀️ Focus Your Mind</h4>
                    <p className="text-sm">
                      Prayer is a conversation with Allah. Clear your mind of distractions and focus on the meaning of what you're saying.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">❤️ Open Your Heart</h4>
                    <p className="text-sm">
                      Remember that Allah loves you and is always listening. Feel grateful for all the blessings in your life.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">🎯 Make It Personal</h4>
                    <p className="text-sm">
                      Think about what you want to ask Allah for, what you're thankful for, and how you can be a better Muslim.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Prayer Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              {prayerName} Prayer Guide
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Step {currentStep + 1} of {prayerSteps.length}</Badge>
              <Button variant="ghost" size="sm" onClick={resetGuide}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Step */}
            <Card className="bg-gradient-to-r from-islamic-green/10 to-islamic-blue/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-islamic-green text-white rounded-full flex items-center justify-center font-bold">
                      {prayerSteps[currentStep].id}
                    </div>
                    <h3 className="text-xl font-semibold">{prayerSteps[currentStep].title}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-arabic mb-2">{prayerSteps[currentStep].arabic}</p>
                      <p className="text-lg italic text-islamic-green mb-2">{prayerSteps[currentStep].transliteration}</p>
                      {showTranslation && (
                        <p className="text-muted-foreground">{prayerSteps[currentStep].translation}</p>
                      )}
                    </div>
                    
                    <div className="bg-white/50 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>Instructions:</strong> {getAgeAppropriateContent(prayerSteps[currentStep].instructions)}
                      </p>
                      {prayerSteps[currentStep].repetitions && (
                        <p className="text-sm text-islamic-green mt-2">
                          <strong>Repeat:</strong> {prayerSteps[currentStep].repetitions} times
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranslation(!showTranslation)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {showTranslation ? 'Hide' : 'Show'} Translations
                </Button>
                
                <Button variant="ghost" size="sm">
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                onClick={nextStep} 
                disabled={currentStep === prayerSteps.length - 1}
                className="flex items-center gap-2 bg-islamic-green hover:bg-islamic-green/90"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-islamic-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / prayerSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* After Prayer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            After Prayer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Card className="bg-yellow-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Dhikr (Remembrance of Allah)</h4>
                <div className="space-y-2">
                  <p className="text-lg font-arabic">{DUAS.after_prayer.arabic}</p>
                  <p className="text-sm italic">{DUAS.after_prayer.transliteration}</p>
                  {showTranslation && (
                    <p className="text-sm text-muted-foreground">{DUAS.after_prayer.translation}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">سُبْحَانَ اللَّهِ</div>
                  <div className="text-sm">Subhan Allah</div>
                  <div className="text-xs text-muted-foreground">33 times</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">الْحَمْدُ لِلَّهِ</div>
                  <div className="text-sm">Alhamdulillah</div>
                  <div className="text-xs text-muted-foreground">33 times</div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">اللَّهُ أَكْبَرُ</div>
                  <div className="text-sm">Allahu Akbar</div>
                  <div className="text-xs text-muted-foreground">34 times</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrayerGuidance;
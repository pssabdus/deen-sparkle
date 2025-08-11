import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Clock, User, Target, Gift, Star, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChildInfo {
  name: string;
  dateOfBirth: string;
  gender: string;
  islamicLevel: number;
  interests: string[];
  personalityType: string;
}

interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  location: {
    city: string;
    latitude: number;
    longitude: number;
  };
}

interface SetupData {
  childInfo: ChildInfo;
  location: { latitude: number; longitude: number } | null;
  prayerTimes: PrayerTimes | null;
  goals: any[];
  rewards: any[];
  schedule: any[];
}

const WIZARD_STEPS = [
  { id: 'child-info', title: 'Child Information', description: 'Basic details about your child' },
  { id: 'location', title: 'Prayer Times Setup', description: 'Location for accurate prayer times' },
  { id: 'personality', title: 'Personality Quiz', description: 'Choose the perfect Islamic companion' },
  { id: 'goals', title: 'Learning Goals', description: 'Age-appropriate milestones' },
  { id: 'rewards', title: 'Family Rewards', description: 'Customize reward preferences' },
  { id: 'schedule', title: 'Learning Schedule', description: 'Weekly routine recommendations' },
  { id: 'preview', title: 'Preview & Confirm', description: 'Review your setup' }
];

const INTERESTS_OPTIONS = [
  'Quran Recitation', 'Islamic Stories', 'Prophet Stories', 'Prayer', 'Arabic Language',
  'Islamic History', 'Good Deeds', 'Islamic Art', 'Nasheeds', 'Islamic Science'
];

const PERSONALITY_QUESTIONS = [
  {
    question: "How does your child prefer to learn?",
    options: [
      { value: 'visual', label: 'Through pictures and visual aids', companion: 'angel' },
      { value: 'interactive', label: 'Through games and activities', companion: 'pet' },
      { value: 'storytelling', label: 'Through stories and narratives', companion: 'wizard' }
    ]
  },
  {
    question: "What motivates your child most?",
    options: [
      { value: 'praise', label: 'Words of encouragement and praise', companion: 'angel' },
      { value: 'fun', label: 'Fun activities and rewards', companion: 'pet' },
      { value: 'achievement', label: 'Completing challenges and goals', companion: 'wizard' }
    ]
  },
  {
    question: "How does your child handle new concepts?",
    options: [
      { value: 'gentle', label: 'Needs gentle, patient introduction', companion: 'angel' },
      { value: 'enthusiastic', label: 'Jumps in with enthusiasm', companion: 'pet' },
      { value: 'analytical', label: 'Likes to understand deeply first', companion: 'wizard' }
    ]
  }
];

const ParentSetupWizard: React.FC<{ familyId: string; onComplete: () => void }> = ({ familyId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<SetupData>({
    childInfo: {
      name: '',
      dateOfBirth: '',
      gender: '',
      islamicLevel: 1,
      interests: [],
      personalityType: ''
    },
    location: null,
    prayerTimes: null,
    goals: [],
    rewards: [],
    schedule: []
  });
  const [personalityAnswers, setPersonalityAnswers] = useState<string[]>([]);
  const { toast } = useToast();

  const progressPercentage = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  // Step 1: Child Information
  const renderChildInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="childName">Child's Name</Label>
          <Input
            id="childName"
            value={setupData.childInfo.name}
            onChange={(e) => setSetupData(prev => ({
              ...prev,
              childInfo: { ...prev.childInfo, name: e.target.value }
            }))}
            placeholder="Enter child's name"
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={setupData.childInfo.dateOfBirth}
            onChange={(e) => setSetupData(prev => ({
              ...prev,
              childInfo: { ...prev.childInfo, dateOfBirth: e.target.value }
            }))}
          />
        </div>
      </div>

      <div>
        <Label>Gender</Label>
        <RadioGroup
          value={setupData.childInfo.gender}
          onValueChange={(value) => setSetupData(prev => ({
            ...prev,
            childInfo: { ...prev.childInfo, gender: value }
          }))}
          className="flex gap-6 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>Islamic Knowledge Level</Label>
        <Select
          value={setupData.childInfo.islamicLevel.toString()}
          onValueChange={(value) => setSetupData(prev => ({
            ...prev,
            childInfo: { ...prev.childInfo, islamicLevel: parseInt(value) }
          }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Beginner - Just starting</SelectItem>
            <SelectItem value="2">Basic - Knows simple prayers</SelectItem>
            <SelectItem value="3">Intermediate - Regular prayer practice</SelectItem>
            <SelectItem value="4">Advanced - Strong Islamic foundation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Interests (Select multiple)</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {INTERESTS_OPTIONS.map((interest) => (
            <div key={interest} className="flex items-center space-x-2">
              <Checkbox
                id={interest}
                checked={setupData.childInfo.interests.includes(interest)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSetupData(prev => ({
                      ...prev,
                      childInfo: {
                        ...prev.childInfo,
                        interests: [...prev.childInfo.interests, interest]
                      }
                    }));
                  } else {
                    setSetupData(prev => ({
                      ...prev,
                      childInfo: {
                        ...prev.childInfo,
                        interests: prev.childInfo.interests.filter(i => i !== interest)
                      }
                    }));
                  }
                }}
              />
              <Label htmlFor={interest} className="text-sm">{interest}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2: Location & Prayer Times
  const getLocation = async () => {
    setLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setSetupData(prev => ({
        ...prev,
        location: { latitude, longitude }
      }));

      // Fetch prayer times
      const { data, error } = await supabase.functions.invoke('prayer-times-api', {
        body: { latitude, longitude }
      });

      if (error) throw error;

      if (data.success) {
        setSetupData(prev => ({
          ...prev,
          prayerTimes: data.prayerTimes
        }));
        toast({
          title: "Success!",
          description: "Prayer times configured successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Error",
        description: "Failed to get location and prayer times",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLocationStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-24 h-24 bg-islamic-green/10 rounded-full flex items-center justify-center">
        <MapPin className="w-12 h-12 text-islamic-green" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Set Up Prayer Times</h3>
        <p className="text-muted-foreground">
          We'll use your location to provide accurate prayer times for your family
        </p>
      </div>

      {!setupData.location ? (
        <Button onClick={getLocation} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Get My Location
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            Location detected successfully!
          </div>
          
          {setupData.prayerTimes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Today's Prayer Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>Fajr: {setupData.prayerTimes.fajr}</div>
                  <div>Dhuhr: {setupData.prayerTimes.dhuhr}</div>
                  <div>Asr: {setupData.prayerTimes.asr}</div>
                  <div>Maghrib: {setupData.prayerTimes.maghrib}</div>
                  <div>Isha: {setupData.prayerTimes.isha}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  // Step 3: Personality Quiz
  const renderPersonalityStep = () => {
    const determineCompanion = () => {
      const companionCounts = { angel: 0, pet: 0, wizard: 0 };
      
      personalityAnswers.forEach((answer, index) => {
        const selectedOption = PERSONALITY_QUESTIONS[index].options.find(opt => opt.value === answer);
        if (selectedOption) {
          companionCounts[selectedOption.companion as keyof typeof companionCounts]++;
        }
      });

      const companion = Object.entries(companionCounts).reduce((a, b) => 
        companionCounts[a[0] as keyof typeof companionCounts] > companionCounts[b[0] as keyof typeof companionCounts] ? a : b
      )[0];

      setSetupData(prev => ({
        ...prev,
        childInfo: { ...prev.childInfo, personalityType: companion }
      }));
    };

    useEffect(() => {
      if (personalityAnswers.length === PERSONALITY_QUESTIONS.length) {
        determineCompanion();
      }
    }, [personalityAnswers]);

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Choose the Perfect Companion</h3>
          <p className="text-muted-foreground">
            Answer these questions to find the best Islamic companion for your child
          </p>
        </div>

        {PERSONALITY_QUESTIONS.map((question, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{question.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={personalityAnswers[index] || ''}
                onValueChange={(value) => {
                  const newAnswers = [...personalityAnswers];
                  newAnswers[index] = value;
                  setPersonalityAnswers(newAnswers);
                }}
              >
                {question.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${index}-${option.value}`} />
                    <Label htmlFor={`${index}-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        {setupData.childInfo.personalityType && (
          <Card className="bg-gradient-to-r from-islamic-green/10 to-islamic-blue/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {setupData.childInfo.personalityType === 'angel' && '😇'}
                  {setupData.childInfo.personalityType === 'pet' && '🐱'}
                  {setupData.childInfo.personalityType === 'wizard' && '🧙‍♂️'}
                </div>
                <h4 className="font-semibold text-lg">
                  Perfect! Your child's companion will be a{' '}
                  {setupData.childInfo.personalityType === 'angel' && 'Guardian Angel'}
                  {setupData.childInfo.personalityType === 'pet' && 'Friendly Pet'}
                  {setupData.childInfo.personalityType === 'wizard' && 'Wise Wizard'}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {setupData.childInfo.personalityType === 'angel' && 'A gentle, encouraging companion perfect for patient learners'}
                  {setupData.childInfo.personalityType === 'pet' && 'A playful, energetic companion that makes learning fun'}
                  {setupData.childInfo.personalityType === 'wizard' && 'A wise, knowledgeable companion for curious minds'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Navigation functions
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return setupData.childInfo.name && setupData.childInfo.dateOfBirth && setupData.childInfo.gender;
      case 1:
        return setupData.location && setupData.prayerTimes;
      case 2:
        return personalityAnswers.length === PERSONALITY_QUESTIONS.length;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeSetup = async () => {
    setLoading(true);
    try {
      // Create child record
      const childData = {
        family_id: familyId,
        name: setupData.childInfo.name,
        date_of_birth: setupData.childInfo.dateOfBirth,
        gender: setupData.childInfo.gender,
        islamic_level: setupData.childInfo.islamicLevel,
        companion_type: setupData.childInfo.personalityType,
        companion_name: setupData.childInfo.personalityType === 'angel' ? 'Guardian' :
                       setupData.childInfo.personalityType === 'pet' ? 'Buddy' : 'Scholar',
        preferences: {
          interests: setupData.childInfo.interests,
          personality_answers: personalityAnswers
        }
      };

      const { data: childRecord, error: childError } = await supabase
        .from('children')
        .insert(childData)
        .select()
        .single();

      if (childError) throw childError;

      // Set up prayer times if available
      if (setupData.prayerTimes && childRecord) {
        const today = new Date().toISOString().split('T')[0];
        const prayerTimeEntries = [
          { child_id: childRecord.id, prayer_name: 'Fajr', scheduled_time: setupData.prayerTimes.fajr, prayer_date: today },
          { child_id: childRecord.id, prayer_name: 'Dhuhr', scheduled_time: setupData.prayerTimes.dhuhr, prayer_date: today },
          { child_id: childRecord.id, prayer_name: 'Asr', scheduled_time: setupData.prayerTimes.asr, prayer_date: today },
          { child_id: childRecord.id, prayer_name: 'Maghrib', scheduled_time: setupData.prayerTimes.maghrib, prayer_date: today },
          { child_id: childRecord.id, prayer_name: 'Isha', scheduled_time: setupData.prayerTimes.isha, prayer_date: today }
        ];

        const { error: prayerError } = await supabase
          .from('prayer_times')
          .insert(prayerTimeEntries);

        if (prayerError) {
          console.error('Error setting up prayer times:', prayerError);
        }
      }

      toast({
        title: "Setup Complete!",
        description: "Your child's profile has been created successfully",
      });

      onComplete();
    } catch (error) {
      console.error('Error completing setup:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-islamic-cream p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Qodwaa Family Setup! 🌙
          </h1>
          <p className="text-muted-foreground">
            Let's create the perfect Islamic learning experience for your child
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="mt-2 text-center">
            <h2 className="text-xl font-semibold">{WIZARD_STEPS[currentStep].title}</h2>
            <p className="text-sm text-muted-foreground">{WIZARD_STEPS[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {currentStep === 0 && renderChildInfoStep()}
            {currentStep === 1 && renderLocationStep()}
            {currentStep === 2 && renderPersonalityStep()}
            {currentStep === 3 && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-islamic-green mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Learning Goals (Coming in next steps)</h3>
                <p className="text-muted-foreground">Age-appropriate Islamic learning milestones</p>
              </div>
            )}
            {currentStep === 4 && (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-islamic-gold mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Family Rewards (Coming in next steps)</h3>
                <p className="text-muted-foreground">Customize your family's reward system</p>
              </div>
            )}
            {currentStep === 5 && (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-islamic-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Learning Schedule (Coming in next steps)</h3>
                <p className="text-muted-foreground">Weekly routine recommendations</p>
              </div>
            )}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
                  <p className="text-muted-foreground">
                    Review your configuration and click Complete to finish setup
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Child Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Name:</strong> {setupData.childInfo.name}</div>
                      <div><strong>Age:</strong> {new Date().getFullYear() - new Date(setupData.childInfo.dateOfBirth).getFullYear()} years</div>
                      <div><strong>Gender:</strong> {setupData.childInfo.gender}</div>
                      <div><strong>Islamic Level:</strong> Level {setupData.childInfo.islamicLevel}</div>
                      <div><strong>Companion:</strong> {setupData.childInfo.personalityType}</div>
                    </CardContent>
                  </Card>

                  {setupData.prayerTimes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Prayer Times
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        <div>Fajr: {setupData.prayerTimes.fajr}</div>
                        <div>Dhuhr: {setupData.prayerTimes.dhuhr}</div>
                        <div>Asr: {setupData.prayerTimes.asr}</div>
                        <div>Maghrib: {setupData.prayerTimes.maghrib}</div>
                        <div>Isha: {setupData.prayerTimes.isha}</div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Selected Interests:</h4>
                  <div className="flex flex-wrap gap-2">
                    {setupData.childInfo.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === WIZARD_STEPS.length - 1 ? (
            <Button onClick={completeSetup} disabled={loading} className="bg-islamic-green hover:bg-islamic-green/90">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-islamic-green hover:bg-islamic-green/90"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentSetupWizard;
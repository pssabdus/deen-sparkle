import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Clock, User, Target, Gift, Star, ArrowLeft, ArrowRight, CheckCircle, Calendar, Award, Book } from 'lucide-react';
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

interface LearningGoal {
  type: string;
  title: string;
  target: number;
  deadline: string;
  priority: string;
}

interface SetupData {
  childInfo: ChildInfo;
  enabledActivities: string[];
  personalityType: string;
  learningGoals: LearningGoal[];
  preferences: {
    language: string;
    parentalControls: string[];
  };
}

const WIZARD_STEPS = [
  { id: 'child-info', title: 'Child Information', description: 'Basic details about your child' },
  { id: 'activities', title: 'Islamic Activities', description: 'Choose what activities to enable' },
  { id: 'personality', title: 'Personality Quiz', description: 'Choose the perfect Islamic companion' },
  { id: 'goals', title: 'Learning Goals', description: 'Set Islamic learning objectives' },
  { id: 'preferences', title: 'Family Preferences', description: 'Customize the experience' },
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
      { value: 'visual', label: 'Through pictures and visual aids', companion: 'wise_owl' },
      { value: 'interactive', label: 'Through games and activities', companion: 'friendly_cat' },
      { value: 'storytelling', label: 'Through stories and narratives', companion: 'peaceful_dove' },
      { value: 'creative', label: 'Through creative expression', companion: 'playful_dolphin' }
    ]
  },
  {
    question: "What motivates your child most?",
    options: [
      { value: 'praise', label: 'Words of encouragement and praise', companion: 'wise_owl' },
      { value: 'fun', label: 'Fun activities and rewards', companion: 'friendly_cat' },
      { value: 'achievement', label: 'Completing challenges and goals', companion: 'peaceful_dove' },
      { value: 'exploration', label: 'Discovering new things', companion: 'playful_dolphin' }
    ]
  },
  {
    question: "How does your child handle new concepts?",
    options: [
      { value: 'analytical', label: 'Likes to understand deeply first', companion: 'wise_owl' },
      { value: 'enthusiastic', label: 'Jumps in with enthusiasm', companion: 'friendly_cat' },
      { value: 'gentle', label: 'Needs gentle, patient introduction', companion: 'peaceful_dove' },
      { value: 'curious', label: 'Explores through curiosity', companion: 'playful_dolphin' }
    ]
  }
];

const GOAL_TYPES = [
  { value: 'quran', label: 'Quran Memorization', icon: '📖', description: 'Memorize verses or surahs' },
  { value: 'prayer', label: 'Prayer Consistency', icon: '🤲', description: 'Regular prayer practice' },
  { value: 'arabic', label: 'Arabic Learning', icon: '✨', description: 'Learn Arabic letters and words' },
  { value: 'hadith', label: 'Hadith Learning', icon: '💫', description: 'Learn prophetic sayings' },
  { value: 'good_deeds', label: 'Good Deeds', icon: '❤️', description: 'Daily acts of kindness' },
  { value: 'dua', label: 'Dua Memorization', icon: '🌟', description: 'Learn daily supplications' }
];

const PARENTAL_CONTROLS = [
  'Content filtering',
  'Time limits',
  'Progress notifications',
  'Weekly reports',
  'Companion behavior monitoring'
];

const ParentSetupWizard: React.FC<{ familyId: string; onComplete: () => void }> = ({ familyId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [personalityTypes, setPersonalityTypes] = useState<any[]>([]);
  const [calculationMethods, setCalculationMethods] = useState<any[]>([]);
  const [setupData, setSetupData] = useState<SetupData>({
    childInfo: {
      name: '',
      dateOfBirth: '',
      gender: '',
      islamicLevel: 1,
      interests: [],
      personalityType: ''
    },
    enabledActivities: [],
    personalityType: '',
    learningGoals: [],
    preferences: {
      language: 'en',
      parentalControls: []
    }
  });
  const [personalityAnswers, setPersonalityAnswers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personalityTypesRes, calculationMethodsRes] = await Promise.all([
          supabase.from('islamic_personality_types').select('*'),
          supabase.from('prayer_calculation_methods').select('*')
        ]);

        if (personalityTypesRes.data) setPersonalityTypes(personalityTypesRes.data);
        if (calculationMethodsRes.data) setCalculationMethods(calculationMethodsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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

  // Step 2: Activities Selection
  const renderActivitiesStep = () => {
    const activities = [
      { id: 'prayers', name: 'Daily Prayers', description: 'Track 5 daily prayers', icon: '🤲' },
      { id: 'stories', name: 'Islamic Stories', description: 'Read and listen to stories', icon: '📚' },
      { id: 'quran', name: 'Quran Learning', description: 'Memorize verses and surahs', icon: '📖' },
      { id: 'good_deeds', name: 'Good Deeds', description: 'Track daily acts of kindness', icon: '❤️' },
      { id: 'dua', name: 'Dua Learning', description: 'Learn daily supplications', icon: '🤲' },
      { id: 'games', name: 'Learning Games', description: 'Interactive Islamic games', icon: '🎮' }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Choose Activities</h3>
          <p className="text-muted-foreground">
            Select which Islamic activities you want to enable for your child
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((activity) => (
            <Card 
              key={activity.id}
              className={`cursor-pointer transition-all ${
                setupData.enabledActivities.includes(activity.id) 
                  ? 'border-islamic-green bg-islamic-green/10' 
                  : 'hover:border-islamic-gold'
              }`}
              onClick={() => {
                const isEnabled = setupData.enabledActivities.includes(activity.id);
                setSetupData(prev => ({
                  ...prev,
                  enabledActivities: isEnabled
                    ? prev.enabledActivities.filter(id => id !== activity.id)
                    : [...prev.enabledActivities, activity.id]
                }));
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{activity.name}</h4>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                    {setupData.enabledActivities.includes(activity.id) && (
                      <div className="w-3 h-3 rounded-full bg-islamic-green"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {setupData.enabledActivities.length > 0 && (
          <Card className="bg-islamic-green/10">
            <CardContent className="p-4">
              <p className="text-sm text-islamic-green">
                ✓ {setupData.enabledActivities.length} activities selected. 
                You can always change these later in the parent dashboard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Step 3: Personality Quiz
  const renderPersonalityStep = () => {
    const determineCompanion = () => {
      const companionCounts = { wise_owl: 0, friendly_cat: 0, peaceful_dove: 0, playful_dolphin: 0 };
      
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
        personalityType: companion,
        childInfo: { ...prev.childInfo, personalityType: companion }
      }));
    };

    useEffect(() => {
      if (personalityAnswers.length === PERSONALITY_QUESTIONS.length) {
        determineCompanion();
      }
    }, [personalityAnswers]);

    const getCompanionInfo = (type: string) => {
      switch (type) {
        case 'wise_owl':
          return { emoji: '🦉', name: 'Wise Owl', description: 'A thoughtful, analytical companion perfect for deep learners' };
        case 'friendly_cat':
          return { emoji: '🐱', name: 'Friendly Cat', description: 'A playful, energetic companion that makes learning fun' };
        case 'peaceful_dove':
          return { emoji: '🕊️', name: 'Peaceful Dove', description: 'A gentle, calming companion for patient learners' };
        case 'playful_dolphin':
          return { emoji: '🐬', name: 'Playful Dolphin', description: 'A creative, curious companion for explorers' };
        default:
          return { emoji: '✨', name: 'Guardian', description: 'A special companion' };
      }
    };

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

        {setupData.personalityType && (
          <Card className="bg-gradient-to-r from-islamic-green/10 to-islamic-blue/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {getCompanionInfo(setupData.personalityType).emoji}
                </div>
                <h4 className="font-semibold text-lg">
                  Perfect! Your child's companion will be {getCompanionInfo(setupData.personalityType).name}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {getCompanionInfo(setupData.personalityType).description}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Step 4: Learning Goals
  const renderGoalsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Set Learning Goals</h3>
        <p className="text-muted-foreground">
          Choose age-appropriate Islamic learning objectives for your child
        </p>
      </div>

      <div className="grid gap-4">
        {GOAL_TYPES.map((goalType) => (
          <Card 
            key={goalType.value} 
            className={`cursor-pointer transition-all ${
              setupData.learningGoals.some(g => g.type === goalType.value) 
                ? 'ring-2 ring-islamic-green bg-islamic-green/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => {
              const hasGoal = setupData.learningGoals.some(g => g.type === goalType.value);
              if (hasGoal) {
                setSetupData(prev => ({
                  ...prev,
                  learningGoals: prev.learningGoals.filter(g => g.type !== goalType.value)
                }));
              } else {
                setSetupData(prev => ({
                  ...prev,
                  learningGoals: [...prev.learningGoals, {
                    type: goalType.value,
                    title: goalType.label,
                    target: goalType.value === 'prayer' ? 5 : goalType.value === 'quran' ? 3 : 7,
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    priority: 'medium'
                  }]
                }));
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{goalType.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium">{goalType.label}</h4>
                  <p className="text-sm text-muted-foreground">{goalType.description}</p>
                </div>
                {setupData.learningGoals.some(g => g.type === goalType.value) && (
                  <CheckCircle className="w-5 h-5 text-islamic-green" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {setupData.learningGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Selected Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {setupData.learningGoals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium">{goal.title}</span>
                  <Badge variant="secondary">Target: {goal.target}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Step 5: Weekly Schedule
  const renderScheduleStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Weekly Schedule</h3>
        <p className="text-muted-foreground">
          Set up a routine for your child's Islamic learning activities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recommended Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="p-2 bg-muted rounded">{day}</div>
              ))}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Prayer Practice (5 times daily)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Quran Study (15 minutes daily)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Islamic Stories (Bedtime)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Good Deeds Challenge (Weekends)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 6: Family Preferences
  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Family Preferences</h3>
        <p className="text-muted-foreground">
          Customize the experience for your family's needs
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label>Preferred Language</Label>
          <Select
            value={setupData.preferences.language}
            onValueChange={(value) => setSetupData(prev => ({
              ...prev,
              preferences: { ...prev.preferences, language: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="ur">Urdu</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div>


        <div>
          <Label>Parental Controls (Select multiple)</Label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {PARENTAL_CONTROLS.map((control) => (
              <div key={control} className="flex items-center space-x-2">
                <Checkbox
                  id={control}
                  checked={setupData.preferences.parentalControls.includes(control)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSetupData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          parentalControls: [...prev.preferences.parentalControls, control]
                        }
                      }));
                    } else {
                      setSetupData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          parentalControls: prev.preferences.parentalControls.filter(c => c !== control)
                        }
                      }));
                    }
                  }}
                />
                <Label htmlFor={control} className="text-sm">{control}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 7: Preview & Confirm
  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Review Your Setup</h3>
        <p className="text-muted-foreground">
          Please review all the information before completing the setup
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Child Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> {setupData.childInfo.name}</div>
              <div><strong>Gender:</strong> {setupData.childInfo.gender}</div>
              <div><strong>Islamic Level:</strong> Level {setupData.childInfo.islamicLevel}</div>
              <div><strong>Companion:</strong> {setupData.personalityType}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {setupData.learningGoals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{goal.title}</span>
                  <Badge variant="outline">Target: {goal.target}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-islamic-green/10 p-4 rounded-lg text-center">
        <h4 className="font-semibold text-islamic-green mb-2">🎉 Everything looks great!</h4>
        <p className="text-sm text-muted-foreground">
          Your child's Islamic learning journey is ready to begin. Click complete to finish the setup.
        </p>
      </div>
    </div>
  );

  // Navigation functions
  const canProceed = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'child-info':
        return setupData.childInfo.name && setupData.childInfo.dateOfBirth && setupData.childInfo.gender;
      case 'activities':
        return setupData.enabledActivities.length > 0;
      case 'personality':
        return personalityAnswers.length === PERSONALITY_QUESTIONS.length;
      case 'goals':
        return setupData.learningGoals.length > 0;
      case 'preferences':
        return true; // Optional step
      case 'preview':
        return true;
      default:
        return false;
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
        companion_type: setupData.personalityType,
        companion_name: setupData.personalityType === 'wise_owl' ? 'Scholar' :
                       setupData.personalityType === 'friendly_cat' ? 'Buddy' :
                       setupData.personalityType === 'peaceful_dove' ? 'Guardian' : 'Explorer',
        islamic_profile: {
          personality_type: setupData.personalityType,
          interests: setupData.childInfo.interests,
          personality_answers: personalityAnswers
        },
        learning_schedule: {},
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

      // Create learning goals
      if (setupData.learningGoals.length > 0 && childRecord) {
        const goalsData = setupData.learningGoals.map(goal => ({
          child_id: childRecord.id,
          goal_type: goal.type,
          title: goal.title,
          target_value: goal.target,
          deadline: goal.deadline,
          priority: goal.priority,
          created_by: familyId
        }));

        const { error: goalsError } = await supabase
          .from('islamic_learning_goals')
          .insert(goalsData);

        if (goalsError) throw goalsError;
      }

      // Create family Islamic preferences
      const preferencesData = {
        family_id: familyId,
        preferred_language: setupData.preferences.language,
        learning_preferences: {
          parental_controls: setupData.preferences.parentalControls,
          enabled_activities: setupData.enabledActivities
        }
      };

      const { error: preferencesError } = await supabase
        .from('family_islamic_preferences')
        .insert(preferencesData);

      if (preferencesError) throw preferencesError;

      // Set up daily prayers if prayers activity is enabled
      if (setupData.enabledActivities.includes('prayers') && childRecord) {
        const today = new Date().toISOString().split('T')[0];
        const prayerTimeEntries = [
          { child_id: childRecord.id, prayer_name: 'Fajr', prayer_date: today },
          { child_id: childRecord.id, prayer_name: 'Dhuhr', prayer_date: today },
          { child_id: childRecord.id, prayer_name: 'Asr', prayer_date: today },
          { child_id: childRecord.id, prayer_name: 'Maghrib', prayer_date: today },
          { child_id: childRecord.id, prayer_name: 'Isha', prayer_date: today }
        ];

        const { error: prayerError } = await supabase
          .from('prayer_times')
          .insert(prayerTimeEntries);

        if (prayerError) throw prayerError;
      }

      toast({
        title: "Setup Complete! 🎉",
        description: "Your child's Islamic learning journey has been set up successfully.",
      });

      onComplete();
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: "Setup Failed",
        description: "There was an error completing the setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'child-info':
        return renderChildInfoStep();
      case 'activities':
        return renderActivitiesStep();
      case 'personality':
        return renderPersonalityStep();
      case 'goals':
        return renderGoalsStep();
      case 'preferences':
        return renderPreferencesStep();
      case 'preview':
        return renderPreviewStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green/10 via-white to-islamic-blue/10 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-islamic-green to-islamic-blue text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Islamic Family Setup</CardTitle>
                <p className="text-islamic-green-light mt-1">
                  {WIZARD_STEPS[currentStep].title} - {WIZARD_STEPS[currentStep].description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Step {currentStep + 1} of {WIZARD_STEPS.length}</div>
                <Progress value={progressPercentage} className="w-32 mt-1" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>

          <div className="flex justify-between items-center p-6 bg-muted/30 rounded-b-lg">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {WIZARD_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-islamic-green' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {currentStep === WIZARD_STEPS.length - 1 ? (
              <Button
                onClick={completeSetup}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2 bg-islamic-green hover:bg-islamic-green/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ParentSetupWizard;
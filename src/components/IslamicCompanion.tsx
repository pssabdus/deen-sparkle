import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Star, Sparkles } from 'lucide-react';

interface CompanionData {
  type: 'angel' | 'pet' | 'wizard';
  name: string;
  personality: string;
  level: number;
  happiness: number;
  energy: number;
}

interface IslamicCompanionProps {
  companion: CompanionData;
  childName: string;
  recentActivity?: string;
  points: number;
  streak: number;
  onInteract?: () => void;
}

const COMPANION_EMOJIS = {
  angel: '👼',
  pet: '🐱',
  wizard: '🧙‍♂️'
};

const COMPANION_ANIMATIONS = {
  idle: 'animate-pulse',
  happy: 'animate-bounce',
  celebrating: 'animate-spin',
  sleeping: 'animate-pulse opacity-70'
};

const DIALOGUE_SETS = {
  angel: {
    greeting: [
      "Assalamu alaikum, {name}! Ready for another blessed day?",
      "Peace be upon you, dear {name}! I'm here to guide you today.",
      "May Allah's blessings be with you, {name}!"
    ],
    encouragement: [
      "You're doing wonderfully with your prayers, {name}!",
      "I'm so proud of your dedication to learning!",
      "Keep up the amazing work! Allah loves those who persist.",
      "Your good deeds make my heart shine bright!"
    ],
    celebration: [
      "Allahu Akbar! You've earned another blessing!",
      "Mashallah! Your efforts are truly inspiring!",
      "What a wonderful achievement! Keep growing in faith!",
      "Your light shines brighter with each good deed!"
    ],
    reminder: [
      "It's time for prayer, dear {name}. Shall we go together?",
      "Have you read your daily story yet?",
      "Remember to make dua and thank Allah for today's blessings.",
      "A kind deed today will make your heart happy!"
    ]
  },
  pet: {
    greeting: [
      "Meow! {name}, I'm so happy to see you!",
      "Purr purr! Ready for some Islamic adventures today?",
      "Whiskers twitching with excitement to learn with you!"
    ],
    encouragement: [
      "You're my favorite human, {name}! So proud of you!",
      "Purr-fect prayer streak! I'm doing a happy dance!",
      "Your kindness makes my heart warm and fuzzy!",
      "Learning the Quran together is my favorite thing!"
    ],
    celebration: [
      "Hooray! Time for celebration zoomies!",
      "I'm so excited I could chase my tail all day!",
      "You've earned extra head scratches and treats!",
      "Purr-ty awesome achievement, {name}!"
    ],
    reminder: [
      "Psst! {name}, prayer time! Let's go together!",
      "My whiskers are telling me it's story time!",
      "Don't forget to be kind today - it makes me purr!",
      "Time for Quran learning! I'll sit right next to you."
    ]
  },
  wizard: {
    greeting: [
      "Greetings, young scholar {name}! Magic awaits us today!",
      "By the power of knowledge, welcome back {name}!",
      "The stars have aligned for another day of learning!"
    ],
    encouragement: [
      "Your dedication to Islam is truly magical, {name}!",
      "Each prayer you complete adds power to your spiritual magic!",
      "The spell of consistency is working wonderfully!",
      "Your knowledge grows stronger each day!"
    ],
    celebration: [
      "Abracadabra! Another magnificent achievement!",
      "The magic of hard work has paid off splendidly!",
      "Your success has created sparkles of joy!",
      "What a spellbinding accomplishment!"
    ],
    reminder: [
      "The ancient wisdom calls - time for prayer, {name}!",
      "The magical books await your reading!",
      "Cast a spell of kindness on someone today!",
      "Let's brew some knowledge with Quran study!"
    ]
  }
};

const IslamicCompanion = ({ 
  companion, 
  childName, 
  recentActivity, 
  points, 
  streak,
  onInteract 
}: IslamicCompanionProps) => {
  const [currentDialogue, setCurrentDialogue] = useState('');
  const [animationState, setAnimationState] = useState<keyof typeof COMPANION_ANIMATIONS>('idle');
  const [showDialogue, setShowDialogue] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const getRandomDialogue = useCallback((type: keyof typeof DIALOGUE_SETS.angel) => {
    const dialogues = DIALOGUE_SETS[companion.type][type];
    const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    return randomDialogue.replace('{name}', childName);
  }, [companion.type, childName]);

  // Auto-greet on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentDialogue(getRandomDialogue('greeting'));
      setShowDialogue(true);
      setAnimationState('happy');
    }, 1000);

    return () => clearTimeout(timer);
  }, [getRandomDialogue]);

  // React to activities
  useEffect(() => {
    if (recentActivity) {
      setCurrentDialogue(getRandomDialogue('celebration'));
      setShowDialogue(true);
      setAnimationState('celebrating');
      
      setTimeout(() => {
        setAnimationState('happy');
      }, 2000);
    }
  }, [recentActivity, getRandomDialogue]);

  // Periodic reminders
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      if (!showDialogue && Math.random() > 0.7) {
        setCurrentDialogue(getRandomDialogue('reminder'));
        setShowDialogue(true);
        setAnimationState('idle');
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(reminderInterval);
  }, [showDialogue, getRandomDialogue]);

  const handleInteraction = () => {
    setInteractionCount(prev => prev + 1);
    
    if (interactionCount % 3 === 0) {
      setCurrentDialogue(getRandomDialogue('encouragement'));
    } else {
      const responses = [
        "I'm always here for you!",
        "You bring so much joy!",
        "Together we can achieve anything!",
        "Your faith inspires me!"
      ];
      setCurrentDialogue(responses[Math.floor(Math.random() * responses.length)]);
    }
    
    setShowDialogue(true);
    setAnimationState('happy');
    onInteract?.();
    
    setTimeout(() => {
      setAnimationState('idle');
    }, 2000);
  };

  const dismissDialogue = () => {
    setShowDialogue(false);
    setAnimationState('idle');
  };

  const getCompanionMood = () => {
    if (companion.happiness > 80) return 'excited';
    if (companion.happiness > 60) return 'happy';
    if (companion.happiness > 40) return 'content';
    if (companion.happiness > 20) return 'tired';
    return 'sleepy';
  };

  const getMoodEmoji = () => {
    const mood = getCompanionMood();
    switch (mood) {
      case 'excited': return '✨';
      case 'happy': return '😊';
      case 'content': return '😌';
      case 'tired': return '😴';
      case 'sleepy': return '💤';
      default: return '😊';
    }
  };

  return (
    <div className="relative">
      {/* Companion Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-islamic-blue/10 to-islamic-green/10 border-islamic-blue/30">
        <CardContent className="p-6">
          {/* Companion Avatar */}
          <div className="text-center mb-4">
            <div 
              className={`text-6xl mb-2 cursor-pointer transition-transform hover:scale-110 ${COMPANION_ANIMATIONS[animationState]}`}
              onClick={handleInteraction}
              role="button"
              tabIndex={0}
            >
              {COMPANION_EMOJIS[companion.type]}
              <span className="text-lg ml-1">{getMoodEmoji()}</span>
            </div>
            <h3 className="text-xl font-bold text-islamic-blue mb-1">
              {companion.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your Islamic {companion.type} • Level {companion.level}
            </p>
          </div>

          {/* Companion Stats */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                Happiness
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-400 to-pink-500 transition-all duration-500"
                    style={{ width: `${companion.happiness}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{companion.happiness}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-islamic-gold" />
                Energy
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-islamic-gold to-yellow-400 transition-all duration-500"
                    style={{ width: `${companion.energy}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{companion.energy}%</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-2 justify-center">
            <Badge variant="secondary" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              {points} points
            </Badge>
            <Badge variant="secondary" className="text-xs">
              🔥 {streak} day streak
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dialogue Bubble */}
      {showDialogue && currentDialogue && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 animate-fade-in">
          <div className="relative bg-white border-2 border-islamic-blue/30 rounded-lg px-4 py-3 shadow-lg max-w-xs">
            <p className="text-sm text-center font-medium text-islamic-blue">
              {currentDialogue}
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-islamic-blue/30 rotate-45" />
            <Button
              size="sm"
              variant="ghost"
              className="absolute -top-1 -right-1 h-6 w-6 p-0 rounded-full"
              onClick={dismissDialogue}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Interaction Button */}
      <div className="mt-4 text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleInteraction}
          className="text-islamic-blue border-islamic-blue hover:bg-islamic-blue hover:text-white"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Talk to {companion.name}
        </Button>
      </div>
    </div>
  );
};

export default IslamicCompanion;
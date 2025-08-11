import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Star,
  Trophy,
  Volume2,
  Clock
} from 'lucide-react';

interface GameStats {
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  score: number;
}

interface PrayerPosition {
  id: number;
  name: string;
  arabic: string;
  transliteration: string;
  description: string;
  image: string;
  order: number;
}

const PRAYER_POSITIONS: PrayerPosition[] = [
  {
    id: 1,
    name: "Standing (Qiyam)",
    arabic: "قيام",
    transliteration: "Qiyam",
    description: "Stand facing the Qibla with hands at sides",
    image: "🧍",
    order: 1
  },
  {
    id: 2,
    name: "Takbiratul Ihram",
    arabic: "تكبيرة الإحرام",
    transliteration: "Takbiratul Ihram",
    description: "Raise hands to ears and say 'Allahu Akbar'",
    image: "🙌",
    order: 2
  },
  {
    id: 3,
    name: "Placing Hands",
    arabic: "وضع اليدين",
    transliteration: "Wad' al-Yadayn",
    description: "Place right hand over left on chest",
    image: "🤲",
    order: 3
  },
  {
    id: 4,
    name: "Bowing (Ruku)",
    arabic: "ركوع",
    transliteration: "Ruku",
    description: "Bow with hands on knees, back straight",
    image: "🙇",
    order: 4
  },
  {
    id: 5,
    name: "Standing from Ruku",
    arabic: "الاعتدال من الركوع",
    transliteration: "I'tidal min ar-Ruku",
    description: "Stand straight with hands at sides",
    image: "🧍",
    order: 5
  },
  {
    id: 6,
    name: "Prostration (Sujud)",
    arabic: "سجود",
    transliteration: "Sujud",
    description: "Prostrate with forehead, nose, hands, knees, and toes on ground",
    image: "🙏",
    order: 6
  },
  {
    id: 7,
    name: "Sitting between Prostrations",
    arabic: "الجلوس بين السجدتين",
    transliteration: "Julus bayna as-Sajdatayn",
    description: "Sit on left foot, right foot upright",
    image: "🧘",
    order: 7
  },
  {
    id: 8,
    name: "Second Prostration",
    arabic: "السجدة الثانية",
    transliteration: "As-Sajda ath-Thaniya",
    description: "Prostrate again in the same manner",
    image: "🙏",
    order: 8
  }
];

interface PrayerSequenceGameProps {
  onGameComplete: (stats: GameStats) => void;
  childAge?: number;
}

const PrayerSequenceGame: React.FC<PrayerSequenceGameProps> = ({ 
  onGameComplete, 
  childAge = 8 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'completed'>('instructions');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [shuffledPositions, setShuffledPositions] = useState<PrayerPosition[]>([]);
  const [questionOrder, setQuestionOrder] = useState<PrayerPosition[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    // Shuffle positions for answer choices
    const shuffled = [...PRAYER_POSITIONS].sort(() => Math.random() - 0.5);
    setShuffledPositions(shuffled);
    
    // Create question order (first 5 positions for easier gameplay)
    const questions = PRAYER_POSITIONS.slice(0, 5);
    setQuestionOrder(questions);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setGameStartTime(Date.now());
    setCurrentQuestion(0);
    setCorrectAnswers(0);
    setSelectedPosition(null);
    setShowFeedback(false);
  };

  const handlePositionSelect = (positionId: number) => {
    if (showFeedback) return;
    
    setSelectedPosition(positionId);
    const correctPosition = questionOrder[currentQuestion];
    const correct = positionId === correctPosition.id;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentQuestion < questionOrder.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedPosition(null);
        setShowFeedback(false);
      } else {
        // Game completed
        const timeSpent = (Date.now() - gameStartTime) / 1000;
        const score = Math.round((correctAnswers / questionOrder.length) * 100);
        
        setGameState('completed');
        onGameComplete({
          correctAnswers: correct ? correctAnswers + 1 : correctAnswers,
          totalQuestions: questionOrder.length,
          timeSpent,
          score
        });
      }
    }, 2000);
  };

  const resetGame = () => {
    setGameState('instructions');
    setCurrentQuestion(0);
    setSelectedPosition(null);
    setCorrectAnswers(0);
    setShowFeedback(false);
  };

  const renderInstructions = () => (
    <Card className="bg-gradient-to-r from-islamic-green/10 to-islamic-blue/10">
      <CardHeader>
        <CardTitle className="text-center text-2xl">🕌 Prayer Sequence Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-lg mb-4">
            Learn the correct sequence of prayer positions in Islam! 
          </p>
          <p className="text-muted-foreground">
            You'll see a prayer position, and you need to select what comes next in the sequence.
          </p>
        </div>

        <div className="bg-white/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-islamic-green">Islamic Learning Objectives:</h4>
          <ul className="space-y-2 text-sm">
            <li>• Learn the correct order of prayer positions (Salah)</li>
            <li>• Memorize Arabic names with proper pronunciation</li>
            <li>• Understand the spiritual significance of each position</li>
            <li>• Build familiarity with Islamic terminology</li>
          </ul>
        </div>

        <div className="text-center">
          <Button 
            onClick={startGame}
            className="bg-islamic-green hover:bg-islamic-green/90 text-white px-8 py-3 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Learning
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderGame = () => {
    const currentPos = questionOrder[currentQuestion];
    const progress = ((currentQuestion + 1) / questionOrder.length) * 100;

    return (
      <div className="space-y-6">
        {/* Progress Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Question {currentQuestion + 1} of {questionOrder.length}
              </span>
              <span className="text-sm text-muted-foreground">
                Score: {correctAnswers}/{currentQuestion + (showFeedback ? 1 : 0)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Current Question */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="text-center">
              What comes after this prayer position?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-6xl">{currentPos.image}</div>
              <div>
                <h3 className="text-xl font-semibold">{currentPos.name}</h3>
                <p className="text-lg font-arabic text-islamic-green">{currentPos.arabic}</p>
                <p className="text-sm italic">{currentPos.transliteration}</p>
                <p className="text-sm text-muted-foreground mt-2">{currentPos.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Choices */}
        <div className="grid grid-cols-2 gap-4">
          {shuffledPositions.slice(0, 4).map((position) => {
            const isSelected = selectedPosition === position.id;
            const isCorrectAnswer = position.order === currentPos.order + 1;
            
            let cardClass = "cursor-pointer transition-all hover:shadow-md";
            
            if (showFeedback) {
              if (isSelected && isCorrectAnswer) {
                cardClass += " bg-green-100 border-green-500 border-2";
              } else if (isSelected && !isCorrectAnswer) {
                cardClass += " bg-red-100 border-red-500 border-2";
              } else if (isCorrectAnswer) {
                cardClass += " bg-green-50 border-green-300 border-2";
              } else {
                cardClass += " opacity-50";
              }
            } else {
              cardClass += " hover:bg-muted/50";
            }

            return (
              <Card 
                key={position.id}
                className={cardClass}
                onClick={() => handlePositionSelect(position.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{position.image}</div>
                  <h4 className="font-medium text-sm">{position.name}</h4>
                  <p className="text-xs font-arabic text-islamic-green">{position.arabic}</p>
                  <p className="text-xs italic">{position.transliteration}</p>
                  
                  {showFeedback && isSelected && (
                    <div className="mt-2">
                      {isCorrectAnswer ? (
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 mx-auto" />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {showFeedback && (
          <Card className={`${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <CardContent className="p-4 text-center">
              {isCorrect ? (
                <div className="text-green-700">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Excellent! That's correct! 🎉</p>
                  <p className="text-sm">You're learning the prayer sequence well, MashaAllah!</p>
                </div>
              ) : (
                <div className="text-red-700">
                  <XCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Not quite right. Keep learning! 📚</p>
                  <p className="text-sm">The correct answer is highlighted in green.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderCompleted = () => {
    const percentage = (correctAnswers / questionOrder.length) * 100;
    
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🎉 Game Completed!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '📚'}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {percentage >= 80 ? 'Excellent Work!' : percentage >= 60 ? 'Good Job!' : 'Keep Learning!'}
            </h3>
            <p className="text-muted-foreground">
              {percentage >= 80 
                ? 'MashaAllah! You know the prayer sequence very well!' 
                : percentage >= 60 
                ? 'You\'re doing great! Practice a bit more to master it.'
                : 'Learning takes time. Keep practicing and you\'ll improve!'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-islamic-green">{correctAnswers}/{questionOrder.length}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(percentage)}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-x-4">
            <Button 
              onClick={resetGame}
              variant="outline"
              className="px-6"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            
            <Button 
              onClick={() => onGameComplete({
                correctAnswers,
                totalQuestions: questionOrder.length,
                timeSpent: (Date.now() - gameStartTime) / 1000,
                score: Math.round(percentage)
              })}
              className="bg-islamic-green hover:bg-islamic-green/90 px-6"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {gameState === 'instructions' && renderInstructions()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'completed' && renderCompleted()}
    </div>
  );
};

export default PrayerSequenceGame;
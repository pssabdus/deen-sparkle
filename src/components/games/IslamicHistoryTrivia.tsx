import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Star,
  Trophy,
  Clock,
  User,
  Crown,
  Home
} from 'lucide-react';

interface HistoryQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: 'prophets' | 'sahaba' | 'events' | 'places';
  difficulty: 'easy' | 'medium' | 'hard';
  reference: string;
}

const HISTORY_QUESTIONS: HistoryQuestion[] = [
  {
    id: 1,
    question: "What was the name of Prophet Muhammad's ﷺ father?",
    options: ["Abdullah", "Abu Talib", "Abdul Muttalib", "Abu Lahab"],
    correctAnswer: "Abdullah",
    explanation: "Prophet Muhammad's ﷺ father was Abdullah ibn Abdul Muttalib. He passed away before the Prophet ﷺ was born.",
    category: "prophets",
    difficulty: "easy",
    reference: "Seerah (Biography of Prophet Muhammad ﷺ)"
  },
  {
    id: 2,
    question: "Who was the first person to accept Islam?",
    options: ["Abu Bakr (RA)", "Khadijah (RA)", "Ali (RA)", "Uthman (RA)"],
    correctAnswer: "Khadijah (RA)",
    explanation: "Khadijah (RA), the Prophet's ﷺ wife, was the first person to believe in his message and accept Islam.",
    category: "sahaba",
    difficulty: "easy",
    reference: "Sahih Bukhari and Muslim"
  },
  {
    id: 3,
    question: "In which cave did Prophet Muhammad ﷺ receive the first revelation?",
    options: ["Cave of Thawr", "Cave of Hira", "Cave of Uhud", "Cave of Quba"],
    correctAnswer: "Cave of Hira",
    explanation: "Angel Jibril (Gabriel) first appeared to Prophet Muhammad ﷺ in the Cave of Hira on Mount Jabal an-Nour.",
    category: "events",
    difficulty: "easy",
    reference: "Sahih Bukhari"
  },
  {
    id: 4,
    question: "Who was known as 'As-Siddiq' (The Truthful)?",
    options: ["Umar ibn al-Khattab (RA)", "Abu Bakr (RA)", "Uthman ibn Affan (RA)", "Ali ibn Abi Talib (RA)"],
    correctAnswer: "Abu Bakr (RA)",
    explanation: "Abu Bakr (RA) was called 'As-Siddiq' because he immediately believed the Prophet ﷺ when he told him about the Night Journey (Isra and Mi'raj).",
    category: "sahaba",
    difficulty: "medium",
    reference: "Islamic History"
  },
  {
    id: 5,
    question: "Which prophet built the Kaaba?",
    options: ["Prophet Ibrahim (AS) and Ismail (AS)", "Prophet Musa (AS)", "Prophet Isa (AS)", "Prophet Nuh (AS)"],
    correctAnswer: "Prophet Ibrahim (AS) and Ismail (AS)",
    explanation: "Prophet Ibrahim (Abraham) and his son Ismail (Ishmael) built the Kaaba as the first house of worship for Allah.",
    category: "prophets",
    difficulty: "easy",
    reference: "Quran 2:127"
  },
  {
    id: 6,
    question: "What was the name of the treaty signed between Muslims and Mecca?",
    options: ["Treaty of Hudaybiyyah", "Treaty of Badr", "Treaty of Uhud", "Treaty of Tabuk"],
    correctAnswer: "Treaty of Hudaybiyyah",
    explanation: "The Treaty of Hudaybiyyah was a peace agreement that allowed Muslims to perform Hajj and led to many people accepting Islam.",
    category: "events",
    difficulty: "medium",
    reference: "Sahih Bukhari"
  },
  {
    id: 7,
    question: "Who was the first muezzin (caller to prayer) in Islam?",
    options: ["Abu Bakr (RA)", "Bilal ibn Rabah (RA)", "Umar ibn al-Khattab (RA)", "Sa'd ibn Abi Waqqas (RA)"],
    correctAnswer: "Bilal ibn Rabah (RA)",
    explanation: "Bilal ibn Rabah (RA), a former slave from Abyssinia, was chosen by the Prophet ﷺ to be the first muezzin because of his beautiful voice.",
    category: "sahaba",
    difficulty: "easy",
    reference: "Sunan Abu Dawood"
  },
  {
    id: 8,
    question: "Which Caliph compiled the Quran into one book?",
    options: ["Abu Bakr (RA)", "Umar (RA)", "Uthman (RA)", "Ali (RA)"],
    correctAnswer: "Uthman (RA)",
    explanation: "Uthman ibn Affan (RA) ordered the compilation of the Quran into one standardized text to preserve it for future generations.",
    category: "sahaba",
    difficulty: "medium",
    reference: "Sahih Bukhari"
  },
  {
    id: 9,
    question: "What does 'Hijra' refer to?",
    options: ["The conquest of Mecca", "Migration from Mecca to Medina", "The first revelation", "The last sermon"],
    correctAnswer: "Migration from Mecca to Medina",
    explanation: "Hijra refers to the migration of Prophet Muhammad ﷺ and the early Muslims from Mecca to Medina in 622 CE, marking the start of the Islamic calendar.",
    category: "events",
    difficulty: "easy",
    reference: "Islamic History"
  },
  {
    id: 10,
    question: "Who was known as 'Sayf Allah al-Maslul' (The Drawn Sword of Allah)?",
    options: ["Abu Bakr (RA)", "Umar (RA)", "Khalid ibn al-Walid (RA)", "Sa'd ibn Abi Waqqas (RA)"],
    correctAnswer: "Khalid ibn al-Walid (RA)",
    explanation: "Khalid ibn al-Walid (RA) was called 'Sayf Allah al-Maslul' by the Prophet ﷺ because he never lost a battle and was a brilliant military commander.",
    category: "sahaba",
    difficulty: "hard",
    reference: "Islamic Military History"
  }
];

interface GameStats {
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  score: number;
}

interface IslamicHistoryTriviaProps {
  onGameComplete: (stats: GameStats) => void;
  childAge?: number;
}

const IslamicHistoryTrivia: React.FC<IslamicHistoryTriviaProps> = ({ 
  onGameComplete, 
  childAge = 8 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'completed'>('instructions');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gameQuestions, setGameQuestions] = useState<HistoryQuestion[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    // Filter questions by difficulty and select 8 questions
    const filteredQuestions = HISTORY_QUESTIONS.filter(q => 
      childAge < 10 ? q.difficulty === 'easy' : 
      childAge < 14 ? q.difficulty !== 'hard' : true
    );
    
    const selectedQuestions = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
    setGameQuestions(selectedQuestions);
  }, [childAge, selectedDifficulty]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0 && !showFeedback) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !showFeedback) {
      // Time's up - mark as wrong
      handleAnswerSelect('');
    }
    
    return () => clearTimeout(timer);
  }, [timerActive, timeRemaining, showFeedback]);

  const startGame = () => {
    setGameState('playing');
    setGameStartTime(Date.now());
    setCurrentQuestion(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeRemaining(30);
    setTimerActive(true);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    
    setTimerActive(false);
    setSelectedAnswer(answer);
    const currentQ = gameQuestions[currentQuestion];
    const correct = answer === currentQ.correctAnswer;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Auto advance after 4 seconds to allow reading explanation
    setTimeout(() => {
      if (currentQuestion < gameQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeRemaining(30);
        setTimerActive(true);
      } else {
        // Game completed
        const timeSpent = (Date.now() - gameStartTime) / 1000;
        const finalCorrect = correct ? correctAnswers + 1 : correctAnswers;
        const score = Math.round((finalCorrect / gameQuestions.length) * 100);
        
        setGameState('completed');
        onGameComplete({
          correctAnswers: finalCorrect,
          totalQuestions: gameQuestions.length,
          timeSpent,
          score
        });
      }
    }, 4000);
  };

  const resetGame = () => {
    setGameState('instructions');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setShowFeedback(false);
    setTimerActive(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prophets': return <Star className="w-4 h-4" />;
      case 'sahaba': return <User className="w-4 h-4" />;
      case 'events': return <Clock className="w-4 h-4" />;
      case 'places': return <Home className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prophets': return 'text-yellow-600 bg-yellow-100';
      case 'sahaba': return 'text-blue-600 bg-blue-100';
      case 'events': return 'text-green-600 bg-green-100';
      case 'places': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderInstructions = () => (
    <Card className="bg-gradient-to-r from-islamic-green/10 to-islamic-blue/10">
      <CardHeader>
        <CardTitle className="text-center text-2xl">🏛️ Islamic History Trivia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-lg mb-4">
            Test your knowledge of Islamic history, Prophets, and the noble Companions!
          </p>
          <p className="text-muted-foreground">
            Learn about the amazing people and events that shaped our beautiful religion.
          </p>
        </div>

        <div className="bg-white/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-islamic-green">What You'll Learn:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="text-sm">Stories of Prophets (AS)</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Noble Companions (RA)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm">Historical Events</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-purple-600" />
              <span className="text-sm">Sacred Places</span>
            </div>
          </div>
        </div>

        <div className="bg-islamic-green/10 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-islamic-green">🎯 Game Rules:</h4>
          <ul className="text-sm space-y-1">
            <li>• You have 30 seconds to answer each question</li>
            <li>• All content is authentic and verified by Islamic scholars</li>
            <li>• Learn interesting facts and explanations after each answer</li>
            <li>• Questions are selected based on your age group</li>
          </ul>
        </div>

        <div className="text-center">
          <Button 
            onClick={startGame}
            className="bg-islamic-green hover:bg-islamic-green/90 text-white px-8 py-3 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Trivia
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderGame = () => {
    if (gameQuestions.length === 0) return null;
    
    const currentQ = gameQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / gameQuestions.length) * 100;

    return (
      <div className="space-y-6">
        {/* Progress and Timer Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Question {currentQuestion + 1} of {gameQuestions.length}
              </span>
              <div className="flex items-center gap-4">
                <Badge className={getCategoryColor(currentQ.category)}>
                  {getCategoryIcon(currentQ.category)}
                  <span className="ml-1 capitalize">{currentQ.category}</span>
                </Badge>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className={`text-sm font-mono ${timeRemaining <= 10 ? 'text-red-600' : ''}`}>
                    {timeRemaining}s
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Score: {correctAnswers}/{currentQuestion + (showFeedback ? 1 : 0)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Progress value={progress} className="h-2 flex-1" />
              <Progress 
                value={(timeRemaining / 30) * 100} 
                className={`h-2 w-20 ${timeRemaining <= 10 ? 'bg-red-200' : ''}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold leading-relaxed">
                {currentQ.question}
              </h3>
              
              {currentQ.difficulty === 'hard' && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <Crown className="w-3 h-3 mr-1" />
                  Challenge Question
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Answer Choices */}
        <div className="grid grid-cols-1 gap-3">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectChoice = option === currentQ.correctAnswer;
            
            let cardClass = "cursor-pointer transition-all hover:shadow-md text-left";
            
            if (showFeedback) {
              if (isSelected && isCorrectChoice) {
                cardClass += " bg-green-100 border-green-500 border-2";
              } else if (isSelected && !isCorrectChoice) {
                cardClass += " bg-red-100 border-red-500 border-2";
              } else if (isCorrectChoice) {
                cardClass += " bg-green-50 border-green-300 border-2";
              } else {
                cardClass += " opacity-50";
              }
            } else {
              cardClass += " hover:bg-muted/50 border";
            }

            return (
              <Card 
                key={index}
                className={cardClass}
                onClick={() => handleAnswerSelect(option)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <p className="text-base">{option}</p>
                    </div>
                    
                    {showFeedback && isSelected && (
                      <div>
                        {isCorrectChoice ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {showFeedback && (
          <Card className={`${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <CardContent className="p-4">
              <div className="text-center mb-4">
                {isCorrect ? (
                  <div className="text-green-700">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold">Correct! Well done! 🌟</p>
                  </div>
                ) : (
                  <div className="text-red-700">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold">Not quite right, but keep learning! 📚</p>
                  </div>
                )}
              </div>
              
              <div className="bg-white/70 p-4 rounded-lg">
                <h4 className="font-semibold text-islamic-green mb-2">📖 Did You Know?</h4>
                <p className="text-sm mb-3">{currentQ.explanation}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span><strong>Reference:</strong> {currentQ.reference}</span>
                  <Badge variant="outline" className="text-xs">
                    {currentQ.difficulty} level
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderCompleted = () => {
    const percentage = (correctAnswers / gameQuestions.length) * 100;
    
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🏆 Islamic History Master!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '📚'}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {percentage >= 80 ? 'MashaAllah! Outstanding!' : percentage >= 60 ? 'Great Knowledge!' : 'Keep Exploring!'}
            </h3>
            <p className="text-muted-foreground">
              {percentage >= 80 
                ? 'You have wonderful knowledge of Islamic history!' 
                : percentage >= 60 
                ? 'You\'re building great knowledge of our Islamic heritage.'
                : 'Every question teaches us more about our beautiful religion!'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-islamic-green">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(percentage)}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{gameQuestions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-islamic-green/10 p-4 rounded-lg">
            <h4 className="font-semibold text-islamic-green mb-2">🌟 Continue Your Islamic Learning Journey:</h4>
            <ul className="text-sm space-y-1">
              <li>• Read more stories about the Prophets and Companions</li>
              <li>• Visit a mosque to learn from Islamic scholars</li>
              <li>• Share these amazing stories with your friends and family</li>
              <li>• Try to follow the example of these great people in your daily life</li>
            </ul>
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
                totalQuestions: gameQuestions.length,
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

export default IslamicHistoryTrivia;
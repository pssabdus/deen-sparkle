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
  Book
} from 'lucide-react';

interface QuranVerse {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  surah: string;
  ayah: number;
  theme: string;
}

const QURAN_VERSES: QuranVerse[] = [
  {
    id: 1,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    transliteration: "Bismillahir-Rahmanir-Rahim",
    translation: "In the name of Allah, the Most Gracious, the Most Merciful",
    surah: "Al-Fatiha",
    ayah: 1,
    theme: "Allah's Names"
  },
  {
    id: 2,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    transliteration: "Alhamdulillahi Rabbil-Alameen",
    translation: "All praise is due to Allah, Lord of all the worlds",
    surah: "Al-Fatiha",
    ayah: 2,
    theme: "Gratitude"
  },
  {
    id: 3,
    arabic: "وَقُلْ رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Wa qul rabbi zidni ilma",
    translation: "And say: My Lord, increase me in knowledge",
    surah: "Ta-Ha",
    ayah: 114,
    theme: "Knowledge"
  },
  {
    id: 4,
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    transliteration: "Inna ma'al usri yusra",
    translation: "Indeed, with hardship comes ease",
    surah: "Ash-Sharh",
    ayah: 6,
    theme: "Hope"
  },
  {
    id: 5,
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً",
    transliteration: "Rabbana atina fi'd-dunya hasanah",
    translation: "Our Lord, give us good in this world",
    surah: "Al-Baqarah",
    ayah: 201,
    theme: "Prayer"
  },
  {
    id: 6,
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    transliteration: "Wa man yattaqillaha yaj'al lahu makhraja",
    translation: "And whoever fears Allah, He will make for him a way out",
    surah: "At-Talaq",
    ayah: 2,
    theme: "Trust in Allah"
  },
  {
    id: 7,
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    transliteration: "Fadh-kuruni adhkurkum",
    translation: "So remember Me; I will remember you",
    surah: "Al-Baqarah",
    ayah: 152,
    theme: "Remembrance"
  },
  {
    id: 8,
    arabic: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ",
    transliteration: "Wa la tay'asu min rohillah",
    translation: "And do not despair of the mercy of Allah",
    surah: "Yusuf",
    ayah: 87,
    theme: "Hope"
  }
];

interface GameStats {
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  score: number;
}

interface QuranMemoryGameProps {
  onGameComplete: (stats: GameStats) => void;
  childAge?: number;
}

const QuranMemoryGame: React.FC<QuranMemoryGameProps> = ({ 
  onGameComplete, 
  childAge = 8 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'completed'>('instructions');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gameVerses, setGameVerses] = useState<QuranVerse[]>([]);
  const [answerChoices, setAnswerChoices] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameMode, setGameMode] = useState<'arabic-to-meaning' | 'meaning-to-arabic'>('arabic-to-meaning');

  useEffect(() => {
    // Select 6 verses for the game
    const selectedVerses = [...QURAN_VERSES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
    setGameVerses(selectedVerses);
  }, []);

  useEffect(() => {
    if (gameVerses.length > 0 && currentQuestion < gameVerses.length) {
      generateAnswerChoices();
    }
  }, [currentQuestion, gameVerses, gameMode]);

  const generateAnswerChoices = () => {
    const currentVerse = gameVerses[currentQuestion];
    const correctAnswer = gameMode === 'arabic-to-meaning' 
      ? currentVerse.translation 
      : currentVerse.arabic;

    // Get 3 random wrong answers
    const otherVerses = QURAN_VERSES.filter(v => v.id !== currentVerse.id);
    const wrongAnswers = otherVerses
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(v => gameMode === 'arabic-to-meaning' ? v.translation : v.arabic);

    // Shuffle all answers
    const allChoices = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setAnswerChoices(allChoices);
  };

  const startGame = () => {
    setGameState('playing');
    setGameStartTime(Date.now());
    setCurrentQuestion(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const currentVerse = gameVerses[currentQuestion];
    const correctAnswer = gameMode === 'arabic-to-meaning' 
      ? currentVerse.translation 
      : currentVerse.arabic;
    
    const correct = answer === correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Auto advance after 3 seconds
    setTimeout(() => {
      if (currentQuestion < gameVerses.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Game completed
        const timeSpent = (Date.now() - gameStartTime) / 1000;
        const finalCorrect = correct ? correctAnswers + 1 : correctAnswers;
        const score = Math.round((finalCorrect / gameVerses.length) * 100);
        
        setGameState('completed');
        onGameComplete({
          correctAnswers: finalCorrect,
          totalQuestions: gameVerses.length,
          timeSpent,
          score
        });
      }
    }, 3000);
  };

  const resetGame = () => {
    setGameState('instructions');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setShowFeedback(false);
  };

  const renderInstructions = () => (
    <Card className="bg-gradient-to-r from-islamic-green/10 to-islamic-blue/10">
      <CardHeader>
        <CardTitle className="text-center text-2xl">📖 Quran Memory Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-lg mb-4">
            Match beautiful Quran verses with their meanings!
          </p>
          <p className="text-muted-foreground">
            Learn authentic verses from the Holy Quran with proper translations verified by Islamic scholars.
          </p>
        </div>

        <div className="bg-white/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-islamic-green">Islamic Learning Benefits:</h4>
          <ul className="space-y-2 text-sm">
            <li>• Memorize beautiful Quranic verses with authentic meanings</li>
            <li>• Learn proper Arabic pronunciation and transliteration</li>
            <li>• Understand the spiritual wisdom in Allah's words</li>
            <li>• Connect with Islamic themes like gratitude, hope, and knowledge</li>
            <li>• Build a foundation for Quran memorization (Hifz)</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Choose Game Mode:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant={gameMode === 'arabic-to-meaning' ? 'default' : 'outline'}
              onClick={() => setGameMode('arabic-to-meaning')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Book className="w-6 h-6 mb-2" />
              <span className="font-medium">Arabic → Meaning</span>
              <span className="text-xs">See Arabic, find English meaning</span>
            </Button>
            
            <Button
              variant={gameMode === 'meaning-to-arabic' ? 'default' : 'outline'}
              onClick={() => setGameMode('meaning-to-arabic')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Star className="w-6 h-6 mb-2" />
              <span className="font-medium">Meaning → Arabic</span>
              <span className="text-xs">See meaning, find Arabic verse</span>
            </Button>
          </div>
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
    if (gameVerses.length === 0) return null;
    
    const currentVerse = gameVerses[currentQuestion];
    const progress = ((currentQuestion + 1) / gameVerses.length) * 100;
    const correctAnswer = gameMode === 'arabic-to-meaning' 
      ? currentVerse.translation 
      : currentVerse.arabic;

    return (
      <div className="space-y-6">
        {/* Progress Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Question {currentQuestion + 1} of {gameVerses.length}
              </span>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-islamic-green">
                  {gameMode === 'arabic-to-meaning' ? 'Arabic → Meaning' : 'Meaning → Arabic'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Score: {correctAnswers}/{currentQuestion + (showFeedback ? 1 : 0)}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="text-center">
              {gameMode === 'arabic-to-meaning' 
                ? 'What does this verse mean?' 
                : 'Which verse has this meaning?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="bg-white/70 p-6 rounded-lg">
                {gameMode === 'arabic-to-meaning' ? (
                  <div>
                    <p className="text-2xl font-arabic text-islamic-green mb-3 leading-relaxed">
                      {currentVerse.arabic}
                    </p>
                    <p className="text-lg italic text-muted-foreground mb-2">
                      {currentVerse.transliteration}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    "{currentVerse.translation}"
                  </p>
                )}
                
                <div className="mt-4 pt-4 border-t border-muted">
                  <Badge variant="secondary" className="text-xs">
                    Surah {currentVerse.surah}, Ayah {currentVerse.ayah}
                  </Badge>
                  <Badge variant="outline" className="text-xs ml-2">
                    Theme: {currentVerse.theme}
                  </Badge>
                </div>
              </div>

              <Button variant="ghost" size="sm" className="text-islamic-green">
                <Volume2 className="w-4 h-4 mr-2" />
                Listen to Recitation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Answer Choices */}
        <div className="grid grid-cols-1 gap-3">
          {answerChoices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;
            const isCorrectChoice = choice === correctAnswer;
            
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
                onClick={() => handleAnswerSelect(choice)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {gameMode === 'arabic-to-meaning' ? (
                        <p className="text-base">{choice}</p>
                      ) : (
                        <p className="text-lg font-arabic text-islamic-green leading-relaxed">
                          {choice}
                        </p>
                      )}
                    </div>
                    
                    {showFeedback && isSelected && (
                      <div className="ml-4">
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
            <CardContent className="p-4 text-center">
              {isCorrect ? (
                <div className="text-green-700">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Excellent! That's correct! 🌟</p>
                  <p className="text-sm">MashaAllah! You're learning Allah's words beautifully.</p>
                </div>
              ) : (
                <div className="text-red-700">
                  <XCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Keep learning! 📚</p>
                  <p className="text-sm">The correct answer is highlighted in green. Read it carefully!</p>
                </div>
              )}
              
              {/* Show the complete verse information */}
              <div className="mt-4 pt-4 border-t border-muted text-sm text-muted-foreground">
                <p><strong>Complete Verse Info:</strong></p>
                <p className="font-arabic text-islamic-green">{currentVerse.arabic}</p>
                <p className="italic">{currentVerse.transliteration}</p>
                <p>"{currentVerse.translation}"</p>
                <p className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    Surah {currentVerse.surah}, Ayah {currentVerse.ayah}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderCompleted = () => {
    const percentage = (correctAnswers / gameVerses.length) * 100;
    
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🎉 Quran Learning Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '📚'}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {percentage >= 80 ? 'MashaAllah! Excellent!' : percentage >= 60 ? 'Great Progress!' : 'Keep Learning!'}
            </h3>
            <p className="text-muted-foreground">
              {percentage >= 80 
                ? 'You have a wonderful connection with the Quran!' 
                : percentage >= 60 
                ? 'You\'re building a beautiful relationship with Allah\'s words.'
                : 'Every step in learning the Quran is blessed. Keep going!'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-islamic-green">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Verses Learned</div>
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
                <div className="text-2xl font-bold text-purple-600">{gameVerses.length}</div>
                <div className="text-sm text-muted-foreground">Total Verses</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-islamic-green/10 p-4 rounded-lg">
            <h4 className="font-semibold text-islamic-green mb-2">🌟 Next Steps in Your Quran Journey:</h4>
            <ul className="text-sm space-y-1">
              <li>• Practice reciting these verses during your daily prayers</li>
              <li>• Try to memorize one verse each week</li>
              <li>• Learn more about the context and stories behind these verses</li>
              <li>• Share these beautiful meanings with your family</li>
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
                totalQuestions: gameVerses.length,
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

export default QuranMemoryGame;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  BookOpen, 
  Clock, 
  User, 
  Trophy, 
  Star,
  Play,
  RotateCcw,
  Award,
  Calendar,
  Heart,
  Compass
} from 'lucide-react';
import PrayerSequenceGame from './games/PrayerSequenceGame';
import QuranMemoryGame from './games/QuranMemoryGame';
import IslamicHistoryTrivia from './games/IslamicHistoryTrivia';

interface GameStats {
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  score: number;
}

interface IslamicGame {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'worship' | 'knowledge' | 'history' | 'character';
  difficulty: 'easy' | 'medium' | 'hard';
  ageGroup: string;
  learningObjectives: string[];
  estimatedTime: string;
  component: React.ComponentType<any>;
}

const ISLAMIC_GAMES: IslamicGame[] = [
  {
    id: 'prayer-sequence',
    title: 'Prayer Sequence Master',
    description: 'Learn the correct order of prayer positions with authentic Islamic guidance',
    icon: <Compass className="w-6 h-6" />,
    category: 'worship',
    difficulty: 'easy',
    ageGroup: '6-14 years',
    learningObjectives: [
      'Memorize prayer position sequence',
      'Learn Arabic names for prayer positions',
      'Understand spiritual significance',
      'Practice Islamic terminology'
    ],
    estimatedTime: '10-15 minutes',
    component: PrayerSequenceGame
  },
  {
    id: 'quran-memory',
    title: 'Quran Memory Match',
    description: 'Match beautiful Quran verses with their meanings using authentic translations',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'knowledge',
    difficulty: 'medium',
    ageGroup: '8-16 years',
    learningObjectives: [
      'Memorize Quranic verses',
      'Learn authentic translations',
      'Understand spiritual themes',
      'Build Quran connection'
    ],
    estimatedTime: '15-20 minutes',
    component: QuranMemoryGame
  },
  {
    id: 'history-trivia',
    title: 'Islamic History Heroes',
    description: 'Discover amazing stories of Prophets, Companions, and Islamic events',
    icon: <User className="w-6 h-6" />,
    category: 'history',
    difficulty: 'medium',
    ageGroup: '10-18 years',
    learningObjectives: [
      'Learn about Islamic personalities',
      'Understand historical events',
      'Build Islamic identity',
      'Connect with heritage'
    ],
    estimatedTime: '12-18 minutes',
    component: IslamicHistoryTrivia
  }
];

const UPCOMING_GAMES = [
  {
    title: 'Dua Practice Studio',
    description: 'Learn daily duas with authentic pronunciation',
    icon: <Heart className="w-6 h-6" />,
    status: 'Coming Soon'
  },
  {
    title: 'Islamic Calendar Explorer',
    description: 'Discover important Islamic dates and their significance',
    icon: <Calendar className="w-6 h-6" />,
    status: 'Coming Soon'
  },
  {
    title: 'Good Deeds Garden',
    description: 'Cultivate Islamic character through daily actions',
    icon: <Star className="w-6 h-6" />,
    status: 'Coming Soon'
  }
];

interface IslamicLearningGamesProps {
  childId?: string;
  userProfile?: any;
}

const IslamicLearningGames: React.FC<IslamicLearningGamesProps> = ({ 
  childId, 
  userProfile 
}) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<Record<string, GameStats>>({});
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);

  const handleGameComplete = (gameId: string, stats: GameStats) => {
    setGameStats(prev => ({
      ...prev,
      [gameId]: stats
    }));
    setTotalGamesPlayed(prev => prev + 1);
    setSelectedGame(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'worship': return 'text-islamic-green bg-islamic-green/10';
      case 'knowledge': return 'text-blue-600 bg-blue-100';
      case 'history': return 'text-purple-600 bg-purple-100';
      case 'character': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateOverallStats = () => {
    const allStats = Object.values(gameStats);
    if (allStats.length === 0) return { averageScore: 0, totalQuestions: 0, totalCorrect: 0 };

    const totalQuestions = allStats.reduce((sum, stat) => sum + stat.totalQuestions, 0);
    const totalCorrect = allStats.reduce((sum, stat) => sum + stat.correctAnswers, 0);
    const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return { averageScore, totalQuestions, totalCorrect };
  };

  if (selectedGame) {
    const game = ISLAMIC_GAMES.find(g => g.id === selectedGame);
    if (game) {
      const GameComponent = game.component;
      return (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {game.icon}
                  <div>
                    <h3 className="font-semibold">{game.title}</h3>
                    <p className="text-sm text-muted-foreground">{game.category} • {game.difficulty}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedGame(null)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Back to Games
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <GameComponent 
            onGameComplete={(stats: GameStats) => handleGameComplete(selectedGame, stats)}
            childAge={userProfile?.age || 8}
          />
        </div>
      );
    }
  }

  const overallStats = calculateOverallStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green/5 via-white to-islamic-blue/5">
      <div className="container mx-auto p-4 space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-islamic-green to-islamic-blue text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Islamic Learning Games</h1>
                <p className="text-islamic-green-light">
                  Learn Islam through fun, interactive, and authentic educational games
                </p>
              </div>
              <div className="text-right">
                <div className="text-6xl">🎮</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {totalGamesPlayed > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Your Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-green-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{totalGamesPlayed}</div>
                    <div className="text-sm text-muted-foreground">Games Played</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{overallStats.averageScore}%</div>
                    <div className="text-sm text-muted-foreground">Average Score</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{overallStats.totalCorrect}</div>
                    <div className="text-sm text-muted-foreground">Total Correct</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-orange-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{overallStats.totalQuestions}</div>
                    <div className="text-sm text-muted-foreground">Questions Answered</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Available Games
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Coming Soon
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Available Games */}
          <TabsContent value="available" className="space-y-6">
            <div className="grid gap-6">
              {ISLAMIC_GAMES.map((game) => {
                const stats = gameStats[game.id];
                
                return (
                  <Card key={game.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-islamic-green/10 rounded-lg">
                              {game.icon}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold">{game.title}</h3>
                              <p className="text-muted-foreground">{game.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={getCategoryColor(game.category)}>
                              {game.category}
                            </Badge>
                            <Badge className={getDifficultyColor(game.difficulty)}>
                              {game.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {game.ageGroup}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {game.estimatedTime}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2 text-islamic-green">Learning Objectives:</h4>
                              <ul className="text-sm space-y-1">
                                {game.learningObjectives.map((objective, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <Star className="w-3 h-3 text-yellow-500" />
                                    {objective}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {stats && (
                              <div>
                                <h4 className="font-medium text-sm mb-2 text-islamic-green">Your Best Performance:</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Score:</span>
                                    <span className="font-medium">{stats.score}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Correct Answers:</span>
                                    <span className="font-medium">{stats.correctAnswers}/{stats.totalQuestions}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Time Spent:</span>
                                    <span className="font-medium">{Math.round(stats.timeSpent)}s</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-6 flex flex-col items-end gap-3">
                          <Button 
                            onClick={() => setSelectedGame(game.id)}
                            className="bg-islamic-green hover:bg-islamic-green/90"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {stats ? 'Play Again' : 'Start Game'}
                          </Button>
                          
                          {stats && (
                            <div className="text-center">
                              <div className="text-2xl mb-1">
                                {stats.score >= 80 ? '🏆' : stats.score >= 60 ? '⭐' : '📚'}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {stats.score >= 80 ? 'Mastered' : stats.score >= 60 ? 'Good' : 'Learning'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Coming Soon Games */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid gap-4">
              {UPCOMING_GAMES.map((game, index) => (
                <Card key={index} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-muted rounded-lg">
                          {game.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{game.title}</h3>
                          <p className="text-muted-foreground">{game.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {game.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-islamic-green/5">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-islamic-green mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">More Games Coming Soon!</h3>
                <p className="text-muted-foreground">
                  We're working on exciting new Islamic learning games. Stay tuned for updates!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-yellow-50">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">🥇</div>
                  <div className="font-medium">First Game</div>
                  <div className="text-sm text-muted-foreground">Complete your first game</div>
                  {totalGamesPlayed > 0 && (
                    <Badge className="mt-2 bg-green-100 text-green-700">Earned!</Badge>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">📚</div>
                  <div className="font-medium">Scholar</div>
                  <div className="text-sm text-muted-foreground">Score 80% or higher</div>
                  {overallStats.averageScore >= 80 && (
                    <Badge className="mt-2 bg-green-100 text-green-700">Earned!</Badge>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="font-medium">Dedicated</div>
                  <div className="text-sm text-muted-foreground">Play 5 games</div>
                  {totalGamesPlayed >= 5 && (
                    <Badge className="mt-2 bg-green-100 text-green-700">Earned!</Badge>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="font-medium">All-Rounder</div>
                  <div className="text-sm text-muted-foreground">Try all game types</div>
                  {Object.keys(gameStats).length >= ISLAMIC_GAMES.length && (
                    <Badge className="mt-2 bg-green-100 text-green-700">Earned!</Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            {totalGamesPlayed === 0 && (
              <Card className="bg-islamic-green/5">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-islamic-green mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start Your Learning Journey!</h3>
                  <p className="text-muted-foreground">
                    Play Islamic learning games to unlock achievements and track your progress.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IslamicLearningGames;
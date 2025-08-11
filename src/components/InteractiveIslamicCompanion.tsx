import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  Heart, 
  Zap, 
  Star, 
  Calendar,
  Trophy,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CompanionData {
  type: 'angel' | 'pet' | 'wizard';
  name: string;
  personality: string;
  level: number;
  happiness: number;
  energy: number;
}

interface Message {
  id: string;
  type: 'child' | 'companion';
  content: string;
  timestamp: Date;
  personality: string;
}

interface InteractiveIslamicCompanionProps {
  companion: CompanionData;
  childId: string;
  childName: string;
  recentActivity?: any[];
  points: number;
  streak: number;
  onInteract?: (action: string) => void;
}

const COMPANION_EMOJIS = {
  angel: '😇',
  pet: '🐱',
  wizard: '🧙‍♂️'
};

const PERSONALITY_COLORS = {
  angel: 'from-blue-100 to-purple-100 border-blue-200',
  pet: 'from-green-100 to-yellow-100 border-green-200', 
  wizard: 'from-purple-100 to-indigo-100 border-purple-200'
};

const InteractiveIslamicCompanion: React.FC<InteractiveIslamicCompanionProps> = ({
  companion,
  childId,
  childName,
  recentActivity = [],
  points,
  streak,
  onInteract
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyMessage, setDailyMessage] = useState('');
  const [dailyChallenge, setDailyChallenge] = useState('');
  const [loadingDaily, setLoadingDaily] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
    loadDailyContent();
  }, [childId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('companion_conversations')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const formattedMessages: Message[] = data.map(conv => ({
        id: conv.id,
        type: conv.message_type as 'child' | 'companion',
        content: conv.message_content,
        timestamp: new Date(conv.created_at),
        personality: conv.companion_personality
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const loadDailyContent = async () => {
    setLoadingDaily(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('companion_daily_content')
        .select('*')
        .eq('child_id', childId)
        .eq('date_created', today)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const todayMessage = data.find(item => item.content_type === 'milestone_message');
      const todayChallenge = data.find(item => item.content_type === 'daily_challenge');

      if (todayMessage) {
        setDailyMessage(todayMessage.content_text);
      } else {
        // Generate daily message if none exists
        generateDailyContent('daily_message');
      }

      if (todayChallenge) {
        setDailyChallenge(todayChallenge.content_text);
      }
    } catch (error) {
      console.error('Error loading daily content:', error);
    } finally {
      setLoadingDaily(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'child',
      content: userMessage,
      timestamp: new Date(),
      personality: companion.type
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Get child's age for context
      const birthYear = new Date().getFullYear() - 10; // Default age if not available
      
      const { data, error } = await supabase.functions.invoke('ai-companion', {
        body: {
          childId,
          message: userMessage,
          interactionType: 'chat',
          context: {
            recentActivities: recentActivity,
            currentStreak: streak,
            totalPoints: points,
            age: new Date().getFullYear() - birthYear
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        const companionMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'companion',
          content: data.response,
          timestamp: new Date(),
          personality: data.personality
        };
        setMessages(prev => [...prev, companionMessage]);
      } else {
        throw new Error(data.error || 'Failed to get companion response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyContent = async (type: 'daily_message' | 'challenge') => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-companion', {
        body: {
          childId,
          interactionType: type,
          context: {
            currentStreak: streak,
            totalPoints: points,
            recentActivities: recentActivity
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        if (type === 'daily_message') {
          setDailyMessage(data.response);
        } else {
          setDailyChallenge(data.response);
        }
        
        toast({
          title: "Success!",
          description: `New ${type === 'daily_message' ? 'daily message' : 'challenge'} generated!`,
        });
      }
    } catch (error) {
      console.error('Error generating daily content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const celebrateAchievement = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-companion', {
        body: {
          childId,
          interactionType: 'achievement',
          context: {
            currentStreak: streak,
            totalPoints: points,
            recentActivities: recentActivity
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        const celebrationMessage: Message = {
          id: Date.now().toString(),
          type: 'companion',
          content: data.response,
          timestamp: new Date(),
          personality: data.personality
        };
        setMessages(prev => [...prev, celebrationMessage]);
        
        onInteract?.('celebration');
      }
    } catch (error) {
      console.error('Error celebrating achievement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={`shadow-lg bg-gradient-to-br ${PERSONALITY_COLORS[companion.type]}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-bounce">
              {COMPANION_EMOJIS[companion.type]}
            </div>
            <div>
              <CardTitle className="text-xl">
                {companion.name} is here! 🌟
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your Islamic learning companion
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <Heart className="w-3 h-3" />
              {companion.happiness}%
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              {companion.energy}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            {/* Chat Interface */}
            <div className="space-y-4">
              <ScrollArea className="h-64 p-4 bg-white/50 rounded-lg" ref={scrollAreaRef}>
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Start a conversation with {companion.name}!</p>
                    <p className="text-xs">Ask about Islam, share your day, or get guidance</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'child' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'child'
                              ? 'bg-islamic-green text-white'
                              : 'bg-white border shadow-sm'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border shadow-sm p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">{companion.name} is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${companion.name} anything about Islam...`}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="bg-islamic-green hover:bg-islamic-green/90"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            {/* Daily Content */}
            <div className="space-y-4">
              {/* Daily Message */}
              <Card className="bg-white/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-islamic-gold" />
                    Daily Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingDaily ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading daily message...</span>
                    </div>
                  ) : dailyMessage ? (
                    <p className="text-sm">{dailyMessage}</p>
                  ) : (
                    <div className="text-center py-4">
                      <Button 
                        onClick={() => generateDailyContent('daily_message')}
                        className="bg-islamic-green hover:bg-islamic-green/90"
                      >
                        Get Today's Message
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Daily Challenge */}
              <Card className="bg-white/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-islamic-coral" />
                    Daily Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyChallenge ? (
                    <p className="text-sm">{dailyChallenge}</p>
                  ) : (
                    <div className="text-center py-4">
                      <Button 
                        onClick={() => generateDailyContent('challenge')}
                        variant="outline"
                      >
                        Get Today's Challenge
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            {/* Quick Activities */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={celebrateAchievement}
                disabled={isLoading}
                className="bg-islamic-gold hover:bg-islamic-gold/90 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Celebrate!
              </Button>
              <Button
                onClick={() => onInteract?.('stats')}
                variant="outline"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Stats
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-islamic-green">{points}</div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
              <div className="bg-white/50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-islamic-coral">{streak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InteractiveIslamicCompanion;
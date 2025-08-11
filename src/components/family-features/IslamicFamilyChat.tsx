import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Heart, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface IslamicFamilyChatProps {
  familyId: string;
  userRole: 'parent' | 'child';
  userId: string;
  childrenData: any[];
}

interface Message {
  id: string;
  sender_id: string;
  message_content: string;
  islamic_expressions: any;
  created_at: string;
  islamic_etiquette_score: number;
}

const IslamicFamilyChat = ({ familyId, userRole, userId, childrenData }: IslamicFamilyChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [familyId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('islamic_family_messages')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages((data || []).map(item => ({
        ...item,
        islamic_expressions: Array.isArray(item.islamic_expressions) ? item.islamic_expressions : []
      })));
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('islamic_family_messages')
        .insert({
          family_id: familyId,
          sender_id: userId,
          recipient_ids: childrenData.map(c => c.id),
          message_content: newMessage,
          is_family_wide: true,
          islamic_etiquette_score: 10
        });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      setNewMessage('');
      fetchMessages();
      
      toast({
        title: "Message Sent! 💌",
        description: "Your message has been shared with the family."
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-24 bg-muted rounded-lg"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-islamic-coral" />
          Islamic Family Chat
        </h3>
        <p className="text-sm text-muted-foreground">
          Communicate with Islamic etiquette and respectful expressions
        </p>
      </div>

      <Card className="h-96 flex flex-col">
        <CardContent className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-2">
                <div className="flex-1 bg-islamic-cream/30 rounded-lg p-3">
                  <p className="text-sm">{message.message_content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Etiquette: {message.islamic_etiquette_score}/10
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a respectful message... (use Islamic expressions like Bismillah, Alhamdulillah)"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IslamicFamilyChat;
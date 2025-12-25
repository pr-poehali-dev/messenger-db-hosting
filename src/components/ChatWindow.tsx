import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const API_CHATS = 'https://functions.poehali.dev/1d050145-4cf7-4100-9ec8-b27a320f4307';

type User = {
  id: number;
  username: string;
  avatar_url: string;
};

type Message = {
  id: number;
  sender_id: number;
  message_text: string;
  created_at: string;
  username: string;
  avatar_url: string;
};

type ChatWindowProps = {
  chatId: number | null;
  otherUser: User | null;
  currentUserId: number;
  onBack: () => void;
};

const ChatWindow = ({ chatId, otherUser, currentUserId, onBack }: ChatWindowProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (chatId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  const loadMessages = async () => {
    if (!chatId) return;
    
    try {
      const response = await fetch(API_CHATS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId.toString(),
        },
        body: JSON.stringify({
          action: 'get_messages',
          chat_id: chatId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_CHATS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId.toString(),
        },
        body: JSON.stringify({
          action: 'send_message',
          chat_id: chatId,
          message_text: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await loadMessages();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось отправить сообщение',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center">
            <Icon name="MessageSquare" size={64} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Выберите чат</h2>
          <p className="text-muted-foreground">Начните общение с пользователями</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            onClick={onBack}
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser.avatar_url} />
            <AvatarFallback>{otherUser.username[0]}</AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-semibold">@{otherUser.username}</h3>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary hover:text-primary-foreground"
          >
            <Icon name="Phone" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-secondary hover:text-secondary-foreground"
          >
            <Icon name="Video" size={20} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => {
            const isMe = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-slide-up',
                  isMe ? 'justify-end' : 'justify-start'
                )}
              >
                {!isMe && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.avatar_url} />
                    <AvatarFallback>{message.username[0]}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    'max-w-md rounded-2xl px-4 py-2.5',
                    isMe
                      ? 'gradient-primary text-white'
                      : 'bg-muted text-foreground'
                  )}
                >
                  <p className="text-sm">{message.message_text}</p>
                  <span
                    className={cn(
                      'text-xs block mt-1',
                      isMe ? 'text-white/70' : 'text-muted-foreground'
                    )}
                  >
                    {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {isMe && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.avatar_url} />
                    <AvatarFallback>{message.username[0]}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary hover:text-primary-foreground"
          >
            <Icon name="Paperclip" size={20} />
          </Button>

          <Input
            placeholder="Написать сообщение..."
            className="flex-1 rounded-full bg-muted border-0 px-6"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading}
          />

          <Button
            size="icon"
            className="rounded-full gradient-primary text-white hover:opacity-90"
            onClick={handleSendMessage}
            disabled={isLoading || !newMessage.trim()}
          >
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type Message = {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
};

type Chat = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

type Contact = {
  id: number;
  name: string;
  avatar: string;
  status: string;
  online: boolean;
};

const mockChats: Chat[] = [
  {
    id: 1,
    name: 'Анна Смирнова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    lastMessage: 'Привет! Как дела?',
    time: '14:23',
    unread: 3,
    online: true,
  },
  {
    id: 2,
    name: 'Дмитрий Иванов',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry',
    lastMessage: 'Отправил документы',
    time: '12:15',
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: 'Елена Петрова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    lastMessage: 'Созвонимся завтра?',
    time: 'Вчера',
    unread: 1,
    online: true,
  },
  {
    id: 4,
    name: 'Команда разработки',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Team',
    lastMessage: 'Новая задача в бэклоге',
    time: 'Вчера',
    unread: 0,
    online: false,
  },
];

const mockContacts: Contact[] = [
  {
    id: 1,
    name: 'Анна Смирнова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    status: 'В сети',
    online: true,
  },
  {
    id: 2,
    name: 'Дмитрий Иванов',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry',
    status: 'Был в сети 2 часа назад',
    online: false,
  },
  {
    id: 3,
    name: 'Елена Петрова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    status: 'В сети',
    online: true,
  },
  {
    id: 4,
    name: 'Сергей Козлов',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey',
    status: 'Был в сети вчера',
    online: false,
  },
  {
    id: 5,
    name: 'Мария Волкова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    status: 'В сети',
    online: true,
  },
];

const mockMessages: Message[] = [
  { id: 1, text: 'Привет! Как дела?', sender: 'other', time: '14:20' },
  { id: 2, text: 'Привет! Всё отлично, спасибо!', sender: 'me', time: '14:21' },
  { id: 3, text: 'Что нового?', sender: 'other', time: '14:22' },
  { id: 4, text: 'Работаю над новым проектом', sender: 'me', time: '14:22' },
  { id: 5, text: 'Звучит интересно! Расскажешь подробнее?', sender: 'other', time: '14:23' },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState<'chats' | 'contacts' | 'profile' | 'settings'>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(mockChats[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'me',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const filteredChats = mockChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = mockContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-6">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-xl">
          M
        </div>

        <Separator className="w-12" />

        <nav className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'w-12 h-12 rounded-xl transition-all',
              activeSection === 'chats' && 'bg-primary text-primary-foreground'
            )}
            onClick={() => setActiveSection('chats')}
          >
            <Icon name="MessageSquare" size={24} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'w-12 h-12 rounded-xl transition-all',
              activeSection === 'contacts' && 'bg-primary text-primary-foreground'
            )}
            onClick={() => setActiveSection('contacts')}
          >
            <Icon name="Users" size={24} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'w-12 h-12 rounded-xl transition-all',
              activeSection === 'profile' && 'bg-primary text-primary-foreground'
            )}
            onClick={() => setActiveSection('profile')}
          >
            <Icon name="User" size={24} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'w-12 h-12 rounded-xl transition-all',
              activeSection === 'settings' && 'bg-primary text-primary-foreground'
            )}
            onClick={() => setActiveSection('settings')}
          >
            <Icon name="Settings" size={24} />
          </Button>
        </nav>

        <div className="mt-auto">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-xl transition-all hover:bg-destructive hover:text-destructive-foreground"
          >
            <Icon name="LogOut" size={24} />
          </Button>
        </div>
      </aside>

      <div className="w-96 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {activeSection === 'chats' && 'Чаты'}
            {activeSection === 'contacts' && 'Контакты'}
            {activeSection === 'profile' && 'Профиль'}
            {activeSection === 'settings' && 'Настройки'}
          </h2>

          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              className="pl-10 bg-background border-border rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {activeSection === 'chats' && (
            <div className="p-2">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  className={cn(
                    'w-full p-3 rounded-xl flex items-center gap-3 transition-all hover:bg-muted mb-2 animate-fade-in',
                    selectedChat?.id === chat.id && 'bg-muted'
                  )}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                    )}
                  </div>

                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-sm">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>

                  {chat.unread > 0 && (
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {chat.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {activeSection === 'contacts' && (
            <div className="p-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="w-full p-3 rounded-xl flex items-center gap-3 transition-all hover:bg-muted mb-2 animate-fade-in"
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                    )}
                  </div>

                  <div className="flex-1 text-left overflow-hidden">
                    <h3 className="font-semibold text-sm mb-1">{contact.name}</h3>
                    <p className="text-xs text-muted-foreground">{contact.status}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon name="MessageCircle" size={18} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="p-6 animate-fade-in">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" />
                    <AvatarFallback>Я</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-card"></span>
                </div>
                <h3 className="text-xl font-bold">Вы</h3>
                <p className="text-sm text-muted-foreground">@your_username</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Phone" size={18} className="text-primary" />
                    <span className="text-sm font-medium">Телефон</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">+7 999 123 45 67</p>
                </div>

                <div className="p-4 rounded-xl bg-muted">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Mail" size={18} className="text-secondary" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">user@example.com</p>
                </div>

                <div className="p-4 rounded-xl bg-muted">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Info" size={18} className="text-accent" />
                    <span className="text-sm font-medium">О себе</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">Люблю путешествовать и программировать</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="p-4 space-y-2 animate-fade-in">
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12">
                <Icon name="Bell" size={20} className="text-primary" />
                Уведомления
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12">
                <Icon name="Lock" size={20} className="text-secondary" />
                Приватность
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12">
                <Icon name="Palette" size={20} className="text-accent" />
                Тема оформления
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12">
                <Icon name="Languages" size={20} className="text-primary" />
                Язык
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12">
                <Icon name="Shield" size={20} className="text-secondary" />
                Безопасность
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12">
                <Icon name="HardDrive" size={20} className="text-accent" />
                Данные и хранилище
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="h-16 border-b border-border flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                  </Avatar>
                  {selectedChat.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedChat.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat.online ? 'В сети' : 'Не в сети'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Icon name="Phone" size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-secondary hover:text-secondary-foreground transition-all"
                >
                  <Icon name="Video" size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <Icon name="MoreVertical" size={20} />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3 animate-slide-up',
                      message.sender === 'me' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.sender === 'other' && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedChat.avatar} />
                        <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        'max-w-md rounded-2xl px-4 py-2.5',
                        message.sender === 'me'
                          ? 'gradient-primary text-white'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className={cn(
                        'text-xs block mt-1',
                        message.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'
                      )}>
                        {message.time}
                      </span>
                    </div>

                    {message.sender === 'me' && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" />
                        <AvatarFallback>Я</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Icon name="Paperclip" size={20} />
                </Button>

                <Input
                  placeholder="Написать сообщение..."
                  className="flex-1 rounded-full bg-muted border-0 px-6"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />

                <Button
                  size="icon"
                  className="rounded-full gradient-primary text-white hover:opacity-90 transition-all"
                  onClick={handleSendMessage}
                >
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center">
                <Icon name="MessageSquare" size={64} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Выберите чат</h2>
              <p className="text-muted-foreground">Начните общение с друзьями</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

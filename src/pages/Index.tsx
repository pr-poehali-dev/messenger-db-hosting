import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '@/components/AuthForm';
import Sidebar from '@/components/Sidebar';
import ContentPanel from '@/components/ContentPanel';
import MainContent from '@/components/MainContent';
import MusicPlayer from '@/components/MusicPlayer';
import ChatWindow from '@/components/ChatWindow';

const API_USERS = 'https://functions.poehali.dev/82e3dcce-7cee-4400-acc2-c03735e35795';
const API_CHATS = 'https://functions.poehali.dev/1d050145-4cf7-4100-9ec8-b27a320f4307';

type User = {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  status: string;
};

type SearchedUser = {
  id: number;
  username: string;
  avatar_url: string;
  status: string;
  online: boolean;
};

const Index = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');

  const [activeSection, setActiveSection] = useState<'chats' | 'contacts' | 'profile' | 'settings' | 'music'>('contacts');
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<SearchedUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(`${API_USERS}?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      toast({
        title: 'Ошибка поиска',
        description: 'Не удалось найти пользователей',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAuthSuccess = (newToken: string, user: User) => {
    setToken(newToken);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: 'Выход выполнен',
      description: 'До скорой встречи!',
    });
  };

  const handleStartChat = async (user: SearchedUser) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(API_CHATS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          action: 'create_or_get',
          other_user_id: user.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSelectedChatId(data.chat_id);
        setSelectedChatUser(user);
        setActiveSection('chats');
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать чат',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать чат',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        onLogout={handleLogout} 
      />
      
      {activeSection !== 'music' && (
        <ContentPanel
          activeSection={activeSection}
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          onStartChat={handleStartChat}
        />
      )}
      
      {activeSection === 'music' ? (
        <MusicPlayer />
      ) : activeSection === 'chats' ? (
        <ChatWindow
          chatId={selectedChatId}
          otherUser={selectedChatUser}
          currentUserId={currentUser?.id || 0}
          onBack={() => setActiveSection('contacts')}
        />
      ) : (
        <MainContent />
      )}
    </div>
  );
};

export default Index;
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '@/components/AuthForm';
import Sidebar from '@/components/Sidebar';
import ContentPanel from '@/components/ContentPanel';
import MainContent from '@/components/MainContent';

const API_USERS = 'https://functions.poehali.dev/82e3dcce-7cee-4400-acc2-c03735e35795';

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

  const [activeSection, setActiveSection] = useState<'chats' | 'contacts' | 'profile' | 'settings'>('contacts');
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
      
      <ContentPanel
        activeSection={activeSection}
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
      />
      
      <MainContent />
    </div>
  );
};

export default Index;

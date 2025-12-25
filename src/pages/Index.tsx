import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const API_AUTH = 'https://functions.poehali.dev/4180a42c-eacb-4992-b4dd-c3cfc8892b95';
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
  const [showLogin, setShowLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: 'Добро пожаловать!',
          description: `Вы вошли как ${data.user.username}`,
        });
      } else {
        toast({
          title: 'Ошибка входа',
          description: data.error || 'Проверьте email и пароль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить вход',
        variant: 'destructive',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: registerEmail,
          username: registerUsername,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: 'Регистрация успешна!',
          description: `Добро пожаловать, ${data.user.username}!`,
        });
      } else {
        toast({
          title: 'Ошибка регистрации',
          description: data.error || 'Проверьте введенные данные',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить регистрацию',
        variant: 'destructive',
      });
    }
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-3xl">
              M
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {showLogin ? 'Вход' : 'Регистрация'}
            </CardTitle>
            <CardDescription>
              {showLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {showLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>

                <Button type="submit" className="w-full rounded-xl gradient-primary text-white hover:opacity-90">
                  Войти
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-xl"
                  onClick={() => setShowLogin(false)}
                >
                  Нет аккаунта? Зарегистрироваться
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-username">Никнейм</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="username"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={50}
                    className="rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Пароль</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                    className="rounded-xl"
                  />
                </div>

                <Button type="submit" className="w-full rounded-xl gradient-primary text-white hover:opacity-90">
                  Зарегистрироваться
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-xl"
                  onClick={() => setShowLogin(true)}
                >
                  Уже есть аккаунт? Войти
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
            onClick={handleLogout}
          >
            <Icon name="LogOut" size={24} />
          </Button>
        </div>
      </aside>

      <div className="w-96 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {activeSection === 'contacts' && 'Поиск пользователей'}
            {activeSection === 'profile' && 'Профиль'}
            {activeSection === 'settings' && 'Настройки'}
          </h2>

          {activeSection === 'contacts' && (
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Найти по нику..."
                className="pl-10 bg-background border-border rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          {activeSection === 'contacts' && (
            <div className="p-2">
              {isSearching ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
                  Поиск...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="w-full p-3 rounded-xl flex items-center gap-3 transition-all hover:bg-muted mb-2 animate-fade-in"
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                      </Avatar>
                      {user.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                      )}
                    </div>

                    <div className="flex-1 text-left overflow-hidden">
                      <h3 className="font-semibold text-sm mb-1">@{user.username}</h3>
                      <p className="text-xs text-muted-foreground truncate">{user.status}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-primary hover:text-primary-foreground"
                    >
                      <Icon name="MessageCircle" size={18} />
                    </Button>
                  </div>
                ))
              ) : searchQuery.length >= 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="UserX" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Пользователи не найдены</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Search" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Начните вводить никнейм</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'profile' && currentUser && (
            <div className="p-6 animate-fade-in">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={currentUser.avatar_url} />
                    <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-card"></span>
                </div>
                <h3 className="text-xl font-bold">{currentUser.username}</h3>
                <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Mail" size={18} className="text-secondary" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">{currentUser.email}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Info" size={18} className="text-accent" />
                    <span className="text-sm font-medium">Статус</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">{currentUser.status}</p>
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
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center">
            <Icon name="MessageSquare" size={64} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Найдите собеседника</h2>
          <p className="text-muted-foreground">Используйте поиск, чтобы найти пользователей</p>
        </div>
      </div>
    </div>
  );
};

export default Index;

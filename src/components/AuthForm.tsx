import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const API_AUTH = 'https://functions.poehali.dev/4180a42c-eacb-4992-b4dd-c3cfc8892b95';

type User = {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  status: string;
};

type AuthFormProps = {
  onAuthSuccess: (token: string, user: User) => void;
};

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const { toast } = useToast();
  const [showLogin, setShowLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

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
        onAuthSuccess(data.token, data.user);
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
    
    const latinOnlyRegex = /^[a-zA-Z0-9_.-]+$/;
    
    if (!latinOnlyRegex.test(registerUsername)) {
      toast({
        title: 'Ошибка валидации',
        description: 'Никнейм должен содержать только английские буквы, цифры и символы _ . -',
        variant: 'destructive',
      });
      return;
    }
    
    if (!latinOnlyRegex.test(registerPassword)) {
      toast({
        title: 'Ошибка валидации',
        description: 'Пароль должен содержать только английские буквы, цифры и символы',
        variant: 'destructive',
      });
      return;
    }
    
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
        onAuthSuccess(data.token, data.user);
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
                <Label htmlFor="register-username">Никнейм (только английские буквы)</Label>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={50}
                  pattern="[a-zA-Z0-9_.-]+"
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль (только английские буквы)</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={6}
                  pattern="[a-zA-Z0-9_.-]+"
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
};

export default AuthForm;
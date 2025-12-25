import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

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

type ContentPanelProps = {
  activeSection: 'chats' | 'contacts' | 'profile' | 'settings' | 'music';
  currentUser: User | null;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: SearchedUser[];
  isSearching: boolean;
  onStartChat: (user: SearchedUser) => void;
};

const ContentPanel = ({
  activeSection,
  currentUser,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  isSearching,
  onStartChat,
}: ContentPanelProps) => {
  return (
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
              onChange={(e) => onSearchQueryChange(e.target.value)}
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
                    onClick={() => onStartChat(user)}
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
  );
};

export default ContentPanel;
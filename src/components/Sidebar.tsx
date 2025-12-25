import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type SidebarProps = {
  activeSection: 'chats' | 'contacts' | 'profile' | 'settings';
  onSectionChange: (section: 'chats' | 'contacts' | 'profile' | 'settings') => void;
  onLogout: () => void;
};

const Sidebar = ({ activeSection, onSectionChange, onLogout }: SidebarProps) => {
  return (
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
          onClick={() => onSectionChange('contacts')}
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
          onClick={() => onSectionChange('profile')}
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
          onClick={() => onSectionChange('settings')}
        >
          <Icon name="Settings" size={24} />
        </Button>
      </nav>

      <div className="mt-auto">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-xl transition-all hover:bg-destructive hover:text-destructive-foreground"
          onClick={onLogout}
        >
          <Icon name="LogOut" size={24} />
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;

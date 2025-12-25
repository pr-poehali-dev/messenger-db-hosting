import Icon from '@/components/ui/icon';

const MainContent = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center">
          <Icon name="MessageSquare" size={64} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Найдите собеседника</h2>
        <p className="text-muted-foreground">Используйте поиск, чтобы найти пользователей</p>
      </div>
    </div>
  );
};

export default MainContent;

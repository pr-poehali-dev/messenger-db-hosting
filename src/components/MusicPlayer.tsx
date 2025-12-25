import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type Track = {
  id: number;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail: string;
};

const tracks: Track[] = [
  {
    id: 1,
    title: 'Martin Rolse',
    artist: 'madk1d',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  },
  {
    id: 2,
    title: 'Белые розы',
    artist: 'Юрий Шатунов',
    youtubeId: '3hWPHpXIJM4',
    thumbnail: 'https://i.ytimg.com/vi/3hWPHpXIJM4/mqdefault.jpg',
  },
  {
    id: 3,
    title: 'Миллион алых роз',
    artist: 'Алла Пугачёва',
    youtubeId: 'aVq6qzJL8jM',
    thumbnail: 'https://i.ytimg.com/vi/aVq6qzJL8jM/mqdefault.jpg',
  },
];

const MusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const previousIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[previousIndex]);
    setIsPlaying(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-6 border-b border-border">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Музыка
        </h1>
        <p className="text-muted-foreground mt-2">Ваша персональная коллекция</p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="grid gap-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={cn(
                'p-4 rounded-xl border transition-all hover:bg-muted cursor-pointer animate-fade-in',
                currentTrack?.id === track.id && 'bg-muted border-primary'
              )}
              onClick={() => handlePlayTrack(track)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  {currentTrack?.id === track.id && isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                      <Icon name="Music" size={24} className="text-white animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{track.title}</h3>
                  <p className="text-sm text-muted-foreground">{track.artist}</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack(track);
                  }}
                >
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Icon name="Pause" size={24} />
                  ) : (
                    <Icon name="Play" size={24} />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {currentTrack && (
        <div className="border-t border-border p-6 bg-card">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{currentTrack.title}</h3>
              <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted"
              onClick={handlePrevious}
            >
              <Icon name="SkipBack" size={24} />
            </Button>

            <Button
              size="icon"
              className="w-14 h-14 rounded-full gradient-primary text-white hover:opacity-90"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Icon name="Pause" size={28} /> : <Icon name="Play" size={28} />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted"
              onClick={handleNext}
            >
              <Icon name="SkipForward" size={24} />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Icon name="Volume2" size={20} className="text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-10 text-right">{volume[0]}%</span>
          </div>

          {isPlaying && (
            <div className="mt-4 p-4 rounded-lg bg-muted">
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&controls=0&showinfo=0&rel=0`}
                  title={currentTrack.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="border-0"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;

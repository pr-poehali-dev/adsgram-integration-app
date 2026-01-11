import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type Movie = {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  poster: string;
  watched: boolean;
};

declare global {
  interface Window {
    Adsgram?: {
      init: (config: { blockId: string; debug?: boolean }) => {
        show: () => Promise<{ done: boolean; state: string; error?: boolean; }>;
      };
    };
  }
}

export default function Index() {
  const [movies, setMovies] = useState<Movie[]>([
    { id: 1, title: 'Побег из Шоушенка', year: 1994, rating: 9.3, genre: 'Драма', poster: '🎬', watched: false },
    { id: 2, title: 'Крёстный отец', year: 1972, rating: 9.2, genre: 'Криминал', poster: '🎭', watched: false },
    { id: 3, title: 'Тёмный рыцарь', year: 2008, rating: 9.0, genre: 'Боевик', poster: '🦇', watched: false },
    { id: 4, title: 'Список Шиндлера', year: 1993, rating: 8.9, genre: 'Драма', poster: '🎞️', watched: false },
    { id: 5, title: 'Форрест Гамп', year: 1994, rating: 8.8, genre: 'Драма', poster: '🏃', watched: false },
    { id: 6, title: 'Начало', year: 2010, rating: 8.8, genre: 'Фантастика', poster: '🌀', watched: false },
  ]);
  const [watchedCount, setWatchedCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Все');
  const [adsgramController, setAdsgramController] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sad.adsgram.ai/js/sad.min.js';
    script.async = true;
    script.onload = () => {
      if (window.Adsgram) {
        const controller = window.Adsgram.init({ blockId: '19930' });
        setAdsgramController(controller);
      }
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://sad.adsgram.ai/js/sad.min.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handleWatchMovie = async (movieId: number) => {
    if (!adsgramController) {
      toast({
        title: '⚠️ Подождите',
        description: 'Загружаем рекламу...',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await adsgramController.show();
      
      if (result.done) {
        setMovies(prev => prev.map(m => 
          m.id === movieId ? { ...m, watched: true } : m
        ));
        setWatchedCount(prev => prev + 1);
        const reward = 0.0001;
        setBalance(prev => prev + reward);
        
        toast({
          title: '🎉 Отлично!',
          description: `Фильм отмечен как просмотренный. +${reward} TON`,
        });
      } else if (result.error) {
        toast({
          title: '❌ Ошибка',
          description: 'Не удалось показать рекламу',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Произошла ошибка при загрузке рекламы',
        variant: 'destructive',
      });
    }
  };

  const genres = ['Все', ...Array.from(new Set(movies.map(m => m.genre)))];

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'Все' || movie.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0A1F] via-[#1A1333] to-[#0F0A1F] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">🎬 CinemaTracker</h1>
          <p className="text-muted-foreground">Отслеживай просмотренные фильмы и зарабатывай TON</p>
        </div>

        <Card className="gradient-primary p-6 text-center border-0 shadow-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/80 text-sm uppercase tracking-wider">Просмотрено</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Icon name="Film" className="text-yellow-300" size={24} />
                <h2 className="text-3xl font-bold text-white">{watchedCount}</h2>
              </div>
            </div>
            <div>
              <p className="text-white/80 text-sm uppercase tracking-wider">Баланс</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Icon name="Coins" className="text-yellow-300" size={24} />
                <h2 className="text-3xl font-bold text-white">{balance.toFixed(4)}</h2>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="space-y-4">
            <Input
              placeholder="Поиск фильмов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            
            <div className="flex gap-2 flex-wrap">
              {genres.map(genre => (
                <Badge
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          {filteredMovies.map(movie => (
            <Card key={movie.id} className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{movie.poster}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{movie.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{movie.year}</span>
                        <span>•</span>
                        <span>{movie.genre}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Icon name="Star" className="text-yellow-500" size={14} />
                          <span>{movie.rating}</span>
                        </div>
                      </div>
                    </div>
                    {movie.watched && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-500 border-green-500/50">
                        <Icon name="Check" size={14} className="mr-1" />
                        Просмотрен
                      </Badge>
                    )}
                  </div>
                  
                  {!movie.watched && (
                    <Button
                      onClick={() => handleWatchMovie(movie.id)}
                      className="w-full gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Icon name="Play" className="mr-2" size={16} />
                      Отметить как просмотренный
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border/50">
            <Icon name="Film" className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">Фильмы не найдены</p>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type TabType = 'home' | 'ads' | 'wallet' | 'profile';

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [adsWatched, setAdsWatched] = useState(0);
  const [canWatchAd, setCanWatchAd] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !canWatchAd) {
      setCanWatchAd(true);
    }
  }, [timeLeft, canWatchAd]);

  const handleWatchAd = () => {
    setIsWatching(true);
    
    setTimeout(() => {
      const reward = 0.0001;
      setBalance(prev => prev + reward);
      setTotalEarned(prev => prev + reward);
      setAdsWatched(prev => prev + 1);
      setCanWatchAd(false);
      setTimeLeft(60);
      setIsWatching(false);
      
      toast({
        title: '🎉 Награда получена!',
        description: `+${reward} TON добавлено на баланс`,
      });
    }, 3000);
  };

  const handleConnectWallet = () => {
    setWalletConnected(true);
    toast({
      title: '✅ Кошелек подключен',
      description: 'TON Wallet успешно подключен',
    });
  };

  const handleWithdraw = () => {
    if (balance >= 0.001) {
      toast({
        title: '💸 Вывод инициирован',
        description: `${balance.toFixed(4)} TON отправлено на ваш кошелек`,
      });
      setBalance(0);
    } else {
      toast({
        title: '⚠️ Недостаточно средств',
        description: 'Минимальная сумма для вывода: 0.001 TON',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0A1F] via-[#1A1333] to-[#0F0A1F] pb-24">
      {activeTab === 'home' && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold gradient-text">TonAds</h1>
            <p className="text-muted-foreground">Смотри рекламу — получай TON</p>
          </div>

          <Card className="gradient-primary p-8 text-center border-0 shadow-2xl">
            <div className="space-y-2">
              <p className="text-white/80 text-sm uppercase tracking-wider">Твой баланс</p>
              <div className="flex items-center justify-center gap-2">
                <Icon name="Coins" className="text-yellow-300" size={32} />
                <h2 className="text-5xl font-bold text-white">{balance.toFixed(4)}</h2>
                <span className="text-2xl text-white/90">TON</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Play" className="text-accent" size={24} />
                <h3 className="text-lg font-semibold">Смотри рекламу</h3>
              </div>
              {!canWatchAd && (
                <Badge variant="secondary" className="bg-muted">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Получай 0.0001 TON за каждый просмотр
            </p>
            
            {!canWatchAd && (
              <Progress value={(60 - timeLeft) / 60 * 100} className="mb-4" />
            )}
            
            <Button
              onClick={handleWatchAd}
              disabled={!canWatchAd || isWatching}
              className="w-full gradient-primary text-white font-semibold py-6 text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isWatching ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                  Идет просмотр...
                </>
              ) : canWatchAd ? (
                <>
                  <Icon name="Play" className="mr-2" size={20} />
                  Смотреть рекламу
                </>
              ) : (
                <>
                  <Icon name="Clock" className="mr-2" size={20} />
                  Доступно через {timeLeft}с
                </>
              )}
            </Button>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
              <Icon name="Eye" className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-2xl font-bold">{adsWatched}</p>
              <p className="text-xs text-muted-foreground">Просмотров</p>
            </Card>
            <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
              <Icon name="TrendingUp" className="mx-auto mb-2 text-accent" size={24} />
              <p className="text-2xl font-bold">{totalEarned.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">Заработано</p>
            </Card>
            <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
              <Icon name="Zap" className="mx-auto mb-2 text-secondary" size={24} />
              <p className="text-2xl font-bold">{(adsWatched * 0.0001).toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">Доход</p>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl gradient-primary">
              <Icon name="Video" className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Реклама</h2>
              <p className="text-sm text-muted-foreground">Просматривай и зарабатывай</p>
            </div>
          </div>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="text-center space-y-4">
              <div className="relative w-32 h-32 mx-auto">
                <div className={`absolute inset-0 rounded-full ${canWatchAd ? 'gradient-primary animate-pulse-slow' : 'bg-muted'} flex items-center justify-center`}>
                  <Icon name={canWatchAd ? 'Play' : 'Clock'} className="text-white" size={48} />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {canWatchAd ? 'Готов к просмотру!' : 'Подождите немного'}
                </h3>
                <p className="text-muted-foreground">
                  {canWatchAd 
                    ? 'Нажми на кнопку и смотри рекламу' 
                    : `Следующая реклама через ${timeLeft}с`}
                </p>
              </div>

              {!canWatchAd && (
                <div className="space-y-2">
                  <Progress value={(60 - timeLeft) / 60 * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.floor((60 - timeLeft) / 60 * 100)}% до следующего просмотра
                  </p>
                </div>
              )}

              <Button
                onClick={handleWatchAd}
                disabled={!canWatchAd || isWatching}
                size="lg"
                className="w-full gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isWatching ? (
                  <>
                    <Icon name="Loader2" className="animate-spin mr-2" />
                    Просмотр рекламы...
                  </>
                ) : (
                  <>
                    <Icon name="Play" className="mr-2" />
                    Начать просмотр
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Info" className="text-accent" size={20} />
              Правила просмотра
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle2" className="text-primary mt-0.5 shrink-0" size={16} />
                <span>Смотри рекламу до конца, чтобы получить награду</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle2" className="text-primary mt-0.5 shrink-0" size={16} />
                <span>Новая реклама доступна каждые 60 секунд</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle2" className="text-primary mt-0.5 shrink-0" size={16} />
                <span>Награда 0.0001 TON за каждый просмотр</span>
              </li>
            </ul>
          </Card>
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl gradient-secondary">
              <Icon name="Wallet" className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Кошелек</h2>
              <p className="text-sm text-muted-foreground">Управляй своими средствами</p>
            </div>
          </div>

          <Card className="gradient-secondary p-8 text-center border-0 shadow-2xl">
            <div className="space-y-3">
              <Icon name="Wallet" className="text-white mx-auto" size={40} />
              <div>
                <p className="text-white/80 text-sm uppercase tracking-wider mb-1">Доступно для вывода</p>
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-4xl font-bold text-white">{balance.toFixed(4)}</h2>
                  <span className="text-xl text-white/90">TON</span>
                </div>
              </div>
            </div>
          </Card>

          {!walletConnected ? (
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Icon name="Link" className="text-muted-foreground" size={32} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Подключи кошелек</h3>
                  <p className="text-sm text-muted-foreground">
                    Подключи TON кошелек для вывода средств
                  </p>
                </div>
                <Button
                  onClick={handleConnectWallet}
                  className="w-full gradient-primary text-white font-semibold hover:opacity-90"
                >
                  <Icon name="Wallet" className="mr-2" />
                  Подключить TON Wallet
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Статус кошелька</h3>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Icon name="CheckCircle2" className="mr-1" size={14} />
                    Подключен
                  </Badge>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Icon name="Wallet" className="text-accent" size={24} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">TON Wallet</p>
                    <p className="text-xs text-muted-foreground font-mono">UQD...x7Kp</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="font-semibold mb-4">Вывод средств</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Минимум для вывода</span>
                      <span className="font-semibold">0.001 TON</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Комиссия сети</span>
                      <span className="font-semibold">~0.0001 TON</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleWithdraw}
                    disabled={balance < 0.001}
                    className="w-full gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    <Icon name="Send" className="mr-2" />
                    Вывести {balance.toFixed(4)} TON
                  </Button>
                  
                  {balance < 0.001 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Еще {(0.001 - balance).toFixed(4)} TON до минимальной суммы
                    </p>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-primary">
              <Icon name="User" className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Профиль</h2>
              <p className="text-sm text-muted-foreground">Твоя статистика</p>
            </div>
          </div>

          <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-border/50">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="User" className="text-white" size={40} />
            </div>
            <h3 className="text-xl font-bold mb-1">Пользователь #12345</h3>
            <p className="text-sm text-muted-foreground">Присоединился сегодня</p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="TrendingUp" className="text-primary" size={20} />
              Статистика заработка
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Icon name="Eye" className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Всего просмотров</p>
                    <p className="text-xl font-bold">{adsWatched}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center">
                    <Icon name="Coins" className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Всего заработано</p>
                    <p className="text-xl font-bold">{totalEarned.toFixed(4)} TON</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Icon name="Wallet" className="text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Текущий баланс</p>
                    <p className="text-xl font-bold">{balance.toFixed(4)} TON</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Award" className="text-accent" size={20} />
              Достижения
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-xs text-muted-foreground">Первый просмотр</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg opacity-50">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-xs text-muted-foreground">10 просмотров</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg opacity-50">
                <div className="text-3xl mb-2">💎</div>
                <p className="text-xs text-muted-foreground">100 просмотров</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border/50">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              activeTab === 'home' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Home" size={24} />
            <span className="text-xs font-medium">Главная</span>
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              activeTab === 'ads' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Video" size={24} />
            <span className="text-xs font-medium">Реклама</span>
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              activeTab === 'wallet' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Wallet" size={24} />
            <span className="text-xs font-medium">Кошелек</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              activeTab === 'profile' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="User" size={24} />
            <span className="text-xs font-medium">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { movieQuestions } from '@/data/movieQuestions';

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lives, setLives] = useState(1);
  const [balance, setBalance] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showAdButton, setShowAdButton] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [adsgramController, setAdsgramController] = useState<any>(null);
  const { toast } = useToast();

  const currentQuestion = movieQuestions[currentQuestionIndex];

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

  useEffect(() => {
    if (correctAnswers > 0 && correctAnswers % 5 === 0) {
      setShowAdButton(true);
    }
  }, [correctAnswers]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      const reward = currentQuestion.reward;
      setBalance(prev => prev + reward);
      setCorrectAnswers(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
      
      toast({
        title: '🎉 Правильно!',
        description: `+${reward} TON`,
      });

      setTimeout(() => {
        if (currentQuestionIndex < movieQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
        } else {
          toast({
            title: '🏆 Поздравляем!',
            description: 'Вы ответили на все вопросы!',
          });
        }
      }, 1500);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives === 0) {
        setIsGameOver(true);
        toast({
          title: '💔 Игра окончена',
          description: 'У вас закончились жизни. Посмотрите рекламу, чтобы продолжить.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '❌ Неправильно',
          description: `Осталось жизней: ${newLives}`,
          variant: 'destructive',
        });
        
        setTimeout(() => {
          setSelectedAnswer(null);
          setIsAnswered(false);
        }, 1500);
      }
    }
  };

  const handleWatchAdToContinue = async () => {
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
        if (showAdButton) {
          setShowAdButton(false);
          setCorrectAnswers(0);
          toast({
            title: '✅ Продолжайте!',
            description: 'Вы можете продолжить отвечать на вопросы',
          });
        } else {
          setLives(1);
          setIsGameOver(false);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setCorrectAnswers(0);
          toast({
            title: '❤️ Жизнь восстановлена!',
            description: 'Вы можете продолжить игру',
          });
        }
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

  const getAnswerButtonClass = (index: number) => {
    if (!isAnswered) return 'bg-card/50 hover:bg-card border-border/50';
    
    if (index === currentQuestion.correctAnswer) {
      return 'bg-green-500/20 border-green-500 text-green-500';
    }
    
    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return 'bg-red-500/20 border-red-500 text-red-500';
    }
    
    return 'bg-card/50 border-border/50 opacity-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0A1F] via-[#1A1333] to-[#0F0A1F] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">🎬 Кино Викторина</h1>
          <p className="text-muted-foreground">Отвечай на вопросы и зарабатывай TON</p>
        </div>

        <Card className="gradient-primary p-6 border-0 shadow-2xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Вопрос</p>
              <div className="flex items-center justify-center gap-1">
                <Icon name="HelpCircle" className="text-yellow-300" size={20} />
                <h3 className="text-2xl font-bold text-white">{currentQuestionIndex + 1}</h3>
                <span className="text-white/70">/ {movieQuestions.length}</span>
              </div>
            </div>
            <div>
              <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Жизни</p>
              <div className="flex items-center justify-center gap-1">
                <Icon name="Heart" className={lives > 0 ? "text-red-400" : "text-white/30"} size={20} />
                <h3 className="text-2xl font-bold text-white">{lives}</h3>
              </div>
            </div>
            <div>
              <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Баланс</p>
              <div className="flex items-center justify-center gap-1">
                <Icon name="Coins" className="text-yellow-300" size={20} />
                <h3 className="text-2xl font-bold text-white">{balance.toFixed(4)}</h3>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-start justify-between gap-4 mb-4">
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/50">
              Правильных: {totalCorrect}
            </Badge>
            {correctAnswers > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/50">
                Серия: {correctAnswers}
              </Badge>
            )}
          </div>

          {!isGameOver && currentQuestion && (
            <>
              <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={`w-full p-6 text-left justify-start text-base font-medium transition-all ${getAnswerButtonClass(index)}`}
                    variant="outline"
                  >
                    <span className="mr-3 text-lg font-bold">{String.fromCharCode(65 + index)}.</span>
                    {option}
                    {isAnswered && index === currentQuestion.correctAnswer && (
                      <Icon name="Check" className="ml-auto text-green-500" size={20} />
                    )}
                    {isAnswered && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                      <Icon name="X" className="ml-auto text-red-500" size={20} />
                    )}
                  </Button>
                ))}
              </div>
            </>
          )}

          {isGameOver && (
            <div className="text-center space-y-4">
              <Icon name="AlertCircle" className="mx-auto text-red-400" size={64} />
              <h3 className="text-2xl font-bold">Игра окончена</h3>
              <p className="text-muted-foreground">
                У вас закончились жизни. Посмотрите рекламу, чтобы продолжить игру.
              </p>
              <Button
                onClick={handleWatchAdToContinue}
                className="w-full gradient-primary text-white font-semibold py-6 text-lg hover:opacity-90 transition-opacity"
              >
                <Icon name="Play" className="mr-2" size={20} />
                Посмотреть рекламу и продолжить
              </Button>
            </div>
          )}
        </Card>

        {showAdButton && !isGameOver && (
          <Card className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Icon name="Sparkles" className="text-purple-400" size={32} />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Отличная серия! 🎉</h3>
                <p className="text-sm text-muted-foreground">5 правильных ответов подряд</p>
              </div>
              <Button
                onClick={handleWatchAdToContinue}
                className="gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <Icon name="Play" className="mr-2" size={16} />
                Продолжить за рекламу
              </Button>
            </div>
          </Card>
        )}

        {totalCorrect > 0 && (
          <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Всего правильных ответов:</span>
              <span className="font-bold text-accent">{totalCorrect}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Заработано:</span>
              <span className="font-bold text-yellow-400">{balance.toFixed(4)} TON</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { movieQuestions, Question } from '@/data/movieQuestions';
import { animalQuestions } from '@/data/animalQuestions';
import { oceanQuestions } from '@/data/oceanQuestions';
import { tonQuestions } from '@/data/tonQuestions';

type QuizCategory = 'menu' | 'movies' | 'animals' | 'ocean' | 'ton';

declare global {
  interface Window {
    monetag?: any;
  }
}

const correctSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCiH0O/aizsIHGm98OScTgwRXLTs66dSEwtMo+PzvWQbBDmP1vDJdykGKH/N8N2SOwoVYbrs66lVFApJoeL0v2wgBCmH0O7XiToHHGy98OabTQwSXrXt66dSEwtKo+Lzu2MbBDqQ1/DMeSgGKIDO8NySOwoVY7vs66hWFApJoeL0vmsgBCqI0e7WiToHG22+8OWaTAwSXrXt66dTEwtKo+Lzu2IbBDqQ1/DLeSkFKIDO8NuSPAkUY7rs66hVFApKouL0vmsfBCuI0e/WiTkHHG2+8OWaTQwSXrbr66dUEwtJo+Hzu2MbBDuQ2PDLeiwFKoHN8NqSOwkVYrns66lUFQpJouL0vmwfBCuH0O/ZiDkHHWy+7+WbTQwSXrXs66hUEwtKpOHz') as HTMLAudioElement;
const wrongSound = new Audio('data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAAD//v3+/P75+ff38u7p5ODb1tDLxcC6tK+pn5mSi4R9dnBeWFFKQz05Mjw9P0BBQUFFR0ZGR0ZFQj89OTQtJx4VDAMBAAABAwYKDhMYHSMqL1VEOy8jFgsAAPv28u7p5N7Z08zFv7mxqaGYkIl/dnBpYFlRSkM8NDEuLTAyNTk9Q0hOVGBgXFdRSkM8NS8oIRoTDAQBAQIDCA0TGSEoMLe4tbOxrqqnoJ6enaCfoJydmZSPiYN9d3BqZV9ZU05JREBBRUlNUldbYmpzeYSQnaqzvc3X4On0AAAJFR4nMTpESliCkqSyvsnZ6vr+//37+fXw7OXf2dPMyb++tbCqqZ+cmpSRjoqHhH9+fXt4dnRxb2xpaWhmY2FfXFpYVVVVVVVVVlZXWFpbXl9iZGZqb3R4fYKIjpOZoKatsLO2ubu8') as HTMLAudioElement;
correctSound.volume = 0.3;
wrongSound.volume = 0.3;

export default function Index() {
  const [category, setCategory] = useState<QuizCategory>('menu');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lives, setLives] = useState(1);
  const [balance, setBalance] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showAdButton, setShowAdButton] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const getQuestions = (): Question[] => {
    switch (category) {
      case 'movies': return movieQuestions;
      case 'animals': return animalQuestions;
      case 'ocean': return oceanQuestions;
      case 'ton': return tonQuestions;
      default: return [];
    }
  };

  const questions = getQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('waufooty.com',7468018,document.createElement('script'))
    `;
    document.body.appendChild(script);
    setAdLoaded(true);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (correctAnswers > 0 && correctAnswers % 5 === 0) {
      setShowAdButton(true);
    }
  }, [correctAnswers]);

  useEffect(() => {
    if (category === 'menu' || isAnswered || isGameOver) return;

    setTimeLeft(20);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, category, isAnswered, isGameOver]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    
    wrongSound.currentTime = 0;
    wrongSound.play().catch(() => {});
    
    setIsAnswered(true);
    const newLives = lives - 1;
    setLives(newLives);
    
    if (newLives === 0) {
      setIsGameOver(true);
      toast({
        title: '⏰ Время вышло!',
        description: 'У вас закончились жизни. Посмотрите рекламу, чтобы продолжить.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: '⏰ Время вышло!',
        description: `Осталось жизней: ${newLives}`,
        variant: 'destructive',
      });
      
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
        }
      }, 1500);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const questionId = currentQuestion.id;
    const alreadyAnswered = answeredQuestions.has(questionId);

    if (isCorrect) {
      correctSound.currentTime = 0;
      correctSound.play().catch(() => {});
      
      const reward = currentQuestion.reward;
      
      if (!alreadyAnswered) {
        setBalance(prev => prev + reward);
        setAnsweredQuestions(prev => new Set(prev).add(questionId));
        
        toast({
          title: '🎉 Правильно!',
          description: `+${reward} JBL`,
        });
      } else {
        toast({
          title: '✅ Правильно!',
          description: 'Вы уже получили награду за этот вопрос',
        });
      }

      setCorrectAnswers(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
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
      wrongSound.currentTime = 0;
      wrongSound.play().catch(() => {});
      
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

  const handleWatchAdToContinue = () => {
    if (!adLoaded) {
      toast({
        title: '⚠️ Подождите',
        description: 'Загружаем рекламу...',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '📺 Реклама',
      description: 'Закройте рекламу для продолжения игры',
    });

    setTimeout(() => {
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
    }, 3000);
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

  const handleCategorySelect = (selectedCategory: QuizCategory) => {
    setCategory(selectedCategory);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setLives(1);
    setBalance(0);
    setCorrectAnswers(0);
    setTotalCorrect(0);
    setIsAnswered(false);
    setShowAdButton(false);
    setIsGameOver(false);
    setTimeLeft(20);
    setAnsweredQuestions(new Set());
  };

  const handleBackToMenu = () => {
    setCategory('menu');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setLives(1);
    setBalance(0);
    setCorrectAnswers(0);
    setTotalCorrect(0);
    setIsAnswered(false);
    setShowAdButton(false);
    setIsGameOver(false);
    setTimeLeft(20);
    setAnsweredQuestions(new Set());
  };

  if (category === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0A1F] via-[#1A1333] to-[#0F0A1F] p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold gradient-text">🎯 Викторина</h1>
            <p className="text-muted-foreground text-lg">Выбери категорию и зарабатывай JBL токены</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/70">
              <span>Контракт JBL:</span>
              <code className="bg-card/50 px-2 py-1 rounded text-xs">EQBdB-mgZ0fFswcBbe3SD1XPMmv18UmnJ_BFQNTfQGG2t4Q9</code>
            </div>
          </div>

          <div className="grid gap-4">
            <Card 
              className="p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleCategorySelect('movies')}
            >
              <div className="text-center space-y-3">
                <div className="text-6xl">🎬</div>
                <h2 className="text-3xl font-bold">Кино</h2>
                <p className="text-muted-foreground">105 вопросов о фильмах</p>
                <Badge className="bg-purple-500/30 text-purple-300 border-purple-500/50">
                  До 0.00105 JBL
                </Badge>
              </div>
            </Card>

            <Card 
              className="p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleCategorySelect('animals')}
            >
              <div className="text-center space-y-3">
                <div className="text-6xl">🦁</div>
                <h2 className="text-3xl font-bold">Животные</h2>
                <p className="text-muted-foreground">100 вопросов о фауне</p>
                <Badge className="bg-green-500/30 text-green-300 border-green-500/50">
                  До 0.00100 JBL
                </Badge>
              </div>
            </Card>

            <Card 
              className="p-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleCategorySelect('ocean')}
            >
              <div className="text-center space-y-3">
                <div className="text-6xl">🌊</div>
                <h2 className="text-3xl font-bold">Подводный мир</h2>
                <p className="text-muted-foreground">100 вопросов об океане</p>
                <Badge className="bg-blue-500/30 text-blue-300 border-blue-500/50">
                  До 0.00100 JBL
                </Badge>
              </div>
            </Card>

            <Card 
              className="p-8 bg-gradient-to-br from-blue-600/20 to-sky-500/20 border-blue-600/50 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleCategorySelect('ton')}
            >
              <div className="text-center space-y-3">
                <div className="text-6xl">💎</div>
                <h2 className="text-3xl font-bold">TON & Павел Дуров</h2>
                <p className="text-muted-foreground">110+ вопросов о блокчейне</p>
                <Badge className="bg-blue-600/30 text-blue-300 border-blue-600/50">
                  До 0.00110 JBL
                </Badge>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30">
            <div className="flex items-center gap-3">
              <Icon name="Info" className="text-accent" size={24} />
              <div className="text-sm text-muted-foreground">
                Отвечай на вопросы правильно за 20 секунд, зарабатывай JBL и смотри рекламу для продолжения!
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const getCategoryTitle = () => {
    switch (category) {
      case 'movies': return '🎬 Кино Викторина';
      case 'animals': return '🦁 Животные';
      case 'ocean': return '🌊 Подводный мир';
      case 'ton': return '💎 TON & Павел Дуров';
      default: return 'Викторина';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0A1F] via-[#1A1333] to-[#0F0A1F] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBackToMenu}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            Меню
          </Button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">{getCategoryTitle()}</h1>
          <p className="text-muted-foreground">Отвечай на вопросы и зарабатывай JBL токены</p>
        </div>

        <Card className="gradient-primary p-6 border-0 shadow-2xl">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Время</p>
              <div className="flex items-center justify-center gap-1">
                <Icon name="Timer" className="text-yellow-300" size={20} />
                <h3 className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : 'text-white'}`}>{timeLeft}s</h3>
              </div>
            </div>
            <div>
              <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Вопрос</p>
              <div className="flex items-center justify-center gap-1">
                <Icon name="HelpCircle" className="text-yellow-300" size={20} />
                <h3 className="text-2xl font-bold text-white">{currentQuestionIndex + 1}</h3>
                <span className="text-white/70">/ {questions.length}</span>
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
                <h3 className="text-2xl font-bold text-white">{balance.toFixed(5)}</h3>
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
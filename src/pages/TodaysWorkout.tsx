import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, ArrowLeft, RotateCcw, CheckCircle, ChevronDown, ChevronUp, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Exercise } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

function SetTimer({ restTime, onComplete }: { restTime: number; onComplete?: () => void }) {
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [isActive, setIsActive] = useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const start = () => {
    if (timeLeft === 0) {
      setTimeLeft(restTime);
    }
    setIsActive(true);
  };

  const pause = () => {
    setIsActive(false);
  };

  const reset = () => {
    setTimeLeft(restTime);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={isActive ? pause : start}
          className="px-2"
        >
          {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <Button size="sm" variant="outline" onClick={reset} className="px-2">
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
      <span className={`flex items-center text-sm min-w-[60px] font-mono ${
        timeLeft === 0 ? 'text-green-600 font-bold' : 
        isActive ? 'text-orange-600' : 'text-muted-foreground'
      }`}>
        <Clock className="h-3 w-3 mr-1" />
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}

interface SetCardProps {
  exerciseName: string;
  setNumber: number;
  repetitions: string;
  variation?: string;
  restTime?: number;
  onComplete: () => void;
  isCompleted: boolean;
  isStarted: boolean;
  onStart: () => void;
}

function SetCard({ exerciseName, setNumber, repetitions, variation, restTime, onComplete, isCompleted, isStarted, onStart }: SetCardProps) {
  const { toast } = useToast();

  const handleComplete = () => {
    onComplete();
    toast({
      title: 'Série concluída!',
      description: `${exerciseName} - Série ${setNumber} finalizada.`,
      className: 'bg-green-500 border-green-600 text-white shadow-lg [&>button]:text-white [&>button]:hover:text-gray-100',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
        color: '#ffffff',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }
    });
  };

  const handleStart = () => {
    onStart();
    toast({
      title: 'Série iniciada!',
      description: `${exerciseName} - Série ${setNumber} em andamento.`,
      className: 'bg-green-500 border-green-600 text-white shadow-lg [&>button]:text-white [&>button]:hover:text-gray-100',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
        color: '#ffffff',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }
    });
  };

  return (
    <Card className={`transition-all duration-200 ${
      isCompleted ? 'bg-green-50 border-green-200' : 
      isStarted ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium flex items-center gap-2">
                {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                {exerciseName} - Série {setNumber}
              </h4>
              <p className="text-sm text-muted-foreground">
                {repetitions} repetições
                {variation && ` • ${variation}`}
              </p>
            </div>
            {typeof restTime === 'number' && restTime > 0 && isStarted && !isCompleted && (
              <SetTimer 
                restTime={restTime} 
                onComplete={() => {
                  toast({
                    title: 'Descanso finalizado!',
                    description: 'Hora de começar a próxima série.',
                    className: 'bg-green-500 border-green-600 text-white shadow-lg [&>button]:text-white [&>button]:hover:text-gray-100',
                    style: {
                      backgroundColor: '#10b981',
                      borderColor: '#059669',
                      color: '#ffffff',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }
                  });
                }}
              />
            )}
          </div>
          
          <div className="flex gap-2">
            {!isStarted && !isCompleted && (
              <Button onClick={handleStart} size="sm" className="flex-1">
                Iniciar Série
              </Button>
            )}
            
            {isStarted && !isCompleted && (
              <Button onClick={handleComplete} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-1 h-3 w-3" />
                Concluir Série
              </Button>
            )}
            
            {isCompleted && (
              <Button disabled size="sm" className="flex-1 bg-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Série Concluída
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  onSetComplete: (setIndex: number) => void;
  onSetStart: (setIndex: number) => void;
  completedSets: boolean[];
  startedSets: boolean[];
  isExpanded: boolean;
  onToggle: () => void;
}

function ExerciseCard({ exercise, onSetComplete, onSetStart, completedSets, startedSets, isExpanded, onToggle }: ExerciseCardProps) {

  const getExerciseDisplay = () => {
    if (exercise.series && exercise.repetitions) {
      return `${exercise.series} séries de ${exercise.repetitions}`;
    }
    if ((exercise as any).sets) {
      return (exercise as any).sets;
    }
    return 'Séries não definidas';
  };

  const totalSets = exercise.series || 0;
  const completedCount = completedSets.filter(Boolean).length;
  const allCompleted = completedCount === totalSets;

  return (
    <div className="space-y-2">
      <Card className={`transition-all duration-200 ${allCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
        <CardHeader 
          className="cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {allCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                {exercise.name}
              </CardTitle>
              <CardDescription>
                {getExerciseDisplay()}
                {exercise.variation && ` • ${exercise.variation}`}
                {completedCount > 0 && ` • ${completedCount}/${totalSets} séries concluídas`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CardHeader>
      </Card>

      {isExpanded && totalSets > 0 && (
        <div className="space-y-2 ml-4 animate-in slide-in-from-top-1 duration-300">
          {Array.from({ length: totalSets }, (_, index) => (
            <SetCard
              key={`${exercise.id}-set-${index}`}
              exerciseName={exercise.name}
              setNumber={index + 1}
              repetitions={exercise.repetitions || 'N/A'}
              variation={exercise.variation}
              restTime={exercise.rest_time}
              onComplete={() => onSetComplete(index)}
              onStart={() => onSetStart(index)}
              isCompleted={completedSets[index] || false}
              isStarted={startedSets[index] || false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const TodaysWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { workoutDays, date, workoutId } = location.state || {};

  // Track completion and start status for each set of each exercise
  const [exerciseSets, setExerciseSets] = useState<{ 
    [exerciseId: string]: { 
      completed: boolean[], 
      started: boolean[] 
    } 
  }>({});

  // Estado para controlar qual exercício está expandido (accordion)
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  
  // Estado para controlar o loading do salvamento da sessão
  const [isSavingSession, setIsSavingSession] = useState(false);

  // Função para obter a chave do localStorage baseada na data atual
  const getStorageKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return `workout_progress_${today}`;
  };

  // Função para salvar o progresso no localStorage
  const saveProgressToStorage = (newExerciseSets: typeof exerciseSets) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newExerciseSets));
      console.log('💾 Progresso salvo localmente:', newExerciseSets);
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  // Função para carregar o progresso do localStorage
  const loadProgressFromStorage = () => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        const parsedProgress = JSON.parse(saved);
        console.log('📥 Progresso carregado:', parsedProgress);
        return parsedProgress;
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
    return {};
  };

  // Função para limpar progressos de dias anteriores
  const cleanOldProgress = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('workout_progress_') && !key.includes(today)) {
          localStorage.removeItem(key);
          console.log('🗑️ Progresso antigo removido:', key);
        }
      });
    } catch (error) {
      console.error('Erro ao limpar progresso antigo:', error);
    }
  };

     // Carregar progresso salvo quando o componente montar
   React.useEffect(() => {
     cleanOldProgress(); // Limpa progressos antigos
     
     // Primeiro inicializar todos os exercícios
     if (workoutDays && workoutDays.length > 0) {
       workoutDays.forEach((workoutDay: any) => {
         workoutDay.exercises.forEach((exercise: Exercise) => {
           const seriesCount = exercise.series || 0;
           initializeExerciseSets(exercise.id, seriesCount);
         });
       });
       
       // Depois carregar o progresso salvo
       const savedProgress = loadProgressFromStorage();
       if (Object.keys(savedProgress).length > 0) {
         setExerciseSets(savedProgress);
         toast({
           title: '📥 Progresso restaurado',
           description: 'Continuando de onde você parou!',
           className: 'bg-blue-500 border-blue-600 text-white shadow-lg',
           style: {
             backgroundColor: '#3b82f6',
             borderColor: '#2563eb',
             color: '#ffffff'
           },
           duration: 3000
         });
       }
     }
   }, [workoutDays]);

   // Aviso ao sair da página se houver progresso não salvo
   React.useEffect(() => {
     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
       const completedSetsCount = Object.values(exerciseSets).reduce((total, exercise) => {
         return total + exercise.completed.filter(Boolean).length;
       }, 0);
       
       // Apenas avisar se há progresso e o treino não foi concluído
       if (completedSetsCount > 0) {
         e.preventDefault();
         e.returnValue = 'Você tem progresso não salvo. Tem certeza que deseja sair?';
         return 'Você tem progresso não salvo. Tem certeza que deseja sair?';
       }
     };

     window.addEventListener('beforeunload', handleBeforeUnload);
     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
   }, [exerciseSets]);

  // Função para controlar expansão de exercícios (apenas um por vez)
  const handleExerciseToggle = (exerciseId: string) => {
    setExpandedExerciseId(prevExpanded => 
      prevExpanded === exerciseId ? null : exerciseId
    );
  };

  const initializeExerciseSets = (exerciseId: string, seriesCount: number) => {
    if (!exerciseSets[exerciseId]) {
      setExerciseSets(prev => ({
        ...prev,
        [exerciseId]: {
          completed: new Array(seriesCount).fill(false),
          started: new Array(seriesCount).fill(false)
        }
      }));
    }
  };

  const handleSetComplete = (exerciseId: string, setIndex: number) => {
    const newExerciseSets = {
      ...exerciseSets,
      [exerciseId]: {
        ...exerciseSets[exerciseId],
        completed: exerciseSets[exerciseId].completed.map((completed, index) => 
          index === setIndex ? true : completed
        )
      }
    };
    
    setExerciseSets(newExerciseSets);
    saveProgressToStorage(newExerciseSets); // Salva automaticamente
  };

  const handleSetStart = (exerciseId: string, setIndex: number) => {
    const newExerciseSets = {
      ...exerciseSets,
      [exerciseId]: {
        ...exerciseSets[exerciseId],
        started: exerciseSets[exerciseId].started.map((started, index) => 
          index === setIndex ? true : started
        )
      }
    };
    
    setExerciseSets(newExerciseSets);
    saveProgressToStorage(newExerciseSets); // Salva automaticamente
  };

  // Calculate progress
  const totalSets = workoutDays?.reduce((total: number, day: any) => {
    return total + day.exercises.reduce((dayTotal: number, exercise: Exercise) => {
      const seriesCount = exercise.series || 0;
      initializeExerciseSets(exercise.id, seriesCount);
      return dayTotal + seriesCount;
    }, 0);
  }, 0) || 0;

  const completedSets = Object.values(exerciseSets).reduce((total, exercise) => {
    return total + exercise.completed.filter(Boolean).length;
  }, 0);

  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  // Função para salvar a sessão de treino no banco de dados
  const saveWorkoutSession = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não encontrado.',
        variant: 'destructive'
      });
      return false;
    }

    setIsSavingSession(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Verificar se já existe uma sessão para hoje
      const { data: existingSession } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existingSession) {
        console.log('⚠️ Sessão já exists para hoje, atualizando...');
        
        const { data, error } = await supabase
          .from('workout_sessions')
          .update({
            workout_id: workoutId || null,
            notes: `Treino concluído com ${completedSets}/${totalSets} séries`
          })
          .eq('id', existingSession.id)
          .select();

        if (error) {
          console.error('❌ Erro ao atualizar sessão:', error);
          toast({
            title: 'Erro ao salvar',
            description: `Não foi possível atualizar: ${error.message}`,
            variant: 'destructive'
          });
          return false;
        }

                 console.log('✅ Sessão atualizada com sucesso:', data);
         
         // Limpar o progresso salvo localmente após atualizar com sucesso
         localStorage.removeItem(getStorageKey());
         console.log('🗑️ Progresso local limpo após atualização');
         
         return true;
      }

      console.log('🏋️ Salvando nova sessão de treino...', {
        user_id: user.id,
        workout_id: workoutId,
        date: today,
        completedSets,
        totalSets
      });

      const { data, error } = await supabase.from('workout_sessions').insert({
        user_id: user.id,
        workout_id: workoutId || null,
        date: today, // Formato YYYY-MM-DD
        duration: null, // Pode ser calculado se necessário
        notes: `Treino concluído com ${completedSets}/${totalSets} séries`
      }).select();

      if (error) {
        console.error('❌ Erro ao salvar sessão:', error);
        toast({
          title: 'Erro ao salvar',
          description: `Não foi possível salvar: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }

              console.log('✅ Sessão salva com sucesso:', data);
        
        // Limpar o progresso salvo localmente após salvar com sucesso
        localStorage.removeItem(getStorageKey());
        console.log('🗑️ Progresso local limpo após conclusão');
        
        return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar sessão:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao salvar a sessão.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSavingSession(false);
    }
  };

  // Função para criar confetes animados
  const createConfetti = () => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F39C12', '#E74C3C']
    const confettiCount = 60
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div')
      confetti.className = 'confetti'
      
      // Cores e formas aleatórias
      const color = colors[Math.floor(Math.random() * colors.length)]
      const isCircle = Math.random() > 0.5
      const size = Math.random() * 8 + 6 // 6px a 14px
      
      confetti.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${Math.random() * 100}vw;
        bottom: -10px;
        z-index: 9999;
        border-radius: ${isCircle ? '50%' : '0'};
        animation: confetti-fall ${2.5 + Math.random() * 2}s ease-out forwards;
        transform: rotate(${Math.random() * 360}deg);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
      `
      
      document.body.appendChild(confetti)
      
      // Remove confetti após a animação
      setTimeout(() => {
        confetti.remove()
      }, 5000)
    }
  }

  const handleWorkoutComplete = async () => {
    if (completedSets === totalSets && totalSets > 0) {
      // Dispara a animação de confetes imediatamente
      createConfetti();
      
      // Salva a sessão no banco de dados
      const sessionSaved = await saveWorkoutSession();
      
      if (sessionSaved) {
        toast({
          title: 'Treino Concluído!',
          description: 'Parabéns! Seu treino foi salvo com sucesso.',
          className: 'bg-green-500 border-green-600 text-white shadow-lg [&>button]:text-white [&>button]:hover:text-gray-100',
          style: {
            backgroundColor: '#10b981',
            borderColor: '#059669',
            color: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }
        });
        
        // Navegar de volta após um breve delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast({
          title: 'Treino Concluído!',
          description: 'Parabéns! Houve um problema ao salvar, mas seu treino foi concluído.',
          className: 'bg-green-500 border-green-600 text-white shadow-lg [&>button]:text-white [&>button]:hover:text-gray-100',
          style: {
            backgroundColor: '#10b981',
            borderColor: '#059669',
            color: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }
        });
        
        // Navegar de volta após um breve delay mesmo se não salvou
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } else {
      toast({
        title: 'Treino incompleto',
        description: `Você ainda tem ${totalSets - completedSets} séries para concluir.`,
        className: 'bg-amber-500 border-amber-600 text-white shadow-lg [&>button]:text-white [&>button]:hover:text-gray-100',
        style: {
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          color: '#ffffff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 py-8 px-4 pb-20">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Treino de Hoje</h1>
            <p className="text-gray-600">
              {date || new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Progress Bar - Sticky */}
        {totalSets > 0 && (
          <div className="sticky top-0 z-40 mb-6">
            <Card className="bg-white/95 backdrop-blur-md shadow-lg border border-gray-200">
              <CardContent className="py-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progresso do Treino</span>
                    <span>{completedSets}/{totalSets} séries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="gradient-bg h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="text-sm font-bold text-primary min-w-[60px] text-right">
                      {Math.round(progressPercentage)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!workoutDays || workoutDays.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum treino programado para hoje</p>
              <p className="text-sm text-gray-400 mt-2">Aproveite para descansar ou criar um novo plano!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {workoutDays.map((workoutDay: any) => (
              <div key={workoutDay.letter} className="space-y-4">
                {/* Card do Treino */}
                <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mr-4 shadow-md">
                        <span className="text-xl font-bold text-primary-foreground">{workoutDay.letter}</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Treino {workoutDay.letter}</CardTitle>
                        <CardDescription className="text-base">
                          {workoutDay.exercises.length} exercícios programados
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                
                {/* Exercícios abaixo do card */}
                <div className="space-y-4 pl-4">
                  {workoutDay.exercises.map((exercise: Exercise) => {
                    const seriesCount = exercise.series || 0;
                    initializeExerciseSets(exercise.id, seriesCount);
                    const exerciseState = exerciseSets[exercise.id] || { completed: [], started: [] };
                    
                    return (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onSetComplete={(setIndex) => handleSetComplete(exercise.id, setIndex)}
                        onSetStart={(setIndex) => handleSetStart(exercise.id, setIndex)}
                        completedSets={exerciseState.completed}
                        startedSets={exerciseState.started}
                        isExpanded={expandedExerciseId === exercise.id}
                        onToggle={() => handleExerciseToggle(exercise.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Complete Workout Button */}
            {totalSets > 0 && (
              <div className="text-center pt-8">
                <Button
                  onClick={handleWorkoutComplete}
                  size="lg"
                  className={`px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl ${
                    completedSets === totalSets 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'gradient-bg text-primary-foreground'
                  }`}
                  disabled={completedSets === 0 || isSavingSession}
                >
                  {isSavingSession ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : completedSets === totalSets ? (
                    '🎉 Treino Concluído!' 
                  ) : (
                    `Finalizar Treino (${completedSets}/${totalSets})`
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysWorkout;

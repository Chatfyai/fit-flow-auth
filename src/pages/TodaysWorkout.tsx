import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, RotateCcw, CheckCircle, ChevronDown, ChevronUp, Play, Pause, ArrowLeft, AlertTriangle } from 'lucide-react';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { useToast } from '@/hooks/use-toast';
import { Exercise } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Dados de demonstração para visitantes
const demoWorkoutData = {
  name: "Treino Push - Exemplo",
  workout_days: [
    {
      letter: "A",
      name: "Treino A",
      exercises: [
        {
          id: "demo-1",
          name: "Supino reto",
          series: 3,
          repetitions: "12",
          variation: "Barra",
          rest_time: 90
        },
        {
          id: "demo-2", 
          name: "Desenvolvimento com halteres",
          series: 3,
          repetitions: "10",
          variation: "Sentado",
          rest_time: 60
        },
        {
          id: "demo-3",
          name: "Tríceps testa",
          series: 3,
          repetitions: "15",
          variation: "Barra W",
          rest_time: 45
        }
      ]
    }
  ]
};

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
  const { user } = useAuth();
  const navigate = useNavigate();

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
                {variation && (
                  <>
                    {' • '}
                    <span className="text-red-600 font-medium">{variation}</span>
                  </>
                )}
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
  isExpanded?: boolean; // Mantido para compatibilidade mas não usado
  onToggle?: () => void; // Mantido para compatibilidade mas não usado
}

function ExerciseCard({ exercise, onSetComplete, onSetStart, completedSets, startedSets, isExpanded, onToggle }: ExerciseCardProps) {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimerCompleted, setIsTimerCompleted] = useState(false);

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
  const isInProgress = completedCount > 0 && !allCompleted;

  // Resetar timer quando exercício for completado
  React.useEffect(() => {
    if (allCompleted) {
      setIsTimerActive(false);
      setIsTimerCompleted(false);
    }
  }, [allCompleted]);

  const handleCardClick = () => {
    if (!allCompleted && !isTimerActive && !isTimerCompleted) {
      setIsTimerActive(true);
      setIsTimerCompleted(false);
      if (completedCount < totalSets) {
        onSetStart(completedCount);
      }
    }
  };

  const handleCompleteSet = () => {
    if (completedCount < totalSets) {
      onSetComplete(completedCount);
      setIsTimerActive(false);
      setIsTimerCompleted(false);
      
      // Auto-iniciar próxima série se não for a última
      if (completedCount + 1 < totalSets) {
        setTimeout(() => {
          setIsTimerActive(true);
          setIsTimerCompleted(false);
          onSetStart(completedCount + 1);
        }, 1000);
      }
    }
  };

  const getCardColor = () => {
    if (allCompleted) return 'bg-yellow-50 border-yellow-200'; // Amarelo quando completo
    if (isInProgress || isTimerActive) return 'bg-blue-50 border-blue-200';
    return 'bg-white border-gray-200';
  };

  const getProgressColor = () => {
    if (allCompleted) return 'text-yellow-600';
    if (isInProgress) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <Card className={`transition-all duration-200 cursor-pointer hover:shadow-lg ${getCardColor()}`}>
      <CardContent className="p-4" onClick={handleCardClick}>
        <div className="space-y-3">
          {/* Header do exercício */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium flex items-center gap-2">
                {allCompleted ? (
                  <CheckCircle className="h-5 w-5 text-yellow-600" />
                ) : isInProgress ? (
                  <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : null}
                {exercise.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {getExerciseDisplay()}
                {exercise.variation && (
                  <>
                    {' • '}
                    <span className="text-red-600 font-medium">{exercise.variation}</span>
                  </>
                )}
              </p>
            </div>
            
            {/* Contador de séries */}
            <div className={`text-sm font-medium ${getProgressColor()}`}>
              {completedCount}/{totalSets} séries
            </div>
          </div>

          {/* Cronômetro e controles (aparecem quando ativo, em progresso ou timer completado) */}
          {(isTimerActive || isInProgress || isTimerCompleted) && !allCompleted && (
            <div className={`flex items-center justify-between rounded-lg p-3 ${
              isTimerCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2">
                {exercise.rest_time && (
                  <SetTimer 
                    restTime={exercise.rest_time} 
                    onComplete={() => {
                      setIsTimerActive(false);
                      setIsTimerCompleted(true);
                    }}
                  />
                )}
                {!exercise.rest_time && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {exercise.repetitions} reps
                  </div>
                )}

              </div>
              
              {/* Botão concluir série */}
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteSet();
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Concluído
              </Button>
            </div>
          )}

          {/* Mensagem de conclusão */}
          {allCompleted && (
            <div className="text-center py-2">
              <span className="text-sm font-medium text-yellow-600">
                ✨ Exercício concluído!
              </span>
            </div>
          )}

          {/* Instruções iniciais */}
          {!isTimerActive && !isInProgress && !allCompleted && !isTimerCompleted && (
            <div className="text-center py-2 text-gray-500 text-sm">
              Clique para iniciar o cronômetro
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const TodaysWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { workoutDays, date, workoutId } = location.state || {};
  
  // Usar dados de demonstração se não estiver logado
  const finalWorkoutDays = user ? workoutDays : demoWorkoutData.workout_days;
  
  // Track completion and start status for each set of each exercise
  const [exerciseSets, setExerciseSets] = useState<{ 
    [exerciseId: string]: { 
      completed: boolean[], 
      started: boolean[] 
    } 
  }>({});

  // Removido estado de expansão - não é mais necessário
  
  // Estado para controlar o loading do salvamento da sessão
  const [isSavingSession, setIsSavingSession] = useState(false);
  
  // Estados para controlar scroll e exibição da div fixa
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFixedProgress, setShowFixedProgress] = useState(false);
  const [showFaltaPouco, setShowFaltaPouco] = useState(true);
  const [faltaPoucoAlreadyShown, setFaltaPoucoAlreadyShown] = useState(false);

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

  // Função para limpar progressos de dias anteriores (SOMENTE localStorage, não afeta banco de dados)
  const cleanOldProgress = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('workout_progress_') && !key.includes(today)) {
          // Verificar se há progresso não salvo antes de remover
          const progressData = localStorage.getItem(key);
          if (progressData) {
            console.log('🗑️ Progresso antigo encontrado (será mantido por segurança):', key);
            // Não remover automaticamente - deixar o usuário decidir
            // localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Erro ao verificar progresso antigo:', error);
    }
  };

     // Carregar progresso salvo quando o componente montar
   React.useEffect(() => {
     cleanOldProgress(); // Verifica progressos antigos (mas não remove automaticamente)
     
     // Primeiro inicializar todos os exercícios
     if (finalWorkoutDays && finalWorkoutDays.length > 0) {
       const newExerciseSets: typeof exerciseSets = {};
       
       finalWorkoutDays.forEach((workoutDay: any) => {
         workoutDay.exercises.forEach((exercise: Exercise) => {
           const seriesCount = exercise.series || 0;
           newExerciseSets[exercise.id] = {
             completed: new Array(seriesCount).fill(false),
             started: new Array(seriesCount).fill(false)
           };
         });
       });
       
       setExerciseSets(newExerciseSets);
       
       // Depois carregar o progresso salvo (apenas se estiver logado)
       if (user) {
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
     }
   }, [finalWorkoutDays, user]);

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
  // Função de toggle removida - não é mais necessária

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
    if (!exerciseSets[exerciseId]) {
      console.error('❌ Exercício não encontrado:', exerciseId);
      return;
    }
    
    setExerciseSets(prevState => {
      const newExerciseSets = {
        ...prevState,
        [exerciseId]: {
          ...prevState[exerciseId],
          completed: prevState[exerciseId].completed.map((completed, index) => 
            index === setIndex ? true : completed
          )
        }
      };
      
      // Salvar progresso apenas se o usuário estiver logado
      if (user) {
        saveProgressToStorage(newExerciseSets);
        savePartialProgress(newExerciseSets);
      }
      
      return newExerciseSets;
    });
  };

  const handleSetStart = (exerciseId: string, setIndex: number) => {
    setExerciseSets(prevState => {
      const newExerciseSets = {
        ...prevState,
        [exerciseId]: {
          ...prevState[exerciseId],
          started: prevState[exerciseId].started.map((started, index) => 
            index === setIndex ? true : started
          )
        }
      };
      
      // Salvar progresso apenas se o usuário estiver logado
      if (user) {
        saveProgressToStorage(newExerciseSets);
      }
      
      return newExerciseSets;
    });
  };

  // Calculate progress with memoization
  const totalSets = React.useMemo(() => {
    return finalWorkoutDays?.reduce((total: number, day: any) => {
      return total + day.exercises.reduce((dayTotal: number, exercise: Exercise) => {
        const seriesCount = exercise.series || 0;
        return dayTotal + seriesCount;
      }, 0);
    }, 0) || 0;
  }, [finalWorkoutDays]);

  const completedSets = React.useMemo(() => {
    return Object.values(exerciseSets).reduce((total, exercise) => {
      return total + exercise.completed.filter(Boolean).length;
    }, 0);
  }, [exerciseSets]);

  const progressPercentage = React.useMemo(() => {
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  }, [completedSets, totalSets]);

  // Controlar scroll e exibição da div fixa
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollThreshold = 200; // Pixels scrollados para considerar como "scrolled"
      
      setIsScrolled(scrollTop > scrollThreshold);
      
      // Mostrar div fixa apenas se progresso >= 70% e usuário scrollou
      const shouldShow = progressPercentage >= 70 && scrollTop > scrollThreshold;
      setShowFixedProgress(shouldShow);
      
      // Mostrar "Falta pouco!" apenas na primeira vez
      if (shouldShow && !faltaPoucoAlreadyShown) {
        setShowFaltaPouco(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [progressPercentage, faltaPoucoAlreadyShown]);

  // Timer para mudar de "Falta pouco!" para "Progresso do Treino"
  useEffect(() => {
    if (showFixedProgress && showFaltaPouco && !faltaPoucoAlreadyShown) {
      const timer = setTimeout(() => {
        setShowFaltaPouco(false);
        setFaltaPoucoAlreadyShown(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showFixedProgress, showFaltaPouco, faltaPoucoAlreadyShown]);

  // Se "Falta pouco!" já foi mostrado, sempre mostrar "Progresso do Treino"
  useEffect(() => {
    if (showFixedProgress && faltaPoucoAlreadyShown) {
      setShowFaltaPouco(false);
    }
  }, [showFixedProgress, faltaPoucoAlreadyShown]);

  // Função para salvar progresso parcial no banco de dados
  const savePartialProgress = async (currentExerciseSets: typeof exerciseSets) => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentCompletedSets = Object.values(currentExerciseSets).reduce((total, exercise) => {
        return total + exercise.completed.filter(Boolean).length;
      }, 0);
      
      // Só salvar se houver progresso significativo (pelo menos 1 série completa)
      if (currentCompletedSets === 0) return;
      
      // Verificar se já existe uma sessão para hoje
      const { data: existingSession } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existingSession) {
        // Atualizar sessão existente com progresso parcial
        await supabase
          .from('workout_sessions')
          .update({
            workout_id: workoutId || null,
            notes: `Progresso: ${currentCompletedSets}/${totalSets} séries concluídas`,
            duration: Math.floor((Date.now() - new Date().setHours(0,0,0,0)) / 60000)
          })
          .eq('id', existingSession.id);
      } else {
        // Criar nova sessão com progresso parcial
        await supabase.from('workout_sessions').insert({
          user_id: user.id,
          workout_id: workoutId || null,
          date: today,
          duration: Math.floor((Date.now() - new Date().setHours(0,0,0,0)) / 60000),
          notes: `Progresso: ${currentCompletedSets}/${totalSets} séries concluídas`
        });
      }
      
      console.log(`💾 Progresso parcial salvo: ${currentCompletedSets}/${totalSets} séries`);
    } catch (error) {
      console.error('Erro ao salvar progresso parcial:', error);
      // Não mostrar toast para não incomodar o usuário durante o treino
    }
  };

  // Função para salvar a sessão de treino no banco de dados
  const saveWorkoutSession = async () => {
    if (!user) {
      navigate('/login');
      return false;
    }

    setIsSavingSession(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Verificar se já existe uma sessão para hoje
      const { data: existingSession, error: selectError } = await supabase
        .from('workout_sessions')
        .select('id, notes')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle(); // Use maybeSingle() para evitar erro se não encontrar

      if (selectError) {
        console.error('❌ Erro ao verificar sessão existente:', selectError);
      }

      if (existingSession) {
        console.log('⚠️ Sessão já existe para hoje, atualizando...', existingSession);
        
        const { data, error } = await supabase
          .from('workout_sessions')
          .update({
            workout_id: workoutId || null,
            notes: `Treino concluído com ${completedSets}/${totalSets} séries`,
            duration: Math.floor((Date.now() - new Date().setHours(0,0,0,0)) / 60000) // Duração aproximada em minutos
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
        duration: Math.floor((Date.now() - new Date().setHours(0,0,0,0)) / 60000), // Duração aproximada em minutos
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
    if (!user) {
      navigate('/login');
      return;
    }

    if (completedSets === totalSets && totalSets > 0) {
      // Dispara a animação de confetes imediatamente
      createConfetti();
      
      // Salva a sessão no banco de dados
      const sessionSaved = await saveWorkoutSession();
      
      if (sessionSaved) {
        toast({
          title: 'Treino Concluído!',
          description: 'Parabéns! Seu treino foi salvo com sucesso.',
          className: 'warning-card-playfit shadow-lg border-2',
          style: {
            backgroundColor: 'oklch(0.9 0.15 85)',
            borderColor: 'oklch(0.85 0.12 75)',
            color: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }
        });
        
        // Sinalizar que o treino foi completado para atualizar o dashboard
        localStorage.setItem('workout_completed', 'true');
        
        // Navegar de volta após um breve delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast({
          title: 'Treino Concluído!',
          description: 'Parabéns! Houve um problema ao salvar, mas seu treino foi concluído.',
          className: 'warning-card-playfit shadow-lg border-2',
          style: {
            backgroundColor: 'oklch(0.9 0.15 85)',
            borderColor: 'oklch(0.85 0.12 75)',
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 pb-20">
      {/* Fixed Progress Bar para progresso >= 70% */}
      {showFixedProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
          <div className="w-full max-w-4xl mx-auto px-4 py-6">
            <Card className="rounded-2xl text-card-foreground transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.01] bg-white/95 backdrop-blur-md shadow-lg border border-gray-200">
              <CardContent className="py-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span>
                      {showFaltaPouco ? (
                        <span className="text-green-600">Falta pouco!</span>
                      ) : (
                        'Progresso do Treino'
                      )}
                    </span>
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
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mr-3">
                <PlayFitLogo size="md" className="text-yellow-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PlayFit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                {user ? `Olá, ${user?.user_metadata?.full_name || user?.email}!` : 'Visitante - Faça login para salvar seu progresso'}
              </span>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Aviso para visitantes */}
      {!user && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
              <div className="text-sm text-amber-800">
                <strong>Treino de demonstração.</strong> Para salvar seu progresso real, 
                <button 
                  onClick={() => navigate('/login')}
                  className="text-amber-600 hover:text-amber-800 underline ml-1"
                >
                  faça login aqui
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Data */}
        <div className="mb-6">
          <p className="text-lg text-gray-600 font-medium">
            {date || new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Progress Bar - Always in same position */}
        {totalSets > 0 && (
          <div className="mb-6">
            <Card className="rounded-2xl text-card-foreground transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.01] bg-white/95 backdrop-blur-md shadow-lg border border-gray-200">
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

        {!finalWorkoutDays || finalWorkoutDays.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum treino programado para hoje</p>
              <p className="text-sm text-gray-400 mt-2">Aproveite para descansar ou criar um novo plano!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {finalWorkoutDays.map((workoutDay: any) => (
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
                    const exerciseState = exerciseSets[exercise.id] || { completed: [], started: [] };
                    
                    return (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onSetComplete={(setIndex) => handleSetComplete(exercise.id, setIndex)}
                        onSetStart={(setIndex) => handleSetStart(exercise.id, setIndex)}
                        completedSets={exerciseState.completed}
                        startedSets={exerciseState.started}
                        isExpanded={false}
                        onToggle={() => {}}
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

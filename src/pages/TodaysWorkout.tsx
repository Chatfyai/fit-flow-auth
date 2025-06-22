import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, ArrowLeft, RotateCcw, CheckCircle, ChevronDown, ChevronUp, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Exercise } from '@/types/workout';

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
  const { workoutDays, date } = location.state || {};

  // Track completion and start status for each set of each exercise
  const [exerciseSets, setExerciseSets] = useState<{ 
    [exerciseId: string]: { 
      completed: boolean[], 
      started: boolean[] 
    } 
  }>({});

  // Estado para controlar qual exercício está expandido (accordion)
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

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
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        completed: prev[exerciseId].completed.map((completed, index) => 
          index === setIndex ? true : completed
        )
      }
    }));
  };

  const handleSetStart = (exerciseId: string, setIndex: number) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        started: prev[exerciseId].started.map((started, index) => 
          index === setIndex ? true : started
        )
      }
    }));
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

  const handleWorkoutComplete = () => {
    if (completedSets === totalSets && totalSets > 0) {
      // Dispara a animação de confetes
      createConfetti()
      
      toast({
        title: 'Treino Concluído!',
        description: 'Parabéns! Você completou todo o treino de hoje.',
        className: 'bg-green-500 border-green-600 text-white shadow-lg [&>button]:text-white [&>button]:hover:text-gray-100',
        style: {
          backgroundColor: '#10b981',
          borderColor: '#059669',
          color: '#ffffff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }
      });
    } else {
      toast({
        title: 'Treino incompleto',
        description: `Você ainda tem ${totalSets - completedSets} séries para concluir.`,
        className: 'bg-green-500 border-green-600 text-white shadow-lg [&>button]:text-white [&>button]:hover:text-gray-100',
        style: {
          backgroundColor: '#10b981',
          borderColor: '#059669',
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
                  disabled={completedSets === 0}
                >
                  {completedSets === totalSets 
                    ? '🎉 Treino Concluído!' 
                    : `Finalizar Treino (${completedSets}/${totalSets})`}
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

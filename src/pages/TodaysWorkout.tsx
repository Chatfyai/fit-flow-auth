
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
    });
  };

  const handleStart = () => {
    onStart();
    toast({
      title: 'Série iniciada!',
      description: `${exerciseName} - Série ${setNumber} em andamento.`,
    });
  };

  return (
    <Card className={`ml-4 transition-all duration-200 ${
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
}

function ExerciseCard({ exercise, onSetComplete, onSetStart, completedSets, startedSets }: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
          onClick={() => setIsExpanded(!isExpanded)}
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
        <div className="space-y-2">
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

  const handleWorkoutComplete = () => {
    if (completedSets === totalSets && totalSets > 0) {
      toast({
        title: 'Treino Concluído!',
        description: 'Parabéns! Você completou todo o treino de hoje.',
      });
    } else {
      toast({
        title: 'Treino incompleto',
        description: `Você ainda tem ${totalSets - completedSets} séries para concluir.`,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        {totalSets > 0 && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso do Treino</span>
                  <span>{completedSets}/{totalSets} séries</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="text-center text-sm text-muted-foreground">
                  {Math.round(progressPercentage)}% concluído
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" /> Treino de Hoje
            </CardTitle>
            <CardDescription>
              {date || new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!workoutDays || workoutDays.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum treino programado para hoje.</p>
                <p className="text-sm text-muted-foreground mt-1">Aproveite para descansar ou criar um novo plano!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {workoutDays.map((workoutDay: any) => (
                  <div key={workoutDay.letter} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-lg mb-4">Treino {workoutDay.letter} - {workoutDay.name}</h3>
                    <div className="space-y-4">
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
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Complete Workout Button */}
                {totalSets > 0 && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={handleWorkoutComplete}
                      className={`px-8 py-3 text-lg font-semibold ${
                        completedSets === totalSets 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'gradient-bg'
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodaysWorkout;


import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, ArrowLeft, RotateCcw, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Exercise } from '@/types/workout';

function RestTimer({ restTime }: { restTime: number }) {
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [isActive, setIsActive] = useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const start = () => {
    setTimeLeft(restTime);
    setIsActive(true);
  };

  const reset = () => {
    setTimeLeft(restTime);
    setIsActive(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="icon" variant="outline" onClick={start} title="Iniciar/Resetar descanso">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <span className="flex items-center text-sm text-muted-foreground min-w-[60px]">
        <Clock className="h-4 w-4 mr-1" />
        {timeLeft}s
      </span>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  onComplete: () => void;
  isCompleted: boolean;
}

function ExerciseCard({ exercise, onComplete, isCompleted }: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert old format to new format if needed
  const getExerciseDisplay = () => {
    if (exercise.series && exercise.repetitions) {
      return `${exercise.series} séries de ${exercise.repetitions}`;
    }
    // Fallback for old format
    if ((exercise as any).sets) {
      return (exercise as any).sets;
    }
    return 'Séries não definidas';
  };

  return (
    <Card className={`transition-all duration-200 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
              {exercise.name}
            </CardTitle>
            <CardDescription>
              {getExerciseDisplay()}
              {exercise.variation && ` • ${exercise.variation}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {typeof exercise.rest_time === 'number' && exercise.rest_time > 0 && (
              <RestTimer restTime={exercise.rest_time} />
            )}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{exercise.series || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Séries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{exercise.repetitions || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Repetições</p>
              </div>
            </div>
            
            {exercise.variation && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Variação:</p>
                <p className="text-blue-700">{exercise.variation}</p>
              </div>
            )}
            
            <Button
              onClick={onComplete}
              disabled={isCompleted}
              className={`w-full ${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Exercício Concluído
                </>
              ) : (
                'Marcar como Concluído'
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

const TodaysWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workoutDays, date } = location.state || {};

  const [completed, setCompleted] = useState<{ [id: string]: boolean }>({});

  const handleComplete = (exerciseId: string) => {
    setCompleted((prev) => ({ ...prev, [exerciseId]: true }));
    toast({
      title: 'Exercício concluído!',
      description: 'Parabéns por completar este exercício.',
    });
  };

  // Calculate progress
  const totalExercises = workoutDays?.reduce((total: number, day: any) => total + day.exercises.length, 0) || 0;
  const completedExercises = Object.values(completed).filter(Boolean).length;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const handleWorkoutComplete = () => {
    if (completedExercises === totalExercises && totalExercises > 0) {
      toast({
        title: 'Treino Concluído!',
        description: 'Parabéns! Você completou todo o treino de hoje.',
      });
      // Here you could save the workout session to database
    } else {
      toast({
        title: 'Treino incompleto',
        description: `Você ainda tem ${totalExercises - completedExercises} exercícios para concluir.`,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        {totalExercises > 0 && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso do Treino</span>
                  <span>{completedExercises}/{totalExercises} exercícios</span>
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
                    <div className="space-y-3">
                      {workoutDay.exercises.map((exercise: Exercise) => (
                        <ExerciseCard
                          key={exercise.id}
                          exercise={exercise}
                          onComplete={() => handleComplete(exercise.id)}
                          isCompleted={completed[exercise.id] || false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Complete Workout Button */}
                {totalExercises > 0 && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={handleWorkoutComplete}
                      className={`px-8 py-3 text-lg font-semibold ${
                        completedExercises === totalExercises 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'gradient-bg'
                      }`}
                      disabled={completedExercises === 0}
                    >
                      {completedExercises === totalExercises 
                        ? '🎉 Treino Concluído!' 
                        : `Finalizar Treino (${completedExercises}/${totalExercises})`}
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

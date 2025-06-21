import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowLeft, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-2xl">
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
                {workoutDays.map((workoutDay) => (
                  <div key={workoutDay.letter} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-lg mb-4">Treino {workoutDay.letter} - {workoutDay.name}</h3>
                    <div className="space-y-3">
                      {workoutDay.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-white rounded-lg shadow-sm gap-2">
                          <div className="flex-1">
                            <p className="font-medium">{exercise.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {exercise.sets}
                              {exercise.variation && ` • ${exercise.variation}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2 md:mt-0">
                            {typeof exercise.rest_time === 'number' && exercise.rest_time > 0 && (
                              <RestTimer restTime={exercise.rest_time} />
                            )}
                            <Button
                              size="sm"
                              variant={completed[exercise.id] ? 'secondary' : 'default'}
                              disabled={completed[exercise.id]}
                              onClick={() => handleComplete(exercise.id)}
                            >
                              {completed[exercise.id] ? 'Concluído' : 'Concluir'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodaysWorkout; 
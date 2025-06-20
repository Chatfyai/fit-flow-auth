import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ArrowLeft, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  variation?: string;
}

interface WorkoutDay {
  letter: string;
  name: string;
  exercises: Exercise[];
}

interface WeeklySchedule {
  [key: string]: string[];
}

const CreateWorkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([
    { letter: 'A', name: 'Treino A', exercises: [] }
  ]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    segunda: [],
    terca: [],
    quarta: [],
    quinta: [],
    sexta: [],
    sabado: [],
    domingo: []
  });
  const [expirationDate, setExpirationDate] = useState('');
  const [loading, setLoading] = useState(false);

  const availableLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const weekDays = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ];

  const addWorkoutDay = () => {
    const usedLetters = workoutDays.map(day => day.letter);
    const nextLetter = availableLetters.find(letter => !usedLetters.includes(letter));
    
    if (nextLetter) {
      setWorkoutDays([...workoutDays, {
        letter: nextLetter,
        name: `Treino ${nextLetter}`,
        exercises: []
      }]);
    }
  };

  const removeWorkoutDay = (index: number) => {
    const newWorkoutDays = workoutDays.filter((_, i) => i !== index);
    setWorkoutDays(newWorkoutDays);
  };

  const addExercise = (dayIndex: number) => {
    const newWorkoutDays = [...workoutDays];
    newWorkoutDays[dayIndex].exercises.push({
      id: Date.now().toString(),
      name: '',
      sets: '',
      variation: ''
    });
    setWorkoutDays(newWorkoutDays);
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, field: keyof Exercise, value: string) => {
    const newWorkoutDays = [...workoutDays];
    newWorkoutDays[dayIndex].exercises[exerciseIndex] = {
      ...newWorkoutDays[dayIndex].exercises[exerciseIndex],
      [field]: value
    };
    setWorkoutDays(newWorkoutDays);
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const newWorkoutDays = [...workoutDays];
    newWorkoutDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setWorkoutDays(newWorkoutDays);
  };

  const updateWeeklySchedule = (day: string, selectedWorkouts: string[]) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: selectedWorkouts
    });
  };

  const handleCompleteWorkout = async () => {
    if (!workoutName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o nome do treino",
        variant: "destructive"
      });
      return;
    }

    if (workoutDays.some(day => day.exercises.length === 0)) {
      toast({
        title: "Erro",
        description: "Todos os treinos devem ter pelo menos um exercício",
        variant: "destructive"
      });
      return;
    }

    if (!expirationDate) {
      toast({
        title: "Erro",
        description: "Por favor, selecione a data de vencimento",
        variant: "destructive"
      });
      return;
    }

    if (workoutDays.some(day => day.exercises.some(exercise => !exercise.name.trim() || !exercise.sets.trim()))) {
      toast({
        title: "Erro",
        description: "Todos os exercícios devem ter nome e séries preenchidos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Saving workout with data:', {
        user_id: user?.id,
        name: workoutName,
        workout_days: workoutDays,
        weekly_schedule: weeklySchedule,
        expiration_date: expirationDate
      });

      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user?.id,
          name: workoutName,
          workout_days: workoutDays,
          weekly_schedule: weeklySchedule,
          expiration_date: expirationDate,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Workout saved successfully:', data);

      toast({
        title: "Sucesso!",
        description: "Treino criado com sucesso!",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao criar treino:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar treino. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-primary-foreground">💪</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Criar Novo Treino</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nome do Treino */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workoutName">Nome do Treino</Label>
                <Input
                  id="workoutName"
                  placeholder="Ex: Treino de Hipertrofia"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treinos A, B, C, D, E */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Divisão de Treinos</CardTitle>
            {workoutDays.length < availableLetters.length && (
              <Button onClick={addWorkoutDay} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Treino
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {workoutDays.map((day, dayIndex) => (
                <Card key={day.letter} className="border-l-4 border-l-primary">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Treino {day.letter}</CardTitle>
                    {workoutDays.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeWorkoutDay(dayIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {day.exercises.map((exercise, exerciseIndex) => (
                        <div key={exercise.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                          <div>
                            <Label>Nome do Exercício</Label>
                            <Input
                              placeholder="Ex: Supino Reto"
                              value={exercise.name}
                              onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Séries e Repetições</Label>
                            <Input
                              placeholder="Ex: 3x de 12"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'sets', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Variação (Opcional)</Label>
                            <Input
                              placeholder="Ex: Inclinado, Pegada fechada"
                              value={exercise.variation || ''}
                              onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'variation', e.target.value)}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeExercise(dayIndex, exerciseIndex)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => addExercise(dayIndex)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Exercício
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição Semanal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Distribuição Semanal</CardTitle>
            <p className="text-sm text-muted-foreground">
              Defina quais treinos serão realizados em cada dia da semana
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weekDays.map(({ key, label }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Select
                    value={weeklySchedule[key].join(',')}
                    onValueChange={(value) => updateWeeklySchedule(key, value === 'rest' ? [] : value.split(','))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione os treinos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rest">Descanso</SelectItem>
                      {workoutDays.map(day => (
                        <SelectItem key={day.letter} value={day.letter}>
                          Treino {day.letter}
                        </SelectItem>
                      ))}
                      {workoutDays.length > 1 && workoutDays.map((day1, i) => 
                        workoutDays.slice(i + 1).map(day2 => (
                          <SelectItem key={`${day1.letter},${day2.letter}`} value={`${day1.letter},${day2.letter}`}>
                            Treinos {day1.letter} + {day2.letter}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data de Vencimento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Data de Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="max-w-xs"
            />
          </CardContent>
        </Card>

        {/* Botão Concluir */}
        <div className="text-center">
          <Button
            onClick={handleCompleteWorkout}
            disabled={loading}
            className="gradient-bg text-primary-foreground font-semibold px-8 py-3 text-lg"
          >
            {loading ? 'Salvando...' : 'Concluir Planejamento'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CreateWorkout;

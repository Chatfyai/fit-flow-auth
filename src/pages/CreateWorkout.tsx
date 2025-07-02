import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Exercise, WorkoutDay, WeeklySchedule } from '@/types/workout';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

const CreateWorkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const workoutToEdit = location.state?.workout;
  const isEditing = !!workoutToEdit;

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
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeWorkoutTab, setActiveWorkoutTab] = useState(0);
  
  // Estado para controlar quais campos têm erro
  const [fieldErrors, setFieldErrors] = useState({
    workoutName: false,
    expirationDate: false,
    exercises: {} as { [key: string]: { name: boolean; series: boolean; repetitions: boolean } }
  });

  useEffect(() => {
    if (workoutToEdit) {
      setWorkoutName(workoutToEdit.name || '');
      
      // Convert old format to new format if needed
      const convertedWorkoutDays = (workoutToEdit.workout_days || []).map((day: any) => ({
        ...day,
        exercises: (day.exercises || []).map((exercise: any) => {
          // If it's old format with 'sets' field, parse it
          if (exercise.sets && !exercise.series) {
            const setsMatch = exercise.sets.match(/(\d+)\s*x?\s*de?\s*(\d+)/i);
            if (setsMatch) {
              return {
                ...exercise,
                series: parseInt(setsMatch[1]),
                repetitions: setsMatch[2],
                sets: undefined // Remove old field
              };
            }
          }
          return exercise;
        })
      }));
      
      setWorkoutDays(convertedWorkoutDays);
      setWeeklySchedule(workoutToEdit.weekly_schedule || {
        segunda: [], terca: [], quarta: [], quinta: [], sexta: [], sabado: [], domingo: []
      });
      setExpirationDate(workoutToEdit.expiration_date || '');
      
      // Aguarda um pouco para garantir que os dados estão carregados
      setTimeout(() => setIsDataLoaded(true), 100);
    } else {
      setIsDataLoaded(true);
    }
  }, [workoutToEdit]);

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
      const newWorkoutDays = [...workoutDays, {
        letter: nextLetter,
        name: `Treino ${nextLetter}`,
        exercises: []
      }];
      setWorkoutDays(newWorkoutDays);
      // Mudar automaticamente para a nova aba criada
      setActiveWorkoutTab(newWorkoutDays.length - 1);
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
      series: 3,
      repetitions: '12',
      variation: '',
      rest_time: 60
    });
    setWorkoutDays(newWorkoutDays);
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, field: keyof Exercise, value: string | number) => {
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

  // Função para validar campos e destacar erros
  const validateFields = () => {
    const errors = {
      workoutName: false,
      expirationDate: false,
      exercises: {} as { [key: string]: { name: boolean; series: boolean; repetitions: boolean } }
    };

    // Validar nome do treino
    if (!workoutName.trim()) {
      errors.workoutName = true;
    }

    // Validar data de vencimento
    if (!expirationDate) {
      errors.expirationDate = true;
    }

    // Validar exercícios
    workoutDays.forEach((day, dayIndex) => {
      day.exercises.forEach((exercise, exerciseIndex) => {
        const key = `${dayIndex}-${exerciseIndex}`;
        errors.exercises[key] = {
          name: !exercise.name.trim(),
          series: !exercise.series || exercise.series <= 0,
          repetitions: !exercise.repetitions.trim()
        };
      });
    });

    setFieldErrors(errors);

    // Verificar se há algum erro
    const hasNameError = errors.workoutName;
    const hasDateError = errors.expirationDate;
    const hasExerciseErrors = Object.values(errors.exercises).some(exercise => 
      exercise.name || exercise.series || exercise.repetitions
    );

    return !hasNameError && !hasDateError && !hasExerciseErrors;
  };

  // Função para limpar erro de um campo específico
  const clearFieldError = (field: string, exerciseKey?: string) => {
    setFieldErrors(prev => {
      if (field === 'exercise' && exerciseKey) {
        return {
          ...prev,
          exercises: {
            ...prev.exercises,
            [exerciseKey]: {
              ...prev.exercises[exerciseKey],
              name: false,
              series: false,
              repetitions: false
            }
          }
        };
      }
      return {
        ...prev,
        [field]: false
      };
    });
  };

  const handleCompleteWorkout = async () => {
    // Validar campos e destacar erros
    if (!validateFields()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios destacados em vermelho",
        variant: "warning"
      });
      return;
    }

    // Verificar se todos os treinos têm pelo menos um exercício
    if (workoutDays.some(day => day.exercises.length === 0)) {
      toast({
        title: "Erro",
        description: "Todos os treinos devem ter pelo menos um exercício",
        variant: "warning"
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

      if (isEditing) {
        // Update existing workout
        const { data, error } = await supabase
          .from('workouts')
          .update({
            name: workoutName,
            workout_days: workoutDays as any,
            weekly_schedule: weeklySchedule as any,
            expiration_date: expirationDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', workoutToEdit.id)
          .select();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Workout updated successfully:', data);

        toast({
          title: "Sucesso!",
          description: "Treino atualizado com sucesso!",
          variant: "warning",
        });
      } else {
        // Create new workout
        const { data, error } = await supabase
          .from('workouts')
          .insert({
            user_id: user?.id,
            name: workoutName,
            workout_days: workoutDays as any,
            weekly_schedule: weeklySchedule as any,
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
          variant: "warning",
        });
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      toast({
        title: "Erro",
        description: `Erro ao ${isEditing ? 'atualizar' : 'criar'} treino. Tente novamente.`,
        variant: "warning"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 pb-20">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${isEditing ? 'py-12' : 'py-8'}`}>
        {isEditing && !isDataLoaded ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
              <PlayFitLogo size="lg" className="text-primary-foreground" />
            </div>
            <p className="text-gray-600 font-medium">Carregando dados do treino...</p>
          </div>
        ) : (
          <>
            {/* Nome do Treino */}
        <Card className="mb-8 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workoutName">Nome do Treino *</Label>
                <Input
                  id="workoutName"
                  placeholder="Ex: Treino de Hipertrofia"
                  value={workoutName}
                  onChange={(e) => {
                    setWorkoutName(e.target.value);
                    if (fieldErrors.workoutName) {
                      clearFieldError('workoutName');
                    }
                  }}
                  className={`rounded-xl border-2 transition-all duration-300 ${fieldErrors.workoutName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-yellow-400 focus:ring-yellow-200'}`}
                />
                {fieldErrors.workoutName && (
                  <p className="text-sm text-red-600 mt-1">Nome do treino é obrigatório</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treinos A, B, C, D, E */}
        <Card className="mb-8 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900">Divisão de Treinos</CardTitle>
              {workoutDays.length < availableLetters.length && (
                <Button onClick={addWorkoutDay} size="sm" className="gradient-bg text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Treino
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Navegação dos Treinos - Responsiva */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                {/* Setas de navegação */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveWorkoutTab(Math.max(0, activeWorkoutTab - 1))}
                  disabled={activeWorkoutTab === 0}
                  className="h-9 w-9 p-0 flex-shrink-0 rounded-xl border-2 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Container do carrossel */}
                <div className="flex-1 mx-3 overflow-hidden">
                  <div className="flex items-center justify-center gap-2">
                    {workoutDays.map((day, index) => {
                      const isActive = activeWorkoutTab === index;
                      const isVisible = Math.abs(index - activeWorkoutTab) <= 1; // Mostra treino ativo e adjacentes
                      
                      if (!isVisible && workoutDays.length > 3) return null;
                      
                      return (
                        <Button
                          key={day.letter}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveWorkoutTab(index)}
                          className={`
                            w-12 h-9 p-0 text-sm font-semibold transition-all duration-200 flex-shrink-0
                            ${isActive 
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg scale-110 border-2 border-yellow-400' 
                              : 'hover:bg-yellow-50 hover:border-yellow-300 text-gray-600'
                            }
                          `}
                        >
                          {day.letter}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveWorkoutTab(Math.min(workoutDays.length - 1, activeWorkoutTab + 1))}
                  disabled={activeWorkoutTab === workoutDays.length - 1}
                  className="h-9 w-9 p-0 flex-shrink-0 rounded-xl border-2 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Indicador de posição */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-xs text-muted-foreground">
                  Treino {activeWorkoutTab + 1} de {workoutDays.length}
                </div>
                <div className="flex gap-1">
                  {workoutDays.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 w-6 rounded-full transition-all duration-200 ${
                        activeWorkoutTab === index 
                          ? 'bg-yellow-500' 
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card do Treino Ativo */}
            {workoutDays[activeWorkoutTab] && (
              <Card className="border-l-4 border-l-yellow-500 rounded-xl bg-gradient-to-r from-yellow-50/50 to-white shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 font-bold text-gray-900">
                      <span className="bg-yellow-500 text-black px-3 py-2 rounded-xl text-sm font-bold shadow-md">
                        {workoutDays[activeWorkoutTab].letter}
                      </span>
                      Treino {workoutDays[activeWorkoutTab].letter}
                    </CardTitle>
                    {workoutDays.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          removeWorkoutDay(activeWorkoutTab);
                          // Ajustar a aba ativa se necessário
                          if (activeWorkoutTab >= workoutDays.length - 1) {
                            setActiveWorkoutTab(Math.max(0, workoutDays.length - 2));
                          }
                        }}
                        className="rounded-xl hover:scale-105 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workoutDays[activeWorkoutTab].exercises.map((exercise, exerciseIndex) => (
                      <div key={exercise.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-50/50 to-white shadow-sm hover:shadow-md transition-all duration-300">
                        <div>
                          <Label>Nome do Exercício *</Label>
                          <Input
                            placeholder="Ex: Supino Reto"
                            value={exercise.name}
                            onChange={(e) => {
                              updateExercise(activeWorkoutTab, exerciseIndex, 'name', e.target.value);
                              const exerciseKey = `${activeWorkoutTab}-${exerciseIndex}`;
                              if (fieldErrors.exercises[exerciseKey]?.name) {
                                clearFieldError('exercise', exerciseKey);
                              }
                            }}
                            className={`rounded-xl border-2 transition-all duration-300 ${fieldErrors.exercises[`${activeWorkoutTab}-${exerciseIndex}`]?.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-yellow-400 focus:ring-yellow-200'}`}
                          />
                          {fieldErrors.exercises[`${activeWorkoutTab}-${exerciseIndex}`]?.name && (
                            <p className="text-xs text-red-600 mt-1">Nome é obrigatório</p>
                          )}
                        </div>
                        <div>
                          <Label>Séries *</Label>
                          <Input
                            type="number"
                            placeholder="3"
                            value={exercise.series}
                            onChange={(e) => {
                              updateExercise(activeWorkoutTab, exerciseIndex, 'series', parseInt(e.target.value) || 0);
                              const exerciseKey = `${activeWorkoutTab}-${exerciseIndex}`;
                              if (fieldErrors.exercises[exerciseKey]?.series) {
                                clearFieldError('exercise', exerciseKey);
                              }
                            }}
                            className={`rounded-xl border-2 transition-all duration-300 ${fieldErrors.exercises[`${activeWorkoutTab}-${exerciseIndex}`]?.series ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-yellow-400 focus:ring-yellow-200'}`}
                          />
                          {fieldErrors.exercises[`${activeWorkoutTab}-${exerciseIndex}`]?.series && (
                            <p className="text-xs text-red-600 mt-1">Séries obrigatórias</p>
                          )}
                        </div>
                        <div>
                          <Label>Repetições *</Label>
                          <Input
                            placeholder="12"
                            value={exercise.repetitions}
                            onChange={(e) => {
                              updateExercise(activeWorkoutTab, exerciseIndex, 'repetitions', e.target.value);
                              const exerciseKey = `${activeWorkoutTab}-${exerciseIndex}`;
                              if (fieldErrors.exercises[exerciseKey]?.repetitions) {
                                clearFieldError('exercise', exerciseKey);
                              }
                            }}
                            className={`rounded-xl border-2 transition-all duration-300 ${fieldErrors.exercises[`${activeWorkoutTab}-${exerciseIndex}`]?.repetitions ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-yellow-400 focus:ring-yellow-200'}`}
                          />
                          {fieldErrors.exercises[`${activeWorkoutTab}-${exerciseIndex}`]?.repetitions && (
                            <p className="text-xs text-red-600 mt-1">Repetições obrigatórias</p>
                          )}
                        </div>
                        <div>
                          <Label>Variação (Opcional)</Label>
                          <Input
                            placeholder="Ex: Inclinado"
                            value={exercise.variation || ''}
                            onChange={(e) => updateExercise(activeWorkoutTab, exerciseIndex, 'variation', e.target.value)}
                            className="rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:ring-yellow-200 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label>Descanso (seg)</Label>
                          <Input
                            type="number"
                            placeholder="60"
                            value={exercise.rest_time || ''}
                            onChange={(e) => updateExercise(activeWorkoutTab, exerciseIndex, 'rest_time', parseInt(e.target.value) || 0)}
                            className="rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:ring-yellow-200 transition-all duration-300"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeExercise(activeWorkoutTab, exerciseIndex)}
                            className="w-full rounded-xl hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addExercise(activeWorkoutTab)}
                      className="w-full rounded-xl border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 transition-all duration-300 font-semibold"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Exercício
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Distribuição Semanal */}
        <Card className="mb-8 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Distribuição Semanal</CardTitle>
            <p className="text-sm text-gray-600">
              Defina quais treinos serão realizados em cada dia da semana
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weekDays.map(({ key, label }) => (
                <div key={key}>
                  <Label className="mb-3 block">{label}</Label>
                  <div className="space-y-3">
                    {/* Botão de Descanso */}
                    <Button
                      type="button"
                      variant={weeklySchedule[key].length === 0 ? "default" : "outline"}
                      className={`w-full justify-start rounded-xl transition-all duration-300 ${
                        weeklySchedule[key].length === 0 
                          ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200" 
                          : "border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                      onClick={() => updateWeeklySchedule(key, [])}
                    >
                      Descanso
                    </Button>
                    
                    {/* Botões de Treinos */}
                    <div className="flex flex-wrap gap-2">
                      {workoutDays.map(day => {
                        const isSelected = weeklySchedule[key].includes(day.letter);
                        return (
                          <Button
                            key={day.letter}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={`rounded-xl border-2 transition-all duration-300 ${
                              isSelected 
                                ? "gradient-bg text-white border-yellow-400 shadow-md" 
                                : "border-gray-200 hover:bg-yellow-50 hover:border-yellow-300"
                            }`}
                            onClick={() => {
                              const currentSchedule = weeklySchedule[key];
                              let newSchedule;
                              
                              if (isSelected) {
                                // Remove o treino se já estiver selecionado
                                newSchedule = currentSchedule.filter(letter => letter !== day.letter);
                              } else {
                                // Adiciona o treino se não estiver selecionado
                                newSchedule = [...currentSchedule, day.letter].sort();
                              }
                              
                              updateWeeklySchedule(key, newSchedule);
                            }}
                          >
                            {day.letter}
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* Exibição dos treinos selecionados */}
                    {weeklySchedule[key].length > 0 && (
                      <div className="mt-2 p-3 bg-gradient-to-r from-yellow-50 to-gray-50 rounded-xl border border-yellow-200">
                        <span className="text-sm text-gray-700 font-medium">
                          Treinos selecionados: {weeklySchedule[key].join(' + ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data de Vencimento */}
        <Card className="mb-8 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-900">
              <Calendar className="h-5 w-5 mr-2 text-yellow-500" />
              Data de Vencimento *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={expirationDate}
              onChange={(e) => {
                setExpirationDate(e.target.value);
                if (fieldErrors.expirationDate) {
                  clearFieldError('expirationDate');
                }
              }}
              className={`max-w-xs rounded-xl border-2 transition-all duration-300 ${fieldErrors.expirationDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-yellow-400 focus:ring-yellow-200'}`}
            />
            {fieldErrors.expirationDate && (
              <p className="text-sm text-red-600 mt-2">Data de vencimento é obrigatória</p>
            )}
          </CardContent>
        </Card>

        {/* Botão Concluir */}
        <div className="text-center">
          <Button
            onClick={handleCompleteWorkout}
            disabled={loading}
            className="gradient-bg text-primary-foreground font-semibold px-8 py-3 text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-out"
          >
            {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Concluir Planejamento')}
          </Button>
        </div>
          </>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default CreateWorkout;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  Scale, 
  Calendar as CalendarIcon, 
  HelpCircle, 
  Camera, 
  Plus,
  TrendingUp,
  User,
  Ruler,
  Target
} from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Agenda = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { latestMeasurement, saveMeasurement, loading } = useBodyMeasurements();
  
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    chest: '',
    waist: '',
    hip: '',
    rightBicep: '',
    leftBicep: '',
    rightForearm: '',
    leftForearm: '',
    rightThigh: '',
    leftThigh: '',
    rightCalf: '',
    leftCalf: '',
    bodyFat: '',
    notes: ''
  });

  // Dados anteriores vindos do banco de dados
  const getPreviousValue = (field: string): string | undefined => {
    if (!latestMeasurement) return undefined;
    
    const fieldMap: { [key: string]: keyof typeof latestMeasurement } = {
      weight: 'weight',
      height: 'height', 
      chest: 'chest',
      waist: 'waist',
      hip: 'hip',
      rightBicep: 'right_bicep',
      leftBicep: 'left_bicep',
      rightForearm: 'right_forearm',
      leftForearm: 'left_forearm',
      rightThigh: 'right_thigh',
      leftThigh: 'left_thigh',
      rightCalf: 'right_calf',
      leftCalf: 'left_calf',
      bodyFat: 'body_fat'
    };

    const dbField = fieldMap[field];
    const value = latestMeasurement[dbField];
    return value ? String(value) : undefined;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Validação básica
    if (!formData.weight || !formData.height) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha pelo menos o peso e a altura.',
        variant: 'destructive'
      });
      return;
    }

    // Preparar dados para salvamento
    const measurementData = {
      measurement_date: format(date, 'yyyy-MM-dd'),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      chest: formData.chest ? parseFloat(formData.chest) : undefined,
      waist: formData.waist ? parseFloat(formData.waist) : undefined,
      hip: formData.hip ? parseFloat(formData.hip) : undefined,
      right_bicep: formData.rightBicep ? parseFloat(formData.rightBicep) : undefined,
      left_bicep: formData.leftBicep ? parseFloat(formData.leftBicep) : undefined,
      right_forearm: formData.rightForearm ? parseFloat(formData.rightForearm) : undefined,
      left_forearm: formData.leftForearm ? parseFloat(formData.leftForearm) : undefined,
      right_thigh: formData.rightThigh ? parseFloat(formData.rightThigh) : undefined,
      left_thigh: formData.leftThigh ? parseFloat(formData.leftThigh) : undefined,
      right_calf: formData.rightCalf ? parseFloat(formData.rightCalf) : undefined,
      left_calf: formData.leftCalf ? parseFloat(formData.leftCalf) : undefined,
      body_fat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
      notes: formData.notes || undefined
    };

    // Salvar no banco de dados
    const success = await saveMeasurement(measurementData);
    
    if (success) {
      // Limpar formulário apenas se salvou com sucesso
      setFormData({
        weight: '',
        height: '',
        chest: '',
        waist: '',
        hip: '',
        rightBicep: '',
        leftBicep: '',
        rightForearm: '',
        leftForearm: '',
        rightThigh: '',
        leftThigh: '',
        rightCalf: '',
        leftCalf: '',
        bodyFat: '',
        notes: ''
      });
    }
  };

  const MeasurementField = ({ 
    label, 
    field, 
    previousValue, 
    helpText 
  }: { 
    label: string; 
    field: string; 
    previousValue?: string; 
    helpText?: string; 
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={field} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        {helpText && (
          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
        )}
      </div>
      <div className="flex items-center gap-3">
        <Input
          id={field}
          type="number"
          placeholder="0"
          value={formData[field as keyof typeof formData]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="flex-1"
        />
        {previousValue && (
          <span className="text-xs text-gray-500 min-w-[100px]">
            Anterior: {previousValue} cm
          </span>
        )}
      </div>
    </div>
  );

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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                {user ? `Olá, ${user?.user_metadata?.full_name || user?.email}!` : 'Visitante - Faça login para salvar seu progresso'}
              </span>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Data da Medição */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Data da Medição
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP', { locale: ptBR }) : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Separator className="my-6" />

            {/* Dados Principais */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-yellow-500" />
                Dados Principais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                    Peso (kg)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 70.5"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="flex-1"
                    />
                    {getPreviousValue('weight') && (
                      <span className="text-xs text-gray-500 min-w-[100px]">
                        Anterior: {getPreviousValue('weight')} kg
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm font-medium text-gray-700">
                    Altura (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Ex: 175"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Medidas Corporais */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-yellow-500" />
                Medidas Corporais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MeasurementField
                  label="Peitoral (cm)"
                  field="chest"
                  previousValue={getPreviousValue('chest')}
                  helpText="Medir na altura dos mamilos, com o peito expandido"
                />
                <MeasurementField
                  label="Cintura (cm)"
                  field="waist"
                  previousValue={getPreviousValue('waist')}
                  helpText="Medir na altura do umbigo, sem forçar a barriga"
                />
                <MeasurementField
                  label="Quadril (cm)"
                  field="hip"
                  previousValue={getPreviousValue('hip')}
                  helpText="Medir na parte mais larga do quadril"
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Percentual de Gordura (%)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 15.5"
                      value={formData.bodyFat}
                      onChange={(e) => handleInputChange('bodyFat', e.target.value)}
                      className="flex-1"
                    />
                    {getPreviousValue('bodyFat') && (
                      <span className="text-xs text-gray-500 min-w-[100px]">
                        Anterior: {getPreviousValue('bodyFat')}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Membros Superiores */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Membros Superiores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MeasurementField
                    label="Bíceps Direito (cm)"
                    field="rightBicep"
                    previousValue={getPreviousValue('rightBicep')}
                    helpText="Medir com o braço contraído"
                  />
                  <MeasurementField
                    label="Bíceps Esquerdo (cm)"
                    field="leftBicep"
                    previousValue={getPreviousValue('leftBicep')}
                    helpText="Medir com o braço contraído"
                  />
                  <MeasurementField
                    label="Antebraço Direito (cm)"
                    field="rightForearm"
                    previousValue={getPreviousValue('rightForearm')}
                    helpText="Medir na parte mais larga do antebraço"
                  />
                  <MeasurementField
                    label="Antebraço Esquerdo (cm)"
                    field="leftForearm"
                    previousValue={getPreviousValue('leftForearm')}
                    helpText="Medir na parte mais larga do antebraço"
                  />
                </div>
              </div>

              {/* Membros Inferiores */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Membros Inferiores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MeasurementField
                    label="Coxa Direita (cm)"
                    field="rightThigh"
                    previousValue={getPreviousValue('rightThigh')}
                    helpText="Medir na parte mais larga da coxa"
                  />
                  <MeasurementField
                    label="Coxa Esquerda (cm)"
                    field="leftThigh"
                    previousValue={getPreviousValue('leftThigh')}
                    helpText="Medir na parte mais larga da coxa"
                  />
                  <MeasurementField
                    label="Panturrilha Direita (cm)"
                    field="rightCalf"
                    previousValue={getPreviousValue('rightCalf')}
                    helpText="Medir na parte mais larga da panturrilha"
                  />
                  <MeasurementField
                    label="Panturrilha Esquerda (cm)"
                    field="leftCalf"
                    previousValue={getPreviousValue('leftCalf')}
                    helpText="Medir na parte mais larga da panturrilha"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Fotos de Progresso */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5 text-yellow-500" />
                Fotos de Progresso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Foto de Frente', 'Foto de Lado', 'Foto de Costas'].map((photoType) => (
                  <div key={photoType} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-yellow-400 transition-colors">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">{photoType}</p>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Notas */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-yellow-500" />
                Notas da Semana
              </h3>
              <Textarea
                placeholder="Ex: Comecei a fazer cardio 3x na semana. Me senti com mais energia..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Botão de Ação */}
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Meu Progresso'}
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Agenda; 
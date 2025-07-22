import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Settings, 
  Mail, 
  Calendar, 
  Ruler, 
  Scale, 
  TrendingUp, 
  Target,
  Edit2,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { latestMeasurement, loading } = useBodyMeasurements();

  // Dados padrão quando não há medições
  const defaultMeasurements = {
    weight: 0,
    height: 0,
    chest: 0,
    waist: 0,
    hip: 0,
    right_bicep: 0,
    left_bicep: 0,
    right_forearm: 0,
    left_forearm: 0,
    right_thigh: 0,
    left_thigh: 0,
    right_calf: 0,
    left_calf: 0,
    body_fat: 0,
    measurement_date: new Date().toISOString().split('T')[0]
  };

  // Usar dados reais do banco ou dados padrão
  const currentMeasurements = latestMeasurement || defaultMeasurements;

  // Função para calcular IMC
  const calculateIMC = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const h = height / 100; // converter cm para metros
    return parseFloat((weight / (h * h)).toFixed(1));
  };

  // Função para classificar IMC
  const getIMCStatus = (imc: number) => {
    if (imc === 0) return { status: 'Não informado', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: AlertCircle };
    if (imc < 18.5) return { status: 'Abaixo do peso', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: AlertCircle };
    if (imc >= 18.5 && imc < 25) return { status: 'Peso normal', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
    if (imc >= 25 && imc < 30) return { status: 'Sobrepeso', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertCircle };
    if (imc >= 30 && imc < 35) return { status: 'Obesidade grau I', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: AlertCircle };
    if (imc >= 35 && imc < 40) return { status: 'Obesidade grau II', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle };
    return { status: 'Obesidade grau III', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle };
  };

  // Função para avaliar percentual de gordura
  const getBodyFatStatus = (bodyFat: number, gender: 'M' | 'F' = 'M') => {
    if (!bodyFat) return { status: 'Não informado', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: AlertCircle };
    
    if (gender === 'M') {
      if (bodyFat < 6) return { status: 'Muito baixo', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: AlertCircle };
      if (bodyFat >= 6 && bodyFat < 14) return { status: 'Atlético', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
      if (bodyFat >= 14 && bodyFat < 18) return { status: 'Bom', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
      if (bodyFat >= 18 && bodyFat < 25) return { status: 'Médio', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertCircle };
      return { status: 'Alto', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle };
    } else {
      if (bodyFat < 16) return { status: 'Muito baixo', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: AlertCircle };
      if (bodyFat >= 16 && bodyFat < 20) return { status: 'Atlético', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
      if (bodyFat >= 20 && bodyFat < 25) return { status: 'Bom', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
      if (bodyFat >= 25 && bodyFat < 32) return { status: 'Médio', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertCircle };
      return { status: 'Alto', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle };
    }
  };

  const getUserInitials = () => {
    if (!user) return 'V';
    const name = user.user_metadata?.full_name || user.email || 'Usuário';
    return name.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    if (!user) return 'Visitante';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
  };

  const getMembershipDate = () => {
    if (!user) return 'N/A';
    const date = new Date(user.created_at);
    return date.toLocaleDateString('pt-BR');
  };

  const getLastUpdateDate = () => {
    if (!latestMeasurement) return 'Nunca';
    const date = new Date(latestMeasurement.measurement_date);
    return date.toLocaleDateString('pt-BR');
  };

  // Calcular valores
  const imc = calculateIMC(currentMeasurements.weight || 0, currentMeasurements.height || 0);
  const imcStatus = getIMCStatus(imc);
  const bodyFatStatus = getBodyFatStatus(currentMeasurements.body_fat || 0);

  // Verificar se há dados para mostrar
  const hasData = latestMeasurement !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 pb-20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mr-1">
                <PlayFitLogo size="sm" className="text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PlayFit</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Usuário */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-20 h-20 bg-yellow-500">
                    <AvatarFallback className="text-white text-2xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{getUserName()}</h3>
                    <p className="text-gray-600 text-sm">{user?.email || 'visitante@playfit.com'}</p>
                  </div>
                  <Badge className="bg-yellow-500 text-white">
                    {user ? 'Membro Ativo' : 'Visitante'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-600">{user?.email || 'visitante@playfit.com'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Membro desde</p>
                    <p className="text-sm text-gray-600">{getMembershipDate()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p className="text-sm text-green-600 font-medium">Ativo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-lg hover:shadow-xl"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </div>

          {/* Dados Atuais */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                  Dados Atuais
                </CardTitle>
                <CardDescription>
                  {hasData ? `Última atualização: ${getLastUpdateDate()}` : 'Nenhuma medição registrada ainda'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!hasData ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <Scale className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma medição encontrada</h3>
                      <p className="text-gray-600 mb-4">Registre suas primeiras medições para começar a acompanhar sua evolução!</p>
                    </div>
                    <Button 
                      onClick={() => navigate('/agenda')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                    >
                      Registrar Primeira Medição
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Dados Principais */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-yellow-500" />
                        Dados Principais
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Scale className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">
                            {currentMeasurements.weight || '-'}
                          </p>
                          <p className="text-sm text-gray-600">Peso (kg)</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Ruler className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">
                            {currentMeasurements.height || '-'}
                          </p>
                          <p className="text-sm text-gray-600">Altura (cm)</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Target className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">
                            {currentMeasurements.body_fat || '-'}
                          </p>
                          <p className="text-sm text-gray-600">Gordura (%)</p>
                          <div className={`mt-2 p-2 rounded-lg ${bodyFatStatus.bgColor}`}>
                            <div className="flex items-center justify-center gap-1">
                              <bodyFatStatus.icon className={`h-4 w-4 ${bodyFatStatus.color}`} />
                              <span className={`text-xs font-medium ${bodyFatStatus.color}`}>
                                {bodyFatStatus.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Activity className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">{imc || '-'}</p>
                          <p className="text-sm text-gray-600">IMC</p>
                          <div className={`mt-2 p-2 rounded-lg ${imcStatus.bgColor}`}>
                            <div className="flex items-center justify-center gap-1">
                              <imcStatus.icon className={`h-4 w-4 ${imcStatus.color}`} />
                              <span className={`text-xs font-medium ${imcStatus.color}`}>
                                {imcStatus.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Resumo */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <h5 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-yellow-600" />
                        Análise da Evolução
                      </h5>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>• <strong>IMC:</strong> {imc || 'N/A'} - {imcStatus.status}</p>
                        <p>• <strong>Gordura Corporal:</strong> {currentMeasurements.body_fat || 'N/A'}% - {bodyFatStatus.status}</p>
                        <p className="text-xs text-gray-600 mt-2">
                          {hasData && imc > 0 ? (
                            imcStatus.status === 'Peso normal' && bodyFatStatus.status === 'Bom' ? 
                              '✅ Excelente! Você está dentro dos parâmetros ideais.' :
                              '⚠️ Considere ajustar sua alimentação e treino para otimizar seus resultados.'
                          ) : (
                            '📊 Registre suas medições para receber análises personalizadas.'
                          )}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Medidas Corporais */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Medidas Corporais (cm)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Peitoral</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {currentMeasurements.chest || '-'} cm
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Cintura</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {currentMeasurements.waist || '-'} cm
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Quadril</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {currentMeasurements.hip || '-'} cm
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Membros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-md font-medium text-gray-800 mb-3">Membros Superiores</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Bíceps Direito</span>
                            <span className="font-medium">{currentMeasurements.right_bicep || '-'} cm</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Bíceps Esquerdo</span>
                            <span className="font-medium">{currentMeasurements.left_bicep || '-'} cm</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Antebraço Direito</span>
                            <span className="font-medium">{currentMeasurements.right_forearm || '-'} cm</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Antebraço Esquerdo</span>
                            <span className="font-medium">{currentMeasurements.left_forearm || '-'} cm</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-md font-medium text-gray-800 mb-3">Membros Inferiores</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Coxa Direita</span>
                            <span className="font-medium">{currentMeasurements.right_thigh || '-'} cm</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Coxa Esquerda</span>
                            <span className="font-medium">{currentMeasurements.left_thigh || '-'} cm</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Panturrilha Direita</span>
                            <span className="font-medium">{currentMeasurements.right_calf || '-'} cm</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Panturrilha Esquerda</span>
                            <span className="font-medium">{currentMeasurements.left_calf || '-'} cm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-6 pt-4 border-t">
                  <Button 
                    onClick={() => navigate('/agenda')}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Carregando...' : hasData ? 'Atualizar Medições' : 'Registrar Primeira Medição'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Profile; 
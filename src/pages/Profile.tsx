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
  Activity
} from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dados simulados das medições atuais (em uma aplicação real, viria do banco de dados)
  const currentMeasurements = {
    weight: '81.5',
    height: '175',
    chest: '102',
    waist: '83',
    hip: '97',
    rightBicep: '38.5',
    leftBicep: '38',
    rightForearm: '28.5',
    leftForearm: '28',
    rightThigh: '59',
    leftThigh: '58.5',
    rightCalf: '37',
    leftCalf: '36.5',
    bodyFat: '14.8',
    lastUpdate: '2025-01-15'
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
                  Última atualização: {new Date(currentMeasurements.lastUpdate).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Dados Principais */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-yellow-500" />
                    Dados Principais
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Scale className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{currentMeasurements.weight}</p>
                      <p className="text-sm text-gray-600">Peso (kg)</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Ruler className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{currentMeasurements.height}</p>
                      <p className="text-sm text-gray-600">Altura (cm)</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Target className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{currentMeasurements.bodyFat}</p>
                      <p className="text-sm text-gray-600">Gordura (%)</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Activity className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(Number(currentMeasurements.weight) / Math.pow(Number(currentMeasurements.height) / 100, 2))}
                      </p>
                      <p className="text-sm text-gray-600">IMC</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Medidas Corporais */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Medidas Corporais (cm)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Peitoral</span>
                      <span className="text-sm font-semibold text-gray-900">{currentMeasurements.chest} cm</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Cintura</span>
                      <span className="text-sm font-semibold text-gray-900">{currentMeasurements.waist} cm</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Quadril</span>
                      <span className="text-sm font-semibold text-gray-900">{currentMeasurements.hip} cm</span>
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
                        <span className="font-medium">{currentMeasurements.rightBicep} cm</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Bíceps Esquerdo</span>
                        <span className="font-medium">{currentMeasurements.leftBicep} cm</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Antebraço Direito</span>
                        <span className="font-medium">{currentMeasurements.rightForearm} cm</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Antebraço Esquerdo</span>
                        <span className="font-medium">{currentMeasurements.leftForearm} cm</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-md font-medium text-gray-800 mb-3">Membros Inferiores</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Coxa Direita</span>
                        <span className="font-medium">{currentMeasurements.rightThigh} cm</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Coxa Esquerda</span>
                        <span className="font-medium">{currentMeasurements.leftThigh} cm</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Panturrilha Direita</span>
                        <span className="font-medium">{currentMeasurements.rightCalf} cm</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Panturrilha Esquerda</span>
                        <span className="font-medium">{currentMeasurements.leftCalf} cm</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <Button 
                    onClick={() => navigate('/agenda')}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                  >
                    Atualizar Medições
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
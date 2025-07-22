import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Footprints, 
  CalendarCheck, 
  Award, 
  Flame, 
  CalendarHeart, 
  TrendingUp, 
  Sun,
  Sparkles
} from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
  special?: boolean;
}

const Badges = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const badges: Badge[] = [
    {
      id: 'primeiro-passo',
      title: 'Primeiro Passo',
      description: 'Conclua seu primeiro treino.',
      icon: (
        <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFD65A' }}>
          <Footprints className="w-12 h-12" style={{ color: '#FFE8B3' }} />
        </div>
      ),
      achieved: true
    },
    {
      id: 'semana-perfeita',
      title: 'Semana Perfeita',
      description: 'Treine todos os dias recomendados.',
      icon: (
        <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFD65A' }}>
          <CalendarCheck className="w-12 h-12" style={{ color: '#FFE8B3' }} />
        </div>
      ),
      achieved: false
    },
    {
      id: 'meio-centenario',
      title: 'Meio Centenário',
      description: 'Complete 50 treinos.',
      icon: (
        <div className="w-24 h-24 mb-4 flex items-center justify-center font-bold text-4xl rounded-full border-4" style={{ backgroundColor: '#FFD65A', color: '#FFE8B3', borderColor: '#FFD65A' }}>
          50
        </div>
      ),
      achieved: false
    },
    {
      id: 'compromisso-dourado',
      title: 'Compromisso Dourado',
      description: 'Treine por 3 meses.',
      icon: (
        <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFD65A' }}>
          <Award className="w-20 h-20" style={{ color: '#FFE8B3' }} />
        </div>
      ),
      achieved: false
    },
    {
      id: 'inicio-forte',
      title: 'Início Forte',
      description: 'Treine em 7 dias diferentes.',
      icon: (
        <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center relative" style={{ backgroundColor: '#FFD65A' }}>
          <span className="text-4xl font-bold" style={{ color: '#FFE8B3' }}>7</span>
          <Flame className="w-6 h-6 absolute bottom-1 right-1" style={{ color: '#FFE8B3' }} />
        </div>
      ),
      achieved: true
    },
    {
      id: 'habito-criado',
      title: 'Hábito Criado',
      description: 'Treine em 30 dias diferentes.',
      icon: (
        <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFD65A' }}>
          <CalendarHeart className="w-12 h-12" style={{ color: '#FFE8B3' }} />
        </div>
      ),
      achieved: false
    },
    {
      id: 'estilo-vida',
      title: 'Estilo de Vida',
      description: 'Treine em 90 dias diferentes.',
      icon: (
        <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFD65A' }}>
          <TrendingUp className="w-12 h-12" style={{ color: '#FFE8B3' }} />
        </div>
      ),
      achieved: false
    },
    {
      id: 'meio-ano-lendario',
      title: 'Meio Ano Lendário',
      description: 'Treine em 180 dias diferentes.',
      icon: (
        <div className="w-24 h-24 mb-4 flex items-center justify-center font-bold text-3xl border-4" style={{ backgroundColor: '#FFD65A', color: '#FFE8B3', borderColor: '#FFD65A', clipPath: 'polygon(0 25%, 50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%)' }}>
          180
        </div>
      ),
      achieved: false
    },
    {
      id: 'dedicacao-anual',
      title: 'Dedicação Anual',
      description: 'Treine em 365 dias diferentes.',
      icon: (
        <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFD65A' }}>
          <Sun className="w-16 h-16 animate-spin" style={{ color: '#FFE8B3', animationDuration: '10s' }} />
        </div>
      ),
      achieved: false
    },
    {
      id: 'lenda-playfit',
      title: 'Lenda do PlayFit',
      description: 'Conquiste todos os emblemas.',
      icon: (
        <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow-lg animate-pulse">
          <Sparkles className="w-14 h-14 text-white" />
        </div>
      ),
      achieved: false,
      special: true
    }
  ];

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
                {user ? `Olá, ${user?.user_metadata?.full_name || user?.email}!` : 'Visitante - Faça login para rastrear seus emblemas'}
              </span>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Aviso para visitantes */}
      {!user && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-amber-600 mr-2" />
              <div className="text-sm text-amber-800">
                <strong>Você está navegando como visitante.</strong> Para desbloquear emblemas reais, 
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Galeria de Emblemas
          </h1>
          <p className="text-gray-600 text-lg">
            Suas principais conquistas na jornada PlayFit
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {badges.map((badge) => (
            <Card 
              key={badge.id} 
              className={`
                relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg
                bg-white border-yellow-300 shadow-md
                ${badge.special ? 'border-yellow-500 shadow-yellow-200' : ''}
              `}
            >
              <CardContent className="p-6 text-center">
                {/* Badge Icon */}
                <div className="relative flex justify-center items-center">
                  {badge.icon}
                  {/* Achievement Overlay */}
                  {!badge.achieved && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🔒</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Badge Info */}
                <h3 className={`font-bold text-lg mb-2 ${badge.achieved ? 'text-yellow-600' : 'text-gray-500'}`}>
                  {badge.title}
                </h3>
                <p className={`text-sm ${badge.achieved ? 'text-gray-700' : 'text-gray-400'}`}>
                  {badge.description}
                </p>

                {/* Achievement Status */}
                {badge.achieved && (
                  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ✅ Conquistado
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-12 mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Progresso dos Emblemas
              </h2>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {badges.filter(b => b.achieved).length}
                  </div>
                  <div className="text-sm text-gray-600">Conquistados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">
                    {badges.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.round((badges.filter(b => b.achieved).length / badges.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Completo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Badges; 
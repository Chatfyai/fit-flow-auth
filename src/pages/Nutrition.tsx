import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Apple, Zap } from 'lucide-react';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { useAuth } from '@/contexts/AuthContext';

const Nutrition = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center">
                <Apple className="h-6 w-6 mr-2 text-red-500" />
                Nutrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl warning-card-playfit">
                  <div className="flex items-center justify-center mb-3">
                    <Zap className="h-6 w-6 warning-icon mr-2" />
                    <span className="font-semibold warning-title">Em Desenvolvimento</span>
                  </div>
                  <p className="text-sm warning-text leading-relaxed">
                    Esta funcionalidade ainda não está disponível na versão atual do PlayFit. 
                    Estamos trabalhando para trazer em breve recursos como:
                  </p>
                  <ul className="text-sm warning-text mt-3 space-y-1">
                    <li>• Plano alimentar personalizado</li>
                    <li>• Contador de calorias</li>
                    <li>• Registro de refeições</li>
                    <li>• Análise nutricional</li>
                    <li>• Receitas saudáveis</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full gradient-bg text-primary-foreground font-semibold shadow-lg hover:shadow-xl"
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Nutrition; 
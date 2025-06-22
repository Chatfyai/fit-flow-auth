import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ArrowLeft, Settings, Zap } from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 pb-20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="mr-3 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Perfil</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Perfil do Usuário
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Gerencie suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center justify-center mb-3">
                    <Zap className="h-6 w-6 text-yellow-600 mr-2" />
                    <span className="font-semibold text-yellow-800">Em Desenvolvimento</span>
                  </div>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    Esta funcionalidade ainda não está disponível na versão atual do PlayFit. 
                    Estamos trabalhando para trazer em breve recursos como:
                  </p>
                  <ul className="text-sm text-yellow-700 mt-3 space-y-1">
                    <li>• Edição de dados pessoais</li>
                    <li>• Configurações de preferências</li>
                    <li>• Histórico de atividades</li>
                    <li>• Estatísticas detalhadas</li>
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

export default Profile; 
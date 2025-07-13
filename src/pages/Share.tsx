import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Plus, Share2, Users, Calendar, Clock, ExternalLink, Trash2 } from 'lucide-react';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Share = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [challengeLink, setChallengeLink] = useState('');
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [challengeData, setChallengeData] = useState({
    title: '',
    description: '',
    endDate: '',
    maxParticipants: '',
    scoringType: 'percentage', // 'percentage' ou 'daily'
  });

  // Carregar desafios do usuário
  useEffect(() => {
    if (user) {
      loadUserChallenges();
    }
  }, [user]);

  const loadUserChallenges = () => {
    if (!user) return;
    
    const challenges = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('challenge_')) {
        const challengeData = localStorage.getItem(key);
        if (challengeData) {
          const challenge = JSON.parse(challengeData);
          if (challenge.createdBy === (user.user_metadata?.full_name || user.email)) {
            // Buscar número de participantes
            const participantsData = localStorage.getItem(`${key}_participants`);
            const participants = participantsData ? JSON.parse(participantsData) : [];
            challenges.push({
              ...challenge,
              participants: participants.length
            });
          }
        }
      }
    }
    setUserChallenges(challenges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleCreateChallenge = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!challengeData.title || !challengeData.description || !challengeData.endDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Simular criação de desafio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerar ID único para o desafio
      const challengeId = Date.now().toString();
      const link = `${window.location.origin}/join-challenge/${challengeId}`;
      setChallengeLink(link);

      toast({
        title: "Desafio criado com sucesso!",
        description: "Compartilhe o link com seus amigos",
        className: 'warning-card-playfit shadow-lg border-2',
        style: {
          backgroundColor: 'oklch(0.9 0.15 85)',
          borderColor: 'oklch(0.85 0.12 75)',
          color: '#ffffff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }
      });

      // Salvar no localStorage para demonstração
      const challengeInfo = {
        id: challengeId,
        title: challengeData.title,
        description: challengeData.description,
        endDate: challengeData.endDate,
        maxParticipants: challengeData.maxParticipants,
        scoringType: challengeData.scoringType,
        createdBy: user.user_metadata?.full_name || user.email,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      localStorage.setItem(`challenge_${challengeId}`, JSON.stringify(challengeInfo));

      // Recarregar lista de desafios
      loadUserChallenges();

      // Resetar formulário
      setChallengeData({
        title: '',
        description: '',
        endDate: '',
        maxParticipants: '',
        scoringType: 'percentage',
      });
    } catch (error) {
      console.error('Erro ao criar desafio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o desafio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link copiado!",
        description: "O link do desafio foi copiado para a área de transferência",
        className: 'warning-card-playfit shadow-lg border-2',
        style: {
          backgroundColor: 'oklch(0.9 0.15 85)',
          borderColor: 'oklch(0.85 0.12 75)',
          color: '#ffffff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive",
      });
    }
  };

  const deleteChallenge = (challengeId: string) => {
    localStorage.removeItem(`challenge_${challengeId}`);
    localStorage.removeItem(`challenge_${challengeId}_participants`);
    loadUserChallenges();
    toast({
      title: "Desafio excluído",
      description: "O desafio foi removido com sucesso",
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
                {user ? `Olá, ${user?.user_metadata?.full_name || user?.email}!` : 'Visitante - Faça login para criar desafios'}
              </span>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Compartilhar e Desafiar
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Crie desafios fitness com seus amigos e mantenha a motivação em alta!
          </p>
        </div>

        {/* Aviso para visitantes */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Share2 className="h-5 w-5 text-amber-600 mr-2" />
              <div className="text-sm text-amber-800">
                <strong>Você está navegando como visitante.</strong> Para criar desafios com amigos, 
                <button 
                  onClick={() => navigate('/login')}
                  className="text-amber-600 hover:text-amber-800 underline ml-1"
                >
                  faça login aqui
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Seção de desafios criados */}
        {user && userChallenges.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Meus Desafios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userChallenges.map((challenge) => {
                const daysRemaining = getDaysRemaining(challenge.endDate);
                const challengeLink = `${window.location.origin}/join-challenge/${challenge.id}`;
                
                return (
                  <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {challenge.description}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 ${
                            challenge.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {challenge.status === 'active' ? 'Ativo' : 'Finalizado'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{challenge.participants} participantes</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                              {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Finalizado'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Termina em: {new Date(challenge.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(challengeLink)}
                            className="flex-1"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar Link
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/challenge/${challenge.id}`)}
                            className="flex-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver Grupo
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteChallenge(challenge.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Card principal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-3 text-primary" />
              Desafios com Amigos
            </CardTitle>
            <CardDescription>
              Motive-se junto com seus amigos criando desafios personalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Como funciona?</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Crie um desafio personalizado</li>
                    <li>• Defina regras e data de término</li>
                    <li>• Compartilhe o link com amigos</li>
                    <li>• Acompanhe o progresso do grupo</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Exemplos de desafios</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 30 dias de caminhada</li>
                    <li>• Desafio de flexões</li>
                    <li>• Meta de passos diários</li>
                    <li>• Exercícios semanais</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg"
                      className="gradient-bg text-primary-foreground font-semibold shadow-lg hover:shadow-xl"
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                          return;
                        }
                        setShowCreateDialog(true);
                      }}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Criar Desafio com Amigos
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Desafio</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título do Desafio *</Label>
                        <Input
                          id="title"
                          placeholder="Ex: Desafio 30 dias de caminhada"
                          value={challengeData.title}
                          onChange={(e) => setChallengeData({...challengeData, title: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Descrição *</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva o objetivo do desafio..."
                          value={challengeData.description}
                          onChange={(e) => setChallengeData({...challengeData, description: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>Tipo de Pontuação *</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="percentage"
                              name="scoringType"
                              value="percentage"
                              checked={challengeData.scoringType === 'percentage'}
                              onChange={(e) => setChallengeData({...challengeData, scoringType: e.target.value})}
                              className="rounded-full border-gray-300 text-yellow-500 focus:ring-yellow-500"
                            />
                            <label htmlFor="percentage" className="text-sm font-medium">
                              Soma por % de treino concluído
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="daily"
                              name="scoringType"
                              value="daily"
                              checked={challengeData.scoringType === 'daily'}
                              onChange={(e) => setChallengeData({...challengeData, scoringType: e.target.value})}
                              className="rounded-full border-gray-300 text-yellow-500 focus:ring-yellow-500"
                            />
                            <label htmlFor="daily" className="text-sm font-medium">
                              Todo dia vale 1 ponto de treino concluído
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="endDate">Data de Término *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={challengeData.endDate}
                          onChange={(e) => setChallengeData({...challengeData, endDate: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="maxParticipants">Máximo de Participantes (opcional)</Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          min="2"
                          max="100"
                          placeholder="Deixe vazio para ilimitado"
                          value={challengeData.maxParticipants}
                          onChange={(e) => setChallengeData({...challengeData, maxParticipants: e.target.value})}
                        />
                      </div>

                      <Button 
                        onClick={handleCreateChallenge}
                        disabled={isCreating}
                        className="w-full gradient-bg text-primary-foreground font-semibold shadow-lg hover:shadow-xl"
                      >
                        {isCreating ? 'Criando...' : 'Criar Desafio'}
                      </Button>

                      {challengeLink && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                          <Label className="text-green-800 font-semibold">Link do Desafio:</Label>
                          <div className="flex items-center space-x-2 mt-2">
                            <Input
                              value={challengeLink}
                              readOnly
                              className="flex-1 bg-white text-sm"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(challengeLink)}
                              className="whitespace-nowrap"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copiar
                            </Button>
                          </div>
                          <p className="text-sm text-green-700 mt-2">
                            Compartilhe este link com seus amigos para que possam participar do desafio!
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão voltar */}
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="shadow-lg hover:shadow-xl"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Share; 
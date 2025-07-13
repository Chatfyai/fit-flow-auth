import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Target, CheckCircle, XCircle } from 'lucide-react';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const JoinChallenge = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (id) {
      // Buscar dados do desafio do localStorage
      const storedChallenge = localStorage.getItem(`challenge_${id}`);
      if (storedChallenge) {
        const challengeData = JSON.parse(storedChallenge);
        
        // Buscar participantes
        const participantsData = localStorage.getItem(`challenge_${id}_participants`);
        const participants = participantsData ? JSON.parse(participantsData) : [];
        
        setChallenge({
          ...challengeData,
          currentParticipants: participants.length
        });
      }
    }
    setLoading(false);
  }, [id]);

  const handleJoinChallenge = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setJoining(true);

    try {
      // Verificar se o usuário já está no desafio
      const participantsData = localStorage.getItem(`challenge_${id}_participants`);
      const participants = participantsData ? JSON.parse(participantsData) : [];
      
      const userExists = participants.find((p: any) => p.userId === user.id);
      if (userExists) {
        toast({
          title: "Já está participando",
          description: "Você já faz parte deste desafio",
          variant: "destructive",
        });
        navigate(`/challenge/${id}`);
        return;
      }

      // Verificar limite de participantes
      if (challenge.maxParticipants && participants.length >= challenge.maxParticipants) {
        toast({
          title: "Desafio lotado",
          description: "Este desafio já atingiu o limite de participantes",
          variant: "destructive",
        });
        setJoining(false);
        return;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Adicionar usuário aos participantes
      const newParticipant = {
        userId: user.id,
        name: user.user_metadata?.full_name || user.email,
        email: user.email,
        role: 'participant',
        joinedAt: new Date().toISOString(),
        progress: 0
      };
      
      participants.push(newParticipant);
      localStorage.setItem(`challenge_${id}_participants`, JSON.stringify(participants));

      toast({
        title: "Desafio aceito!",
        description: "Você agora faz parte do desafio. Boa sorte!",
        className: 'warning-card-playfit shadow-lg border-2',
        style: {
          backgroundColor: 'oklch(0.9 0.15 85)',
          borderColor: 'oklch(0.85 0.12 75)',
          color: '#ffffff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }
      });

      // Redirecionar para a página do desafio
      navigate(`/challenge/${id}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível participar do desafio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <PlayFitLogo size="lg" className="text-primary-foreground" />
          </div>
          <p className="text-gray-600 font-medium">Carregando desafio...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Desafio não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">O desafio que você está procurando não existe ou foi removido.</p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10">
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Você foi convidado para um desafio!
          </h2>
          <p className="text-xl text-gray-600">
            Aceite o convite e junte-se aos seus amigos neste desafio fitness
          </p>
        </div>

        {/* Aviso para visitantes */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-blue-600 mr-2" />
              <div className="text-sm text-blue-800">
                <strong>Faça login para participar!</strong> Você precisa estar logado no PlayFit para aceitar o convite.
                <button 
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  Entrar agora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card do desafio */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{challenge.title}</CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {challenge.status === 'active' ? 'Ativo' : 'Finalizado'}
              </Badge>
            </div>
            <CardDescription className="text-lg">
              Criado por {challenge.createdBy}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                <p className="text-gray-600">{challenge.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Tipo de Pontuação</h3>
                <p className="text-gray-600">
                  {challenge?.scoringType === 'daily' 
                    ? 'Todo dia vale 1 ponto de treino concluído' 
                    : 'Soma por % de treino concluído'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Data de término</p>
                    <p className="text-sm text-gray-600">
                      {new Date(challenge.endDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Participantes</p>
                    <p className="text-sm text-gray-600">
                      {challenge.currentParticipants}
                      {challenge.maxParticipants ? ` / ${challenge.maxParticipants}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4 pt-4">
                <Button 
                  onClick={handleJoinChallenge}
                  disabled={joining || !user}
                  className="gradient-bg text-primary-foreground font-semibold shadow-lg hover:shadow-xl"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {joining ? 'Entrando...' : 'Aceitar Desafio'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="shadow-lg hover:shadow-xl"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Recusar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default JoinChallenge; 
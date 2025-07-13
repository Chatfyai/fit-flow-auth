import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Clock, Info, Calendar, Users } from 'lucide-react';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Challenge = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallengeData = async () => {
      if (id) {
        // Buscar dados do desafio do localStorage
        const storedChallenge = localStorage.getItem(`challenge_${id}`);
        if (storedChallenge) {
          const challengeData = JSON.parse(storedChallenge);
          setChallenge(challengeData);
          
          // Buscar participantes
          const participantsData = localStorage.getItem(`challenge_${id}_participants`);
          let participantsList = participantsData ? JSON.parse(participantsData) : [];
          
          // Se não houver participantes, adicionar o criador
          if (participantsList.length === 0) {
            const creatorParticipant = {
              userId: 'creator',
              name: challengeData.createdBy,
              email: 'creator@example.com',
              role: 'admin',
              joinedAt: challengeData.createdAt,
              progress: 0 // Será calculado na função updateParticipantsProgress
            };
            participantsList.push(creatorParticipant);
            localStorage.setItem(`challenge_${id}_participants`, JSON.stringify(participantsList));
          }
          
          // Calcular progresso real de todos os participantes
          const updatedParticipants = await updateParticipantsProgress(participantsList, challengeData);
          
          // Ordenar participantes por progresso (ranking)
          updatedParticipants.sort((a, b) => b.progress - a.progress);
          setParticipants(updatedParticipants);
        }
      }
      setLoading(false);
    };

    loadChallengeData();
  }, [id, user]);

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Função para calcular progresso acumulativo baseado em treinos reais
  const calculateParticipantProgress = async (participant: any, challengeStartDate: string, scoringType: string) => {
    try {
      // Se for demo/criador, usar progresso simulado baseado no tipo de pontuação
      if (!user || participant.userId === 'creator') {
        const daysSinceStart = Math.floor((new Date().getTime() - new Date(challengeStartDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (scoringType === 'daily') {
          // Para pontuação diária: simular que treinou alguns dos dias
          return Math.min(daysSinceStart, Math.floor(daysSinceStart * 0.7)); // 70% dos dias
        } else {
          // Para pontuação por %: simular treinos com diferentes intensidades
          const treinos = [100, 85, 95, 70, 100, 60, 90]; // Exemplo de % por treino
          const diasTreinados = Math.min(daysSinceStart, treinos.length);
          return treinos.slice(0, diasTreinados).reduce((sum, percent) => sum + percent, 0);
        }
      }

      // Buscar sessões de treino do participante a partir da data de início do desafio
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', participant.userId)
        .gte('date', challengeStartDate)
        .order('date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar sessões:', error);
        return 0;
      }

      if (!sessions || sessions.length === 0) {
        return 0;
      }

      // Calcular progresso baseado no tipo de pontuação
      if (scoringType === 'daily') {
        // Todo dia vale 1 ponto
        return sessions.length;
      } else {
        // Soma por % de treino concluído (padrão)
        let totalProgress = 0;
        
        sessions.forEach(session => {
          // Extrair a porcentagem das notas da sessão
          const notes = session.notes || '';
          const match = notes.match(/(\d+)\/(\d+) séries/);
          
          if (match) {
            const completed = parseInt(match[1]);
            const total = parseInt(match[2]);
            const sessionPercentage = total > 0 ? (completed / total) * 100 : 0;
            totalProgress += sessionPercentage;
          } else {
            // Se não conseguir extrair, assumir 100% para sessão concluída
            totalProgress += 100;
          }
        });
        
        return Math.round(totalProgress);
      }
    } catch (error) {
      console.error('Erro ao calcular progresso:', error);
      return 0;
    }
  };

  // Função para atualizar progresso de todos os participantes
  const updateParticipantsProgress = async (participantsList: any[], challenge: any) => {
    if (!challenge) return participantsList;

    const challengeStartDate = challenge.createdAt.split('T')[0]; // Data de início do desafio
    const scoringType = challenge.scoringType || 'percentage';

    const updatedParticipants = await Promise.all(
      participantsList.map(async (participant) => {
        const progress = await calculateParticipantProgress(participant, challengeStartDate, scoringType);
        return {
          ...participant,
          progress
        };
      })
    );

    return updatedParticipants;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 gradient-bg rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg">
            <PlayFitLogo size="lg" className="text-primary-foreground" />
          </div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Carregando desafio...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-600 text-lg sm:text-xl">Desafio não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">O desafio que você está procurando não existe ou foi removido.</p>
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline"
              className="w-full sm:w-auto"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(challenge.endDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col overflow-x-hidden w-full">
      {/* Header - Fixo no topo */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl challenge-container">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center mr-2 sm:mr-3">
                <PlayFitLogo size="md" className="text-yellow-500" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">PlayFit</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden md:block truncate max-w-[200px]">
                {user ? `Olá, ${user?.user_metadata?.full_name || user?.email}!` : 'Visitante'}
              </span>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                    title="Informações do Desafio"
                  >
                    <Info className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 hover:text-yellow-600 transition-colors duration-200" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-4 sm:mx-6 mobile-scroll">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                      {challenge.title}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {/* Descrição */}
                    <div className="bg-yellow-50 rounded-xl p-3 sm:p-4 border border-yellow-100">
                      <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 flex items-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <Info className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        Descrição
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{challenge.description}</p>
                    </div>

                    {/* Tipo de Pontuação */}
                    <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-100">
                      <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 flex items-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        Tipo de Pontuação
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        {challenge?.scoringType === 'daily' 
                          ? 'Todo dia vale 1 ponto de treino concluído' 
                          : 'Soma por % de treino concluído'
                        }
                      </p>
                    </div>

                    {/* Informações do Desafio */}
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Informações do Desafio</h3>
                      
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">Data de término</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              {new Date(challenge.endDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">Criado por</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{challenge.createdBy}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">Participantes</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {participants.length} participante{participants.length !== 1 ? 's' : ''}
                              {challenge.maxParticipants ? ` de ${challenge.maxParticipants}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">Tipo de Pontuação</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {challenge?.scoringType === 'daily' 
                                ? 'Todo dia vale 1 ponto de treino concluído' 
                                : 'Soma por % de treino concluído'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center space-x-2 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-green-700 text-sm sm:text-base">Desafio Ativo</span>
                      <span className="text-green-600">·</span>
                      <span className="text-green-600 text-sm sm:text-base">
                        {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Finalizado'}
                      </span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto scroll-smooth mobile-scroll">
        <div className="max-w-4xl challenge-container py-4 sm:py-6 lg:py-8 pb-20 sm:pb-24">
          {/* Título do desafio */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              {challenge.title}
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 px-3 py-1">
                Ativo
              </Badge>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Finalizado'}
                </span>
              </div>
            </div>
          </div>

          {/* Ranking dos participantes */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-yellow-500" />
              Ranking
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              {participants.map((participant, index) => (
                <Card key={participant.userId} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-xl flex-shrink-0 ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-base sm:text-xl text-gray-900 truncate">
                            {participant.name.split(' ').slice(0, 2).join(' ')}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {participant.role === 'admin' ? 'Criador do Desafio' : 'Participante'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl sm:text-3xl font-bold text-primary">
                          {participant.progress}{challenge?.scoringType === 'daily' ? ' pts' : '%'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {challenge?.scoringType === 'daily' ? 'Pontos' : 'Progresso'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Fixo no fundo */}
      <BottomNavigation />
    </div>
  );
};

export default Challenge; 
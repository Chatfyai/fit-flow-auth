import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Plus, Share2, Users, Calendar, Clock, ExternalLink, UserPlus } from 'lucide-react';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useFriendGroups, FriendGroup } from '@/hooks/useFriendGroups';

const Share = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { groups, loading, createGroup, joinGroupByCode } = useFriendGroups();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    end_date: '',
    max_members: 20,
    scoring_type: 'percentage'
  });

  // Verificar se há código de convite nos parâmetros da URL
  useEffect(() => {
    const inviteCode = searchParams.get('invite');
    if (inviteCode && user) {
      setJoinCode(inviteCode);
      setShowJoinDialog(true);
    }
  }, [searchParams, user]);

  const handleCreateGroup = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!groupData.name.trim() || !groupData.description.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createGroup(groupData);
      setShowCreateDialog(false);
      setGroupData({
        name: '',
        description: '',
        end_date: '',
        max_members: 20,
        scoring_type: 'percentage'
      });
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!joinCode.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um código de convite",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      await joinGroupByCode(joinCode);
      setShowJoinDialog(false);
      setJoinCode('');
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsJoining(false);
    }
  };

  const copyInviteCode = async (code: string) => {
    try {
      const inviteUrl = `${window.location.origin}/share?invite=${code}`;
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Link copiado!",
        description: "O link do convite foi copiado para a área de transferência",
        className: 'warning-card-playfit shadow-lg border-2',
        style: {
          backgroundColor: 'oklch(0.9 0.15 85)',
          borderColor: 'oklch(0.85 0.12 75)',
          color: '#ffffff'
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

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
                {user ? `Olá, ${user?.user_metadata?.full_name || user?.email}!` : 'Visitante - Faça login para criar grupos'}
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
            Grupos de Amigos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compartilhe sua jornada fitness com amigos e vejam quem consegue os melhores resultados!
          </p>
        </div>

        {/* Aviso para visitantes */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Share2 className="h-5 w-5 text-amber-600 mr-2" />
              <div className="text-sm text-amber-800">
                <strong>Você está navegando como visitante.</strong> Para criar grupos com amigos, 
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

        {/* Botões de ação */}
        {user && (
          <div className="flex gap-4 justify-center mb-8">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="gradient-bg text-primary-foreground font-semibold shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Grupo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Grupo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Grupo *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Academia dos Marombas"
                      value={groupData.name}
                      onChange={(e) => setGroupData({...groupData, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o objetivo do grupo..."
                      value={groupData.description}
                      onChange={(e) => setGroupData({...groupData, description: e.target.value})}
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
                          checked={groupData.scoring_type === 'percentage'}
                          onChange={(e) => setGroupData({...groupData, scoring_type: e.target.value})}
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
                          checked={groupData.scoring_type === 'daily'}
                          onChange={(e) => setGroupData({...groupData, scoring_type: e.target.value})}
                          className="rounded-full border-gray-300 text-yellow-500 focus:ring-yellow-500"
                        />
                        <label htmlFor="daily" className="text-sm font-medium">
                          Todo dia vale 100 pontos se treino concluído
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="end_date">Data de Término (opcional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={groupData.end_date}
                      onChange={(e) => setGroupData({...groupData, end_date: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_members">Máximo de Membros</Label>
                    <Input
                      id="max_members"
                      type="number"
                      min="2"
                      max="100"
                      value={groupData.max_members}
                      onChange={(e) => setGroupData({...groupData, max_members: parseInt(e.target.value) || 20})}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateGroup}
                    disabled={isCreating}
                    className="w-full gradient-bg text-primary-foreground font-semibold shadow-lg hover:shadow-xl"
                  >
                    {isCreating ? 'Criando...' : 'Criar Grupo'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="lg"
                  className="shadow-lg hover:shadow-xl"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Entrar em Grupo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Entrar em Grupo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="joinCode">Código de Convite</Label>
                    <Input
                      id="joinCode"
                      placeholder="Digite o código do convite"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    />
                  </div>

                  <Button 
                    onClick={handleJoinGroup}
                    disabled={isJoining}
                    className="w-full"
                  >
                    {isJoining ? 'Entrando...' : 'Entrar no Grupo'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Lista de grupos */}
        {user && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Meus Grupos</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando grupos...</p>
              </div>
            ) : groups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não faz parte de nenhum grupo.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Crie seu primeiro grupo ou peça para um amigo te convidar!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group) => {
                  const daysRemaining = getDaysRemaining(group.end_date);
                  
                  return (
                    <Card key={group.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {group.description}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${
                              group.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {group.is_active ? 'Ativo' : 'Finalizado'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{group.member_count || 0} membros</span>
                            </div>
                            {daysRemaining !== null && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>
                                  {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Finalizado'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Criado em: {formatDate(group.created_at)}</span>
                          </div>

                          {group.end_date && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Termina em: {formatDate(group.end_date)}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyInviteCode(group.invite_code)}
                              className="flex-1"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copiar Convite
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/group/${group.id}`)}
                              className="flex-1"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Ver Grupo
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Card informativo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-3 text-primary" />
              Como Funciona?
            </CardTitle>
            <CardDescription>
              Sistema de ranking baseado nos seus treinos concluídos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Pontuação por Porcentagem</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Treino 50% completo = 50 pontos</li>
                  <li>• Treino 80% completo = 80 pontos</li>
                  <li>• Treino 100% completo = 100 pontos</li>
                  <li>• Soma pontos de todos os treinos</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Pontuação Diária</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Cada dia com treino = 100 pontos</li>
                  <li>• Não importa se foi 50% ou 100%</li>
                  <li>• Incentiva consistência diária</li>
                  <li>• Conta apenas treinos finalizados</li>
                </ul>
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
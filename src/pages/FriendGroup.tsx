import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, Trophy, Activity, Copy, UserPlus, Calendar, Share2 } from 'lucide-react';
import { PlayFitLogo } from '@/components/ui/playfit-logo';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFriendGroups, FriendGroup, GroupMember, GroupActivity } from '@/hooks/useFriendGroups';

const FriendGroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getGroupMembers, getGroupActivities } = useFriendGroups();
  
  const [group, setGroup] = useState<FriendGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const loadGroupData = async () => {
    if (!groupId || !user) return;

    setLoading(true);
    try {
      // Carregar dados do grupo
      const { data: groupData, error: groupError } = await supabase
        .from('friend_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);
      setInviteCode(groupData.invite_code);

      // Carregar membros e atividades em paralelo
      const [membersData, activitiesData] = await Promise.all([
        getGroupMembers(groupId),
        getGroupActivities(groupId)
      ]);

      setMembers(membersData);
      setActivities(activitiesData);
    } catch (error: any) {
      console.error('Erro ao carregar dados do grupo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do grupo',
        variant: 'destructive'
      });
      navigate('/share');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast({
        title: 'Código copiado!',
        description: 'O código de convite foi copiado para a área de transferência',
        className: 'warning-card-playfit shadow-lg border-2',
        style: {
          backgroundColor: 'oklch(0.9 0.15 85)',
          borderColor: 'oklch(0.85 0.12 75)',
          color: '#ffffff'
        }
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o código',
        variant: 'destructive'
      });
    }
  };

  const shareGroup = async () => {
    const shareData = {
      title: `Participe do grupo ${group?.name}`,
      text: `Você foi convidado para participar do grupo "${group?.name}" no PlayFit! Use o código: ${inviteCode}`,
      url: `${window.location.origin}/share?invite=${inviteCode}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast({
          title: 'Link copiado!',
          description: 'As informações do convite foram copiadas',
          className: 'warning-card-playfit shadow-lg border-2',
          style: {
            backgroundColor: 'oklch(0.9 0.15 85)',
            borderColor: 'oklch(0.85 0.12 75)',
            color: '#ffffff'
          }
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const getRankingPosition = (member: GroupMember) => {
    const sortedMembers = [...members].sort((a, b) => b.total_score - a.total_score);
    return sortedMembers.findIndex(m => m.id === member.id) + 1;
  };

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}º`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    loadGroupData();
  }, [groupId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Carregando grupo...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Grupo não encontrado</p>
          <Button onClick={() => navigate('/share')} className="mt-4">
            Voltar para Compartilhar
          </Button>
        </div>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/share')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mr-3">
                <PlayFitLogo size="md" className="text-yellow-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PlayFit</h1>
            </div>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
              {group.description && (
                <p className="text-gray-600 mb-4">{group.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{members.length} membros</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Criado em {formatDate(group.created_at)}</span>
                </div>
                {group.end_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Termina em {formatDate(group.end_date)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Convidar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convidar Amigos</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Código de Convite</Label>
                      <div className="flex gap-2">
                        <Input value={inviteCode} readOnly />
                        <Button onClick={copyInviteCode} size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Compartilhe este código com seus amigos
                      </p>
                    </div>
                    <Button onClick={shareGroup} className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar Convite
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ranking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ranking">
              <Trophy className="h-4 w-4 mr-2" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="activities">
              <Activity className="h-4 w-4 mr-2" />
              Atividades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ranking">
            <Card>
              <CardHeader>
                <CardTitle>Ranking do Grupo</CardTitle>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum membro encontrado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {members
                      .sort((a, b) => b.total_score - a.total_score)
                      .map((member, index) => {
                        const position = index + 1;
                        const isCurrentUser = member.user_id === user?.id;
                        
                        return (
                          <div 
                            key={member.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              isCurrentUser ? 'bg-primary/5 border-primary/20' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold min-w-[3rem] text-center">
                                {getRankingIcon(position)}
                              </div>
                              <div>
                                <h3 className="font-semibold">
                                  {member.user_name}
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="ml-2">Você</Badge>
                                  )}
                                  {member.is_admin && (
                                    <Badge variant="secondary" className="ml-2">Admin</Badge>
                                  )}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {member.workout_count} treinos realizados
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                {member.total_score.toFixed(0)}
                              </div>
                              <div className="text-sm text-muted-foreground">pontos</div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma atividade encontrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div>
                            <p className="font-medium">{activity.user_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(activity.activity_date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            +{activity.score.toFixed(0)} pts
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activity.activity_type === 'workout' ? 'Treino' : 'Atividade'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FriendGroupPage;
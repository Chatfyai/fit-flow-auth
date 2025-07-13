import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FriendGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  invite_code: string;
  max_members: number;
  scoring_type: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
  creator_name?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  is_admin: boolean;
  total_score: number;
  workout_count: number;
  user_name?: string;
}

export interface GroupActivity {
  id: string;
  group_id: string;
  user_id: string;
  workout_session_id?: string;
  activity_date: string;
  score: number;
  activity_type: string;
  notes?: string;
  created_at: string;
  user_name?: string;
}

export const useFriendGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar grupos do usuário
  const loadUserGroups = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('friend_groups')
        .select(`
          *,
          group_members!inner(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Processar dados para incluir contagem de membros
      const groupsWithCounts = data?.map(group => ({
        ...group,
        member_count: group.group_members?.[0]?.count || 0
      })) || [];

      setGroups(groupsWithCounts);
    } catch (error: any) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os grupos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar novo grupo
  const createGroup = async (groupData: {
    name: string;
    description?: string;
    scoring_type: string;
    end_date?: string;
    max_members?: number;
  }) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Gerar código de convite único
      const { data: codeData } = await supabase.rpc('generate_invite_code');
      const inviteCode = codeData;

      const { data, error } = await supabase
        .from('friend_groups')
        .insert([{
          ...groupData,
          created_by: user.id,
          invite_code: inviteCode
        }])
        .select()
        .single();

      if (error) throw error;

      // Adicionar criador como admin do grupo
      await supabase
        .from('group_members')
        .insert([{
          group_id: data.id,
          user_id: user.id,
          is_admin: true
        }]);

      await loadUserGroups();
      
      toast({
        title: 'Grupo criado!',
        description: 'Seu grupo foi criado com sucesso. Compartilhe o código para convidar amigos.',
        className: 'warning-card-playfit shadow-lg border-2',
        style: {
          backgroundColor: 'oklch(0.9 0.15 85)',
          borderColor: 'oklch(0.85 0.12 75)',
          color: '#ffffff'
        }
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o grupo',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Participar de grupo por código
  const joinGroupByCode = async (inviteCode: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Buscar grupo pelo código
      const { data: group, error: groupError } = await supabase
        .from('friend_groups')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (groupError || !group) {
        throw new Error('Código de convite inválido ou grupo não encontrado');
      }

      // Verificar se usuário já é membro
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('Você já faz parte deste grupo');
      }

      // Verificar limite de membros
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);

      if (count && count >= group.max_members) {
        throw new Error('Este grupo já atingiu o limite máximo de membros');
      }

      // Adicionar usuário ao grupo
      await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          user_id: user.id,
          is_admin: false
        }]);

      await loadUserGroups();

      toast({
        title: 'Bem-vindo ao grupo!',
        description: `Você agora faz parte do grupo "${group.name}"`,
        className: 'warning-card-playfit shadow-lg border-2',
        style: {
          backgroundColor: 'oklch(0.9 0.15 85)',
          borderColor: 'oklch(0.85 0.12 75)',
          color: '#ffffff'
        }
      });

      return group;
    } catch (error: any) {
      console.error('Erro ao entrar no grupo:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível entrar no grupo',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Sair do grupo
  const leaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      await loadUserGroups();

      toast({
        title: 'Grupo abandonado',
        description: 'Você saiu do grupo com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao sair do grupo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível sair do grupo',
        variant: 'destructive'
      });
    }
  };

  // Carregar membros do grupo
  const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('total_score', { ascending: false });

      if (error) throw error;

      // Buscar nomes dos usuários separadamente
      const membersWithNames = await Promise.all((data || []).map(async (member) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', member.user_id)
          .single();

        return {
          ...member,
          user_name: profile?.full_name || 'Usuário'
        };
      }));

      return membersWithNames;
    } catch (error: any) {
      console.error('Erro ao carregar membros:', error);
      return [];
    }
  };

  // Carregar atividades do grupo
  const getGroupActivities = async (groupId: string): Promise<GroupActivity[]> => {
    try {
      const { data, error } = await supabase
        .from('group_activities')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Buscar nomes dos usuários separadamente
      const activitiesWithNames = await Promise.all((data || []).map(async (activity) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', activity.user_id)
          .single();

        return {
          ...activity,
          user_name: profile?.full_name || 'Usuário'
        };
      }));

      return activitiesWithNames;
    } catch (error: any) {
      console.error('Erro ao carregar atividades:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      loadUserGroups();
    }
  }, [user]);

  return {
    groups,
    loading,
    createGroup,
    joinGroupByCode,
    leaveGroup,
    getGroupMembers,
    getGroupActivities,
    loadUserGroups
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BodyMeasurement {
  id: string;
  user_id: string;
  measurement_date: string;
  weight?: number;
  height?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  right_bicep?: number;
  left_bicep?: number;
  right_forearm?: number;
  left_forearm?: number;
  right_thigh?: number;
  left_thigh?: number;
  right_calf?: number;
  left_calf?: number;
  body_fat?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BodyMeasurementInput {
  measurement_date?: string;
  weight?: number;
  height?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  right_bicep?: number;
  left_bicep?: number;
  right_forearm?: number;
  left_forearm?: number;
  right_thigh?: number;
  left_thigh?: number;
  right_calf?: number;
  left_calf?: number;
  body_fat?: number;
  notes?: string;
}

export const useBodyMeasurements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar todas as medidas do usuário
  const fetchMeasurements = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Erro ao buscar medidas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as medidas anteriores.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar medida mais recente
  const getLatestMeasurement = (): BodyMeasurement | null => {
    return measurements.length > 0 ? measurements[0] : null;
  };

  // Salvar nova medida
  const saveMeasurement = async (data: BodyMeasurementInput) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para salvar medidas.',
        variant: 'destructive'
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: user.id,
          ...data
        });

      if (error) throw error;

      toast({
        title: 'Parabéns! Progresso salvo com sucesso! 🔥',
        description: 'Seus dados foram registrados. Continue assim!',
        className: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0',
      });

      // Recarregar as medidas
      await fetchMeasurements();
      return true;
    } catch (error) {
      console.error('Erro ao salvar medida:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as medidas. Tente novamente.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [user]);

  return {
    measurements,
    latestMeasurement: getLatestMeasurement(),
    loading,
    saveMeasurement,
    fetchMeasurements
  };
};
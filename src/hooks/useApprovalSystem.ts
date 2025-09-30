import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const useApprovalSystem = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendApprovalRequest = async (userEmail: string, userName: string, userId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.functions.invoke('send-approval-request', {
        body: {
          userEmail,
          userName,
          userId
        }
      });

      if (error) throw error;

      console.log('Email de aprovação enviado com sucesso');
    } catch (error: any) {
      console.error('Erro ao enviar email de aprovação:', error);
      toast({
        title: "Erro no sistema",
        description: "Não foi possível enviar email de aprovação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkApprovalStatus = async (userId: string): Promise<'pending' | 'approved' | 'rejected'> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('approval_status')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.approval_status || 'pending';
    } catch (error) {
      console.error('Erro ao verificar status de aprovação:', error);
      return 'pending';
    }
  };

  const getPendingUsers = async (): Promise<PendingUser[]> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, approval_status, created_at')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar usuários pendentes:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string, userName: string, userEmail: string) => {
    try {
      setLoading(true);

      // Atualizar status no banco
      const { error } = await supabase
        .from('profiles')
        .update({ 
          approval_status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Enviar email de notificação
      await supabase.functions.invoke('send-approval-notification', {
        body: {
          userEmail,
          userName,
          approved: true
        }
      });

      toast({
        title: "Usuário aprovado!",
        description: `${userName} foi aprovado e notificado por email.`,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao aprovar usuário:', error);
      toast({
        title: "Erro ao aprovar usuário",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectUser = async (userId: string, userName: string, userEmail: string) => {
    try {
      setLoading(true);

      // Atualizar status no banco
      const { error } = await supabase
        .from('profiles')
        .update({ 
          approval_status: 'rejected'
        })
        .eq('id', userId);

      if (error) throw error;

      // Enviar email de notificação
      await supabase.functions.invoke('send-approval-notification', {
        body: {
          userEmail,
          userName,
          approved: false
        }
      });

      toast({
        title: "Usuário rejeitado",
        description: `${userName} foi rejeitado e notificado por email.`,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao rejeitar usuário:', error);
      toast({
        title: "Erro ao rejeitar usuário",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isUserAdmin = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return false;

      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('email', user.email)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Erro ao verificar se é admin:', error);
      return false;
    }
  };

  return {
    loading,
    sendApprovalRequest,
    checkApprovalStatus,
    getPendingUsers,
    approveUser,
    rejectUser,
    isUserAdmin
  };
};
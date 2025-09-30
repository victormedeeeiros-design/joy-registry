import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetching to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(profileData as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Aguardar criação do perfil
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Definir status como pendente
        await supabase
          .from('profiles')
          .update({ approval_status: 'pending' })
          .eq('id', data.user.id);
        
        // Enviar email de aprovação
        try {
          await supabase.functions.invoke('send-approval-request', {
            body: {
              userEmail: email,
              userName: name,
              userId: data.user.id
            }
          });
        } catch (emailError) {
          console.error('Erro ao enviar email de aprovação:', emailError);
        }
        
        toast({
          title: "Cadastro enviado para aprovação!",
          description: "Seu cadastro foi enviado para análise. Você receberá um email quando for aprovado.",
        });
        
        return { user: data.user, error: null };
      }
      
      return { user: null, error: new Error("Erro desconhecido") };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const isApproved = () => {
    return profile?.approval_status === 'approved';
  };

  const isPending = () => {
    return profile?.approval_status === 'pending';
  };

  const isRejected = () => {
    return profile?.approval_status === 'rejected';
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isApproved,
    isPending,
    isRejected,
  };
};
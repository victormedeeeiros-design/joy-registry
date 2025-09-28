import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteUser {
  id: string;
  site_id: string;
  email: string;
  name: string;
}

export const useSiteAuth = () => {
  const [siteUser, setSiteUser] = useState<SiteUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if site user is logged in (using localStorage)
    const storedUser = localStorage.getItem('siteUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Validate user has required site_id field
        if (user.site_id) {
          setSiteUser(user);
        } else {
          localStorage.removeItem('siteUser');
        }
      } catch (error) {
        localStorage.removeItem('siteUser');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (siteId: string, email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('site_users')
        .insert([
          {
            site_id: siteId,
            email,
            name,
            password_hash: password // In production, hash this properly
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const user = {
        id: data.id,
        site_id: data.site_id,
        email: data.email,
        name: data.name
      };

      setSiteUser(user);
      localStorage.setItem('siteUser', JSON.stringify(user));
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (siteId: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('authenticate_site_user', {
        p_site_id: siteId,
        p_email: email,
        p_password: password
      });

      if (error) throw error;

      // Type assertion with proper checking
      const result = data as any;

      if (!result || typeof result !== 'object') {
        throw new Error('Resposta inválida do servidor');
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro na autenticação');
      }

      if (!result.user) {
        throw new Error('Dados do usuário não encontrados');
      }

      const user: SiteUser = {
        id: result.user.id,
        site_id: result.user.site_id,
        email: result.user.email,
        name: result.user.name
      };

      setSiteUser(user);
      localStorage.setItem('siteUser', JSON.stringify(user));
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Erro na autenticação' } };
    }
  };

  const signOut = async () => {
    setSiteUser(null);
    localStorage.removeItem('siteUser');
    return { error: null };
  };

  return {
    siteUser,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
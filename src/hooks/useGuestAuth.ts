import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GuestUser {
  id: string;
  email: string;
  name: string;
}

export const useGuestAuth = () => {
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if guest user is logged in (using localStorage)
    const storedUser = localStorage.getItem('guestUser');
    if (storedUser) {
      try {
        setGuestUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('guestUser');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('guest_users')
        .insert([
          {
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
        email: data.email,
        name: data.name
      };

      setGuestUser(user);
      localStorage.setItem('guestUser', JSON.stringify(user));
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('authenticate_guest_user', {
        p_email: email,
        p_password: password
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro na autenticação');
      }

      const user = data.user;
      setGuestUser(user);
      localStorage.setItem('guestUser', JSON.stringify(user));
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Erro na autenticação' } };
    }
  };

  const signOut = async () => {
    setGuestUser(null);
    localStorage.removeItem('guestUser');
    return { error: null };
  };

  return {
    guestUser,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
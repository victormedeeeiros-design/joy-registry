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
      const { data: userData, error } = await supabase
        .from('guest_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw new Error('Usuário não encontrado');

      // In production, verify password hash properly
      if (userData.password_hash !== password) {
        throw new Error('Senha incorreta');
      }

      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.name
      };

      setGuestUser(user);
      localStorage.setItem('guestUser', JSON.stringify(user));
      
      return { error: null };
    } catch (error: any) {
      return { error };
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
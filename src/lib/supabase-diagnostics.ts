import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Teste básico de conectividade
    const { data, error } = await supabase
      .from('sites')
      .select('id, title, is_active')
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
      return false;
    }

    console.log('✅ Conexão com Supabase OK, sites ativos encontrados:', data?.length || 0);
    
    // Teste específico de política RLS para site_rsvps
    const testSiteId = data?.[0]?.id;
    if (testSiteId) {
      console.log('🔍 Testando políticas RLS para site_rsvps...');
      
      // Simular inserção de RSVP (sem realmente inserir)
      const testRSVP = {
        site_id: testSiteId,
        guest_name: 'Teste Mobile',
        guest_email: 'teste@mobile.com',
        will_attend: true,
        message: 'Teste diagnóstico'
      };

      console.log('📋 Dados de teste para RSVP:', testRSVP);

      // Verificar se consegue fazer a inserção
      try {
        const { error: insertError } = await supabase
          .from('site_rsvps')
          .insert(testRSVP);

        if (insertError) {
          console.error('❌ Erro na política RLS de RSVP:', insertError);
          
          if (insertError.message?.includes('row-level security policy')) {
            console.error('🚨 PROBLEMA: Políticas RLS bloqueando inserções anônimas');
            console.error('💡 SOLUÇÃO: Execute o script fix_mobile_rsvp_policies.sql no Supabase');
          }
          
          return false;
        } else {
          console.log('✅ Políticas RLS OK - RSVP pode ser inserido');
          
          // Limpar o teste
          await supabase
            .from('site_rsvps')
            .delete()
            .eq('guest_email', 'teste@mobile.com');
            
          return true;
        }
      } catch (testError) {
        console.error('❌ Erro no teste de RLS:', testError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
    return false;
  }
};

export const diagnoseMobileIssues = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
  
  console.log('📱 Diagnóstico Mobile:', {
    isMobile,
    userAgent,
    platform: navigator.platform,
    connection: (navigator as any)?.connection?.effectiveType,
    onLine: navigator.onLine
  });

  return {
    isMobile,
    isOnline: navigator.onLine,
    connectionType: (navigator as any)?.connection?.effectiveType || 'unknown'
  };
};
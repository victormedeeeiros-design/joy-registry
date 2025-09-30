# Sistema de Aprovação de Usuários - Configuração

## Visão Geral

O sistema de aprovação de usuários foi implementado para garantir que apenas usuários aprovados pelo administrador (`victormedeeeiros@gmail.com`) possam criar sites de casamento na plataforma.

## Fluxo do Sistema

1. **Registro**: Usuário se registra normalmente
2. **Status Pendente**: Conta fica com status "pending" 
3. **Notificação**: Admin recebe email de solicitação
4. **Aprovação/Rejeição**: Admin aprova ou rejeita via painel
5. **Notificação**: Usuário recebe email do resultado
6. **Acesso**: Usuário aprovado pode criar sites

## Configuração Necessária

### 1. Executar Migração do Banco
Execute no painel do Supabase (SQL Editor):
```sql
-- Conteúdo do arquivo: supabase/migrations/20250930000002_add_approval_system.sql
```

### 2. Configurar Edge Functions
No painel do Supabase, faça deploy das Edge Functions:

- `send-approval-request` - Notifica admin sobre nova solicitação
- `send-approval-notification` - Notifica usuário sobre resultado

### 3. Configurar Variáveis de Ambiente
No painel do Supabase (Settings > Edge Functions):

```
RESEND_API_KEY=your_resend_api_key_here
SITE_URL=https://your-domain.com
```

### 4. Configurar Usuario Admin
Execute o script `setup_admin.sql` no SQL Editor do Supabase.

## Estrutura dos Arquivos Criados

### Base de Dados
- **Campos adicionados à tabela `profiles`:**
  - `approval_status`: 'pending' | 'approved' | 'rejected'
  - `approved_at`: timestamp da aprovação
  - `approved_by`: ID do admin que aprovou

### Edge Functions
- `/supabase/functions/send-approval-request/index.ts`
- `/supabase/functions/send-approval-notification/index.ts`

### Componentes React
- `/src/components/ApprovalStatus.tsx` - Interface para usuários pendentes/rejeitados
- `/src/pages/AdminUsers.tsx` - Painel de gerenciamento de usuários
- `/src/hooks/useApprovalSystem.ts` - Hook para operações de aprovação

### Integrações
- Hook `useAuth.ts` atualizado com verificações de aprovação
- `App.tsx` atualizado com proteção de rotas baseada em aprovação

## Uso do Sistema

### Para Administradores
1. Acesse `/admin/users` no painel administrativo
2. Visualize lista de usuários pendentes
3. Aprove ou rejeite solicitações
4. Sistema envia emails automáticos

### Para Usuários
1. Registre-se normalmente na plataforma
2. Aguarde aprovação (tela automática é exibida)
3. Receba email de confirmação da decisão
4. Após aprovação, acesse funcionalidades completas

## Segurança

- **Row Level Security**: Políticas RLS garantem que apenas usuários aprovados acessem recursos
- **Validação de Email**: Apenas `victormedeeeiros@gmail.com` pode aprovar usuários  
- **Estados Claros**: Sistema de estados bem definido (pending/approved/rejected)

## Monitoramento

- Logs das Edge Functions no painel do Supabase
- Tabela `profiles` para auditoria de aprovações
- Emails de notificação para rastreamento

## Troubleshooting

### Usuário não recebe email de aprovação
1. Verifique configuração da API do Resend
2. Confirme variáveis de ambiente das Edge Functions
3. Verifique logs das Edge Functions

### Admin não consegue aprovar usuários
1. Confirme que o email está correto no banco
2. Verifique permissões RLS
3. Teste conexão com banco de dados

### Usuário aprovado não consegue criar sites
1. Verifique status no banco: `SELECT * FROM profiles WHERE email = 'user@email.com'`
2. Confirme que `approval_status = 'approved'`
3. Verifique cache do browser (faça logout/login)
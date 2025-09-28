# Deploy no Vercel - Lista de Presentes

## 🚀 Configuração para Deploy

Este projeto está configurado para funcionar perfeitamente no Vercel com React Router (SPA). 

### Arquivos de Configuração

#### 1. `vercel.json`
Arquivo principal de configuração do Vercel que:
- Reescreve todas as rotas para `/index.html` (necessário para SPAs)
- Configura headers CORS
- Define configurações de build

#### 2. `public/_redirects` 
Arquivo de backup para redirecionamentos (funciona como fallback)

#### 3. `vite.config.ts`
Configurado com:
- Saída para pasta `dist`
- Code splitting otimizado
- Base path configurado

### Como fazer o deploy:

1. **Via GitHub** (Recomendado):
   - Conecte seu repositório ao Vercel
   - O deploy será automático a cada push

2. **Via Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel
   ```

3. **Build local** (para testar):
   ```bash
   npm run build
   npm run preview
   ```

### Rotas Configuradas:

- `/` - Página inicial
- `/auth` - Login/Registro
- `/dashboard` - Dashboard do criador  
- `/admin` - Dashboard admin
- `/layouts` - Seleção de layouts
- `/create-site` - Criar site
- `/edit-site/:id` - Editar site
- `/site/:id` - Site público
- `/guest-login` - Login de convidados
- `/payment-success` - Sucesso do pagamento
- `/admin/products` - Gerenciar produtos

### Variáveis de Ambiente:

Certifique-se de configurar no Vercel:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Características do Setup:

✅ **SPA Routing**: Todas as rotas funcionam corretamente no refresh  
✅ **Build Otimizado**: Code splitting automático  
✅ **Assets Otimizados**: Imagens e CSS minificados  
✅ **TypeScript**: Build com verificação de tipos  
✅ **CORS Configurado**: Headers corretos para APIs

O projeto está pronto para produção! 🎉
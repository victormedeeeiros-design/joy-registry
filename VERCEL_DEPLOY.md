# Deploy no Vercel - Lista de Presentes

## 🚀 Configuração para Deploy

Este projeto está configurado para funcionar perfeitamente no Vercel com React Router (SPA). 

### Arquivos de Configuração

#### 1. `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Configuração mínima e essencial que:
- Reescreve todas as rotas para `/index.html` (necessário para SPAs)

#### 2. `public/_redirects` 
```
/*    /index.html   200
```
Arquivo de backup para redirecionamentos (funciona como fallback)

#### 3. `package.json`
- Especifica Node.js >= 18.0.0
- Scripts de build otimizados

#### 4. `vite.config.ts`
Configurado com:
- Saída para pasta `dist`
- Code splitting otimizado
- Base path configurado

### ✅ Problemas Corrigidos:

1. **❌ "Function Runtimes must have a valid version"** 
   - ✅ Removido configurações desnecessárias de `functions`
   
2. **❌ CSS @import warnings**
   - ✅ Movido `@import` para o topo do arquivo CSS

### Como fazer o deploy:

1. **Via GitHub** (Recomendado):
   - Faça push do seu código para o GitHub  
   - No Vercel, conecte seu repositório
   - Deploy automático a cada push!

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
✅ **Node 18+**: Compatível com Vercel

O projeto está pronto para produção! 🎉

### 🔧 Debug no Vercel:

Se houver problemas:
1. Verifique os logs de build no dashboard do Vercel
2. Certifique-se que as variáveis de ambiente estão configuradas
3. Teste o build local primeiro: `npm run build && npm run preview`
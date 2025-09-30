# Funcionalidade de Exportação CSV

## Visão Geral
A plataforma agora possui funcionalidade completa de exportação da lista de presentes em formato CSV, disponível em duas seções:

## 1. Administração - Gerenciar Produtos (/admin/products)

### Funcionalidade
- Exporta todos os produtos cadastrados na plataforma
- Disponível apenas para administradores

### Campos Exportados
- **Nome**: Nome do produto
- **Preço (R$)**: Valor em formato brasileiro (vírgula como separador decimal)
- **Categoria**: Categoria do produto ou "Sem categoria"
- **Descrição**: Descrição completa do produto
- **Status**: "Ativo" ou "Inativo"
- **URL da Imagem**: Link da imagem do produto
- **Data de Criação**: Data em formato brasileiro (dd/mm/aaaa)

### Como Usar
1. Acesse o painel administrativo
2. Vá em "Gerenciar Produtos"
3. Clique no botão "Exportar CSV"
4. O arquivo será baixado automaticamente com nome: `lista-presentes-YYYY-MM-DD.csv`

## 2. Edição de Site - Lista de Presentes (/edit-site/:id)

### Funcionalidade
- Exporta apenas os produtos da lista de presentes específica do site
- Disponível para criadores de site

### Campos Exportados
- **Nome**: Nome personalizado ou nome original do produto
- **Preço (R$)**: Preço personalizado ou preço original
- **Categoria**: Categoria do produto
- **Descrição**: Descrição personalizada ou original
- **Disponível**: "Sim" ou "Não" (indica se o produto está disponível para compra)
- **URL da Imagem**: Link personalizado ou original da imagem
- **Posição na Lista**: Ordem do produto na lista

### Como Usar
1. Acesse a edição do seu site
2. Vá na aba "Lista de Presentes"
3. Clique no botão "Exportar CSV"
4. O arquivo será baixado com nome: `lista-presentes-{nome-do-site}-YYYY-MM-DD.csv`

## Formato do Arquivo CSV

### Características
- **Separador**: Ponto e vírgula (;) - padrão brasileiro
- **Codificação**: UTF-8 com BOM
- **Decimal**: Vírgula (,) para valores monetários
- **Escape**: Aspas duplas para campos que contenham ponto e vírgula ou quebras de linha

### Compatibilidade
- ✅ Microsoft Excel
- ✅ LibreOffice Calc
- ✅ Google Sheets
- ✅ Importação de volta na plataforma (função já existente)

## Casos de Uso

### Para Administradores
- Backup completo dos produtos
- Análise de catálogo
- Relatórios para fornecedores
- Migração de dados

### Para Criadores de Site
- Backup da lista de presentes
- Compartilhamento com família/amigos
- Impressão de lista física
- Controle de estoque manual

## Validações

### Exportação Bloqueada Quando:
- Lista está vazia (exibe mensagem de erro)
- Usuário não tem permissão
- Erro no processamento dos dados

### Mensagens de Sucesso:
- Confirma quantidade de produtos exportados
- Indica nome do arquivo baixado

## Estrutura Técnica

### Componentes Modificados:
- `src/pages/ManageProducts.tsx`: Exportação do catálogo completo
- `src/pages/EditSite.tsx`: Exportação da lista personalizada

### Funcionalidades Implementadas:
- Geração automática de CSV
- Download direto no navegador
- Escape adequado de caracteres especiais
- Formatação brasileira de dados
- Validação de dados antes da exportação

## Futuras Melhorias Possíveis
- [ ] Filtros na exportação (por categoria, status, etc.)
- [ ] Exportação em outros formatos (Excel, PDF)
- [ ] Envio por email
- [ ] Agendamento de exportações automáticas
- [ ] Histórico de exportações
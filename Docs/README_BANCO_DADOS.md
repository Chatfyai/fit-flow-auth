# 🎯 Configuração do Banco de Dados - Sistema de Metas

## 📋 Status Atual

✅ **Implementado**: Sistema de metas funcionando com localStorage  
🔄 **Pendente**: Migração para banco de dados Supabase

## 🗄️ Estrutura das Tabelas

### Tabela `user_goals`
- `id` - UUID único da meta
- `user_id` - ID do usuário (FK para auth.users)
- `title` - Título da meta
- `description` - Descrição detalhada
- `category` - Categoria (strength, cardio, weight, habit, etc.)
- `goal_type` - Tipo (numeric, time, boolean, frequency)
- `target_value` - Valor alvo a ser alcançado
- `current_value` - Progresso atual
- `unit` - Unidade de medida (kg, min, repetições, etc.)
- `frequency_target` - Meta de frequência (para metas de hábito)
- `frequency_period` - Período (daily, weekly, monthly)
- `start_date` - Data de início
- `deadline` - Prazo limite
- `priority` - Prioridade (high, medium, low)
- `completed` - Se a meta foi concluída
- `completed_at` - Data de conclusão
- `metadata` - Dados adicionais em JSON
- `created_at` / `updated_at` - Timestamps

### Tabela `goal_progress`
- `id` - UUID único do registro de progresso
- `goal_id` - ID da meta (FK para user_goals)
- `value` - Valor do progresso registrado
- `date` - Data do registro
- `notes` - Observações opcionais
- `created_at` - Timestamp de criação

## 🚀 Como Aplicar as Migrações

### Opção 1: Via Supabase CLI (Recomendado)
```bash
# Navegar para o diretório do projeto
cd fit-flow-auth

# Aplicar as migrações
supabase db push

# Ou aplicar migração específica
supabase migration up
```

### Opção 2: Via Dashboard do Supabase
1. Acesse o dashboard do Supabase
2. Vá em **Database** > **SQL Editor**
3. Copie e execute o conteúdo do arquivo:
   `supabase/migrations/20250702000000_create_user_goals_updated.sql`

### Opção 3: Via Arquivo de Migração
A migração completa está disponível em:
`supabase/migrations/20250702000000_create_user_goals_updated.sql`

## 🔒 Segurança (RLS)

As tabelas têm **Row Level Security (RLS)** habilitado:
- Usuários só podem ver/editar suas próprias metas
- Políticas de segurança impedem acesso não autorizado
- Integração automática com autenticação do Supabase

## 📊 Funcionalidades Incluídas

### ✅ Já Implementado (localStorage)
- ✅ Criar metas personalizadas
- ✅ Editar progresso das metas
- ✅ Marcar metas como concluídas
- ✅ Excluir metas concluídas
- ✅ Templates de metas pré-definidas
- ✅ Categorização por tipo de exercício
- ✅ Sistema de prioridades
- ✅ Interface responsiva e moderna
- ✅ Loading states e animações

### 🔄 Para Implementar (após migração)
- 🔄 Sincronização entre dispositivos
- 🔄 Backup automático na nuvem
- 🔄 Histórico detalhado de progresso
- 🔄 Estatísticas avançadas
- 🔄 Compartilhamento de metas
- 🔄 Notificações push

## 🛠️ Próximos Passos

1. **Aplicar a migração** do banco de dados
2. **Atualizar o código** para usar Supabase em vez de localStorage
3. **Testar** a funcionalidade com dados reais
4. **Implementar** funcionalidades avançadas

## 💾 Migração de Dados

Quando aplicar a migração:
- Os dados atuais ficam no localStorage (não são perdidos)
- Posso criar uma função para migrar dados existentes
- Usuários podem manter suas metas atuais

## 📞 Suporte

Se encontrar problemas na aplicação da migração:
1. Verifique as permissões do banco
2. Confirme se o Supabase CLI está configurado
3. Execute as migrações uma de cada vez se necessário

---

*Sistema preparado para migração quando o banco de dados estiver disponível para modificações.* 
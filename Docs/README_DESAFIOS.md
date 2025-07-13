# Sistema de Desafios entre Amigos - PlayFit

## Visão Geral

O sistema de desafios permite que usuários criem desafios fitness personalizados e convidem amigos para participar. É uma funcionalidade completa que incentiva a motivação através de competições saudáveis.

## Funcionalidades Implementadas

### 1. Página de Compartilhamento (`/share`)
- Acesso através do dropdown do perfil do usuário
- Botão "Criar Desafio com Amigos"
- Explicação de como o sistema funciona
- Exemplos de tipos de desafios

### 2. Criação de Desafios
**Campos obrigatórios:**
- Título do desafio
- Descrição
- Data de término

**Campos opcionais:**
- Regras detalhadas
- Número máximo de participantes

**Após criar:**
- Geração automática de link único
- Opção de copiar link para área de transferência
- Salvamento automático no localStorage (demonstração)

### 3. Página de Convite (`/join-challenge/:id`)
- Visualização das informações do desafio
- Dados do criador
- Número atual de participantes
- Botões para aceitar ou recusar o convite
- Verificação de login necessário

### 4. Página do Grupo do Desafio (`/challenge/:id`)
- Estatísticas do desafio (participantes, progresso médio, dias restantes)
- Informações completas do desafio
- Lista de participantes com progresso individual
- Botão para convidar mais pessoas (apenas para admin)
- Geração de novo link de convite

## Como Usar

### 1. Criando um Desafio
1. Faça login no PlayFit
2. Clique no avatar do usuário (canto superior direito)
3. Selecione "Compartilhar" no dropdown
4. Clique em "Criar Desafio com Amigos"
5. Preencha o formulário com os dados do desafio
6. Clique em "Criar Desafio"
7. Copie o link gerado e compartilhe com amigos

### 2. Participando de um Desafio
1. Receba o link do desafio de um amigo
2. Clique no link para acessar a página de convite
3. Visualize as informações do desafio
4. Faça login se necessário
5. Clique em "Aceitar Desafio"
6. Você será redirecionado para a página do grupo

### 3. Gerenciando um Desafio (Admin)
1. Acesse a página do desafio através do link
2. Visualize estatísticas e progresso dos participantes
3. Use o botão "Convidar Mais Pessoas" para gerar novos links
4. Acompanhe o progresso do grupo

## Estrutura de Dados

### Desafio
```json
{
  "id": "timestamp_unique_id",
  "title": "Título do Desafio",
  "description": "Descrição detalhada",
  "rules": "Regras do desafio",
  "endDate": "2024-12-31",
  "maxParticipants": 10,
  "createdBy": "Nome do Criador",
  "createdAt": "2024-01-01T00:00:00Z",
  "status": "active"
}
```

### Participante
```json
{
  "userId": "user_id",
  "name": "Nome do Usuário",
  "email": "email@example.com",
  "role": "admin|participant",
  "joinedAt": "2024-01-01T00:00:00Z",
  "progress": 75
}
```

## Rotas Implementadas

- `/share` - Página de compartilhamento e criação de desafios
- `/join-challenge/:id` - Página para aceitar convites
- `/challenge/:id` - Página do grupo do desafio

## Banco de Dados

Foi criada uma migração (`20250120000000_create_challenges.sql`) que inclui:

### Tabelas
- `challenges` - Armazena informações dos desafios
- `challenge_participants` - Relaciona usuários com desafios

### Recursos de Segurança
- Row Level Security (RLS) habilitado
- Políticas de acesso baseadas em autenticação
- Triggers para atualização automática de timestamps

## Demonstração Atual

No momento, o sistema usa `localStorage` para demonstração, mas está preparado para integração com o banco de dados Supabase através da migração criada.

## Próximos Passos

1. **Integração com Supabase**: Substituir localStorage pelas chamadas de API
2. **Sistema de Progresso**: Implementar tracking real de atividades
3. **Notificações**: Adicionar sistema de notificações para convites
4. **Ranking**: Implementar sistema de pontuação e ranking
5. **Tipos de Desafio**: Adicionar templates específicos (caminhada, corrida, etc.)

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: Componentes customizados do sistema
- **Roteamento**: React Router
- **Estado**: React Hooks (useState, useEffect)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth

## Suporte

O sistema está totalmente funcional e pode ser testado imediatamente. Para usar com dados reais, execute a migração do banco de dados e atualize as páginas para usar as APIs do Supabase. 
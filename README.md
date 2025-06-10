# 📚 Documentação do Schema Prisma – Serviço `userManagement`

## 🧩 Visão Geral

Este schema define os modelos de dados para o serviço de **gestão de usuários (userManagement)**. Ele trata de:

- Criação e autenticação de usuários
- Perfis de usuário (dados públicos/visuais)
- Sistema de amizades (com múltiplos estados)
- Suporte a autenticação com senha e 2FA
- Enums para status do usuário e gênero

---

## � Como Inicializar e Rodar o Projeto

1. **Clone o repositório e instale as dependências:**
   ```bash
   git clone <repo-url>
   cd User-Management
   npm install
   ```

2. **Configure o banco de dados:**
   - Crie um arquivo `.env` na raiz do projeto com:
     ```env
     DATABASE_URL="file:./dev.db"
     ```

3. **Rode as migrations e gere o client Prisma:**
   ```bash
   npx prisma migrate dev --name init_user_management
   npx prisma generate
   ```

4. **Inicie o servidor:**
   ```bash
   npm run build   # se houver build step
   npm start
   # ou diretamente:
   npx ts-node src/server.ts
   ```

5. **Acesse a API em:**  
   `http://localhost:3000/`

---

## �️ Funcionalidades da API

### Usuários (`/api/users`)

- **Criar usuário:** `POST /api/users`
- **Listar todos usuários:** `GET /api/users`
- **Buscar usuário por username:** `GET /api/users/:username`
- **Atualizar usuário:** `PUT /api/users/:username`
- **Desativar usuário:** `PATCH /api/users/:username`
- **Deletar usuário:** `DELETE /api/users/:username`

### Perfis (`/api/profiles`)

- **Criar perfil:** `POST /api/profiles`
- **Buscar perfil por username:** `GET /api/profiles/:username`
- **Atualizar perfil:** `PUT /api/profiles/:username`
- **Deletar perfil:** `DELETE /api/profiles/:username`

### Amizades (`/api/friendships`)

- **Enviar solicitação de amizade:** `POST /api/friendships/request`
- **Listar solicitações recebidas:** `GET /api/friendships/requests/:userId`
- **Responder solicitação (aceitar/recusar):** `POST /api/friendships/respond/:friendshipId`
- **Listar amigos:** `GET /api/friendships/list/:userId`
- **Remover amigo:** `POST /api/friendships/remove`

---

## 🔗 Relacionamento entre os modelos

```
User ────┐
         │1:1
      Profile

User ────< SentRequests:Friendship >──── User
       │                       ▲
       ▼                       │
 requester                addressee
```

---

## 📦 Modelos

### `User`

| Campo             | Tipo      | Descrição |
|------------------|-----------|-----------|
| `id`             | `String`  | UUID único do usuário |
| `username`       | `String`  | Nome único do usuário (login) |
| `email`          | `String?` | E-mail único (opcional) |
| `password`       | `String`  | Senha criptografada |
| `active`         | `Boolean` | Se o usuário está ativo ou desativado |
| `twoFactorEnabled` | `Boolean` | Se 2FA está habilitado |
| `twoFactorSecret`  | `String?` | Secret base32 TOTP (caso 2FA ativo) |
| `createdAt` / `updatedAt` | `DateTime` | Timestamps automáticos |
| `friendshipsSent` / `Received` | `Friendship[]` | Amizades enviadas e recebidas |
| `profile`        | `Profile?` | Dados visuais relacionados (1:1) |

---

### `Profile`

| Campo       | Tipo         | Descrição |
|-------------|--------------|-----------|
| `id`        | `String`     | UUID do perfil |
| `status`    | `UserStatus` | Online, Offline ou In-Game |
| `avatar`    | `String?`    | URL da imagem de perfil |
| `bio`       | `String?`    | Pequena descrição |
| `gender`    | `UserGender?`| Gênero opcional |
| `nickName`  | `String?`    | Nome público exibido (único) |
| `firstName` / `lastName` | `String?` | Nome real do usuário (opcional) |
| `userId`    | `String`     | Chave estrangeira para `User` (1:1) |

---

### `Friendship`

| Campo        | Tipo                | Descrição |
|--------------|---------------------|-----------|
| `id`         | `String`            | UUID da relação |
| `requester`  | `User`              | Usuário que enviou a solicitação |
| `addressee`  | `User`              | Usuário que recebeu a solicitação |
| `status`     | `FriendshipStatus`  | Estado da amizade (pendente, aceita etc.) |
| `createdAt`  | `DateTime`          | Timestamp da criação |

---

## 🧾 Enums

### `FriendshipStatus`
- `PENDING`: Solicitação pendente
- `ACCEPTED`: Usuários são amigos
- `BLOCKED`: Um dos usuários bloqueou o outro
- `DECLINED`: Solicitação recusada

### `UserStatus`
- `ONLINE`
- `OFFLINE`
- `IN_GAME`

### `UserGender`
- `MALE`
- `FEMALE`
- `OTHER`

---

## 📌 Convenções & Boas Práticas

- Usamos UUIDs (`String @default(uuid())`) em todos os modelos para garantir unicidade global (ideal para micro-serviços).
- `@relation("SentRequests")` e `@relation("ReceivedRequests")` garantem clareza nas relações de amizade.
- Separação clara entre `User` (core do sistema) e `Profile` (dados visuais/opcionais).
- Campos como `password`, `twoFactorSecret` e `email` são considerados **dados sensíveis** sob o RGPD.
- `@unique` e `@@unique([...])` usados corretamente para garantir integridade.

---

## 🧪 Extras (para testar localmente)

- Use `npx prisma studio` para abrir a interface web de visualização do banco:
  ```bash
  npx prisma studio
  ```
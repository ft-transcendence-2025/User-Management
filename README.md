
# 📚 Documentação do Schema Prisma – Serviço `userManagement`

## 🧩 Visão Geral

Este schema define os modelos de dados para o serviço de **gestão de usuários (userManagement)**. Ele trata de:

- Criação e autenticação de usuários
- Perfis de usuário (dados públicos/visuais)
- Sistema de amizades (com múltiplos estados)
- Suporte a autenticação com senha e 2FA
- Enums para status do usuário e gênero

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

Representa a **entidade principal do sistema**. Responsável por autenticação, identificação e controle de acesso.

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

Contém **informações públicas e estéticas** de um usuário. Mantido separado para manter a responsabilidade do modelo `User` clara e focada.

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

Representa **relações sociais** entre usuários. Cada relação possui um `status`, e o par `(requesterId, addresseeId)` é único para evitar duplicações.

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

Estado atual da relação entre dois usuários.

- `PENDING`: Solicitação pendente
- `ACCEPTED`: Usuários são amigos
- `BLOCKED`: Um dos usuários bloqueou o outro
- `DECLINED`: Solicitação recusada

---

### `UserStatus`

Usado para indicar o status atual de conexão do usuário. Pode ser utilizado em interfaces ou matchmaking.

- `ONLINE`
- `OFFLINE`
- `IN_GAME`

---

### `UserGender`

Opcional, para representar gênero no perfil.

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

## ✅ Migração e Execução

Para gerar a migration inicial:

```bash
npx prisma migrate dev --name init_user_management
```

Para aplicar em produção (depois):

```bash
npx prisma migrate deploy
```

Para gerar o client Prisma:

```bash
npx prisma generate
```

---

## 🧪 Extras (para testar localmente)

Crie um arquivo `.env` com:

```env
DATABASE_URL="file:./dev.db"
```

E use `npx prisma studio` para abrir a interface web de visualização do banco:

```bash
npx prisma studio
```

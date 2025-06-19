# 📚 Prisma Schema Documentation – `userManagement` Service

## 🧩 Overview

This schema defines the data models for the **user management service**. It covers:

- User creation and authentication
- User profiles (public/visual data)
- Profile avatar upload/download (binary image)
- Friendship system (with multiple states)
- Password and 2FA authentication support
- Enums for user status, gender, and language

---

## 🚀 How to Initialize and Run the Project

1. **Clone the repository and install dependencies:**
   ```bash
   git clone <repo-url>
   cd User-Management
   npm install
   ```

2. **Configure the database:**
   - Create a `.env` file at the project root with:
     ```env
     DATABASE_URL="file:./dev.db"
     ```

3. **Run migrations and generate the Prisma client:**
   ```bash
   npx prisma migrate dev --name init_user_management
   npx prisma generate
   ```

4. **Start the server:**
   ```bash
   npm run build   # if you have a build step
   npm start
   # or directly:
   npx ts-node src/server.ts
   ```

5. **Access the API at:**  
   `http://localhost:3000/`

---

## 🛠️ API Functionality

### Authentication (`/auth`)
- **Login:** `POST /auth/login`

### Users (`/users`)
- **Create user:** `POST /users`
- **List all users:** `GET /users`
- **Get user by username:** `GET /users/:username`
- **Update user:** `PUT /users/:username`
- **Disable user:** `PATCH /users/:username`
- **Delete user:** `DELETE /users/:username`

### Profiles (`/profiles`)
- **Create profile:** `POST /profiles/:username`
- **Get profile by username:** `GET /profiles/:username`
- **Update profile:** `PUT /profiles/:username`
- **Delete profile:** `DELETE /profiles/:username`
- **Upload avatar:** `POST /profiles/:username/avatar` (`multipart/form-data`)
- **Download avatar:** `GET /profiles/:username/avatar` (returns binary image)

### Friendships (`/friendships`)
- **Send friend request:** `POST /friendships`
- **List received requests:** `GET /friendships/requests/:username`
- **Respond to request (accept/decline):** `PATCH /friendships/respond/:friendshipId`
- **List friends:** `GET /friendships/list/:username`
- **Remove friend:** `DELETE /friendships`

---

## 🔗 Model Relationships

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

## 📦 Models

### `User`

| Field               | Type      | Description                                 |
|---------------------|-----------|---------------------------------------------|
| `id`                | `String`  | Unique user UUID                            |
| `username`          | `String`  | Unique username (login)                     |
| `email`             | `String?` | Unique email (optional)                     |
| `password`          | `String`  | Hashed password                             |
| `active`            | `Boolean` | Whether the user is active or disabled      |
| `twoFactorEnabled`  | `Boolean` | Whether 2FA is enabled                      |
| `twoFactorSecret`   | `String?` | base32 TOTP secret (if 2FA enabled)         |
| `createdAt`/`updatedAt` | `DateTime` | Automatic timestamps                  |
| `friendshipsSent`/`friendshipsReceived` | `Friendship[]` | Sent/received friendships |
| `profile`           | `Profile?`| Related visual data (1:1)                   |

---

### `Profile`

| Field       | Type             | Description                                 |
|-------------|------------------|---------------------------------------------|
| `id`        | `String`         | Profile UUID                                |
| `status`    | `UserStatus`     | Online, Offline, or In-Game                 |
| `avatar`    | `Bytes?`         | Binary avatar image (upload/download only)   |
| `bio`       | `String?`        | Short description                           |
| `gender`    | `UserGender?`    | Optional gender                             |
| `nickName`  | `String?`        | Public display name (unique)                |
| `firstName`/`lastName` | `String?` | Real name (optional)                   |
| `language`  | `ProfileLanguage?` | Preferred language (default: ENGLISH)    |
| `createdAt`/`updatedAt` | `DateTime` | Automatic timestamps                  |
| `userUsername` | `String`      | Foreign key to `User` (1:1)                 |

---

### `Friendship`

| Field        | Type                | Description                                 |
|--------------|---------------------|---------------------------------------------|
| `id`         | `String`            | Friendship UUID                             |
| `requester`  | `User`              | User who sent the request                   |
| `addressee`  | `User`              | User who received the request               |
| `status`     | `FriendshipStatus`  | Friendship state (pending, accepted, etc.)  |
| `createdAt`  | `DateTime`          | Creation timestamp                          |
| `updateAt`   | `DateTime`          | Last update timestamp                       |

---

## 🧾 Enums

### `FriendshipStatus`
- `PENDING`: Request pending
- `ACCEPTED`: Users are friends
- `BLOCKED`: One user blocked the other
- `DECLINED`: Request declined

### `UserStatus`
- `ONLINE`
- `OFFLINE`
- `IN_GAME`

### `UserGender`
- `MALE`
- `FEMALE`
- `OTHER`

### `ProfileLanguage`
- `ENGLISH`
- `PORTUGUESE`

---

## 📌 Conventions & Best Practices

- Avatar upload is handled only via the dedicated route (`/profiles/:username/avatar`).
- The `avatar` field is binary (`Bytes?`), not a string or base64.
- Do not send or update the avatar together with the profile; always use the dedicated route.
- Use `multipart/form-data` for avatar upload.
- UUIDs (`String @default(uuid())`) are used for all models for global uniqueness.
- Clear separation between `User` (core) and `Profile` (visual/optional data).
- Fields like `password`, `twoFactorSecret`, and `email` are **sensitive data** under GDPR.

---

## 🧪 Extras (for local testing)

- Use `npx prisma studio` to open the web interface for your database:
  ```bash
  npx prisma studio
  ```
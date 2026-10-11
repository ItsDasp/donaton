# API de Autenticación y Gestión de Usuarios

> [!NOTE]
> **URL Base**
>
> ```text
> http://localhost:8080/api/v1
> ```

> [!IMPORTANT]
> Los endpoints protegidos requieren un token de acceso válido en el encabezado:
>
> ```http
> Authorization: Bearer <access_token>
> ```

> [!TIP]
> Obtén el `access_token` mediante el endpoint `/auth/login` y úsalo para acceder a los recursos protegidos.

> [!WARNING]
> Las operaciones de administración de usuarios requieren el rol **ADMIN**.

---

## Roles Disponibles

* `USER`
* `ONG`
* `ADMIN`

---

## Endpoints

| Método | Endpoint                  | Cuerpo (Body)                                | Respuesta                  | Requiere Token | Rol Requerido |
| ------ | ------------------------- | -------------------------------------------- | -------------------------- | -------------- | ------------- |
| POST   | `/auth/login`             | `email`, `password`                          | Token de acceso y refresco | No             | Ninguno       |
| POST   | `/auth/register`          | `name`, `email`, `phone`, `password`         | Datos del usuario creado   | No             | Ninguno       |
| GET    | `/auth/users`             | Ninguno                                      | Lista de usuarios          | Sí             | ADMIN         |
| POST   | `/auth/users`             | `name`, `email`, `phone`, `password`, `role` | Usuario creado             | Sí             | ADMIN         |
| PUT    | `/auth/users/{id}/{role}` | Ninguno                                      | Usuario actualizado        | Sí             | ADMIN         |
| DELETE | `/auth/users/{id}`        | Ninguno                                      | `200 OK`                   | Sí             | ADMIN         |

---

## Ejemplos

### Iniciar Sesión

**Solicitud**

```http
POST /auth/login
```

```json
{
  "email": "admin@donaton.test",
  "password": "admin123"
}
```

**Respuesta**

```json
{
  "tokenType": "Bearer",
  "accessToken": "<access_token>",
  "refreshToken": "<refresh_token>",
  "accessExpiresIn": 3600,
  "refreshExpiresIn": 604800
}
```

---

### Registro de Usuario

**Solicitud**

```http
POST /auth/register
```

```json
{
  "name": "Usuario 2",
  "email": "usuario2@donaton.test",
  "password": "usuario234",
  "phone": "123456789"
}
```

**Respuesta**

```json
{
  "id": 2,
  "name": "Usuario 2",
  "email": "usuario2@donaton.test",
  "phone": "123456789",
  "role": "USER"
}
```

---

### Crear Usuario desde el Panel de Administración

**Solicitud**

```http
POST /auth/users
```

```json
{
  "name": "Usuario 2",
  "email": "usuario2@donaton.test",
  "password": "usuario234",
  "phone": "123456789",
  "role": "USER"
}
```

**Respuesta**

```json
{
  "id": 2,
  "name": "Usuario 2",
  "email": "usuario2@donaton.test",
  "phone": "123456789",
  "role": "USER"
}
```

---

### Obtener Usuarios

**Solicitud**

```http
GET /auth/users
```

**Respuesta**

```json
[
  {
    "id": 2,
    "name": "user",
    "email": "user@donaton.test",
    "phone": null,
    "role": "USER"
  },
  {
    "id": 3,
    "name": "ong",
    "email": "ong@donaton.test",
    "phone": null,
    "role": "ONG"
  },
  {
    "id": 1,
    "name": "admin",
    "email": "admin@donaton.test",
    "phone": null,
    "role": "ADMIN"
  }
]
```

---

### Actualizar Rol de Usuario

**Solicitud**

```http
PUT /auth/users/2/ADMIN
```

**Respuesta**

```json
{
  "id": 2,
  "name": "Usuario 2",
  "email": "usuario2@donaton.test",
  "phone": "123456789",
  "role": "ADMIN"
}
```

---

### Eliminar Usuario

**Solicitud**

```http
DELETE /auth/users/2
```

**Respuesta**

```http
200 OK
```

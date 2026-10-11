# API Gateway

> [!NOTE]
> **URL Base**
>
> ```text
> http://localhost:8080
> ```

> [!IMPORTANT]
> El Gateway es el punto de entrada único para todos los microservicios de Donatón.

> [!TIP]
> Los clientes externos solo necesitan comunicarse con el Gateway; éste se encarga de redirigir las solicitudes al servicio correspondiente.

> [!WARNING]
> Los endpoints protegidos requieren un token de acceso válido en el encabezado:
>
> ```http
> Authorization: Bearer <access_token>
> ```

---

## Servicios Disponibles

| Servicio  | Ruta                   | Descripción                                        |
| --------- | ---------------------- | -------------------------------------------------- |
| Auth      | `/api/v1/auth/**`      | Autenticación, autorización y gestión de usuarios. |
| Donation  | `/api/v1/donations/**` | Gestión de donaciones.                             |
| Needs     | `/api/v1/needs/**`     | Gestión de necesidades y solicitudes.              |
| Logistics | `/api/v1/envios/**`    | Gestión y seguimiento de envíos.                   |

---

## Ejemplos

### Iniciar Sesión

**Solicitud**

```http
POST /api/v1/auth/login
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

### Obtener Donaciones

**Solicitud**

```http
GET /api/v1/donations
Authorization: Bearer <access_token>
```

**Respuesta**

```json
[
  {
    "id": 1,
    "descripcion": "10 cajas de leche",
    "cantidad": 10,
    "tipo": "ALIMENTOS",
    "direccion": "Av. Principal 123",
    "needId": "need-001",
    "donorEmail": "user@donaton.test",
    "unit": "cajas"
  }
]
```

---

### Obtener Necesidades

**Solicitud**

```http
GET /api/v1/needs
Authorization: Bearer <access_token>
```

**Respuesta**

```json
[
  {
    "id": "need-001",
    "productName": "Leche",
    "category": "ALIMENTOS",
    "quantityRequired": 100,
    "quantityReceived": 25,
    "unit": "cajas",
    "priority": "ALTA",
    "status": "PENDIENTE"
  }
]
```

---

### Obtener Envíos

**Solicitud**

```http
GET /api/v1/envios
Authorization: Bearer <access_token>
```

**Respuesta**

```json
[
  {
    "id": 1,
    "donacionId": 1,
    "estado": "pendiente_acopio"
  }
]
```

---

## Arquitectura

```text
                Cliente
                   │
                   ▼
              API Gateway
                   │
      ┌────────────┼────────────┬────────────┐
      ▼            ▼            ▼            ▼
    Auth       Donation      Needs       Logistics
```

---

> [!CAUTION]
> El Gateway no almacena información de negocio. Su única responsabilidad es enrutar y centralizar el acceso a los microservicios.
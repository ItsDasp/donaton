# Backend For Frontend (BFF)

> [!NOTE]
> Este servicio actúa como capa de integración entre el frontend y los microservicios de Donatón.

> [!IMPORTANT]
> Todas las solicitudes del frontend deben realizarse a través del BFF.

> [!TIP]
> El BFF centraliza autenticación, validaciones, manejo de errores y comunicación con los distintos microservicios.

> [!WARNING]
> No se recomienda que el frontend consuma directamente los microservicios internos.

---

## Responsabilidades

El BFF proporciona una interfaz única para el frontend y se encarga de:

* Autenticar usuarios.
* Gestionar tokens de acceso y refresco.
* Centralizar las llamadas a los microservicios.
* Unificar formatos de respuesta.
* Manejar errores y excepciones.
* Aplicar validaciones previas a las solicitudes.

---

## Servicios Integrados

| Servicio  | Descripción                                        |
| --------- | -------------------------------------------------- |
| Auth      | Autenticación, autorización y gestión de usuarios. |
| Donation  | Gestión de donaciones.                             |
| Needs     | Gestión de necesidades.                            |
| Logistics | Gestión logística y seguimiento de envíos.         |

---

## Endpoints Disponibles

### Autenticación

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh

GET    /api/v1/auth/users
POST   /api/v1/auth/users
PUT    /api/v1/auth/users/{id}/role
DELETE /api/v1/auth/users/{id}
```

### Donaciones

```text
GET    /api/v1/donations
GET    /api/v1/donations/{id}
POST   /api/v1/donations
PUT    /api/v1/donations/{id}
DELETE /api/v1/donations/{id}
```

### Necesidades

```text
GET    /api/v1/needs
GET    /api/v1/needs/{id}
POST   /api/v1/needs
PUT    /api/v1/needs/{id}
PUT    /api/v1/needs/{id}/receive
DELETE /api/v1/needs/{id}
```

### Logística

```text
GET    /api/v1/logistics
POST   /api/v1/logistics
PUT    /api/v1/logistics/{id}/estado
```

---

## Seguridad

Los endpoints protegidos requieren el encabezado:

```http
Authorization: Bearer <access_token>
```

El token es validado antes de reenviar la solicitud al microservicio correspondiente.

# API de Gestión Logística

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
> Este servicio se encarga de gestionar el traslado de donaciones desde el donante hacia los centros de acopio y posteriormente hacia su destino final.

> [!WARNING]
> La actualización de estados impacta directamente el flujo logístico de una donación.

---

## Roles Disponibles

* `USER`
* `ONG`
* `ADMIN`

---

## Estados Disponibles

* `pendiente_acopio`
* `recibida`
* `en_camino`
* `entregado`
* `inexistente`

---

## Endpoints

| Método | Endpoint                              | Cuerpo (Body) | Respuesta         | Requiere Token | Rol Requerido |
| ------ | ------------------------------------- | ------------- | ----------------- | -------------- | ------------- |
| POST   | `/envios`                             | `donacionId`  | Envío creado      | Sí             | USER          |
| GET    | `/envios`                             | Ninguno       | Lista de envíos   | Sí             | USER          |
| PUT    | `/envios/{id}/estado?estado={estado}` | Ninguno       | Envío actualizado | Sí             | ADMIN         |

---

## Ejemplos

### Crear Envío

**Solicitud**

```http
POST /envios
```

```json
{
  "donacionId": 1
}
```

**Respuesta**

```json
{
  "id": 1,
  "donacionId": 1,
  "needId": "need-001",
  "direccion": "Av. Principal 123",
  "acopioCenterId": "center-001",
  "acopioCenterName": "Centro Santiago",
  "estado": "pendiente_acopio",
  "createdAt": "2026-06-20T18:00:00Z",
  "acopioDeadline": "2026-06-27T18:00:00Z",
  "cantidadDonada": 10.0
}
```

---

### Obtener Envíos

**Solicitud**

```http
GET /envios
```

**Respuesta**

```json
[
  {
    "id": 1,
    "donacionId": 1,
    "needId": "need-001",
    "direccion": "Av. Principal 123",
    "acopioCenterId": "center-001",
    "acopioCenterName": "Centro Santiago",
    "estado": "pendiente_acopio",
    "createdAt": "2026-06-20T18:00:00Z",
    "acopioDeadline": "2026-06-27T18:00:00Z",
    "cantidadDonada": 10.0
  }
]
```

---

### Obtener Envíos por Centro de Acopio

**Solicitud**

```http
GET /envios?acopioCenterId=center-001
```

**Respuesta**

```json
[
  {
    "id": 1,
    "donacionId": 1,
    "needId": "need-001",
    "direccion": "Av. Principal 123",
    "acopioCenterId": "center-001",
    "acopioCenterName": "Centro Santiago",
    "estado": "pendiente_acopio",
    "createdAt": "2026-06-20T18:00:00Z",
    "acopioDeadline": "2026-06-27T18:00:00Z",
    "cantidadDonada": 10.0
  }
]
```

---

### Actualizar Estado de Envío

**Solicitud**

```http
PUT /envios/1/estado?estado=en_camino
```

**Respuesta**

```json
{
  "id": 1,
  "donacionId": 1,
  "needId": "need-001",
  "direccion": "Av. Principal 123",
  "acopioCenterId": "center-001",
  "acopioCenterName": "Centro Santiago",
  "estado": "en_camino",
  "createdAt": "2026-06-20T18:00:00Z",
  "acopioDeadline": "2026-06-27T18:00:00Z",
  "cantidadDonada": 10.0
}
```

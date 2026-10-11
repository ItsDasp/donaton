# API de Gestión de Necesidades

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
> Las necesidades representan productos o recursos solicitados por centros de acopio u organizaciones para cubrir una necesidad específica.

> [!WARNING]
> Algunas operaciones pueden afectar directamente el stock recibido y el estado de una necesidad.

---

## Roles Disponibles

* `USER`
* `ONG`
* `ADMIN`

---

## Endpoints

| Método | Endpoint                                 | Cuerpo (Body)         | Respuesta             | Requiere Token | Rol Requerido |
| ------ | ---------------------------------------- | --------------------- | --------------------- | -------------- | ------------- |
| GET    | `/needs`                                 | Ninguno               | Lista de necesidades  | Sí             | USER          |
| GET    | `/needs/{id}`                            | Ninguno               | Detalle de necesidad  | Sí             | USER          |
| POST   | `/needs`                                 | Datos de la necesidad | Necesidad creada      | Sí             | ONG           |
| PUT    | `/needs/{id}`                            | Datos actualizados    | Necesidad actualizada | Sí             | ONG           |
| PUT    | `/needs/{id}/receive?amount={cantidad}`  | Ninguno               | Necesidad actualizada | Sí             | ADMIN         |
| PUT    | `/needs/{id}/rollback?amount={cantidad}` | Ninguno               | Necesidad actualizada | Sí             | ADMIN         |
| DELETE | `/needs/{id}`                            | Ninguno               | `200 OK`              | Sí             | ONG           |

---

## Ejemplos

### Obtener Necesidades

**Solicitud**

```http
GET /needs
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

### Obtener Necesidad por ID

**Solicitud**

```http
GET /needs/need-001
```

**Respuesta**

```json
{
  "id": "need-001",
  "productName": "Leche",
  "category": "ALIMENTOS",
  "quantityRequired": 100,
  "quantityReceived": 25,
  "unit": "cajas",
  "priority": "ALTA",
  "status": "PENDIENTE",
  "region": "Metropolitana",
  "address": "Av. Principal 123",
  "description": "Leche para familias afectadas"
}
```

---

### Crear Necesidad

**Solicitud**

```http
POST /needs
```

```json
{
  "productName": "Leche",
  "category": "ALIMENTOS",
  "quantityRequired": 100,
  "unit": "cajas",
  "priority": "ALTA",
  "region": "Metropolitana",
  "address": "Av. Principal 123",
  "description": "Leche para familias afectadas"
}
```

**Respuesta**

```json
{
  "id": "need-001",
  "productName": "Leche",
  "category": "ALIMENTOS",
  "quantityRequired": 100,
  "quantityReceived": 0,
  "unit": "cajas",
  "priority": "ALTA",
  "status": "PENDIENTE"
}
```

---

### Actualizar Necesidad

**Solicitud**

```http
PUT /needs/need-001
```

```json
{
  "quantityRequired": 150,
  "priority": "MEDIA"
}
```

**Respuesta**

```json
{
  "id": "need-001",
  "productName": "Leche",
  "quantityRequired": 150,
  "quantityReceived": 0,
  "priority": "MEDIA",
  "status": "PENDIENTE"
}
```

---

### Registrar Recepción de Donaciones

**Solicitud**

```http
PUT /needs/need-001/receive?amount=20
```

**Respuesta**

```json
{
  "id": "need-001",
  "quantityRequired": 100,
  "quantityReceived": 45,
  "status": "PENDIENTE"
}
```

---

### Revertir Recepción

**Solicitud**

```http
PUT /needs/need-001/rollback?amount=10
```

**Respuesta**

```json
{
  "id": "need-001",
  "quantityRequired": 100,
  "quantityReceived": 35,
  "status": "PENDIENTE"
}
```

---

### Eliminar Necesidad

**Solicitud**

```http
DELETE /needs/need-001
```

**Respuesta**

```http
200 OK
```

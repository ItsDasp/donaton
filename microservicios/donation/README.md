# API de Gestión de Donaciones

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
> Este servicio permite registrar y administrar donaciones realizadas por los usuarios para cubrir necesidades registradas en el sistema.

> [!WARNING]
> La eliminación de una donación puede afectar procesos logísticos y necesidades asociadas.

---

## Roles Disponibles

* `USER`
* `ONG`
* `ADMIN`

---

## Endpoints

| Método | Endpoint          | Cuerpo (Body)        | Respuesta            | Requiere Token | Rol Requerido |
| ------ | ----------------- | -------------------- | -------------------- | -------------- | ------------- |
| GET    | `/donations`      | Ninguno              | Lista de donaciones  | Sí             | USER          |
| GET    | `/donations/{id}` | Ninguno              | Detalle de donación  | Sí             | USER          |
| POST   | `/donations`      | Datos de la donación | Donación creada      | Sí             | USER          |
| PUT    | `/donations/{id}` | Datos actualizados   | Donación actualizada | Sí             | USER          |
| DELETE | `/donations/{id}` | Ninguno              | `204 No Content`     | Sí             | USER          |

---

## Ejemplos

### Obtener Donaciones

**Solicitud**

```http
GET /donations
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

### Obtener Donación por ID

**Solicitud**

```http
GET /donations/1
```

**Respuesta**

```json
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
```

---

### Crear Donación

**Solicitud**

```http
POST /donations
```

```json
{
  "descripcion": "10 cajas de leche",
  "cantidad": 10,
  "tipo": "ALIMENTOS",
  "direccion": "Av. Principal 123",
  "needId": "need-001",
  "unit": "cajas"
}
```

**Respuesta**

```json
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
```

---

### Actualizar Donación

**Solicitud**

```http
PUT /donations/1
```

```json
{
  "descripcion": "15 cajas de leche",
  "cantidad": 15,
  "tipo": "ALIMENTOS",
  "direccion": "Av. Principal 456",
  "needId": "need-001",
  "unit": "cajas"
}
```

**Respuesta**

```json
{
  "id": 1,
  "descripcion": "15 cajas de leche",
  "cantidad": 15,
  "tipo": "ALIMENTOS",
  "direccion": "Av. Principal 456",
  "needId": "need-001",
  "donorEmail": "user@donaton.test",
  "unit": "cajas"
}
```

---

### Eliminar Donación

**Solicitud**

```http
DELETE /donations/1
```

**Respuesta**

```http
200 OK
```

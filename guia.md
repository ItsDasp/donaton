**1. Verificar el entorno**

```powershell
docker compose config --quiet
docker compose ps
docker logs rabbitmq --tail 100
```

Confirma que estén activos:

- `rabbitmq`
- `auth-service`
- `donation-service`
- `needs-service`
- `logistics-service`

RabbitMQ Management debe estar disponible en:

```text
http://localhost:15672
```

Credenciales actuales:

```text
Usuario: myuser
Contraseña: secret
Virtual host: /
```

**2. Verificar la topología**

En la interfaz RabbitMQ revisa:

- Exchange `donaton.logistics.events`
  - Tipo: `direct`
- Exchange `donaton.logistics.dlx`
  - Tipo: `direct`
- Exchange `donaton.domain.events`
  - Tipo: `topic`
- Cola `donaton.logistics.queue`
- Cola `donaton.logistics.queue.dlq`
- Binding `logistics.event`
- Consumidor activo en `donaton.logistics.queue`

También puedes usar:

```powershell
curl.exe -u myuser:secret `
  "http://localhost:15672/api/exchanges/%2f"

curl.exe -u myuser:secret `
  "http://localhost:15672/api/queues/%2f"

curl.exe -u myuser:secret `
  "http://localhost:15672/api/consumers"
```

**3. Probar `logistics` con un mensaje correcto**

Desde el exchange `donaton.logistics.events` publica:

```json
{"id":123456}
```

Valores:

```text
Exchange: donaton.logistics.events
Routing key: logistics.event
Content type: application/json
```

Comprueba:

```powershell
docker logs logistics-service --since 1m
```

Debe aparecer:

```text
Mensaje de logística procesado correctamente
```

La cola puede mostrar `0`, porque el consumidor confirma el mensaje inmediatamente.

**4. Probar la DLQ**

Publica:

```json
{"id":null}
```

Con la misma routing key:

```text
logistics.event
```

Comprueba:

```powershell
curl.exe -u myuser:secret `
  "http://localhost:15672/api/queues/%2f/donaton.logistics.queue.dlq"
```

Debe aumentar:

```text
messages > 0
```

Y en los logs:

```text
Mensaje de logística rechazado y enviado a la DLQ
```

**5. Ver un mensaje pendiente en la cola**

Para que el mensaje no sea consumido inmediatamente:

```powershell
docker compose stop logistics
```

Publica desde RabbitMQ:

```json
{"id":123456}
```

Consulta la cola:

```powershell
curl.exe -u myuser:secret `
  "http://localhost:15672/api/queues/%2f/donaton.logistics.queue"
```

Debe mostrar:

```text
messages_ready: 1
```

Después inicia el consumidor:

```powershell
docker compose start logistics
```

El mensaje debería desaparecer tras recibir el `ACK`.

**6. Crear una cola temporal para probar eventos de todos los servicios**

En RabbitMQ Management:

1. Ve a **Queues**.
2. Crea una cola durable:

```text
donaton.test.events
```

3. Ve a **Bindings**.
4. Crea un binding:
   - Source: `donaton.domain.events`
   - Destination: `donaton.test.events`
   - Routing key: `#`

Así podrás observar todos los eventos publicados por `auth`, `donation` y `needs`.

**7. Probar eventos de `auth`**

Ejecuta desde la aplicación o API:

- Registrar usuario.
- Crear usuario como administrador.
- Cambiar rol.
- Actualizar perfil.
- Eliminar usuario.

Routing keys esperadas:

```text
user.registered
user.updated
user.role_changed
user.deleted
```

Consulta la cola temporal desde RabbitMQ usando **Get messages**. Para no eliminar el mensaje, utiliza una opción de requeue cuando esté disponible.

**8. Probar eventos de `needs`**

Ejecuta:

- Crear necesidad.
- Actualizar necesidad.
- Recibir una donación.
- Revertir una recepción.
- Eliminar necesidad.

Routing keys:

```text
need.created
need.updated
need.received
need.receive_rolled_back
need.deleted
```

**9. Probar eventos de `donation`**

Crea una donación válida desde la web o API.

Routing key esperada:

```text
donation.created
```

El flujo HTTP actual debe seguir funcionando:

```text
donation -> needs
donation -> logistics
```

Además, debe aparecer el evento en `donaton.test.events`.

**10. Revisar métricas**

Exchange de logística:

```powershell
curl.exe -u myuser:secret `
  "http://localhost:15672/api/exchanges/%2f/donaton.logistics.events"
```

Exchange de eventos de dominio:

```powershell
curl.exe -u myuser:secret `
  "http://localhost:15672/api/exchanges/%2f/donaton.domain.events"
```

Observa:

- `publish_in`
- `publish_out`
- `deliver`
- `ack`
- `redeliver`
- `messages_unacknowledged`

**11. Probar errores**

Prueba estos casos:

```json
{"id":null}
```

```json
{}
```

```text
{ id: 123 }
```

```json
{"id":"texto"}
```

Verifica si terminan en la DLQ o producen un error de conversión.

También prueba una routing key incorrecta:

```text
routing.key.incorrecta
```

En un exchange `direct`, ese mensaje no debe llegar a `donaton.logistics.queue`.

**12. Probar reinicios**

Mientras haya un mensaje pendiente:

```powershell
docker compose restart logistics
```

Comprueba que:

- La cola no pierde el mensaje.
- El consumidor vuelve a conectarse.
- El mensaje se entrega una vez.
- No aumenta `redeliver` indefinidamente.

También reinicia RabbitMQ:

```powershell
docker compose restart rabbitmq
```

Después revisa:

```powershell
docker compose ps
docker logs logistics-service --since 2m
docker logs auth-service --since 2m
docker logs donation-service --since 2m
docker logs needs-service --since 2m
```

**13. Comprobar fallos de conexión**

Detén RabbitMQ temporalmente:

```powershell
docker compose stop rabbitmq
```

Verifica que los servicios registren warnings de conexión y que la web no se caiga completamente.

Después:

```powershell
docker compose start rabbitmq
```

Actualmente los publishers registran un warning si RabbitMQ no está disponible, pero no existe todavía un patrón Outbox. Por tanto, un evento publicado durante una caída podría perderse aunque la operación HTTP tenga éxito.

**Resultado esperado final**

- `logistics` consume mensajes de `donaton.logistics.queue`.
- Mensajes inválidos terminan en la DLQ.
- `auth`, `donation` y `needs` publican eventos en `donaton.domain.events`.
- Gateway, BFF y frontend siguen funcionando por HTTP.
- Las métricas de RabbitMQ muestran publicación, entrega y confirmación.
- Los reinicios no dejan canales ni consumidores permanentemente desconectados.

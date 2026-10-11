# Donaton

> [!IMPORTANT]
> Plataforma de gestión de donaciones basada en una arquitectura de microservicios.

<p align="center">
  <img src="https://i.imgur.com/qfgKokU.png" alt="Donaton Web">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange" alt="Java">
  <img src="https://img.shields.io/badge/Spring_Boot-3.x-green" alt="Spring Boot">
  <img src="https://img.shields.io/badge/React-19-61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6" alt="TypeScript">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED" alt="Docker Compose">
  <img src="https://img.shields.io/badge/JWT-Authentication-red" alt="JWT">
</p>

---

## Descripción

Donatón es una plataforma diseñada para facilitar la gestión y distribución de donaciones, conectando usuarios, organizaciones y centros de acopio mediante una arquitectura basada en microservicios.

La solución está compuesta por:

* Un frontend desarrollado con React y TypeScript.
* Un Backend For Frontend (BFF).
* Un API Gateway para centralizar el acceso a los servicios.
* Microservicios independientes encargados de autenticación, donaciones, necesidades y logística.

---

## Tecnologías

* Java 21
* Spring Boot
* Spring Cloud Gateway
* OpenFeign
* JWT
* React
* TypeScript
* Docker Compose
* Maven

---

## Arquitectura

| Componente                                 | Descripción                                     |
| ------------------------------------------ | ----------------------------------------------- |
| [Microservicios](microservicios/README.md) | Servicios principales del sistema.              |
| [BFF](bff/README.md)                       | Backend orientado al frontend.                  |
| [Frontend](frontend/README.md)             | Aplicación web para usuarios y administradores. |

---

## Flujo General

```

                Frontend
                    │
                    ▼
                  BFF
                    │
                    ▼
                API Gateway
                    │
     ┌──────────────┼──────────────┼──────────────┐
     │              │              │              │
     ▼              ▼              ▼              ▼
   Auth         Donation        Logistics       Needs
   ```

## Puesta en Marcha

### Levantar todos los servicios

```bash
docker compose up --build
```

### Detener los servicios

```bash
docker compose down
```

---

## Estructura del Proyecto

```text
.
├── frontend/
├── bff/
├── microservicios/
│   ├── auth/
│   ├── donation/
│   ├── gateway/
│   ├── logistics/
│   └── needs/
└── docker-compose.yml
```

---

## Documentación

Cada componente dispone de su propia documentación, incluyendo:

* Descripción del servicio.
* Endpoints disponibles.
* Roles y permisos.
* Ejemplos de solicitudes y respuestas.
* Configuración y ejecución.

> [!TIP]
> Consulta los README de cada componente para obtener información detallada sobre su funcionamiento.

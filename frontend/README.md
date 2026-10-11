# Frontend

> [!NOTE]
> Aplicación web de Donatón desarrollada con React, TypeScript y Vite.

---

## Tecnologías

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Chart.js
- React Chartjs 2
- Leaflet
- React Leaflet

---

## Estructura del Proyecto

```text
src/
├── assets/
├── components/
├── context/
├── hooks/
├── layouts/
├── pages/
├── services/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

---

## Funcionalidades

- Inicio de sesión y registro de usuarios.
- Gestión de necesidades.
- Registro y visualización de donaciones.
- Seguimiento de envíos.
- Panel administrativo.
- Visualización de estadísticas mediante gráficos.
- Gestión de usuarios y roles.

---

## Instalación

### Instalar dependencias

```bash
npm install
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

### Generar versión de producción

```bash
npm run build
```

### Vista previa de producción

```bash
npm run preview
```

---

## Variables de Entorno

```env
VITE_API_BASE_URL=/api/v1
```

---

## Dependencias Principales

| Librería | Propósito |
|-----------|------------|
| React Router DOM | Navegación entre páginas |
| Axios | Comunicación con el BFF |
| Tailwind CSS | Estilos |
| Chart.js | Gráficos y estadísticas |
| Leaflet | Mapas y geolocalización |
| SweetAlert2 | Ventanas y alertas |
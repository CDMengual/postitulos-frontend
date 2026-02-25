# Postitulos Frontend

Frontend de gestion e inscripcion para postitulos docentes, construido con Next.js (App Router), React, TypeScript y MUI.

## Stack Tecnologico

- Next.js 16
- React 19
- TypeScript 5
- Material UI 7 (+ MUI X Data Grid)
- Axios
- ESLint 9

## Modulos Principales

- Gestion privada (`/gestion`) con autenticacion por cookie.
- Inscripcion publica (`/inscripcion`) para postulantes.
- ABM de postitulos, cohortes, aulas, usuarios, institutos y cursantes.
- Constructor/visualizador de formularios de preinscripcion.
- Interceptores de API para manejar errores 401/403/404 en cliente.

## Requisitos

- Node.js 20+ (recomendado LTS)
- npm 10+
- Backend disponible (por defecto en `http://localhost:4000`)

## Configuracion Local

1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo `.env` en la raiz:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

3. Levantar entorno de desarrollo:

```bash
npm run dev
```

4. Abrir en navegador:

```text
http://localhost:3000
```

## Variables de Entorno

| Variable | Requerida | Ejemplo | Descripcion |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Si | `http://localhost:4000` | Base URL del backend para todas las llamadas Axios. |

## Scripts Disponibles

```bash
npm run dev    # entorno local
npm run build  # build de produccion
npm run start  # correr build
npm run lint   # analisis estatico
```

## Rutas Relevantes

| Ruta | Tipo | Descripcion |
| --- | --- | --- |
| `/` | Publica | Redirecciona segun cookie `auth_token` a `/gestion` o `/auth/login`. |
| `/auth/login` | Publica | Inicio de sesion. |
| `/inscripcion` | Publica | Portal de inscripcion para cohortes habilitadas. |
| `/gestion/*` | Privada | Backoffice protegido por middleware y cookie. |

## Integracion con Backend

- El frontend usa `withCredentials: true` en Axios.
- Se espera cookie `auth_token` para acceso a rutas privadas.
- Configuracion recomendada de CORS en backend:
  - `origin: http://localhost:3000`
  - `credentials: true`
- Endpoints usados incluyen, entre otros:
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/me`
  - `GET /public/cohortes-en-inscripcion`
  - `GET /public/cohortes/:id`

## Estructura del Proyecto

```text
src/
  app/
    auth/login/          # login
    gestion/             # area privada
    inscripcion/         # area publica de postulacion
  components/            # UI, layout y providers
  constants/             # menu, colores y reglas de dominio
  services/              # cliente API (Axios)
  theme/                 # configuracion MUI
  types/                 # modelos TypeScript
  utils/                 # helpers
```

## Convenciones Tecnicas

- Alias de imports: `@/` -> `src/`
- App Router con componentes cliente donde aplica.
- Tipado fuerte de entidades de dominio en `src/types`.
- Middleware para proteger `/gestion/:path*`.

## Troubleshooting Rapido

- Error 401 al navegar gestion:
  - Verificar login y presencia de cookie `auth_token`.
- No conecta al backend:
  - Confirmar `NEXT_PUBLIC_API_URL` y puerto activo del backend.
- Sesion no persiste:
  - Revisar CORS con `credentials: true` y dominio/origen correctos.

## Calidad de Codigo

- Ejecutar lint antes de subir cambios:

```bash
npm run lint
```

- Mantener componentes pequenos y tipados.
- Evitar logica de negocio en vistas cuando pueda ir a servicios/utilidades.

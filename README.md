# Wedding Template

Aplicacion React + Vite para gestionar la parte publica y el panel de administracion de una boda.

## Configuracion

Copia `.env.example` a `.env` y ajusta los valores del despliegue:

```env
VITE_RSVP_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_APP_STORAGE_PREFIX=wedding-template
VITE_ENABLE_MENU_MODULE=false
```

- La autenticacion del panel usa variables privadas del servidor; consulta las variables de despliegue mas abajo.
- `VITE_RSVP_API_URL`: URL publicada de Google Apps Script.
- `VITE_APP_STORAGE_PREFIX`: prefijo para claves locales de navegador.
- `VITE_ENABLE_MENU_MODULE`: activa o desactiva el modulo de menu.
- `VITE_BYPASS_ADMIN_AUTH`: permite omitir el login exclusivamente en desarrollo local. Déjalo en `false` salvo que lo necesites.

En desarrollo, la app avisa por consola si falta configuracion critica. Las operaciones contra Apps Script fallan con un error explicito si la URL no esta configurada.

## Variables privadas de Vercel

Configura estas variables solo en el proyecto de Vercel; nunca con el prefijo `VITE_`:

- `ADMIN_PASSWORD`: contraseña de acceso al panel.
- `ADMIN_SESSION_SECRET`: secreto aleatorio de al menos 32 caracteres para firmar la cookie de sesion.
- `ADMIN_APPS_SCRIPT_URL`: URL `/exec` de Google Apps Script.
- `ADMIN_APPS_SCRIPT_PASSWORD`: contraseña configurada en las Script Properties de Apps Script.

En Apps Script, define la Script Property `ADMIN_PASSWORD` con el mismo valor que `ADMIN_APPS_SCRIPT_PASSWORD` y publica una nueva versión del despliegue. Usa un valor aleatorio distinto de la contraseña de acceso al panel.

Para probar las rutas de API en local, usa `npm run dev`. Vite sirve también las rutas administrativas locales tras definir estas mismas variables en un archivo `.env.local` no versionado.

Si quieres acceder al panel sin login durante el desarrollo local, añade además lo siguiente a `.env.local`:

```env
VITE_BYPASS_ADMIN_AUTH=true
```

El bypass se ignora siempre en producción. Para que las operaciones del panel funcionen, `.env.local` debe incluir igualmente las cuatro variables privadas de Vercel indicadas arriba.

## Referencia completa de variables

Esta seccion prevalece sobre las notas resumidas anteriores.

| Ambito | Propiedad | Objetivo |
| --- | --- | --- |
| Cliente / Vercel | `VITE_RSVP_API_URL` | URL publica `/exec` de Apps Script para el formulario RSVP. |
| Cliente / Vercel | `VITE_APP_STORAGE_PREFIX` | Prefijo del almacenamiento del navegador; por defecto `wedding-template`. |
| Cliente / Vercel | `VITE_ENABLE_MENU_MODULE` | Activa o desactiva el modulo de menu. |
| Solo desarrollo local | `VITE_BYPASS_ADMIN_AUTH` | Omite el login solo cuando Vite esta en modo desarrollo. Debe ser `false` o no existir fuera de local. |
| Servidor de Vercel | `ADMIN_PASSWORD` | Contrasena de acceso al panel. |
| Servidor de Vercel | `ADMIN_SESSION_SECRET` | Secreto aleatorio de al menos 32 caracteres para firmar la cookie HTTP-only de administracion. |
| Servidor de Vercel | `ADMIN_APPS_SCRIPT_URL` | URL `/exec` de Apps Script para operaciones administrativas. |
| Servidor de Vercel | `ADMIN_APPS_SCRIPT_PASSWORD` | Secreto que usa el proxy para autenticarse ante Apps Script. |
| Script Properties de Apps Script | `ADMIN_PASSWORD` | Debe coincidir exactamente con `ADMIN_APPS_SCRIPT_PASSWORD`. |

Las variables `VITE_` se envian al navegador y nunca deben contener secretos. La URL y la contrasena administrativas se anaden solo en `api/admin/proxy.js`, en el servidor. Configura las cuatro variables de servidor en Vercel para Production, Preview y Development segun proceda.

La configuracion fija de Apps Script (`SPREADSHEET_ID`, `ADMIN_EMAIL`, `APP_BASE_URL` y `RSVP_URL`) vive en `apps-script/constants.js`; no son Script Properties. Tras modificar esos valores, publica una nueva version de Apps Script.

Para trabajar en local usa `npm run dev`. Con el bypass activo, `.env.local` necesita `ADMIN_APPS_SCRIPT_URL` y `ADMIN_APPS_SCRIPT_PASSWORD`; `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` solo se necesitan al probar el login real.

El inventario con los valores de este equipo se encuentra en `docs/environment-properties.local.md`. Ese archivo esta ignorado por Git y no debe compartirse porque contiene credenciales.

## Adaptar un clon

- `src/config/siteContentOverrides.js`: contenido y tarjetas visibles del evento.
- `src/config/adminContentOverrides.js`: sustituciones parciales de textos del panel privado.
- `src/config/adminModules.js`: módulos privados activos, sus rutas y carga diferida. El panel y el router se generan a partir de este registro.

## Comandos

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

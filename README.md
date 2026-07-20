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

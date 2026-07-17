# Constants directory

Este directorio centraliza la configuracion base de la plantilla.

- `defaultSiteContent.js`: contenido publico base de la plantilla. La personalizacion de cada evento vive en `src/config/siteContentOverrides.js`.
- `rsvp.js`: opciones funcionales del RSVP: maximo de invitados, menus, alergias y buses.
- `rsvpContent.js`: textos de interfaz del RSVP: formularios, labels, placeholders, acciones y validaciones.
- `admin.js`: configuracion tecnica del acceso admin: password y claves de sesion/eventos.
- `adminContent.js`: textos base del panel privado: login, invitados, mesas, pendientes, dialogos, CSV y mensajes. Cada clon puede sobrescribirlos parcialmente en `src/config/adminContentOverrides.js`.
- `tables.js`: configuracion funcional de mesas: formas, grupos, rangos y formulario inicial.
- `tableContent.js`: textos especificos de mesas: formulario, tarjetas, diagramas y validaciones.
- `uiContent.js`: textos compartidos de UI generica, como spinner o componentes base.

Para adaptar esta plantilla a otra web, empieza por `src/config/siteContentOverrides.js`, `src/config/adminContentOverrides.js` y `src/config/adminModules.js`; despues revisa estos ficheros antes de tocar componentes.

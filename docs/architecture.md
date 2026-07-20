# Arquitectura de la plantilla

La aplicación separa la interfaz, el dominio y la infraestructura para que un
clon pueda cambiar su contenido o activar módulos sin alterar la lógica de
negocio.

## Capas

- `src/pages`: compone cada ruta y mantiene el estado estrictamente visual.
- `src/components`: componentes reutilizables de presentación. Las páginas
  privadas usan `AdminPage` y `AdminTableSection` para mantener estructura y
  espaciado comunes.
- `src/models` y `src/mappers`: normalizan datos y concentran reglas de
  dominio; no deben depender de React ni de la red.
- `src/services`: casos de uso y estado temporal compartido del panel.
- `src/repositories`: interfaz de datos por entidad.
- `src/gateways`: límite de infraestructura con el proxy de Vercel y Apps
  Script.
- `src/contracts`: valida las peticiones y respuestas del área privada.
- `src/config` y `src/constants`: configuración y textos. No se deben dejar
  cadenas de interfaz nuevas dentro de páginas o servicios.

La dirección de las dependencias es: página o componente -> servicio ->
repositorio -> gateway. Los modelos pueden ser usados por las capas anteriores,
pero nunca deben importar componentes ni gateways.

## Módulos privados

`src/config/adminModules.js` es el registro único de las áreas `/admin/*`.
Cada entrada define `id`, `path`, `icon`, `card` y `load`. El router y el panel
principal se derivan de las entradas con `enabled !== false`.

Para retirar temporalmente un área de un clon, añade `enabled: false` a su
entrada: desaparecerá tanto la ruta como la tarjeta. Para cambiar el texto de
una tarjeta sin modificar el registro, se puede añadir una tarjeta con el mismo
`to` a `siteContent.admin.cards`; sus campos sobrescriben los valores por
defecto.

Al añadir un módulo nuevo:

1. Crea la página con `AdminPage` y añade su entrada al registro.
2. Añade modelos, mapper, repositorio y gateway solo si introduce una entidad
   persistida.
3. Declara y valida su operación en `src/contracts/adminApiContracts.js`, el
   proxy y Apps Script.
4. Centraliza sus textos en `adminContent` y, cuando proceda, habilita una
   sustitución en `adminContentOverrides`.

## Datos administrativos y sincronización

`adminDataStore` conserva una única instantánea local durante la sesión y
expone `subscribeAdminData` para que los consumidores reaccionen a cambios. No
se debe usar polling para leer ese estado.

Las modificaciones deben realizarse siempre a través de sus funciones `set`,
`upsert`, `remove`, `discard` o `mark...`; todas emiten una nueva instantánea a
los suscriptores. Para actualizar datos desde el servidor usa
`refreshAdminData`. Por seguridad rechaza la operación si hay cambios locales
pendientes, salvo que se solicite expresamente `discardPendingChanges: true`.

## Contratos y despliegue

El contrato privado tiene una versión obligatoria. Cualquier cambio de forma
en una petición o respuesta requiere actualizar las validaciones del cliente,
proxy y Apps Script, y desplegarlos conjuntamente. No se mantiene
compatibilidad con versiones anteriores.

## Convenciones de mantenimiento

- Mantén los textos en archivos de contenido y los valores de negocio en
  configuración, no como literales repartidos por la interfaz.
- Normaliza la respuesta externa en el mapper o modelo antes de mostrarla.
- Conserva los componentes de UI sin acceso directo a repositorios, gateways o
  variables de entorno.
- Antes de integrar cambios, ejecuta `npm run lint`, `npm run build` y
  `git diff --check`.

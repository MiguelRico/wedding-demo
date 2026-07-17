# Cabeceras Google Sheets

Todas las columnas pueden estar formateadas como texto en Google Sheets. La aplicacion y Apps Script convierten a numero/booleano/fecha donde corresponde.

## Confirmaciones

```csv
confirmationId,confirmationName,email,phone,guestCount,createdAt,updatedAt
```

- `confirmationId`: texto, ID estable generado por la app/script.
- `guestCount`: texto numerico.
- `createdAt`, `updatedAt`: texto ISO 8601.

## Invitados

```csv
guestId,confirmationId,confirmationName,name,lastName,allergies,otherAllergies,comments,outboundBus,returnBus,menu,createdAt,updatedAt
```

- `guestId`: texto, ID estable del invitado.
- `confirmationId`: texto, referencia a `Confirmaciones.confirmationId`.
- `allergies`: texto con valores separados por coma.
- `outboundBus`, `returnBus`: texto, valores del formulario o `No`.
- `menu`: texto, `Carne` o `Pescado`.
- `createdAt`, `updatedAt`: texto ISO 8601.

## Mesas

```csv
tableId,name,group,tag,shape,seatCount,notes,createdAt,updatedAt
```

- `tableId`: texto, ID estable de la mesa.
- `shape`: texto, `round` o `rectangular`.
- `seatCount`: texto numerico.
- `createdAt`, `updatedAt`: texto ISO 8601.

## Asientos

```csv
seatId,tableId,seatNumber,createdAt,updatedAt
```

- `seatId`: texto, ID estable del asiento. La app genera `tableId-seat-N`.
- `tableId`: texto, referencia a `Mesas.tableId`.
- `seatNumber`: texto numerico.
- `createdAt`, `updatedAt`: texto ISO 8601.

## AsignacionesMesa

```csv
assignmentId,seatId,tableId,guestId,confirmationId,createdAt,updatedAt
```

- `assignmentId`: texto, ID estable de la asignacion.
- `seatId`: texto, referencia a `Asientos.seatId`.
- `tableId`: texto, referencia a `Mesas.tableId`.
- `guestId`: texto, referencia a `Invitados.guestId`.
- `confirmationId`: texto, referencia a `Confirmaciones.confirmationId`.
- `createdAt`, `updatedAt`: texto ISO 8601.

La busqueda publica se realiza por `email` o `phone`, pero cualquier edicion posterior trabaja con `confirmationId`.

## Proveedores

```csv
providerId,name,category,phone,email,address,web,accountNumber,active,createdAt,updatedAt
```

- `providerId`: texto, ID estable del proveedor.
- `category`: texto, una categoria configurada en la app.
- `active`: texto booleano recomendado `TRUE`/`FALSE`.
- `createdAt`, `updatedAt`: texto ISO 8601.

## Servicios

```csv
serviceId,providerId,name,price,paymentCount,notes,active,createdAt,updatedAt
```

- `serviceId`: texto, ID estable del servicio.
- `providerId`: texto, referencia a `Proveedores.providerId`.
- `price`: texto numerico.
- `paymentCount`: texto numerico, de `1` a `3`.
- `active`: texto booleano recomendado `TRUE`/`FALSE`.
- `createdAt`, `updatedAt`: texto ISO 8601.

## PagosServicios

```csv
paymentId,serviceId,paymentNumber,amount,dueDate,paidDate,paid,notes,createdAt,updatedAt
```

- `paymentId`: texto, ID estable del pago/plazo.
- `serviceId`: texto, referencia a `Servicios.serviceId`.
- `paymentNumber`: texto numerico, de `1` a `3`.
- `amount`: texto numerico.
- `dueDate`, `paidDate`: texto en formato `YYYY-MM-DD` o vacio.
- `paid`: texto booleano recomendado `TRUE`/`FALSE`.
- `createdAt`, `updatedAt`: texto ISO 8601.

## Notificaciones

```csv
notificationId,title,detail,date,type,read,createdAt,updatedAt
```

- `notificationId`: texto, ID estable de la notificacion.
- `detail`: texto opcional con el detalle de la notificacion.
- `date`: texto en formato `YYYY-MM-DD`.
- `type`: texto, `Aviso`, `Pago` o `Invitados`.
- `read`: texto booleano recomendado `TRUE`/`FALSE`.
- `createdAt`, `updatedAt`: texto ISO 8601.

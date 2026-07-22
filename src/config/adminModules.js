import {
  Armchair,
  Bell,
  ChartColumn,
  ClipboardCheck,
  FileSpreadsheet,
  Mail,
  ListTodo,
  Music,
  ReceiptText,
} from "lucide-react";

/**
 * Registro único de módulos privados.
 *
 * Los clones pueden desactivar un módulo sin tener que tocar el router ni el
 * panel de acceso. Cada módulo define su tarjeta por defecto; los clones
 * pueden sobrescribirla desde siteContent.admin.cards.
 */
export const adminModules = [
  {
    id: "stats",
    path: "stats",
    icon: ChartColumn,
    card: {
      title: "Resumen",
      subtitle: "Todo en un vistazo",
      description: "Consultar totales, asistencia, alergias y horarios de autobús.",
      icon: "chart-column",
    },
    load: () => import("../pages/AdminStats"),
  },
  {
    id: "guests",
    path: "guests",
    icon: ClipboardCheck,
    card: {
      title: "Invitados",
      subtitle: "Gestiona la lista",
      description: "Gestionar confirmaciones, datos de contacto, alergias y transporte.",
      icon: "clipboard-check",
    },
    load: () => import("../pages/AdminGuests"),
  },
  {
    id: "tables",
    path: "tables",
    icon: Armchair,
    card: {
      title: "Mesas",
      subtitle: "Organiza asientos",
      description: "Consultar la distribución de mesas, asientos e invitados asignados.",
      icon: "armchair",
    },
    load: () => import("../pages/AdminTables"),
  },
  {
    id: "providers",
    path: "providers",
    icon: ReceiptText,
    card: {
      title: "Proveedores",
      subtitle: "Gestiona servicios",
      description: "Organizar proveedores, servicios contratados y plazos de pago.",
      icon: "receipt-text",
    },
    load: () => import("../pages/AdminProviders"),
  },
  {
    id: "notifications",
    path: "notifications",
    icon: Bell,
    card: {
      title: "Notificaciones",
      subtitle: "Avisos internos",
      description: "Crear avisos, pagos y confirmaciones pendientes de revisar.",
      icon: "bell",
    },
    load: () => import("../pages/AdminNotifications"),
  },
  {
    id: "emails",
    path: "emails",
    icon: Mail,
    card: {
      title: "Emails",
      subtitle: "Comunicación con invitados",
      description: "Redactar y enviar mensajes privados a uno o varios invitados.",
      icon: "mail",
    },
    load: () => import("../pages/AdminEmails"),
  },
  {
    id: "exports",
    path: "exports",
    icon: FileSpreadsheet,
    card: {
      title: "Exportaciones",
      subtitle: "Descargas del evento",
      description: "Generar archivos con la información disponible en el panel.",
      icon: "file-spreadsheet",
    },
    load: () => import("../pages/AdminExports"),
  },
  {
    id: "music",
    path: "music",
    icon: Music,
    card: { title: "Música", subtitle: "Escalera musical", description: "Organizar las canciones de cada momento de la celebración.", icon: "music" },
    load: () => import("../pages/AdminMusic"),
  },
  {
    id: "tasks",
    path: "tasks",
    icon: ListTodo,
    card: {
      title: "Tareas",
      subtitle: "Checklist de boda",
      description: "Organizar preparativos por categoría, prioridad, responsable y fecha.",
      icon: "list-todo",
    },
    load: () => import("../pages/AdminTasks"),
  },
];

export const getEnabledAdminModules = () =>
  adminModules.filter((module) => module.enabled !== false);

export const getAdminModuleCards = (cards = []) => {
  const cardsByPath = new Map(
    cards.map((card) => [String(card.to || "").replace(/^\/admin\//, ""), card]),
  );

  return getEnabledAdminModules().flatMap((module) => {
    const card = cardsByPath.get(module.path);

    return [{
      ...module.card,
      ...card,
      id: module.id,
      moduleIcon: module.icon,
      to: card?.to || `/admin/${module.path}`,
    }];
  });
};

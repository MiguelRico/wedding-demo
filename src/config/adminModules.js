import {
  Armchair,
  Bell,
  ChartColumn,
  ClipboardCheck,
  ListTodo,
  ReceiptText,
} from "lucide-react";

/**
 * Registro único de módulos privados.
 *
 * Los clones pueden desactivar un módulo sin tener que tocar el router ni el
 * panel de acceso. El contenido visible de cada tarjeta sigue viviendo en
 * siteContent.admin.cards para conservar la personalización por evento.
 */
export const adminModules = [
  {
    id: "stats",
    path: "stats",
    icon: ChartColumn,
    load: () => import("../pages/AdminStats"),
  },
  {
    id: "guests",
    path: "guests",
    icon: ClipboardCheck,
    load: () => import("../pages/AdminGuests"),
  },
  {
    id: "tables",
    path: "tables",
    icon: Armchair,
    load: () => import("../pages/AdminTables"),
  },
  {
    id: "providers",
    path: "providers",
    icon: ReceiptText,
    load: () => import("../pages/AdminProviders"),
  },
  {
    id: "notifications",
    path: "notifications",
    icon: Bell,
    load: () => import("../pages/AdminNotifications"),
  },
  {
    id: "tasks",
    path: "tasks",
    icon: ListTodo,
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

    return card
      ? [{ ...card, id: module.id, moduleIcon: module.icon }]
      : [];
  });
};

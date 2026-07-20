import { AlertTriangle, BusFront, Search, Send, X } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminFiltersPanel, AdminTableSection } from "../common";
import Chip from "../../ui/Chip";
import IconButton from "../../ui/IconButton";
import { SkeletonBlock } from "../../ui/TableSectionSkeleton";
import {
  FieldError,
  inputClassName,
  Label,
  selectClassName,
} from "../../rsvp/FormPrimitives";
import { Guest } from "../../../models";
import { GUEST_MENU_OPTIONS } from "../../../constants/rsvp";
import { isMenuModuleEnabled } from "../../../config/features";
import { getMenuIcon } from "../../../utils/rsvpSummaryChips";

const FORM_ID = "guest-email-form";

const getRecipientId = (confirmation, index) =>
  confirmation.confirmationId || confirmation.id || `${confirmation.email}-${index}`;

export default function GuestEmailCard({ confirmations = [], loading, onSend, sending }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [menuFilter, setMenuFilter] = useState("all");
  const [allergiesFilter, setAllergiesFilter] = useState("all");
  const [transportFilter, setTransportFilter] = useState("all");
  const [error, setError] = useState("");

  const recipients = useMemo(
    () =>
      confirmations
        .filter((confirmation) => confirmation.email?.trim())
        .map((confirmation, index) => ({
          email: confirmation.email.trim(),
          guests: confirmation.guests || [],
          id: getRecipientId(confirmation, index),
          name: confirmation.confirmationName || confirmation.email,
        })),
    [confirmations],
  );
  const selectedRecipients = recipients.filter((recipient) =>
    selectedIds.includes(recipient.id),
  );
  const filteredRecipients = recipients.filter((recipient) => {
    const matchesQuery = `${recipient.name} ${recipient.email} ${recipient.guests
      .map((guest, index) => Guest.getDisplayName(guest, index))
      .join(" ")}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase());
    const matchesMenu =
      menuFilter === "all" ||
      recipient.guests.some(
        (guest) => Guest.normalize(guest).menu === menuFilter,
      );
    const matchesAllergies =
      allergiesFilter === "all" ||
      recipient.guests.some((guest) =>
        allergiesFilter === "with"
          ? Guest.hasAllergies(guest)
          : !Guest.hasAllergies(guest),
      );
    const matchesTransport =
      transportFilter === "all" ||
      recipient.guests.some((guest) =>
        transportFilter === "with"
          ? Guest.usesBus(guest)
          : !Guest.usesBus(guest),
      );

    return matchesQuery && matchesMenu && matchesAllergies && matchesTransport;
  });
  const activeFilters = [
    query.trim() && {
      key: "query",
      label: `Búsqueda: ${query.trim()}`,
      onRemove: () => setQuery(""),
    },
    menuFilter !== "all" && {
      key: "menu",
      label: `Menú: ${menuFilter}`,
      onRemove: () => setMenuFilter("all"),
    },
    allergiesFilter !== "all" && {
      key: "allergies",
      label: allergiesFilter === "with" ? "Con alergias" : "Sin alergias",
      onRemove: () => setAllergiesFilter("all"),
    },
    transportFilter !== "all" && {
      key: "transport",
      label: transportFilter === "with" ? "Con transporte" : "Sin transporte",
      onRemove: () => setTransportFilter("all"),
    },
  ].filter(Boolean);

  const toggleRecipient = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedRecipients.length) {
      setError("Selecciona al menos un invitado.");
      return;
    }
    if (!subject.trim()) {
      setError("Añade un asunto para el email.");
      return;
    }
    if (!message.trim()) {
      setError("Escribe el mensaje que recibirán los invitados.");
      return;
    }

    const sent = await onSend?.({
      message: message.trim(),
      recipients: selectedRecipients.map((recipient) => recipient.email),
      subject: subject.trim(),
    });

    if (sent) {
      setMessage("");
      setSelectedIds([]);
      setSubject("");
      setError("");
    }
  };

  if (loading) return <GuestEmailCardSkeleton />;

  return (
    <AdminTableSection
      eyebrow="Comunicación"
      headerActions={
        <IconButton
          className="h-10 w-10 !px-0"
          disabled={sending || !recipients.length}
          form={FORM_ID}
          icon={<Send size={16} strokeWidth={1.8} />}
          keepTextOnAdminSubpages
          label={sending ? "Enviando email…" : "Enviar email"}
          showText="always"
          tone="primary"
          type="submit"
        />
      }
      title="Enviar email a invitados"
    >
      <form className="grid gap-5" id={FORM_ID} onSubmit={handleSubmit}>
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <Label>Destinatarios</Label>
            <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-accent-dark)]">
              {selectedRecipients.length} seleccionados
            </span>
          </div>

          <AdminFiltersPanel
            activeFilters={activeFilters}
            className="mb-3"
            fieldsClassName="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_11rem_11rem_11rem]"
            title="Filtros"
          >
            <div>
              <Label>Buscar invitado</Label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-accent)]"
                  size={17}
                />
                <input
                  className={`${inputClassName} py-2.5 pl-10 text-sm`}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nombre, grupo o email"
                  value={query}
                />
              </div>
            </div>
            {isMenuModuleEnabled && (
              <div>
                <Label>Menú</Label>
                <select
                  className={selectClassName}
                  onChange={(event) => setMenuFilter(event.target.value)}
                  value={menuFilter}
                >
                  <option value="all">Todos</option>
                  {GUEST_MENU_OPTIONS.map((menu) => (
                    <option key={menu} value={menu}>
                      {menu}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>Alergias</Label>
              <select
                className={selectClassName}
                onChange={(event) => setAllergiesFilter(event.target.value)}
                value={allergiesFilter}
              >
                <option value="all">Todos</option>
                <option value="with">Con alergias</option>
                <option value="without">Sin alergias</option>
              </select>
            </div>
            <div>
              <Label>Transporte</Label>
              <select
                className={selectClassName}
                onChange={(event) => setTransportFilter(event.target.value)}
                value={transportFilter}
              >
                <option value="all">Todos</option>
                <option value="with">Usan transporte</option>
                <option value="without">No usan transporte</option>
              </select>
            </div>
          </AdminFiltersPanel>

          <div className="max-h-52 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-white/45 p-2">
            {filteredRecipients.length ? (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {filteredRecipients.map((recipient) => {
                  const checked = selectedIds.includes(recipient.id);
                  const guestNames = recipient.guests
                    .map((guest, index) => Guest.getDisplayName(guest, index))
                    .join(", ");
                  const summaryChips = [
                    ...(isMenuModuleEnabled
                      ? GUEST_MENU_OPTIONS.map((menu) => ({
                          icon: getMenuIcon(menu),
                          key: `menu-${menu}`,
                          strong: true,
                          value: recipient.guests.filter(
                            (guest) => Guest.normalize(guest).menu === menu,
                          ).length,
                        }))
                      : []),
                    {
                      icon: <AlertTriangle size={13} strokeWidth={1.8} />,
                      key: "allergies",
                      value: recipient.guests.some(Guest.hasAllergies)
                        ? "Sí"
                        : "No",
                    },
                    {
                      icon: <BusFront size={13} strokeWidth={1.8} />,
                      key: "transport",
                      value: recipient.guests.some(Guest.usesBus) ? "Sí" : "No",
                    },
                  ];

                  return (
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                        checked
                          ? "border-[var(--color-accent)] bg-[var(--color-bg)]"
                          : "border-transparent bg-white/65 hover:border-[var(--color-border-strong)]"
                      }`}
                      key={recipient.id}
                    >
                      <input
                        checked={checked}
                        className="mt-1 h-4 w-4 accent-[var(--color-accent-dark)]"
                        onChange={() => toggleRecipient(recipient.id)}
                        type="checkbox"
                      />
                      <span className="min-w-0">
                        <span className="block break-words text-sm text-[var(--color-text)]">{recipient.name}</span>
                        <span className="mt-1 block break-words text-xs leading-snug text-[var(--color-muted)]">
                          {guestNames || recipient.email}
                        </span>
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {summaryChips.map((chip) => (
                            <Chip
                              className="!w-auto !px-2 !py-1 text-[0.65rem]"
                              icon={chip.icon}
                              key={chip.key}
                              strong={chip.strong}
                              value={chip.value}
                            />
                          ))}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="p-3 text-sm text-[var(--color-muted)]">
                {recipients.length
                  ? "No hay invitados que coincidan con los filtros."
                  : "No hay invitados con email disponible."}
              </p>
            )}
          </div>
        </div>

        {selectedRecipients.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Destinatarios seleccionados">
            {selectedRecipients.map((recipient) => (
              <button
                aria-label={`Quitar destinatario ${recipient.name}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-accent)]/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-dark)]/35"
                key={recipient.id}
                onClick={() => toggleRecipient(recipient.id)}
                type="button"
              >
                <span className="truncate">{recipient.name}</span>
                <X aria-hidden="true" className="shrink-0" size={14} strokeWidth={2.2} />
              </button>
            ))}
          </div>
        )}

        <div>
          <Label>Asunto</Label>
          <input
            className={inputClassName}
            maxLength={200}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Ej: Información importante de la boda"
            value={subject}
          />
        </div>

        <div>
          <Label>Mensaje</Label>
          <textarea
            className={`${inputClassName} min-h-32 resize-y`}
            maxLength={10000}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escribe aquí el mensaje para los invitados…"
            value={message}
          />
          <FieldError>{error}</FieldError>
        </div>
      </form>
    </AdminTableSection>
  );
}

function GuestEmailCardSkeleton() {
  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border-strong)] bg-white/55 p-5 shadow-[0_24px_70px_rgba(77,56,40,0.08)] backdrop-blur-sm">
      <SkeletonBlock className="absolute right-6 top-6 h-16 w-16 rounded-full opacity-50" />
      <div className="relative">
        <SkeletonBlock className="mt-4 h-3 w-28 rounded-full" />
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <SkeletonBlock className="h-7 w-64 max-w-full rounded-full" />
            <SkeletonBlock className="mt-3 h-4 w-96 max-w-full rounded-full" />
          </div>
          <SkeletonBlock className="h-10 w-32 shrink-0 rounded-full" />
        </div>

        <div className="mt-5 grid gap-5">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <SkeletonBlock className="h-4 w-28 rounded-full" />
              <SkeletonBlock className="h-7 w-28 rounded-full" />
            </div>
            <div className="rounded-[1rem] border border-[var(--color-border)] bg-white/35 p-2">
              <div className="flex items-center justify-between gap-2">
                <SkeletonBlock className="h-5 w-20 rounded-full" />
                <SkeletonBlock className="h-[1.125rem] w-8 rounded-full" />
              </div>
            </div>
            <div className="mt-3 grid gap-2 rounded-2xl border border-[var(--color-border)] bg-white/45 p-2 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock className="h-16 rounded-xl" key={index} />
              ))}
            </div>
          </div>
          <div>
            <SkeletonBlock className="mb-2 h-4 w-16 rounded-full" />
            <SkeletonBlock className="h-12 rounded-2xl" />
          </div>
          <div>
            <SkeletonBlock className="mb-2 h-4 w-20 rounded-full" />
            <SkeletonBlock className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    </article>
  );
}

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
import { adminContent } from "../../../constants/adminContent";
import { getMenuIcon } from "../../../utils/rsvpSummaryChips";

const FORM_ID = "guest-email-form";

const getRecipientId = (confirmation, index) =>
  confirmation.confirmationId ||
  confirmation.id ||
  `${confirmation.email}-${index}`;

export default function GuestEmailCard({
  confirmations = [],
  loading,
  onSend,
  sending,
}) {
  const content = adminContent.emails.composer;
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
    const matchesQuery =
      `${recipient.name} ${recipient.email} ${recipient.guests
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
      label: content.filters.activeQuery(query.trim()),
      onRemove: () => setQuery(""),
    },
    menuFilter !== "all" && {
      key: "menu",
      label: content.filters.activeMenu(menuFilter),
      onRemove: () => setMenuFilter("all"),
    },
    allergiesFilter !== "all" && {
      key: "allergies",
      label: content.filters.activeAllergies(allergiesFilter),
      onRemove: () => setAllergiesFilter("all"),
    },
    transportFilter !== "all" && {
      key: "transport",
      label: content.filters.activeTransport(transportFilter),
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
      setError(content.validation.recipients);
      return;
    }
    if (!subject.trim()) {
      setError(content.validation.subject);
      return;
    }
    if (!message.trim()) {
      setError(content.validation.message);
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
      eyebrow={content.eyebrow}
      headerActions={
        <IconButton
          className="h-10 w-10 !px-0"
          disabled={sending || !recipients.length}
          form={FORM_ID}
          icon={<Send size={16} strokeWidth={1.8} />}
          keepTextOnAdminSubpages
          label={sending ? content.actions.sending : content.actions.send}
          showText="always"
          tone="primary"
          type="submit"
        />
      }
      title={content.title}
    >
      <form className="grid gap-5" id={FORM_ID} onSubmit={handleSubmit}>
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <Label>{content.recipients.label}</Label>
            <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-accent-dark)]">
              {content.recipients.selected(selectedRecipients.length)}
            </span>
          </div>

          <AdminFiltersPanel
            activeFilters={activeFilters}
            className="mb-3"
            fieldsClassName="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_11rem_11rem_11rem]"
            title={content.filters.title}
          >
            <div>
              <Label>{content.filters.searchLabel}</Label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-accent)]"
                  size={17}
                />
                <input
                  className={`${inputClassName} py-2.5 pl-10 text-sm`}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={content.filters.searchPlaceholder}
                  value={query}
                />
              </div>
            </div>
            {isMenuModuleEnabled && (
              <div>
                <Label>{content.filters.menuLabel}</Label>
                <select
                  className={selectClassName}
                  onChange={(event) => setMenuFilter(event.target.value)}
                  value={menuFilter}
                >
                  <option value="all">{content.filters.all}</option>
                  {GUEST_MENU_OPTIONS.map((menu) => (
                    <option key={menu} value={menu}>
                      {menu}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>{content.filters.allergiesLabel}</Label>
              <select
                className={selectClassName}
                onChange={(event) => setAllergiesFilter(event.target.value)}
                value={allergiesFilter}
              >
                <option value="all">{content.filters.all}</option>
                <option value="with">{content.filters.withAllergies}</option>
                <option value="without">{content.filters.withoutAllergies}</option>
              </select>
            </div>
            <div>
              <Label>{content.filters.transportLabel}</Label>
              <select
                className={selectClassName}
                onChange={(event) => setTransportFilter(event.target.value)}
                value={transportFilter}
              >
                <option value="all">{content.filters.all}</option>
                <option value="with">{content.filters.withTransport}</option>
                <option value="without">{content.filters.withoutTransport}</option>
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
                        ? content.summary.yes
                        : content.summary.no,
                    },
                    {
                      icon: <BusFront size={13} strokeWidth={1.8} />,
                      key: "transport",
                      value: recipient.guests.some(Guest.usesBus)
                        ? content.summary.yes
                        : content.summary.no,
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
                        <span className="block break-words text-sm text-[var(--color-text)]">
                          {recipient.name}
                        </span>
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
                  ? content.recipients.emptyFiltered
                  : content.recipients.emptyAvailable}
              </p>
            )}
          </div>
        </div>

        {selectedRecipients.length > 0 && (
          <div
            className="flex flex-wrap gap-2"
            aria-label={content.recipients.selectedAriaLabel}
          >
            {selectedRecipients.map((recipient) => (
              <button
                aria-label={content.recipients.removeAriaLabel(recipient.name)}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-accent)]/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-dark)]/35"
                key={recipient.id}
                onClick={() => toggleRecipient(recipient.id)}
                type="button"
              >
                <span className="truncate">{recipient.name}</span>
                <X
                  aria-hidden="true"
                  className="shrink-0"
                  size={14}
                  strokeWidth={2.2}
                />
              </button>
            ))}
          </div>
        )}

        <div>
          <Label>{content.fields.subjectLabel}</Label>
          <input
            className={inputClassName}
            maxLength={200}
            onChange={(event) => setSubject(event.target.value)}
            placeholder={content.fields.subjectPlaceholder}
            value={subject}
          />
        </div>

        <div>
          <Label>{content.fields.messageLabel}</Label>
          <textarea
            className={`${inputClassName} min-h-32 resize-y`}
            maxLength={10000}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={content.fields.messagePlaceholder}
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

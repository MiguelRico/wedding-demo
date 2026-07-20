import { Mail, Send, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { Card } from "../common";
import IconButton from "../../ui/IconButton";
import { FieldError, inputClassName, Label } from "../../rsvp/FormPrimitives";
import { Guest } from "../../../models";

const getRecipientId = (confirmation, index) =>
  confirmation.confirmationId || confirmation.id || `${confirmation.email}-${index}`;

export default function GuestEmailCard({ confirmations = [], loading, onSend, sending }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
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

  return (
    <Card
      decorativeText={<Mail size={76} strokeWidth={1.3} />}
      detail="Selecciona uno o varios invitados y envía el mismo mensaje de forma privada."
      eyebrow="Comunicación"
      title="Enviar email a invitados"
    >
      <form className="mt-5 grid gap-5" onSubmit={handleSubmit}>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <Label>Destinatarios</Label>
            <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-accent-dark)]">
              {selectedRecipients.length} seleccionados
            </span>
          </div>
          <div className="max-h-52 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-white/45 p-2">
            {loading ? (
              <p className="p-3 text-sm text-[var(--color-muted)]">Cargando invitados…</p>
            ) : recipients.length ? (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {recipients.map((recipient) => {
                  const checked = selectedIds.includes(recipient.id);
                  const guestNames = recipient.guests
                    .map((guest, index) => Guest.getDisplayName(guest, index))
                    .join(", ");

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
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="p-3 text-sm text-[var(--color-muted)]">No hay invitados con email disponible.</p>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
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
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/45 p-4 text-sm leading-relaxed text-[var(--color-muted)]">
            <Users className="mb-2 text-[var(--color-accent-dark)]" size={19} />
            Cada destinatario recibe el email de forma privada; sus direcciones no se comparten.
          </div>
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

        <div className="flex justify-end">
          <IconButton
            disabled={loading || sending || !recipients.length}
            icon={<Send size={16} strokeWidth={1.8} />}
            keepTextOnAdminSubpages
            label={sending ? "Enviando email…" : "Enviar email"}
            showText="always"
            tone="primary"
            type="submit"
          />
        </div>
      </form>
    </Card>
  );
}

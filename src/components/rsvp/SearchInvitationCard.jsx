import { Home, Plus, Search } from "lucide-react";

import IconButton from "../ui/IconButton";
import { FieldError, FormCard, inputClassName, Label } from "./FormPrimitives";
import { rsvpContent } from "../../constants/rsvpContent";

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

export default function SearchInvitationCard({
  email,
  emailError,
  loading,
  onEmailChange,
  onPhoneChange,
  phone = "",
  phoneError,
  onSearchInvitation,
  onCreateNew,
}) {
  const fieldsGridClassName = "mb-4 grid gap-4 md:grid-cols-2";

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearchInvitation();
  };

  return (
    <FormCard>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="section-eyebrow mb-0 md:hidden">
            {rsvpContent.searchInvitation.eyebrow}
          </p>

          <h2 className="hidden font-serif text-3xl md:block">
            {rsvpContent.searchInvitation.title}
          </h2>

        </div>

        <div className={fieldsGridClassName}>
          <div>
            <Label>{rsvpContent.searchInvitation.emailLabel}</Label>

            <input
              className={inputClassName}
              inputMode="email"
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder={rsvpContent.searchInvitation.emailPlaceholder}
              type="email"
              value={email}
            />

            <FieldError>{emailError}</FieldError>
          </div>

          <div>
            <Label>{rsvpContent.searchInvitation.phoneLabel}</Label>

            <input
              className={inputClassName}
              inputMode="numeric"
              onChange={(event) =>
                onPhoneChange(onlyDigits(event.target.value))
              }
              pattern="[0-9]*"
              placeholder={rsvpContent.searchInvitation.phonePlaceholder}
              type="tel"
              value={phone}
            />

            <FieldError>{phoneError}</FieldError>
          </div>
        </div>

        <IconButton
          className="w-full"
          disabled={loading}
          icon={<Search size={16} strokeWidth={1.8} />}
          showText="always"
          tone="primary"
          type="submit"
        >
          {rsvpContent.searchInvitation.searchAction}
        </IconButton>
      </form>

      <div className="my-5 border-t border-[var(--color-border)]" />

      <div>
        <p className="section-eyebrow mb-0 md:hidden">
          {rsvpContent.createInvitation.eyebrow}
        </p>

        <h2 className="hidden font-serif text-3xl md:block">
          {rsvpContent.createInvitation.title}
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          <IconButton
            className="w-full"
            icon={<Plus size={16} strokeWidth={1.8} />}
            onClick={onCreateNew}
            showText="always"
            tone="primary"
            type="button"
          >
            {rsvpContent.createInvitation.action}
          </IconButton>

          <IconButton
            className="w-full"
            icon={<Home size={16} strokeWidth={1.8} />}
            showText="always"
            to="/"
            tone="terciary"
          >
            {rsvpContent.searchInvitation.backHome}
          </IconButton>
        </div>
      </div>
    </FormCard>
  );
}

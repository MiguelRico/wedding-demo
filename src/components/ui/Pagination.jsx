import { ChevronLeft, ChevronRight } from "lucide-react";

import { uiContent } from "../../constants/uiContent";
import IconButton from "./IconButton";

export default function Pagination({
  className = "mt-3",
  onNext,
  onPrev,
  page,
  previousLabel = uiContent.actions.previous,
  nextLabel = uiContent.actions.next,
  totalPages,
}) {
  const pageLabel = `${page} / ${totalPages}`;
  const containerClassName = "p-2";
  const contentClassName = "flex items-center justify-between gap-2";
  const buttonClassName = "h-7 w-7 min-h-7 p-0";

  return (
    <div
      className={`${className} rounded-[1rem] border border-[var(--color-border)] bg-white/35 ${containerClassName}`}
    >
      <div className={contentClassName}>
        <IconButton
          className={buttonClassName}
          disabled={page === 1}
          icon={<ChevronLeft size={15} strokeWidth={1.8} />}
          label={previousLabel}
          onClick={onPrev}
          tabIndex={-1}
          tone="terciary"
          type="button"
        />

        <p className="font-serif text-lg leading-none text-[var(--color-accent-dark)]">
          {pageLabel}
        </p>

        <IconButton
          className={buttonClassName}
          disabled={page === totalPages}
          icon={<ChevronRight size={15} strokeWidth={1.8} />}
          label={nextLabel}
          onClick={onNext}
          tabIndex={-1}
          tone="terciary"
          type="button"
        />
      </div>
    </div>
  );
}

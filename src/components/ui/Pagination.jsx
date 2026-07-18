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
  const contentClassName = "flex flex-col gap-2 text-xs text-[var(--color-muted)]";
  const gridClassName = "grid w-full grid-cols-3 items-center gap-2";
  const buttonClassName = "h-8 w-full min-h-8 px-3 py-1";

  return (
    <div
      className={`${className} rounded-[1rem] border border-[var(--color-border)] bg-white/35 ${containerClassName}`}
    >
      <div className={contentClassName}>
        <div className={gridClassName}>
          <IconButton
            className={buttonClassName}
            disabled={page === 1}
            icon={<ChevronLeft size={16} strokeWidth={1.8} />}
            label={previousLabel}
            onClick={onPrev}
            tabIndex={-1}
            tone="secondary"
            type="button"
          >
            {previousLabel}
          </IconButton>

          <p className="text-center">{pageLabel}</p>

          <IconButton
            className={buttonClassName}
            disabled={page === totalPages}
            icon={<ChevronRight size={16} strokeWidth={1.8} />}
            label={nextLabel}
            onClick={onNext}
            tabIndex={-1}
            tone="secondary"
            type="button"
          >
            {nextLabel}
          </IconButton>
        </div>
      </div>
    </div>
  );
}

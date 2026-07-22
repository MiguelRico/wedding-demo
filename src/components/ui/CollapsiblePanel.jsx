import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function CollapsiblePanel({
  activeFilters = [],
  children,
  className = "",
  compact = true,
  defaultOpen = false,
  title,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const panelHidden = reduceMotion
    ? { opacity: 0, height: 0 }
    : { opacity: 0, height: 0, y: -8, filter: "blur(6px)" };
  const panelVisible = reduceMotion
    ? { opacity: 1, height: "auto" }
    : { opacity: 1, height: "auto", y: 0, filter: "blur(0px)" };
  const accessibleTitle = title || "panel";

  return (
    <div
      className={`border border-[var(--color-border)] bg-white/35 ${
        compact ? "rounded-[1rem] p-2" : "rounded-[1.25rem] p-3"
      } ${className}`}
    >
      <div>
        <div
          className={`flex items-center justify-between ${
            compact ? "gap-2" : "gap-4"
          }`}
        >
          {activeFilters.length > 0 ? (
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5">
              {activeFilters.map((filter) => (
                <button
                  aria-label={`Quitar filtro ${filter.label}`}
                  className="grid min-w-0 max-w-full grid-cols-[11px_minmax(0,1fr)_11px] items-center gap-1 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-accent)] px-2 py-0.5 text-[0.62rem] font-medium text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-accent)]/75"
                  key={filter.key || filter.label}
                  onClick={filter.onRemove}
                  type="button"
                >
                  <span aria-hidden="true" />
                  <span className="min-w-0 truncate text-center">
                    {filter.label}
                  </span>
                  <X className="shrink-0" size={11} strokeWidth={2.2} />
                </button>
              ))}
            </div>
          ) : (
            <h3
              className={`font-serif text-[var(--color-accent-dark)] ${
                compact ? "text-lg leading-none" : "text-xl leading-none"
              }`}
            >
              {title}
            </h3>
          )}

          <button
            aria-expanded={open}
            aria-label={open ? `Cerrar ${accessibleTitle}` : `Abrir ${accessibleTitle}`}
            className="flex h-[1.875rem] w-[1.875rem] shrink-0 items-center justify-center rounded-full bg-[var(--color-border-strong)] text-white transition hover:bg-[var(--color-accent-dark)]"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            <ChevronDown
              className={`transition-transform ${open ? "rotate-180" : ""}`}
              size={16}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            animate={panelVisible}
            className="overflow-hidden"
            exit={panelHidden}
            initial={panelHidden}
            key="collapsible-panel-content"
            transition={{
              duration: reduceMotion ? 0.18 : 0.46,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className={compact ? "mt-2" : "mt-3"}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

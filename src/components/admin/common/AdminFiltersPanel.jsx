import CollapsiblePanel from "../../ui/CollapsiblePanel";

export default function AdminFiltersPanel({
  activeFilters = [],
  children,
  className = "",
  title,
}) {
  return (
    <CollapsiblePanel
      activeFilters={activeFilters}
      className={className}
      title={title}
    >
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </CollapsiblePanel>
  );
}

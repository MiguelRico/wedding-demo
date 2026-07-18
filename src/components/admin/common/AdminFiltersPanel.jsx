import CollapsiblePanel from "../../ui/CollapsiblePanel";

export default function AdminFiltersPanel({
  activeFilters = [],
  children,
  className = "",
  fieldsClassName = "grid gap-4 md:grid-cols-2",
  title,
}) {
  return (
    <CollapsiblePanel
      activeFilters={activeFilters}
      className={className}
      title={title}
    >
      <div className={fieldsClassName}>{children}</div>
    </CollapsiblePanel>
  );
}

import TabNavigation from "../../ui/TabNavigation";

/** Displays tabs on mobile and every independent panel in a desktop grid. */
export default function AdminResponsivePanels({
  activePanel,
  className = "md:grid-cols-[minmax(0,1.7fr)_minmax(20rem,1fr)]",
  onChange,
  panels = [],
  renderPanel,
}) {
  const resolvedPanels = panels.map((panel) => ({
    ...panel,
    content: panel.content ?? renderPanel?.(panel.id),
  }));
  const active =
    resolvedPanels.find((panel) => panel.id === activePanel) || resolvedPanels[0];

  if (!active) return null;

  return (
    <div className="mt-4">
      <div className="md:hidden">
        <TabNavigation
          activeTab={active.id}
          onChange={onChange}
          tabs={resolvedPanels.map(({ id, label }) => ({ id, label }))}
        />
        <div className="mt-5">{active.content}</div>
      </div>

      <div className={`hidden gap-5 md:grid ${className}`}>
        {resolvedPanels.map((panel) => (
          <div key={panel.id} className="min-w-0">
            {panel.content}
          </div>
        ))}
      </div>
    </div>
  );
}

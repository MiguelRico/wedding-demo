import { ChevronsDown, ChevronsUp, Plus } from "lucide-react";

import IconButton from "@/components/ui/IconButton";
import { adminContent } from "@/constants/adminContent";

export default function TaskTableActions({
  allCategoriesOpen,
  compact = false,
  loading,
  onCreate,
  onToggleCategories,
  showText = true,
}) {
  const toggleLabel = allCategoriesOpen
    ? adminContent.tasks.actions.collapseAll
    : adminContent.tasks.actions.expandAll;

  return (
    <div className={compact ? "flex gap-2" : "grid w-full gap-3 sm:grid-cols-2"}>
      <IconButton
        className={compact ? "h-10 w-10 !px-0" : "w-full"}
        disabled={loading}
        icon={
          allCategoriesOpen ? (
            <ChevronsUp size={16} strokeWidth={1.8} />
          ) : (
            <ChevronsDown size={16} strokeWidth={1.8} />
          )
        }
        label={toggleLabel}
        onClick={onToggleCategories}
        showText={showText ? "always" : undefined}
        tone="terciary"
        type="button"
      >
        {showText ? toggleLabel : undefined}
      </IconButton>
      <IconButton
        className={compact ? "h-10 w-10 !px-0" : "w-full"}
        disabled={loading}
        icon={<Plus size={16} strokeWidth={1.8} />}
        onClick={onCreate}
        showText={showText ? "always" : undefined}
        tone="primary"
        type="button"
      >
        {showText ? adminContent.tasks.actions.add : undefined}
      </IconButton>
    </div>
  );
}

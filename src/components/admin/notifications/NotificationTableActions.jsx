import { Plus } from "lucide-react";

import IconButton from "@/components/ui/IconButton";
import { adminContent } from "@/constants/adminContent";

export default function NotificationTableActions({
  compact = false,
  loading,
  onCreate,
  showText = true,
}) {
  return (
    <IconButton
      className={compact ? "h-10 w-10 !px-0" : "w-full"}
      disabled={loading}
      icon={<Plus size={16} strokeWidth={1.8} />}
      onClick={onCreate}
      showText={showText ? "always" : undefined}
      tone="primary"
      type="button"
    >
      {showText ? adminContent.notifications.actions.create : undefined}
    </IconButton>
  );
}

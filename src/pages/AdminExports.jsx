import { Download, FileSpreadsheet, FileText, ReceiptText, Armchair } from "lucide-react";
import { Navigate } from "react-router-dom";

import { AdminPage, AdminResponsivePanels, AdminTableSection } from "../components/admin/common";
import CinematicStaggeredRevealItem from "../components/cinematic/CinematicStaggeredRevealItem";
import IconButton from "../components/ui/IconButton";
import { adminContent } from "../constants/adminContent";
import useAdminDataSnapshot from "../hooks/useAdminDataSnapshot";
import useAdminActiveTab from "../hooks/useAdminActiveTab";
import { storageKeys } from "../config/storageKeys";
import { isAdminSessionAuthenticated } from "../utils/adminSession";
import {
  downloadAdminPdf,
  downloadAdminWorkbook,
  downloadProvidersPdf,
  downloadSeatingPlanPdf,
} from "../services/exportsService";

export default function AdminExports() {
  const isAuthenticated = isAdminSessionAuthenticated();
  const snapshot = useAdminDataSnapshot();
  const [activePanel, setActivePanel] = useAdminActiveTab(
    storageKeys.adminActiveTabs.exports,
    "workbook",
  );
  const hasData = [
    snapshot.confirmations,
    snapshot.notifications,
    snapshot.providers,
    snapshot.tables,
    snapshot.tasks,
  ].some((items) => items.length > 0);

  if (!isAuthenticated) return <Navigate replace to="/admin" />;

  const panels = [
    {
      id: "workbook",
      label: "Excel",
      content: (
        <ExportSection
          content={adminContent.exports.workbook}
          disabled={!hasData}
          icon={<FileSpreadsheet size={20} strokeWidth={1.8} />}
          onDownload={() => downloadAdminWorkbook({ fileName: adminContent.exports.workbook.fileName, snapshot })}
          actionIcon={<Download size={16} strokeWidth={1.8} />}
          tone="primary"
        />
      ),
    },
    {
      id: "confirmations",
      label: "Invitados",
      content: (
        <ExportSection
          content={adminContent.exports.confirmationsPdf}
          disabled={!snapshot.confirmations.length}
          icon={<FileText size={20} strokeWidth={1.8} />}
          onDownload={() => downloadAdminPdf({ fileName: adminContent.exports.confirmationsPdf.fileName, snapshot })}
        />
      ),
    },
    {
      id: "providers",
      label: "Proveedores",
      content: (
        <ExportSection
          content={adminContent.exports.providers}
          disabled={!snapshot.providers.length}
          icon={<ReceiptText size={20} strokeWidth={1.8} />}
          onDownload={() => downloadProvidersPdf({ fileName: adminContent.exports.providers.fileName, snapshot })}
        />
      ),
    },
    {
      id: "seating",
      label: "Mesas",
      content: (
        <ExportSection
          content={adminContent.exports.seating}
          disabled={!snapshot.tables.length && !snapshot.confirmations.length}
          icon={<Armchair size={20} strokeWidth={1.8} />}
          onDownload={() => downloadSeatingPlanPdf({ fileName: adminContent.exports.seating.fileName, snapshot })}
        />
      ),
    },
  ];

  return (
    <AdminPage header={adminContent.exports.header} innerClassName="max-w-7xl py-6">
      {({ isVisible }) => (
        <CinematicStaggeredRevealItem index={2} isVisible={isVisible}>
          <AdminResponsivePanels
            activePanel={activePanel}
            className="lg:grid-cols-2"
            onChange={setActivePanel}
            panels={panels}
          />
        </CinematicStaggeredRevealItem>
      )}
    </AdminPage>
  );
}

function ExportSection({
  actionIcon = <FileText size={16} strokeWidth={1.8} />,
  content,
  disabled,
  icon,
  onDownload,
  tone = "terciary",
}) {
  return (
    <AdminTableSection
      eyebrow={content.eyebrow}
      headerActions={<IconButton disabled={disabled} icon={actionIcon} label={content.action} onClick={onDownload} showText="always" tone={tone} type="button">{content.action}</IconButton>}
      title={content.title}
    >
      <div className="flex items-start gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/45 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-white/60 text-[var(--color-accent-dark)]">{icon}</span>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">{content.text}</p>
      </div>
    </AdminTableSection>
  );
}

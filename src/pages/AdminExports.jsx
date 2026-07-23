import {
  Download,
  FileSpreadsheet,
  FileText,
  ReceiptText,
  Armchair,
  ListChecks,
  Music,
  Users,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { AdminPage, AdminTableSection } from "../components/admin/common";
import CinematicStaggeredRevealItem from "../components/cinematic/CinematicStaggeredRevealItem";
import IconButton from "../components/ui/IconButton";
import { SkeletonBlock } from "../components/ui/TableSectionSkeleton";
import { adminContent } from "../constants/adminContent";
import useAdminDataSnapshot from "../hooks/useAdminDataSnapshot";
import { isAdminSessionAuthenticated } from "../utils/adminSession";
import { loadAdminDataOnce } from "../services/adminDataStore";
import { ADMIN_PASSWORD } from "../constants/admin";
import {
  downloadAdminPdf,
  downloadAdminWorkbook,
  downloadProvidersPdf,
  downloadSeatingPlanPdf,
  downloadTasksPdf,
  downloadMusicPdf,
} from "../services/exportsService";

export default function AdminExports() {
  const isAuthenticated = isAdminSessionAuthenticated();
  const snapshot = useAdminDataSnapshot();
  const [loading, setLoading] = useState(!snapshot.loaded);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadAdminDataOnce({ password: ADMIN_PASSWORD }).finally(() => setLoading(false));
  }, [isAuthenticated]);
  const hasData = [
    snapshot.confirmations,
    snapshot.notifications,
    snapshot.providers,
    snapshot.tables,
    snapshot.tasks,
    snapshot.music,
  ].some((items) => items.length > 0);

  if (!isAuthenticated) return <Navigate replace to="/admin" />;

  const panels = [
    {
      id: "workbook",
      label: "Excel",
      content: (
        <ExportSection
          content={adminContent.exports.workbook}
          loading={loading}
          disabled={!hasData}
          icon={<FileSpreadsheet size={20} strokeWidth={1.8} />}
          actionIcon={<Download size={16} strokeWidth={1.8} />}
          tone="primary"
          onDownload={() =>
            downloadAdminWorkbook({
              fileName: adminContent.exports.workbook.fileName,
              snapshot,
            })
          }
        />
      ),
    },
    {
      id: "confirmations",
      label: "Invitados",
      content: (
        <ExportSection
          content={adminContent.exports.confirmationsPdf}
          loading={loading}
          disabled={!snapshot.confirmations.length}
          icon={<Users size={20} strokeWidth={1.8} />}
          actionIcon={<Download size={16} strokeWidth={1.8} />}
          tone="primary"
          onDownload={() =>
            downloadAdminPdf({
              fileName: adminContent.exports.confirmationsPdf.fileName,
              snapshot,
            })
          }
        />
      ),
    },
    {
      id: "providers",
      label: "Proveedores",
      content: (
        <ExportSection
          content={adminContent.exports.providers}
          loading={loading}
          disabled={!snapshot.providers.length}
          icon={<ReceiptText size={20} strokeWidth={1.8} />}
          actionIcon={<Download size={16} strokeWidth={1.8} />}
          tone="primary"
          onDownload={() =>
            downloadProvidersPdf({
              fileName: adminContent.exports.providers.fileName,
              snapshot,
            })
          }
        />
      ),
    },
    {
      id: "seating",
      label: "Mesas",
      content: (
        <ExportSection
          content={adminContent.exports.seating}
          loading={loading}
          disabled={!snapshot.tables.length && !snapshot.confirmations.length}
          icon={<Armchair size={20} strokeWidth={1.8} />}
          actionIcon={<Download size={16} strokeWidth={1.8} />}
          tone="primary"
          onDownload={() =>
            downloadSeatingPlanPdf({
              fileName: adminContent.exports.seating.fileName,
              snapshot,
            })
          }
        />
      ),
    },
    {
      id: "music",
      label: adminContent.exports.music.title,
      content: (
        <ExportSection
          content={adminContent.exports.music}
          loading={loading}
          disabled={!snapshot.music.length}
          icon={<Music size={20} strokeWidth={1.8} />}
          actionIcon={<Download size={16} strokeWidth={1.8} />}
          tone="primary"
          onDownload={() =>
            downloadMusicPdf({ fileName: adminContent.exports.music.fileName, snapshot })
          }
        />
      ),
    },
    {
      id: "tasks",
      label: "Tareas",
      content: (
        <ExportSection
          content={adminContent.exports.tasks}
          loading={loading}
          disabled={!snapshot.tasks.length}
          icon={<ListChecks size={20} strokeWidth={1.8} />}
          actionIcon={<Download size={16} strokeWidth={1.8} />}
          tone="primary"
          onDownload={() =>
            downloadTasksPdf({
              fileName: adminContent.exports.tasks.fileName,
              snapshot,
            })
          }
        />
      ),
    },
  ];

  return (
    <AdminPage
      header={adminContent.exports.header}
      innerClassName="max-w-7xl py-6"
    >
      {({ isVisible }) => (
        <CinematicStaggeredRevealItem index={2} isVisible={isVisible}>
          <div className="grid gap-5 lg:grid-cols-2">
            {panels.map((panel) => (
              <div key={panel.id} className="min-w-0">
                {panel.content}
              </div>
            ))}
          </div>
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
  loading = false,
  onDownload,
  tone = "primary",
}) {
  return (
    <AdminTableSection
      eyebrow={content.eyebrow}
      headerActions={loading ? <SkeletonBlock className="h-10 w-10 rounded-full" /> : (
        <IconButton
          disabled={disabled}
          icon={actionIcon}
          label={content.action}
          onClick={onDownload}
          showText={false}
          tone={tone}
          type="button"
        >
          {content.action}
        </IconButton>
      )}
      headerLoading={loading}
      skeletonHeader
      title={content.title}
    >
      {loading ? <ExportSectionSkeleton /> : (
        <div className="flex items-center gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/45 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-white/60 text-[var(--color-accent-dark)]">
            {icon}
          </span>
          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
            {content.text}
          </p>
        </div>
      )}
    </AdminTableSection>
  );
}

function ExportSectionSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/45 p-4">
      <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-full max-w-64 rounded-full" />
        <SkeletonBlock className="h-4 w-3/4 max-w-48 rounded-full" />
      </div>
    </div>
  );
}

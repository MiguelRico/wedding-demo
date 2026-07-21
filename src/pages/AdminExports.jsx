import { Download, FileSpreadsheet, FileText, ReceiptText, Armchair } from "lucide-react";
import { Navigate } from "react-router-dom";

import { AdminPage, AdminTableSection } from "../components/admin/common";
import CinematicStaggeredRevealItem from "../components/cinematic/CinematicStaggeredRevealItem";
import IconButton from "../components/ui/IconButton";
import { adminContent } from "../constants/adminContent";
import useAdminDataSnapshot from "../hooks/useAdminDataSnapshot";
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
  const content = adminContent.exports.workbook;
  const hasData = [
    snapshot.confirmations,
    snapshot.notifications,
    snapshot.providers,
    snapshot.tables,
    snapshot.tasks,
  ].some((items) => items.length > 0);

  if (!isAuthenticated) return <Navigate replace to="/admin" />;

  return (
    <AdminPage header={adminContent.exports.header} innerClassName="max-w-7xl py-6">
      {({ isVisible }) => (
        <CinematicStaggeredRevealItem index={2} isVisible={isVisible}>
          <div className="grid gap-5">
          <AdminTableSection
            eyebrow={content.eyebrow}
            headerActions={
              <div className="flex flex-wrap gap-2">
                <IconButton
                  disabled={!hasData}
                  icon={<Download size={16} strokeWidth={1.8} />}
                  label={content.action}
                  onClick={() =>
                    downloadAdminWorkbook({
                      fileName: content.fileName,
                      snapshot,
                    })
                  }
                  showText="always"
                  tone="primary"
                  type="button"
                >
                  {content.action}
                </IconButton>
                <IconButton
                  disabled={!hasData}
                  icon={<FileText size={16} strokeWidth={1.8} />}
                  label={content.pdfAction}
                  onClick={() =>
                    downloadAdminPdf({
                      fileName: content.fileName,
                      snapshot,
                    })
                  }
                  showText="always"
                  tone="terciary"
                  type="button"
                >
                  {content.pdfAction}
                </IconButton>
              </div>
            }
            title={content.title}
          >
            <div className="flex items-start gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/45 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-white/60 text-[var(--color-accent-dark)]">
                <FileSpreadsheet size={20} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  {hasData ? content.text : content.unavailableText}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent-dark)]">
                  {hasData ? content.currentData : content.unavailableTitle}
                </p>
              </div>
            </div>
          </AdminTableSection>
          <div className="grid gap-5 lg:grid-cols-2">
            <ExportSection
              content={adminContent.exports.providers}
              disabled={!snapshot.providers.length}
              icon={<ReceiptText size={20} strokeWidth={1.8} />}
              onDownload={() => downloadProvidersPdf({ fileName: adminContent.exports.providers.fileName, snapshot })}
            />
            <ExportSection
              content={adminContent.exports.seating}
              disabled={!snapshot.tables.length && !snapshot.confirmations.length}
              icon={<Armchair size={20} strokeWidth={1.8} />}
              onDownload={() => downloadSeatingPlanPdf({ fileName: adminContent.exports.seating.fileName, snapshot })}
            />
          </div>
          </div>
        </CinematicStaggeredRevealItem>
      )}
    </AdminPage>
  );
}

function ExportSection({ content, disabled, icon, onDownload }) {
  return (
    <AdminTableSection
      eyebrow={content.eyebrow}
      headerActions={<IconButton disabled={disabled} icon={<FileText size={16} strokeWidth={1.8} />} label={content.action} onClick={onDownload} showText="always" tone="terciary" type="button">{content.action}</IconButton>}
      title={content.title}
    >
      <div className="flex items-start gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/45 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-white/60 text-[var(--color-accent-dark)]">{icon}</span>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">{content.text}</p>
      </div>
    </AdminTableSection>
  );
}

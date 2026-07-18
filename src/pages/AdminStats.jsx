import { useInView } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import { isAdminSessionAuthenticated } from "../utils/adminSession";
import { GuestTotalsPanel } from "../components/admin/guests";
import { TableTotalsPanel } from "../components/admin/tables";
import { ProviderTotalsPanel } from "../components/admin/providers";
import { NotificationTotalsPanel } from "../components/admin/notifications";
import { TaskTotalsPanel } from "../components/admin/tasks";
import CinematicPage from "../components/cinematic/CinematicPage";
import CinematicSection from "../components/cinematic/CinematicSection";
import CinematicStaggeredRevealItem from "../components/cinematic/CinematicStaggeredRevealItem";
import HeaderSection from "../components/ui/HeaderSection";
import StatusDialog from "../components/ui/StatusDialog";
import { adminContent } from "../constants/adminContent";
import { COMMON_ALLERGIES } from "../constants/rsvp";
import { Confirmation } from "../models";
import { loadAdminDataOnce } from "../services/adminDataStore";
import { buildTables, buildTableStats } from "../services/tablesService";
import { buildProviderStats } from "../services/providersService";
import { buildNotificationStats } from "../services/notificationsService";
import { buildTaskStats } from "../services/tasksService";
import { buildGuestStats, getGuestItems } from "../utils/guestPageUtils";

const ADMIN_OUTBOUND_BUS_OPTIONS = [
  { value: "No", label: "No" },
  { value: "18:00", label: "18:00" },
  { value: "18:20", label: "18:20" },
];

const ADMIN_RETURN_BUS_OPTIONS = [
  { value: "No", label: "No" },
  { value: "3:00", label: "3:00" },
  { value: "6:00", label: "6:00" },
];

const emptyState = {
  confirmations: [],
  loading: true,
  notifications: [],
  providers: [],
  tables: [],
  tasks: [],
  error: "",
};

export default function AdminStats() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, {
    once: true,
    amount: 0.2,
  });
  const isAuthenticated = isAdminSessionAuthenticated();
  const [state, setState] = useState(emptyState);

  const loadStats = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setState((prev) => ({ ...prev, loading: true, error: "" }));
    }

    try {
      const response = await loadAdminDataOnce();

      setState({
        confirmations: response.confirmations,
        loading: false,
        notifications: response.notifications,
        providers: response.providers,
        tables: response.tables,
        tasks: response.tasks,
        error: "",
      });
    } catch (error) {
      console.error(error);

      setState({
        confirmations: [],
        loading: false,
        notifications: [],
        providers: [],
        tables: [],
        tasks: [],
        error: adminContent.stats.dialogs.loadError,
      });
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const timeoutId = window.setTimeout(() => {
      loadStats({ showLoading: false });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, loadStats]);

  const stats = useMemo(
    () =>
      Confirmation.buildStats(state.confirmations, {
        allergies: COMMON_ALLERGIES,
        outboundBusOptions: ADMIN_OUTBOUND_BUS_OPTIONS,
        returnBusOptions: ADMIN_RETURN_BUS_OPTIONS,
      }),
    [state.confirmations],
  );
  const guestStats = useMemo(() => {
    const rows = Confirmation.toAdminRows(state.confirmations);
    const guests = getGuestItems(state.confirmations);

    return buildGuestStats(rows, guests);
  }, [state.confirmations]);
  const tableStats = useMemo(() => {
    const tables = buildTables({
      confirmations: state.confirmations,
      manualTables: state.tables,
    });

    return buildTableStats(tables);
  }, [state.confirmations, state.tables]);
  const providerStats = useMemo(
    () => buildProviderStats(state.providers),
    [state.providers],
  );
  const notificationStats = useMemo(
    () => buildNotificationStats(state.notifications),
    [state.notifications],
  );
  const taskStats = useMemo(() => buildTaskStats(state.tasks), [state.tasks]);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <CinematicPage>
      <CinematicSection
        className="surface-soft admin-section"
        innerClassName="max-w-6xl py-6"
        reveal={false}
      >
        <div ref={statsRef}>
          <CinematicStaggeredRevealItem index={0} isVisible={statsInView}>
            <HeaderSection
              eyebrow={adminContent.stats.header.eyebrow}
              title={adminContent.stats.header.title}
              titleAs="h1"
              text={adminContent.stats.header.text}
            />
          </CinematicStaggeredRevealItem>

          <CinematicStaggeredRevealItem index={2} isVisible={statsInView}>
            <div className="grid gap-5">
              <TaskTotalsPanel loading={state.loading} stats={taskStats} />
              <NotificationTotalsPanel
                loading={state.loading}
                stats={notificationStats}
              />
              <GuestTotalsPanel
                chartStats={stats}
                loading={state.loading}
                stats={guestStats}
              />
              <TableTotalsPanel loading={state.loading} stats={tableStats} />
              <ProviderTotalsPanel
                loading={state.loading}
                stats={providerStats}
              />
            </div>
          </CinematicStaggeredRevealItem>
        </div>
      </CinematicSection>

      <StatusDialog
        eyebrow={adminContent.stats.dialogs.warningEyebrow}
        message={state.error}
        onClose={() => setState((current) => ({ ...current, error: "" }))}
        open={Boolean(state.error)}
        title={adminContent.stats.dialogs.problemTitle}
        type="error"
      />
    </CinematicPage>
  );
}


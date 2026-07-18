import {
  Bell,
  BellOff,
  CircleAlert,
  CreditCard,
  Inbox,
  MailCheck,
} from "lucide-react";

import { adminContent } from "../../../constants/adminContent";
import { GUESTS_TYPE } from "../../../models/AdminNotification";
import {
  AdminMetricGroupCard,
  AdminMetricGroupCardSkeleton,
} from "../common";

const NOTIFICATION_METRIC_GRID_CLASS =
  "grid grid-cols-3 gap-2 md:grid-cols-2";

export default function NotificationTotalsPanel({ loading, stats }) {
  const metrics = adminContent.notifications.overview.metrics;

  return (
    <section className="premium-card">
      <p className="section-eyebrow mb-2 md:hidden">
        {adminContent.notifications.overview.eyebrow}
      </p>
      <h2 className="mb-5 hidden font-serif text-3xl leading-none text-[var(--color-accent-dark)] md:block">
        {adminContent.notifications.overview.title}
      </h2>
      {loading ? (
        <div className={NOTIFICATION_METRIC_GRID_CLASS}>
          <AdminMetricGroupCardSkeleton
            className="col-span-3 md:col-span-1"
            showHeader={false}
          />
          <AdminMetricGroupCardSkeleton
            className="col-span-3 md:col-span-1"
            showHeader={false}
          />
        </div>
      ) : (
        <div className={NOTIFICATION_METRIC_GRID_CLASS}>
          <AdminMetricGroupCard
            className="col-span-3 md:col-span-1"
            icon={<Inbox size={22} strokeWidth={1.8} />}
            items={[
              {
                icon: <Inbox size={18} strokeWidth={1.8} />,
                label: metrics.total,
                value: stats.totalCount,
              },
              {
                icon: <Bell size={18} strokeWidth={1.8} />,
                label: metrics.read,
                value: stats.readCount,
              },
              {
                icon: <BellOff size={18} strokeWidth={1.8} />,
                label: metrics.unread,
                value: stats.unreadCount,
              },
            ]}
            showHeaderIcon={false}
            showHeaderTitle={false}
            title={metrics.total}
          />
          <AdminMetricGroupCard
            className="col-span-3 md:col-span-1"
            icon={<CircleAlert size={22} strokeWidth={1.8} />}
            items={[
              {
                icon: <CircleAlert size={18} strokeWidth={1.8} />,
                label: metrics.warning,
                value: stats.typeCounts.Aviso || 0,
              },
              {
                icon: <CreditCard size={18} strokeWidth={1.8} />,
                label: metrics.payment,
                value: stats.typeCounts.Pago || 0,
              },
              {
                icon: <MailCheck size={18} strokeWidth={1.8} />,
                label: metrics.confirmation,
                value: stats.typeCounts[GUESTS_TYPE] || 0,
              },
            ]}
            showHeaderIcon={false}
            showHeaderTitle={false}
            title={metrics.types}
          />
        </div>
      )}
    </section>
  );
}

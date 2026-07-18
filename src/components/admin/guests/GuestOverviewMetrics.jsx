import {
  AlertTriangle,
  Beef,
  BusFront,
  Fish,
  MailCheck,
  MessageCircle,
  UsersRound,
} from "lucide-react";

import { isMenuModuleEnabled } from "../../../config/features";
import {
  AdminMetricGroupCard,
  AdminMetricGroupCardSkeleton,
} from "../common";

export function GuestOverviewMetricGrid({ metrics, stats }) {
  return (
    <div className={getGuestMetricGridClass(isMenuModuleEnabled)}>
      <AdminMetricGroupCard
        className="col-span-4 md:col-span-1"
        icon={<MailCheck size={22} strokeWidth={1.8} />}
        items={[
          {
            icon: <MailCheck size={18} strokeWidth={1.8} />,
            label: metrics.confirmations,
            value: stats.groupCount,
          },
          {
            icon: <UsersRound size={18} strokeWidth={1.8} />,
            label: metrics.guests,
            value: stats.guestCount,
          },
          {
            icon: <MessageCircle size={18} strokeWidth={1.8} />,
            label: metrics.comments,
            value: stats.commentsCount,
          },
        ]}
        showHeaderIcon={false}
        showHeaderTitle={false}
        title={metrics.confirmations}
      />

      {isMenuModuleEnabled && (
        <AdminMetricGroupCard
          className="col-span-4 md:col-span-1"
          items={getMenuMetricItems(metrics, stats)}
          showHeaderIcon={false}
          showHeaderTitle={false}
          title={metrics.meat}
        />
      )}

      <AdminMetricGroupCard
        className="col-span-2 md:col-span-1"
        icon={<AlertTriangle size={22} strokeWidth={1.8} />}
        items={[
          {
            icon: <AlertTriangle size={18} strokeWidth={1.8} />,
            label: metrics.allergies,
            value: stats.allergyCount,
          },
          {
            icon: <AlertTriangle size={18} strokeWidth={1.8} />,
            label: metrics.otherAllergies,
            value: stats.otherAllergyCount,
          },
        ]}
        showHeaderIcon={false}
        showHeaderTitle={false}
        title={metrics.allergies}
      />

      <AdminMetricGroupCard
        className="col-span-2 md:col-span-1"
        icon={<BusFront size={22} strokeWidth={1.8} />}
        items={[
          {
            icon: <BusFront size={18} strokeWidth={1.8} />,
            label: metrics.outboundBus,
            value: stats.outboundBusCount,
          },
          {
            icon: <BusFront size={18} strokeWidth={1.8} />,
            label: metrics.returnBus,
            value: stats.returnBusCount,
          },
        ]}
        showHeaderIcon={false}
        showHeaderTitle={false}
        title="Transporte"
      />
    </div>
  );
}

export function GuestOverviewMetricGridSkeleton() {
  return (
    <div className={getGuestMetricGridClass(isMenuModuleEnabled)}>
      <AdminMetricGroupCardSkeleton
        className="col-span-4 md:col-span-1"
        showHeader={false}
      />
      {isMenuModuleEnabled && (
        <AdminMetricGroupCardSkeleton
          className="col-span-4 md:col-span-1"
          itemCount={2}
          showHeader={false}
        />
      )}
      <AdminMetricGroupCardSkeleton
        className="col-span-2 md:col-span-1"
        itemCount={2}
        showHeader={false}
      />
      <AdminMetricGroupCardSkeleton
        className="col-span-2 md:col-span-1"
        itemCount={2}
        showHeader={false}
      />
    </div>
  );
}

function getGuestMetricGridClass(hasMenuModule) {
  return `grid grid-cols-4 gap-2 ${
    hasMenuModule ? "md:grid-cols-4" : "md:grid-cols-3"
  }`;
}

function getMenuMetricItems(metrics, stats) {
  return [
    {
      icon: <Beef size={22} strokeWidth={1.8} />,
      label: metrics.meat,
      value: stats.meatCount,
    },
    {
      icon: <Fish size={22} strokeWidth={1.8} />,
      label: metrics.fish,
      value: stats.fishCount,
    },
  ];
}

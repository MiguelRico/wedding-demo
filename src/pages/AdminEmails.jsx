import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { GuestEmailCard } from "../components/admin/notifications";
import { AdminPage } from "../components/admin/common";
import CinematicStaggeredRevealItem from "../components/cinematic/CinematicStaggeredRevealItem";
import StatusDialog from "../components/ui/StatusDialog";
import { ADMIN_PASSWORD } from "../constants/admin";
import { adminContent } from "../constants/adminContent";
import { loadAdminDataOnce } from "../services/adminDataStore";
import { sendGuestEmail } from "../services/notificationsService";
import { isAdminSessionAuthenticated } from "../utils/adminSession";

export default function AdminEmails() {
  const isAuthenticated = isAdminSessionAuthenticated();
  const [confirmations, setConfirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ message: "", open: false, title: "", type: "success" });

  useEffect(() => {
    if (!isAuthenticated) return;

    loadAdminDataOnce({ password: ADMIN_PASSWORD })
      .then((snapshot) => setConfirmations(snapshot.confirmations))
      .catch((error) => {
        console.error(error);
        setStatus({
          message: adminContent.emails.dialogs.loadError,
          open: true,
          title: adminContent.emails.dialogs.problemTitle,
          type: "error",
        });
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSend = async (email) => {
    if (sending) return false;

    setSending(true);
    try {
      const result = await sendGuestEmail({ ...email, password: ADMIN_PASSWORD });
      setStatus({
        message: adminContent.emails.dialogs.sentMessage(
          result.sent || email.recipients.length,
        ),
        open: true,
        title: adminContent.emails.dialogs.sentTitle,
        type: "success",
      });
      return true;
    } catch (error) {
      console.error(error);
      setStatus({
        message: adminContent.emails.dialogs.sendError,
        open: true,
        title: adminContent.emails.dialogs.problemTitle,
        type: "error",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) return <Navigate replace to="/admin" />;

  return (
    <AdminPage
        header={adminContent.emails.header}
        innerClassName="max-w-7xl py-6"
      >
        {({ isVisible }) => (
          <>
        <CinematicStaggeredRevealItem index={2} isVisible={isVisible}>
          <GuestEmailCard
            confirmations={confirmations}
            loading={loading}
            onSend={handleSend}
            sending={sending}
          />
        </CinematicStaggeredRevealItem>

        <StatusDialog
        message={status.message}
        onClose={() => setStatus((current) => ({ ...current, open: false }))}
        open={status.open}
        title={status.title}
        type={status.type}
        />
          </>
        )}
    </AdminPage>
  );
}

import { useInView } from "framer-motion";
import { useRef } from "react";

import CinematicPage from "../../cinematic/CinematicPage";
import AdminPageShell from "./AdminPageShell";

export default function AdminPage({
  children,
  header,
  inViewAmount = 0.12,
  innerClassName,
}) {
  const rootRef = useRef(null);
  const isVisible = useInView(rootRef, {
    once: true,
    amount: inViewAmount,
  });

  return (
    <CinematicPage>
      <AdminPageShell
        header={header}
        innerClassName={innerClassName}
        isVisible={isVisible}
        rootRef={rootRef}
      >
        {children({ isVisible })}
      </AdminPageShell>
    </CinematicPage>
  );
}

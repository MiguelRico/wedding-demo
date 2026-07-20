import { useSyncExternalStore } from "react";

import {
  getAdminDataSnapshot,
  subscribeAdminData,
} from "../services/adminDataStore";

export default function useAdminDataSnapshot() {
  return useSyncExternalStore(
    subscribeAdminData,
    getAdminDataSnapshot,
    getAdminDataSnapshot,
  );
}

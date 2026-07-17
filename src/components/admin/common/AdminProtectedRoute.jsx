import { Navigate, Outlet } from "react-router-dom";
import { isAdminSessionAuthenticated } from "../../../utils/adminSession";

export default function AdminProtectedRoute() {
  return isAdminSessionAuthenticated() ? <Outlet /> : <Navigate replace to="/admin" />;
}

import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import RequestPage from "../pages/RequestPage";
import NotificationsPage from "../pages/NotificationsPage";
import AccountPage from "../pages/AccountPage";

function RouteSelect() {
  return (
    <main>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="requests" element={<RequestPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="account" element={<AccountPage />} />
      </Routes>
    </main>
  );
}

export default RouteSelect;

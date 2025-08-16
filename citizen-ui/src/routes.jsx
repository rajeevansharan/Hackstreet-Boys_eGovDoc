import { createBrowserRouter, redirect } from "react-router-dom";
import EnterPhoneNumber from "./pages/EnterPhoneNumber";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import HomePage from "./pages/HomePage";
import RequestPage from "./pages/RequestPage";
import NotificationsPage from "./pages/NotificationsPage";
import AccountPage from "./pages/AccountPage";
import TravelWarrantForm from "./pages/TravelWarrant";
import SalaryParticularPage from "./pages/SalaryParticularPage";
import AppLayout from "./components/AppLayout";

// Simple auth gate using presence of localStorage egovdoc:user
function requireAuth() {
  try {
    const stored = localStorage.getItem("egovdoc:user");
    if (!stored) throw new Error("no user");
  } catch {
    throw redirect("/login");
  }
  return null;
}

const router = createBrowserRouter([
  // Public routes - no authentication required
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/enter-phone", element: <EnterPhoneNumber /> },
  { path: "/verify-otp", element: <VerifyOTP /> },
  
  // Protected routes - with authentication and layout
  {
    path: "/",
    element: <AppLayout />,
    loader: requireAuth,
    children: [
      { index: true, element: <HomePage /> },
      { path: "requests", element: <RequestPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "account", element: <AccountPage /> },
      { path: "travel-warrant", element: <TravelWarrantForm /> },
      { path: "salary-particular", element: <SalaryParticularPage /> },
    ],
  },
  
  // Catch-all redirect
  { path: "*", loader: () => redirect("/login") },
]);

export default router;
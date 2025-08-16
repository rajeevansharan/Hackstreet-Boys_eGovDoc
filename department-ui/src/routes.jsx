import { createBrowserRouter, redirect } from "react-router-dom";
import EnterPhoneNumber from "./pages/EnterPhoneNumber";
import Home from "./pages/Home";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";

// Simple auth gate using presence of localStorage dept:user for demo purposes
function requireAuth() {
  try {
    const stored = localStorage.getItem("dept:user");
    if (!stored) throw new Error("no user");
  } catch {
    throw redirect("/login");
  }
  return null;
}

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/enter-phone", element: <EnterPhoneNumber /> },
  { path: "/verify-otp", element: <VerifyOTP /> },
  {
    path: "/",
    loader: requireAuth,
    children: [{ index: true, element: <Home /> }],
  },
  { path: "*", loader: () => redirect("/login") },
]);

export default router;

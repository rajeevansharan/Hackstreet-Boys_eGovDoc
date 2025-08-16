import { createBrowserRouter, redirect } from "react-router-dom";
import EnterPhoneNumber from "./pages/EnterPhoneNumber";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup"; // added
import VerifyOTP from "./pages/VerifyOTP";
import TravelWarrantForm from "./pages/TravelWarrant";

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
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/enter-phone", element: <EnterPhoneNumber /> },
  { path: "/verify-otp", element: <VerifyOTP /> },
  {
    path: "/",
    loader: requireAuth,
    children: [{ index: true, element: <Home /> }],
  },
  {
    path: "/travel-warrant",
    element: <TravelWarrantForm />,
  },
  { path: "*", loader: () => redirect("/login") },
]);

export default router;

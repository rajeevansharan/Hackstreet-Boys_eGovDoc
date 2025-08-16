import { createBrowserRouter, redirect } from "react-router-dom";
import EnterPhoneNumber from "./pages/EnterPhoneNumber";
import Home from "./pages/Home";
<<<<<<< HEAD
import TravelWarrantForm from './pages/TravelWarrant'
=======
import Login from "./pages/Login";
import Signup from "./pages/Signup"; // added
import VerifyOTP from "./pages/VerifyOTP";

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
>>>>>>> 562c0ebe51e8af6e4a8ad83d201d675ccd0ddf6f

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
<<<<<<< HEAD
  {
    path: "/travel-warrant",
    element: <TravelWarrantForm />,
  }
=======
  { path: "*", loader: () => redirect("/login") },
>>>>>>> 562c0ebe51e8af6e4a8ad83d201d675ccd0ddf6f
]);

export default router;

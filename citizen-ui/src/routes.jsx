import { createBrowserRouter } from "react-router-dom";
import EnterPhoneNumber from "./pages/EnterPhoneNumber";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup"; // added
import VerifyOTP from "./pages/VerifyOTP";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <Home />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup />,
  }, // added
  {
    path: "enter-phone",
    element: <EnterPhoneNumber />,
  },
  {
    path: "verify-otp",
    element: <VerifyOTP />,
  },
]);

export default router;

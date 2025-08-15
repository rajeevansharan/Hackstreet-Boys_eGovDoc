import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import TravelWarrantForm from './pages/TravelWarrant'

const router = createBrowserRouter([
  {
    path: "/*",
    element: <Home />,
  },
  {
    path: "/travel-warrant",
    element: <TravelWarrantForm />,
  }
]);

export default router;

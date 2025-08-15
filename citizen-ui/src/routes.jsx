import { createBrowserRouter } from "react-router-dom";
import TravelWarrant from "./pages/TravelWarrantForm";

const router = createBrowserRouter([
  {
    index: true,
    element: <TravelWarrant />,
  },
]);

export default router;

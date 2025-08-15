import { createBrowserRouter } from "react-router-dom";
import TravelWarrant from "./pages/Home";

const router = createBrowserRouter([
  {
    index: true,
    element: <TravelWarrant />,
  },
]);

export default router;

import { Outlet, useLocation } from "react-router-dom";
import PrimaryNavBar from "./PrimaryNavBar";

function AppLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-t from-[#3A66A3] from-4% via-[#9DB2D1] via-72% to-[#FFFFFF] to-100%">
      <div className="flex-1 overflow-y-auto pb-20">
        {/* This is where page content will render */}
        <Outlet />
      </div>
      
      {/* Only keep the primary nav bar here */}
      <PrimaryNavBar />
    </div>
  );
}

export default AppLayout;
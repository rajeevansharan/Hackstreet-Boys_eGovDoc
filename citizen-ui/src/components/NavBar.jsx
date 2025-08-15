import { useState } from "react";
import { IoHomeOutline } from "react-icons/io5";
import { TfiList } from "react-icons/tfi";
import { FaRegBell } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";

function NavBar() {
  return (
    <div className="absolute inset-x-[10px] bottom-[34px] grid grid-cols-4 justify-items-center gap-2 rounded-full bg-white/10 px-[10px] py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_10px_40px_rgba(0,0,0,.25)] ring-1 ring-white/40 backdrop-blur-xl">
      <div className="flex flex-col items-center text-xs font-bold">
        <IoHomeOutline className="h-[25px] w-[25px]" />
        Home
      </div>
      <div className="flex flex-col items-center text-xs font-bold">
        <TfiList className="h-[25px] w-[25px]" />
        Requests
      </div>
      <div className="flex flex-col items-center text-xs font-bold">
        <FaRegBell className="h-[25px] w-[25px]" />
        Notifications
      </div>
      <div className="flex flex-col items-center text-xs font-bold">
        <FaRegUser className="h-[25px] w-[25px]" />
        Account
      </div>
    </div>
  );
}

export default NavBar;

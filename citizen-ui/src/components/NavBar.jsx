import { useState } from "react";
import { IoHomeOutline } from "react-icons/io5";
import { TfiList } from "react-icons/tfi";
import { FaRegBell } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";

function NavBar() {
  const items = [
    { label: "Home", Icon: IoHomeOutline },
    { label: "Requests", Icon: TfiList },
    { label: "Notifications", Icon: FaRegBell },
    { label: "Account", Icon: FaRegUser },
  ];
  return (
    <div className="absolute inset-x-[10px] bottom-[34px] rounded-full bg-white/10 px-[10px] py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_10px_40px_rgba(0,0,0,.25)] ring-1 ring-white/40 backdrop-blur-xl">
      <div className="relative grid grid-cols-4 justify-items-center gap-2">
        {items.map(({ label, Icon }, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-xs font-bold"
          >
            <Icon className="h-[25px] w-[25px]"/>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NavBar;

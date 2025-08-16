import { useState } from "react";
import { Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { TfiList } from "react-icons/tfi";
import { FaRegBell } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";

function PrimaryNavBar() {
  const [active, setActive] = useState(0);

  const items = [
    { path: "/", label: "Home", Icon: IoHomeOutline },
    { path: "/requests", label: "Requests", Icon: TfiList },
    { path: "/notifications", label: "Notifications", Icon: FaRegBell },
    { path: "/account", label: "Account", Icon: FaRegUser },
  ];

  return (
    <nav className="absolute inset-x-[10px] bottom-[34px] rounded-full bg-white/10 px-[10px] py-1 shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_10px_40px_rgba(0,0,0,.25)] ring-1 ring-white/40 backdrop-blur-xl">
      <div className="relative grid grid-cols-4 gap-0">
        <span
          className="pointer-events-none absolute inset-y-1 w-1/4 rounded-full bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,.55),0_8px_32px_rgba(0,0,0,.25)] ring-1 ring-white/40 transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${active * 100}%)` }}
        />
        {items.map(({ label, Icon, path }, index) => {
          const isActive = index === active;
          return (
            <Link
              to={path}
              key={label}
              type="button"
              onClick={() => setActive(index)}
              className="relative z-10 flex flex-col items-center justify-center gap-1 py-3 text-xs"
            >
              <Icon
                className={`h-[25px] w-[25px] transition-all duration-200 ${
                  isActive ? "scale-105 opacity-100" : "opacity-70"
                }`}
              />
              <span
                className={isActive ? "font-bold" : "font-semibold opacity-80"}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default PrimaryNavBar;

import { useState } from "react";
import { Link } from "react-router-dom";

function SecondaryNavBar() {
  const [active, setActive] = useState(0);

  const items = [
    { label: "All" },
    { label: "Completed" },
    { label: "Submitted" },
    { label: "Rejected" },
  ];

  return (
    <nav className="mx-[10px] rounded-full bg-white/10 px-[10px] py-2 shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_10px_40px_rgba(0,0,0,.25)] ring-1 ring-white/40 backdrop-blur-xl">
      <div className="relative grid grid-cols-4">
        <span
          className="pointer-events-none absolute inset-y-1 w-1/4 rounded-full bg-gradient-to-b from-[#2F7496]/70 from-0% to-[#0F2530]/70 to-100% transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${active * 100}%)` }}
        />
        {items.map(({ label }, index) => {
          const isActive = index === active;
          return (
            <Link
              key={label}
              type="button"
              onClick={() => setActive(index)}
              className="z-10 flex items-center justify-center py-3 text-sm"
            >
              <span
                className={
                  isActive ? "font-bold text-white" : "font-semibold opacity-80"
                }
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

export default SecondaryNavBar;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function SecondaryNavBar({
  value,
  onChange,
  items = [
    { label: "All" },
    { label: "Completed" },
    { label: "Pending" },
    { label: "Rejected" },
  ],
}) {
  const [internal, setInternal] = useState(0);
  const controlled = typeof value === "number";
  const active = controlled ? value : internal;

  useEffect(() => {
    if (controlled) return;
    setInternal(0);
  }, [controlled]);

  const setActive = (i) => {
    if (onChange) onChange(i);
    if (!controlled) setInternal(i);
  };

  return (
    <nav className="mx-[10px] rounded-full bg-white/5 px-[10px] py-2 shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_10px_40px_rgba(0,0,0,.25)] ring-1 ring-white/10 backdrop-blur-xl">
      <div className={`relative grid grid-cols-${items.length}`}>
        <span
          className="pointer-events-none absolute inset-y-1 w-1/4 rounded-full bg-gradient-to-b from-[#2F7496]/70 from-0% to-[#0F2530]/70 to-100% transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${active * 100}%)`,
            width: `${100 / items.length}%`,
          }}
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

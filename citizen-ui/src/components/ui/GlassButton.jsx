import React from "react";

const GlassButton = ({
  onClick,
  children,
  disabled = false,
  variant = "default",
  className = "",
}) => {
  const baseClasses =
    "w-full rounded-full py-3 font-medium backdrop-blur-sm transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none";

  const variants = {
    default: disabled
      ? "bg-gray-300/30 text-gray-500 cursor-not-allowed"
      : "bg-white/30 text-black hover:bg-white/40",
    primary: disabled
      ? "bg-gray-300/30 text-gray-500 cursor-not-allowed"
      : "bg-blue-500/30 text-white hover:bg-blue-500/40",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default GlassButton;

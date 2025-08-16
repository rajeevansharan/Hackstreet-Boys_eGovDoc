import React from "react";

const TextareaField = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 3,
  required = false,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-black">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full resize-none rounded-lg border-0 bg-white/30 px-4 py-3 text-black placeholder-gray-600 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
      placeholder={placeholder}
    />
  </div>
);

export default TextareaField;

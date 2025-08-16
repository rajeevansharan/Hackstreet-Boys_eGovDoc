import React from "react";

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
  required = false,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-black">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border-0 bg-white/30 px-4 py-3 text-black backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;

import React from "react";

const CheckboxField = ({ label, checked, onChange, required = false }) => (
  <div className="mb-6">
    <label className="flex cursor-pointer items-start space-x-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-400 bg-white/30 text-blue-600 focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-sm leading-5 text-black">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
    </label>
  </div>
);

export default CheckboxField;

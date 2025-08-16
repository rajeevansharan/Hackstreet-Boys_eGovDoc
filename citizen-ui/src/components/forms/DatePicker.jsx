import React from "react";
import { Calendar } from "lucide-react";

const DatePicker = ({ label, value, onChange, required = false }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-black">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border-0 bg-white/30 px-4 py-3 text-black placeholder-gray-600 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
      <Calendar className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 transform text-gray-600" />
    </div>
  </div>
);

export default DatePicker;

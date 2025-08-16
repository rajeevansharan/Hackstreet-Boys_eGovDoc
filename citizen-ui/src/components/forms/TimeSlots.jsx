import React from "react";
import { X, Check } from "lucide-react";

const TimeSlots = ({ slots, selectedSlot, onSlotSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (slots.length === 0) return null;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-black">
        Available Time Slots
      </label>
      <div className="space-y-2">
        {slots.map((slot) => (
          <button
            key={slot.id}
            disabled={!slot.available}
            onClick={() => onSlotSelect(slot.time)}
            className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${
              slot.available
                ? selectedSlot === slot.time
                  ? "border-2 border-blue-600 bg-blue-500/50 backdrop-blur-sm"
                  : "bg-white/30 backdrop-blur-sm hover:bg-white/40"
                : "cursor-not-allowed bg-gray-300/50 text-gray-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{slot.time}</span>
              {slot.available ? (
                selectedSlot === slot.time ? (
                  <Check className="h-4 w-4 text-blue-600" />
                ) : null
              ) : (
                <X className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlots;

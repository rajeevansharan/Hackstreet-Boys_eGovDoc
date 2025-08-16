import React from "react";

const StatusBar = () => (
  <div className="flex items-center justify-between px-6 py-3 font-medium text-black">
    <span>9:41</span>
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        <div className="h-1 w-1 rounded-full bg-black"></div>
        <div className="h-1 w-1 rounded-full bg-black"></div>
        <div className="h-1 w-1 rounded-full bg-black"></div>
        <div className="h-1 w-1 rounded-full bg-black"></div>
      </div>
      <div className="h-3 w-6 rounded-sm border border-black">
        <div className="m-0.5 h-2 w-4 rounded-sm bg-black"></div>
      </div>
    </div>
  </div>
);

export default StatusBar;

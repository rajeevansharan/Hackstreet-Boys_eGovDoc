import React from "react";

const ProgressIndicator = ({ currentStep, totalSteps }) => (
  <div className="mt-2 flex justify-center space-x-2">
    {Array.from({ length: totalSteps }, (_, index) => (
      <div
        key={index + 1}
        className={`h-2 w-2 rounded-full ${
          currentStep === index + 1 ? "bg-black" : "bg-black/30"
        }`}
      />
    ))}
  </div>
);

export default ProgressIndicator;

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GlassButton from "./ui/GlassButton";

const NavigationButtons = ({
  currentStep,
  onBack,
  onNext,
  onCancel,
  onSubmit,
  canSubmit = true,
}) => {
  if (currentStep === 1) {
    return (
      <>
        <GlassButton
          onClick={onBack}
          className="flex items-center justify-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </GlassButton>
        <GlassButton
          onClick={onNext}
          className="flex items-center justify-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </GlassButton>
      </>
    );
  }

  return (
    <>
      <GlassButton
        onClick={onBack}
        className="flex items-center justify-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </GlassButton>
      <GlassButton onClick={onCancel}>Cancel Request</GlassButton>
      <GlassButton onClick={onSubmit} disabled={!canSubmit}>
        Submit Request
      </GlassButton>
    </>
  );
};

export default NavigationButtons;

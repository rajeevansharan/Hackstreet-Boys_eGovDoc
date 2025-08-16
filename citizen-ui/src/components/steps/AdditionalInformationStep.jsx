import React from "react";
import DatePicker from "../forms/DatePicker";
import FileUpload from "../forms/FileUpload";
import TextareaField from "../forms/TextAreaField";
import CheckboxField from "../forms/CheckBoxField";
import TimeSlots from "../forms/TimeSlots";
import { useTimeSlots } from "../../hooks/UseTimeSlots";

const AdditionalInformationStep = ({ formData, handleInputChange }) => {
  const { availableSlots, showSlots, loading } = useTimeSlots(
    formData.completionDate,
  );

  return (
    <div className="space-y-5 pb-4">
      <DatePicker
        label="Required Completion Date"
        value={formData.completionDate}
        onChange={(value) => handleInputChange("completionDate", value)}
        required
      />

      {showSlots && (
        <TimeSlots
          slots={availableSlots}
          selectedSlot={formData.selectedSlot}
          onSlotSelect={(slot) => handleInputChange("selectedSlot", slot)}
          loading={loading}
        />
      )}

      <FileUpload
        label="Upload Supporting Documents (PDF only)"
        file={formData.uploadedFile}
        onFileChange={(file) => handleInputChange("uploadedFile", file)}
      />

      <TextareaField
        label="Additional Details"
        value={formData.additionalDetails}
        onChange={(value) => handleInputChange("additionalDetails", value)}
        placeholder="Any additional information or special requirements"
        rows={4}
      />

      <CheckboxField
        label="I confirm that all information provided is accurate and complete"
        checked={formData.informationAccurate}
        onChange={(checked) =>
          handleInputChange("informationAccurate", checked)
        }
        required
      />
    </div>
  );
};

export default AdditionalInformationStep;

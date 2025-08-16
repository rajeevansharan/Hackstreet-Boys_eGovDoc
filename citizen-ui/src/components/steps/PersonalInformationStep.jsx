import React from "react";
import InputField from "../forms/InputField";
import TextareaField from "../forms/TextAreaField";
import SelectField from "../forms/SelectField";

const PersonalInformationStep = ({ formData, handleInputChange }) => {
  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const areaOptions = [
    { value: "colombo", label: "Colombo" },
    { value: "kandy", label: "Kandy" },
    { value: "galle", label: "Galle" },
    { value: "jaffna", label: "Jaffna" },
    { value: "kurunegala", label: "Kurunegala" },
  ];

  return (
    <div className="space-y-5 pb-4">
      <InputField
        label="Full Name"
        value={formData.fullName}
        onChange={(value) => handleInputChange("fullName", value)}
        placeholder="Enter your full name"
        required
      />

      <InputField
        label="NIC Number"
        value={formData.nicNumber}
        onChange={(value) => handleInputChange("nicNumber", value)}
        placeholder="Enter your NIC number"
        required
      />

      <InputField
        label="Pension ID"
        value={formData.pensionId}
        onChange={(value) => handleInputChange("pensionId", value)}
        placeholder="Enter your pension ID"
        required
      />

      <TextareaField
        label="Reason for Request"
        value={formData.reasonForRequest}
        onChange={(value) => handleInputChange("reasonForRequest", value)}
        placeholder="Please explain the reason for your request"
        required
      />

      <SelectField
        label="Priority Level"
        value={formData.priorityLevel}
        onChange={(value) => handleInputChange("priorityLevel", value)}
        options={priorityOptions}
        placeholder="Select priority level"
        required
      />

      <SelectField
        label="Area"
        value={formData.area}
        onChange={(value) => handleInputChange("area", value)}
        options={areaOptions}
        placeholder="Select area"
        required
      />
    </div>
  );
};

export default PersonalInformationStep;

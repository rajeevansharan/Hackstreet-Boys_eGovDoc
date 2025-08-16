import { useState } from 'react';

export const useSalaryForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 data
    fullName: "",
    nicNumber: "",
    pensionId: "",
    reasonForRequest: "",
    priorityLevel: "",
    area: "",
    
    // Step 2 data
    completionDate: "",
    selectedSlot: "",
    uploadedFile: null,
    additionalDetails: "",
    informationAccurate: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  const resetForm = () => {
    setFormData({
      fullName: "",
      nicNumber: "",
      pensionId: "",
      reasonForRequest: "",
      priorityLevel: "",
      area: "",
      completionDate: "",
      selectedSlot: "",
      uploadedFile: null,
      additionalDetails: "",
      informationAccurate: false,
    });
    setCurrentStep(1);
  };

  return {
    currentStep,
    formData,
    handleInputChange,
    nextStep,
    prevStep,
    resetForm,
    setCurrentStep
  };
};
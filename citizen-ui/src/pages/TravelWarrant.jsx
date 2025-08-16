    import React, { useState, useRef, useEffect } from 'react';
    import { Calendar, Upload } from 'lucide-react';

    export default function TravelWarrantForm() {
      const [formData, setFormData] = useState({
        fullName: '',
        pensionNumber: '',
        paymentPlace: '',
        retirementDate: '',
        annualSalary: '',
        travelClass: '',
        maritalStatus: '',
        ticketType: '',
        carType: '',
        dependantChildren: '',
        childrenAges: '',
        fromStation: '',
        toStation: '',
        outwardJourneyDate: '',
        returnJourneyDate: '',
        priorityLevel: '',
        appointmentDate: '',
        appointmentTime: '',
        gsDivision: '',
        spouseName: '',
        spouseDepartment: '',
        informationAccurate: false
      });

      const [timeSlots, setTimeSlots] = useState([]);
      const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
      const [uploadedFiles, setUploadedFiles] = useState([]);
      const [uploading, setUploading] = useState(false);
      const fileInputRef = useRef(null);

      // Function to fetch time slots from backend
      const fetchTimeSlots = async (date) => {
        setLoadingTimeSlots(true);
        try {
          // Simulate API call - replace with your actual backend endpoint
          const response = await fetch(`/api/time-slots?date=${date}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setTimeSlots(data.timeSlots || []);
          } else {
            console.error('Failed to fetch time slots');
            // Fallback to default time slots if API fails
            setTimeSlots([
              { value: "09:00-09:30", label: "09:00 - 09:30" },
              { value: "09:30-10:00", label: "09:30 - 10:00" },
              { value: "10:00-10:30", label: "10:00 - 10:30" },
              { value: "10:30-11:00", label: "10:30 - 11:00" },
              { value: "11:00-11:30", label: "11:00 - 11:30" },
              { value: "11:30-12:00", label: "11:30 - 12:00" },
              { value: "12:00-12:30", label: "12:00 - 12:30" },
              { value: "12:30-13:00", label: "12:30 - 13:00" },
              { value: "13:00-13:30", label: "13:00 - 13:30" },
              { value: "13:30-14:00", label: "13:30 - 14:00" },
              { value: "14:00-14:30", label: "14:00 - 14:30" },
              { value: "14:30-15:00", label: "14:30 - 15:00" },
              { value: "15:00-15:30", label: "15:00 - 15:30" },
              { value: "15:30-16:00", label: "15:30 - 16:00" },
              { value: "16:00-16:30", label: "16:00 - 16:30" },
              { value: "16:30-17:00", label: "16:30 - 17:00" }
            ]);
          }
        } catch (error) {
          console.error('Error fetching time slots:', error);
          // Fallback to default time slots if API fails
          setTimeSlots([
            { value: "09:00-09:30", label: "09:00 - 09:30" },
            { value: "09:30-10:00", label: "09:30 - 10:00" },
            { value: "10:00-10:30", label: "10:00 - 10:30" },
            { value: "10:30-11:00", label: "10:30 - 11:00" },
            { value: "11:00-11:30", label: "11:00 - 11:30" },
            { value: "11:30-12:00", label: "11:30 - 12:00" },
            { value: "12:00-12:30", label: "12:00 - 12:30" },
            { value: "12:30-13:00", label: "12:30 - 13:00" },
            { value: "13:00-13:30", label: "13:00 - 13:30" },
            { value: "13:30-14:00", label: "13:30 - 14:00" },
            { value: "14:00-14:30", label: "14:00 - 14:30" },
            { value: "14:30-15:00", label: "14:30 - 15:00" },
            { value: "15:00-15:30", label: "15:00 - 15:30" },
            { value: "15:30-16:00", label: "15:30 - 16:00" },
            { value: "16:00-16:30", label: "16:00 - 16:30" },
            { value: "16:30-17:00", label: "16:30 - 17:00" }
          ]);
        } finally {
          setLoadingTimeSlots(false);
        }
      };

      const handleInputChange = (field, value) => {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));

        // If appointment date changes, fetch new time slots and reset selected time
        if (field === 'appointmentDate') {
          if (value) {
            fetchTimeSlots(value);
            // Reset the selected time slot when date changes
            setFormData(prev => ({
              ...prev,
              appointmentTime: ''
            }));
          } else {
            // Clear time slots if no date is selected
            setTimeSlots([]);
            setFormData(prev => ({
              ...prev,
              appointmentTime: ''
            }));
          }
        }
      };

      const handleBack = () => {
        console.log('Back button clicked');
      };

      const handleCancelRequest = () => {
        console.log('Cancel the Request clicked');
      };

      const handleSubmitRequest = () => {
        console.log('Submit the Request clicked', formData);
      };

      const handleFileUpload = () => {
        fileInputRef.current?.click();
      };

      const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
          alert('Please select PDF files only.');
          return;
        }

        setUploading(true);
        
        try {
          for (const file of pdfFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'supporting_document');
            
            // Replace with your actual upload endpoint
            const response = await fetch('/api/upload-document', {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              const result = await response.json();
              setUploadedFiles(prev => [...prev, {
                name: file.name,
                size: file.size,
                uploadedAt: new Date().toISOString(),
                fileId: result.fileId || Date.now().toString(),
                url: result.url
              }]);
            } else {
              throw new Error(`Failed to upload ${file.name}`);
            }
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert(`Upload failed: ${error.message}`);
        } finally {
          setUploading(false);
          // Clear the file input
          event.target.value = '';
        }
      };

      const handleFileRemove = (fileId) => {
        setUploadedFiles(prev => prev.filter(file => file.fileId !== fileId));
      };

      const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      // Ref and state for hiding the heading on scroll
      const formRef = useRef(null);
      const [scrolled, setScrolled] = useState(false);

      useEffect(() => {
        const handleScroll = () => {
          if (formRef.current.scrollTop > 10) {
            setScrolled(true);
          } else {
            setScrolled(false);
          }
        };

        const formEl = formRef.current;
        formEl.addEventListener('scroll', handleScroll);

        return () => formEl.removeEventListener('scroll', handleScroll);
      }, []);

      return (
      <div className="w-full h-full bg-gradient-to-b from-blue-100 to-blue-300 flex flex-col relative overflow-hidden rounded-3xl shadow-2xl">

            {/* Status Bar */}
            <div className="flex justify-between items-center px-6 py-3 text-black font-medium">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
                <div className="w-6 h-3 border border-black rounded-sm">
                  <div className="w-4 h-2 bg-black rounded-sm m-0.5"></div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center py-6">
              <h1 className="text-2xl font-bold text-black">Travel Warrant</h1>
            </div>

            {/* Form Container with Scrolling */}
            <div ref={formRef} className="flex-1 px-6 overflow-hidden">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-lg h-full overflow-y-auto">
                {/* Conditionally render the heading */}
                {!scrolled && (
                  <h2 className="text-lg font-semibold text-black mb-6 py-2">
                    Personal Information
                  </h2>
                )}

                <div className="space-y-5 pb-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder=""
                    />
                  </div>

                  {/* Pension/W.&O.P No */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Pension/W.&O.P No
                    </label>
                    <input
                      type="text"
                      value={formData.pensionNumber}
                      onChange={(e) => handleInputChange('pensionNumber', e.target.value)}
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder=""
                    />
                  </div>

                  {/* Place Of payment pension */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Place Of payment pension:
                    </label>
                    <input
                      type="text"
                      value={formData.paymentPlace}
                      onChange={(e) => handleInputChange('paymentPlace', e.target.value)}
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder=""
                    />
                  </div>

                  {/* Date of retirement */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Date of retirement
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.retirementDate}
                        onChange={(e) => handleInputChange('retirementDate', e.target.value)}
                        className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                    </div>
                  </div>

                  {/* Annual salary at date of retirement */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Annual salary at date of retirement
                    </label>
                    <input
                      type="text"
                      value={formData.annualSalary}
                      onChange={(e) => handleInputChange('annualSalary', e.target.value)}
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder=""
                    />
                  </div>

                  <div>
  <label className="block text-sm font-medium text-black mb-2">
    GS Division:
  </label>
  <select
    value={formData.gsDivision}
    onChange={(e) =>
      handleInputChange('gsDivision', e.target.value)
    }
    className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <option value="">Select GS Division</option>
    <option value="Colombo">Colombo</option>
    <option value="Gampaha">Gampaha</option>
    <option value="Kandy">Kandy</option>
    <option value="Jaffna">Jaffna</option>
    <option value="Galle">Galle</option>
    <option value="Trincomalee">Trincomalee</option>
    <option value="Kandy">Kandy</option>
    <option value="Batticaloa">Batticaloa</option>
    <option value="Ampara">Ampara</option>
  </select>
</div>

                  

                  {/* Class Of travel */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Class Of travel you were entitled to at the date of retirement
                    </label>
                    <select
                      value={formData.travelClass}
                      onChange={(e) => handleInputChange('travelClass', e.target.value)}
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select class</option>
                      <option value="first">First Class</option>
                      <option value="business">Business Class</option>
                      <option value="economy">Economy Class</option>
                    </select>
                  </div>

                  {/* Current Marital status */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Current Marital status
                    </label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>

                  {/* Ticket Type */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      State whether you require ordinary single or ordinary return
                    </label>
                    <select
                      value={formData.ticketType}
                      onChange={(e) => handleInputChange('ticketType', e.target.value)}
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select ticket type</option>
                      <option value="ordinary-single">Ordinary Single</option>
                      <option value="ordinary-return">Ordinary Return</option>
                    </select>
                  </div>

                  {/* Car Type */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Sleeperette / Sleeping Car / Observation Car
                    </label>
                    <select
                      value={formData.carType}
                      onChange={(e) => handleInputChange('carType', e.target.value)}
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select car type</option>
                      <option value="sleeperette">Sleeperette</option>
                      <option value="sleeping-car">Sleeping Car</option>
                      <option value="observation-car">Observation Car</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  {/* Name of Dependant children */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Name of Dependant children
                    </label>
                    <textarea
                      value={formData.dependantChildren}
                      onChange={(e) => handleInputChange('dependantChildren', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      placeholder="Enter names of dependent children (one per line)"
                    />
                  </div>

                  {/* Age of Dependant children */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Age of Dependant children
                    </label>
                    <textarea
                      value={formData.childrenAges}
                      onChange={(e) => handleInputChange('childrenAges', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      placeholder="Enter ages corresponding to the children above (one per line)"
                    />
                  </div>

                  {/* Journey Details Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-black mb-4">
                      Journey Details
                    </h3>
                    
                    {/* From Station */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        From Station
                      </label>
                      <input
                        type="text"
                        value={formData.fromStation}
                        onChange={(e) => handleInputChange('fromStation', e.target.value)}
                        className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder=""
                      />
                    </div>

                    {/* To Station */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        To Station
                      </label>
                      <input
                        type="text"
                        value={formData.toStation}
                        onChange={(e) => handleInputChange('toStation', e.target.value)}
                        className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder=""
                      />
                    </div>

                    {/* Date Of Outward Journey */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        Date Of Outward Journey
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.outwardJourneyDate}
                          onChange={(e) => handleInputChange('outwardJourneyDate', e.target.value)}
                          className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                      </div>
                    </div>

                    {/* Date of Return Journey */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        Date of Return Journey
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.returnJourneyDate}
                          onChange={(e) => handleInputChange('returnJourneyDate', e.target.value)}
                          className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                      </div>
                    </div>

                    {/* Priority Level */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        Priority Level
                      </label>
                      <select
                        value={formData.priorityLevel}
                        onChange={(e) => handleInputChange('priorityLevel', e.target.value)}
                        className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select priority level</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    {/* Appointment Date */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        Appointment Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.appointmentDate}
                          onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                          className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                      </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        Time Slot
                      </label>
                      <select
                        value={formData.appointmentTime}
                        onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                        className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={!formData.appointmentDate || loadingTimeSlots}
                      >
                        <option value="">
                          {loadingTimeSlots ? 'Loading time slots...' : 'Select time slot'}
                        </option>
                        {timeSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                      {!formData.appointmentDate && !loadingTimeSlots && (
                        <p className="text-xs text-gray-600 mt-1">Please select an appointment date first</p>
                      )}
                      {loadingTimeSlots && (
                        <p className="text-xs text-blue-600 mt-1">Loading available time slots...</p>
                      )}
                    </div>
                  </div>

                  {/* Supporting Documents Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-black mb-4">
                      Supporting Documents
                    </h3>
                    
                    {/* File Upload Area */}
                    <div 
                      onClick={handleFileUpload}
                      className={`w-full border-2 border-dashed border-gray-400 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors bg-white/20 backdrop-blur-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-700 text-sm">
                        {uploading ? 'Uploading...' : 'Click to upload PDF documents'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Only PDF files are allowed</p>
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-black mb-2">Uploaded Documents:</h4>
                        {uploadedFiles.map((file) => (
                          <div key={file.fileId} className="flex items-center justify-between p-3 bg-white/30 backdrop-blur-sm rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-red-600">PDF</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-black truncate max-w-48">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileRemove(file.fileId);
                              }}
                              className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* If Spouse is also a Pensioner Section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-black mb-4">
                      If Spouse is also a Pensioner
                    </h3>
                    
                    {/* Spouse Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        Spouse Name
                      </label>
                      <input
                        type="text"
                        value={formData.spouseName}
                        onChange={(e) => handleInputChange('spouseName', e.target.value)}
                        className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder=""
                      />
                    </div>

                    {/* Department of which spouse is employed */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        Department of which spouse is employed
                      </label>
                      <input
                        type="text"
                        value={formData.spouseDepartment}
                        onChange={(e) => handleInputChange('spouseDepartment', e.target.value)}
                        className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-lg border-0 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder=""
                      />
                    </div>

                    {/* Checkbox */}
                    <div className="mb-6">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.informationAccurate}
                          onChange={(e) => handleInputChange('informationAccurate', e.target.checked)}
                          className="mt-1 w-4 h-4 text-blue-600 bg-white/30 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-black leading-5">
                          I confirm that all information provided is accurate and complete
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Navigation Buttons */}
            <div className="px-6 py-4 space-y-3">
              <button
                onClick={handleBack}
                className="w-full py-3 bg-white/30 backdrop-blur-sm rounded-full text-black font-medium hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Back
              </button>
              <button
                onClick={handleCancelRequest}
                className="w-full py-3 bg-white/30 backdrop-blur-sm rounded-full text-black font-medium hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Cancel the Request
              </button>
              <button
                onClick={handleSubmitRequest}
                className="w-full py-3 bg-white/30 backdrop-blur-sm rounded-full text-black font-medium hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Submit the Request
              </button>
            </div>

            {/* Home Indicator */}
            <div className="flex justify-center pb-2">
              <div className="w-32 h-1 bg-black/30 rounded-full"></div>
            </div>
          </div>
        
      );  
    }
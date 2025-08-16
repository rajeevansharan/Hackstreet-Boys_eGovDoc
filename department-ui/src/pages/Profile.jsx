import React, { useState, useRef } from 'react';
import { FaUser, FaPhone, FaIdCard, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';
import PasswordChangeModal from '../components/PasswordChangeModel'; 

const OfficerProfile = () => {
  const user = {
    fullName: 'Alexa Rawles',
    email: 'gs@gmail.com',
    nic: '123456789V',
    gender: 'Female',
    phone: '0712345678',
    officeAddress: 'No 12, Main Street, Colombo',
    gsDivision: 'Colombo North',
    dsDivision: 'Colombo DS',
    role: 'DS',
    profileImage: null
  };

  const [officerData, setOfficerData] = useState(user);
  const [formData, setFormData] = useState({
    phone: user.phone,
    officeAddress: user.officeAddress,
    email: user.email,
    profileImage: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Define which fields are editable for each role
  const editableFields = {
    GS: ['phone', 'officeAddress', 'email'],
    DS: ['phone', 'officeAddress', 'email', 'dsDivision']
  };

  const infoItems = [
    { key: 'nic', icon: <FaIdCard className="text-black text-xl" />, label: 'NIC Number' },
    { key: 'gender', icon: <FaUser className="text-black text-xl" />, label: 'Gender' },
    { key: 'phone', icon: <FaPhone className="text-black text-xl" />, label: 'Phone Number' },
    { key: 'officeAddress', icon: <FaMapMarkerAlt className="text-black text-xl" />, label: 'Office Address' },
    { key: 'dsDivision', icon: <FaMapMarkerAlt className="text-black text-xl" />, label: 'DS Division Name' },
    { key: 'gsDivision', icon: <FaMapMarkerAlt className="text-black text-xl" />, label: 'GS Division Name' },
  ];

  const allInfoItems = [
    { key: 'email', icon: <FaUser className="text-black text-xl" />, label: 'Email' },
    ...infoItems
  ];

  const displayedFields = officerData.role === 'DS'
    ? allInfoItems.filter(item => item.key !== 'gsDivision')
    : allInfoItems.filter(item => item.key !== 'dsDivision');

  
  const validatePhone = (phone) => {
    const phoneRegex = /^07\d{8}$/;
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(phone)) return 'Phone number must be in format 07XXXXXXXX';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateAddress = (address) => {
    if (!address) return 'Office address is required';
    if (address.length < 10) return 'Address must be at least 10 characters long';
    return '';
  };

  const validateForm = () => {
    const errors = {};
    
    errors.phone = validatePhone(formData.phone);
    errors.email = validateEmail(formData.email);
    errors.officeAddress = validateAddress(formData.officeAddress);

    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
 
    if (formErrors[key]) {
      setFormErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, JPEG, or PNG)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const handleEditClick = () => {
    setFormData({
      phone: officerData.phone,
      officeAddress: officerData.officeAddress,
      email: officerData.email,
      profileImage: null
    });
    setFormErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      phone: officerData.phone,
      officeAddress: officerData.officeAddress,
      email: officerData.email,
      profileImage: null
    });
    setFormErrors({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Please fix the validation errors before saving.');
      return;
    }

    setIsLoading(true);

    try {
      
      const formDataToSend = new FormData();
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('officeAddress', formData.officeAddress);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('userId', officerData.nic); 
      
      // Add image if selected
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      // API call to backend
      const response = await axios.put(
      "/api/officer/update-profile",
      formDataToSend
      );


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update local state with response data
      setOfficerData(prev => ({
        ...prev,
        phone: formData.phone,
        officeAddress: formData.officeAddress,
        email: formData.email,
        profileImage: result.profileImageUrl || prev.profileImage
      }));

      setIsEditing(false);
      alert('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordChangeSuccess = (message) => {
    alert(message);
  };

  const isFieldEditable = (fieldKey) => {
    return editableFields[officerData.role]?.includes(fieldKey);
  };

  const getProfileImageSrc = () => {
    if (formData.profileImage) {
      return URL.createObjectURL(formData.profileImage);
    }
    if (officerData.profileImage) {
      return officerData.profileImage;
    }
    return `https://ui-avatars.com/api/?name=${officerData.fullName}&background=000&color=fff&size=128`;
  };

  const getFormValue = (key) => {
    if (isEditing && isFieldEditable(key)) {
      return formData[key];
    }
    return officerData[key];
  };

  return (
    <div className="h-dvh bg-white grid place-items-center p-8">
      <div className="max-w-6xl w-full bg-white shadow-lg rounded-lg p-5 grid gap-6">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Welcome {officerData.fullName}: {officerData.role === 'GS' ? 'GS Officer' : 'DS Officer'}
          </h2>
        </div>

        <div className="grid justify-items-center">
          <div className="relative">
            <img
              className="w-32 h-32 rounded-full border-4 border-black object-cover"
              src={getProfileImageSrc()}
              alt="Profile"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${officerData.fullName}&background=000&color=fff&size=128`;
              }}
            />
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
                title="Change Profile Picture"
              >
                <FaCamera size={12} />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <h3 className="text-xl font-semibold">{officerData.fullName}</h3>
          <p className="text-gray-600">{getFormValue('email')}</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {displayedFields.map((item, index) => (
            <div
              key={index}
              className="col-span-12 sm:col-span-6 md:col-span-4 grid grid-cols-[auto_1fr] items-center gap-3 p-4 bg-gray-100 rounded shadow"
            >
              {item.icon}
              <div>
                <p className="text-gray-500 text-sm">{item.label}</p>
                {isEditing && isFieldEditable(item.key) ? (
                  <div>
                    {item.key === 'officeAddress' ? (
                      <textarea
                        value={formData[item.key]}
                        onChange={(e) => handleInputChange(item.key, e.target.value)}
                        className={`border rounded px-2 py-1 w-full resize-none ${
                          formErrors[item.key] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        rows="2"
                      />
                    ) : (
                      <input
                        type={item.key === 'email' ? 'email' : item.key === 'phone' ? 'tel' : 'text'}
                        value={formData[item.key]}
                        onChange={(e) => handleInputChange(item.key, e.target.value)}
                        className={`border rounded px-2 py-1 w-full ${
                          formErrors[item.key] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder={item.key === 'phone' ? '07XXXXXXXX' : ''}
                      />
                    )}
                    {formErrors[item.key] && (
                      <p className="text-red-500 text-xs mt-1">{formErrors[item.key]}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{getFormValue(item.key)}</p>
                    {isEditing && !isFieldEditable(item.key) && (
                      <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                        Read-only
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isEditing ? (
            <>
              <button
                className={`text-white px-6 py-2 rounded transition cursor-pointer ${
                  isLoading 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save'
                )}
              </button>
              <button
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition cursor-pointer"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="bg-black text-orange-500 px-6 py-2 rounded hover:bg-orange-500 hover:text-black transition cursor-pointer"
                onClick={handleChangePassword}
                disabled={isLoading}
              >
                Change Password
              </button>
            </>
          ) : (
            <>
              <button
                className="bg-black text-orange-500 px-6 py-2 rounded hover:bg-orange-500 hover:text-black transition cursor-pointer"
                onClick={handleEditClick}
              >
                Edit
              </button>
              <button
                className="bg-black text-orange-500 px-6 py-2 rounded hover:bg-orange-500 hover:text-black transition cursor-pointer"
                onClick={handleChangePassword}
              >
                Change Password
              </button>
            </>
          )}
        </div>

        {/* Info message about editable fields */}
        {isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
            <strong>Note:</strong> Only phone number, office address, and email can be edited. 
          </div>
        )}
      </div>

      {/* Password Change Modal Component */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordChangeSuccess}
        userEmail={getFormValue('email')}
      />
    </div>
  );
};
export default OfficerProfile;
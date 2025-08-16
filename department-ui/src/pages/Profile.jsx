import React, { useState } from 'react';
import { FaUser, FaPhone, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa';
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
    role: 'GS'
  };

  const [officerData, setOfficerData] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const infoItems = [
    { key: 'nic', icon: <FaIdCard className="text-black text-xl" />, label: 'NIC Number' },
    { key: 'gender', icon: <FaUser className="text-black text-xl" />, label: 'Gender' },
    { key: 'phone', icon: <FaPhone className="text-black text-xl" />, label: 'Phone Number' },
    { key: 'officeAddress', icon: <FaMapMarkerAlt className="text-black text-xl" />, label: 'Office Address' },
    { key: 'dsDivision', icon: <FaMapMarkerAlt className="text-black text-xl" />, label: 'DS Division Name' },
    { key: 'gsDivision', icon: <FaMapMarkerAlt className="text-black text-xl" />, label: 'GS Division Name' },
  ];

  const displayedFields =
    officerData.role === 'DS'
      ? infoItems.filter(item => item.key !== 'gsDivision')
      : infoItems.filter(item => item.key !== 'dsDivision');

  const handleChange = (key, value) => {
    setOfficerData(prev => ({ ...prev, [key]: value }));
  };

  const handleEditClick = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => {
    setIsEditing(false);
    console.log('Saved data:', officerData);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordChangeSuccess = (message) => {
    alert(message); // we can use a toast notification
   
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
          <img
            className="w-32 h-32 rounded-full border-4 border-black"
            src={`https://ui-avatars.com/api/?name=${officerData.fullName}&background=000&color=fff&size=128`}
            alt="Profile"
          />
          <h3 className="text-xl font-semibold">{officerData.fullName}</h3>
          <p className="text-gray-600">{officerData.email}</p>
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
                {isEditing ? (
                  <input
                    type="text"
                    value={officerData[item.key]}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="font-medium">{officerData[item.key]}</p>
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
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition cursor-pointer"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition cursor-pointer"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="bg-black text-orange-500 px-6 py-2 rounded hover:bg-orange-500 hover:text-black transition cursor-pointer"
                onClick={handleChangePassword}
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
      </div>

      {/* Password Change Modal Component */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordChangeSuccess}
        userEmail={officerData.email}
      />
    </div>
  );
};

export default OfficerProfile;


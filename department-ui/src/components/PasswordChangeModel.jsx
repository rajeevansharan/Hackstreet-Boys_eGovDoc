import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { RxCrossCircled } from 'react-icons/rx';

const PasswordChangeModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  userEmail 
}) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
    }
  }, [isOpen]);

  // Password validation
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter');
    if (!/\d/.test(password)) errors.push('At least 1 number');
    return errors;
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));

    // Clear errors on typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: null }));
    }

    // Real-time validation for new password
    if (field === 'newPassword') {
      const errors = validatePassword(value);
      if (errors.length > 0) setPasswordErrors(prev => ({ ...prev, newPassword: errors }));
    }

    // Check password match
    if (field === 'confirmPassword' || field === 'newPassword') {
      const newPass = field === 'newPassword' ? value : passwordData.newPassword;
      const confirmPass = field === 'confirmPassword' ? value : passwordData.confirmPassword;
      if (confirmPass && newPass !== confirmPass) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (confirmPass && newPass === confirmPass) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: null }));
      }
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  //Password change submission 
  const submitPasswordChange = async () => {
    const errors = {};

    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';

    if (!passwordData.newPassword) errors.newPassword = 'New password is required';
    else {
      const passwordValidationErrors = validatePassword(passwordData.newPassword);
      if (passwordValidationErrors.length > 0) errors.newPassword = passwordValidationErrors;
    }

    if (!passwordData.confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    else if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsChangingPassword(true);

    try {
      // API call here
      if(onSuccess) onSuccess();
    } catch (error) {
      setPasswordErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleClose = () => {
    if (!isChangingPassword) onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isChangingPassword]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4">
        <RxCrossCircled
          className="absolute right-4 top-4 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
          size={24}
          onClick={handleClose}
        />

        <h3 className="text-xl font-semibold mb-4">Change Password</h3>

        {userEmail && (
          <p className="text-sm text-gray-600 mb-4">
            Changing password for: <span className="font-medium">{userEmail}</span>
          </p>
        )}

        {passwordErrors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {passwordErrors.general}
          </div>
        )}

        <div className="space-y-3">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                className={`w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter current password"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isChangingPassword}
              >
                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="text-red-500 text-sm mt-1 min-h-[1.25rem]">
              {passwordErrors.currentPassword && <p>{passwordErrors.currentPassword}</p>}
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                className={`w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isChangingPassword}
              >
                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="text-red-500 text-sm mt-1 min-h-[2.5rem]">
              {passwordErrors.newPassword &&
                (Array.isArray(passwordErrors.newPassword) ? (
                  <ul className="list-disc list-inside">
                    {passwordErrors.newPassword.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{passwordErrors.newPassword}</p>
                ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                className={`w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isChangingPassword}
              >
                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="text-red-500 text-sm mt-1 min-h-[1.25rem]">
              {passwordErrors.confirmPassword && <p>{passwordErrors.confirmPassword}</p>}
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
            <p className="font-semibold mb-1">Password Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li className={passwordData.newPassword.length >= 8 ? 'text-green-600 font-medium' : ''}>
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600 font-medium' : ''}>
                At least 1 uppercase letter
              </li>
              <li className={/\d/.test(passwordData.newPassword) ? 'text-green-600 font-medium' : ''}>
                At least 1 number
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={handleClose}
              disabled={isChangingPassword}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={submitPasswordChange}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;

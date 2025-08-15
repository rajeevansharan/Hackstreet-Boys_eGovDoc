import { useState } from "react";
import { FaCamera } from "react-icons/fa";

export default function AccountPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleLogout = () => {
    alert("Logged out!");
  };

  const handleSave = () => {
    alert("Changes saved!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 border border-white/30 bg-white/20 shadow-lg backdrop-blur-md rounded-3xl">
        {/* Top Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Account</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            Log out
          </button>
        </div>

        {/* Profile Image */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <img
            src={profileImage || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border"
          />
          <label
            htmlFor="profileImageInput"
            className="absolute bottom-1 right-1 bg-gray-800 text-white p-2 rounded-full cursor-pointer"
          >
            <FaCamera size={14} />
          </label>
          <input
            id="profileImageInput"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
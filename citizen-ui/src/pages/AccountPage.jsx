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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/20 p-6 shadow-lg backdrop-blur-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Account</h1>
          <button
            onClick={handleLogout}
            className="rounded-full bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Log out
          </button>
        </div>

        <div className="relative mx-auto mb-6 h-28 w-28">
          <img
            src={profileImage || "https://via.placeholder.com/150"}
            alt="Profile"
            className="h-full w-full rounded-full border object-cover"
          />
          <label
            htmlFor="profileImageInput"
            className="absolute right-1 bottom-1 cursor-pointer rounded-full bg-gray-800 p-2 text-white"
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

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full rounded-full bg-blue-500 py-2 text-white hover:bg-blue-600"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

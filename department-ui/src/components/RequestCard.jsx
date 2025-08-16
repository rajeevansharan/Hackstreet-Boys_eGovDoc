"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiCheck,
  FiX,
} from "react-icons/fi";

export default function GSRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const gsHandlerId = "689f1e8cfe6d4adef66818ca"; 

  // Fetch requests on page load
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/gs/requests/${gsHandlerId}`
        );
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Handle confirm/cancel actions
  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:8000/requests/${id}/status`, {
        status,
      });
      setRequests((prev) =>
        prev.filter((req) => req._id !== id) 
      );
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  if (loading) return <p className="p-4 text-lg">Loading requests...</p>;

  return (
    <div className="h-dvh bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Pending Warrant Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-gray-600">No pending requests.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white shadow-md rounded-2xl p-6 border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Railway Warrant
              </h2>

              <div className="space-y-2 text-gray-600">
                <p className="flex items-center gap-2">
                  <FiUser className="text-blue-500" />
                  <span className="font-medium">Request ID:</span> {req._id}
                </p>
                <p className="flex items-center gap-2">
                  <FiUser className="text-green-500" />
                  <span className="font-medium">Pension No:</span>{" "}
                  {req.pension_no || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <FiMapPin className="text-red-500" />
                  <span className="font-medium">Payment Place:</span>{" "}
                  {req.place_of_payment || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <FiCalendar className="text-purple-500" />
                  <span className="font-medium">Retirement Date:</span>{" "}
                  {req.date_of_retirement || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <FiDollarSign className="text-yellow-500" />
                  <span className="font-medium">Annual Salary:</span>{" "}
                  {req.annual_salary || "N/A"}
                </p>
              </div>

            
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleStatusChange(req._id, "confirmed")}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition"
                >
                  <FiCheck /> Confirm
                </button>
                <button
                  onClick={() => handleStatusChange(req._id, "cancelled")}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
                >
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

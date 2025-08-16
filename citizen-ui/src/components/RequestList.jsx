import axios from "axios";
import { useEffect, useMemo, useState } from "react";

function normalizeStatus(s) {
  return (s ?? "unknown").toString().trim().toLowerCase();
}

const LABEL_TO_STATUS = {
  All: "all",
  Completed: "completed",
  Submitted: "submitted",
  Rejected: "rejected",
};

export default function RequestsList({ serviceId, userId, activeLabel }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!serviceId || !userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErr(null);
        const url = `http://localhost:8000/appointments/get-request-users/${encodeURIComponent(serviceId)}/${encodeURIComponent(userId)}`;
        const { data } = await axios.get(url);
        const normalized = Array.isArray(data)
          ? data.map((r) => ({ ...r, status: normalizeStatus(r.status) }))
          : [];
        setData(normalized);
      } catch (e) {
        console.error(e);
        setErr(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 10_000);
    return () => clearInterval(id);
  }, [serviceId, userId]);

  const filtered = useMemo(() => {
    if (LABEL_TO_STATUS[activeLabel] === "all") return data;
    const want = LABEL_TO_STATUS[activeLabel];
    return data.filter((r) => normalizeStatus(r.status) === want);
  }, [data, activeLabel]);

  if (loading)
    return <div className="px-4 py-3 text-sm text-gray-600">Loading…</div>;
  if (err)
    return (
      <div className="px-4 py-3 text-sm text-red-600">
        Failed to load requests.
      </div>
    );
  if (filtered.length === 0)
    return <div className="px-4 py-3 text-sm text-gray-600">No requests.</div>;

  return (
    <div className="mt-4 flex flex-col gap-4 overflow-auto">
      {filtered.map((req) => (
        <div
          key={req._id}
          className="mx-[10px] flex flex-col gap-2 rounded-3xl p-4 shadow-[0px_10px_20px_0px_rgba(0,_0,_0,_0.15)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold">Request ID</h3>
              <p className="text-xs text-gray-600">{req._id}</p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                req.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : req.status === "submitted"
                    ? "bg-blue-100 text-blue-700"
                    : req.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
              }`}
            >
              {req.status?.toUpperCase() || "UNKNOWN"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500">Service</span>
              <span className="font-medium">{req.service_id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">User</span>
              <span className="font-medium">{req.user_Id || req.userId}</span>
            </div>
            {req.title && (
              <div className="col-span-2 flex flex-col">
                <span className="text-gray-500">Title</span>
                <span className="font-medium">{req.title}</span>
              </div>
            )}
            {req.createdAt && (
              <div className="flex flex-col">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">
                  {new Date(req.createdAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

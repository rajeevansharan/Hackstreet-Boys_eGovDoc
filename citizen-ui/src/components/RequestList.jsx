import axios from "axios";
import { useEffect, useMemo, useState } from "react";

function normalizeStatus(s) {
  return (s ?? "unknown").toString().trim().toLowerCase();
}

const LABEL_TO_STATUS = {
  All: "all",
  Completed: "completed",
  Pending: "pending",
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
          className="mx-[10px] flex flex-col gap-3 rounded-3xl bg-white/20 py-4 px-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,.45)] ring-1 ring-white/10 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold">{req.service_name}</h3>
              <p className="text-xs text-gray-600">Service ID: {req._id}</p>
            </div>
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                req.status === "completed"
                  ? "bg-gradient-to-b from-[#2F7496]/70 from-0% to-[#0F2530]/70 to-100% text-[#17C964] "
                  : req.status === "pending"
                    ? "bg-gradient-to-b from-[#2F7496]/70 from-0% to-[#0F2530]/70 to-100% text-[#F5A524]"
                    : req.status === "rejected"
                      ? "bg-gradient-to-b from-[#2F7496]/70 from-0% to-[#0F2530]/70 to-100% text-[#F05252]"
                      : "bg-gradient-to-b from-[#2F7496]/70 from-0% to-[#0F2530]/70 to-100% text-gray-700"
              }`}
            >
              {req.status?.toUpperCase() || "UNKNOWN"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex">
              <span className="font-medium text-gray-700">
                {String(req?.created_at).slice(0, 10)}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700">
                User ID: {req.user_Id}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

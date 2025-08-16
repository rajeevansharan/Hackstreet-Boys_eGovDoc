import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    nic: "",
    password: "",
    confirm_password: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  function update(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          nic: form.nic.trim(),
          password: form.password,
          confirm_password: form.confirm_password,
          address: form.address,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.detail || data.message || "Signup failed");
      setSuccess(
        "Verification code sent to your email. Redirecting to phone verification...",
      );
      // Navigate to phone number entry page
      navigate("/enter-phone", { replace: true });
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const disabled =
    loading ||
    !form.username.trim() ||
    !form.email.trim() ||
    !form.nic.trim() ||
    !form.password ||
    !form.confirm_password ||
    !form.address;

  return (
    <div className="mx-auto flex h-full w-full max-w-[430px] flex-col px-6 py-8">
      <header className="py-4 text-center text-4xl font-semibold tracking-tight">
        eGovDoc
      </header>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-center text-2xl font-bold">
          Enter Your Details
        </h1>
        <div className="flex flex-1 items-start pt-4">
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-5 rounded-[40px] border border-black/25 bg-black/5 px-7 pt-8 pb-10 shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_4px_20px_rgba(0,0,0,.15)]"
          >
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium opacity-90">Username</span>
              <input
                type="text"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                autoComplete="username"
                className="rounded-xl border border-black/40 bg-white/70 px-4 py-3 text-base outline-none placeholder:opacity-50 focus:border-[#2F7496] focus:bg-white"
                placeholder="Username"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium opacity-90">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
                className="rounded-xl border border-black/40 bg-white/70 px-4 py-3 text-base outline-none placeholder:opacity-50 focus:border-[#2F7496] focus:bg-white"
                placeholder="Email"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium opacity-90">NIC Number</span>
              <input
                type="text"
                value={form.nic}
                onChange={(e) => update("nic", e.target.value)}
                className="rounded-xl border border-black/40 bg-white/70 px-4 py-3 text-base outline-none placeholder:opacity-50 focus:border-[#2F7496] focus:bg-white"
                placeholder="NIC"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium opacity-90">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                autoComplete="new-password"
                className="rounded-xl border border-black/40 bg-white/70 px-4 py-3 text-base outline-none placeholder:opacity-50 focus:border-[#2F7496] focus:bg-white"
                placeholder="Password"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium opacity-90">Confirm Password</span>
              <input
                type="password"
                value={form.confirm_password}
                onChange={(e) => update("confirm_password", e.target.value)}
                autoComplete="new-password"
                className="rounded-xl border border-black/40 bg-white/70 px-4 py-3 text-base outline-none placeholder:opacity-50 focus:border-[#2F7496] focus:bg-white"
                placeholder="Confirm Password"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium opacity-90">Address (District)</span>
              <select
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="rounded-xl border border-black/40 bg-white/70 px-4 py-3 text-base outline-none focus:border-[#2F7496] focus:bg-white"
                required
              >
                <option value="" disabled>
                  Select district
                </option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            {error && (
              <p className="rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-md border border-green-500 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                {success}
              </p>
            )}
            <button
              type="submit"
              disabled={disabled}
              className="mx-auto mt-2 w-full max-w-[240px] rounded-full bg-black px-8 py-4 text-lg font-bold text-white transition-colors disabled:cursor-not-allowed disabled:bg-black/50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
            <p className="pt-1 text-center text-xs font-medium opacity-70">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;

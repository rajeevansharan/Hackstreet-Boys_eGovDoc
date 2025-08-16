import { useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

// Department: Enter phone number for MFA. Backend endpoint optional.

export default function EnterPhoneNumber() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  const cleaned = phone.replace(/\D/g, "");
  const disabled = loading || cleaned.length < 9;

  async function handleSubmit(e) {
    e.preventDefault();
    if (disabled) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/request-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
        credentials: "include",
      }).catch(() => null);
      if (!res || !res.ok) {
        console.warn(
          "request-phone-otp endpoint missing; using mock OTP 123456",
        );
        sessionStorage.setItem("dept:mockOtp", "123456");
      }
      navigate("/verify-otp", { state: { phone: cleaned } });
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-6">
      <header className="flex items-center gap-3 py-2 text-3xl font-semibold">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-black transition hover:bg-black/10"
        >
          <IoChevronBack className="h-6 w-6" />
        </button>
        <span className="tracking-tight">eGovDoc Dept</span>
      </header>
      <div className="flex flex-1 items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-black/50 bg-black/10 px-6 py-10 text-center shadow-sm backdrop-blur"
        >
          <h1 className="mb-8 text-xl font-semibold">
            Enter Your Mobile Number
          </h1>
          <input
            type="tel"
            inputMode="tel"
            pattern="[0-9]*"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XXXXXXXX"
            className="mx-auto mb-6 block w-full rounded-xl border border-black/50 bg-white/70 px-4 py-3 text-base outline-none focus:border-[#2F7496]"
          />
          {error && (
            <p className="mb-4 rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={disabled}
            className="mx-auto block rounded-full border border-black bg-white px-10 py-3 text-lg font-semibold text-black transition enabled:hover:bg-black enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Confirm"}
          </button>
        </form>
      </div>
    </div>
  );
}

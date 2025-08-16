import { useState, useEffect } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, verified } = location.state || {};
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  // Redirect if not verified or no email
  useEffect(() => {
    if (!verified || !email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [verified, email, navigate]);

  const disabled = loading || !newPassword || !confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    if (disabled) return;
    setError("");
    setSuccess("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`${apiBase}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          new_password: newPassword,
          confirm_password: confirmPassword
        }),
      });
      
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || data.message || "Reset failed");
      }
      
      setSuccess("Password reset successful! Redirecting to login...");
      
      // Redirect to login after success
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[430px] flex-col px-6 py-6">
      <header className="flex items-center gap-3 py-2 text-3xl font-semibold">
        <button
          type="button"
          onClick={() => navigate("/login")}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-black transition hover:bg-black/10"
        >
          <IoChevronBack className="h-6 w-6" />
        </button>
        <span className="tracking-tight">eGovDoc</span>
      </header>
      <div className="flex flex-1 items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-black/50 bg-black/10 px-6 py-10 text-center shadow-sm backdrop-blur"
        >
          <h1 className="mb-8 text-xl font-semibold">Set New Password</h1>
          <div className="mb-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="mx-auto mb-4 block w-full rounded-xl border border-black/50 bg-white/70 px-4 py-3 text-base outline-none focus:border-[#2F7496]"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="mx-auto block w-full rounded-xl border border-black/50 bg-white/70 px-4 py-3 text-base outline-none focus:border-[#2F7496]"
              required
            />
          </div>
          {error && (
            <p className="mb-4 rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="mb-4 rounded-md border border-green-500 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              {success}
            </p>
          )}
          <button
            type="submit"
            disabled={disabled}
            className="mx-auto block rounded-full border border-black bg-white px-10 py-3 text-lg font-semibold text-black transition enabled:hover:bg-black enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
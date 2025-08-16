import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Department Portal Login Page
// Re-uses same backend contract as citizen login: POST /auth/login
// After successful login, go to /enter-phone for MFA (phone OTP) unless already verified later.

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.append("username", username.trim());
      form.append("password", password);
      form.append("grant_type", "");
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        body: form,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.detail || data.message || "Login failed");
      try {
        localStorage.setItem(
          "dept:user",
          JSON.stringify({ username: data.username, role: data.role }),
        );
      } catch {
        // ignore storage errors
      }
      navigate("/enter-phone", { replace: true });
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !username.trim() || !password;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8">
      <header className="py-4 text-center text-4xl font-semibold tracking-tight">
        eGovDoc Dept
      </header>
      <div className="flex flex-1 flex-col md:flex-row md:items-center md:gap-16">
        <div className="hidden flex-1 md:block">
          <h1 className="mb-4 text-3xl leading-tight font-bold">
            Welcome Back Officer
          </h1>
        </div>
        <div className="flex flex-1 items-center">
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-5 rounded-[40px] border border-black/25 bg-black/5 px-7 pt-8 pb-10 shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_4px_20px_rgba(0,0,0,.15)] md:max-w-md"
          >
            <h2 className="text-center text-lg font-semibold">
              Department Login
            </h2>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium opacity-90">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="rounded-xl border border-black/40 bg-white/70 px-4 py-3 text-base outline-none placeholder:opacity-50 focus:border-[#2F7496] focus:bg-white"
                placeholder="Enter your username"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium opacity-90">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="rounded-xl border border-black/40 bg-white/70 px-4 py-3 text-base outline-none placeholder:opacity-50 focus:border-[#2F7496] focus:bg-white"
                placeholder="Enter your password"
                required
              />
            </label>
            {error && (
              <p className="rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={disabled}
              className="mx-auto mt-2 w-full max-w-[240px] rounded-full bg-black px-8 py-4 text-lg font-bold text-white transition-colors disabled:cursor-not-allowed disabled:bg-black/50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
            <p className="pt-2 text-center text-xs font-medium opacity-70">
              Forgot Password?
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

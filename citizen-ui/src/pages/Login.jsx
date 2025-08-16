import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Assumptions:
// 1. API base URL exposed via Vite env VITE_API_BASE (fallback to http://localhost:8000)
// 2. Auth endpoint: POST /auth/login (OAuth2PasswordRequestForm) returns JSON { username, role, message }
// 3. Server sets httpOnly cookie; we only need to store username/role optionally in memory/localStorage

function Login() {
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
      // OAuth2 spec requires 'grant_type' but FastAPI's OAuth2PasswordRequestForm expects it optionally; include blank
      form.append("grant_type", "");
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        body: form,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include", // so cookie is stored
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || data.message || "Login failed");
      }
      // optional persistence
      try {
        localStorage.setItem(
          "egovdoc:user",
          JSON.stringify({ username: data.username, role: data.role }),
        );
      } catch {
        // ignore persistence errors (e.g., private mode)
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !username.trim() || !password;

  return (
    <div className="mx-auto flex h-full w-full max-w-[430px] flex-col px-6 py-8">
      <header className="py-4 text-center text-4xl font-semibold tracking-tight">
        eGovDoc
      </header>
      <h1 className="mt-6 text-center text-2xl font-bold">Welcome Back!</h1>
      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5 rounded-[40px] border border-black/25 bg-black/5 px-7 pt-8 pb-10 shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_4px_20px_rgba(0,0,0,.15)]"
      >
        <h2 className="text-center text-lg font-semibold">
          Log in to your account
        </h2>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium opacity-90">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="rounded-xl border border-black/40 bg-white/70 px-4 py-3 text-base ring-0 outline-none placeholder:opacity-50 focus:border-[#2F7496] focus:bg-white"
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
            className="rounded-xl border border-black/40 bg-white/70 px-4 py-3 text-base ring-0 outline-none placeholder:opacity-50 focus:border-[#2F7496] focus:bg-white"
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
      </form>
    </div>
  );
}

export default Login;

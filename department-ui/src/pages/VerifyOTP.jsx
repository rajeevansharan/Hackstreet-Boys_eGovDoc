import { useEffect, useRef, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

// Department: Verify OTP page that now works with email verification

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, phone, context } = location.state || {};
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  // Redirect if we don't have what we need
  useEffect(() => {
    if (!email && !phone) {
      navigate("/login", { replace: true });
    }
  }, [email, phone, navigate]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  function handleChange(idx, value) {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[idx] = value;
    setDigits(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0)
      inputsRef.current[idx - 1]?.focus();
  }

  const otp = digits.join("");
  const disabled = loading || otp.length !== 6;

  async function handleSubmit(e) {
    e.preventDefault();
    if (disabled) return;
    setError("");
    setLoading(true);
    
    try {
      let endpoint;
      
      if (context === "employee-login") {
        // Employee login verification
        endpoint = "/auth/employee-login-verify-otp";
      } else if (email) {
        // Email verification
        endpoint = "/auth/verify-phone-otp"; // Note: This should be renamed in your backend
      } else {
        // Phone verification
        endpoint = "/auth/verify-phone-otp";
      }
      
      const payload = email ? { email, otp } : { phone, otp };
      
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      }).catch(() => null);
      
      if (!res || !res.ok) {
        // Handle mock OTP for development (can be removed in production)
        const mockKey = email ? "dept:mockEmailOtp" : "dept:mockOtp";
        const mock = sessionStorage.getItem(mockKey);
        if (mock && mock === otp) {
          console.warn("Verification endpoint missing; accepted mock OTP");
        } else {
          throw new Error("Invalid OTP");
        }
      } else {
        // If we got a response, try to get user data
        const data = await res.json().catch(() => ({}));
        
        // Store user info after successful verification
        try {
          localStorage.setItem(
            "dept:user",
            JSON.stringify({ 
              username: data.username || JSON.parse(localStorage.getItem("dept:temp"))?.username, 
              role: data.role || "employee" 
            })
          );
          // Clean up temporary storage
          localStorage.removeItem("dept:temp");
        } catch (err) {
          console.error("Failed to store user data:", err);
        }
      }
      
      // Navigate to home on success
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  // Get title based on context
  const getTitle = () => {
    if (context === "employee-login") return "Department Login Verification";
    return email ? "Email Verification" : "Phone Verification";
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-6">
      <header className="flex items-center gap-3 py-2 text-3xl font-semibold">
        <button
          type="button"
          onClick={() => navigate("/login")}
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
          <h1 className="mb-8 text-xl font-semibold">{getTitle()}</h1>
          <p className="mb-6 text-sm text-gray-600">
            We've sent a verification code to {email || phone}
          </p>
          <div className="mb-8 flex justify-center gap-3">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-12 rounded-md border border-black/60 bg-white/80 text-center text-xl font-semibold outline-none focus:border-[#2F7496]"
              />
            ))}
          </div>
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
            {loading ? "Verifying..." : "Confirm"}
          </button>
        </form>
      </div>
    </div>
  );
}

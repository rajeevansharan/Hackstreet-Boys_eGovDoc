import { useEffect, useRef, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, phone, context } = location.state || {};
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  useEffect(() => {
    // Redirect if no email/phone or context is provided
    if (!email && !phone) {
      navigate("/login", { replace: true });
    }
  }, [email, phone, navigate]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Handle input changes
  function handleChange(idx, value) {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[idx] = value;
    setDigits(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  }

  const otp = digits.join("");
  const disabled = loading || otp.length !== 6;

async function handleSubmit(e) {
  e.preventDefault();
  if (disabled) return;
  setError("");
  setLoading(true);
  
  try {
    let endpoint, payload, successRedirect;
    
    // Different endpoints based on context
    switch (context) {
      case "login":
        endpoint = "/auth/login-verify-otp";
        payload = { email, otp };
        successRedirect = "/";
        break;
      case "register":
        endpoint = "/auth/verify-email";
        payload = { email, otp };
        // Don't set successRedirect yet
        break;
      case "reset-password":
        endpoint = "/auth/verify-reset-otp";
        payload = { email, otp };
        successRedirect = "/reset-password";
        break;
      case "phone-verification":
        endpoint = "/auth/verify-phone-otp";
        payload = { phone, otp };
        successRedirect = "/";
        break;
      default:
        throw new Error("Invalid verification context");
    }
    
    const res = await fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      throw new Error(data.detail || data.message || "Verification failed");
    }
    
    // Handle different contexts
    if (context === "login") {
      // Store user info in localStorage for auth purposes after successful login OTP
      try {
        localStorage.setItem(
          "egovdoc:user",
          JSON.stringify({ 
            username: data.username, 
            role: data.role || "citizen" 
          })
        );
        console.log("User data stored in localStorage:", data); // Debug log
      } catch (err) {
        console.error("Failed to store user data:", err);
      }
      
      // Navigate to home
      navigate("/", { replace: true });
    } else if (context === "register") {
      // Get stored user data from sessionStorage
      const userData = JSON.parse(sessionStorage.getItem("pendingRegistration"));
      
      if (!userData) {
        throw new Error("Registration data not found");
      }
      
      const completeRes = await fetch(`${apiBase}/auth/complete-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      
      const completeData = await completeRes.json().catch(() => ({}));
      
      if (!completeRes.ok) {
        throw new Error(completeData.detail || completeData.message || "Failed to complete registration");
      }
      
      sessionStorage.removeItem("pendingRegistration");
      
      try {
        localStorage.setItem(
          "egovdoc:user",
          JSON.stringify({ 
            username: completeData.username, 
            role: completeData.role || "citizen" 
          })
        );
        console.log("Registration complete, user stored:", completeData); // Debug log
      } catch (err) {
        console.error("Failed to store user data after registration:", err);
      }
      
      navigate("/", { replace: true });
    } else if (context === "reset-password") {
      navigate(successRedirect, { 
        state: { email, verified: true },
        replace: true 
      });
    } else {
      navigate(successRedirect, { replace: true });
    }
  } catch (err) {
    setError(err.message || "Verification failed");
  } finally {
    setLoading(false);
  }
}

  // Determine title based on context
  const getTitle = () => {
    switch (context) {
      case "login": return "Login Verification";
      case "register": return "Email Verification";
      case "reset-password": return "Password Reset Verification";
      case "phone-verification": return "Phone Verification";
      default: return "Enter Verification Code";
    }
  };

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
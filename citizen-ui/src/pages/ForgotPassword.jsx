import { useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1); // Step 1: Enter username, Step 2: Processing
  const [email, setEmail] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  const disabled = loading || !username.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    if (disabled) return;
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      // Step 1: Get user's email based on username
      const emailRes = await fetch(`${apiBase}/auth/get-user-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      
      const emailData = await emailRes.json().catch(() => ({}));
      if (!emailRes.ok) {
        throw new Error(emailData.detail || emailData.message || "Request failed");
      }
      
      // If we got the email
      if (emailData.email) {
        setEmail(emailData.email);
        setStep(2); // Move to processing step
        
        // Step 2: Send password reset OTP to the retrieved email
        const resetRes = await fetch(`${apiBase}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailData.email }),
        });
        
        const resetData = await resetRes.json().catch(() => ({}));
        if (!resetRes.ok) {
          throw new Error(resetData.detail || resetData.message || "Request failed");
        }
        
        setSuccess(`Verification code sent to your email (${maskEmail(emailData.email)})`);
        
        // Redirect to OTP verification after a brief delay
        setTimeout(() => {
          navigate("/verify-otp", { 
            state: { 
              email: emailData.email,
              context: "reset-password" 
            } 
          });
        }, 2000);
      } else {
        // This will happen if user doesn't exist, but we don't reveal this
        setSuccess("If your username is registered, you will receive a verification code");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  }
  
  // Function to mask email for privacy (e.g., j***@example.com)
  function maskEmail(email) {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '***';
    return `${maskedUsername}@${domain}`;
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
          <h1 className="mb-8 text-xl font-semibold">Reset Your Password</h1>
          
          {step === 1 ? (
            <>
              <p className="mb-6 text-sm text-gray-600">
                Enter your username and we'll send a verification code to your registered email.
              </p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="mx-auto mb-6 block w-full rounded-xl border border-black/50 bg-white/70 px-4 py-3 text-base outline-none focus:border-[#2F7496]"
                required
              />
            </>
          ) : (
            <p className="mb-6 text-sm text-gray-600">
              Processing your request...
            </p>
          )}
          
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
          
          {step === 1 && (
            <button
              type="submit"
              disabled={disabled}
              className="mx-auto block rounded-full border border-black bg-white px-10 py-3 text-lg font-semibold text-black transition enabled:hover:bg-black enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
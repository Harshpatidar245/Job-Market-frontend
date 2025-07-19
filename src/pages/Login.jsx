import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loginMode, setLoginMode] = useState("password"); // 'password', 'email_otp', 'phone_otp'
  const [otpTimer, setOtpTimer] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => timer - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
      return `+${cleaned}`;
    }
    return `+91${cleaned}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setFormData({ ...formData, otp: value });
    }
  };

  const handleSendEmailOtp = async () => {
    const email = formData.email.trim().toLowerCase();
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.post(`${VITE_BACKEND_URL}/api/auth/send-email-otp`, { email });

      if (response.data.success) {
        setOtpSent(true);
        setOtpTimer(60);
        setSuccess("OTP sent to your email successfully!");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      const errorMessage = err.response?.data?.message || "Failed to send OTP.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    const phone = formData.phone.trim();
    if (!phone) {
      setError("Please enter your phone number first.");
      return;
    }

    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
      setError("Please enter a valid Indian phone number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formattedPhone = formatPhoneNumber(phone);
      const response = await axios.post(`${VITE_BACKEND_URL}/auth/send-phone-otp`, {
        phone: formattedPhone,
      });

      if (response.data.success) {
        setOtpSent(true);
        setOtpTimer(60);
        setSuccess("OTP sent to your phone successfully!");
        
        // Show debug OTP in development
        if (response.data.debug_otp) {
          setSuccess(`OTP sent! Debug OTP: ${response.data.debug_otp}`);
        }
      }
    } catch (err) {
      console.error("Send phone OTP error:", err);
      const errorMessage = err.response?.data?.message || "Failed to send OTP.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpLogin = async () => {
    const email = formData.email.trim().toLowerCase();
    const otp = formData.otp.trim();

    if (!email || !otp) {
      setError("Email and OTP are required.");
      return;
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${VITE_BACKEND_URL}/auth/verify-email-otp`, { email, otp });

      if (response.data.success) {
        const { token, user } = response.data;
        login(token, user);
        setSuccess("Login successful! Redirecting...");
        
        // Redirect based on user role and profile completeness
        setTimeout(() => {
          if (user.role === 'job_seeker' && (!user.preferences || !user.preferences.jobRoles)) {
            navigate("/preferences");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      const errorMessage = err.response?.data?.message || "OTP verification failed.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtpLogin = async () => {
    const phone = formData.phone.trim();
    const otp = formData.otp.trim();

    if (!phone || !otp) {
      setError("Phone number and OTP are required.");
      return;
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formattedPhone = formatPhoneNumber(phone);
      const response = await axios.post(`${VITE_BACKEND_URL}/auth/verify-phone-otp`, {
        phone: formattedPhone,
        otp,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        login(token, user);
        setSuccess("Login successful! Redirecting...");
        
        // Redirect based on user role and profile completeness
        setTimeout(() => {
          if (user.role === 'job_seeker' && (!user.preferences || !user.preferences.jobRoles)) {
            navigate("/preferences");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Phone OTP verification error:", err);
      const errorMessage = err.response?.data?.message || "OTP verification failed.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await login(email, password);
      if (result.success) {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          if (result.user.role === 'job_seeker' && (!result.user.preferences || !result.user.preferences.jobRoles)) {
            navigate("/preferences");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loginMode === "email_otp") {
      return handleEmailOtpLogin();
    }
    
    if (loginMode === "phone_otp") {
      return handlePhoneOtpLogin();
    }
    
    // Password login
    return handlePasswordLogin();
  };

  const toggleLoginMode = (mode) => {
    setLoginMode(mode);
    setOtpSent(false);
    setOtpTimer(0);
    setFormData({ email: "", phone: "", password: "", otp: "" });
    setError("");
    setSuccess("");
  };

  const resendOtp = () => {
    if (loginMode === "email_otp") {
      handleSendEmailOtp();
    } else if (loginMode === "phone_otp") {
      handleSendPhoneOtp();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">🚀</div>
            <h1>Welcome Back</h1>
            <p>Sign in to your JobPortal account</p>
          </div>
        </div>

        <div className="auth-body">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Login Mode Selection */}
            <div className="login-mode-selector">
              <button
                type="button"
                className={`mode-btn ${loginMode === "password" ? "active" : ""}`}
                onClick={() => toggleLoginMode("password")}
              >
                <span className="mode-icon">🔑</span>
                Password
              </button>
              <button
                type="button"
                className={`mode-btn ${loginMode === "email_otp" ? "active" : ""}`}
                onClick={() => toggleLoginMode("email_otp")}
              >
                <span className="mode-icon">📧</span>
                Email OTP
              </button>
              <button
                type="button"
                className={`mode-btn ${loginMode === "phone_otp" ? "active" : ""}`}
                onClick={() => toggleLoginMode("phone_otp")}
              >
                <span className="mode-icon">📱</span>
                Phone OTP
              </button>
            </div>

            {/* Email Input */}
            {(loginMode === "password" || loginMode === "email_otp") && (
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}

            {/* Phone Input */}
            {loginMode === "phone_otp" && (
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  <span className="label-icon">📱</span>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  placeholder="+91 XXXXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Password Input */}
            {loginMode === "password" && (
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <span className="label-icon">🔒</span>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <div className="form-help">
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot your password?
                  </Link>
                </div>
              </div>
            )}

            {/* OTP Input and Send Button */}
            {(loginMode === "email_otp" || loginMode === "phone_otp") && (
              <div className="otp-section">
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">
                    <span className="label-icon">🔢</span>
                    Enter OTP
                  </label>
                  <div className="otp-input-group">
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      className="form-control otp-input"
                      value={formData.otp}
                      onChange={handleOtpChange}
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                    <button
                      type="button"
                      className="otp-send-btn"
                      onClick={
                        loginMode === "email_otp"
                          ? handleSendEmailOtp
                          : handleSendPhoneOtp
                      }
                      disabled={loading || otpTimer > 0}
                    >
                      {otpTimer > 0
                        ? `${otpTimer}s`
                        : otpSent
                        ? "Resend"
                        : "Send OTP"}
                    </button>
                  </div>
                </div>

                {otpSent && otpTimer === 0 && (
                  <div className="resend-section">
                    <p className="resend-text">Didn't receive the code?</p>
                    <button
                      type="button"
                      className="resend-btn"
                      onClick={resendOtp}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-auth"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Processing...
                </span>
              ) : loginMode === "email_otp" ? (
                "Verify Email OTP"
              ) : loginMode === "phone_otp" ? (
                "Verify Phone OTP"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
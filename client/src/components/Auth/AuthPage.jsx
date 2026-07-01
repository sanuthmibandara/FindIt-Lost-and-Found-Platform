import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errorMessages";
import {
  validateRegisterForm,
  validateLoginForm,
  validateForgotForm,
  validateResetForm,
} from "../../utils/validation";
import "./Auth.css";

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zm-7 8.7V17h2v-.3a2 2 0 1 0-2 0zM9 8V6a3 3 0 0 1 6 0v2H9z" />
  </svg>
);

const FindItIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
  </svg>
);

function AuthPage({ initialMode = "login" }) {
  const navigate = useNavigate();
  const { login, register, requestPasswordReset, completePasswordReset } =
    useAuth();
  const { toast } = useToast();

  const [isRegister, setIsRegister] = useState(initialMode === "register");
  const [view, setView] = useState("auth"); // auth | forgot | reset
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({
    email: "",
    resetToken: "",
    newPassword: "",
  });

  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [forgotErrors, setForgotErrors] = useState({});
  const [resetErrors, setResetErrors] = useState({});

  const [devResetCode, setDevResetCode] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = validateLoginForm(loginForm);
    setLoginErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(getErrorMessage(err, "Login failed. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const errors = validateRegisterForm(registerForm);
    setRegisterErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      await register(
        registerForm.name,
        registerForm.email,
        registerForm.password
      );
      toast.success("Account created! Please sign in.");
      setIsRegister(false);
      setLoginForm({ email: registerForm.email, password: "" });
      setRegisterForm({ name: "", email: "", password: "" });
      setRegisterErrors({});
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();

    const errors = validateForgotForm(forgotForm);
    setForgotErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const data = await requestPasswordReset(forgotForm.email);
      toast.info(data.message);
      if (data.resetToken) {
        setDevResetCode(data.resetToken);
        setResetForm((prev) => ({
          ...prev,
          email: data.email || forgotForm.email,
          resetToken: data.resetToken,
        }));
      }
      setView("reset");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not process your request."));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    const errors = validateResetForm(resetForm);
    setResetErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const data = await completePasswordReset(
        resetForm.email,
        resetForm.resetToken,
        resetForm.newPassword
      );
      toast.success(data.message);
      setView("auth");
      setIsRegister(false);
      setLoginForm({ email: resetForm.email, password: "" });
      setResetForm({ email: "", resetToken: "", newPassword: "" });
      setDevResetCode("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Password reset failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (view === "forgot" || view === "reset") {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-forgot-panel">
            <div className="auth-forgot-inner">
              {view === "forgot" ? (
                <>
                  <h1>Forgot Password</h1>
                  <p className="auth-subtitle">
                    Enter your email and we&apos;ll send you a reset code
                  </p>

                  <form className="auth-form" onSubmit={handleForgot}>
                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <EmailIcon />
                      </span>
                      <input
                        type="email"
                        placeholder="Email"
                        value={forgotForm.email}
                        onChange={(e) =>
                          setForgotForm({ email: e.target.value })
                        }
                        className={forgotErrors.email ? "input-error" : ""}
                      />
                      {forgotErrors.email && (
                        <p className="field-error">{forgotErrors.email}</p>
                      )}
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                      {loading ? "Sending..." : "GET RESET CODE"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h1>Reset Password</h1>
                  <p className="auth-subtitle">
                    Enter the code and your new password
                  </p>

                  {devResetCode && (
                    <div className="reset-code-box">
                      Dev mode — your reset code:
                      <strong>{devResetCode}</strong>
                      <small>
                        In production this would be sent to your email.
                      </small>
                    </div>
                  )}

                  <form className="auth-form" onSubmit={handleReset}>
                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <EmailIcon />
                      </span>
                      <input
                        type="email"
                        placeholder="Email"
                        value={resetForm.email}
                        onChange={(e) =>
                          setResetForm({ ...resetForm, email: e.target.value })
                        }
                        className={resetErrors.email ? "input-error" : ""}
                      />
                      {resetErrors.email && (
                        <p className="field-error">{resetErrors.email}</p>
                      )}
                    </div>

                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <LockIcon />
                      </span>
                      <input
                        type="text"
                        placeholder="Reset Code"
                        value={resetForm.resetToken}
                        onChange={(e) =>
                          setResetForm({
                            ...resetForm,
                            resetToken: e.target.value,
                          })
                        }
                        className={resetErrors.resetToken ? "input-error" : ""}
                      />
                      {resetErrors.resetToken && (
                        <p className="field-error">{resetErrors.resetToken}</p>
                      )}
                    </div>

                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <LockIcon />
                      </span>
                      <input
                        type="password"
                        placeholder="New Password"
                        value={resetForm.newPassword}
                        onChange={(e) =>
                          setResetForm({
                            ...resetForm,
                            newPassword: e.target.value,
                          })
                        }
                        className={
                          resetErrors.newPassword ? "input-error" : ""
                        }
                      />
                      {resetErrors.newPassword && (
                        <p className="field-error">
                          {resetErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                      {loading ? "Resetting..." : "RESET PASSWORD"}
                    </button>
                  </form>
                </>
              )}

              <button
                type="button"
                className="back-link"
                onClick={() => {
                  setView("auth");
                  setDevResetCode("");
                }}
              >
                &larr; Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className={`auth-container ${isRegister ? "register-active" : ""}`}>
        {/* Sign Up */}
        <div className="auth-form-container signup-container">
          <h1>Create Account</h1>
          <p className="auth-subtitle">or use your email for registration</p>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-input-group">
              <span className="auth-input-icon">
                <UserIcon />
              </span>
              <input
                type="text"
                placeholder="Name"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
                className={registerErrors.name ? "input-error" : ""}
              />
              {registerErrors.name && (
                <p className="field-error">{registerErrors.name}</p>
              )}
            </div>

            <div className="auth-input-group">
              <span className="auth-input-icon">
                <EmailIcon />
              </span>
              <input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                className={registerErrors.email ? "input-error" : ""}
              />
              {registerErrors.email && (
                <p className="field-error">{registerErrors.email}</p>
              )}
            </div>

            <div className="auth-input-group">
              <span className="auth-input-icon">
                <LockIcon />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    password: e.target.value,
                  })
                }
                className={registerErrors.password ? "input-error" : ""}
              />
              {registerErrors.password && (
                <p className="field-error">{registerErrors.password}</p>
              )}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing Up..." : "SIGN UP"}
            </button>
          </form>

          <div className="mobile-toggle">
            Already have an account?{" "}
            <button type="button" onClick={() => setIsRegister(false)}>
              LOGIN
            </button>
          </div>
        </div>

        {/* Sign In */}
        <div className="auth-form-container signin-container">
          <h1>Welcome Back!</h1>
          <p className="auth-subtitle">use your account to sign in</p>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-input-group">
              <span className="auth-input-icon">
                <EmailIcon />
              </span>
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                className={loginErrors.email ? "input-error" : ""}
              />
              {loginErrors.email && (
                <p className="field-error">{loginErrors.email}</p>
              )}
            </div>

            <div className="auth-input-group">
              <span className="auth-input-icon">
                <LockIcon />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                className={loginErrors.password ? "input-error" : ""}
              />
              {loginErrors.password && (
                <p className="field-error">{loginErrors.password}</p>
              )}
            </div>

            <button
              type="button"
              className="forgot-link"
              onClick={() => {
                setForgotForm({ email: loginForm.email });
                setView("forgot");
              }}
            >
              Forgot your password?
            </button>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing In..." : "SIGN IN"}
            </button>
          </form>

          <div className="mobile-toggle">
            New here?{" "}
            <button type="button" onClick={() => setIsRegister(true)}>
              REGISTER
            </button>
          </div>
        </div>

        {/* Overlay */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="overlay-panel overlay-left">
              <div className="auth-brand">
                <FindItIcon />
                <span>FindIt</span>
              </div>
              <h1>Already have an account?</h1>
              <p>
                To keep connected with us please login with your personal info
              </p>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setIsRegister(false)}
              >
                LOGIN
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <div className="auth-brand">
                <FindItIcon />
                <span>FindIt</span>
              </div>
              <h1>New here?</h1>
              <p>
                Enter your personal details and start your journey with FindIt
              </p>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setIsRegister(true)}
              >
                REGISTER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

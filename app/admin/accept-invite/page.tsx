"use client";

import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AcceptInvitePage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [linkError, setLinkError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("access_token") || "";
    setAccessToken(token);
    if (!token) setLinkError("This invitation link is invalid or expired. Ask a PaDC administrator to send a new invitation.");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken,
        password: String(formData.get("password") || ""),
        confirmation: String(formData.get("confirmation") || "")
      })
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(typeof result.error === "string" ? result.error : "Unable to activate your account.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-layout">
        <div className="admin-login-mission">
          <div className="admin-login-brand">Pa<span>DC</span> <small>Coop</small></div>
          <span className="admin-login-kicker">Board Member Invitation</span>
          <h1>Activate your leadership portal access.</h1>
          <p>Your account connects PaDC&apos;s operational workspace with your authorized board member record.</p>
          <div className="admin-login-benefits">
            <div><ShieldCheck size={20} /><span><strong>Protected access</strong>Your password is managed securely by Supabase Auth.</span></div>
            <div><KeyRound size={20} /><span><strong>Individual credentials</strong>Never share your password or invitation link.</span></div>
            <div><CheckCircle2 size={20} /><span><strong>Authorized membership</strong>Access remains tied to active board status.</span></div>
          </div>
        </div>

        <div className="admin-login-access">
          <form className="admin-login-form" onSubmit={onSubmit}>
            <span className="eyebrow">Secure Account Setup</span>
            <h2>Create your password</h2>
            <p>Use at least 12 characters with uppercase, lowercase, and numeric characters.</p>

            <label className="admin-login-field">
              <span>New password</span>
              <div className="admin-password-control">
                <input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <label className="admin-login-field">
              <span>Confirm password</span>
              <input name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required />
            </label>

            <button className="admin-login-submit" type="submit" disabled={loading || !accessToken}>
              {loading ? "Activating..." : "Activate account"} <ArrowRight size={18} />
            </button>
            {linkError || error ? <div className="status-message error" role="alert">{linkError || error}</div> : null}
          </form>
        </div>
      </section>
    </main>
  );
}

"use client";

import { ArrowRight, Car, CheckCircle2, Eye, EyeOff, Handshake, ShieldCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const cars = [
  { top: "8%", delay: "-2s", duration: "18s" },
  { top: "22%", delay: "-11s", duration: "24s" },
  { top: "39%", delay: "-6s", duration: "21s" },
  { top: "58%", delay: "-15s", duration: "27s" },
  { top: "73%", delay: "-4s", duration: "20s" },
  { top: "88%", delay: "-18s", duration: "25s" }
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"board_member" | "super_admin">("board_member");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        email: mode === "board_member" ? String(formData.get("email") || "") : "",
        password: String(formData.get("password") || "")
      })
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(typeof result.error === "string" ? result.error : "Unable to sign in.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-watermarks" aria-hidden="true">
        {cars.map((car, index) => (
          <div className="admin-login-car" key={index} style={{ top: car.top, animationDelay: car.delay, animationDuration: car.duration }}>
            <Car size={18} /> <span>PaDC Coop</span>
          </div>
        ))}
      </div>

      <section className="admin-login-layout">
        <div className="admin-login-mission">
          <div className="admin-login-brand">Pa<span>DC</span> <small>Coop</small></div>
          <span className="admin-login-kicker">Pennsylvania Driver Cooperative</span>
          <h1>Shared leadership for a driver-owned future.</h1>
          <p>
            The PaDC administration workspace helps trusted board members coordinate outreach, partnerships,
            member engagement, and the cooperative&apos;s path to launch.
          </p>
          <div className="admin-login-benefits">
            <div><Users size={20} /><span><strong>Driver-led governance</strong>Keep decisions accountable to working drivers.</span></div>
            <div><Handshake size={20} /><span><strong>Coordinated partnerships</strong>Manage community, funding, and institutional relationships.</span></div>
            <div><ShieldCheck size={20} /><span><strong>Protected operations</strong>Access is limited to authorized leadership and administrators.</span></div>
          </div>
          <div className="admin-login-trust"><CheckCircle2 size={17} /> Secure, role-aware access for PaDC leadership</div>
        </div>

        <div className="admin-login-access">
          <form className="admin-login-form" onSubmit={onSubmit}>
            <span className="eyebrow">Leadership Portal</span>
            <h2>Welcome back</h2>
            <p>Sign in to manage PaDC&apos;s operational dashboard.</p>

            <div className="admin-login-mode" aria-label="Sign-in method">
              <button type="button" className={mode === "board_member" ? "active" : ""} onClick={() => { setMode("board_member"); setError(""); }}>
                Board member
              </button>
              <button type="button" className={mode === "super_admin" ? "active" : ""} onClick={() => { setMode("super_admin"); setError(""); }}>
                Super admin
              </button>
            </div>

            {mode === "board_member" ? (
              <label className="admin-login-field">
                <span>Email address</span>
                <input name="email" type="email" autoComplete="username" required placeholder="name@organization.org" />
              </label>
            ) : (
              <div className="admin-login-notice">Use the secure administrator password configured for this deployment.</div>
            )}

            <label className="admin-login-field">
              <span>{mode === "board_member" ? "Password" : "Admin password"}</span>
              <div className="admin-password-control">
                <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button className="admin-login-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in securely"} <ArrowRight size={18} />
            </button>
            {error ? <div className="status-message error" role="alert">{error}</div> : null}
            <small className="admin-login-help">Board members use the email address and password created from their secure invitation.</small>
          </form>
        </div>
      </section>
    </main>
  );
}

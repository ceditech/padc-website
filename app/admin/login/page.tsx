"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") || "");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);
    if (!response.ok) {
      setError("Invalid admin password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-shell">
      <div className="admin-main" style={{ maxWidth: 520 }}>
        <form className="form-card" onSubmit={onSubmit}>
          <span className="eyebrow">PaDC Admin</span>
          <h1 style={{ marginTop: 0 }}>Sign in</h1>
          <div className="field">
            <label htmlFor="password">Admin password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <button className="btn btn-navy" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error ? <div className="status-message error">{error}</div> : null}
        </form>
      </div>
    </main>
  );
}

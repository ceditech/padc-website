"use client";

import { useState } from "react";
import { FormState, FormStatus } from "@/components/forms/form-status";

export function NewsletterForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok && typeof result.error === "string") {
      setError(result.error);
    }
    setState(response.ok ? "success" : "error");
    if (response.ok) form.reset();
  }

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="newsletter-name">Name (first or full name)</label>
        <input id="newsletter-name" name="name" type="text" autoComplete="name" maxLength={120} required />
      </div>
      <div className="field">
        <label htmlFor="newsletter-email">Email address</label>
        <input id="newsletter-email" name="email" type="email" autoComplete="email" required />
      </div>
      <button className="btn btn-navy" type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Subscribing..." : "Subscribe"}
      </button>
      <FormStatus state={state} success="You're subscribed. We'll keep you posted." error={error} />
      <p className="note">No spam. Unsubscribe anytime.</p>
    </form>
  );
}

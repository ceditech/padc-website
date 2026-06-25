"use client";

import { useState } from "react";
import { FormState, FormStatus } from "@/components/forms/form-status";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");
    const form = event.currentTarget;
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
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
      <div className="form-grid">
        <div className="field">
          <label htmlFor="contact-first-name">First name *</label>
          <input id="contact-first-name" name="firstName" required />
        </div>
        <div className="field">
          <label htmlFor="contact-last-name">Last name *</label>
          <input id="contact-last-name" name="lastName" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="contact-organization">Organization</label>
        <input id="contact-organization" name="organization" />
      </div>
      <div className="field">
        <label htmlFor="contact-email">Email address *</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="contact-phone">Phone number</label>
        <input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="contact-persona">I am a... *</label>
        <select id="contact-persona" name="persona" required>
          <option value="">Select one...</option>
          <option>Driver interested in PaDC membership</option>
          <option>Funder or grantmaker</option>
          <option>Cooperative development organization</option>
          <option>Workforce development organization</option>
          <option>Community organization</option>
          <option>City official or policymaker</option>
          <option>Journalist or media</option>
          <option>Researcher or academic</option>
          <option>Community supporter</option>
          <option>Other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="contact-subject">Subject *</label>
        <input id="contact-subject" name="subject" required />
      </div>
      <div className="field">
        <label htmlFor="contact-message">Message *</label>
        <textarea id="contact-message" name="message" required />
      </div>
      <button className="btn btn-yellow" type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending..." : "Send Message"}
      </button>
      <FormStatus state={state} success="Thanks. Your message was sent." error={error} />
    </form>
  );
}

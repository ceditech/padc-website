"use client";

import { useState } from "react";
import { FormState, FormStatus } from "@/components/forms/form-status";

export function PartnerInquiryForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");
    const form = event.currentTarget;
    const response = await fetch("/api/partner-inquiry", {
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
      <h3>Partner & Funder Inquiry</h3>
      <p className="note">We respond to partnership inquiries within two business days.</p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="partner-first-name">First name *</label>
          <input id="partner-first-name" name="firstName" required />
        </div>
        <div className="field">
          <label htmlFor="partner-last-name">Last name *</label>
          <input id="partner-last-name" name="lastName" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="partner-organization">Organization *</label>
        <input id="partner-organization" name="organization" required />
      </div>
      <div className="field">
        <label htmlFor="partner-title">Title / role</label>
        <input id="partner-title" name="title" />
      </div>
      <div className="field">
        <label htmlFor="partner-email">Email address *</label>
        <input id="partner-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="partner-phone">Phone number</label>
        <input id="partner-phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="partner-type">Type of inquiry *</label>
        <select id="partner-type" name="inquiryType" required>
          <option value="">Select one...</option>
          <option>Funding or grant opportunity</option>
          <option>Cooperative development partnership</option>
          <option>Workforce development partnership</option>
          <option>Community organization partnership</option>
          <option>City or government inquiry</option>
          <option>Research or academic inquiry</option>
          <option>Media inquiry</option>
          <option>Other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="partner-message">Tell us about your interest *</label>
        <textarea id="partner-message" name="message" required />
      </div>
      <button className="btn btn-yellow" type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending..." : "Send Inquiry"}
      </button>
      <FormStatus state={state} success="Thanks. Your inquiry was sent to PaDC." error={error} />
    </form>
  );
}

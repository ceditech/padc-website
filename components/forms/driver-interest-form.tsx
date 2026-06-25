"use client";

import { useState } from "react";
import { FormState, FormStatus } from "@/components/forms/form-status";

export function DriverInterestForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");
    const form = event.currentTarget;
    const response = await fetch("/api/driver-interest", {
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
      <h3>Driver Interest Form</h3>
      <p className="note">Join Philadelphia drivers already following PaDC&apos;s launch.</p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="driver-first-name">First name *</label>
          <input id="driver-first-name" name="firstName" required />
        </div>
        <div className="field">
          <label htmlFor="driver-last-name">Last name *</label>
          <input id="driver-last-name" name="lastName" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="driver-email">Email address *</label>
        <input id="driver-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="driver-phone">Phone number</label>
        <input id="driver-phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="driver-neighborhood">Neighborhood or ZIP</label>
        <input id="driver-neighborhood" name="neighborhood" />
      </div>
      <div className="field">
        <label htmlFor="driver-platforms">Current rideshare platforms</label>
        <select id="driver-platforms" name="platforms">
          <option value="">Select one...</option>
          <option>Uber</option>
          <option>Lyft</option>
          <option>Both Uber and Lyft</option>
          <option>Other platform</option>
          <option>Not currently driving</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="driver-source">How did you hear about PaDC?</label>
        <select id="driver-source" name="source">
          <option value="">Select one...</option>
          <option>Word of mouth / another driver</option>
          <option>Social media</option>
          <option>Community meeting or event</option>
          <option>News or media</option>
          <option>Community organization</option>
          <option>Other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="driver-message">Anything you&apos;d like us to know?</label>
        <textarea id="driver-message" name="message" />
      </div>
      <button className="btn btn-yellow" type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Joining..." : "Join the Driver Interest List"}
      </button>
      <FormStatus state={state} success="Thanks. You're on the interest list." error={error} />
    </form>
  );
}

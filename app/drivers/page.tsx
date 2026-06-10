import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { DriverInterestForm } from "@/components/forms/driver-interest-form";
import { driverFaqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "For Drivers",
  description:
    "Join PaDC's driver interest list and learn about Philadelphia's driver-owned rideshare cooperative."
};

const driverBenefits = [
  "Keep more of every fare",
  "Build real equity",
  "Have a real vote",
  "See where your money goes",
  "Share in cooperative success",
  "Be part of something lasting"
];

export default function DriversPage() {
  return (
    <PublicShell>
      <section className="page-hero">
        <div className="page-hero-inner">
          <span className="eyebrow">For drivers</span>
          <h1>
            Stop driving for someone else&apos;s <span className="accent">bottom line.</span>
          </h1>
          <p>
            PaDC is being built for Philadelphia drivers who want more control, more transparency,
            and a real ownership stake in the platform they power.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Driver benefits</span>
          <h2 className="section-heading">More money. More control. Real ownership.</h2>
          <div className="grid">
            {driverBenefits.map((benefit) => (
              <article className="card" key={benefit}>
                <CheckCircle2 color="#154a6b" />
                <h3>{benefit}</h3>
                <p>
                  PaDC&apos;s cooperative model is designed to give drivers a voice in decisions
                  and a stake in the value they help create.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section navy">
        <div className="section-inner">
          <span className="eyebrow">Four steps</span>
          <h2 className="section-heading">From interested to owner.</h2>
          <div className="grid">
            {["Join the interest list", "Attend an information session", "Become a member", "Help launch PaDC"].map(
              (step) => (
                <article className="card" key={step}>
                  <h3>{step}</h3>
                  <p>
                    PaDC will use each step to keep drivers informed, prepared, and ready for
                    founding-member opportunities.
                  </p>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      <section className="section light" id="interest-form">
        <div className="section-inner form-layout">
          <div>
            <span className="eyebrow">Join today</span>
            <h2 className="section-heading">Join the driver interest list.</h2>
            <p className="section-intro">
              Joining is free and non-binding. You&apos;ll receive launch updates, information
              session invites, and early membership news.
            </p>
            <div className="card">
              <h3>What happens next?</h3>
              <p>You receive a welcome email, information session invites, and priority launch updates.</p>
            </div>
          </div>
          <DriverInterestForm />
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Driver questions</span>
          <h2 className="section-heading">Answers for drivers.</h2>
          <div className="grid">
            {driverFaqs.map((faq) => (
              <article className="card" key={faq.q}>
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

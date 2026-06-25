import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { benefits, impactAreas, timeline } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how PaDC is building a driver-owned transportation cooperative in Philadelphia."
};

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="page-hero">
        <div className="page-hero-inner">
          <span className="eyebrow">About PaDC</span>
          <h1>
            Built by drivers. Owned by <span className="accent">drivers.</span>
          </h1>
          <p>
            PaDC is a Pennsylvania-based driver cooperative being built from the ground up by
            the drivers who will own it, govern it, and benefit from it.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Why PaDC exists</span>
          <h2 className="section-heading">Corporate rideshare gave drivers flexibility without ownership.</h2>
          <p className="section-intro">
            PaDC exists to give Philadelphia drivers a serious alternative: a cooperative transportation
            platform that creates economic opportunity, democratic voice, and local accountability.
          </p>
          <div className="grid">
            {benefits.map((benefit) => (
              <article className="card" key={benefit.title}>
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section light">
        <div className="section-inner">
          <span className="eyebrow">Mission and impact</span>
          <h2 className="section-heading">A transportation system where drivers have ownership and voice.</h2>
          <div className="grid two">
            <article className="card">
              <h3>Mission</h3>
              <p>
                Create a driver-owned transportation cooperative that provides safe, reliable,
                community-centered mobility while building wealth for drivers and neighborhoods.
              </p>
            </article>
            <article className="card">
              <h3>Vision</h3>
              <p>
                A future where transportation workers have ownership, economic participation,
                and a meaningful stake in the platforms they help build.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section navy">
        <div className="section-inner">
          <span className="eyebrow">Community outcomes</span>
          <h2 className="section-heading">PaDC is designed around measurable impact.</h2>
          <div className="grid">
            {impactAreas.map((area) => (
              <article className="card" key={area}>
                <h3>{area}</h3>
                <p>
                  PaDC turns transportation activity into a vehicle for shared ownership,
                  local accountability, and cooperative economic development.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Timeline</span>
          <h2 className="section-heading">The initiative is moving from organizing to execution.</h2>
          <div className="grid">
            {timeline.map((item) => (
              <article className="card" key={item.label}>
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="btn-row" style={{ marginTop: "2rem" }}>
            <Link className="btn btn-yellow" href="/drivers#interest-form">
              Join the Driver Interest List
            </Link>
            <Link className="btn btn-outline" href="/contact">
              Contact PaDC
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

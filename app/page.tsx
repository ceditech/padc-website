import Link from "next/link";
import { ArrowRight, Building2, Car, Handshake } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { benefits, stats, timeline } from "@/lib/content";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export default function HomePage() {
  return (
    <PublicShell>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">Driven by drivers. Powered by community.</span>
            <h1>
              Philadelphia&apos;s <span className="accent">driver-owned</span> economic engine.
            </h1>
            <p>
              PaDC is building a rideshare cooperative where Philadelphia drivers own the
              platform, set the terms, and share in the value they create.
            </p>
            <div className="btn-row">
              <Link className="btn btn-yellow" href="/drivers#interest-form">
                Join the Driver Interest List <ArrowRight size={18} />
              </Link>
              <Link className="btn btn-outline" href="/partners">
                Partner With Us
              </Link>
            </div>
          </div>
          <div className="hero-panel" aria-label="PaDC launch indicators">
            <div className="metric-grid">
              {stats.map((stat) => (
                <div className="metric" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">The model</span>
          <h2 className="section-heading">A better rideshare model, built as community infrastructure.</h2>
          <p className="section-intro">
            Worker-owned cooperatives are a proven engine for shared ownership. PaDC applies
            that model to transportation so drivers govern the platform and keep more value in Philadelphia.
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

      <section className="section navy">
        <div className="section-inner">
          <span className="eyebrow">Where PaDC stands</span>
          <h2 className="section-heading">Organized, incorporated, and moving toward launch.</h2>
          <div className="grid">
            {timeline.map((item) => (
              <article className="card" key={item.label}>
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section light">
        <div className="section-inner">
          <span className="eyebrow">Choose your path</span>
          <h2 className="section-heading">There is a role for drivers, partners, and community supporters.</h2>
          <div className="grid">
            <article className="card">
              <Car size={30} />
              <h3>For Drivers</h3>
              <p>Join the interest list and receive launch updates, information session invites, and membership news.</p>
              <Link className="btn btn-yellow" href="/drivers#interest-form">
                Join the list
              </Link>
            </article>
            <article className="card">
              <Handshake size={30} />
              <h3>For Partners</h3>
              <p>Support cooperative development, workforce outcomes, transportation access, and local wealth building.</p>
              <Link className="btn btn-navy" href="/partners#partner-form">
                Start a conversation
              </Link>
            </article>
            <article className="card">
              <Building2 size={30} />
              <h3>For Community</h3>
              <p>Follow the launch, invite PaDC to community conversations, or connect with the organizing team.</p>
              <Link className="btn btn-outline" href="/contact">
                Contact PaDC
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner form-layout">
          <div>
            <span className="eyebrow">Stay in the loop</span>
            <h2 className="section-heading">Get updates on PaDC&apos;s formation and pilot launch.</h2>
            <p className="section-intro">
              Subscribe for community meeting announcements, launch milestones, and opportunities to support the cooperative.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </PublicShell>
  );
}

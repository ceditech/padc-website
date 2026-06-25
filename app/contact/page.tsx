import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact PaDC for driver membership, partnerships, community questions, media inquiries, and launch updates."
};

export default function ContactPage() {
  return (
    <PublicShell>
      <section className="page-hero">
        <div className="page-hero-inner">
          <span className="eyebrow">Contact PaDC</span>
          <h1>
            Let&apos;s build this <span className="accent">together.</span>
          </h1>
          <p>
            Reach PaDC for driver membership questions, partnership conversations,
            community presentations, media inquiries, or general support.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Quick routing</span>
          <h2 className="section-heading">Find the right contact path.</h2>
          <div className="grid">
            <article className="card">
              <h3>Drivers</h3>
              <p>Join the interest list to receive information session invites and launch updates.</p>
              <Link className="btn btn-yellow" href="/drivers#interest-form">
                Join the list
              </Link>
            </article>
            <article className="card">
              <h3>Partners</h3>
              <p>Use the partner form or email partners@padc.coop for funding and collaboration conversations.</p>
              <Link className="btn btn-navy" href="/partners#partner-form">
                Partner form
              </Link>
            </article>
            <article className="card">
              <h3>General</h3>
              <p>Use the contact form below and we&apos;ll route the message to the right person.</p>
              <a className="btn btn-outline" href="#contact-form">
                Send a message
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="section light" id="contact-form">
        <div className="section-inner form-layout">
          <div>
            <span className="eyebrow">Send a message</span>
            <h2 className="section-heading">General contact form.</h2>
            <p className="section-intro">
              Not sure which category fits? Use this form. PaDC will route your message and respond
              as soon as possible.
            </p>
            <div className="card">
              <h3>Direct emails</h3>
              <p>
                General: <a href="mailto:info@padc.coop">info@padc.coop</a>
                <br />
                Partners: <a href="mailto:partners@padc.coop">partners@padc.coop</a>
              </p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </PublicShell>
  );
}

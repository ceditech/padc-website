import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { PartnerInquiryForm } from "@/components/forms/partner-inquiry-form";
import { impactAreas } from "@/lib/content";

export const metadata: Metadata = {
  title: "For Partners",
  description:
    "Partner with PaDC to support driver ownership, cooperative development, and community wealth building in Philadelphia."
};

const partnerTypes = [
  "Seed and pre-launch funders",
  "Technical assistance partners",
  "Community and economic development organizations",
  "Community outreach and advocacy partners"
];

export default function PartnersPage() {
  return (
    <PublicShell>
      <section className="page-hero">
        <div className="page-hero-inner">
          <span className="eyebrow">For partners and funders</span>
          <h1>
            An investment in <span className="accent">Philadelphia&apos;s</span> economic future.
          </h1>
          <p>
            PaDC is a community economic development initiative using transportation to build
            ownership, wealth, and opportunity for working families.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Why it matters</span>
          <h2 className="section-heading">A scalable model for community wealth building in the gig economy.</h2>
          <p className="section-intro">
            PaDC is past concept and into execution: formal entity, bylaws, driver organizing,
            and a launch plan that needs aligned partners.
          </p>
          <div className="grid">
            {impactAreas.map((area) => (
              <article className="card" key={area}>
                <h3>{area}</h3>
                <p>
                  Partner support helps transform rideshare labor into local ownership,
                  workforce development, and measurable community impact.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section navy">
        <div className="section-inner">
          <span className="eyebrow">Partnership opportunities</span>
          <h2 className="section-heading">Several kinds of partners can help PaDC launch well.</h2>
          <div className="grid two">
            {partnerTypes.map((type) => (
              <article className="card" key={type}>
                <h3>{type}</h3>
                <p>
                  PaDC welcomes conversations with organizations aligned with worker ownership,
                  transportation equity, and inclusive economic development.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section light" id="partner-form">
        <div className="section-inner form-layout">
          <div>
            <span className="eyebrow">Let&apos;s talk</span>
            <h2 className="section-heading">Schedule a conversation.</h2>
            <p className="section-intro">
              We welcome conversations with funders, cooperative development organizations,
              community partners, city officials, researchers, and aligned supporters.
            </p>
            <div className="card">
              <h3>Email directly</h3>
              <p>
                For immediate partner inquiries, email{" "}
                <a href="mailto:partners@padc.coop">partners@padc.coop</a>.
              </p>
            </div>
          </div>
          <PartnerInquiryForm />
        </div>
      </section>
    </PublicShell>
  );
}

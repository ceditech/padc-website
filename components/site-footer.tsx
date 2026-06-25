import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="brand-mark">
            Pa<span>DC</span>
          </div>
          <p style={{ color: "rgba(255,255,255,.68)", maxWidth: 440 }}>
            PaDC is building a driver-owned rideshare cooperative in Philadelphia,
            keeping ownership, voice, and wealth in the hands of local drivers.
          </p>
          <a href="mailto:info@padc.coop">info@padc.coop</a>
        </div>
        <div>
          <h4>Explore</h4>
          <Link href="/about">About PaDC</Link>
          <Link href="/drivers">For Drivers</Link>
          <Link href="/partners">For Partners</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <h4>Take Action</h4>
          <Link href="/drivers#interest-form">Join the driver list</Link>
          <Link href="/partners#partner-form">Partner with us</Link>
          <Link href="/contact">Attend a meeting</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <div>
          <h4>Status</h4>
          <a href="mailto:partners@padc.coop">partners@padc.coop</a>
          <span style={{ display: "block", color: "rgba(255,255,255,.68)", fontSize: ".9rem" }}>
            In formation
          </span>
          <span style={{ display: "block", color: "rgba(255,255,255,.46)", marginTop: "1.5rem", fontSize: ".78rem" }}>
            © 2026 Pennsylvania Driver Cooperative
          </span>
        </div>
      </div>
    </footer>
  );
}

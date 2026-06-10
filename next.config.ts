import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/padc-homepage.html", destination: "/", permanent: true },
      { source: "/padc-about.html", destination: "/about", permanent: true },
      { source: "/padc-drivers.html", destination: "/drivers", permanent: true },
      { source: "/padc-partners.html", destination: "/partners", permanent: true },
      { source: "/padc-contact.html", destination: "/contact", permanent: true }
    ];
  }
};

export default nextConfig;

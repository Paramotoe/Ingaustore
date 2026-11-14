import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com https://placehold.co https://picsum.photos; font-src 'self' data:; connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com; frame-ancestors 'none'; form-action 'self'; base-uri 'self'",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" }] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store, private" }] },
    ];
  },
};

export default nextConfig;
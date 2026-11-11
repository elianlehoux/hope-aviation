import type { NextConfig } from "next";

// Legacy campus URLs from the students/professors/admin split; pages win over these,
// so admin entries only take effect once their old pages are removed.
const LEGACY_REDIRECTS: [string, string][] = [
  ["/campus/students", "/campus"],
  ["/campus/students/courses", "/campus/courses"],
  ["/campus/students/courses/:courseId", "/campus/courses/:courseId"],
  ["/campus/students/courses/:courseId/subjects/:subjectId", "/campus/courses/:courseId"],
  [
    "/campus/students/courses/:courseId/subjects/:subjectId/classes/:classId",
    "/campus/courses/:courseId/learn/:classId",
  ],
  ["/campus/students/:path*", "/campus"],
  ["/campus/professors/courses/:courseId/:path*", "/campus/admin/courses/:courseId"],
  ["/campus/professors/exams/:examId", "/campus/admin/exams/:examId"],
  ["/campus/professors/:path*", "/campus/admin/courses"],
  ["/campus/admin/enrollments", "/campus/admin/people"],
  ["/campus/admin/exam-attempts", "/campus/admin/people"],
  ["/campus/admin/roles", "/campus/admin/people"],
  ["/campus/admin/users", "/campus/admin/people"],
  ["/campus/admin/user-management", "/campus/admin/people"],
  ["/campus/admin/user-management/:userId", "/campus/admin/people/:userId"],
  ["/campus/admin/exams", "/campus/admin/courses"],
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },
  // The certificate PDF reads its fonts and logo from disk at runtime.
  outputFileTracingIncludes: {
    "/api/certificates/[enrollmentId]/pdf": [
      "./app/api/certificates/_assets/**",
      "./public/logos/hope-logo.svg",
    ],
  },
  async redirects() {
    return LEGACY_REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;

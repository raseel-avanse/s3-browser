import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // The following is a workaround for Next.js 15.3.3 to allow cross-origin requests in development.
  // This is necessary for the Firebase Studio preview to work correctly.
  experimental: {
    allowedDevOrigins: [
      'http://localhost:9002', // Standard local development
      'https://*.googleusercontent.com', // Firebase Studio & Cloud Workstations
    ],
  },
};

export default nextConfig;

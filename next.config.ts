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
  // Configuration for Replit environment
  // Allow all hosts since Replit shows the website in a proxy/iframe
  experimental: {
    allowedDevOrigins: [
      'http://localhost:5000', // Replit environment
      'https://*.googleusercontent.com', // Firebase Studio & Cloud Workstations
    ],
  },
  // Allow all hosts for development server in Replit
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use stable Turbopack instead of experimental
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Disable tracing to avoid permission issues
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Moved from experimental section as per Next.js recommendation
  outputFileTracingExcludes: {
    '*': ['node_modules/**/*'],
  },
}

module.exports = nextConfig
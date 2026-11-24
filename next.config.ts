import type { NextConfig } from 'next';

const shaderSource = { type: 'text' } as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  turbopack: {
    rules: {
      '*.vert': shaderSource,
      '*.frag': shaderSource,
      '*.glsl': shaderSource,
    },
  },
};

export default nextConfig;

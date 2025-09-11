import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	compiler: {
		// Ensure CSS properties are properly prefixed
		styledComponents: false,
	},
	// Image optimization for production
	images: {
		formats: ["image/webp", "image/avif"],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
		dangerouslyAllowSVG: false,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	// Performance optimizations
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
	// Security headers
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
				],
			},
		];
	},
	// Remove webpack config since we're using Turbopack
	// PostCSS with autoprefixer will handle CSS prefixing
};

export default nextConfig;

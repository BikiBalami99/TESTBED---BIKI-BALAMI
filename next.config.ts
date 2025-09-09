import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	compiler: {
		// Ensure CSS properties are properly prefixed
		styledComponents: false,
	},
	webpack: (config, { isServer }) => {
		// Ensure CSS autoprefixer works correctly
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
			};
		}
		return config;
	},
};

export default nextConfig;

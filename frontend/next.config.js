/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    env: {
        // NEXT_PUBLIC Variables have to be present during build time, do not put these in Dockerfiles
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "YOUR_GA_MEASUREMENT_ID",
        NEXT_PUBLIC_CLIENT_BACKEND_URL: process.env.NODE_ENV === "production" ? "https://YOUR_DOMAIN.COM" : "http://127.0.0.1:4000",
        NEXT_PUBLIC_FRONTEND_URL: process.env.NODE_ENV === "production" ? "https://YOUR_DOMAIN.COM" : "http://127.0.0.1:3000",
    },
    webpack: (config, context) => {
        if (process.env.NEXT_WEBPACK_USEPOLLING) {
            config.watchOptions = {
                poll: 500,
                aggregateTimeout: 300,
            };
        }
        return config;
    },
};

module.exports = nextConfig;

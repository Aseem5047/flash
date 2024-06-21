/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'img.clerk.com'
            },
            {
                hostname: 'images.unsplash.com'
            },
            {
                hostname: 'drive.google.com'
            }
        ],
    },
};

export default nextConfig;

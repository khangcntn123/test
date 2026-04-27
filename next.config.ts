import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Cấu hình cho việc tối ưu hóa hình ảnh
  images: {
    // Bằng cách khai báo remotePatterns, chúng ta bảo Next.js rằng
    // ảnh sẽ được tối ưu theo yêu cầu (on-demand) khi người dùng truy cập,
    // thay vì xử lý tất cả tại thời điểm build.
    // Điều này sẽ giúp quá trình build nhanh hơn đáng kể.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ngxf08dchtenkerp.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**', // Cho phép tất cả các đường dẫn con từ hostname này
      },
      // Nếu sau này bạn có thêm nguồn ảnh từ domain khác, hãy thêm vào đây
      // ví dụ: { protocol: 'https', hostname: 'images.pexels.com' }
    ],
  },
};

module.exports = nextConfig;

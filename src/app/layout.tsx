import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WordFlow - Soạn thảo Văn bản Hiện đại",
  description: "Nền tảng soạn thảo văn bản trực tuyến miễn phí, mạnh mẽ như Microsoft Word với giao diện đẹp và hiện đại.",
  keywords: ["word processor", "soạn thảo văn bản", "editor online", "wordflow"],
  authors: [{ name: "WordFlow" }],
  openGraph: {
    title: "WordFlow - Soạn thảo Văn bản Hiện đại",
    description: "Nền tảng soạn thảo văn bản trực tuyến miễn phí",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

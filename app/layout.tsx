import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "今天吃什么？",
  description: "一个 Next.js 重构的随机转盘吃饭决策器"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

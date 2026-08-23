import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '语灵文明 · 互动原型',
  description: '以真实词汇掌握驱动语灵收集、升星、闯关与竞技的学习冒险。',
  openGraph: {
    title: '语灵文明',
    description: '记住一个词，唤醒一个世界。',
    images: [{ url: 'https://word-spirit-civilization-demo.eeevan137.chatgpt.site/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '语灵文明',
    description: '记住一个词，唤醒一个世界。',
    images: ['https://word-spirit-civilization-demo.eeevan137.chatgpt.site/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

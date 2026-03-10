import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GST Reconcile — Automate GST Reconciliation',
  description:
    'GST Reconcile automates GSTR-2B reconciliation with purchase registers, identifies ITC risks, and helps CA firms & accountants save time.',
  keywords: ['GST reconciliation', 'GSTR-2B', 'ITC', 'CA firm', 'accounting'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

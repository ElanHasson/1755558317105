import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Using DigitalOcean\'s App Platform to remove DevOps pain',
  description: 'A 10-minute webinar about Using DigitalOcean\'s App Platform to remove DevOps pain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
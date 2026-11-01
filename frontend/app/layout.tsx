import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ProjectProvider } from "@/context/ProjectContext";
import { Toaster } from "@/components/ui/toaster";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Modern SaaS Analytics',
  description: 'A powerful analytics dashboard with AI-powered insights, heatmaps, session recordings, and real-time data visualization.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        {/* Nhúng tracking script nội bộ từ thư mục public */}
        <script
          src="/tracker.js"
          data-project-id="test-project-1234"
          async
        ></script>
      </head>
      <body className="font-sans antialiased">
        <ProjectProvider>
          {children}
        </ProjectProvider>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}


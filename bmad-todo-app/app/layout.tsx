import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ErrorBoundary } from '@/components/ui/ErrorMessage'
import { StructuredData } from '@/components/StructuredData'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'bmad-todo - Clean, Simple Task Management',
  description:
    'A portfolio-grade todo application demonstrating full-stack craftsmanship with clean code and best practices.',
  keywords: [
    'todo app',
    'task management',
    'Next.js',
    'React',
    'TypeScript',
    'portfolio project',
  ],
  authors: [{ name: 'Raul Saez' }],
  creator: 'Raul Saez',
  publisher: 'Raul Saez',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bmad-todo.vercel.app',
    title: 'bmad-todo - Clean, Simple Task Management',
    description:
      'A portfolio-grade todo application demonstrating full-stack craftsmanship with clean code and best practices.',
    siteName: 'bmad-todo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'bmad-todo - Task Management App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'bmad-todo - Clean, Simple Task Management',
    description:
      'A portfolio-grade todo application demonstrating full-stack craftsmanship with clean code and best practices.',
    images: ['/og-image.png'],
  },
  metadataBase: new URL('https://bmad-todo.vercel.app'),
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}

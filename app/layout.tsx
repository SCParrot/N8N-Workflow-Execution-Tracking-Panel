import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'N8N Workflow Tracker',
  description: 'Track n8n workflow execution status',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
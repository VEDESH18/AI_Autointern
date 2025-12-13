import './globals.css'
import { Inter } from 'next/font/google'
import DashboardLayout from '@/components/DashboardLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AutoApply',
  description: 'Automated job application and interview preparation platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  )
}

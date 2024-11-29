import './globals.css'
import { Inter } from 'next/font/google'
import { GoogleTagManager } from '@next/third-parties/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kambo Uniwersum',
  description: 'Najnowsze filmy z kambodżańskiego uniwersum',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
      <GoogleTagManager gtmId="G-5KHWDKBZ81" />
    </html>
  )
}
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '../contexts/WalletContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EduPayChain - Decentralized University Fee Payment',
  description: 'A decentralized application for university fee payments using blockchain technology and NFT certificates.',
  keywords: 'blockchain, education, payments, NFT, certificates, university',
  authors: [{ name: 'EduPayChain Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  )
} 
import type { Metadata } from 'next'
import { Montserrat, Montserrat_Alternates } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

const montserrat = Montserrat({
  weight: ['700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-montserrat',
  display: 'swap',
})

const montserratAlt = Montserrat_Alternates({
  weight: ['700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-montserrat-alt',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SAA 2025 — Sun Annual Awards',
  description: 'Sun Annual Awards 2025',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${montserratAlt.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

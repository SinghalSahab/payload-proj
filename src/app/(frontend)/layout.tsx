import React from 'react'
import './styles.css'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'WeFrame',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="logo">WeFrame</div>
          <div className="nav-right"></div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}

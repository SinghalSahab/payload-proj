import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'
import FormComponent from '@/components/FormComponent'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  // We'll use the user context later for tenant-specific forms
  await payload.auth({ headers })

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="left-column">
          <h1 className="main-title">Get in Touch with Our Experts</h1>
          <p className="subtitle">We&apos;re here to help you build something amazing</p>
          <div className="contact-info">
            <p>Have questions about our services? Want to discuss your project?</p>
            <p>Our team of experts is ready to assist you with:</p>
            <ul>
              <li>Custom solutions tailored to your needs</li>
              <li>Technical consultation and support</li>
              <li>Project planning and implementation</li>
              <li>24/7 customer service</li>
            </ul>
          </div>
        </div>
        <div className="right-column">
          <FormComponent formId="4" />
        </div>
      </div>
    </div>
  )
}

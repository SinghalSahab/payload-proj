'use client'
import { RichText } from '@payloadcms/richtext-lexical/react'
import React, { useEffect, useState } from 'react'

interface FormField {
  id: string
  name: string
  label: string
  blockType: string
  required?: boolean
}

const FormComponent = ({ formId }: { formId: string }) => {
  const [cmsForms, setCmsForms] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetch(`http://localhost:3001/api/forms/${formId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((data) => {
        setCmsForms(data)
      })
      .catch((error) => {
        console.error('Error fetching form:', error)
        setError(error.message || 'Failed to fetch form data')
      })
      .finally(() => {
        setIsLoading(false)
        setTimeout(() => setShowForm(true), 100)
      })
  }, [formId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const formData = new FormData(event.currentTarget)
    const dataToSend = Array.from(formData.entries()).map(([name, value]) => ({
      field: name,
      value: value.toString(),
    }))
    const response = await fetch('/api/form-submissions', {
      method: 'POST',
      body: JSON.stringify({
        form: formId,
        submissionData: dataToSend,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      setSuccess(true)
    } else {
      setSuccess(false)
    }
    formElement.reset()
    setTimeout(() => setSuccess(false), 5000)
  }

  if (isLoading) return <div className="text-white">Loading form...</div>
  if (error) return <div className="text-red-400 bg-black p-4 rounded-lg shadow-lg">{error}</div>
  if (!cmsForms || !cmsForms.fields)
    return <div className="text-white">Form not found or has no fields</div>

  return (
    <div className="form-container">
      <div className={`form-wrapper ${showForm ? 'show' : ''}`}>
        <h1 className="form-title">{cmsForms.title || 'Form'}</h1>
        {success && (
          <div className="success-message">
            {cmsForms.confirmationMessage ? (
              <RichText data={cmsForms.confirmationMessage} />
            ) : (
              'Form submitted successfully!'
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-content">
          {cmsForms.fields.map((field: FormField, idx: number) => (
            <div
              key={field.id}
              className={`form-field ${showForm ? 'show' : ''}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <label htmlFor={field.name} className="field-label">
                {field.label}
                {field.required && <span className="required-mark">*</span>}
              </label>
              <input
                type={field.blockType === 'text' ? 'text' : field.blockType}
                name={field.name}
                id={field.id}
                placeholder={field.label}
                required={field.required}
                className="field-input"
                autoComplete="off"
              />
            </div>
          ))}
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>

      <style jsx>{`
        .form-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #000000 0%, #064e3b 100%);
          padding: 2rem;
        }

        .form-wrapper {
          width: 100%;
          max-width: 32rem;
          padding: 2rem;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid #047857;
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.25);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-wrapper.show {
          opacity: 1;
          transform: translateY(0);
        }

        .form-title {
          font-size: 2rem;
          font-weight: 800;
          color: #34d399;
          text-align: center;
          margin-bottom: 1.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .success-message {
          background: rgba(16, 185, 129, 0.2);
          color: #a7f3d0;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
          animation: fadeIn 0.5s ease-out;
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-field {
          opacity: 0;
          transform: translateX(-20px);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-field.show {
          opacity: 1;
          transform: translateX(0);
        }

        .field-label {
          display: block;
          color: #a7f3d0;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .required-mark {
          color: #34d399;
          margin-left: 0.25rem;
        }

        .field-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #047857;
          border-radius: 0.5rem;
          color: white;
          transition: all 0.3s ease;
        }

        .field-input:focus {
          outline: none;
          border-color: #34d399;
          box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.2);
        }

        .field-input::placeholder {
          color: #6b7280;
        }

        .submit-button {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          color: black;
          font-weight: 700;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default FormComponent

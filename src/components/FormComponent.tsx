'use client'
import { RichText } from '@payloadcms/richtext-lexical/react';
import React, { useEffect, useState } from 'react'
import { div } from 'three/tsl';

interface FormField {
  id: string;
  name: string;
  label: string;
  blockType: string;
  required?: boolean;
}



const FormComponent = ({ formId }: { formId: string }) => {
  const [cmsForms, setCmsForms] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success,setSuccess] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:3001/api/forms/${formId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setCmsForms(data);
      })
      .catch((error) => {
        console.error('Error fetching form:', error);
        setError(error.message || 'Failed to fetch form data');
      })
      .finally(() => setIsLoading(false));
  }, [formId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);
    console.log('Form submitted', data);
    
    const dataToSend = Array.from(formData.entries()).map(([name, value]) => ({
        field: name,
        value: value.toString()
    }));
    const response = await fetch('/api/form-submissions', {
      method: 'POST',
      body: JSON.stringify({
        form: formId,
        submissionData: dataToSend,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Response from form submission:', response);
    if(response.ok) {
      console.log('Form submission successful:')
      setSuccess(true);
    }
    else {
      console.error('Error submitting form:');
       setSuccess(false);
    }

    formElement.reset(); 

    if(!cmsForms)return <div>Loading...</div>
    if(success && cmsForms.confirmationMessage) {
        setTimeout(() => {
          setSuccess(false);
        }, 5000); // Reset success after 5 seconds
      return <RichText data={cmsForms.confirmationMessage} />
    }
  };

  if (isLoading) return <div>Loading form...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!cmsForms || !cmsForms.fields) return <div>Form not found or has no fields</div>;

  return (
      <div>
        <h1>Form</h1>
        <form onSubmit={handleSubmit}>
          {cmsForms.fields.map((field) => (
            <div key={field.id}>
              <label htmlFor={field.name}>{field.label}</label>
              <input
                type={field.blockType === 'text' ? 'text' : field.blockType}
                name={field.name}
                id={field.id}
                placeholder={field.label}
                required={field.required}
              />

            </div>
          ))}
          <button type='submit'>Submit</button>
        </form>
      </div>
  );
};

export default FormComponent;
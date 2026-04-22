import { useState } from 'react'

import type { CreateBookingRequest } from '../types/api'

interface BookingFormProps {
  onSubmit: (payload: CreateBookingRequest) => Promise<void>
}

type FormErrors = Partial<Record<keyof CreateBookingRequest, string>> & {
  form?: string
}

const initialFormState: CreateBookingRequest = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  departureAirport: '',
  arrivalAirport: '',
  departureDate: '',
}

export function BookingForm({ onSubmit }: BookingFormProps) {
  const [formData, setFormData] = useState<CreateBookingRequest>(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(data: CreateBookingRequest) {
    const nextErrors: FormErrors = {}

    if (!/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(data.firstName.trim())) {
      nextErrors.firstName = 'Enter a valid first name.'
    }

    if (!/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(data.lastName.trim())) {
      nextErrors.lastName = 'Enter a valid last name.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!/^[+]?[\d\s()-]{7,20}$/.test(data.phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number.'
    }

    if (!/^[A-Za-z]{3}$/.test(data.departureAirport.trim())) {
      nextErrors.departureAirport = 'Use a 3-letter airport code.'
    }

    if (!/^[A-Za-z]{3}$/.test(data.arrivalAirport.trim())) {
      nextErrors.arrivalAirport = 'Use a 3-letter airport code.'
    }

    if (
      data.departureAirport.trim().toUpperCase() &&
      data.departureAirport.trim().toUpperCase() === data.arrivalAirport.trim().toUpperCase()
    ) {
      nextErrors.arrivalAirport = 'Arrival airport must be different.'
    }

    if (!data.departureDate) {
      nextErrors.departureDate = 'Select a departure date.'
    }

    return nextErrors
  }

  function updateField(field: keyof CreateBookingRequest, value: string) {
    setFormData((currentValue) => ({
      ...currentValue,
      [field]:
        field === 'departureAirport' || field === 'arrivalAirport'
          ? value.toUpperCase()
          : value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(formData)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        departureAirport: formData.departureAirport.trim().toUpperCase(),
        arrivalAirport: formData.arrivalAirport.trim().toUpperCase(),
        departureDate: new Date(formData.departureDate).toISOString(),
      })
      setFormData(initialFormState)
      setErrors({})
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Unable to create booking.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="card booking-form" onSubmit={handleSubmit} noValidate>
      <div className="card-header">
        <div>
          <p className="eyebrow">Book a flight</p>
          <h2>Reserve your next departure</h2>
        </div>
        <span className="status-badge scheduled">Self-serve</span>
      </div>

      <div className="form-grid">
        <label>
          <span>First name</span>
          <input
            value={formData.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
            placeholder="Ada"
          />
          {errors.firstName ? <small>{errors.firstName}</small> : null}
        </label>

        <label>
          <span>Last name</span>
          <input
            value={formData.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
            placeholder="Okafor"
          />
          {errors.lastName ? <small>{errors.lastName}</small> : null}
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            value={formData.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="traveler@example.com"
          />
          {errors.email ? <small>{errors.email}</small> : null}
        </label>

        <label>
          <span>Phone</span>
          <input
            value={formData.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="+234 800 000 0000"
          />
          {errors.phone ? <small>{errors.phone}</small> : null}
        </label>

        <label>
          <span>Departure airport</span>
          <input
            maxLength={3}
            value={formData.departureAirport}
            onChange={(event) => updateField('departureAirport', event.target.value)}
            placeholder="LOS"
          />
          {errors.departureAirport ? <small>{errors.departureAirport}</small> : null}
        </label>

        <label>
          <span>Arrival airport</span>
          <input
            maxLength={3}
            value={formData.arrivalAirport}
            onChange={(event) => updateField('arrivalAirport', event.target.value)}
            placeholder="ABV"
          />
          {errors.arrivalAirport ? <small>{errors.arrivalAirport}</small> : null}
        </label>

        <label className="full-span">
          <span>Departure date</span>
          <input
            type="datetime-local"
            value={formData.departureDate}
            onChange={(event) => updateField('departureDate', event.target.value)}
          />
          {errors.departureDate ? <small>{errors.departureDate}</small> : null}
        </label>
      </div>

      {errors.form ? <p className="form-error">{errors.form}</p> : null}

      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? 'Creating booking...' : 'Create booking'}
      </button>
    </form>
  )
}

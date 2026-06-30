import React from 'react'
import { InputField } from '../access/InputField'
import { dateConverter } from './ConvertDate'

function isEmptyValue(value) {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'number' || typeof value === 'boolean') return false
  return String(value).trim().length === 0
}

function resolveValue(item, user) {
  const value = item.key.split('.').reduce((obj, keyPart) => obj && obj[keyPart], user)

  if (item.key.includes('created') && value) {
    return dateConverter(value)
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return value
}

function renderInteractiveValue(item, value) {
  if (isEmptyValue(value)) {
    return <span className="italic text-[var(--brand-text-secondary)]/80">Not provided</span>
  }

  const stringValue = String(value)

  if (item.kind === 'email') {
    return (
      <a
        href={`mailto:${stringValue}`}
        className="underline decoration-[var(--brand-border)] underline-offset-4 transition hover:text-[var(--brand-primary)]"
      >
        {stringValue}
      </a>
    )
  }

  if (item.kind === 'phone') {
    return (
      <a
        href={`tel:${stringValue.replace(/\s+/g, '')}`}
        className="underline decoration-[var(--brand-border)] underline-offset-4 transition hover:text-[var(--brand-primary)]"
      >
        {stringValue}
      </a>
    )
  }

  return stringValue
}

export const MapOutInput = ({
  fieldsToShow,
  user,
  variant = 'rows',
  hideEmpty = false,
}) => {
  if (!fieldsToShow || !Array.isArray(fieldsToShow)) {
    return null
  }

  const resolvedFields = fieldsToShow
    .map((item) => {
      const value = resolveValue(item, user)
      return {
        ...item,
        value,
      }
    })
    .filter((item) => !hideEmpty || !isEmptyValue(item.value))

  if (variant === 'identity-grid') {
    return (
      <dl className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
        {resolvedFields.map((item) => (
          <div
            key={item.key}
            className={`min-w-0 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)]/80 p-4 shadow-sm ${
              item.span === 'full' ? 'xl:col-span-2' : ''
            }`}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-secondary)]/85">
              {item.label}
            </dt>
            <dd className="mt-2 min-w-0 text-[15px] leading-6 text-[var(--brand-text-color)] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {renderInteractiveValue(item, item.value)}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  return (
    <div>
      {resolvedFields.map((item) => (
        <InputField
          key={item.key}
          labelText={item.label}
          name={isEmptyValue(item.value) ? 'N/A' : item.value}
        />
      ))}
    </div>
  )
}

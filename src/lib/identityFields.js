const IDENTITY_FIELD_CONFIG = {
  FIRST: { label: 'First name', order: 10 },
  MID: { label: 'Middle name', order: 20 },
  LAST: { label: 'Last name', order: 30 },
  EMAIL: { label: 'Email address', order: 40, kind: 'email', span: 'full' },
  PHONE: { label: 'Phone number', order: 50, kind: 'phone' },
  DOB: { label: 'Date of birth', order: 60 },
  PNR: { label: 'Personal number', order: 70 },
  COUNTRY: { label: 'Country', order: 80 },
  REGION: { label: 'Region', order: 90 },
  CITY: { label: 'City', order: 100 },
  AREA: { label: 'Area', order: 110 },
  ZIP: { label: 'Postal code', order: 120 },
  ADDR: { label: 'Street address', order: 130, span: 'full' },
  SPORT: { label: 'Sport', order: 140 },
  SPORTINGLICENSE: { label: 'Sporting license', order: 150, span: 'full' },
  SPORTASSOCIATION: { label: 'Sport association', order: 160, span: 'full' },
  ORGNAME: { label: 'Organization name', order: 10, span: 'full' },
  ORGNR: { label: 'Organization number', order: 20 },
  ORGROLE: { label: 'Organization role', order: 30 },
  ORGCOUNTRY: { label: 'Organization country', order: 40 },
  ORGREGION: { label: 'Organization region', order: 50 },
  ORGCITY: { label: 'Organization city', order: 60 },
  ORGAREA: { label: 'Organization area', order: 70 },
  ORGZIP: { label: 'Organization postal code', order: 80 },
  ORGADDR: { label: 'Organization address', order: 90, span: 'full' },
  ORGADDR2: { label: 'Organization address line 2', order: 100, span: 'full' },
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function hasValue(value) {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'number' || typeof value === 'boolean') return true
  return normalizeString(String(value)).length > 0
}

function formatFallbackLabel(key) {
  return key
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function buildIdentityFields(properties, options = {}) {
  const { includeEmpty = false } = options

  if (!properties || typeof properties !== 'object') {
    return []
  }

  return Object.keys(properties)
    .filter((key) => includeEmpty || hasValue(properties[key]))
    .map((key) => {
      const config = IDENTITY_FIELD_CONFIG[key] || {}
      return {
        label: config.label || formatFallbackLabel(key),
        key: `properties.${key}`,
        span: config.span || 'default',
        kind: config.kind || 'text',
        order: config.order ?? 999,
      }
    })
    .sort((left, right) => {
      if (left.order !== right.order) return left.order - right.order
      return left.label.localeCompare(right.label)
    })
}

export function getIdentityDisplayName(user) {
  const firstName = normalizeString(user?.properties?.FIRST)
  const middleName = normalizeString(user?.properties?.MID)
  const lastName = normalizeString(user?.properties?.LAST)
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim()

  if (fullName) return fullName

  const organizationName = normalizeString(user?.properties?.ORGNAME)
  if (organizationName) return organizationName

  return normalizeString(user?.account) || 'N/A'
}

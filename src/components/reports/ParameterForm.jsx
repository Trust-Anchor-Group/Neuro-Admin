'use client';

function valueOf(field) {
  if (Array.isArray(field?.value)) return field.value.map((item) => item?.value ?? '').join(',');
  return field?.value?.value ?? '';
}

function update(parameters, variable, value) {
  return {
    ...parameters,
    field: (parameters?.field || []).map((field) => field.var === variable ? { ...field, value: { value } } : field),
  };
}

function meta(field) {
  const description = typeof field?.desc === 'string' ? field.desc : field?.desc?.value || '';
  const required = field?.required === true || field?.required === 'true' || field?.required?.value === 'true';
  return <small className="mt-1 block text-xs text-[var(--brand-text-secondary)]">{description || 'Server-provided field.'}{required ? ' Required.' : ''}</small>;
}

export default function ParameterForm({ parameters, onChange, disabled }) {
  return (
    <div className="space-y-4">
      {(parameters?.field || []).filter((field) => field.type !== 'hidden').map((field) => {
        const id = `report-parameter-${field.var}`;
        const label = field.label || field.var;
        const value = valueOf(field);
        const change = (next) => onChange(update(parameters, field.var, next));
        if (!['text-single', 'text-multi', 'text-private', 'list-single', 'boolean'].includes(field.type)) {
          return <div key={field.var} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"><strong>{label}</strong><p>Unsupported server field type: {field.type}</p></div>;
        }
        if (field.type === 'list-single') return <label key={field.var} htmlFor={id} className="block text-sm font-medium">{label}{meta(field)}<select id={id} value={value} onChange={(event) => change(event.target.value)} disabled={disabled} className="mt-2 w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2">{(field.option || []).map((option) => <option key={option.value?.value || ''} value={option.value?.value || ''}>{option.label || option.value?.value}</option>)}</select></label>;
        if (field.type === 'boolean') return <label key={field.var} htmlFor={id} className="flex items-start gap-2 text-sm font-medium"><input id={id} type="checkbox" checked={value === 'true' || value === '1'} onChange={(event) => change(event.target.checked ? 'true' : 'false')} disabled={disabled} /> <span>{label}{meta(field)}</span></label>;
        if (field.type === 'text-multi') return <label key={field.var} htmlFor={id} className="block text-sm font-medium">{label}{meta(field)}<textarea id={id} value={value} onChange={(event) => change(event.target.value)} disabled={disabled} rows={4} className="mt-2 w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2" /></label>;
        return <label key={field.var} htmlFor={id} className="block text-sm font-medium">{label}{meta(field)}<input id={id} type={field.type === 'text-private' ? 'password' : 'text'} value={value} onChange={(event) => change(event.target.value)} disabled={disabled} className="mt-2 w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2" /></label>;
      })}
    </div>
  );
}

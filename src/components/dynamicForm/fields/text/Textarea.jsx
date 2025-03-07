import ElementDesc from '../../components/ElementDesc';

export default function Textarea({ errors, element, field }) {
  return (
    <label className="flex flex-col gap-2">
      <ElementDesc element={element} />

      <textarea
        className={`border p-3 shadow-1g resize-none min-h-52 ${
          errors[element.name] ? 'border-red-500' : ''
        }`}
        name={element.name}
        type={element.type}
        onChange={field.onChange}
        onBlur={field.onBlur}
        value={field.value || ''}
        ref={field.ref}
      />
    </label>
  );
}

import ElementDesc from '../../components/ElementDesc';

export default function TextInput({ errors, element, field }) {
  return (
    <label className="flex flex-col gap-2">
      <ElementDesc element={element} />

      <input
        className={`border p-3 shadow-1g ${
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

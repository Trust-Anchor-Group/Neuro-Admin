export default function RadioSelect({ field, option, onValueChange }) {
  const optionValue = option.title.replaceAll(' ', '').toLowerCase();

  const handleChange = (value) => {
    onValueChange(value);
  };

  return (
    <label className="flex flex-row gap-2">
      <input
        type="radio"
        onChange={() => handleChange(optionValue)}
        value={optionValue}
        checked={field?.value?.includes(optionValue) || false}
      />
      <span>{option.title}</span>
    </label>
  );
}

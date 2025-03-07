import * as MuiIcons from '@mui/icons-material';

export default function PillSelect({ element, field, option, onValueChange }) {
  const optionValue = option.title.replaceAll(' ', '').toLowerCase();

  const handleChange = (value) => {
    onValueChange(value);
  };

  return (
    <label key={optionValue} className="inline-flex">
      <input
        className="hidden"
        type={
          element.select === 1 || element.type === 'radio'
            ? 'radio'
            : 'checkbox'
        }
        onChange={() => handleChange(optionValue)}
        value={optionValue}
        checked={field?.value?.includes(optionValue) || false}
      />
      <span
        className={`font-normal py-1 px-3 border rounded-full cursor-pointer ${
          field.value?.includes(optionValue)
            ? 'bg-blue-100 border-blue-400'
            : 'bg-white border text-black hover:bg-blue-50'
        }`}
      >
        {option.title}
      </span>
    </label>
  );
}

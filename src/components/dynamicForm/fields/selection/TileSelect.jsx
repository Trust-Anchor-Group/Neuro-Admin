import * as MuiIcons from '@mui/icons-material';

export default function TileSelect({ element, field, option, onValueChange }) {
  const IconComponent = MuiIcons[option.icon];
  const optionValue = option.title.replaceAll(' ', '').toLowerCase();

  const handleChange = (value) => {
    onValueChange(value);
  };

  return (
    <label
      className={`flex flex-row gap-5 min-h-24 min-w-full cursor-pointer align-middle p-4 border shadow-sm rounded items-center
            ${
              field.value?.includes(optionValue)
                ? 'bg-blue-100 border-blue-400'
                : 'bg-white'
            }`}
    >
      <input
        className="hidden"
        type={element.select === 1 ? 'radio' : 'checkbox'}
        onChange={() => handleChange(optionValue)}
        value={optionValue}
        checked={field?.value?.includes(optionValue) || false}
      />
      {option.icon && (
        <div className="min-h-16 min-w-16 flex justify-center items-center bg-[#f3f8ff] text-blue-900 rounded">
          {IconComponent && <IconComponent className="w-15 h-15" />}
        </div>
      )}
      <div className="grow">
        <span>{option.title}</span>
        <p className="text-gray-600 text-xs">{option.description}</p>
      </div>
    </label>
  );
}

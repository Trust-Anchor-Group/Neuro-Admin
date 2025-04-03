import { useController } from 'react-hook-form';
import ErrorMsg from '../../messages/ErrorMsg';

export default function SelectList({ control, errors, element }) {
  const { field } = useController({
    name: element.name,
    control,
  });

  return (
    <label className="flex flex-row gap-2 items-center">
      <span>{element.label}:</span>
      <select name={element.name} {...field} className="cursor-pointer">
        {element.options.map((option) => {
          const optionValue = option.value ? option.value : option.title;
          return (
            <option key={option.title} value={optionValue.replaceAll(' ', '')}>
              {option.title}
            </option>
          );
        })}
      </select>
    </label>
  );
}

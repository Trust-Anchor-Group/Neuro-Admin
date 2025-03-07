import { useController } from 'react-hook-form';
import ErrorMsg from '../../messages/ErrorMsg';
import ElementDesc from '../../components/ElementDesc';
import PillSelect from './PillSelect';
import TileSelect from './TileSelect';
import RadioSelect from './RadioSelect';
import CheckboxSelect from './CheckboxSelect';

export default function SelectionHandler({ control, errors, element }) {
  const { field } = useController({
    name: element.name,
    control,
    defaultValue: [],
    rules: {
      required: element.required,
      validate: (value) => !element.required || (value && value.length > 0),
    },
  });

  const handleChange = (value) => {
    const prevValue = Array.isArray(field.value) ? field.value : [];
    let newValue;

    if (prevValue.includes(value)) {
      newValue = prevValue.filter((item) => item !== value);
    } else if (element.select === 1 || element.type === 'radio') {
      newValue = [value];
    } else if (prevValue.length >= element.select) {
      newValue = prevValue;
    } else {
      newValue = [...prevValue, value];
    }

    field.onChange(newValue);
  };

  const containerClasses = {
    pill: 'pills flex flex-wrap gap-1.5 mt-3 mb-3',
    tile: 'tiles flex flex-col gap-3 mt-3 mb-3',
    radio: 'radio flex flex-col gap-3 mt-3 mb-3',
    checkbox: 'checkbox flex flex-col gap-3 mt-3 mb-3',
  };

  return (
    <div>
      <ElementDesc element={element} />

      <div className={containerClasses[element.type]}>
        {element?.options.map((option) => {
          const key = option.title.replaceAll(' ', '').toLowerCase();
          switch (element.type) {
            case 'pill':
              return (
                <PillSelect
                  key={key}
                  element={element}
                  option={option}
                  field={field}
                  onValueChange={handleChange}
                />
              );
            case 'tile':
              return (
                <TileSelect
                  key={key}
                  element={element}
                  option={option}
                  field={field}
                  onValueChange={handleChange}
                />
              );
            case 'radio':
              return (
                <RadioSelect
                  key={key}
                  option={option}
                  field={field}
                  onValueChange={handleChange}
                />
              );
            case 'checkbox':
              return (
                <CheckboxSelect
                  key={key}
                  option={option}
                  field={field}
                  onValueChange={handleChange}
                />
              );
          }
        })}
      </div>

      <ErrorMsg errors={errors} element={element} />
    </div>
  );
}

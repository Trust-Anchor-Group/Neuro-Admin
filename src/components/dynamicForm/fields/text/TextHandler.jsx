import { useController } from 'react-hook-form';
import TextInput from './TextInput';
import TextArea from './Textarea';
import ErrorMsg from '../../messages/ErrorMsg';

export default function TextHandler({ control, errors, element }) {
  const { field } = useController({
    name: element.name,
    control,
    defaultValues: '',
    rules: {
      required: element.required,
      validate: (value) => !element.required || (value && value.length > 0),
    },
  });

  return (
    <>
      {['text', 'email'].includes(element.type) && (
        <TextInput errors={errors} element={element} field={field} />
      )}

      {element.type === 'textarea' && (
        <TextArea errors={errors} element={element} field={field} />
      )}

      <ErrorMsg errors={errors} element={element} />
    </>
  );
}

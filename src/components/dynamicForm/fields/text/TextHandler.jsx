import { useController } from 'react-hook-form';
import TextInput from './TextInput';
import TextArea from './Textarea';
import ErrorMsg from '../../messages/ErrorMsg';

export default function TextHandler({ control, errors, element }) {
  const { field } = useController({
    name: element.name,
    control,
    defaultValue: element.defaultValue ?? '',
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

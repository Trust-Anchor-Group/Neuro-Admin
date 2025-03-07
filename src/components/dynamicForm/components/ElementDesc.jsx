export default function Label({ element }) {
  return (
    <div>
      <span className="block tracking-wide text-black text-base">{`${
        element.label
      }${element.required ? '*' : ''}`}</span>
      <p className="text-gray-600 text-xs">{element.description}</p>
    </div>
  );
}

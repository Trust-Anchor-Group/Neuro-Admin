export default function ErrorMsg({ errors, element }) {
  return (
    errors[element.name] && (
      <span className="text-red-500 text-xs">{`This part is required`}</span>
    )
  );
}

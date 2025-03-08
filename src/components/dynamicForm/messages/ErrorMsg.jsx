export default function ErrorMsg({ errors, element }) {
  return (
    errors[element.name] && (
      <span className="text-red-500 text-xs">
        {errors[element.name].message}
      </span>
    )
  );
}

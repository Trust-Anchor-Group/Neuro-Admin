export default function SlideDesc({ title, description }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

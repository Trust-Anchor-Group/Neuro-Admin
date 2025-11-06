
export default function Header({ title }) {
  return (
     <div className="px-8 pt-6 pb-4 bg-[var(--brand-background)]">
      <h1 className="text-2xl font-bold text-[var(--brand-text-color)] font-grotesk">{title}</h1>
    </div>
  );
}

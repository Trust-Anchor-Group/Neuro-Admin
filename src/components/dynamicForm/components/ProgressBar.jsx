export default function ProgressBar({ title, currentSlide, totalSlides }) {
  const progressPercentage = (currentSlide / totalSlides) * 100;

  return (
    totalSlides > 1 && (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <span>{title}</span>
          <span>{`Step ${currentSlide} of ${totalSlides}`}</span>
        </div>
        <div className="h-1.5 bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-blue-700 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    )
  );
}

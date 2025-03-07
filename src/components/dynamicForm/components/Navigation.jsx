export default function Navigation({
  formInfo,
  slideIndex,
  setSlideIndex,
  trigger,
}) {
  const handleSlide = async (status) => {
    switch (status) {
      case 'prev':
        setSlideIndex(slideIndex - 1);
        break;
      case 'next':
        if (!(await trigger())) return;
        setSlideIndex(slideIndex + 1);
        break;
    }
  };

  return (
    <nav className="flex flex-row justify-between">
      {slideIndex === 0 && formInfo.totalSlides === 1 && (
        <button type="button" className="justify-self-end">
          Complete
        </button>
      )}
      {slideIndex === 0 && formInfo.totalSlides > 0 && (
        <button
          onClick={() => handleSlide('next')}
          type="button"
          className="ml-auto p-3 bg-blue-600 text-white rounded"
        >
          Continue
        </button>
      )}
      {slideIndex > 0 && formInfo.currentSlide !== formInfo.totalSlides && (
        <>
          <button onClick={() => handleSlide('prev')} type="button">
            Back
          </button>
          <button
            onClick={() => handleSlide('next')}
            type="button"
            className="ml-auto p-3 bg-blue-600 text-white rounded"
          >
            Continue
          </button>
        </>
      )}

      {formInfo.currentSlide === formInfo.totalSlides && (
        <>
          <button onClick={() => handleSlide('prev')} type="button">
            Back
          </button>
          <button className="ml-auto p-3 bg-blue-600 text-white rounded">
            Complete
          </button>
        </>
      )}
    </nav>
  );
}

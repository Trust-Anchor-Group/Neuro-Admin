'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import validationSchema from './validation/validationSchema';
import SelectionHandler from './fields/selection/SelectionHandler';
import TextHandler from './fields/text/TextHandler';
import Navigation from './components/Navigation';
import ProgressBar from './components/ProgressBar';
import SlideDesc from './components/SlideDesc';
import SuccessSlide from './components/SuccessSlide';
import templateFetcher from './utils/templateFetcher';
import submitHandler from './utils/submitHandler';

const DynamicForm = ({ uri, endpoint }) => {
  const [template, setTemplate] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [formInfo, setFormInfo] = useState({});
  const [dynamicSchema, setDynamicSchema] = useState({});
  const [formSuccess, setFormSuccess] = useState(false);

  // React Hook Form Handler
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    control,
    watch,
    reset,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: pageData ? yupResolver(dynamicSchema) : undefined,
  });

  useEffect(() => {
    const subscription = watch((data) => {
      console.log('Form values:', data);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    const fetchTemplate = async () => setTemplate(await templateFetcher(uri));
    fetchTemplate();
  }, []);

  useEffect(() => {
    console.log('Template', template);
    if (template) setPageData(template.slides[slideIndex]);
    setFormInfo({
      currentSlide: slideIndex + 1,
      totalSlides: template?.slides?.length,
    });
  }, [template, slideIndex]);

  // Generate validation schema
  useEffect(() => {
    console.log('page data', pageData);
    setDynamicSchema(validationSchema(pageData));
  }, [pageData]);

  useEffect(() => {
    if (dynamicSchema && Object.keys(dynamicSchema).length > 0) {
      reset(undefined, {
        keepValues: true, // Keep current values
        keepDirtyValues: true, // Don't mark as pristine
      });
    }
  }, [dynamicSchema, reset]);

  const onSubmit = async (formData) => {
    const response = await submitHandler({ formData, template, endpoint });
    if (response) {
      setFormSuccess(response);
    } else {
      console.log('Unable to send form. Please try again later');
    }
  };

  return (
    <div>
      {pageData && !formSuccess && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full min-w-[35rem] max-w-xl"
        >
          <ProgressBar
            title={pageData.step}
            currentSlide={formInfo.currentSlide}
            totalSlides={formInfo.totalSlides}
          />

          <SlideDesc
            title={pageData.title}
            description={pageData.description}
          />

          {pageData.elements.map((element) => {
            return (
              <div key={element.name}>
                {['text', 'textarea', 'email'].includes(element.type) && (
                  <TextHandler
                    errors={errors}
                    control={control}
                    element={element}
                  />
                )}

                {['pill', 'tile', 'radio', 'checkbox'].includes(
                  element.type
                ) && (
                  <SelectionHandler
                    errors={errors}
                    control={control}
                    element={element}
                  />
                )}
              </div>
            );
          })}

          <Navigation
            formInfo={formInfo}
            slideIndex={slideIndex}
            setSlideIndex={setSlideIndex}
            trigger={trigger}
          />
        </form>
      )}

      {formSuccess && <SuccessSlide />}
    </div>
  );
};

export default DynamicForm;

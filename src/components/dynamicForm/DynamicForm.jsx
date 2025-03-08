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

const DynamicForm = ({ uri, endpoint }) => {
  const [template, setTemplate] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [formInfo, setFormInfo] = useState({});
  const [dynamicSchema, setDynamicSchema] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const fetchFormContent = async () => {
    try {
      const response = await fetch(uri, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.log(`Response not ok: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);
      setTemplate(responseData);
    } catch (error) {
      console.log(`Something went wrong: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchFormContent();
  }, []);

  useEffect(() => {
    console.log('Template', template);
    if (template) setPageData(template.slides[slideIndex]);
    setFormInfo({
      currentSlide: slideIndex + 1,
      totalSlides: template?.slides?.length,
    });
  }, [template, slideIndex]);

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

  const onSumbit = (data) => {
    console.log('the form data', data);
    Object.entries(data).forEach(([fieldName, fieldValue]) => {
      for (const slide of template.slides) {
        const element = slide.elements.find((el) => el.name === fieldName);
        if (element) {
          element.value = fieldValue;
          break;
        }
      }
    });

    console.log('Final payload:', template);
  };

  return (
    pageData && (
      <form
        onSubmit={handleSubmit(onSumbit)}
        className="flex flex-col gap-5 w-full min-w-[35rem] max-w-xl"
      >
        <ProgressBar
          title={pageData.step}
          currentSlide={formInfo.currentSlide}
          totalSlides={formInfo.totalSlides}
        />

        <SlideDesc title={pageData.title} description={pageData.description} />

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

              {['pill', 'tile', 'radio', 'checkbox'].includes(element.type) && (
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
    )
  );
};

export default DynamicForm;

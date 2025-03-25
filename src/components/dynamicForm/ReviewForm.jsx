'use client';

import { useEffect, useState } from 'react';
import templateFetcher from './utils/templateFetcher';
import TextHandler from './fields/text/TextHandler';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import submitHandler from './utils/submitHandler';

export default function ReviewForm({ uri }) {
  const [template, setTemplate] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [dynamicSchema, setDynamicSchema] = useState({});
  const [commentToggle, setCommentToggle] = useState(new Map());
  const [formSuccess, setFormSuccess] = useState(null);

  // React Hook Form Handler
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    trigger,
    control,
    watch,
    reset,
    setValue,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: formData ? yupResolver(dynamicSchema) : undefined,
  });

  useEffect(() => {
    const subscription = watch((data) => {
      console.log('Form values:', data);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    const initialValues = {};
    if (template && template.slides) {
      template?.slides?.forEach((slide) => {
        slide.elements.forEach((element) => {
          initialValues[element.name] = element.comment ?? '';
        });
      });
    }

    // Store original values for reset functionality
    setOriginalFormData(initialValues);

    reset(initialValues);
    console.log('Form initialized with values:', initialValues);
  }, [template, reset]);

  useEffect(() => {
    console.log('template', template);
  }, [template]);

  /**
   * ====================================================
   * Fetch form template
   * ====================================================
   */
  useEffect(() => {
    const fetchTemplate = async () => {
      const response = await templateFetcher(uri);
      console.log('res', response);
      setTemplate(response);
    };
    fetchTemplate();
  }, []);

  /**
   * ====================================================
   * Handle comment toggles upon initialization
   * ====================================================
   */
  useEffect(() => commentToggler(), [template]);

  const commentToggler = () => {
    if (!template?.slides) return;

    const newMap = new Map();

    template.slides.forEach((slide) => {
      slide.elements.forEach((element) => {
        newMap.set(element.name, !!element.comment);
      });
    });

    setCommentToggle(newMap);
  };

  useEffect(() => {
    console.log('comment', commentToggle);
  }, [commentToggle]);

  /**
   * ====================================================
   * Comment toggle handler
   * ====================================================
   */
  const toggleComment = (elementName) => {
    console.log('toggle', elementName);

    const isCurrentlyExpanded = commentToggle.get(elementName);

    setCommentToggle((prev) => {
      const newMap = new Map(prev);
      newMap.set(elementName, !isCurrentlyExpanded);
      return newMap;
    });

    if (isCurrentlyExpanded) {
      setValue(elementName, '', {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
    }
  };

  /**
   * ====================================================
   * Discard handler
   * ====================================================
   */
  const handleDiscard = () => {
    reset(originalFormData, {
      keepValues: false,
      keepDirty: false,
      keepErrors: false,
      keepTouched: false,
      keepIsValid: false,
      keepDefaultValues: true,
    });
    console.log('Changes discarded, form reset to original state');
  };

  /**
   * ====================================================
   * Submit handler
   * ====================================================
   */
  const onSubmit = async (formData) => {
    console.log('FORM DATA', formData);
    // const response = await submitHandler({ formData, template, endpoint });
    // if (response) {
    //   setFormSuccess(response);
    // } else {
    //   console.log('Unable to send form. Please try again later');
    // }
  };

  return (
    template && (
      <div className="flex flex-col gap-5 max-w-screen-sm relative">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Form Reviewer
        </h1>
        <div className="context border rounded p-5">
          <h2 className="text-xl bold mb-2">Context:</h2>
          <ul className="flex flex-col gap-1">
            <li>
              <span className="font-bold text-sm">Form: </span>
              <span className="text-sm">{template.title}</span>
            </li>
            <li>
              <span className="font-bold text-sm">Status: </span>
              <span className="text-sm py-0.5 px-2.5 rounded-full bg-amber-100 text-amber-700 ">
                {!template.status ? 'Pending' : template.status}
              </span>
            </li>

            {template?.description && (
              <li>
                <span className="font-bold text-sm">Description: </span>
                <span className="text-sm">{template.description}</span>
              </li>
            )}
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {template.slides.map((slide) => {
            return slide.elements.map((element, index) => {
              const elementId = element.name;
              const isExpanded = commentToggle.get(elementId);
              return (
                <div
                  key={element.name}
                  className={`border p-5 rounded shadow-sm justify-between ${
                    isExpanded && 'bg-[#fffff2]'
                  }`}
                >
                  <ul className="flex flex-col gap-3">
                    <li>
                      <div className="flex flex-row">
                        {element.required ? (
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 text-xs font-normal bg-amber-100 text-amber-700 self-start">
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 text-xs font-normal bg-blue-100 text-blue-700  self-start">
                            Optional
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleComment(elementId)}
                          className="ml-auto text-sm rounded border border-gray-200 p-2 shadow-sm bg-white"
                        >
                          {isExpanded ? 'Cancel comment' : 'Comment'}
                        </button>
                      </div>
                    </li>

                    <li className="flex flex-col">
                      <span className="font-medium">Label & Description: </span>
                      <span className="text-sm">{element.label}</span>
                      <span className="text-sm">{element.description}</span>
                    </li>
                    <li className="flex flex-col">
                      <span className="font-medium">Answer:</span>
                      <div className="border bg-stone-50 p-3 rounded ">
                        {!element.value ? (
                          <span className="text-sm">N/A</span>
                        ) : (
                          <p className="text-sm">{element.value}</p>
                        )}
                      </div>
                    </li>
                    <li>
                      <div
                        className={`overflow-hidden transition-all ${
                          isExpanded ? 'h-full' : 'h-0'
                        }`}
                        id={elementId}
                      >
                        <TextHandler
                          errors={errors}
                          control={control}
                          element={{
                            label: 'Comment',
                            name: element.name,
                            type: 'textarea',
                            defaultValue: element.comment,
                          }}
                        />
                      </div>
                    </li>
                  </ul>
                </div>
              );
            });
          })}
        </form>

        <nav className="sticky bottom-8 left-0 right-0 w-full border bg-white p-4 rounded-lg shadow-lg">
          <button
            className={`p-3 rounded ${
              isDirty
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isDirty}
            onClick={handleDiscard}
          >
            Discard
          </button>
          <button
            className={`p-3 rounded ${
              isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-200 text-white cursor-not-allowed'
            }`}
            disabled={!isDirty}
          >
            Save
          </button>
        </nav>
      </div>
    )
  );
}

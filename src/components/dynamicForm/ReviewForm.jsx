'use client';

import { useEffect, useState } from 'react';
import templateFetcher from './utils/templateFetcher';
import TextHandler from './fields/text/TextHandler';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import submitHandler from './utils/submitHandler';
import { DeleteOutline } from '@mui/icons-material';
import SelectionHandler from './fields/selection/SelectionHandler';

export default function ReviewForm({ uri }) {
  const [template, setTemplate] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [dynamicSchema, setDynamicSchema] = useState({});
  const [commentToggle, setCommentToggle] = useState(new Map());
  const [formSuccess, setFormSuccess] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('pending');

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

  const formStatus = {
    pending: {
      title: 'Pending',
      class: 'bg-amber-100 text-amber-700',
    },
    approve: {
      title: 'Approved',
      class: 'bg-green-100 text-green-700',
    },
    reject: {
      title: 'Rejected',
      class: 'bg-red-100 text-red-700',
    },
    hold: {
      title: 'On hold',
      class: 'bg-blue-100 text-blue-700',
    },
  };

  useEffect(() => {
    const subscription = watch((data) => {
      console.log('Form values:', data);
      console.log('test', reviewStatus);
      setReviewStatus(formStatus[data.status]);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  /**
   * ====================================================
   * Store initial values temporary in memory
   * ====================================================
   */
  useEffect(() => {
    const initialValues = {};

    if (template && template.slides) {
      template?.slides?.forEach((slide) => {
        slide.elements.forEach((element) => {
          initialValues[element.name] = element.comment ?? '';
        });
      });

      setReviewStatus(formStatus[template.meta.status]);
    }

    initialValues['status'] = 'pending';
    initialValues['general_comment'] = '';

    // Store original values for reset functionality
    setOriginalFormData(initialValues);

    reset(initialValues);
  }, [template, reset]);

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
  useEffect(() => commentsToggler(), [template]);

  const commentsToggler = () => {
    if (!template?.slides) return;

    const newMap = new Map();

    template.slides.forEach((slide) => {
      slide.elements.forEach((element) => {
        newMap.set(element.name, !!element.comment);
      });
    });

    setCommentToggle(newMap);
  };

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

    commentsToggler();
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
        <div className="context border rounded p-5 shadow-sm">
          <ul className="flex flex-col gap-1">
            <li>
              <span className="font-bold text-sm">Form: </span>
              <span className="text-sm">{template.title}</span>
            </li>
            <li>
              <span className="font-bold text-sm">Status: </span>
              <span
                className={`inline-flex text-sm rounded px-2.5 py-0.5  ${reviewStatus.class}`}
              >
                {reviewStatus.title}
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
                          <span className="inline-flex items-center rounded border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 text-xs font-normal bg-amber-100 text-amber-700 self-start">
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 text-xs font-normal bg-blue-100 text-blue-700  self-start">
                            Optional
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleComment(elementId)}
                          className={`ml-auto text-sm rounded border border-gray-200 p-2 shadow-sm bg-white ${
                            isExpanded ? 'border-red-700' : ''
                          }`}
                        >
                          {isExpanded ? (
                            <div className="flex gap-1 items-center text-red-700">
                              <DeleteOutline
                                style={{ width: '18px', height: '18px' }}
                              />
                              <span>Discard comment</span>
                            </div>
                          ) : (
                            'Comment'
                          )}
                        </button>
                      </div>
                    </li>

                    <li className="flex flex-col">
                      <span className="font-medium">Field context: </span>
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

        <nav className="flex gap-2 sticky bottom-8 left-0 right-0 w-full border bg-white p-4 rounded-lg shadow-lg">
          <div className="flex flex-row gap-3 ml-auto">
            <div className="border rounded px-2 flex align-middle">
              <SelectionHandler
                errors={errors}
                control={control}
                element={{
                  label: 'Status',
                  name: 'status',
                  type: 'select',
                  options: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Reject', value: 'reject' },
                    { title: 'Approve', value: 'approve' },
                    { title: 'On hold', value: 'hold' },
                  ],
                }}
              />
            </div>
            <div className="flex flex-row gap-1">
              <button
                className={`p-2 rounded border ${
                  isDirty ? 'text-black' : ' text-gray-400 cursor-not-allowed'
                }`}
                disabled={!isDirty}
                onClick={handleDiscard}
              >
                Discard
              </button>
              <button
                className={`p-2 rounded px-8 ${
                  isDirty
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-200 text-white cursor-not-allowed'
                }`}
                disabled={!isDirty}
              >
                Save
              </button>
            </div>
          </div>
        </nav>
      </div>
    )
  );
}

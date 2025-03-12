'use client';

import { useEffect, useState } from 'react';
import templateFetcher from './utils/templateFetcher';
import TextHandler from './fields/text/TextHandler';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export default function ReviewForm({ uri }) {
  const [form, setForm] = useState(null);
  const [dynamicSchema, setDynamicSchema] = useState({});
  const [commentToggle, setCommentToggle] = useState(new Map());

  // React Hook Form Handler
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    control,
    watch,
    reset,
    setValue,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: form ? yupResolver(dynamicSchema) : undefined,
  });

  useEffect(() => {
    const fetchForm = async () => {
      const response = await templateFetcher(uri);
      setForm(response);
    };
    fetchForm();
  }, []);

  useEffect(() => {
    const newMap = new Map();
    form?.slides?.map((slide) => {
      slide.elements.map((element) => {
        element.comment
          ? newMap.set(element.name, true)
          : newMap.set(element.name, false);
        setCommentToggle(newMap);
      });
    });
  }, [form]);

  useEffect(() => {
    console.log('comment', commentToggle);
  }, [commentToggle]);

  const toggleComment = (elementName) => {
    console.log('toggle', elementName);
    setCommentToggle((prev) => {
      const newMap = new Map(prev);
      newMap.set(elementName, !prev.get(elementName));

      //if (!prev.get(elementName)) setValue(elementName, '');

      return newMap;
    });
  };

  return (
    form && (
      <div className="flex flex-col gap-5 max-w-screen-sm relative">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Form Reviewer
        </h1>
        <div className="context border rounded p-5">
          <h2 className="text-xl bold mb-2">Context:</h2>
          <ul className="flex flex-col gap-1">
            <li>
              <span className="font-bold text-sm">Form: </span>
              <span className="text-sm">{form.title}</span>
            </li>
            <li>
              <span className="font-bold text-sm">Status: </span>
              <span className="text-sm py-0.5 px-2.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {!form.status ? 'Pending' : form.status}
              </span>
            </li>

            {form?.description && (
              <li>
                <span className="font-bold text-sm">Description: </span>
                <span className="text-sm">{form.description}</span>
              </li>
            )}
          </ul>
        </div>

        {form.slides.map((slide) => {
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
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 text-xs font-normal bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 self-start">
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 text-xs font-normal bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 self-start">
                          Optional
                        </span>
                      )}
                      <button
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

        <nav className="sticky bottom-8 left-0 right-0 w-full bg-white border shadow-lg p-3 rounded-xl">
          <button className="p-3 rounded bg-white">Discard</button>
          <button className="p-3 rounded bg-blue-500 text-white">Save</button>
        </nav>
      </div>
    )
  );
}

"use client";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {v4 as uuidv4} from "uuid";

const DynamicForm = ({uri, endpoint}) => {

    const [template, setTemplate] = useState(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageData, setPageData] = useState(null);
    const [formInfo, setFormInfo] = useState({});

    const {
        register,
        handleSubmit,
        formState: {errors},
        trigger
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

    const fetchFormContent = async () => {
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                },
                credentials: "include"
            });

            if(!response.ok){
                console.log(`Response not ok: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('Response data:', responseData);
            setTemplate(responseData);
        } catch (error){
            console.log(`Something went wrong: ${error.message}`)
        }
    }

    useEffect(() => {
        fetchFormContent();
    }, []);

    useEffect(() => {
        console.log('Template', template);
        if(template) setPageData(template.pages[pageIndex]);
        setFormInfo({
            currentSlide: pageIndex + 1,
            totalSlides: template?.pages?.length
        });
    }, [template, pageIndex]);

    const onSumbit = (data) => {
        console.log('the form data', data);
    }

    const handleSlide = async (status) => {
        switch (status) {
            case "prev":
                setPageIndex(pageIndex-1);
                break;
            case "next":
                if(!await trigger()) return;
                setPageIndex(pageIndex+1);
                break;
        }
    }

    return (pageData &&
        <form
            onSubmit={handleSubmit((data) => console.log('Submit',data))}
            className="flex flex-col gap-5 w-full max-w-lg"
        >
            {
                template?.pages?.length > 1 && (
                    <div>
                        <span>{pageData.title}</span>
                        <span>{`Step ${formInfo.currentSlide}/${formInfo.totalSlides}`}</span>
                    </div>
                )
            }
                <p>{pageData.description}</p>
                {pageData.inputs.map((input) => {
                    return (
                        <label key={input.name} className="flex flex-col gap-2">
                            <span>{`${input.label}${input.required ? '*' : ''}`}</span>
                            <input
                                className={`border p-3 shadow-1g ${errors[input.name] ? 'border-red-500' : ''}`}
                                name={input.name}
                                type={input.type}
                                {...register(input.name, {
                                    required: input.required
                                })}
                            />

                            {errors[input.name]  && <span className="text-red-500 text-xs">{`${input.label} is required`}</span>}

                            {
                                input.comment && (
                                    <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
                                        <span className="font-bold">Feedback:</span>
                                        <p>{input.comment}</p>
                                    </div>
                                )
                            }
                        </label>
                    )
                })}

            <nav>
            {

                pageIndex === 0 && formInfo.totalSlides === 1 ? (<button type="button">Complete</button>) :
                pageIndex === 0 && formInfo.totalSlides > 0 ? (<button onClick={() => handleSlide('next')} type="button">Continue</button>) :
                        pageIndex > 0 && formInfo.currentSlide !== formInfo.totalSlides ? (
                    <>
                        <button onClick={() => handleSlide('prev')} type="button">Back</button>
                        <button onClick={() => handleSlide('next')} type="button">Continue</button>
                    </>
                ) : formInfo.currentSlide === formInfo.totalSlides ? (
                    <>
                        <button onClick={() => handleSlide('prev')} type="button">Back</button>
                        <button>Complete</button>
                    </>
                ) : null

            }
            </nav>



        </form>
    )

}

export default DynamicForm;
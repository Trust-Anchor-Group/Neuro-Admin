"use client";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {v4 as uuidv4} from "uuid";
import { InputElement } from "./InputElement";
import { PageBar } from "../PageBar";
import { Button } from "@/components/ui/button";
import { ButtonForm } from "./ButtonForm";

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
                        <PageBar title={pageData.title} currentSlide={formInfo.currentSlide} totalSlides={formInfo.totalSlides}/>
                    </div>
                )
            }
                <p>{pageData.description}</p>
                {pageData.inputs.map((input,index) => {
                    return (
                        <div key={index}>
                            <InputElement
                                key={input.name}
                                label={input.label}
                                name={input.name}
                                type={input.type}
                                register={register}
                                errors={errors}
                                required={input.required}
                                comment={input.comment}
                            />
                        </div>
                    )
                })}

            <nav>
            {

                pageIndex === 0 && formInfo.totalSlides === 1 ? (<ButtonForm handleSlide={handleSlide} handleSlideProp={'next'} textColor={'text-white'} bgColor={'bg-blue-500'}
                    buttonText={'Complete'}/>) :
                pageIndex === 0 && formInfo.totalSlides > 0 ? (<ButtonForm handleSlide={handleSlide} handleSlideProp={'next'} textColor={'text-white'} bgColor={'bg-blue-500'}
                    buttonText={'Complete'}/>) :
                        pageIndex > 0 && formInfo.currentSlide !== formInfo.totalSlides ? (
                    <>
                    <div className="flex justify-between items-center">
                        <ButtonForm handleSlide={handleSlide} handleSlideProp={'prev'} textColor={'text-white'} bgColor={'bg-blue-500'}
                    buttonText={'Back'}/>
                               <ButtonForm handleSlide={handleSlide} handleSlideProp={'Next'} textColor={'text-white'} bgColor={'bg-blue-500'}
                    buttonText={'Continue'}/>
                    </div>
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
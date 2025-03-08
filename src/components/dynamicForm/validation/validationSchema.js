import * as Yup from 'yup';
import emailValidation from './emailValidation';
import textValidation from './textValidation';
import selectValidation from './selectValidation';

export default function validationSchema(slideData) {

    if (!slideData) return Yup.object().shape({});

    const schemaFields = {};

    slideData.elements.forEach(element => {

        switch (element.type) {
            case 'email':
                schemaFields[element.name] = emailValidation(element);
                break;
            case 'text':
            case 'textarea':
                schemaFields[element.name] = textValidation(element);
                break;
            case 'radio':
            case 'checkbox':
            case 'tile':
            case 'pill':
                schemaFields[element.name] = selectValidation(element);
                break;
        }


    });

    return Yup.object().shape(schemaFields);
}
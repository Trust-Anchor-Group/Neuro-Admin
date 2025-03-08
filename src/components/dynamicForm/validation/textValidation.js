import * as Yup from 'yup';

const textValidation = (element) => {
    return element.required
        ? Yup.string().required(`This field is required`)
        : Yup.string();
}

export default textValidation;
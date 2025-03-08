import * as Yup from 'yup';

const emailValidation = (element) => {
    return element.required
        ? Yup.string().email('Invalid email format').required('Email is required')
        : Yup.string().email('Invalid email format');
}

export default emailValidation;
import * as Yup from 'yup';

const selectValidation = (element) => {
    if (element.required) {
        return Yup.array()
            .min(1, element.type === 'radio' || element.select === 1 ? 'Please select an option' : 'Please select at least one option');
    } else {
        return Yup.array();
    }
}

export default selectValidation;
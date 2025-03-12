export default async function submitHandler({ formData, template, endpoint }) {

    Object.entries(formData).forEach(([fieldName, fieldValue]) => {
        for (const slide of template.slides) {
            const element = slide.elements.find((el) => el.name === fieldName);
            if (element) {
                element.value = fieldValue;
                break;
            }
        }
    });

    // try {
    //     const response = await fetch(endpoint, {
    //         method: 'POST',
    //         headers: {
    //             'content-type': 'application/json'
    //         },
    //         body: JSON.stringify(template),
    //         credentials: 'include'
    //     })

    //     if (!response.ok) {
    //         throw new Error(`Response not ok: ${response.statusText}`);
    //     }
    // } catch (error) {
    //     throw new Error(`Could not post form data: ${error.message}`);
    // }

    console.log('the form data', template);

    return true;
};
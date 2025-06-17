export function messageEmail(state){
let title
let message
    switch (state) {
        case 'Approved':
                title = 'Your ID application has been approved'
                message ='Your Neuro ID application has been approved. Please log in here to access your ID:'
            break;
        case 'Obsoleted':     
                title ='Your ID application has been obsoleted',
                message ='Your Neuro ID application has been obsoleted.'
                break;
         case 'Compromised':
                title ='Your ID application has been compromised',
                message ='Your Neuro ID application has been compromised.'
                break;
         case 'Rejected':
                title ='Your ID application has been denied',
                message ='Your Neuro ID application has been denied. Follow this link to re-apply:'
                break;       
        default:
            break;
    }

    return { title, message }

}


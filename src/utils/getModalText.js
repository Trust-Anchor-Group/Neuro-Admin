export function getModalText(action, label) {
  let textState
  let textVerifiedEmail
  switch (action) {
    case 'Approved':
      textState = `Are you sure you want to approve this id application?`
      textVerifiedEmail = `The user will be notified by email.`
    case 'Rejected':
      textState = `Are you sure you want to reject this id application?`
      textVerifiedEmail = `The user will be notified by email.`
    case 'Compromised':
      textState = `Are you sure you want to change this identity to compromised?`
      textVerifiedEmail = `The user will be notified by email.`
    case 'Obsoleted':
      textState =`Are you sure you want to change this identity to obsoleted?`
      textVerifiedEmail = `The user will be notified by email.`
    default:
  }

  return {textState,textVerifiedEmail}
}
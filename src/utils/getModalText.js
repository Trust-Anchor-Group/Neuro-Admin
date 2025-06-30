export function getModalText(action, label) {
  let textState
  let textVerifiedEmail

  switch (action) {
    case 'Approved':
      textState = `Are you sure you want to approve this ID application?`
      textVerifiedEmail = `The user will be notified by email.`
      break
    case 'Rejected':
      textState = `Are you sure you want to reject this ID application?`
      textVerifiedEmail = `The user will be notified by email.`
      break
    case 'Compromised':
      textState = `Are you sure you want to change this identity to compromised?`
      textVerifiedEmail = `The user will be notified by email.`
      break
    case 'Obsoleted':
      textState = `Are you sure you want to change this identity to obsoleted?`
      textVerifiedEmail = `The user will be notified by email.`
      break
    default:
      textState = `Are you sure?`
      textVerifiedEmail = `The user will be notified.`
  }

  return { textState, textVerifiedEmail }
}

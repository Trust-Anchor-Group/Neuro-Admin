export function getModalText(action, label) {
  switch (action) {
    case 'Approved':
      return `Are you sure you want to approve this id application?`
    case 'Rejected':
      return `Are you sure you want to reject this id application?`
    case 'Compromised':
      return `Are you sure you want to change this identity to compromised?`
    case 'Obsoleted':
      return `Are you sure you want to change this identity to obsoleted?`
    default:
      return `Are you sure you want to proceed with the action: ${label}?`
  }
}

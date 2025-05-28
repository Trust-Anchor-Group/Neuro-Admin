export function getModalText(action, label) {
  switch (action) {
    case 'Approved':
      return `Are you sure you want to approve this user?`
    case 'Rejected':
      return `Are you sure you want to reject this user?`
    case 'Compromised':
      return `Are you sure you want to change this identity as compromised?`
    case 'Obsoleted':
      return `Are you sure you want to deactivate this identity?`
    case 'Created':
      return `Are you sure you want to create this identity?`
    default:
      return `Are you sure you want to proceed with the action: ${label}?`
  }
}

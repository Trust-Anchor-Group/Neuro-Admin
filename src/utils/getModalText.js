export function getModalText(action, label, t) {
  const c = t?.modal?.confirm;

  switch (action) {
    case 'Approved':
      return {
        textState: c?.approved?.state ?? 'Are you sure you want to approve this ID application?',
        textVerifiedEmail: c?.approved?.email ?? 'The user will be notified by email.'
      };
    case 'Rejected':
      return {
        textState: c?.rejected?.state ?? 'Are you sure you want to reject this ID application?',
        textVerifiedEmail: c?.rejected?.email ?? 'The user will be notified by email.'
      };
    case 'Compromised':
      return {
        textState: c?.compromised?.state ?? 'Are you sure you want to change this identity to compromised?',
        textVerifiedEmail: c?.compromised?.email ?? 'The user will be notified by email.'
      };
    case 'Obsoleted':
      return {
        textState: c?.obsoleted?.state ?? 'Are you sure you want to change this identity to obsoleted?',
        textVerifiedEmail: c?.obsoleted?.email ?? 'The user will be notified by email.'
      };
    default:
      return {
        textState: c?.default?.state ?? 'Are you sure?',
        textVerifiedEmail: c?.default?.email ?? 'The user will be notified.'
      };
  }
}




export function Validate(form, setErrorMessage) {
  const email = form.email?.trim();

  if (!email || email.length <= 5) {
    setErrorMessage("Email must be longer than 5 characters.");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    setErrorMessage("Invalid email address.");
    return false;
  }

 
  setErrorMessage("")
  return true;
}
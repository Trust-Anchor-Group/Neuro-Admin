export function CreateUserData(user) {
  if (!user) return null;


  const hasData = !!user.data;
  const data = hasData ? user.data : user;


  const account = data.account || {};  
  const properties = data.properties || {};
  const profile = user

  return {
    name:
      (properties.FIRST && properties.LAST)
        ? `${properties.FIRST} ${properties.LAST}`
        : (account.firstName && account.lastNames)
        ? `${account.firstName} ${account.lastNames}`
        : account.userName || profile.name || "N/A", 

    account: account.userName || account || "N/A",  
    email: properties.EMAIL || account.eMail || profile.email || "N/A",  
    phone: properties.PHONE || account.phoneNr || profile.phone || "N/A",  
    country: properties.COUNTRY || account.country || profile.country || "N/A",  
    created: account.created
      ? new Date(account.created * 1000).toLocaleDateString("sv-SE", {
          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        })
      : "N/A",  
  };
}

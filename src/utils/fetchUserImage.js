export const fetchUserImage = async (legalId) => {
  try {
    const response = await fetch("/api/legalIdPicture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legalId }),
    });

    if (!response.ok) throw new Error("Failed to fetch user image");

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching user image:", error);
    return null;
  }
};

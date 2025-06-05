

export function dateConverter(unixTimestamp){
    const date = new Date(unixTimestamp * 1000);  // Multiplicera med 1000 för att få millisekunder
    return date.toLocaleString("sv-SE");
}
export function getAge(birthDate) {
    let today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

export function parseDate(date, format, delimeter) {
    const formatLowerCase = format.toLowerCase();
    const formatItems = formatLowerCase.split(delimeter);
    const dateItems = date.split(delimeter);
    const monthIndex = formatItems.indexOf("mm");
    const dayIndex = formatItems.indexOf("dd");
    const yearIndex = formatItems.indexOf("yyyy");

    let month = parseInt(dateItems[monthIndex]);
    month -= 1;

    const formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
    return formatedDate;
}

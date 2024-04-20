exports.parseDate = (date, format, delimeter) => {
    const formatLowerCase = format.toLowerCase();
    const formatItems = formatLowerCase.split(delimeter);
    const dateItems = date.split(delimeter);

    const monthIndex = formatItems.indexOf("mm");
    const dayIndex = formatItems.indexOf("dd");
    const yearIndex = formatItems.indexOf("yyyy");

    const month = parseInt(dateItems[monthIndex]);
    const formatedDate = new Date(dateItems[yearIndex], month - 1, dateItems[dayIndex]);

    return isNaN(formatedDate) ? null : formatedDate;
}

exports.getAge = (birthDate) => {
    let today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

exports.parseDateTime = (date, format, dateDelimeter, timeDelimeter) => {
    const formatLowerCase = format.toLowerCase();
    const formatDateItems = formatLowerCase.split(" ")[0].split(dateDelimeter);
    const formatTimeItems = formatLowerCase.split(" ")[1].split(timeDelimeter);
    
    const dateItems = date.split(" ")[0].split(dateDelimeter);
    const timeItems = date.split(" ")[1].split(timeDelimeter)

    const minuteIndex = formatTimeItems.indexOf("mi");
    const hourIndex = formatTimeItems.indexOf("hh");
    const monthIndex = formatDateItems.indexOf("mm");
    const dayIndex = formatDateItems.indexOf("dd");
    const yearIndex = formatDateItems.indexOf("yyyy");

    const month = parseInt(dateItems[monthIndex]);
    const formatedDate = new Date(dateItems[yearIndex], month - 1, dateItems[dayIndex], timeItems[hourIndex], timeItems[minuteIndex]);

    return isNaN(formatedDate) ? null : formatedDate;
}

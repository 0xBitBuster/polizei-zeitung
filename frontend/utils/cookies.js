export function setCookie(name, value, expiresInDays) {
    if (expiresInDays) {
        const date = new Date();
        date.setTime(date.getTime() + (expiresInDays * 24 * 60 * 60 * 1000));
    
        document.cookie = `${name}=${value}; Expires=${date.toUTCString()}; Path=/;`;
    } else {
        document.cookie = `${name}=${value}; Path=/;`;
    }
}

export function getCookie(name) {
    return ('; ' + document.cookie).split(`; ${name}=`).pop().split(';')[0]
}

export function deleteCookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

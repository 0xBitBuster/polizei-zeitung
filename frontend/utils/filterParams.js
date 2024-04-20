export function getNewSearchParams(filter, page) {
    const nonEmptyFilter = Object.assign({}, filter);

    // Remove empty fields
    for (let key of Object.keys(nonEmptyFilter)) {
        if (!nonEmptyFilter[key] || nonEmptyFilter[key] === "egal")
            delete nonEmptyFilter[key];
    }

    if (page && page !== 1) {
        nonEmptyFilter.seite = page;
    } 
    
    const urlSearchParams = new URLSearchParams(nonEmptyFilter).toString()
    return urlSearchParams === "" ? "" : `?${urlSearchParams}`;
}
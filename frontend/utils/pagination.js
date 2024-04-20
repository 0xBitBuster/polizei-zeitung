export function calculatePagination(totalItems, itemsPerPage, queryPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    let currentPage = 1;

    if (Number(queryPage) >= 1) {
        currentPage = Number(queryPage);
    }

    let offset = (currentPage - 1) * itemsPerPage;
    let pageNumbers = []
    for (let i = currentPage - 3; i <= currentPage + 3; i++) {
        if (i < 1) continue;
        if (i > totalPages) break;

        pageNumbers.push(i);
    }

    return {
        currentPage,
        pageNumbers,
        offset
    }
}
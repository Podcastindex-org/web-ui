export const cleanSearchQuery = (queryString: string) => {
    if (!queryString) {
        return ''
    }
    let queryAr = queryString.split('=')
    return decodeURIComponent(queryAr[1])
}

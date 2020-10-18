import queryStringHelper from 'query-string'


export const cleanSearchQuery = (queryString: string) => {
    let params = queryStringHelper.parse(queryString)
    let queryAr = params.q
    if (!queryAr) {
        return ''
    }
    return decodeURIComponent(<string>queryAr)
}

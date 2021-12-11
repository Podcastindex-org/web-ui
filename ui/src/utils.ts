import queryStringHelper from 'query-string'

export const updateTitle = (tile?: string) => {
    let newTitle = 'Podcastindex.org'
    if (tile !== undefined)
        newTitle = tile + " | " + newTitle
    document.title = newTitle
}

export const cleanSearchQuery = (queryString: string, field: string = "q") => {
    let params = queryStringHelper.parse(queryString)
    let queryAr = params[field]
    if (!queryAr) {
        return ''
    }

    return decodeURIComponent(<string>queryAr)
}

export const truncateString = (input: string) => {
    if (input.length > 200)
        return `${input.substring(0, 300)}...`
    else
        return input
}

export const titleizeString = (input: string) => {
    return input
        .split(/\W+/gi)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}

export const getPrettyDate = (time: number, includeTime: boolean = true) => {
    // Javascript epoch is in milliseconds; datePublished is in seconds
    const dateObj = new Date(time * 1000)
    if (includeTime)
        return dateObj.toLocaleString()
    return dateObj.toLocaleDateString()
}

export const fixURL = (url: string) => {
    if (url === undefined || url === null) {
        return url
    } else {
        url = url.trim()
        if (url !== '') {
            let prefix = url.substring(0, 4).toLowerCase()
            if (prefix !== 'http')
                url = `http://${url}`
        }
    }
    return url
}

export const isValidURL = (urlString: string) => {
    try {
        let url = new URL(urlString);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

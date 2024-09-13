import queryStringHelper from 'query-string'
import NoImage from '../images/no-cover-art.png'

export const updateTitle = (tile?: string) => {
    let newTitle = 'Podcastindex.org'
    if (tile !== undefined)
        newTitle = tile + ' | ' + newTitle
    document.title = newTitle
}

export const encodeSearch = (searchString: string): string => {
    return encodeURIComponent(searchString)
}

export const cleanSearchQuery = (queryString: string, field: string = 'q'): string => {
    let params = queryStringHelper.parse(queryString)
    let queryAr = params[field] as string
    if (!queryAr) {
        return ''
    }
    return queryAr
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

export const getISODate = (time: number): string => {
    // Javascript epoch is in milliseconds; datePublished is in seconds
    const dateObj = new Date(time * 1000)
    return dateObj.toISOString()
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
        let url = new URL(urlString)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (_) {
        return false
    }
}

/**
 * Return the best image available
 *
 * If item doesn't contain an image, returns a placeholder image
 *
 * @param item the episode, item, or feed to get image for
 */
export const getImage = (item) => {
    return item.artwork || item.image || item.feedImage || NoImage
}

/**
 * Encodes text to URL safe base64
 *
 * Based on example from https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
 *
 * @param text the text to encode
 * @return the base 64 encoded text
 */
export const encodeURLSafeBase64 = (text: string): string => {
    const binString = Array.from(new TextEncoder().encode(text), (byte) =>
        String.fromCodePoint(byte),
    ).join('')
    // since episodes.fm doesn't need trailing =, remove them
    return btoa(binString).replace(/=+$/, '');
}

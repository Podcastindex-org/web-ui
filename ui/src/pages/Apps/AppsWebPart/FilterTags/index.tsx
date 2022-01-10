import React, { useState, useEffect } from 'react'

import './styles.scss'

function FilterTags({ apps, setFilteredApps, filterTypes }) {
    const [appTypeFilters, setAppTypeFilters] = useState(filterTypes.appType)
    const [supportedElementsFilters, setSupportedElementsFilters] = useState(
        filterTypes.supportedElements
    )
    const [platformsFilters, setPlatformsFilters] = useState(
        filterTypes.platforms
    )

    useEffect(() => {
        setAppTypeFilters(new Set(filterTypes.appType))
        setSupportedElementsFilters(new Set(filterTypes.supportedElements))
        setPlatformsFilters(new Set(filterTypes.platforms))
    }, [filterTypes])

    useEffect(filterApps, [
        appTypeFilters,
        supportedElementsFilters,
        platformsFilters,
    ])

    function filterAppType(appList) {
        let filtered = appList.filter((app) => appTypeFilters.has(app.appType))
        return filtered
    }

    function filterSupportedElements(appList) {
        let filtered = appList.filter(({ supportedElements }) => {
            let elements = supportedElements.map(
                (element) => element.elementName
            )

            const filteredArray = elements.filter((value) =>
                supportedElementsFilters.has(value)
            )
            return filteredArray.length > 0
        })
        return filtered
    }

    function filterPlatforms(appList) {
        let filtered = appList.filter(({ platforms }) => {
            const filteredArray = platforms.filter((value) =>
                platformsFilters.has(value)
            )
            return filteredArray.length > 0
        })
        return filtered
    }

    function filterApps() {
        let filteredApps = filterAppType(
            filterSupportedElements(filterPlatforms([...apps]))
        )
        setFilteredApps(filteredApps)
    }

    function handleTagClick(e) {
        const { type, tag } = e.target.dataset

        if (tag === 'None') {
            if (type === 'appType') {
                setAppTypeFilters(new Set())
            } else if (type === 'supportedElements') {
                setSupportedElementsFilters(new Set())
            } else if (type === 'platforms') {
                setPlatformsFilters(new Set())
            }
            let elements = document.querySelectorAll(`[data-type='${type}']`)
            for (const [index, el] of elements.entries()) {
                if (index > 0) {
                    el.classList.add('inactive')
                    el.classList.remove('active')
                }
            }
            const selectors = document.querySelectorAll(`[data-tag='${tag}']`)
            for (const sel of selectors) {
                let s = sel as HTMLElement
                if (s.dataset.type === type) {
                    s.innerText = 'All'
                    s.dataset.tag = 'All'
                }
            }
        } else if (tag === 'All') {
            if (type === 'appType') {
                setAppTypeFilters(new Set(filterTypes.appType))
            } else if (type === 'supportedElements') {
                setSupportedElementsFilters(
                    new Set(filterTypes.supportedElements)
                )
            } else if (type === 'platforms') {
                setPlatformsFilters(new Set(filterTypes.platformElements))
            }
            setAppTypeFilters(new Set(filterTypes.appType))
            let elements = document.querySelectorAll(`[data-type='${type}']`)
            for (const [index, el] of elements.entries()) {
                if (index > 0) {
                    el.classList.add('active')
                    el.classList.remove('inactive')
                }
            }
            const selectors = document.querySelectorAll(`[data-tag='${tag}']`)
            for (const sel of selectors) {
                let s = sel as HTMLElement
                if (s.dataset.type === type) {
                    s.innerText = 'None'
                    s.dataset.tag = 'None'
                }
            }
        } else {
            if (e.target.classList.contains('active')) {
                e.target.classList.add('inactive')
                e.target.classList.remove('active')
                removeTag(type, tag)
            } else {
                e.target.classList.add('active')
                e.target.classList.remove('inactive')
                addTag(type, tag)
            }
        }
    }

    function addTag(type, tag) {
        if (type === 'appType') {
            let a = new Set(appTypeFilters)
            a.add(tag)
            setAppTypeFilters(a)
        } else if (type === 'supportedElements') {
            let e = new Set(supportedElementsFilters)
            e.add(tag)
            setSupportedElementsFilters(e)
        } else if (type === 'platforms') {
            let p = new Set(platformsFilters)
            p.add(tag)
            setPlatformsFilters(p)
        }
    }

    function removeTag(type, tag) {
        if (type === 'appType') {
            let a = new Set(appTypeFilters)
            a.delete(tag)
            setAppTypeFilters(a)
        } else if (type === 'supportedElements') {
            let e = new Set(supportedElementsFilters)
            e.delete(tag)
            setSupportedElementsFilters(e)
        } else if (type === 'platforms') {
            let p = new Set(platformsFilters)
            p.delete(tag)
            setPlatformsFilters(p)
        }
    }

    return (
        <div className="podcastIndexAppsFilterTagContainer">
            <h4>Filters</h4>
            {Object.keys(filterTypes).map((key, i) => {
                let type = ''
                if (key === 'appType') {
                    type = 'App Type'
                } else if (key === 'supportedElements') {
                    type = 'Supported Elements'
                } else if (key === 'platforms') {
                    type = 'Platforms'
                }
                let tags = [...filterTypes[key]].map((tag) => tag)
                return (
                    <div className="podcastIndexAppsFilterCategories" key={i}>
                        <div>{type}</div>
                        {[
                            'None',
                            ...tags.sort((a, b) => a.localeCompare(b)),
                        ].map((tag, j) => (
                            <button
                                key={j}
                                className="active"
                                onClick={handleTagClick}
                                data-type={key}
                                data-tag={tag}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )
            })}
        </div>
    )
}

export default FilterTags

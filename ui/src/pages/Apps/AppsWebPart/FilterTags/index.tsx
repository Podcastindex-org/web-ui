import React, { useState, useEffect } from 'react'

import './styles.scss'

function FilterTags({ apps, setFilteredApps, filterTypes }) {
    const [appTypeFilters, setAppTypeFilters] = useState(new Set() as Set<string>)
    const [supportedElementsFilters, setSupportedElementsFilters] = useState(
        new Set() as Set<string>
    )
    const [platformsFilters, setPlatformsFilters] = useState(new Set() as Set<string>)
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    useEffect(filterApps, [
        appTypeFilters,
        supportedElementsFilters,
        platformsFilters,
    ])

    function filterApps() {
        let filteredApps = filterAppType(
            filterSupportedElements(filterPlatforms([...apps]))
        )
        setFilteredApps(filteredApps)
    }

    function filterAppType(appList) {
        let filtered = appList.filter(({ appType }) => {
            return getIntersection(appType, appTypeFilters)
        })
        return filtered
    }

    function filterSupportedElements(appList) {
        let filtered = appList.filter(({ supportedElements }) => {
            let elements = supportedElements.map(
                (element) => element.elementName
            )
            return getIntersection(elements, supportedElementsFilters)
        })
        return filtered
    }

    function filterPlatforms(appList) {
        let filtered = appList.filter(({ platforms }) => {
            return getIntersection(platforms, platformsFilters)
        })
        return filtered
    }

    function getIntersection(a, b) {
        const intersection = Array.from(a).filter((x) => b.has(x))

        return intersection.length === b.size
    }

    function getFilterStateByType(type: string): Set<string> {
        switch(type) {
            default:
            case 'appType': 
                return appTypeFilters;
            case 'supportedElements':
                return supportedElementsFilters;
            case 'platforms':
                return platformsFilters;
        }
    }

    function getFilterStateSetterByType(type: string): React.Dispatch<React.SetStateAction<Set<string>>> {
        switch(type) {
            default:
            case 'appType': 
                return setAppTypeFilters;
            case 'supportedElements':
                return setSupportedElementsFilters;
            case 'platforms':
                return setPlatformsFilters;
        }
    }

    function handleClearClick(e: React.MouseEvent<HTMLButtonElement>) {
        const type = e.currentTarget.getAttribute('type') as string

        getFilterStateSetterByType(type)(new Set());
    }

    function handleTagClick(e) {
        const { type, tag } = e.target.dataset

        const filterStateCopy = new Set(getFilterStateByType(type));

        if(filterStateCopy.has(tag)) {
            filterStateCopy.delete(tag);
        }
        else {
            filterStateCopy.add(tag)
        }

        getFilterStateSetterByType(type)(filterStateCopy);
    }

    function toggleFilters(e) {
        const container = document.querySelector(
            '.podcastIndexAppsFilterCategories'
        ) as HTMLElement

        // The collapse and expand functions are requires because
        // it is not possible to animate to height: auto with CSS
        // more at https://carlanderson.xyz/how-to-animate-on-height-auto/
        if (filtersExpanded) {
            collapseSection(container)
        } else {
            expandSection(container)
        }

        setFiltersExpanded(!filtersExpanded)
    }

    function collapseSection(element) {
        var sectionHeight = element.scrollHeight

        var elementTransition = element.style.transition
        element.style.transition = ''

        requestAnimationFrame(function () {
            element.style.height = sectionHeight + 'px'
            element.style.transition = elementTransition

            requestAnimationFrame(function () {
                element.style.height = 0 + 'px'
            })
        })
    }

    function expandSection(element) {
        var sectionHeight = element.scrollHeight

        element.style.height = sectionHeight + 'px'

        element.addEventListener('transitionend', function (e) {
            element.removeEventListener('transitionend', arguments.callee)
            element.style.height = null
        })
    }

    function isTagButtonActive(type, tag): boolean {
        const state = getFilterStateByType(type);

        return state.has(tag);
    }

    /**
     * Format the tag name for display in the UI by capitalizing 
     * the first letter of each word in the tag (i.e. podcast player => Podcast Player)
     */
    function formatTagName(tag: string): string {
        return tag
            .split(' ')
            .map(
                (v) =>
                    v.charAt(0).toUpperCase() +
                    v.slice(1)
            )
            .join(' ')
    }

    return (
        <div className="podcastIndexAppsFilterTagContainer">
            <h4 onClick={toggleFilters}>
                Filters<span className="podcastIndexAppsFilterArrow">{filtersExpanded ? '▲': '▼'}</span>
            </h4>
            <div className="podcastIndexAppsFilterCategories">
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
                        <div className="podcastIndexAppsFilterTags" key={i}>
                            <div>{type}</div>
                            <button 
                                className="clear-button" 
                                onClick={handleClearClick}>
                                    Clear
                            </button>
                            {[
                                ...tags.sort((a, b) => a.localeCompare(b)),
                            ].map((tag, j) => (
                                <button
                                    key={j}
                                    className={isTagButtonActive(key, tag) ? 'active' : 'inactive'}
                                    onClick={handleTagClick}
                                    data-type={key}
                                    data-tag={tag}
                                >
                                    {formatTagName(tag)}
                                </button>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default FilterTags

import React, { useState, useEffect } from 'react'
import { Accordion, Badge, Button, ButtonGroup, Row } from 'react-bootstrap'
import { useHistory, useLocation } from 'react-router-dom'

// import './styles.scss'

function FilterTags({ apps, setFilteredApps, filterTypes }) {
    const query = useUrlSearchParams()
    const history = useHistory()
    const [appTypeFilters, setAppTypeFilters] = useState(
        new Set() as Set<string>
    )
    const [supportedElementsFilters, setSupportedElementsFilters] = useState(
        new Set() as Set<string>
    )
    const [platformsFilters, setPlatformsFilters] = useState(
        new Set() as Set<string>
    )

    useEffect(filterApps, [
        appTypeFilters,
        supportedElementsFilters,
        platformsFilters,
        apps,
    ])

    useEffect(setFiltersFromUrlSearchParams, [query])

    function useUrlSearchParams() {
        const { search } = useLocation()

        return React.useMemo(() => new URLSearchParams(search), [search])
    }

    function setFiltersFromUrlSearchParams() {
        setFiltersFromUrlSearchParam('appTypes', setAppTypeFilters)
        setFiltersFromUrlSearchParam('elements', setSupportedElementsFilters)
        setFiltersFromUrlSearchParam('platforms', setPlatformsFilters)
    }

    function setFiltersFromUrlSearchParam(
        paramName: string,
        filterStateSetter: React.Dispatch<React.SetStateAction<Set<string>>>
    ) {
        const paramValue = query.get(paramName)

        if (paramValue) {
            const filterValues = paramValue.split(',')
            filterStateSetter(new Set(filterValues))
        } else {
            filterStateSetter(new Set())
        }
    }

    function updateLocationURLSearchParameters(
        filterType: string,
        filterValue: Set<string>
    ) {
        const filtersStateCopy = {
            appTypeFilters: new Set(appTypeFilters),
            supportedElementsFilters: new Set(supportedElementsFilters),
            platformsFilters: new Set(platformsFilters),
        }

        switch (filterType) {
            case 'appType':
                filtersStateCopy.appTypeFilters = filterValue
                break
            case 'supportedElements':
                filtersStateCopy.supportedElementsFilters = filterValue
                break
            case 'platforms':
                filtersStateCopy.platformsFilters = filterValue
                break
        }

        const search = new URLSearchParams({
            ...(filtersStateCopy.appTypeFilters.size && {
                appTypes: Array.from(filtersStateCopy.appTypeFilters).join(','),
            }),
            ...(filtersStateCopy.supportedElementsFilters.size && {
                elements: Array.from(
                    filtersStateCopy.supportedElementsFilters
                ).join(','),
            }),
            ...(filtersStateCopy.platformsFilters.size && {
                platforms: Array.from(filtersStateCopy.platformsFilters).join(
                    ','
                ),
            }),
        }).toString()

        history.push({
            search: search ? '?' + search : '',
        })
    }

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
        switch (type) {
            default:
            case 'appType':
                return appTypeFilters
            case 'supportedElements':
                return supportedElementsFilters
            case 'platforms':
                return platformsFilters
        }
    }

    function handleClearClick(e: React.MouseEvent<HTMLButtonElement>) {
        const type = e.currentTarget.getAttribute('data-type') as string

        updateLocationURLSearchParameters(type, new Set())
    }

    function handleTagClick(e) {
        const { type, tag } = e.target.dataset

        const filterStateCopy = new Set(getFilterStateByType(type))

        if (filterStateCopy.has(tag)) {
            filterStateCopy.delete(tag)
        } else {
            filterStateCopy.add(tag)
        }

        updateLocationURLSearchParameters(type, filterStateCopy)
    }

    function isTagButtonActive(type, tag): boolean {
        const state = getFilterStateByType(type)

        return state.has(tag)
    }

    /**
     * Format the tag name for display in the UI by capitalizing
     * the first letter of each word in the tag (i.e. podcast player => Podcast Player)
     */
    function formatTagName(tag: string): string {
        return tag
            .split(' ')
            .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
            .join(' ')
    }

    return (
        <Row className="mb-4">
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Filters</Accordion.Header>
                    <Accordion.Body>
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
                                <div key={i} className="mb-3">
                                    <h6>{type}</h6>
                                    <Button
                                        variant="primary"
                                        className="clear-button me-1 mb-1 btn-xs"
                                        onClick={handleClearClick}
                                        data-type={key}
                                    >
                                        Clear
                                    </Button>
                                    {[
                                        ...tags.sort((a, b) =>
                                            a.localeCompare(b)
                                        ),
                                    ].map((tag, j) => (
                                        <Button
                                            key={j}
                                            variant="secondary"
                                            className={
                                                'me-1 mb-1 btn-xs ' +
                                                (isTagButtonActive(key, tag)
                                                    ? 'bg-dark'
                                                    : '')
                                            }
                                            onClick={handleTagClick}
                                            data-type={key}
                                            data-tag={tag}
                                        >
                                            {formatTagName(tag)}
                                        </Button>
                                    ))}
                                </div>
                            )
                        })}
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Row>
    )
}

export default FilterTags

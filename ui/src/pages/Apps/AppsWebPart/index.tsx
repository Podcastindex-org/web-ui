import React, { useState, useEffect } from 'react'
import SingleApp from './SingleApp'
import FilterTags from './FilterTags'

import './styles.scss'

async function getApps(setApps, setFilterTypes) {
    if (setApps) {
        let response = await fetch(`/api/apps`, {
            credentials: 'same-origin',
            method: 'GET',
        })
        const apps = await response.json()
        let filterSets = {
            appType: new Set(),
            supportedElements: new Set(),
            platforms: new Set(),
        }

        apps.forEach((app, index) => {
            app.key = index
            filterSets.appType.add(app.appType)
            app.supportedElements.forEach((elem) =>
                filterSets.supportedElements.add(elem.elementName)
            )
            app.platforms.forEach((elem) => filterSets.platforms.add(elem))
        })

        //converts sets to arrays
        // let filters = { appType: [], supportedElements: [], platforms: [] }
        // filters.appType = [...filterSets.appType]
        // filters.supportedElements = [...filterSets.supportedElements]
        // filters.platforms = [...filterSets.platforms]
        // console.log(apps)
        // console.log(filters)
        setApps(apps)
        setFilterTypes(filterSets)
    }
}

function AppsWebPart() {
    const [apps, setApps] = useState([])
    const [filteredApps, setFilteredApps] = useState([])
    const [filterTypes, setFilterTypes] = useState([])

    useEffect(() => {
        getApps(setApps, setFilterTypes)
    }, [])

    useEffect(() => {
        setFilteredApps(apps)
    }, [apps])
    return (
        <div className="podcastIndexAppsWebPart">
            <FilterTags
                apps={apps}
                setFilteredApps={setFilteredApps}
                filterTypes={filterTypes}
            />
            <h4>Supporting Apps, Directories and Hosting Companies</h4>
            <div className="podcastIndexAppsHeader">
                <div>
                    <div className="imageHolder" />
                    <h4>App</h4>
                </div>
                <h4>Supported Elements</h4>
                <h4>Platforms</h4>
            </div>

            <ul className="podcastIndexAppList">
                {filteredApps
                    .sort(function (a, b) {
                        if (a.supportedElements > b.supportedElements) {
                            return -1
                        }
                        if (a.supportedElements < b.supportedElements) {
                            return 1
                        }
                        return 0
                    })
                    .map((item) => SingleApp(item))}
            </ul>
        </div>
    )
}

export default AppsWebPart

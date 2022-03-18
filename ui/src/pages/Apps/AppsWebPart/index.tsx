import React, { useState, useEffect } from 'react'
import SingleApp from './SingleApp'
import FilterTags from './FilterTags'
import { Col, Row } from 'react-bootstrap'

// import './styles.scss'

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
            app.appType.forEach((type) => {
                filterSets.appType.add(type)
            })

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

    return (
        <>
            <FilterTags
                apps={apps}
                setFilteredApps={setFilteredApps}
                filterTypes={filterTypes}
            />
            <Row>
                {/* <div className="podcastIndexAppsWebPart"> */}
                <Col md="1" className="d-none d-md-block"></Col>
                <Col md="3" className="d-none d-md-block">
                    <h5>App</h5>
                </Col>
                <Col md="6" className="d-none d-md-block">
                    <h5>Supported Elements</h5>
                </Col>
                <Col md="2" className="d-none d-md-block">
                    <h5>Platforms</h5>
                </Col>
            </Row>
            {/* <ul className="podcastIndexAppList"> */}
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
            {/* </ul> */}
            {/* </div> */}
        </>
    )
}

export default AppsWebPart

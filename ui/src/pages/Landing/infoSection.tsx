import * as React from 'react'
import { Component } from 'react'
import { Col, Row } from 'react-bootstrap'

interface InfoSectionProps {}

interface InfoSectionState {}

class InfoSection extends React.Component<InfoSectionProps, InfoSectionState> {
    render() {
        return (
            <Row className="py-3 row-cols-1 row-cols-md-2">
                <Col>
                    <h3>Promise</h3>
                    <p>
                        The core, categorized index will always be available for
                        free, for any use.
                    </p>
                    <p>
                        We will always endeavor to make podcasting{' '}
                        <em>better</em>!
                    </p>
                </Col>
                <Col>
                    <h3>Operations</h3>
                    <p>
                        Podcast Index LLC is a software-developer-focused
                        partnership that provides tools and data to anyone who
                        aspires to create new and exciting podcast and
                        podcasting experiences without the heavy-lifting of
                        indexing, aggregation, and data management.
                    </p>
                </Col>
                <Col>
                    <h3>Financing</h3>
                    <p>
                        The core Podcast Index is financed by its founders and
                        stakeholders: audiences, podcasters, and developers.
                    </p>
                    <p>
                        Corporate interests and advertising are antithetical to
                        our business.
                    </p>
                    <p>
                        Podcast Index LLC strives to grow by providing enhanced
                        API services of value to developers and organizations.
                    </p>
                </Col>
                <Col>
                    <h3>Mission</h3>
                    <p>
                        Our mission is to preserve, protect, and extend the
                        open, independent podcasting ecosystem.
                    </p>
                    <p>
                        Together, we will grow podcasting to a platform of
                        value-exchange that includes developers with podcasters
                        and audiences.
                    </p>
                </Col>
            </Row>
        )
    }
}

export default InfoSection

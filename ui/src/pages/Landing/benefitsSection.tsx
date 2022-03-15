import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCode,
    faHeadphones,
    faMicrophone,
} from '@fortawesome/free-solid-svg-icons'
import { Row, Col, Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

const BenefitsSection = (props) => {
    return (
        <Row className="row-cols-1 row-cols-lg-3 text-center">
            <Col className="py-3">
                <FontAwesomeIcon icon={faHeadphones} size="6x" />
                <h2 className="my-3">For audiences</h2>
                <p>
                    Enjoy richer listening and viewing experiences! Podcasting
                    2.0 lets you follow, engage, support, and share podcasts
                    more easily.
                </p>
                <LinkContainer to="/apps">
                    <Button>Try a better podcast app!</Button>
                </LinkContainer>
            </Col>
            <Col className="py-3">
                <FontAwesomeIcon icon={faMicrophone} size="6x" />

                <h2 className="my-3">For podcasters</h2>
                <p>
                    Podcasting 2.0 offers the new Podcast Namespace to improve
                    your podcast, grow your audience, and even monetize your
                    show!
                </p>
                <LinkContainer to="/podcasters">
                    <Button>Upgrade to Podcasting 2.0!</Button>
                </LinkContainer>
            </Col>
            <Col className="py-3">
                <FontAwesomeIcon icon={faCode} size="6x" />

                <h2 className="my-3">For developers</h2>
                <p>
                    Integrate an open, inclusive, always-free podcast catalog
                    API and add Podcasting 2.0 features to your app. Make
                    finding, following, and funding podcasts easier for your
                    users!
                </p>
                <LinkContainer to="/developers">
                    <Button>Put Podcasting 2.0 in your app!</Button>
                </LinkContainer>
            </Col>
        </Row>
    )
}

export default BenefitsSection

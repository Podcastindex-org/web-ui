import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCode,
    faHeadphones,
    faMicrophone,
} from '@fortawesome/free-solid-svg-icons'
import { Row, Col, Button } from 'react-bootstrap'
import { faApper } from '@fortawesome/free-brands-svg-icons'

const BenefitsSection = (props) => {
    return (
        <Row className="row-cols-1 row-cols-lg-3 text-center">
            <Col className="py-3">
                <FontAwesomeIcon icon={faHeadphones} size="6x" />
                <h2>For audiences</h2>
                <p>
                    Enjoy richer listening and viewing experiences! Podcasting
                    2.0 lets you follow, engage, support, and share podcasts
                    more easily.
                </p>
                <Button href="/apps" variant="primary">
                    Try a better podcast app!
                </Button>
            </Col>
            <Col className="py-3">
                <FontAwesomeIcon icon={faMicrophone} size="6x" />

                <h2>For podcasters</h2>
                <p>
                    Podcasting 2.0 gives you better tools to more easily improve
                    your podcast, grow your audience, and even monetize your
                    show!
                </p>
                <Button href="/podcasters">Upgrade to Podcasting 2.0!</Button>
            </Col>
            <Col className="py-3">
                <FontAwesomeIcon icon={faCode} size="6x" />

                <h2>For developers</h2>
                <p>
                    Access an open, categorized index of all podcasts that will
                    always be free for any use. Make finding, following, and
                    funding podcasts easier for your users!
                </p>
                <Button href="/developers">
                    Use Podcast Index for your app!
                </Button>
            </Col>
        </Row>
    )
}

export default BenefitsSection

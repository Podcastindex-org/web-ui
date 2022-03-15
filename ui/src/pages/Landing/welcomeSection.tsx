import React from 'react'
import { Container, Row } from 'react-bootstrap'

const WelcomeSection = (props) => {
    return (
        <Row className="p-5 mb-4">
            <Container className="py-5" fluid>
                <h1>
                    We&rsquo;re making podcasting better for audiences,
                    podcasters, and developers. <br />
                    <br />
                    <span className="text-info fw-bold">
                        This is Podcasting 2.0!
                    </span>
                </h1>
            </Container>
        </Row>
    )
}

export default WelcomeSection

import React from 'react'
import { Container, Row } from 'react-bootstrap'

const WelcomeSection = (props) => {
    return (
        <Row className="py-md-4 mb-4">
            <Container
                className="py-2 py-md-3 py-lg-5 text-center text-lg-start"
                fluid
            >
                <h1>
                    We&rsquo;re making podcasting better for audiences,
                    podcasters, and developers. <br />
                    <br />
                    <span className="text-primary fw-bold">
                        This is Podcasting 2.0!
                    </span>
                </h1>
            </Container>
        </Row>
    )
}

export default WelcomeSection

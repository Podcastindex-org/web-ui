import * as React from 'react'
import { Row, Col } from 'react-bootstrap'

const BenefitsSection = (props) => {
    return (
        <Row className="py-3">
            <Col>
                <h2>For audiences</h2>
            </Col>
            <Col>
                <h2>For podcasters</h2>
            </Col>
            <Col>
                <h2>For developers</h2>
            </Col>
        </Row>
    )
}

export default BenefitsSection

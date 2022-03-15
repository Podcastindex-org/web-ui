import * as React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import DonateSection from '../DonateSection'

const BottomBar = (props) => {
    return (
        <Container className="py-3 mt-3">
            <Row>
                <Col>
                    <DonateSection />
                </Col>
                <Col className="col-4"></Col>
            </Row>
            {/* <Row className="py-3 mt-3"> */}
            Created and maintained by Adam Curry, Dave Jones, and many
            volunteers.
            {/* </Row> */}
        </Container>
    )
}

export default BottomBar

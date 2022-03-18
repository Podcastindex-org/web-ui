import * as React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import DonateSection from '../DonateSection'
import SocialSection from '../SocialSection'

const BottomBar = (props) => {
    return (
        <Row>
            <Col xs="12" md="8">
                <DonateSection />
            </Col>
            <Col xs="12" md="4">
                <SocialSection />
            </Col>
        </Row>
    )
}

export default BottomBar

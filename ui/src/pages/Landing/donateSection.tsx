import React, { Component, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import TallyCoinWidget from '../../components/TallyCoinWidget'
import Button from '../../components/Button'

const DonateSection = () => {
    const [show, setShow] = useState(false)

    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    return (
        <>
            <Row className="py-3">
                <h3>Help us out...</h3>
                <p>
                    None of this is free. If you get any value from this
                    project, or if you just believe in it and want to help us
                    out with hosting fees and paying the bills, a donation of
                    any amount would be great.
                </p>
            </Row>
            <Row className="py-3">
                <Col>
                    <h4>Paypal</h4>
                    <form
                        action="https://www.paypal.com/cgi-bin/webscr"
                        method="post"
                        target="_top"
                    >
                        <input type="hidden" name="cmd" value="_s-xclick" />
                        <input
                            type="hidden"
                            name="hosted_button_id"
                            value="9GEMYSYB7G2DW"
                        />
                        <Button
                            big
                            primary
                            type="submit"
                            alt="Donate with PayPal button"
                        >
                            Donate
                        </Button>
                    </form>
                </Col>
                <Col>
                    <h4>Tally Coin</h4>
                    <TallyCoinWidget />
                </Col>
            </Row>
            {/*<div className="sphinx-chat">*/}
            {/*    <h4>Sphinx Chat</h4>*/}
            {/*    <SphinxChat />*/}
            {/*</div>*/}
        </>
    )
}

export default DonateSection

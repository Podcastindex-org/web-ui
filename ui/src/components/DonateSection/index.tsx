import { faBitcoin, faPaypal } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Component, useState } from 'react'
import { Row, Col, Button, Modal } from 'react-bootstrap'
import TallyCoinWidget from '../../components/TallyCoinWidget'
// import('https://www.paypalobjects.com/donate/sdk/donate-sdk.js');

const DonateSection = () => {
    const [show, setShow] = useState(false)

    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    return (
        <>
            <h3>Support Podcasting 2.0!</h3>
            <p>
                If you get any value from Podcasting 2.0, or if you simply
                believe in it and want to help us with hosting fees and paying
                the bills to make the possible, we would be grateful for a
                donation of any amount!
            </p>
            {/* {PayPal.Donation.Button({
                    env:'production',
                    hosted_button_id:'PU96WTPUCFAWG',
                    image: {
                    src:'https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif',
                    alt:'Donate with PayPal button',
                    title:'PayPal - The safer, easier way to pay online!',
                    }
                    }).render('#donate-button');} */}
            <Button
                href="https://www.paypal.com/donate/?hosted_button_id=9GEMYSYB7G2DW"
                className="me-3"
                target="_blank"
                size="lg"
            >
                <FontAwesomeIcon icon={faPaypal} className="me-2" />
                Donate via PayPal
            </Button>
            <Button onClick={handleShow} size="lg">
                <FontAwesomeIcon icon={faBitcoin} className="me-2" />
                Donate Bitcoin via Talley Coin
            </Button>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Donate Bitcoin via Talley Coin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TallyCoinWidget />
                </Modal.Body>
                {/* <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                        </Modal.Footer> */}
            </Modal>
            {/* Strange hack because I can't figure out how to make the widget load properly in the modal */}
            <div className="d-none">
                <TallyCoinWidget />
            </div>
            {/*<div className="sphinx-chat">*/}
            {/*    <h4>Sphinx Chat</h4>*/}
            {/*    <SphinxChat />*/}
            {/*</div>*/}
        </>
    )
}

export default DonateSection

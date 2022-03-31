import React from 'react'
import { Col, Row } from 'react-bootstrap'

// import './styles.scss'

function SingleApp(app) {
    return (
        <Row className="mb-4">
            <Col xs="3" sm="2" md="1">
                <a href={app.appUrl}>
                    <img
                        className="mw-100"
                        src={`${document.location.origin}/api/images/${app.appIconUrl}`}
                    />
                </a>
            </Col>
            <Col xs="9" sm="10" md="3">
                <h5>
                    <a href={app.appUrl}>{app.appName}</a>
                </h5>
                <p>
                    {app.appType.map((type, j) => (
                        <React.Fragment key={`${j}`}>
                            {j > 0 && ', '}
                            {type}
                        </React.Fragment>
                    ))}
                </p>
            </Col>
            <Col xs="12" md="6">
                {app.supportedElements
                    .sort((a, b) => (a.elementName > b.elementName ? 1 : -1))
                    .map((suppElement, j) => (
                        <React.Fragment key={`${j}`}>
                            {j > 0 && ', '}
                            <a href={suppElement.elementURL}>
                                {suppElement.elementName}
                            </a>
                        </React.Fragment>
                    ))}
            </Col>
            <Col xs="12" md="2">
                {app.platforms
                    .sort((a, b) => (a > b ? 1 : -1))
                    .map((platform, j) => {
                        const hideNAAppPlatformOnMobile = platform === 'N/A'
                        return (
                            <span
                                className={
                                    hideNAAppPlatformOnMobile
                                        ? 'hide-mobile'
                                        : ''
                                }
                                key={`${j}`}
                            >
                                {j > 0 && ', '}
                                {platform}
                            </span>
                        )
                    })}
            </Col>
        </Row>
    )
}

export default SingleApp

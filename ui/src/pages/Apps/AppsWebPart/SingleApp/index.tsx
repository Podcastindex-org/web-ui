import React from 'react'

import './styles.scss'

function SingleApp(app) {
    return (
        <li className="podcastIndexAppsSingleApp" key={app.key}>
            <div className="podcastIndexAppIdentifier">
                <div className="podcastIndexAppIcon">
                    <img
                        src={`${document.location.origin}/api/images/${app.appIconUrl}`}
                    ></img>
                </div>
                <div className="podcastIndexAppTitleAndType">
                    <a className="podcastIndexAppTitle" href={app.appUrl}>
                        {app.appName}
                    </a>
                    <p className="podcastIndexAppType">{app.appType}</p>
                </div>
            </div>

            <div className="podcastIndexAppSupportedElements">
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
            </div>

            <div className="podcastIndexAppPlatforms">
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
            </div>
        </li>
    )
}

export default SingleApp

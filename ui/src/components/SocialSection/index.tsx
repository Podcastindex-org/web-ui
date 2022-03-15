import { faMastodon, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as React from 'react'
import { Link } from 'react-router-dom'

const SocialSection = (props) => {
    return (
        <>
            <h4>Connect with the community</h4>
            <p>
                <a href="https://podcastindex.social/invite/hfcQYbjq">
                    <FontAwesomeIcon
                        icon={faMastodon}
                        size="2x"
                        className="me-2 text-muted"
                    />
                    {/* Join our Mastodon community */}
                </a>
                <a href="https://twitter.com/PodcastindexOrg">
                    <FontAwesomeIcon
                        icon={faTwitter}
                        size="2x"
                        className="text-muted me-2"
                    />
                    {/* Follow us on Twitter */}
                </a>
                <a href="mailto:info@podcastindex.org">
                    <FontAwesomeIcon
                        icon={faEnvelope}
                        size="2x"
                        className="text-muted"
                    />
                    {/* Email us: info@podcastindex.org */}
                </a>
            </p>
            <p>
                Created and maintained by Adam Curry, Dave Jones, and many
                volunteers.
            </p>
        </>
    )
}

export default SocialSection

import React from 'react'
import { Component } from 'react'
import { Link } from 'react-router-dom'

const WelcomeSection = (props) => {
    return (
        <>
            <h1>
                We&rsquo;re making podcasting better for audiences, podcasters,
                and developers.
            </h1>
            <h1>This is Podcasting 2.0!</h1>

            <p className="fs-3 text-muted">
                We do this by enabling developers to have access to an open,
                categorized index that will always be available for free, for
                any use.
            </p>
            <p className="fs-3 text-muted">
                <Link to="/apps">
                    <u>Try a new podcast app</u>
                </Link>{' '}
                today and see how much better the experience can be.
            </p>
        </>
    )
}

export default WelcomeSection

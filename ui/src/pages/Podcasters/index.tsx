import * as React from 'react'
import { Component } from 'react'
import { ListGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'

interface PodcastersProps {}

interface PodcastersState {}

class Podcasters extends React.Component<PodcastersProps, PodcastersState> {
    render() {
        return (
            <>
                <h1>Podcasting 2.0 is for Podcasters</h1>
                <p>
                    We believe podcasts deserve an open, independent podcasting
                    ecosystem. We created Podcasting 2.0 to preserve, protect,
                    and <em>extend</em> that ecosystem.
                </p>
                <h2>Upgrade to the Podcast Namespace</h2>
                <p>
                    Really Simple Syndication (RSS) is the foundation for open
                    podcasting. But podcast feeds have lacked innovation for
                    years, due in large part to leaving it in the hands of large
                    corporatations to innovate&mdash;and regularly being
                    disappointed.
                </p>
                <p>
                    Podcasting 2.0 changes that by finally bringing fresh
                    innovation to podcasting's core technology of RSS. We do
                    this through the Podcast Namespace: a new standard for RSS
                    feeds that bring multiple benefits for audiences,
                    podcasters, and developers.
                </p>
                <h3>Podcast Namespace benefits</h3>
                <ul>
                    <li>
                        Add and edit interactive chapters <em>without</em>
                        re-uploading your media file
                    </li>
                    <li>Earn Bitcoin directly from your audience</li>
                    <li>
                        Engage through comments accessible accross multiple apps
                    </li>
                    <li>
                        Expose more information about your podcast, like people,
                        location, and more
                    </li>
                    <li>Lock your podcast against theft</li>
                    <li>Notify your audience when you're live-streaming</li>
                    <li>
                        Deliver new episodes more quickly to your podcast
                        followers
                    </li>
                    <li>
                        Protect your podcast from censorship and deplatforming
                    </li>
                </ul>
                <h2>How to get started</h2>
                <ol>
                    <li>
                        Ensure your podcast is in the Podcast Index, and{' '}
                        <Link to="/add">
                            add your podcast if it's not included
                        </Link>
                        .
                    </li>
                    <li>
                        Check with your podcast-feed-publishing tool for support
                        of the Podcasting 2.0 features from the new Podcast
                        Namespace.{' '}
                        <Link to="/apps">
                            You might even want to switch providers.
                        </Link>
                    </li>
                    <li>
                        Prepare your podcast to receive streaming
                        Bitcoin/Satoshis and Boostagrams through Value 4 Value.{' '}
                        <a href="http://adam.curry.com/html/HowtoreceiveBitcoini-BrxM2PDPNJ7Zzbz7G28xk4H0D658fH.html">
                            Here's a guide
                        </a>
                        .
                    </li>
                    <li>
                        Encourage your audience to get a better podcast app by
                        going to NewPodcastApps.com.
                    </li>
                    <li>
                        <a href="https://podcastindex.social/invite/hfcQYbjq">
                            Participate in PodcastIndex.social
                        </a>{' '}
                        to share your ideas and feedback.
                    </li>
                    <li>
                        Go deeper with our{' '}
                        <Link to="/developers">developer resources</Link>.
                    </li>
                </ol>
            </>
        )
    }
}

export default Podcasters

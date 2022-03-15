import * as React from 'react'
import { Component } from 'react'

interface DevelopersProps {}

interface DevelopersState {}

class Developers extends React.Component<DevelopersProps, DevelopersState> {
    render() {
        return (
            <>
                <h1>Podcasting 2.0 is for Developers</h1>
                <p>
                    Sign up for an account and get API keys at:{' '}
                    <a href="https://api.podcastindex.org/signup">
                        https://api.podcastindex.org
                    </a>
                </p>
                <p>
                    Download our full podcast database as a sqlite3 file over
                    IPFS{' '}
                    <a
                        href="https://cloudflare-ipfs.com/ipns/k51qzi5uqu5dkde1r01kchnaieukg7xy9i6eu78kk3mm3vaa690oaotk1px6wo/podcastindex_feeds.db.tgz"
                        target="_blank"
                    >
                        here
                    </a>{' '}
                    or using HTTP{' '}
                    <a href="https://public.podcastindex.org/podcastindex_feeds.db.tgz">
                        here
                    </a>
                    .
                </p>
                <p>
                    API Documentation is{' '}
                    <a
                        target="_blank"
                        href="https://podcastindex-org.github.io/docs-api/"
                    >
                        here
                    </a>
                    .
                </p>
                <p>
                    We build in the open. Get active in the{' '}
                    <a href="https://github.com/Podcastindex-org">
                        Github repos
                    </a>
                    .
                </p>
                <p>
                    We have a Mastodon server for collaboration. Join it here:{' '}
                    <a href="https://podcastindex.social/invite/hfcQYbjq">
                        Podcastindex.social
                    </a>
                </p>
                <p>
                    Follow us on
                    <a href="https://twitter.com/PodcastindexOrg">
                        Twitter
                    </a> or{' '}
                    <a href="https://noagendasocial.com/@podcastindex">
                        Mastodon
                    </a>
                    .
                </p>
                <p>
                    Shoot us an email at:{' '}
                    <a href="mailto:info@podcastindex.org">
                        info@podcastindex.org
                    </a>
                </p>
            </>
        )
    }
}

export default Developers

import * as React from 'react'
import { Link } from 'react-router-dom'

import Button from '../components/Button'
import RecentPodcasts from '../components/RecentPodcasts'
import { updateTitle } from '../utils'
import StatsCard from './Stats/StatsCard'

import './styles.scss'

interface IProps {}
interface IState {
    loading?: boolean
    podcasts?: Array<any>
    stats?: {}
}

export default class Landing extends React.Component<IProps, IState> {
    state = {
        loading: true,
        podcasts: [],
        stats: {
            feedCountTotal: '1,318,328',
            feedCount3days: '81,919',
            feedCount10days: '208,264',
            feedCount30days: '303,007',
            feedCount60days: '376,576',
            feedCount90days: '607,991',
        },
    }
    _isMounted = false

    constructor(props: IProps) {
        super(props)
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true
        const podcasts = await this.getEpisodes()
        const stats = await this.getStats()

        if (this._isMounted) {
            this.setState({
                loading: false,
                podcasts,
                stats,
            })
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async getStats() {
        let response = await fetch('/api/stats', {
            credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    async getRecentEpisodes() {
        let response = await fetch(`/api/recent/episodes?max=7`, {
            credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    async getLiveEpisodes() {
        let response = await fetch(`/api/episodes/live?max=3`, {
            credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    async getEpisodes() {
        let liveResponse = await this.getLiveEpisodes()
        let episodes = liveResponse.items.map(ep => {
            ep.live = true
            return ep
        })

        let recentResponse = await this.getRecentEpisodes()
        episodes = episodes.concat(recentResponse.items)

        return episodes;
    }

    render() {
        const { loading, podcasts, stats } = this.state
        updateTitle('Home')
        return (
            <div className="landing-content">
                <div className="hero-pitch">
                    <div className="hero-pitch-left">
                        <h1 className="hero-pitch-text">
                            The Podcast Index is here to preserve, protect and extend the open,
                            independent podcasting ecosystem.
                        </h1>

                        <div className="hero-pitch-subtitle">
                            We do this by enabling developers to have access to
                            an open, categorized index that will always be
                            available for free, for any use.
                        </div>
                        <div className="hero-pitch-subtitle">
                            Try a <Link to="/apps"><u>new podcast app</u></Link> today and see how much better the experience can be.
                        </div>
                        {/*<div className="listen-row">*/}
                        {/*    <audio controls preload="none">*/}
                        {/*        <source*/}
                        {/*            src="https://mp3s.nashownotes.com/PC20-01-2020-08-28-Final.mp3"*/}
                        {/*            type="audio/mpeg"*/}
                        {/*        />*/}
                        {/*    </audio>*/}
                        {/*    <a*/}
                        {/*        className="subscribe-badge"*/}
                        {/*        title="Subscribe"*/}
                        {/*        target="_blank"*/}
                        {/*        href="http://mp3s.nashownotes.com/pc20rss.xml"*/}
                        {/*    >*/}
                        {/*        <img src={RSSLogo} />*/}
                        {/*    </a>*/}
                        {/*</div>*/}
                    </div>
                    <div className="hero-pitch-right">
                        <RecentPodcasts
                            title="Recent Podcasts"
                            liveTitle="⬤ Live Podcasts"
                            loading={loading}
                            podcasts={podcasts}
                        />
                    </div>
                </div>
                <StatsCard
                    total={stats.feedCountTotal}
                    threedays={stats.feedCount3days}
                    tendays={stats.feedCount10days}
                    lastMonth={stats.feedCount30days}
                    last60={stats.feedCount60days}
                    last90={stats.feedCount90days}
                />
                <div className="info-section">
                    <h3>Promise</h3>
                    <p>
                        The core, categorized index will always be available for
                        free, for any use.
                    </p>
                    <h3>Operations</h3>
                    <p>
                        Podcast Index LLC is a software developer focused
                        partnership that provides tools and data to anyone who
                        aspires to create new and exciting Podcast experiences
                        without the heavy lifting of indexing, aggregation and
                        data management.
                    </p>
                    <h3>Financing</h3>
                    <p>
                        The core Podcast Index is financed by its founders and
                        stakeholders: Podcasters, Developers and Listeners.
                    </p>
                    <p>
                        Corporate interests and advertising are antithetical to
                        our business.
                    </p>
                    <p>
                        Podcast Index LLC strives to grow by providing enhanced
                        API services of value to developers and organizations.
                    </p>
                    <h3>Mission and Goal</h3>
                    <p>Preserve, protect and extend the open, independent podcasting ecosystem.</p>
                    <p>
                        Re-tool podcasting to a platform of value exchange that
                        includes developers with podcasters and listeners.
                    </p>
                    <h3>Developer? Join the fun!</h3>
                    <p>
                        Sign up for an account and get API keys at:{' '}
                        <a href="https://api.podcastindex.org/signup">
                            https://api.podcastindex.org
                        </a>
                    </p>
                    <p>
                        Download our full podcast database as a sqlite3 file HTTP <a href="https://public.podcastindex.org/podcastindex_feeds.db.tgz">here</a>.
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
                        We have a Mastodon server for collaboration. Join it
                        here:{' '}
                        <a href="https://podcastindex.social/invite/hfcQYbjq">
                            Podcastindex.social
                        </a>
                    </p>
                    <p>
                        Follow us on{' '}
                        {/*the blog:{' '}*/}
                        {/*<a href="https://blog.podcastindex.org/">*/}
                        {/*    blog.podcastindex.org*/}
                        {/*</a>{' '}*/}
                        {/*or on{' '}*/}
                        <a href="https://twitter.com/PodcastindexOrg">
                            Twitter
                        </a>
                        {' '} or{' '}
                        <a href="https://podcastindex.social/">
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
                </div>
                <div id="donate" className="info-section">
                    <h3>Help us out...</h3>
                    <p>
                        None of this is free. If you get any value from this
                        project, or if you just believe in it and want to help
                        us out with hosting fees and paying the bills, a
                        donation of any amount would be great.
                    </p>
                    <div className="donation-providers">
                        <div className="paypal">
                            <h4>Paypal</h4>
                            <form
                                action="https://www.paypal.com/cgi-bin/webscr"
                                method="post"
                                target="_top"
                            >
                                <input
                                    type="hidden"
                                    name="cmd"
                                    value="_s-xclick"
                                />
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
                        </div>
                        <div className="tally-coin">
                            <h4>Tallycoin</h4>
                            <Button
                                big
                                primary
                                slim
                                href="https://tallycoin.app/@podcastindex/support-podcastindex-t5x9vv/"
                            >
                                Donate Bitcoin
                            </Button>
                        </div>
                        {/*<div className="sphinx-chat">*/}
                        {/*    <h4>Sphinx Chat</h4>*/}
                        {/*    <SphinxChat />*/}
                        {/*</div>*/}
                    </div>
                </div>
                {/* <div className="footer">
                    <a className="social-link">
                        <img
                            height={25}
                            width={25}
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mastodon_Logotype_%28Simple%29.svg/223px-Mastodon_Logotype_%28Simple%29.svg.png"
                        />
                    </a>
                    <a href="https://twitter.com/PodcastindexOrg">
                        <img
                            height={25}
                            width={30}
                            src="https://www.creativefreedom.co.uk/wp-content/uploads/2017/06/Twitter-featured.png"
                        />
                    </a>
                </div> */}
            </div>
        )
    }
}

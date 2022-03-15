import * as React from 'react'
import { useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'

import RecentPodcasts from '../../components/RecentPodcasts'
import { updateTitle } from '../../utils'
import StatsCard from '../Stats/StatsCard'

import InfoSection from './infoSection'
import WelcomeSection from './welcomeSection'
import BenefitsSection from './benefitsSection'

interface IProps {}
interface IState {
    loading?: boolean
    recentPodcasts?: Array<any>
    stats?: {}
}

export default class Landing extends React.Component<IProps, IState> {
    state = {
        loading: true,
        recentPodcasts: [],
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
        const recentPodcasts = (await this.getRecentEpisodes()).items
        const stats = await this.getStats()

        if (this._isMounted) {
            this.setState({
                loading: false,
                recentPodcasts,
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

    render() {
        const { loading, recentPodcasts, stats } = this.state
        // const [show, setShow] = useState(false)

        // const handleClose = () => setShow(false)
        // const handleShow = () => setShow(true)
        updateTitle('Home')

        return (
            <Container>
                <WelcomeSection />
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
                <BenefitsSection />
                <Row className="py-3">
                    <h2>The latest from the Podcast Index</h2>
                    <Col>
                        <StatsCard
                            total={stats.feedCountTotal}
                            threedays={stats.feedCount3days}
                            tendays={stats.feedCount10days}
                            lastMonth={stats.feedCount30days}
                            last60={stats.feedCount60days}
                            last90={stats.feedCount90days}
                        />
                    </Col>
                    <Col>
                        <RecentPodcasts
                            title="Recent Podcasts"
                            loading={loading}
                            podcasts={recentPodcasts}
                        />
                    </Col>
                </Row>
                <InfoSection />

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
            </Container>
        )
    }
}

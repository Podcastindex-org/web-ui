import * as React from 'react'

import Topbar from '../components/TopBar'
import PodcastPlayer from '../components/PodcastPlayer'
import Card from '../components/Card'

import LandingBG from '../../images/landing-bg.svg'
import './styles.scss'

interface IProps {
    children?: any
}

export default class Landing extends React.Component<IProps> {
    static defaultProps = {}
    state = {
        open: false,
    }

    constructor(props: IProps) {
        super(props)
    }

    render() {
        const { open } = this.state
        return (
            <div className="page">
                <Topbar />
                <img
                    draggable="false"
                    className="landing-graphic"
                    height={1017}
                    width={1017}
                    src={LandingBG}
                    alt="Sidebar logo"
                />
                <div className="landing-content">
                    <div className="hero-pitch">
                        <div className="hero-pitch-left">
                            <div className="hero-pitch-text">
                                <b>
                                    Let’s preserve podcasting as a platform for
                                    free speech
                                </b>
                            </div>
                            <div className="hero-pitch-subtitle">
                                We do this by enabling developers to have access
                                to an open, categorized index that will always
                                be available for free, for any use.
                            </div>
                        </div>
                        <div className="hero-pitch-right">
                            <PodcastPlayer />
                        </div>
                    </div>
                    <div className="kpi-card">
                        <Card>Some KPIs</Card>
                    </div>
                </div>
            </div>
        )
    }
}

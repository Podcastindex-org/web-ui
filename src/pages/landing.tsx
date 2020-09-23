import * as React from 'react'
import moment from 'moment'
import Chart from 'react-apexcharts'

import Topbar from '../components/TopBar'
import PodcastPlayer from '../components/PodcastPlayer'
import Card from '../components/Card'
import KPI from '../components/KPI'

import RecentApi from '../api/recent'

import LandingBG from '../../images/landing-bg.svg'
import './styles.scss'

const sharedChartOptions = {
    colors: ['#E90000', '#D8D8D8'],
    fontFamily: 'D-DIN',
    legend: {
        fontFamily: 'D-DIN',
        fontSize: 14,
        position: 'top',
        floating: true,
        offsetX: 0,
        offsetY: 0,
    },
    tooltip: {
        style: {
            fontSize: 14,
            fontFamily: 'D-DIN',
        },
    },
    fill: {
        opacity: 1,
    },
    toolbar: {
        show: false,
    },
}

interface IProps {
    children?: any
}

interface IState {
    series: any
    options: any
}

export default class Landing extends React.Component<IProps, IState> {
    static defaultProps = {}
    state = {
        open: false,
        series: [],
        options: {
            ...sharedChartOptions,
            chart: {
                type: 'line',
                height: 'auto',
                toolbar: {
                    show: false,
                },
            },
            stroke: {
                curve: 'straight',
            },
            // plotOptions: {
            //     bar: {
            //         horizontal: false,
            //         stackType: 'normal',
            //     },
            // },
        },
    }

    constructor(props: IProps) {
        super(props)
    }

    async componentDidMount(): Promise<void> {
        // const recentPodcasts = await RecentApi.recent_episodes(7)
        // console.log(recentPodcasts)
        let report_create_time = moment(new Date())
        const dateFrom = report_create_time.subtract(8, 'days')
        var last_seven_days = []
        for (var i = 1; i <= 7; i++) {
            last_seven_days[i - 1] = dateFrom
                .add('1', 'days')
                .format('MM/DD/YY')
        }
        let newPodcasts = [28752, 29431, 33124, 36420, 32321, 32539, 33234]
        this.setState({
            series: [
                {
                    name: 'New Podcasts',
                    data: newPodcasts,
                },
            ],
            options: {
                ...this.state.options,
                xaxis: {
                    categories: last_seven_days,
                },
                markers: {
                    size: [4],
                },
                yaxis: {
                    min: Math.min.apply(null, newPodcasts),
                    max: Math.max.apply(null, newPodcasts),
                },
            },
        })
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
                            <h1 className="hero-pitch-text">
                                Let’s preserve podcasting as a platform for free
                                speech
                            </h1>

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
                        <Card>
                            {/* <Chart
                                series={this.state.series}
                                options={this.state.options}
                                type="line"
                                height={5 * 80}
                            /> */}
                            <div className="kpi-massive-title">
                                Total podcasts in the index
                            </div>
                            <div className="kpi-massive-value">1,064,141</div>
                            <div className="kpi-massive-title kpi-title-2">
                                Show published in the ...
                            </div>
                            <div className="kpi-row">
                                <KPI big title="Last Week" value="133,434" />
                                <KPI big title="Last Month" value="249,311" />
                                <KPI big title="Last 90 days" value="249,311" />
                            </div>
                        </Card>
                    </div>
                    <div className="info-section">
                        <h3>Promise</h3>
                        <p>
                            The core, categorized index will always be available
                            for free, for any use
                        </p>
                        <h3>Operations</h3>
                        <p>
                            Podcast Index LLC is a software developer focused
                            partnership that provides tools and data to anyone
                            who aspires to create new and exciting Podcast
                            experiences without the heavy lifting of indexing,
                            aggregation and data management
                        </p>
                        <h3>Financing</h3>
                        <p>
                            The core Podcast Index is financed by its founders
                            and stakeholders: Podcasters, Developers and
                            Listeners
                        </p>
                        <p>
                            Corporate interests and advertising are antithetical
                            to our business
                        </p>
                        <p>
                            Podcast Index LLC strives to grow by providing
                            enhanced API services of value to developers and
                            organizations
                        </p>
                        <h3>Mission and Goal</h3>
                        <p>Preserve podcasting as a platform for free speech</p>
                        <p>
                            Re-tool podcasting to a platform of value exchange
                            that includes developers with podcasters and
                            listeners
                        </p>
                    </div>
                    <div id="donate">
                        <h3>Help us out...</h3>
                        <p>
                            None of this is free. If you get any value from this
                            project, or if you just believe in it and want to
                            help us out with hosting fees and paying the bills,
                            a donation of any amount would be great.
                        </p>
                        <form
                            action="https://www.paypal.com/cgi-bin/webscr"
                            method="post"
                            target="_top"
                        >
                            <input type="hidden" name="cmd" value="_s-xclick" />
                            <input
                                type="hidden"
                                name="hosted_button_id"
                                value="9GEMYSYB7G2DW"
                            />
                            <input
                                type="image"
                                src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
                                // border="0"
                                name="submit"
                                title="PayPal - The safer, easier way to pay online!"
                                alt="Donate with PayPal button"
                            />
                            <img
                                alt=""
                                // border="0"
                                src="https://www.paypal.com/en_US/i/scr/pixel.gif"
                                width="1"
                                height="1"
                            />
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

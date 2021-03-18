import * as React from 'react'
import { Stats } from 'webpack'

import NewFeedStatsCard from './NewFeedStatsCard'
import StatsCard from "./StatsCard";

import './styles.scss'


interface IProps {}



export default class Card extends React.Component<IProps> {
    static defaultProps = {}
    state = {
        loading: true,
        overallStats: {
            feedCountTotal: '1,318,328',
            feedCount3days: '81,919',
            feedCount10days: '208,264',
            feedCount30days: '303,007',
            feedCount60days: '376,576',
        },
        stats: {
            totalCount: 1619,
            top1name: '',
            top1count: 473,
            top2name: '',
            top2count: 208,
            top3name: '',
            top3count: 113,
            top4name: '',
            top4count: 86,
            top5name: '',
            top5count: 39
        }
    }
    _isMounted = false

    constructor(props: IProps) {
        super(props)
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true
        const stats = await this.getNewFeedStats()
        const overallStats = await this.getStats()

        //console.log(stats)
        if (this._isMounted) {
            this.setState({
                loading: false,
                overallStats,
                stats
            })
        }
    }

    async getNewFeedStats() {
        let response = await fetch('/api/newfeedstats', {
            credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    async getStats() {
        let response = await fetch('/api/stats', {
            credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    render() {
        const {} = this.props
        const { loading, overallStats, stats } = this.state
        return (
            <div className="landing-content" style={{ marginTop: 20 }}>
                <StatsCard
                    total={overallStats.feedCountTotal}
                    threedays={overallStats.feedCount3days}
                    tendays={overallStats.feedCount10days}
                    lastMonth={overallStats.feedCount30days}
                    last60={overallStats.feedCount60days}
                />
                <div className="info-section">&nbsp;</div>
                <NewFeedStatsCard
                    total={stats.totalCount}
                    top1name={stats.top1name}
                    top1count={stats.top1count}
                    top2name={stats.top2name}
                    top2count={stats.top2count}
                    top3name={stats.top3name}
                    top3count={stats.top3count}
                    top4name={stats.top4name}
                    top4count={stats.top4count}
                    top5name={stats.top5name}
                    top5count={stats.top5count}
                />
            </div>
        )
    }
}

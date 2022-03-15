import * as React from 'react'
import { Stats } from 'webpack'

import NewFeedStatsCard from './NewFeedStatsCard'
import StatsCard from './StatsCard'

import './styles.scss'

interface IProps {}

export default class Card extends React.Component<IProps> {
    static defaultProps = {}
    state = {
        loading: true,
        overallStats: {
            feedCountTotal: '4,013,180',
            feedCount3days: '100,201',
            feedCount10days: '208,264',
            feedCount30days: '303,007',
            feedCount60days: '416,576',
            feedCount90days: '616,576',
        },
        stats: {
            totalCount: 3773,
            top1name: 'Buzzsprout',
            top1count: 1870,
            top2name: 'RSS.com',
            top2count: 967,
            top3name: 'Captivate',
            top3count: 381,
            top4name: 'Transistor',
            top4count: 376,
            top5name: 'Blubrry',
            top5count: 96,
        },
    }
    _isMounted = false

    constructor(props: IProps) {
        super(props)
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true
        const stats = await this.getNewFeedStats()
        const overallStats = await this.getStats()

        if (this._isMounted) {
            this.setState({
                loading: false,
                overallStats,
                stats,
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
            <>
                <StatsCard
                    total={overallStats.feedCountTotal}
                    threedays={overallStats.feedCount3days}
                    tendays={overallStats.feedCount10days}
                    lastMonth={overallStats.feedCount30days}
                    last60={overallStats.feedCount60days}
                    last90={overallStats.feedCount90days}
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
            </>
        )
    }
}

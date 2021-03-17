import * as React from 'react'
import { Stats } from 'webpack'

import NewFeedStatsCard from './NewFeedStatsCard'

import './styles.scss'

interface IProps {}



export default class Card extends React.Component<IProps> {
    static defaultProps = {}
    state = {
        loading: true,
        stats: {
            totalCount: 0,
            top1name: '',
            top1count: 0,
            top2name: '',
            top2count: 0,
            top3name: '',
            top3count: 0,
            top4name: '',
            top4count: 0,
            top5name: '',
            top5count: 0
        }
    }
    _isMounted = false

    constructor(props: IProps) {
        super(props)
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true
        const stats = await this.getNewFeedStats()

        //console.log(stats)
        if (this._isMounted) {
            this.setState({
                loading: false,
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

    render() {
        const {} = this.props
        const { loading, stats } = this.state
        return (
            <div className="landing-content" style={{ marginTop: 20 }}>
                {/* TODO more stats soon */}
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

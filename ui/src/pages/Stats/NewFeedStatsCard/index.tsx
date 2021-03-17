import * as React from 'react'

import KPI from '../../../components/KPI'
import Card from '../../../components/Card'

import './styles.scss'

interface IProps {
    total: number
    top1name: string
    top1count: number
    top2name: string
    top2count: number
    top3name: string
    top3count: number
    top4name: string
    top4count: number
    top5name: string
    top5count: number
}

export default class NewFeedStatsCard extends React.Component<IProps> {
    static defaultProps = {
        total: 0,
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

    constructor(props: IProps) {
        super(props)
    }

    numberWithCommas(number: number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    render() {
        const {
            total,
            top1name,
            top1count,
            top2name,
            top2count,
            top3name,
            top3count,
            top4name,
            top4count,
            top5name,
            top5count
        } = this.props

        return (
            <div className="kpi-card">
                <Card>
                    <div className="kpi-massive-title">
                        New feeds added in the last 30 days...
                    </div>
                    <div className="kpi-massive-value">{total.toLocaleString()}</div>
                    <div className="kpi-massive-title kpi-title-2">
                        Feeds added by podcast host...
                    </div>
                    <div className="kpi-row">
                        <KPI title={top1name} value={top1count.toLocaleString()} />
                        <KPI title={top2name} value={top2count.toLocaleString()} />
                        <KPI title={top3name} value={top3count.toLocaleString()} />
                        <KPI title={top4name} value={top4count.toLocaleString()} />
                        <KPI title={top5name} value={top5count.toLocaleString()} />
                        {/* <KPI
                            title="90 days"
                            value={this.numberWithCommas(last90)}
                        /> */}
                    </div>
                </Card>
            </div>
        )
    }
}

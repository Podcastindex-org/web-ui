import * as React from 'react'

import KPI from '../../../components/KPI'
import Card from '../../../components/Card'

import './styles.scss'

interface IProps {
    total: number
    lastWeek: number
    lastMonth: number
    last90: number
}

export default class StatsCard extends React.Component<IProps> {
    static defaultProps = {
        total: 1064141,
        lastWeek: 133434,
        lastMonth: 249311,
        last90: 521621,
    }

    constructor(props: IProps) {
        super(props)
    }

    numberWithCommas(number: number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    render() {
        const { total, lastWeek, lastMonth, last90 } = this.props
        return (
            <div className="kpi-card">
                <Card>
                    <div className="kpi-massive-title">
                        Total podcasts in the index
                    </div>
                    <div className="kpi-massive-value">
                        {this.numberWithCommas(total)}
                    </div>
                    <div className="kpi-massive-title kpi-title-2">
                        Show published in the ...
                    </div>
                    <div className="kpi-row">
                        <KPI
                            big
                            title="Last Week"
                            value={this.numberWithCommas(lastWeek)}
                        />
                        <KPI
                            big
                            title="Last Month"
                            value={this.numberWithCommas(lastMonth)}
                        />
                        <KPI
                            big
                            title="Last 90 days"
                            value={this.numberWithCommas(last90)}
                        />
                    </div>
                </Card>
            </div>
        )
    }
}

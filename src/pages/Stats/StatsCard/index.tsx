import * as React from 'react'

import KPI from '../../../components/KPI'
import Card from '../../../components/Card'

import './styles.scss'

interface IProps {
    total: number
    threedays: number
    tendays: number
    lastWeek: number
    lastMonth: number
    last60: number
    last90: number
}

export default class StatsCard extends React.Component<IProps> {
    static defaultProps = {
        total: 1317362,
        threedays: 73852,
        tendays: 210830,
        lastWeek: 133434,
        lastMonth: 310658,
        last60: 403350,
        last90: 499568,
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
            threedays,
            tendays,
            lastWeek,
            lastMonth,
            last60,
            last90,
        } = this.props
        return (
            <div className="kpi-card">
                <Card>
                    <div className="kpi-massive-title">
                        Total podcasts in the index ...
                    </div>
                    <div className="kpi-massive-value">
                        {this.numberWithCommas(total)}
                    </div>
                    <div className="kpi-massive-title kpi-title-2">
                        Show published in the last ...
                    </div>
                    <div className="kpi-row">
                        <KPI
                            title="3 days"
                            value={this.numberWithCommas(threedays)}
                        />
                        <KPI
                            title="10 days"
                            value={this.numberWithCommas(tendays)}
                        />
                        <KPI
                            title="30 days"
                            value={this.numberWithCommas(lastMonth)}
                        />
                        <KPI
                            title="60 days"
                            value={this.numberWithCommas(last60)}
                        />
                        <KPI
                            title="90 days"
                            value={this.numberWithCommas(last90)}
                        />

                        {/* <KPI
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
                        /> */}
                    </div>
                </Card>
            </div>
        )
    }
}

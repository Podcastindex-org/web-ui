import * as React from 'react'

import KPI from '../../../components/KPI'
import Card from '../../../components/Card'

import './styles.scss'

interface IProps {
    total: string
    threedays: string
    tendays: string
    lastMonth: string
    last60: string
}

export default class StatsCard extends React.Component<IProps> {
    static defaultProps = {
        total: '',
        threedays: '',
        tendays: '',
        lastWeek: '',
        lastMonth: '',
        last60: '',
    }

    constructor(props: IProps) {
        super(props)
    }

    numberWithCommas(number: number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    render() {
        const { total, threedays, tendays, lastMonth, last60 } = this.props
        return (
            <div className="kpi-card">
                <Card>
                    <div className="kpi-massive-title">
                        Total podcasts in the index ...
                    </div>
                    <div className="kpi-massive-value">{total}</div>
                    <div className="kpi-massive-title kpi-title-2">
                        Shows published in the last ...
                    </div>
                    <div className="kpi-row">
                        <KPI title="3 days" value={threedays} />
                        <KPI title="10 days" value={tendays} />
                        <KPI title="30 days" value={lastMonth} />
                        <KPI title="60 days" value={last60} />
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

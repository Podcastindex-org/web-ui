import * as React from 'react'

import KPI from '../../../components/KPI'
import { Card, Row } from 'react-bootstrap'

interface IProps {
    total: string
    threedays: string
    tendays: string
    lastMonth: string
    last60: string
    last90: string
}

export default class StatsCard extends React.Component<IProps> {
    static defaultProps = {
        total: '',
        threedays: '',
        tendays: '',
        lastWeek: '',
        lastMonth: '',
        last60: '',
        last90: '',
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
            lastMonth,
            last60,
            last90,
        } = this.props
        return (
            <Card className="bg-light">
                <Card.Body>
                    <Card.Title>Total podcasts in the index</Card.Title>
                    <Card.Text className="display-1 text-primary fw-bold">
                        {total}
                    </Card.Text>
                    <Card.Title>
                        Shows published in the last &hellip;
                    </Card.Title>
                    <Row className="row-cols-2 row-cols-md-3 row-cols-lg-2 row-cols-xl-3">
                        <KPI title="3 days" value={threedays} />
                        <KPI title="10 days" value={tendays} />
                        <KPI title="30 days" value={lastMonth} />
                        <KPI title="60 days" value={last60} />
                        <KPI title="90 days" value={last90} />
                    </Row>
                </Card.Body>
            </Card>
        )
    }
}

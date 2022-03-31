import * as React from 'react'
import { Card, Row } from 'react-bootstrap'

import KPI from '../../../components/KPI'

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
        top5count: 0,
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
            top5count,
        } = this.props

        return (
            <Card className="bg-light">
                <Card.Body>
                    <Card.Title>
                        Host-submitted feeds in the last 30 days
                    </Card.Title>
                    <Card.Text className="display-1 text-primary fw-bold">
                        {total.toLocaleString()}
                    </Card.Text>
                    <Row className="row-cols-2 row-cols-md-3 row-cols-lg-2 row-cols-xl-3">
                        <KPI
                            title={top1name}
                            value={top1count.toLocaleString()}
                        />
                        <KPI
                            title={top2name}
                            value={top2count.toLocaleString()}
                        />
                        <KPI
                            title={top3name}
                            value={top3count.toLocaleString()}
                        />
                        <KPI
                            title={top4name}
                            value={top4count.toLocaleString()}
                        />
                        <KPI
                            title={top5name}
                            value={top5count.toLocaleString()}
                        />
                    </Row>
                </Card.Body>
            </Card>
        )
    }
}

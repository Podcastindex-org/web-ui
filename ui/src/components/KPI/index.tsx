import * as React from 'react'
import { Col } from 'react-bootstrap'

// Separate state props + dispatch props to their own interfaces.
interface PropsFromState {
    big?: boolean
    title?: string
    value: string
    unit?: string
    trending?: {
        direction: 'up' | 'down'
        amount?: number
    }
}

// Combine both state + dispatch props - as well as any props we want to pass - in a union type.
type AllProps = PropsFromState

export default class KPI extends React.PureComponent<AllProps> {
    static defaultProps = {}

    render() {
        const { big, title, value, unit, trending } = this.props
        return (
            <Col>
                {title && <h6 className="mb-0">{title}</h6>}
                <p className="fs-1 text-primary">{value}</p>
                {/* <div className="kpi-metadata">
                    <div className="kpi-trending"></div>
                    <div className="kpi-unit">{unit}</div>
                </div> */}
            </Col>
        )
    }
}

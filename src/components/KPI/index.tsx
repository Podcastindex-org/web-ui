import * as React from 'react'

import './styles.scss'

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
        const bigClass = big ? 'big' : ''
        return (
            <div className={`kpi ${bigClass}`}>
                {title && <div className="kpi-title">{title}</div>}
                <div className="kpi-data">
                    <div className="kpi-value">{value}</div>
                    <div className="kpi-metadata">
                        <div className="kpi-trending"></div>
                        <div className="kpi-unit">{unit}</div>
                    </div>
                </div>
            </div>
        )
    }
}

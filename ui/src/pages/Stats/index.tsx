import * as React from 'react'
import { Stats } from 'webpack'

import StatsCard from './StatsCard'

import './styles.scss'

interface IProps {}

export default class Card extends React.Component<IProps> {
    static defaultProps = {}

    constructor(props: IProps) {
        super(props)
    }

    render() {
        const {} = this.props
        return (
            <div className="landing-content" style={{ marginTop: 20 }}>
                {/* TODO more stats soon */}
                <StatsCard />
            </div>
        )
    }
}

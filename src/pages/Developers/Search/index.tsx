import * as React from 'react'

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
            <div className="">
                <div></div>
            </div>
        )
    }
}

import * as React from 'react'

// import './styles.scss'

interface IProps {
    title?: string
    children?: any
}

export default class Card extends React.Component<IProps> {
    static defaultProps = {}
    state = {
        open: false,
    }

    constructor(props: IProps) {
        super(props)
    }

    render() {
        const { title, children } = this.props
        // const { open } = this.state
        return (
            <div className="card">
                {title && (
                    <div className="card-header">
                        <div className="card-title">{title}</div>
                        <div className="card-right"></div>
                    </div>
                )}
                <div className="card-body">{children}</div>
            </div>
        )
    }
}

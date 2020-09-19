import * as React from 'react'

import './styles.scss'

interface IProps {
    children?: any
    style?: string
    href?: string
    onClick?: () => void
}

export default class Button extends React.PureComponent<IProps> {
    static defaultProps = {}

    render() {
        const { children, href, onClick } = this.props
        return (
            <>
                {href && (
                    <a href={href} className="button">
                        {children}
                    </a>
                )}
                {!href && (
                    <div className="button" onClick={onClick}>
                        {children}
                    </div>
                )}
            </>
        )
    }
}

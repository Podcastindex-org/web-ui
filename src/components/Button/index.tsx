import * as React from 'react'
import { Link } from 'react-router-dom'

import './styles.scss'

interface IProps {
    link?: boolean
    children?: any
    style?: string
    href?: string
    onClick?: () => void
}

export default class Button extends React.PureComponent<IProps> {
    static defaultProps = {}

    render() {
        const { children, href, onClick, link } = this.props
        return (
            <div className="button-wrapper">
                {href && !link && (
                    <a href={href} className="button">
                        {children}
                    </a>
                )}
                {href && link && (
                    <Link className="button" to={href}>
                        {children}
                    </Link>
                )}
                {!href && (
                    <div className="button" onClick={onClick}>
                        {children}
                    </div>
                )}
            </div>
        )
    }
}

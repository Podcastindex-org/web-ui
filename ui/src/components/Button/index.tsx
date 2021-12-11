import * as React from 'react'
import { Link } from 'react-router-dom'

import './styles.scss'

interface IProps {
    big?: boolean
    primary?: boolean
    link?: boolean
    children?: any
    style?: string
    href?: string
    type?: string
    alt?: string
    onClick?: () => void
    disabled?: boolean
}

export default class Button extends React.PureComponent<IProps> {
    static defaultProps = {}

    render() {
        const {
            children,
            href,
            onClick,
            link,
            primary,
            big,
            type,
            alt,
            disabled,
        } = this.props
        let buttonEl = null
        let buttonClass = disabled ? "disabled" : ""
        if (type === 'submit') {
            buttonEl = (
                <input
                    alt={alt}
                    type="submit"
                    value={children}
                    className={`button ${buttonClass} ${primary ? 'primary' : ''} ${
                        big ? 'big' : ''
                    }`}
                    disabled={disabled}
                />
            )
        } else if (href && !link) {
            buttonEl = (
                <a
                    href={href}
                    className={`button ${buttonClass} ${primary ? 'primary' : ''} ${
                        big ? 'big' : ''
                    }`}
                >
                    {children}
                </a>
            )
        } else if (href && link) {
            buttonEl = (
                <Link
                    to={href}
                    className={`button ${buttonClass} ${primary ? 'primary' : ''} ${
                        big ? 'big' : ''
                    }`}
                >
                    {children}
                </Link>
            )
        } else {
            buttonEl = (
                <button
                    className={`button ${buttonClass} ${primary ? 'primary' : ''} ${
                        big ? 'big' : ''
                    }`}
                    onClick={onClick}
                    disabled={disabled}
                >
                    {children}
                </button>
            )
        }
        return <div className="button-wrapper">{buttonEl}</div>
    }
}

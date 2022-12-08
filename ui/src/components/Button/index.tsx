import * as React from 'react'
import { Link } from 'react-router-dom'

import './styles.scss'

interface IProps {
    className?: string
    big?: boolean
    small?: boolean
    slim?: boolean
    primary?: boolean
    link?: boolean
    children?: any
    style?: string
    href?: string
    type?: string
    alt?: string
    onClick?: (e?: any) => void
    disabled?: boolean
    dataValue?: string
    selected?: boolean
}

export default class Button extends React.PureComponent<IProps> {
    static defaultProps = {}

    render() {
        const {
            className,
            children,
            href,
            onClick,
            link,
            primary,
            big,
            small,
            slim,
            type,
            alt,
            disabled,
            dataValue,
            selected,
        } = this.props
        let buttonEl = null
        let buttonClasses = [
            "button",
            className,
            disabled ? "disabled" : "",
            primary ? 'primary' : '',
            big ? 'big' : '',
            small ? 'small' : '',
            slim ? 'slim' : '',
            selected ? 'selected' : '',
        ]
        let buttonClass = buttonClasses.join(" ")
        if (type === 'submit') {
            buttonEl = (
                <input
                    alt={alt}
                    type="submit"
                    value={children}
                    className={buttonClass}
                    disabled={disabled}
                    data-value={dataValue}
                    onClick={onClick}
                />
            )
        } else if (href && !link) {
            buttonEl = (
                <a
                    href={href}
                    className={buttonClass}
                    data-value={dataValue}
                    onClick={onClick}
                >
                    {children}
                </a>
            )
        } else if (href && link) {
            buttonEl = (
                <Link
                    to={href}
                    className={buttonClass}
                    data-value={dataValue}
                    onClick={onClick}
                >
                    {children}
                </Link>
            )
        } else {
            buttonEl = (
                <button
                    className={buttonClass}
                    onClick={onClick}
                    disabled={disabled}
                    data-value={dataValue}
                >
                    {children}
                </button>
            )
        }
        return <div className="button-wrapper">{buttonEl}</div>
    }
}

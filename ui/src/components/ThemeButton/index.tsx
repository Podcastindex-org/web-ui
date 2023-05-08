/**
 * Display button for toggling stream sync on/off
 */
import React, {ReactNode} from "react"
import DarkImage from "../../../images/dark_mode.svg"
import LightImage from "../../../images/light_mode.svg"

import "./styles.scss"

/**
 * Theme options
 */
export enum Theme {
    /**
     * Use light theme
     */
    light = "light",
    /**
     * Use dark theme
     */
    dark = "dark",
    /**
     * Automatically detect theme
     */
    auto = "auto",
}

/**
 * Arguments/properties of ThemeButton
 */
interface ThemeButtonProps {
}

/**
 * States for ThemeButton
 */
interface ThemeButtonState {
    /**
     * Current theme
     */
    theme: Theme,
}

export default class ThemeButton extends React.PureComponent<ThemeButtonProps, ThemeButtonState> {
    STORAGE_KEY = "theme"
    defaultState: ThemeButtonState = {
        theme: Theme.auto,
    }
    state: ThemeButtonState = {
        theme: Theme.auto,
    }

    constructor(props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    componentDidMount(): void {
        let {theme} = this.state
        const storageTheme = localStorage.getItem(this.STORAGE_KEY)
        let auto = true

        if (storageTheme) {
            theme = storageTheme as Theme
        }

        // check for auto theme
        if (theme === Theme.auto) {
            // detect
            if (window.matchMedia) {
                theme = window.matchMedia('(prefers-color-scheme: light)').matches ? Theme.light : Theme.dark
            } else {
                // can't detect
                theme = Theme.dark
                auto = false
            }
        } else {
            auto = false
        }

        this.setState(
            {
                theme: theme,
            },
            () => {
                document.documentElement.setAttribute("data-theme", theme)
                localStorage.setItem(this.STORAGE_KEY, auto ? Theme.auto : theme)
            }
        )
    }

    /**
     * Handle sync button onClick event
     */
    private readonly handleClick = (): void => {
        const {theme} = this.state
        let newTheme = this.oppositeTheme(theme)
        this.setState(
            {
                theme: newTheme,
            },
            () => {
                document.documentElement.setAttribute("data-theme", newTheme)
                localStorage.setItem(this.STORAGE_KEY, newTheme)
            }
        )
    }

    /**
     * Get the opposite theme
     *
     * @param theme current theme
     * @return Opposite theme
     **/
    private oppositeTheme = (theme: Theme): Theme => {
        if (theme == Theme.auto)
            return theme
        return theme === Theme.dark ? Theme.light : Theme.dark
    }

    render = (): ReactNode => {
        const {theme} = this.state

        const lightMode = theme === Theme.light
        const image = lightMode ? LightImage : DarkImage
        const altText = lightMode ? "Switch to Dark Mode" : "Switch to Light Mode"
        return (
            <div className="theme-button">
                <img
                    className={`icon ${theme}`}
                    src={image}
                    alt={altText}
                    title={altText}
                    onClick={this.handleClick}
                />
            </div>
        )
    }
}

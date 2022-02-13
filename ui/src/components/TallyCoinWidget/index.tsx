import * as React from 'react'

import './styles.scss'

interface IProps {
    theme?: ("dark" | "light"),
}

export default class TallyCoinWidget extends React.PureComponent<IProps> {
    static defaultProps = {
        theme: "light",
    }
    constructor(props: IProps) {
        super(props)
    }

    componentDidMount() {
        // load the external script
        const script = document.createElement('script')
        script.src = 'https://tallyco.in/js/tallypay.js'
        script.async = true
        document.head.appendChild(script)
    }

    render() {
        const {theme} = this.props
        return (
            <div
                className="tallypay"
                data-user="podcastindex"
                data-theme={theme}
            />
        )
    }
}

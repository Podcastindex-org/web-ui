import * as React from 'react'

// import './styles.scss'

interface IProps {
    theme?: 'dark' | 'light'
}

export default class TallyCoinWidget extends React.PureComponent<IProps> {
    tallypayRef = React.createRef<HTMLDivElement>()
    static defaultProps = {
        theme: 'light',
    }

    constructor(props: IProps) {
        super(props)
    }

    componentDidMount() {
        this.triggerWidget()
    }

    addScript() {
        const scriptAdded = document.getElementById('tallycoin-script')

        if (scriptAdded === null) {
            // load the external script
            const script = document.createElement('script')
            script.src = 'https://tallyco.in/js/tallypay.js'
            script.async = true
            script.id = 'tallycoin-script'
            document.head.appendChild(script)
        }
    }

    triggerWidget() {
        this.addScript()

        if (this.tallypayRef.current) {
            if (this.tallypayRef.current.childElementCount === 0) {
                try {
                    // call start function in tallypay.js
                    // @ts-ignore
                    window.init_tallypay_widget()
                } catch (e) {}
            }
        }
    }

    render() {
        const { theme } = this.props
        return (
            <div
                ref={this.tallypayRef}
                className="tallypay"
                data-user="podcastindex"
                data-theme={theme}
            />
        )
    }
}

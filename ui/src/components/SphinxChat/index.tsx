import * as React from 'react'
import Avatar from '../../../images/pci_avatar.jpg'

interface SphinxWidgetProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    pubkey: string,
    title: string,
    subtitle: string,
    name: string,
    amount: string,
    imgurl: string,
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'sphinx-widget': SphinxWidgetProps;
        }
    }
}


interface IProps {
}

export default class SphinxChat extends React.PureComponent<IProps> {

    constructor(props: IProps) {
        super(props)
    }

    componentDidMount() {
        // load the external script
        const script = document.createElement("script")
        script.src = "https://sphinx.chat/donation/widget.js"
        script.async = true
        document.body.appendChild(script)
    }

    render() {
        return (
            <sphinx-widget
                pubkey="036557ea56b3b86f08be31bcd2557cae8021b0e3a9413f0c0e52625c6696972e57"
                title="Value 4 Value Support"
                subtitle="Put in what you get out of this"
                name="Podcast Index LLC"
                amount="10000"
                imgurl={Avatar}
            >
            </sphinx-widget>
        )
    }
}

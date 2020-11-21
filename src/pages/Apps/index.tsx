import * as React from 'react'

import AppsWebPart from './AppsWebPart'

import './styles.scss'

interface IProps {}

export default class Apps extends React.Component<IProps> {
    static defaultProps = {}

    constructor(props: IProps) {
        super(props)
    }

    render() {
        const {} = this.props
        return (
            <div className="landing-content" style={{ marginTop: 20 }}>

  <div className="csb">under dev by CSB, release 010</div> 
            <AppsWebPart/>
         </div>
        )
    }
}

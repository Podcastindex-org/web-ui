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
                <AppsWebPart/>
                <div className="contribute-notes">
                    <h4>Your application or website missing?</h4>
                    <p>
                        {'Create a '}
                        <a href="https://github.com/Podcastindex-org/web-ui/pulls">Pull Request</a>
                        {' to update the '}
                        <a href="https://github.com/Podcastindex-org/web-ui/blob/master/server/data/apps.json">data file</a>.
                    </p>
                    <p>
                        {'Also support namespace features? Add your app or website to the '}
                        <a href="https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/element-support.md">application list</a>
                        {' by creating a '}
                        <a href="https://github.com/Podcastindex-org/podcast-namespace/pulls">Pull Request</a>.
                    </p>
                </div>
            </div>
        )
    }
}

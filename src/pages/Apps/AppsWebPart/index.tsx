import * as React from 'react'
import Podcast from '../../Podcast';


import './styles.scss'


interface AppsWebPartProps {
}

interface AppsWebPartState {
    apps: Array<any>
}


export default class AppsWebPart extends React.Component<AppsWebPartProps,AppsWebPartState> {

    constructor(props: AppsWebPartProps) {
        super(props);
        this.state = {
            apps: []
        }
    }

    _isMounted = false;

    async componentDidMount() {
        this._isMounted = true;
        console.log("componentDidMount(): loading from JSON:")
        const apps = await this.getApps();
        console.log("fetched apps=", apps);
        if (this._isMounted) {
            this.setState({
                apps
            })
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async getApps() {
        let response = await fetch(`/api/apps`, {
            credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    render() {
        return (
            <div className="podcastIndexAppsWebPart">
               apps loaded from JSON:
               { this.state.apps.map((app,i) => (
                 <div className="podcastIndexApp" key={`${i}`}>
                     { app.appName }
                     { app.supportedElements.map((suppElement, j) => (
                         <div  key={`${j}`} className="podcastIndexElement">
                             <a href={suppElement.elementURL}>{suppElement.elementName}</a>
                         </div>
                       )) 
                     }
                 </div>
                ))
               }
            </div>
        )
    }
}
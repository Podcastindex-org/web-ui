import * as React from 'react'



import './styles.scss'


interface AppsWebPartProps {
}

interface AppsWebPartState {
    appsUnfiltered: Array<any>;
    appsFiltered: Array<any>;
    showChapters: boolean;
    showFunding: boolean;
    showTranscript: boolean;
    showAll: boolean;
    activeFilter: [];
}


export default class AppsWebPart extends React.Component<AppsWebPartProps,AppsWebPartState> {

    constructor(props: AppsWebPartProps) {
        super(props);
        this.state = {
            appsUnfiltered: [],
            appsFiltered: [],
            showChapters: false,
            showFunding: false,
            showTranscript: false,
            activeFilter: [],
            showAll: false
        };
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }

    _isMounted = false;

    async componentDidMount() {
        this._isMounted = true;
        console.log("componentDidMount(): loading from JSON:")
        const appsUnfiltered = await this.getApps();
        const appsFiltered = [...appsUnfiltered];
        console.log("fetched apps=", appsUnfiltered);
        if (this._isMounted) {
            this.setState({
                appsUnfiltered, appsFiltered
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

    handleCheckboxChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        console.log("checkbox clicked: name="+name+",value="+value);
        switch(name){
            case "showChapters": { 
                this.setState({showChapters:value}); 
                break; 
            } 
            case "showFunding": { 
                this.setState({showFunding:value}); 
                break; 
            } 
            case "showTranscript": { 
                this.setState({showTranscript:value}); 
                break; 
            } 
            case "showAll": { 
                this.setState({showAll:value});
                break; 
            } 
        }
        // const appsFiltered = this.state.appsUnfiltered.filter(anApp => (
        //     (anApp.supportedElements.contains(name))
        // ) );
        const activeFilter = this.state.activeFilter;

        // this.setState({
        //   [name]: value
        // });
      }

    renderCheckboxes() {
        return (
    <div className="podcastIndexAppsCheckboxArea">
        <label>
            <input
                onChange={this.handleCheckboxChange}
                type="checkbox"
                name="showAll"
                checked={this.state.showAll}
                className="podcastIndexAppsCheckbox">
            </input>
            All
        </label>
        <label>
            <input
                onChange={this.handleCheckboxChange}
                type="checkbox"
                name="showChapters"
                checked={this.state.showChapters}
                className="podcastIndexAppsCheckbox">
            </input>
            Chapters
        </label>
        <label>
            <input
                onChange={this.handleCheckboxChange}
                type="checkbox"
                name="showFunding"
                checked={this.state.showFunding}
                className="podcastIndexAppsCheckbox">
            </input>
            Funding
        </label>
        <label>
            <input
                onChange={this.handleCheckboxChange}
                type="checkbox"
                name="showTranscript"
                checked={this.state.showTranscript}
                className="podcastIndexAppsCheckbox">
            </input>
            Transcript
        </label>
    </div>
        )
    }

    render() {
        return (
            <div className="podcastIndexAppsWebPart">
               {this.renderCheckboxes()}
               apps loaded from JSON:
               { this.state.appsFiltered.map((app,i) => (
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
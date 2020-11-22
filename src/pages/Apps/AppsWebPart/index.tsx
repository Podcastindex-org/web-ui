import * as React from 'react'



import './styles.scss'


interface AppsWebPartProps {
}

interface AppsWebPartState {
    appsUnfiltered: Array<any>;
   // appsFiltered: Array<any>;
    showChapters: boolean;
    showFunding: boolean;
    showTranscript: boolean;
    showAll: boolean;
    activeFilter: string[];
    filterList: Array<{ id: number; name: string; value: string; }>;
}


export default class AppsWebPart extends React.Component<AppsWebPartProps,AppsWebPartState> {

    constructor(props: AppsWebPartProps) {
        super(props);
        this.state = {
            appsUnfiltered: [],
           // appsFiltered: [],
            showChapters: false,
            showFunding: false,
            showTranscript: false,
            activeFilter: [],
            showAll: false,
            filterList: [
                {
                    id: 33,
                    name: "Transcript",
                    value: "Transcript"
                }, 
                {
                    id: 34,
                    name: "Locked",
                    value: "Locked"
                },
                {
                    id: 35,
                    name: "Funding",
                    value: "Funding"
                }, 
                {
                    id: 36,
                    name: "Chapters",
                    value: "Chapters"
                }, 
                {
                    id: 37,
                    name: "Soundbites",
                    value: "Soundbites"
                }              
            ]
        };
    }

    _isMounted = false;

    async componentDidMount() {
        this._isMounted = true;
        //console.log("componentDidMount(): loading from JSON:")
        const appsUnfiltered = await this.getApps();
        const appsFiltered = [...appsUnfiltered];
        console.log("fetched apps from JSON : ", appsUnfiltered);
        if (this._isMounted) {
            this.setState({
                appsUnfiltered//, appsFiltered
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

    onFilterChange(filter) {
        const { filterList, activeFilter } = this.state;
        if (filter === "ALL") {
          if (activeFilter.length === filterList.length) {
            this.setState({ activeFilter: [] });
          } else {
            this.setState({ activeFilter: filterList.map(filter => filter.value) });
          }
        } else {
          if (activeFilter.includes(filter)) {
            const filterIndex = activeFilter.indexOf(filter);
            const newFilter = [...activeFilter];
            newFilter.splice(filterIndex, 1);
            this.setState({ activeFilter: newFilter });
          } else {
            this.setState({ activeFilter: [...activeFilter, filter] });
          }
        }
      }

    renderCheckboxes() {
        return (
    <div className="podcastIndexAppsCheckboxArea">
                Show:
        <label>
            <input
                onChange={() => this.onFilterChange("ALL")}
                type="checkbox"
                name="showAll"
                checked={this.state.activeFilter.length === this.state.filterList.length}
                className="podcastIndexAppsCheckbox">
            </input>
            All
        </label>
        {this.state.filterList.map(filter => (
            <span key={`checkboxArea${filter.id}`}>
                <label >
                    <input
                        onChange={() => this.onFilterChange(filter.value)}
                        type="checkbox"
                        name={filter.name}
                        checked={this.state.activeFilter.includes(filter.value)}
                        className="podcastIndexAppsCheckbox">
                    </input>
                    {filter.name}
                </label>
            </span>
        ))}
    </div>
        )
    }

    matchFound(anApp) {
        const { activeFilter } = this.state;
        //console.log("activeFilter=",activeFilter);
        let matchFound: boolean = false;
        anApp.supportedElements.forEach(function(anElement) {
            //console.log("anElement.elementName=["+anElement.elementName+"]")
            if (activeFilter.includes(anElement.elementName)) {
                //console.log("bingo!");
                matchFound = true; }
        });
        return matchFound;
    }

    render() {
        const { filterList, activeFilter } = this.state;
        //console.log("activeFilter=",activeFilter);
        let appsFiltered: Array<any>;
        if (
            activeFilter.length === 0 ||
            activeFilter.length === filterList.length
          ) {
            //filteredList = this.state.searchLists;
            appsFiltered = [...this.state.appsUnfiltered];
        } 
        else {
            appsFiltered = this.state.appsUnfiltered.filter( anApp => this.matchFound(anApp));
        }
        let appsFilteredAndSorted: Array<any> = appsFiltered.sort(
            (a1,a2) => { return (a1.appName).localeCompare(a2.appName); });
        return (
            <div className="podcastIndexAppsWebPart">
               <h4>Application Support by Element</h4>
               For elements that are included in the
                official <a href="https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md">DTD</a>, we will highlight applications offering production support. Links should point to a public announcement or production example.
                <h4>Elements</h4>
               {this.renderCheckboxes()}
               { appsFilteredAndSorted.map((app,i) => (
                 <div className="podcastIndexApp" key={`${i}`}>
                     <div className="podcastIndexAppIcon">
                         <img src="/images/pci_avatar.jpg" className="podcastIndexAppImage"></img>
                    </div>
                       <div className="podcastIndexAppTitle">{ (i+1) + ": "+ app.appName }</div>
                     <div className="podcastIndexAppSupportedElements">
                     { app.supportedElements.map((suppElement, j) => (
                         <React.Fragment key={`${j}`}>
                             <a href={suppElement.elementURL}>{suppElement.elementName}</a>{", "} 
                         </React.Fragment>
                       )) 
                     }
                     </div>
                 </div>
                ))
               }
            </div>
        )
    }
}

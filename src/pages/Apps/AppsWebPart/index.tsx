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
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
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

    handleCheckboxChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const activeFilter = this.state.activeFilter;
        //console.log("checkbox clicked: name="+name+",value="+value);
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

        // this.setState({
        //   [name]: value
        // });
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
        return (
            <div className="podcastIndexAppsWebPart">
               {this.renderCheckboxes()}
               Application Support by Element:
               { appsFiltered.map((app,i) => (
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
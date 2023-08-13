import * as React from "react";
import SearchIcon from '../../../images/search.svg'
import './styles.scss'

interface IProps {
    search?: string
    searchType?: string
    onSearchChange: (evt: React.ChangeEvent<HTMLInputElement>) => void
    onSearchTypeChange: (evt: React.ChangeEvent<HTMLSelectElement>) => void
    onSearchSubmit?: (evt: React.ChangeEvent<HTMLFormElement>) => void
    filterFunction?: any
}

export default class Searchbar extends React.Component<IProps> {
    static defaultProps = {}
    searchInputRef = React.createRef<HTMLInputElement>()

    constructor(props: IProps) {
        super(props)

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(evt: React.ChangeEvent<HTMLFormElement>) {
        const {onSearchSubmit} = this.props
        if (onSearchSubmit !== null) {
            onSearchSubmit(evt)
        }
        // this will remove focus of the input form and close the keyboard on mobile
        this.searchInputRef.current.blur()
        evt.preventDefault()
    }

    render() {
        const {search, searchType, onSearchChange, onSearchTypeChange} = this.props
        let cleanSearchType = searchType || ""
        if (cleanSearchType === "") {
            cleanSearchType = "all"
        }
        cleanSearchType = cleanSearchType.toLowerCase()

        // noinspection SpellCheckingInspection
        const inputProps = {
            enterkeyhint: "done" // not recognized by typescript so set here and append to input, lowercase to avoid react error in console
        }
        return (
            <form className="topbar-search" onSubmit={this.onSubmit}>
                <img height={18} width={18} src={SearchIcon} alt=""/>
                <input
                    ref={this.searchInputRef}
                    id="search"
                    type="text"
                    value={search}
                    placeholder="Search for podcasts or music"
                    onChange={onSearchChange}
                    autoComplete="off"
                    {...inputProps}
                />
                <div className="search-type-wrapper">
                    <select
                        id="search-type"
                        value={cleanSearchType}
                        onChange={onSearchTypeChange}
                    >
                        <option value="all">All</option>
                        <option value="music">Music</option>
                        <option value="title">Title</option>
                        <option value="person">Person</option>
                    </select>
                </div>
            </form>
        )
    }
}

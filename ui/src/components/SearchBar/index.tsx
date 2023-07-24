import * as React from 'react'
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

    constructor(props: IProps) {
        super(props)
    }

    render() {
        const { search, searchType, onSearchChange, onSearchTypeChange, onSearchSubmit } = this.props
        let cleanSearchType = searchType || ""
        if (cleanSearchType === "")
        {
            cleanSearchType = "all"
        }
        cleanSearchType = cleanSearchType.toLowerCase()

        return (
            <form className="topbar-search" onSubmit={onSearchSubmit}>
                <img height={18} width={18} src={SearchIcon} alt="" />
                <input
                    id="search"
                    type="text"
                    value={search}
                    placeholder="Search for podcasts or music"
                    onChange={onSearchChange}
                    autoComplete="off"
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

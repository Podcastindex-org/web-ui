import * as React from 'react'
import { Link } from 'react-router-dom'
import BrandIcon from '../../../images/brand-icon.svg'
import BrandName from '../../../images/brand-text.svg'
import MenuIcon from '../../../images/menu.svg'
import { history } from '../../state/store'
import { cleanSearchQuery, encodeSearch } from '../../utils'

import Button from '../Button'
import Searchbar from '../SearchBar'

import './styles.scss'

// Separate state props + dispatch props to their own interfaces.
interface IProps {
    history?: any
}

interface IState {
    search: string
    searchType: string
    dropdownOpen: boolean
}

export default class TopBar extends React.PureComponent<IProps, IState> {
    state = {
        search: "",
        searchType: "all",
        dropdownOpen: false,
    }
    static defaultProps = {}
    wrapperRef: React.Ref<HTMLAnchorElement> = React.createRef();
    unlisten = undefined

    constructor(props: IProps) {
        super(props)

        this.onSearchChange = this.onSearchChange.bind(this)
        this.onSearchTypeChange = this.onSearchTypeChange.bind(this)
        this.onSearchSubmit = this.onSearchSubmit.bind(this)
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    updateSearchArgs() {
        const {history} = this.props
        const search = cleanSearchQuery(history.location.search)
        let searchType = cleanSearchQuery(history.location.search, "type").toLowerCase()
        if (searchType === "") {
            searchType = "all"
        }

        this.setState({
            search: search,
            searchType: searchType,
        })
    }

    componentDidMount() {
        this.updateSearchArgs()
        this.unlisten = this.props.history.listen(() => this.updateSearchArgs())
        document.addEventListener("mousedown", this.handleClickOutside);
    }

    componentWillUnmount() {
        this.unlisten()
        document.removeEventListener("mousedown", this.handleClickOutside);
    }

    onSearchChange(evt: React.ChangeEvent<HTMLInputElement>) {
        evt.preventDefault()
        this.setState({search: evt.target.value})
    }

    onSearchTypeChange(evt: React.ChangeEvent<HTMLSelectElement>) {
        evt.preventDefault()
        const {searchType} = this.state
        const newSearchType = evt.target.value.toLowerCase()

        this.setState({
            searchType: newSearchType
        }, () => {
            if (searchType !== newSearchType) {
                this.triggerSearch()
            }
        })
    }

    /**
     * Alert if clicked on outside of element
     */
    handleClickOutside(event) {
        // @ts-ignore
        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
            setTimeout(() => {
                this.setState({
                    dropdownOpen: false,
                })
            }, 100)
        }
    }

    onSearchSubmit(evt: React.ChangeEvent<HTMLFormElement>) {
        this.triggerSearch()
        evt.preventDefault()
    }

    triggerSearch() {
        const {search, searchType} = this.state
        let cleanSearchType = encodeSearch(searchType)
        if (search) {
            // let cleanQuery = this.state.search.replace('%','');
            let cleanQuery = encodeSearch(search)
            history.push(`/search?q=${cleanQuery}&type=${cleanSearchType}`)
        }
    }

    render() {
        const {search, searchType, dropdownOpen} = this.state

        return (
            <nav className="topbar">
                <Link className="topbar-brand" to="/">
                    <img
                        // height={38}
                        width={36}
                        src={BrandIcon}
                        alt="Brand logo"
                    />
                    <div className="topbar-title">
                        <img src={BrandName} width={230} alt="Brand name"/>
                    </div>
                </Link>
                <div className="topbar-span">
                    <Searchbar
                        search={search}
                        searchType={searchType}
                        onSearchChange={this.onSearchChange}
                        onSearchTypeChange={this.onSearchTypeChange}
                        onSearchSubmit={this.onSearchSubmit}
                    />
                </div>
                <div className="topbar-links">
                    <div
                        id="topbar-nav-links"
                        className={`${
                            dropdownOpen ? 'topbar-dropdown-open' : ''
                        }`}
                    >
                        <Button link href="/apps">Apps</Button>
                        <Button link href="/podcast/value4value">Value 4 Value</Button>
                        <Button link href="/stats">
                            Stats
                        </Button>
                        <Button link href="/add">Add</Button>
                        <Button href="https://podcastindex-org.github.io/docs-api/">
                            Docs
                        </Button>
                        <Button href="https://api.podcastindex.org">
                            API
                        </Button>
                    </div>
                    <a
                        ref={this.wrapperRef}
                        href={null}
                        className={`topbar-mobile-dropdown ${dropdownOpen ? 'open' : ''}`}
                        onClick={() =>
                            this.setState({
                                dropdownOpen: !dropdownOpen,
                            })
                        }
                    >
                        <img
                            height={30}
                            width={25}
                            src={MenuIcon}
                            alt="Menu icon"
                        />
                    </a>
                </div>

                {/* <select>
                    <option value="" selected={true}>
                        Select
                    </option>

                    <option value="/">Home</option>
                    <option value="/collections/all">Books</option>
                    <option value="/blogs/five-simple-steps-blog">Blog</option>
                    <option value="/pages/about-us">About Us</option>
                    <option value="/pages/support">Support</option>
                </select> */}
            </nav>
        )
    }
}

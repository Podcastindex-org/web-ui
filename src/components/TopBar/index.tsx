import * as React from 'react'
import { Link } from 'react-router-dom'
import { history } from '../../state/store'

import Button from '../Button'
import Searchbar from '../SearchBar'
import Icon from '../../../images/icon.svg'
import MenuIcon from '../../../images/menu.svg'
import { cleanSearchQuery } from '../../utils'

import './styles.scss'

// Separate state props + dispatch props to their own interfaces.
interface IProps {
    history?: any
}

interface IState {
    search: string
    dropdownOpen: boolean
}

export default class Topbar extends React.PureComponent<IProps, IState> {
    static defaultProps = {}

    constructor(props: IProps) {
        super(props)

        this.state = {
            search: cleanSearchQuery(props.history.location.search),
            dropdownOpen: false,
        }

        this.onSearchChange = this.onSearchChange.bind(this)
        this.onSearchSubmit = this.onSearchSubmit.bind(this)
    }

    onSearchChange(evt: React.ChangeEvent<HTMLInputElement>) {
        evt.preventDefault()
        this.setState({ search: evt.target.value })
    }

    onSearchSubmit(evt: React.ChangeEvent<HTMLFormElement>) {
        if (!this.state.search) {
            history.push(`/search`)
        } else {
            history.push(`/search?q=${this.state.search}`)
        }
        evt.preventDefault()
    }

    render() {
        const { history } = this.props
        const { search, dropdownOpen } = this.state
        return (
            <nav className="topbar">
                <Link className="topbar-brand" to="/">
                    <img height={30} width={28} src={Icon} alt="Sidebar logo" />
                    <div className="topbar-title">Podcast Index</div>{' '}
                </Link>
                <div className="topbar-span">
                    <Searchbar
                        search={search}
                        onSearchChange={this.onSearchChange}
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
                        <Button link href="/stats">
                            Stats
                        </Button>
                        <Button href="https://podcastindex.org/blog">
                            Blog
                        </Button>
                        <Button href="https://api.podcastindex.org">
                            Login
                        </Button>
                    </div>
                    <a
                        href={null}
                        className="topbar-mobile-dropdown"
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

import * as React from 'react'
import { Link } from 'react-router-dom'
import { history } from '../../state/store'

import Button from '../Button'
import Searchbar from '../SearchBar'
import BrandIcon from '../../../images/brand-icon.svg'
import BrandName from '../../../images/brand-text.svg'
import MenuIcon from '../../../images/menu.svg'
import { cleanSearchQuery, encodeSearch } from '../../utils'

import './styles.scss'
import { Container, Nav, Navbar } from 'react-bootstrap'

// Separate state props + dispatch props to their own interfaces.
interface IProps {
    history?: any
}

interface IState {
    search: string
    dropdownOpen: boolean
}

export default class TopBar extends React.PureComponent<IProps, IState> {
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
        const { search } = this.state
        if (!search) {
            history.push(`/search`)
        } else {
            // let cleanQuery = this.state.search.replace('%','');
            let cleanQuery = encodeSearch(search)
            history.push(`/search?q=${cleanQuery}`)
        }
        evt.preventDefault()
    }

    render() {
        const { search, dropdownOpen } = this.state
        return (
            <Container>
                <Navbar variant="light" expand="md" className="py-4">
                    <Container>
                        <Navbar.Brand href="/">
                            <img
                                // height={38}
                                width={36}
                                src={BrandIcon}
                                alt="Brand logo"
                                className="me-2"
                            />
                            <img src={BrandName} width={230} alt="Brand name" />
                        </Navbar.Brand>
                        <Navbar.Toggle
                            aria-controls="main-nav"
                            className="px-0"
                        />
                        <Navbar.Collapse id="main-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/apps">Apps</Nav.Link>
                                <Nav.Link href="/podcast/value4value">
                                    Value 4 Value
                                </Nav.Link>
                                <Nav.Link href="/stats">Stats</Nav.Link>
                                <Nav.Link href="/add">Add</Nav.Link>
                                <Nav.Link href="https://podcastindex-org.github.io/docs-api/">
                                    Docs
                                </Nav.Link>
                                <Nav.Link href="https://api.podcastindex.org">
                                    API
                                </Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                    <Searchbar
                        search={search}
                        onSearchChange={this.onSearchChange}
                        onSearchSubmit={this.onSearchSubmit}
                    />
                </Navbar>
            </Container>
        )
    }
}

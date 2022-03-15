import * as React from 'react'
import { history } from '../../state/store'

import { LinkContainer } from 'react-router-bootstrap'
import Searchbar from '../SearchBar'
import BrandIcon from '../../../images/brand-icon.svg'
import BrandName from '../../../images/brand-text.svg'
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
            <Navbar variant="light" expand="md" className="py-4">
                <Container>
                    <LinkContainer to="/">
                        <Navbar.Brand>
                            <img
                                // height={38}
                                width={36}
                                src={BrandIcon}
                                alt="Brand logo"
                                className="me-2"
                            />
                            <img src={BrandName} width={230} alt="Brand name" />
                        </Navbar.Brand>
                    </LinkContainer>
                    <Navbar.Toggle aria-controls="main-nav" className="px-0" />
                    <Navbar.Collapse id="main-nav">
                        <Nav className="me-auto">
                            <LinkContainer to="/apps">
                                <Nav.Link>Apps</Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/podcast/value4value">
                                <Nav.Link>Value 4 Value</Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/stats">
                                <Nav.Link>Stats</Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/add">
                                <Nav.Link>Add</Nav.Link>
                            </LinkContainer>
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
        )
    }
}

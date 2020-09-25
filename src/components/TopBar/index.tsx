import * as React from 'react'

import { history } from '../../state/store'

import Button from '../Button'
import Searchbar from '../SearchBar'
import Icon from '../../../images/icon.svg'
import SearchIcon from '../../../images/search.svg'

import './styles.scss'

// Separate state props + dispatch props to their own interfaces.
interface IProps {}

export default class Topbar extends React.Component<IProps> {
    static defaultProps = {}
    state = {
        search: '',
    }

    constructor(props: IProps) {
        super(props)

        this.onSearchChange = this.onSearchChange.bind(this)
        this.onSearchSubmit = this.onSearchSubmit.bind(this)
    }

    onSearchChange(evt: React.ChangeEvent<HTMLInputElement>) {
        evt.preventDefault()
        this.setState({ search: evt.target.value })
    }

    onSearchSubmit(evt: React.ChangeEvent<HTMLFormElement>) {
        history.push(`/search?q=${this.state.search}`)
        evt.preventDefault()
    }

    render() {
        const { search } = this.state
        return (
            <div className="topbar">
                <a href="https://podcastindex.org" className="topbar-brand">
                    <img height={30} width={28} src={Icon} alt="Sidebar logo" />
                    <div className="topbar-title">Podcast Index</div>
                </a>
                <div className="topbar-span">
                    <Searchbar
                        search={search}
                        onSearchChange={this.onSearchChange}
                        onSearchSubmit={this.onSearchSubmit}
                    />

                    <Button href="https://podcastindex.org/stats">Stats</Button>
                    <Button href="https://podcastindex.org/blog">Blog</Button>
                </div>
                <div className="topbar-right">
                    <Button href="https://podcastindex.org/#developer">
                        Login
                    </Button>
                </div>
            </div>
        )
    }
}

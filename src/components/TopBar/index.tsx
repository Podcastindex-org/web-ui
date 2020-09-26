import * as React from 'react'
import { Link } from 'react-router-dom'
import { history } from '../../state/store'

import Button from '../Button'
import Searchbar from '../SearchBar'
import Icon from '../../../images/icon.svg'
import { cleanSearchQuery } from '../../utils'

import './styles.scss'

// Separate state props + dispatch props to their own interfaces.
interface IProps {
    history?: any
}

export default class Topbar extends React.PureComponent<IProps> {
    static defaultProps = {}
    state = {
        search: '',
    }

    constructor(props: IProps) {
        super(props)

        this.state = {
            search: cleanSearchQuery(props.history.location.search),
        }

        this.onSearchChange = this.onSearchChange.bind(this)
        this.onSearchSubmit = this.onSearchSubmit.bind(this)
    }

    // componentDidUpdate() {
    //     console.log('It updated')
    // }

    onSearchChange(evt: React.ChangeEvent<HTMLInputElement>) {
        evt.preventDefault()
        this.setState({ search: evt.target.value })
    }

    onSearchSubmit(evt: React.ChangeEvent<HTMLFormElement>) {
        history.push(`/search?q=${this.state.search}`)
        evt.preventDefault()
    }

    // static shouldComponentUpdate(nextProps, nextState) {
    //     let newQuery = cleanSearchQuery(nextProps.history.location.search)
    //     if (nextState.search !== newQuery) {
    //         return true
    //     }
    // }

    render() {
        const { history } = this.props
        const { search } = this.state
        return (
            <div className="topbar">
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

                    <Button href="https://podcastindex.org/stats">Stats</Button>
                    <Button href="https://podcastindex.org/blog">Blog</Button>
                </div>
                <div className="topbar-right">
                    <Button href="https://api.podcastindex.org">Login</Button>
                </div>
            </div>
        )
    }
}

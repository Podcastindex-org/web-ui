import * as React from 'react'

import Button from '../Button'
import Icon from '../../../images/icon.svg'
import SearchIcon from '../../../images/search.svg'

import './styles.scss'
import { AnyAction } from 'redux'

// Separate state props + dispatch props to their own interfaces.
interface IProps {
    title?: string
    children?: any
}

export default class Topbar extends React.Component<IProps> {
    static defaultProps = {}
    state = {
        search: '',
    }

    constructor(props: IProps) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(evt: AnyAction) {
        this.setState({ search: evt.target.value })
    }

    render() {
        const { title, children } = this.props
        const { search } = this.state
        return (
            <div className="topbar">
                <a href="https://podcastindex.org" className="topbar-brand">
                    <img height={30} width={28} src={Icon} alt="Sidebar logo" />
                    <div className="topbar-title">Podcast Index</div>
                </a>
                <div className="topbar-span">
                    <div className="topbar-search">
                        <img height={18} width={18} src={SearchIcon} />
                        <input
                            type="text"
                            value={search}
                            placeholder="Search for podcasts"
                            onChange={this.handleChange}
                        />
                    </div>
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

import * as React from 'react'
import SearchIcon from '../../../images/search.svg'

import './styles.scss'

interface IProps {
    search?: string
    onSearchChange: (evt: React.ChangeEvent<HTMLInputElement>) => void
    filterFunction?: any
}

export default class Card extends React.Component<IProps> {
    static defaultProps = {}

    constructor(props: IProps) {
        super(props)
    }

    render() {
        const { search, onSearchChange } = this.props
        // const { open } = this.state
        return (
            <div className="topbar-search">
                <img height={18} width={18} src={SearchIcon} />
                <input
                    type="text"
                    value={search}
                    placeholder="Search for podcasts"
                    onChange={onSearchChange}
                />
            </div>
        )
    }
}

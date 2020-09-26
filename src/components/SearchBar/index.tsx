import * as React from 'react'
import SearchIcon from '../../../images/search.svg'
import './styles.scss'

interface IProps {
    search?: string
    onSearchChange: (evt: React.ChangeEvent<HTMLInputElement>) => void
    onSearchSubmit?: (evt: React.ChangeEvent<HTMLFormElement>) => void
    filterFunction?: any
}

export default class Card extends React.Component<IProps> {
    static defaultProps = {}

    constructor(props: IProps) {
        super(props)
    }

    render() {
        const { search, onSearchChange, onSearchSubmit } = this.props

        return (
            <form className="topbar-search" onSubmit={onSearchSubmit}>
                <img height={18} width={18} src={SearchIcon} />
                <input
                    id="search"
                    type="text"
                    value={search}
                    placeholder="Search for podcasts"
                    onChange={onSearchChange}
                    autoComplete="off"
                />
            </form>
        )
    }
}

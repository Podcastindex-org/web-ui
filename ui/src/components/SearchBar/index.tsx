import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as React from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import SearchIcon from '../../../images/search.svg'
// import './styles.scss'

interface IProps {
    search?: string
    onSearchChange: (evt: React.ChangeEvent<HTMLInputElement>) => void
    onSearchSubmit?: (evt: React.ChangeEvent<HTMLFormElement>) => void
    filterFunction?: any
}

export default class Searchbar extends React.Component<IProps> {
    static defaultProps = {}

    constructor(props: IProps) {
        super(props)
    }

    render() {
        const { search, onSearchChange, onSearchSubmit } = this.props

        return (
            <Form className="w-100" onSubmit={onSearchSubmit}>
                <InputGroup className="my-3 my-lg-0">
                    <InputGroup.Text>
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="text-muted"
                        />
                        {/* <<img height={18} width={18} src={SearchIcon} alt="" />> */}
                    </InputGroup.Text>
                    <Form.Control
                        id="search"
                        type="text"
                        value={search}
                        placeholder="Search for podcasts"
                        onChange={onSearchChange}
                        autoComplete="off"
                    />
                </InputGroup>
            </Form>
        )
    }
}

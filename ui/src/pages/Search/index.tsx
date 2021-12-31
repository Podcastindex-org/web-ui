import * as React from 'react'
import ReactList from 'react-list'
import ReactLoading from 'react-loading'
import { Link } from 'react-router-dom'
import ResultItem from '../../components/ResultItem'

import { cleanSearchQuery, isValidURL, updateTitle } from '../../utils'

import './styles.scss'

interface IProps {
    results?: Array<{}>
    location: any
    history?: any
}

export default class Results extends React.PureComponent<IProps> {
    state = {
        query: "",
        results: [],
        loading: true,
    }
    _isMounted = false

    async componentDidMount(): Promise<void> {
        this._isMounted = true

        let query = cleanSearchQuery(this.props.location.search)
        if (query) {
            const results = (await this.getSearchResults(query)).feeds
            if (this._isMounted) {
                this.setState({
                    loading: false,
                    query,
                    results,
                })
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async componentDidUpdate(prevProps) {
        let query = cleanSearchQuery(this.props.location.search)
        if (
            query.length &&
            query !== cleanSearchQuery(prevProps.location.search)
        ) {
            this.setState({
                loading: true,
            })
            const results = (await this.getSearchResults(query)).feeds
            this.setState({
                loading: false,
                query,
                results,
            })
        }
    }

    async getSearchResults(query: string) {
        let response = await fetch(`/api/search/byterm?q=${query}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    renderItem(index: number, key: number) {
        let title = this.state.results[index].title
        let image = this.state.results[index].image
        let author = this.state.results[index].author
        let description = this.state.results[index].description
        let categories = this.state.results[index].categories
        let id = this.state.results[index].id

        return (
            <div key={key}>
                <ResultItem
                    title={title}
                    author={author}
                    image={image}
                    description={description}
                    categories={categories}
                    id={id}
                />
            </div>
        )
    }

    renderNoResults() {
        const { query } = this.state

        const isURL = isValidURL(query)

        const noResults = 'No results for your search'
        updateTitle(noResults)
        return (
            <div className="results-list">
                <p>{noResults}</p>
                {
                    isURL ?
                        <p>
                            {`Add ${query} to index? `}
                            <Link
                                to={`/add?feed=${query}`}
                            >
                                Click here
                            </Link>
                        </p>
                        :
                        <p/>
                }
            </div>
        )
    }

    render() {
        const { loading, results } = this.state
        let query = cleanSearchQuery(this.props.location.search)
        if (results.length === 0 && !loading) {
            return this.renderNoResults()
        }
        if (loading) {
            updateTitle('Loading results ...')
            return (
                <div className="loader-wrapper" style={{ height: 300 }}>
                    <ReactLoading type="cylon" color="#e90000" />
                </div>
            )
        }
        updateTitle(`Search results for "${query}"`)
        return (
            <div className="results-list">
                <ReactList
                    minSize={10}
                    pageSize={10}
                    itemRenderer={this.renderItem.bind(this)}
                    length={results.length}
                    type="simple"
                />
            </div>
        )
    }
}

import * as React from "react";
import ReactLoading from 'react-loading'
import { Link } from 'react-router-dom'
import InfiniteList from "../../components/InfiniteList";
import ResultItem from '../../components/ResultItem'

import { cleanSearchQuery, encodeSearch, getImage, isValidURL, updateTitle } from '../../utils'

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

        await this.fetchResults()
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async componentDidUpdate(prevProps) {
        let query = cleanSearchQuery(this.props.location.search)
        let prevQuery = cleanSearchQuery(prevProps.location.search)
        if (
            query.length &&
            query !== prevQuery
        ) {
            this.setState({
                loading: true,
            })
            await this.fetchResults()
        }
    }

    fetchResults = async () => {
        let query = cleanSearchQuery(this.props.location.search)
        if (query) {
            const results = (await this.getTitleSearchResults(query)).feeds as Array<any>
            const termResults = (await this.getTermSearchResults(query)).feeds as Array<any>
            const ids = results.map((value) => value.id)
            termResults.forEach((value) => {
                if (!ids.includes(value.id)) {
                    results.push(value)
                }
            })
            if (this._isMounted) {
                this.setState({
                    loading: false,
                    query,
                    results,
                })
            }
        }
    }

    async getTermSearchResults(query: string) {
        query = encodeSearch(query)
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/search/byterm?q=${query}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    async getTitleSearchResults(query: string) {
        query = encodeSearch(query)
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/search/bytitle?q=${query}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    renderItem(item, index: number) {
        let {title, author, description, categories, id} = item
        const image = getImage(item)

        return (
            <div key={index}>
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
        const {query} = this.state

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
        const {loading, results} = this.state
        let query = cleanSearchQuery(this.props.location.search)
        if (results.length === 0 && !loading) {
            return this.renderNoResults()
        }
        if (loading) {
            updateTitle('Loading results ...')
            return (
                <div className="loader-wrapper" style={{height: 300}}>
                    <ReactLoading type="cylon" color="#e90000"/>
                </div>
            )
        }
        updateTitle(`Search results for "${query}"`)
        return (
            <div className="results-list">
                <InfiniteList
                    data={results}
                    itemRenderer={this.renderItem}
                    initialDisplay={30}
                />
            </div>
        )
    }
}

import * as React from 'react'
import ReactList from 'react-list'

import ResultItem from '../components/ResultItem'

import API from '../api'
import { cleanSearchQuery } from '../utils'

import './styles.scss'

interface IProps {
    results?: Array<{}>
    location: any
    history?: any
}

export default class Results extends React.PureComponent<IProps> {
    state = {
        results: [],
        loading: true,
    }
    _isMounted = false

    async componentDidMount(): Promise<void> {
        this._isMounted = true

        let query = cleanSearchQuery(this.props.location.search)
        if (query) {
            const results = (await API.search_feeds(query)).feeds
            if (this._isMounted) {
                this.setState({
                    loading: false,
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
        if (query && query !== cleanSearchQuery(prevProps.location.search)) {
            const results = (await API.search_feeds(query)).feeds
            console.log(results)
            this.setState({
                loading: false,
                results,
            })
        }
    }

    renderItem(index: number, key: number) {
        let title = this.state.results[index].title
        let image = this.state.results[index].image
        let author = this.state.results[index].author
        let description = this.state.results[index].description
        let categories = this.state.results[index].categories

        return (
            <div key={key}>
                <ResultItem
                    title={title}
                    author={author}
                    image={image}
                    description={description}
                    categories={categories}
                />
            </div>
        )
    }

    render() {
        const { loading, results } = this.state
        if (results.length === 0 && !loading) {
            return (
                <div className="results-list">No results for your search</div>
            )
        }
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

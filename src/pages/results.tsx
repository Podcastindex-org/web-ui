import * as React from 'react'
import ReactList from 'react-list'

import ResultItem from '../components/ResultItem'

import API from '../api'
import { cleanSearchQuery } from '../utils'

import './styles.scss'

interface IProps {
    results?: Array<{}>
    location: any
}

export default class Results extends React.Component<IProps> {
    state = {
        results: [],
    }
    _isMounted = false

    async componentDidMount(): Promise<void> {
        this._isMounted = true

        let query = cleanSearchQuery(this.props.location.search)
        if (query) {
            const results = (await API.search_feeds(query)).feeds
            if (this._isMounted) {
                console.log(results)
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

    // async componentDidUpdate() {
    //     console.log('UPDATED')
    //     let query = cleanSearchQuery(this.props.location.search)
    //     if (query) {
    //         const results = (await API.search_feeds(query)).feeds
    //         console.log(results)
    //         this.setState({
    //             loading: false,
    //             results,
    //         })
    //     }
    // }

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
        const { location } = this.props
        const { results } = this.state
        if (results.length === 0) {
            return (
                <div className="results-list">No results for your search</div>
            )
        }
        return (
            <div className="results-list">
                <ReactList
                    pageSize={10}
                    itemRenderer={this.renderItem.bind(this)}
                    length={results.length}
                    type="uniform"
                />
            </div>
        )
    }
}

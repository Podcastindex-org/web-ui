import * as React from 'react'
import ReactList from 'react-list'

import ResultItem from '../components/ResultItem'

import { searchList } from '../data'

import './styles.scss'

interface IProps {
    results?: Array<{}>
}

export default class Results extends React.Component<IProps> {
    state = {
        results: [],
    }

    componentWillMount() {
        this.setState({
            results: searchList.feeds,
        })
    }

    renderItem(index, key) {
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
        return (
            <div className="results-list">
                <ReactList
                    pageSize={10}
                    itemRenderer={this.renderItem.bind(this)}
                    length={this.state.results.length}
                    type="uniform"
                />
            </div>
        )
    }
}

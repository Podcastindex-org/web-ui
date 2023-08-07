import * as React from "react";
import InfiniteList from "../../components/InfiniteList";
import ResultItem from '../../components/ResultItem'

import { getImage } from '../../utils'

import './styles.scss'

interface IProps {
    results?: Array<{}>
    initialDisplay?: number
}

export default class ResultsFeeds extends React.PureComponent<IProps> {
    state = {
        loading: true,
    }
    _isMounted = false

    async componentDidMount(): Promise<void> {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async componentDidUpdate(prevProps) {
    }

    renderItem(item, index: number, selected: boolean) {
        let {title, author, description, categories, id} = item
        const image = getImage(item)

        return (
            <div key={index}>
                <ResultItem
                    className={selected ? "selected-item" : ""}
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

    render() {
        const {results, initialDisplay} = this.props
        const {loading} = this.state

        return (
            <div className="results-list">
                <InfiniteList
                    data={results}
                    itemRenderer={this.renderItem}
                    initialDisplay={initialDisplay}
                />
            </div>
        )
    }
}

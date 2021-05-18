import * as React from 'react'
import ReactList from 'react-list'
import ReactLoading from 'react-loading'
import ResultItem from '../../../components/ResultItem'

import {updateTitle} from '../../../utils'

import './styles.scss'

interface IProps {
    results?: Array<{}>
    location: any
    history?: any
}

export default class Value4Value extends React.PureComponent<IProps> {
    state = {
        results: [],
        loading: true,
    }
    _isMounted = false

    async componentDidMount(): Promise<void> {
        this._isMounted = true

        let results = (await this.getValue4ValuePodcasts()).feeds
        results.sort((a, b) => a.title.localeCompare(b.title))
        if (this._isMounted) {
            this.setState({
                loading: false,
                results,
            })
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async getValue4ValuePodcasts() {
        console.log('called')
        let response = await fetch(`/api/podcasts/bytag?podcast-value`, {
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

    render() {
        const {loading, results} = this.state
        if (results.length === 0 && !loading) {
            const noResults = 'No Value 4 Value podcasts found'
            updateTitle(noResults)
            return <div className="v4v">{noResults}</div>
        }
        if (loading) {
            updateTitle('Loading Value 4 Value podcasts ...')
            return (
                <div className="loader-wrapper" style={{height: 300}}>
                    <ReactLoading type="cylon" color="#e90000"/>
                </div>
            )
        }
        updateTitle(`Value 4 Value Podcasts`)
        return (
            <div className="v4v">
                <h2>Value 4 Value Podcasts</h2>
                <p>These podcasts are receiving Bitcoin payments in real-time over the lightning network using <b><a href="/apps">Podcasting 2.0 apps</a></b>.</p>

                <p>To start receiving "value 4 value" streaming payments for your podcast, find it with the search box above and click the
                    lightning bolt on your podcast page to get started.</p>

                <br/>

                <div className="v4v-results">
                    <ReactList
                        minSize={1}
                        pageSize={10}
                        itemRenderer={this.renderItem.bind(this)}
                        length={results.length}
                        type="simple"
                    />
                </div>
            </div>
        )
    }
}

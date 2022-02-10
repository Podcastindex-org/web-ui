import * as React from 'react'
import ReactLoading from 'react-loading'
import { Link } from 'react-router-dom'
import InfiniteList from "../../../components/InfiniteList";
import ResultItem from '../../../components/ResultItem'

import { updateTitle } from '../../../utils'

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

    constructor(props) {
        super(props)

        this.renderItem = this.renderItem.bind(this)
    }


    async componentDidMount(): Promise<void> {
        this._isMounted = true

        let results = (await this.getValue4ValuePodcasts()).feeds as Array<any>

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
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/podcasts/bytag?podcast-value`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    renderItem(item, index: number) {
        let {results} = this.state
        const key = `v4v-podcast-${index}`

        let {title, image, author, description, categories, id} = results[index]

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

    renderResults() {
        let {results} = this.state

        if (results.length == 0) {
            return (<div/>)
        }

        // TODO: do we want to sort alphabetically? Return data is by popularity
        // results = results.sort((a: any, b: any) => a.title.localeCompare(b.title))
        return (
            <div className="v4v-results">
                {
                    results.length === 0
                        ?
                        <p>No podcasts</p>
                        :
                        <InfiniteList
                            data={results}
                            itemRenderer={this.renderItem}
                            initialDisplay={25}
                        />
                }
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
                <p>These podcasts are set up to receive Bitcoin payments in real-time over the Lightning network using
                    compatible <b><Link to="/apps">Podcasting 2.0 apps</Link></b>.</p>
                <p>There are <b>{results.length}</b> Value 4 Value podcasts!</p>
                <br/>
                {this.renderResults()}
            </div>
        )
    }
}

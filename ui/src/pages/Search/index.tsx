import * as React from "react";
import ReactLoading from 'react-loading'
import { Link } from 'react-router-dom'
import ResultsEpisodes from "../../components/ResultsEpisodes";
import ResultsFeeds from "../../components/ResultsFeeds";

import { cleanSearchQuery, encodeSearch, isValidURL, updateTitle } from '../../utils'

import './styles.scss'

interface IProps {
    results?: Array<{}>
    location: any
    history?: any
}

export default class Results extends React.PureComponent<IProps> {
    state = {
        query: "",
        searchType: "all",
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

        let searchType = cleanSearchQuery(this.props.location.search, "type").toLowerCase()
        let prevSearchType = cleanSearchQuery(prevProps.location.search, "type").toLowerCase()

        if (
            (query !== prevQuery) ||
            (searchType !== prevSearchType)
        ) {
            this.setState({
                loading: true,
            })
            await this.fetchResults()
        }
    }

    fetchResults = async () => {
        const query = cleanSearchQuery(this.props.location.search)
        let searchType = cleanSearchQuery(this.props.location.search, "type").toLowerCase()
        if (searchType === "") {
            searchType = "all"
        }

        let results = []
        if (query) {
            switch (searchType) {
                case "music":
                    results = await (await this.getMusicTermSearchResults(query)).feeds as Array<any>
                    break
                case "title":
                    results = await (await this.getTitleSearchResults(query)).feeds as Array<any>
                    break
                case "person":
                    results = await (await this.getPersonSearchResults(query)).items as Array<any>
                    break
                case "all":
                default:
                    results = await (await this.getTermSearchResults(query, true)).feeds as Array<any>
            }
        }
        if (this._isMounted) {
            this.setState({
                loading: false,
                query,
                searchType,
                results,
            })
        }
    }

    async getTermSearchResults(query: string, similar: boolean = false) {
        query = encodeSearch(query)
        const similarParam = similar ? "&similar" : ""
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/search/byterm?q=${query}${similarParam}`, {
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

    async getMusicTermSearchResults(query: string) {
        query = encodeSearch(query)
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/search/music/byterm?q=${query}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    async getPersonSearchResults(query: string) {
        query = encodeSearch(query)
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/search/byperson?q=${query}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    renderNoResults() {
        const {query} = this.state

        const isURL = isValidURL(query)

        const noResults = 'No results for your search'
        updateTitle(noResults)
        return (
            <div className="results-page">
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
        const {loading, results, searchType} = this.state
        let query = cleanSearchQuery(this.props.location.search)
        if (results.length === 0 && !loading) {
            return this.renderNoResults()
        }
        if (loading) {
            updateTitle('Loading results ...')
            return (
                <div className="results-page loader-wrapper" style={{height: 300}}>
                    <ReactLoading type="cylon" color="#e90000"/>
                </div>
            )
        }
        updateTitle(`Search results for "${query}" (${searchType})`)
        return (
            <div className="results-page">
                {
                    searchType === "person" ?
                        <ResultsEpisodes episodes={results} initialDisplay={30}/>
                        :
                        <ResultsFeeds results={results} initialDisplay={30}/>
                }
            </div>
        )
    }
}

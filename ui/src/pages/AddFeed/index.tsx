import HCaptcha from '@hcaptcha/react-hcaptcha'
import * as React from "react"
import ReactLoading from 'react-loading'
import { Link } from 'react-router-dom'
import Button from "../../components/Button"
import ResultItem from "../../components/ResultItem"

import { cleanSearchQuery, updateTitle } from '../../utils'

import './styles.scss'

interface IProps {
    location: any
    history?: any
}

export default class AddFeed extends React.PureComponent<IProps> {
    captchaRef = React.createRef<HCaptcha>()
    state = {
        adding: false,
        addDone: false,
        token: null,
        feed: "",
        result: null,
        feedInfo: undefined,
    }
    _isMounted = false

    constructor(props) {
        super(props)
        // fix this in handlers
        this.onError = this.onError.bind(this)
        this.onExpire = this.onExpire.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.setFeed = this.setFeed.bind(this)
        this.setToken = this.setToken.bind(this)
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true

        let feed = cleanSearchQuery(this.props.location.search, "feed")
        if (feed) {
            if (this._isMounted) {
                this.setState({
                    feed: feed
                })
            }
        }
    }

    resetStates() {
        this.setState({
            adding: false,
            addDone: false,
            result: null,
            feedInfo: undefined,
        })
    }

    setFeed(evt: React.ChangeEvent<HTMLInputElement>) {
        let feed = evt.target.value
        this.resetStates()
        this.setState({
            feed: feed
        })
    }

    setToken(token) {
        this.setState({
            token: token
        })
    }

    async onSubmit(evt: React.FormEvent<HTMLFormElement>) {
        evt.preventDefault()
        const {feed} = this.state

        this.resetStates()
        this.setState({
            adding: true,
        })

        if (feed !== null) {
            const result = await this.addFeed(feed)
            this.setState({
                addDone: true,
                result,
            })

            this.setState({
                feedInfo: undefined,
            })
            const feedInfo = (await this.getPodcastInfo(feed)).feed || null
            this.setState({
                feedInfo,
            })
        }
    }

    async addFeed(feed: string) {
        let result = null
        // noinspection SpellCheckingInspection
        await fetch(`/api/add/byfeedurl?url=${feed}`, {
            method: 'GET',
        })
            .then(res => res.text())
            .then(body => {
                try {
                    result = JSON.parse(body)
                } catch {
                    result = JSON.parse(`{"status":"false", "description": "Error adding feed"}`)
                }
            })
        return result
    }

    async getPodcastInfo(feed: string) {
        let result = null
        // noinspection SpellCheckingInspection
        await fetch(`/api/podcasts/byfeedurl?url=${feed}`, {
            method: 'GET',
        })
            .then(res => res.text())
            .then(body => {
                try {
                    result = JSON.parse(body)
                } catch {
                    result = JSON.parse(`{"status":"false", "description": "Error getting feed"}`)
                }
            })
        return result
    }

    onExpire() {
        // this.setState({
        //     token: null
        // })
    }

    onError(err) {
        console.log(`hCaptcha Error: ${err}`)
    }

    showAddResult() {
        const {adding, addDone, result} = this.state

        if (adding) {
            if (addDone) {
                if (result === null) {
                    return this.renderError("API returned without data")
                } else {
                    return this.renderReply()
                }
            } else {
                return this.renderLoading("add-result")
            }
        } else {
            return this.renderEmpty()
        }
    }

    renderEmpty() {
        return (
            <div className="add-result empty">
            </div>
        )
    }

    renderLoading(className) {
        return (
            <div className={`${className} loading`}>
                <div className="loader-wrapper" style={{height: 300}}>
                    <ReactLoading type="cylon" color="#e90000"/>
                </div>
            </div>
        )
    }

    renderError(message: string) {
        return (
            <div className="add-result error">
                <h3>Failed to add feed</h3>
                <p>{message}</p>
            </div>
        )
    }

    renderPodcast(feedId: number) {
        const {feedInfo, feed, result} = this.state
        if (feedInfo === undefined) {
            return this.renderLoading("feed-info")
        } else if (feedInfo === null) {
            const {feedId} = result
            return (
                <div className="add-result podcast-fail">
                    <h3>Result</h3>
                    <p>Feed {feed} already exists</p>
                    <p>View feed page for <Link
                        to={`/podcast/${feedId}`}
                    >
                        {feedId}
                    </Link>.</p>
                </div>
            )
        } else {
            return (
                <div className="add-result podcast-data">
                    <h3>Feed {feedId} already exists</h3>
                    <ResultItem
                        title={feedInfo.title}
                        author={feedInfo.author}
                        image={feedInfo.image}
                        description={feedInfo.description}
                        categories={feedInfo.categories}
                        id={feedInfo.id}
                    />
                </div>
            )
        }
    }

    renderReply() {
        const {feed, result} = this.state
        console.log(result)
        const {status, description, existed, feedId} = result

        if (status === true || status === 'true') {
            // if existing, show podcast "result"
            if ((existed === true || existed === 'true') && feedId !== null) {
                return this.renderPodcast(feedId)
            } else {
                // else, show information with link to podcast page (note may not work)
                return (
                    <div className="add-result new">
                        <h3>Result</h3>
                        <p>Feed {feed} added to queue</p>
                        <p>Description: {description}</p>
                        <p>View feed in <Link
                            to={`/search?q=${feed}`}
                        >search results
                        </Link>. <i>Note: will take some time before feed is first parsed.</i></p>
                    </div>
                )
            }
        } else {
            // add failed, show error
            return this.renderError(description)
        }
    }

    render() {
        const {token, feed} = this.state

        updateTitle(`Add Feed`)
        return (
            <div className="add-feed">
                <h2>Add a feed to the index</h2>
                <p>Enter the URL to the Podcast feed in the box below.</p>

                <form className="add-feed-form" onSubmit={this.onSubmit}>
                    <div className="feed">
                        <input
                            id="feed"
                            type="text"
                            value={feed}
                            placeholder="https://example.org/podcast/feed.xml"
                            onChange={this.setFeed}
                            autoComplete="off"
                            required
                        />
                    </div>
                    <HCaptcha
                        // TODO: replace this
                        sitekey="00000001-0000-0001-0000-000000000001"
                        onVerify={this.setToken}
                        onError={this.onError}
                        onExpire={this.onExpire}
                        ref={this.captchaRef}
                    />
                    <Button
                        type="submit"
                        disabled={feed == "" || token == null}
                    >Add</Button>
                </form>

                {this.showAddResult()}
            </div>
        )
    }
}

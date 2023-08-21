import * as React from 'react'
import ReactLoading from 'react-loading'
import { Link } from 'react-router-dom'
import Button from "../../../components/Button";
import InfiniteList from "../../../components/InfiniteList";
import ResultItem from '../../../components/ResultItem'

import { getImage, updateTitle } from '../../../utils'

import './styles.scss'

// noinspection SpellCheckingInspection
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const NUMBERS = "0123456789"
const SYMBOLS = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"

interface PageData {
    groupPages: Array<any>,
    displayCount: number,
}

enum SpecialPages {
    POPULAR = 'Popular',
    SYMBOL = '#',
    NUMERIC = '1',
    OTHER = '...',
    ALL = 'All',
}

interface IProps {
    results?: Array<{}>
    location: any
    history?: any
}

export default class Value4Value extends React.PureComponent<IProps> {
    state = {
        results: [],
        loadingPopular: true,
        loadingAll: true,
        selectedPage: null,
        pages: new Map<string, PageData>(),
        total: 0,
        initialDisplay: 10,
    }
    _isMounted = false

    constructor(props) {
        super(props)

        this.renderItem = this.renderItem.bind(this)
        this.pageClick = this.pageClick.bind(this)
        this.updateDisplayCount = this.updateDisplayCount.bind(this)
        this.pageMenuChanged = this.pageMenuChanged.bind(this)
    }


    async componentDidMount(): Promise<void> {
        const {initialDisplay} = this.state
        this._isMounted = true
        const hash = this.getHash()

        let popular = (await this.getValue4ValuePodcasts(200)).feeds as Array<any>

        let pages = new Map<string, PageData>(
            [
                [SpecialPages.POPULAR, {groupPages: popular, displayCount: initialDisplay}],
                [SpecialPages.SYMBOL, {groupPages: [], displayCount: initialDisplay}],
                [SpecialPages.NUMERIC, {groupPages: [], displayCount: initialDisplay}],
            ]
        )
        Array.from(ALPHABET).forEach((value: string) => {
            pages.set(value, {groupPages: [], displayCount: initialDisplay})
        })
        pages.set(SpecialPages.OTHER, {groupPages: [], displayCount: initialDisplay})
        pages.set(SpecialPages.ALL, {groupPages: [], displayCount: initialDisplay})

        if (this._isMounted) {
            this.setState(
                {
                    loadingPopular: false,
                    pages: pages,
                    total: popular.length,
                },
                () => {
                    this.updateSelectedPage(hash)
                }
            )
        }

        const allPages = []

        let grandTotal = 0
        let startAt = 1
        while (true) {
            let v4vData = (await this.getValue4ValuePodcastsPaginated(startAt, 1000))
            const {status, feeds, total, nextStartAt} = v4vData
            startAt = nextStartAt

            if (status !== "true" || startAt === undefined || !this._isMounted) {
                break
            }
            grandTotal = total // total reports the total for all feeds

            feeds.forEach((value) => {
                allPages.push(value)
                const title = value.title
                let startChar = SpecialPages.OTHER
                if (title) {
                    startChar = title[0].toUpperCase()
                    // handle
                    if (!pages.has(startChar)) {
                        if (SYMBOLS.includes(startChar)) {
                            startChar = SpecialPages.SYMBOL
                        } else if (NUMBERS.includes(startChar)) {
                            startChar = SpecialPages.NUMERIC
                        } else {
                            startChar = SpecialPages.OTHER
                        }
                    }
                }
                pages.get(startChar).groupPages.push(value)
            })
        }

        pages.set(SpecialPages.ALL, {groupPages: allPages, displayCount: initialDisplay})

        if (this._isMounted) {
            this.setState(
                {
                    loadingAll: false,
                    total: grandTotal,
                },
                () => {
                    this.updateSelectedPage(hash)
                }
            )
        }
    }

    getHash(): string {
        let hash = this.props.location.hash as string
        if (hash) {
            if (hash.length > 1) {
                hash = hash.slice(1, hash.length)
            } else {
                hash = SpecialPages.POPULAR
            }
        } else {
            hash = SpecialPages.POPULAR
        }
        return hash
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        this.updateSelectedPage(this.getHash())
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    getPageId(page: string): string {
        if (page === null) {
            return ""
        }
        let pageId = page.toLowerCase()
        if (page === SpecialPages.OTHER) {
            pageId = "other"
        } else if (page === SpecialPages.NUMERIC) {
            pageId = "num"
        } else if (page === SpecialPages.SYMBOL) {
            pageId = "sym"
        } else if (page === SpecialPages.POPULAR) {
            pageId = ""
        }
        return pageId
    }

    pageClick(e: React.ChangeEvent<HTMLElement>) {
        const page = e.target.getAttribute('data-value')
        this.updateSelectedPage(page)
    }

    pageMenuChanged(e: React.ChangeEvent<HTMLSelectElement>) {
        const page = e.target.value
        this.props.history.push(`#${page.toLowerCase()}`)
    }

    updateSelectedPage(page: string = null) {
        let {pages, initialDisplay} = this.state
        let selectedPage = null
        if (page) {
            page = page.toUpperCase()
            // handle
            if (pages.has(page)) {
                selectedPage = page
            } else {
                if (SYMBOLS.includes(page)) {
                    selectedPage = SpecialPages.SYMBOL
                } else if (page === "NUM") {
                    selectedPage = SpecialPages.NUMERIC
                } else if (page === "SYM") {
                    selectedPage = SpecialPages.SYMBOL
                } else if (page === "OTHER") {
                    selectedPage = SpecialPages.OTHER
                } else if (page === "ALL") {
                    selectedPage = SpecialPages.ALL
                } else {
                    selectedPage = SpecialPages.POPULAR
                }
            }
        }

        const pageData = pages.get(selectedPage)
        if (pageData !== undefined) {
            let {groupPages, displayCount} = pageData

            if (groupPages) {
                if (0 < groupPages.length && groupPages.length < initialDisplay)
                    displayCount = groupPages.length
            }

            pages.set(selectedPage, {groupPages: groupPages, displayCount: displayCount})
        }
        this.setState({
            selectedPage: selectedPage,
            pages: pages,
        })
    }

    async getValue4ValuePodcasts(max: number) {
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/podcasts/bytag?podcast-value&max=${max}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    async getValue4ValuePodcastsPaginated(startAt: number, max: number) {
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/podcasts/bytag?podcast-value&max=${max}&start_at=${startAt}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    updateDisplayCount(count: number) {
        let {selectedPage, pages} = this.state

        if (selectedPage === null) {
            selectedPage = SpecialPages.POPULAR
        }

        const pageData = pages.get(selectedPage)

        if (pageData === null) {
            return
        }

        let {groupPages} = pageData
        pages.set(selectedPage, {groupPages: groupPages, displayCount: count})
    }

    renderItem(item, index: number, selected: boolean) {
        let {selectedPage, pages} = this.state
        const key = `v4v-podcast-${selectedPage}-${index}`

        if (selectedPage === null) {
            selectedPage = SpecialPages.POPULAR
        }

        const pageData = pages.get(selectedPage)
        let {groupPages} = pageData
        let {title, author, description, categories, id} = groupPages[index]
        const image = getImage(groupPages[index])

        return (
            <div key={key}>
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

    renderPageLinks() {
        let {selectedPage, pages} = this.state
        if (selectedPage === null) {
            selectedPage = SpecialPages.POPULAR
        }

        let pageData = pages.get(selectedPage)

        if (pageData === undefined) {
            return (
                <div className="pages"/>
            )
        }

        return (
            <div className="pages">
                <div className="page-buttons">
                    {
                        Array.from(pages.keys()).map((value, index) => {
                            return this.renderPageLink(value, index)
                        })
                    }
                </div>
                <div className="page-menu-row">
                    {`Select Page: `}
                    <select
                        className="pages-menu"
                        value={this.getPageId(selectedPage)}
                        onChange={this.pageMenuChanged}
                    >
                        {
                            Array.from(pages.keys()).map((value, index) => {
                                return this.renderPageLink(value, index, true)
                            })
                        }
                    </select>
                </div>
            </div>
        )
    }

    renderPageLink(page: string, index: number, asOption: boolean = false) {
        const {selectedPage, pages} = this.state
        const selected = page === selectedPage
        const selectedClass = selected ? "selected" : ""

        const pageData = pages.get(page)

        if (pageData === undefined) {
            return (
                <div className="page"/>
            )
        }
        const {groupPages} = pageData

        const disabled = groupPages !== undefined && groupPages.length === 0
        const disabledClass = disabled ? "disabled" : ""

        const pageId = this.getPageId(page)

        let link = false
        let href = disabled ? "" : `#${pageId}`
        if (page === SpecialPages.POPULAR) {
            link = true
            href = this.props.location.pathname
        }

        if (asOption) {
            return (
                <option
                    key={`page${index}`}
                    disabled={disabled}
                    value={pageId}
                >{page}</option>
            )
        } else {
            return (
                <Button
                    className={`page ${selectedClass} ${disabledClass}`}
                    onClick={this.pageClick}
                    disabled={disabled}
                    small={true}
                    key={`page${index}`}
                    dataValue={pageId}
                    href={href}
                    link={link}
                    selected={selected}
                >
                    {page}
                </Button>
            )
        }
    }

    renderResults() {
        let {selectedPage} = this.state
        const {pages, loadingPopular, loadingAll, total} = this.state

        if (selectedPage === null) {
            selectedPage = SpecialPages.POPULAR
        }

        if (selectedPage === SpecialPages.POPULAR && loadingPopular) {
            return (
                <div className="loader-wrapper" style={{height: 300}}>
                    <ReactLoading type="cylon" color="#e90000"/>
                </div>
            )
        } else if (selectedPage !== SpecialPages.POPULAR && loadingAll) {
            return (
                <div className="loader-wrapper" style={{height: 300}}>
                    <ReactLoading type="cylon" color="#e90000"/>
                </div>
            )
        }

        const pageData = pages.get(selectedPage)

        if (pageData === null) {
            return (<div/>)
        }

        let {groupPages, displayCount} = pageData

        if (selectedPage !== SpecialPages.POPULAR) {
            groupPages = groupPages.sort((a: any, b: any) => a.title.localeCompare(b.title))
        }
        return (
            <div className="v4v-results">
                {
                    groupPages.length === 0
                        ?
                        <p>No podcasts for group {selectedPage}</p>
                        :
                        <InfiniteList
                            data={groupPages}
                            itemRenderer={this.renderItem}
                            initialDisplay={displayCount}
                            itemsShown={this.updateDisplayCount}
                        />
                }
            </div>
        )
    }

    render() {
        const {loadingPopular, loadingAll, total} = this.state
        if (total === 0 && !loadingPopular && !loadingAll) {
            const noResults = 'No Value 4 Value podcasts found'
            updateTitle(noResults)
            return <div className="v4v">{noResults}</div>
        }

        let totalString = total.toLocaleString()
        if (!loadingPopular && loadingAll){
            totalString = `${total.toLocaleString()}+`
        }

        if (loadingPopular || loadingAll){
            totalString = `${totalString} (loading)`
        }

        updateTitle(`Value 4 Value Podcasts`)
        return (
            <div className="v4v">
                <h2>Value 4 Value Podcasts</h2>
                <p>These podcasts are set up to receive Bitcoin payments in real-time over the Lightning network using
                    compatible <b><Link to="/apps">Podcasting 2.0 apps</Link></b>.</p>

                <p>There are <b>{totalString}</b> Value 4 Value podcasts! Add yours by including the value block in your feed
                    using <b><a href="https://podcasterwallet.com/">podcasterwallet.com</a></b></p>

                <br/>

                <p>Podcasts are grouped by the first character of the title and then displayed in sort order for that
                    page.</p>
                <p>The "Popular" page shows all podcasts in the "popularity" order returned from the API.</p>
                <p>The "All" page shows all podcasts in sort order.</p>

                <p><a href="https://stats.podcastindex.org/v4v">Value4Value Podcasting Ecosystem</a> stats</p>
                <br/>

                {this.renderPageLinks()}
                {this.renderResults()}
            </div>
        )
    }
}

import * as React from 'react'
import InfiniteScroll from "react-infinite-scroll-component";
import ReactLoading from "react-loading";
import Button from "../Button";

import './styles.scss'

export interface MakeVisibleItem {
    field: string
    value: number
}

interface IProps {
    data: Array<any>,
    itemRenderer: (value: any, index: number) => {},
    className?: string,
    showButton?: boolean,
    initialDisplay?: number
    step?: number,
    itemsShown?: (value: number) => void
    makeVisible?: MakeVisibleItem
}

export default class InfiniteList extends React.PureComponent<IProps> {
    static defaultProps = {
        data: [],
        itemRenderer: null,
        className: '',
        showButton: true,
        initialDisplay: 10,
        step: 10,
        itemsShown: null,
        makeVisible: null,
    }
    state = {
        displayCount: 0,
        scrolled: false,
        validItem: false,
    }
    _isMounted = false

    constructor(props) {
        super(props)

        this.showAll = this.showAll.bind(this)
        this.showMoreData = this.showMoreData.bind(this)
        this.showLoader = this.showLoader.bind(this)
    }

    componentDidMount(): void {
        this._isMounted = true
        this.load()
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        const {makeVisible} = this.props
        const prevMakeVisible = prevProps.makeVisible

        if (
            this.props !== prevProps
        ) {
            this.load()
        }

        if (
            !this.state.scrolled ||
            makeVisible?.field !== prevMakeVisible?.field ||
            makeVisible?.value !== prevMakeVisible?.value
        ) {
            this.makeItemVisible()
        }
    }

    componentWillUnmount(): void {
        this._isMounted = false
    }

    makeItemVisible() {
        const {makeVisible} = this.props
        if (makeVisible) {
            const item = document.getElementById(makeVisible.value.toString())
            if (item) {
                item.scrollIntoView()
                this.setState({
                    scrolled: true
                })
            }
        }
    }

    load() {
        if (this._isMounted) {
            let {data, initialDisplay, step, makeVisible} = this.props

            // If item should be shown, make sure it is loaded initially
            if (makeVisible) {
                let visibleIndex = data.findIndex((item) => {
                    return item[makeVisible.field] === makeVisible.value
                })
                if (visibleIndex >= 0) {
                    initialDisplay = visibleIndex + 1 // add 1 since value is index and want total number of items
                    initialDisplay += (step - initialDisplay % step) // make equal to step increment
                    initialDisplay = initialDisplay > data.length ? data.length : initialDisplay
                    this.setState({
                        validItem: true
                    })
                }
            }

            const displayCount = (data.length >= initialDisplay) ? initialDisplay : data.length
            this.updateDisplayCount(displayCount)
        }
    }

    showAll() {
        this.showMoreData(true)
    }

    showMoreData(all: boolean = false) {
        let {data, step} = this.props
        let {displayCount} = this.state

        if (all || displayCount >= data.length) {
            displayCount = data.length
        } else {
            if (data.length <= displayCount) {
                return
            } else if (data.length - displayCount < step)
                step = data.length - displayCount

            displayCount = displayCount + step
        }

        this.updateDisplayCount(displayCount)
    }

    updateDisplayCount(count: number) {
        const {itemsShown} = this.props

        this.setState(
            {
                displayCount: count
            },
            () => {
                if (itemsShown) {
                    itemsShown(count)
                }
            }
        )
    }

    showLoader() {
        let {data} = this.props
        const {displayCount} = this.state
        if (displayCount <= data.length) {
            return (<div/>)
        }
        return (
            <ReactLoading type="cylon" color="#e90000" className="loader"/>
        )
    }

    renderHeader() {
        const {data, showButton, makeVisible} = this.props
        const {displayCount, validItem} = this.state

        const disabled = data.length == displayCount
        let itemUnknown = false
        if (makeVisible?.value >= 0) {
            itemUnknown = !validItem
        }

        if (showButton) {
            return (
                <div className="infinite-list-header">
                    <div className="infinite-list-count-info">
                        <Button onClick={this.showAll} disabled={disabled} small={true}>Show All</Button>
                        <p className="count">{displayCount} / {data.length}</p>
                    </div>
                    {
                        itemUnknown ?
                            <div className="infinite-list-item-unknown">
                                <p>Unknown item {makeVisible.value}</p>
                            </div>
                            :
                            <div/>
                    }
                </div>
            )
        } else {
            return (<div/>)
        }
    }

    render() {
        const {data, className, itemRenderer} = this.props
        let {displayCount} = this.state
        return (
            <div className={`${className} infinite-list`}>
                {this.renderHeader()}
                <InfiniteScroll
                    dataLength={displayCount}
                    next={this.showMoreData}
                    hasMore={displayCount < data.length}
                    loader={this.showLoader()}
                >
                    {
                        data.slice(0, displayCount).map(
                            (i: any, index) => {
                                return itemRenderer(i, index)
                            }
                        )
                    }
                </InfiniteScroll>
            </div>
        )
    }
}

import * as React from 'react'
import InfiniteScroll from "react-infinite-scroll-component";
import ReactLoading from "react-loading";
import Button from "../Button";

import './styles.scss'

interface IProps {
    data: Array<any>,
    itemRenderer: (value: any, index: number) => {},
    className?: string,
    showButton?: boolean,
    initialDisplay?: number
    step?: number,
    itemsShown?: (value: number) => void
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
    }
    state = {
        displayCount: 0,
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
        if (this.props.data !== prevProps.data) {
            this.load()
        }
    }

    componentWillUnmount(): void {
        this._isMounted = false
    }

    load() {
        if (this._isMounted) {
            let {data, initialDisplay} = this.props
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
        const {data, showButton} = this.props
        const {displayCount} = this.state

        const disabled = data.length == displayCount

        if (showButton) {
            return (
                <div className="infinite-list-header">
                    <Button onClick={this.showAll} disabled={disabled} small={true}>Show All</Button>
                    <p className="count">{displayCount} / {data.length}</p>
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

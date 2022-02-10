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
}

export default class InfiniteList extends React.PureComponent<IProps> {
    static defaultProps = {
        data: [],
        itemRenderer: null,
        className: '',
        showButton: true,
        initialDisplay: 10,
        step: 10,
    }
    state = {
        displayCount: 0,
    }

    constructor(props) {
        super(props)

        this.showAll = this.showAll.bind(this)
        this.showMoreData = this.showMoreData.bind(this)
        this.showLoader = this.showLoader.bind(this)
    }

    componentDidMount(): void {
        let {data, initialDisplay} = this.props
        const displayCount = (data.length >= initialDisplay) ? initialDisplay : data.length
        this.setState({
            displayCount: displayCount,
        })
    }

    showAll() {
        console.log("show all")
        this.showMoreData(true)
    }

    showMoreData(all: boolean = false) {
        let {data, step} = this.props
        let {displayCount} = this.state

        console.log("show", displayCount, data.length, step)

        if (all || displayCount >= data.length) {
            displayCount = data.length
        } else {
            if (data.length <= displayCount) {
                return
            } else if (data.length - displayCount < step)
                step = data.length - displayCount

            displayCount = displayCount + step
        }

        this.setState({
            displayCount: displayCount
        })
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
        console.log("show button", showButton, disabled)

        if (showButton) {
            return (
                <div className="infinite-list-header">
                    <Button onClick={this.showAll} disabled={disabled}>Show All</Button>
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
                    hasMore={true}
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

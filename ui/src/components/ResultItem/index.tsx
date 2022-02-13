import * as React from 'react'

import {Link} from "react-router-dom";
import {truncateString} from '../../utils'
import NoImage from '../../../images/no-cover-art.png'

import './styles.scss'

interface IProps {
    title?: string
    description?: string
    author?: string
    categories?: any
    image?: any
    id?: string
}

export default class ResultItem extends React.PureComponent<IProps> {
    static defaultProps = {}

    constructor(props: IProps) {
        super(props)
    }

    renderCategories(categories) {
        let categoryArray = []
        // categories = {
        //     '': '',
        //     '9': 'Business',
        // }
        for (let prop in categories) {
            let category = categories[prop]
            if (category !== '') {
                categoryArray.push(category)
            }
        }
        if (categoryArray.length === 0) {
            return (
                <div className="result-category no-category">No Categories</div>
            )
        }
        // Only render a max of 5 categories
        return categoryArray.slice(0, 5).map((cat, i) => (
            <div key={`cat-${i}`} className="result-category">
                {cat}
            </div>
        ))
    }

    render() {
        const {title, description, author, categories, image, id} = this.props
        // const { open } = this.state
        return (
            <div className="result">
                <div className="result-row">
                    <div className="result-cover-art">
                        <Link to={`/podcast/${id}`}>
                            <img
                                draggable={false}
                                src={image}
                                onError={(ev: any) => {
                                    ev.target.src = NoImage
                                }}
                                loading="lazy"
                            />
                        </Link>
                    </div>
                    <div className="result-info">
                        <div className="result-title"><Link to={`/podcast/${id}`}>{title}</Link></div>
                        <p>by {author}</p>
                        <div className="result-categories">
                            {this.renderCategories(categories)}
                        </div>
                    </div>
                </div>
                <p className="result-description">
                    {truncateString(description)}
                </p>
            </div>
        )
    }
}

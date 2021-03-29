import * as React from 'react'

import NoImage from '../../../images/no-cover-art.png'
import { truncateString, titleizeString } from '../../utils'
import RSSLogo from "../../../images/feed.svg";
import EarthLogo from "../../../images/earth.svg";
import './styles.scss'

interface IProps {
    title?: string
    description?: string
    author?: string
    categories?: any
    image?: any
    id?: string
    feedURL?: string
    podcastURL?: string
    value?: {
      model: {
        type: string
        method: string
        suggested: string
      }
      destinations?: Array<{
        name: string
        type: string
        address: string
        split: string
      }>
    }
}

export default class PodcastHeader extends React.PureComponent<IProps> {

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
                <div className="podcast-header-category no-category">No Categories</div>
            )
        }
        // Only render a max of 5 categories
        return categoryArray.slice(0, 5).map((cat, i) => (
            <div key={`cat-${i}`} className="podcast-header-category">
                {cat}
            </div>
        ))
    }

    render() {
        const {title, description, author, categories, image, feedURL, podcastURL, value} = this.props
        const splitTotal = value && value.destinations ? value && value.destinations.reduce((total, d) => total + parseInt(d.split, 10), 0): null
        return (
            <div className="podcast-header">
                <h1 className="podcast-header-title">{title}</h1>
                <div className="podcast-header-row">
                    <div className="podcast-header-cover-art">
                        <img
                            draggable={false}
                            src={image}
                            onError={(ev: any) => {
                                ev.target.src = NoImage
                            }}
                        />
                    </div>
                    <div className="podcast-header-info">
                        <address>By: {author}</address>
                        <div className="podcast-header-categories">
                            {this.renderCategories(categories)}
                        </div>
                        <p className="podcast-header-description">
                            {truncateString(description)}
                        </p>
                        <div className="podcast-header-external-links">
                            {podcastURL ?
                                <a
                                    href={podcastURL}
                                    title="Podcast Website"
                                    target="_blank"
                                >
                                    <img
                                        src={EarthLogo}/>
                                </a>
                                : ""
                            }
                            {feedURL ?
                                <a
                                    href={feedURL}
                                    title="RSS Feed"
                                    target="_blank"
                                >
                                    <img src={RSSLogo}/>
                                </a>
                                : ""
                            }
                        </div>
                        {value && value.destinations &&
                          <div className="podcast-value">
                            <h4>Value for Value via {titleizeString(value.model.type)}</h4>
                            <ul>
                              {value.destinations.map(dest => (
                                <li>
                                  <progress value={dest.split} max={splitTotal}></progress> {dest.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}
